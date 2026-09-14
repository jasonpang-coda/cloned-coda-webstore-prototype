import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from './useTheme.js'
import { useOrientation } from './useOrientation.js'
import { useAuth } from './useAuth.js'
import { useLocale } from './useLocale.js'
import { useTaskGiftClaim } from './useTaskGiftClaim.js'
import { useNavDrawer } from './useNavDrawer.js'
import { useCheckout } from './useCheckout.js'
import { useSkuRegistry } from './useSkuRegistry.js'

/**
 * useUrlState — single owner of URL <-> app-state sync for every dimension an
 * external scraper (an FE engineer's AI agent picking up a feature for
 * handoff, pointed at the deployed URL instead of the repo) needs to reach by
 * a plain GET: device, orientation, store (theme), named overlay, and — via
 * `?sku=<itemKey>` — the checkout/payment sheet for a specific SKU. Making a
 * state one query param away turns a scrape into a reliable handoff input
 * instead of "whatever the app happened to boot into."
 *
 * Was three separate ad-hoc readers/writers (App.vue's device/orientation
 * watcher, useTheme's read-only ?theme=, no overlay support at all) — folded
 * into one composable so there's exactly one place that reads
 * window.location on boot and exactly one router.replace() writer, instead of
 * three watchers racing to patch the same query object.
 *
 * NOT covered: overlays that require data the URL can't carry on their own —
 * gift claim, item summary, task gift — see OVERLAY_NAMES below for the
 * closed set of no-argument overlays this can address, and why. Checkout is
 * the one exception: `?sku=<itemKey>` supplies the missing argument by
 * resolving the key against useSkuRegistry.js (every SKU card family
 * registers its itemKey → item mapping there at setup).
 */

const DEVICE_QUERY_TO_INTERNAL = { ios: 'iphone', android: 'samsung', responsive: 'none' }
const DEVICE_INTERNAL_TO_QUERY = { iphone: 'ios', samsung: 'android', none: 'responsive' }

// The closed set of overlays reachable by `?overlay=<name>` alone — every one
// here opens with no required argument. checkout/giftClaim/itemSummary are
// deliberately excluded: they need a selected SKU/gift/bundle the URL has no
// slot for, so `?overlay=checkout` would just be a no-op sheet with nothing
// inside it. `pwaInstall` below opens TaskGiftSheet (no argument needed —
// its optional upsellItem defaults to null), kept under its original query
// name since IosInstallSheet (which it used to open) is retired. Keep this
// list in sync with useCloseAllOverlays.js's enumeration (and App.vue's
// comment-mode SURFACES list) whenever a new no-argument overlay is added.
export const OVERLAY_NAMES = ['signIn', 'account', 'region', 'language', 'pwaInstall', 'navDrawer']

function buildOverlayRegistry () {
  const auth = useAuth()
  const locale = useLocale()
  const taskGift = useTaskGiftClaim()
  const { menuOpen } = useNavDrawer()
  return {
    signIn: { isOpen: auth.signInSheetOpen, open: auth.openSignInSheet, close: auth.closeSignInSheet },
    account: { isOpen: auth.accountMenuOpen, open: auth.openAccountMenu, close: auth.closeAccountMenu },
    region: { isOpen: locale.regionSelectorOpen, open: locale.openRegionSelector, close: locale.closeRegionSelector },
    language: { isOpen: locale.languageSelectorOpen, open: locale.openLanguageSelector, close: locale.closeLanguageSelector },
    // Kept as the query value `pwaInstall` for URL back-compat, though it now
    // opens TaskGiftSheet — THE merged install/notify sheet (see its own
    // doc); the standalone IosInstallSheet this used to open is retired.
    pwaInstall: { isOpen: taskGift.sheetOpen, open: taskGift.openSheet, close: taskGift.closeSheet },
    navDrawer: { isOpen: menuOpen, open: () => { menuOpen.value = true }, close: () => { menuOpen.value = false } },
  }
}

/**
 * @param {object} deps
 * @param {import('vue').Ref<string>} deps.device - useDeviceFrame's shared device ref
 * @param {import('vue').Ref<boolean>} deps.isMobile - useDeviceDetect's real-touch-device flag
 * @param {string|null} deps.figmaCaptureStep - forces device; query loses to it, same as before
 */
export function useUrlState ({ device, isMobile, figmaCaptureStep }) {
  const route = useRoute()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { orientation } = useOrientation()
  const overlays = buildOverlayRegistry()
  const { openCheckout, selectedKey, sheetOpen, buyNowVisible, guestVerified } = useCheckout()
  const skuRegistry = useSkuRegistry()
  const auth = useAuth()

  const initialParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null

  // ── Read on boot ──────────────────────────────────────────────────────────
  // Straight off window.location, not route.query — vue-router hasn't
  // finished resolving the initial navigation yet at this point in setup().
  const queryDevice = DEVICE_QUERY_TO_INTERNAL[initialParams?.get('device')]
  if (queryDevice && !figmaCaptureStep && !isMobile.value) device.value = queryDevice
  if (initialParams?.get('orientation') === 'landscape' && device.value !== 'none') orientation.value = 'landscape'

  // useTheme's resolveInitialTheme() already applied ?theme= before this
  // module even runs (it resolves at import time) — nothing to do here.

  // ?capture=1 (LibraryViewer.vue's capture mode, plans/tickets/in-progress/visual-capture-rig.md)
  // is a one-shot boot flag this composable doesn't otherwise track — read it
  // here (off window.location, not route.query, same reliability reason as
  // every other read in this section) and re-inject it below on every write,
  // or the watcher's `{ ...route.query, ... }` rebuild silently drops it the
  // same way it used to drop the hash (see that fix's comment below).
  const initialCapture = initialParams?.get('capture')

  // Deferred to a microtask so the overlay opens after the rest of setup()
  // has finished establishing signed-in/store state it might read.
  const queryOverlay = initialParams?.get('overlay')
  if (queryOverlay && overlays[queryOverlay]) {
    Promise.resolve().then(() => overlays[queryOverlay].open())
  }

  // ?sku=<itemKey> — checkout deep-link. Every SKU card family registers its
  // itemKey → item mapping into useSkuRegistry.js at setup, but useUrlState
  // itself runs during App.vue's OWN setup(), before any card has mounted —
  // so this also has to wait a microtask, same as the overlay open above,
  // for the registry to actually contain something.
  //
  // A deep-link opener has no sign-in flow to tap through, so it defaults to
  // the demo user (codayw — the same default useAuth.js already falls back
  // to) instead of leaving openCheckout() to no-op on the sign-in gate.
  //
  // pendingSku tracks whether this microtask has settled yet, and is one of
  // the watcher's sources below — the FIRST (immediate) run of that watcher
  // happens synchronously, before this microtask has a chance to run, so
  // without pendingSku it would read sheetOpen/buyNowVisible as still false
  // and strip `sku` off the URL before resolution ever gets a chance to
  // succeed.
  const querySku = initialParams?.get('sku')
  const pendingSku = ref(!!querySku)
  if (querySku) {
    Promise.resolve().then(() => {
      const item = skuRegistry.resolve(querySku)
      if (item) {
        if (!auth.signedIn.value && !guestVerified.value) {
          auth.playerName.value = 'codayw'
          auth.signedIn.value = true
        }
        openCheckout(item, querySku)
      }
      pendingSku.value = false
    })
  }

  // ── Write going forward ──────────────────────────────────────────────────
  // Mirrors the route→page-state watcher in App.vue, just the reverse
  // direction (state→URL instead of URL→state), for every dimension that
  // isn't already a real route.
  //
  // A SINGLE watcher covering every dimension, not one per dimension. Two
  // independent watchers each doing `router.replace({ ...route.query, ... })`
  // race: router.replace() resolves asynchronously, so if both watchers'
  // callbacks run in the same tick (exactly what happens on boot, when the
  // overlay-open microtask and the device/theme immediate watch both fire
  // before either replace() has resolved), the second one reads route.query
  // before the first's navigation has landed and overwrites it — losing
  // whichever dimension the first watcher just wrote. Building one merged
  // query object from the tracked sources together, in one replace() call,
  // makes that race impossible.
  watch([
    device, orientation, theme,
    () => OVERLAY_NAMES.find(name => overlays[name].isOpen.value) ?? null,
    // The payment sheet is "open" for URL purposes whenever it's actually
    // visible in EITHER presentation (sheet mode's sheetOpen, or the FCM
    // Buy Now bar's buyNowVisible) — see useCheckout.js's openCheckout doc.
    // While the sku resolution microtask above is still pending, keep the
    // original querySku in the query instead of reading sheetOpen/
    // buyNowVisible (both still false at that point) as "no sku" — see the
    // pendingSku comment above for why.
    () => {
      if (sheetOpen.value || buyNowVisible.value) return selectedKey.value
      return pendingSku.value ? querySku : null
    },
  ], ([d, o, t, overlayName, skuKey]) => {
    const query = { ...route.query, device: DEVICE_INTERNAL_TO_QUERY[d], theme: t }
    if (d === 'none') delete query.orientation
    else query.orientation = o
    if (overlayName) query.overlay = overlayName
    else delete query.overlay
    if (skuKey) query.sku = skuKey
    else delete query.sku
    if (initialCapture) query.capture = initialCapture
    // Explicit `hash` is required here: vue-router does NOT auto-preserve the
    // URL fragment on an object-form replace() that omits it (it has no
    // `path`/`name` either, so it resolves against the current route, but
    // `hash` defaults to empty rather than inheriting). Without this, this
    // watcher's very first (immediate) fire silently wiped any `#library=…`
    // or `#inspect=…` fragment present on initial load — read straight off
    // window.location rather than route.hash, since the library/inspector
    // hash writers use raw history.replaceState() calls that don't fire
    // 'popstate', so vue-router's own reactive route.hash can be stale.
    router.replace({ query, hash: window.location.hash })
  }, { immediate: true })

  return { overlays, setTheme }
}
