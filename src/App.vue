<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, watchEffect, nextTick, defineAsyncComponent, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { GRID_BARE_KEY } from './composables/gridBare.js'
import CompactHero from './components/CompactHero.vue'
import TrustBar from './components/TrustBar.vue'
import StepGamerId from './components/checkout/StepGamerId.vue'
import StepPayment from './components/checkout/StepPayment.vue'
import StepZipCode from './components/checkout/StepZipCode.vue'
import StepDetails from './components/checkout/StepDetails.vue'
import InlineCheckoutCta from './components/checkout/InlineCheckoutCta.vue'
import HomeFaq from './components/home/HomeFaq.vue'
import { useAuth } from './composables/useAuth.js'
import { useStoreCatalog, useFeaturedItems, useStoreSkus, useStoreIntents, useStoreMilestone } from './composables/useStoreCatalog.js'
import { useFeatureFlags } from './composables/useFeatureFlags.js'
import { usePwaInstall } from './composables/usePwaInstall.js'
import { useWebPush } from './composables/useWebPush.js'
import { useDeviceFrame } from './composables/useDeviceFrame.js'
import { useUrlState } from './composables/useUrlState.js'
import CatalogNavStack from './components/CatalogNavStack.vue'
import DeviceToolbar from './components/DeviceToolbar.vue'
import DeviceFrame from './components/DeviceFrame.vue'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import Grid from './components/Grid.vue'
import Span from './components/Span.vue'
import CategoryBanner from './components/CategoryBanner.vue'
import DownloadBanner from './components/DownloadBanner.vue'
import StoreBadges from './components/StoreBadges.vue'
import ToggleSwitch from './components/ToggleSwitch.vue'
import SkuList from './components/SkuList.vue'
import SkuImageList from './components/SkuImageList.vue'
import BundleSkuCard from './components/BundleSkuCard.vue'
import SkuImageCard from './components/SkuImageCard.vue'
import BundleGrid from './components/BundleGrid.vue'
import GiftSkuCard from './components/GiftSkuCard.vue'
import GiftGrid from './components/GiftGrid.vue'
import CategoryNav from './components/CategoryNav.vue'
import BestSellerCard from './components/BestSellerCard.vue'
import ProdHighlightedSkuCard from './components/ProdHighlightedSkuCard.vue'
import BestSellerCarousel from './components/BestSellerCarousel.vue'
import StoryCarousel from './components/StoryCarousel.vue'
import PlayerAccount from './components/PlayerAccount.vue'
import PageSignInSection from './components/PageSignInSection.vue'
import NavDrawer from './components/NavDrawer.vue'
import CategoryCatalog from './components/CategoryCatalog.vue'
import CategoryJumpNav from './components/CategoryJumpNav.vue'
import FeaturedCarousel from './components/FeaturedCarousel.vue'
import SignInLoader from './components/SignInLoader.vue'
import Snackbar from './components/Snackbar.vue'
import BuyNowBar from './components/BuyNowBar.vue'
import { triggerHaptic } from './composables/useHaptics.js'
import PurchaseSheet from './components/PurchaseSheet.vue'
import RegionSelectorSheet from './components/RegionSelectorSheet.vue'
import LanguageSelectorSheet from './components/LanguageSelectorSheet.vue'
import ClaimGiftSheet from './components/ClaimGiftSheet.vue'
import TaskGiftSheet from './components/TaskGiftSheet.vue'
import SignInSheet from './components/SignInSheet.vue'
import AccountPopover from './components/AccountPopover.vue'
import EaSignInPage from './components/EaSignInPage.vue'
import KonamiSignInPage from './components/KonamiSignInPage.vue'
import CommandConsole from './components/CommandConsole.vue'
import { InspectorLayer } from '@coda/inspect-kit/vue'
import { CommentLayer } from '@coda/comment-kit/vue'
import Media from './components/Media.vue'
import ResellerBanner from './components/ResellerBanner.vue'
import TransactionHistoryPage from './components/TransactionHistoryPage.vue'
import OrderCompletePage from './components/OrderCompletePage.vue'
import HomeView from './components/home/HomeView.vue'
import MilestoneRewards from './components/MilestoneRewards.vue'
import MaterialIcon from './components/MaterialIcon.vue'

import { useStoreAssets } from './composables/useStoreAssets.js'
import { useStoreConfig } from './composables/useStoreConfig.js'
import { useStoreStrings } from './composables/useStoreStrings.js'
import { useLocale } from './composables/useLocale.js'
import { useFavicon } from './composables/useFavicon.js'
import { useGiftClaim } from './composables/useGiftClaim.js'
import { useTaskGiftClaim } from './composables/useTaskGiftClaim.js'
import { useTheme, THEMES } from './composables/useTheme.js'
import { useDeviceDetect } from './composables/useDeviceDetect.js'
import { useCommandConsole } from './composables/useCommandConsole.js'
import { useTransactionHistory } from './composables/useTransactionHistory.js'
import { useOrderComplete } from './composables/useOrderComplete.js'
import { useCodashopHome } from './composables/useCodashopHome.js'
import { useNavDrawer } from './composables/useNavDrawer.js'
import { useLibrary } from './library/useLibrary.js'
import { useHandoff } from './handoff/useHandoff.js'
import { useTokenAudit } from './token-audit/useTokenAudit.js'
import { useComments } from '@coda/comment-kit/vue'
import { useCheckout } from './composables/useCheckout.js'
import { useItemSummary } from './composables/useItemSummary.js'
import { TourGuideLayer, TourGuideModal, useTourGuide } from '@coda/tourguide-kit/vue'
import '@coda/tourguide-kit/vue/style.css'
import { TOURS } from './tourguide/registry.js'

useTourGuide().registerFlows(TOURS)

const storeAssets = useStoreAssets()
const config = useStoreConfig()
const strings = useStoreStrings()
// Shared, store-agnostic chrome copy (localised via the language switcher).
const { common } = useLocale()
useFavicon()

const { theme } = useTheme()
const themeLabel = computed(() => THEMES.find(t => t.value === theme.value)?.label ?? theme.value)
watchEffect(() => { document.title = `${themeLabel.value} prototype` })
const { openGiftClaim, isClaimed } = useGiftClaim()
const { openSheet: openTaskGiftSheet } = useTaskGiftClaim()
const catalog       = useStoreCatalog()
const featuredItems = useFeaturedItems()
const storeSkus     = useStoreSkus()
const intents       = useStoreIntents()
const milestone     = useStoreMilestone()

// ── Multi-level navigation pilot (FCM) ──────────────────────────────────────
// Gated on the STATIC per-store capability alone (config.nav.multiLevel) —
// the runtime nav-model flag (fcmNavModel: 'dropdown' | 'flat' | 'flat-bottom-s')
// that used to sit alongside this has been retired; internal testing settled
// on the 'flat' presentation permanently, so CatalogNavStack is now mounted
// with a hardcoded presentation="flat" below instead of a variable navModel.
const { flagValue, isEnabled } = useFeatureFlags()

// PWA install state (download-banner row, gated on strings.page.pwaInstall) —
// see usePwaInstall.js. Every CTA that used to branch on shouldOfferIos here
// (download banner, gifts banner, story slide) now just opens TaskGiftSheet
// (openTaskGiftSheet, above) — its own `variant` handles the iOS/webview/
// Android branching in one place instead of duplicating it per call site.
const { isInstalled: pwaInstalled } = usePwaInstall()

// Web Push upsell — replaces the above once pwaInstalled (see useWebPush.js
// and the `pwaInstalledState` variant flag in useFeatureFlags.js).
const { subscribed: webPushSubscribed, justEnabled: webPushJustEnabled, toggle: toggleWebPush, enable: enableWebPush } = useWebPush()

// SKU card material pilot (config.skuCard.materialExploration, Codashop-only)
// — mirrors useTheme's own <html data-theme> pattern so themes/codashop.css
// can retarget --x-bg-card-default/--x-border-card-default/--x-border-sku-
// card-* for every card-like container on the page (.catalog-card, StepCard,
// PcCard), not just SkuCard.vue's own local material classes. Empty string
// (not a value) when the pilot isn't active, so `[data-sku-material="x"]`
// selectors never match on a store/state that didn't opt in.
watchEffect(() => {
  const material = config.value.skuCard?.materialExploration ? flagValue('skuCardMaterial') : 'glass'
  document.documentElement.dataset.skuMaterial = material === 'glass' ? '' : material
})

const isMultiLevel = computed(() => !!config.value.nav?.multiLevel)

// ── Lightweight L1 tab pilot (COD:M) ────────────────────────────────────────
// Unlike isMultiLevel above (which swaps the whole page over to the
// category-filter/CatalogNavStack rendering model), this just toggles a
// second navbar tab that switches between the store's EXISTING page-mode
// content and MilestoneRewards.vue — no catalog tree required. Gated on a
// store-declared flag NAME (config.nav.milestoneFlag), not a literal store
// check, so any store can opt in the same way COD:M does.
const showMilestoneTab = computed(() => {
  const flagKey = config.value.nav?.milestoneFlag
  return !isMultiLevel.value && !!flagKey && isEnabled(flagKey) && !!milestone.value
})
const activeSection = ref('store')
watch(showMilestoneTab, (shown) => { if (!shown) activeSection.value = 'store' })
watch(theme, () => { activeSection.value = 'store' })

// ── Buy Now pilot (FCM) ──────────────────────────────────────────────────────
// Same two-gate pattern as useCheckout.js's usesBuyNowBar(): the STATIC
// capability (config.checkout.buyNow) AND the runtime flag together. This
// only gates whether the docked BuyNowBar itself shows — PurchaseSheet
// always mounts (every store's checkout/payment step lives there now); with
// the flag off, PurchaseSheet's own usesPaymentView (usePurchaseFlow.js)
// falls back to the same 'checkout'-step content every default store uses.
const showBuyNowBar = computed(() => !!config.value.checkout?.buyNow && isEnabled('fcmPaymentSheet'))

// ── Guided checkout (config.checkout.stepCta) ────────────────────────────────
// Once both real gates clear (a SKU and a payment channel), the guided-checkout
// button (InlineCheckoutCta) hands off to the Buy Now widget — the SAME
// component FCM's Buy Now pilot uses (BuyNowBar), mounted here with
// force-ready so it renders its "ready" branch outside that pilot's own
// auth-gated flow (see BuyNowBar.vue's header comment). This is a prototype
// with no real backend, so "buy now" is a haptic + a success snackbar.
const { checkoutReady } = useCheckout()
function onGuidedCheckoutBuy() {
  triggerHaptic('success')
  showSnackbar({ title: strings.value.details.purchaseCompleteTitle, text: strings.value.details.purchaseCompleteText })
}

// ── Production SKU card designs pilot (FCM) ─────────────────────────────────
// Same two-gate pattern as showBuyNowBar above. The isolated FCM build
// (build:fcm / dev:fcm — __STORE_LOCKED__) has no toggle at all: it ships
// production designs only, so the flag is never read in that build.
const skuCardModel = computed(() =>
  __STORE_LOCKED__ ? 'prod' : (config.value.sku?.prodCardDesigns ? flagValue('fcmSkuCardModel') : 'new')
)
const isProdCards = computed(() => skuCardModel.value === 'prod')

// Active L1 intent — reset to the first intent whenever the intent LIST changes
// (store/theme switch) or the multi-level model turns on/off (flag toggle,
// which doesn't itself change `intents`, so it must be watched too).
const activeIntent = ref(null)
watch([intents, isMultiLevel], ([list, multi]) => {
  activeIntent.value = multi && list?.length ? list[0].id : null
}, { immediate: true })

const activeIntentData = computed(() =>
  intents.value?.find(i => i.id === activeIntent.value) ?? null,
)

// NavBar's intents/activeIntent props are generic — this resolves which
// underlying state (FCM's real intent tree vs COD:M's lightweight Store/
// Milestone Rewards stand-in) they should reflect, and where a tab tap
// should write back to.
const navBarIntents = computed(() => {
  if (isMultiLevel.value) return intents.value ?? []
  if (showMilestoneTab.value) {
    return [
      { id: 'store', label: strings.value.nav?.storeTabLabel ?? 'Store' },
      { id: 'rewards', label: strings.value.nav?.milestoneTabLabel ?? 'Milestone Rewards' },
    ]
  }
  return []
})
const navBarActiveIntent = computed(() =>
  isMultiLevel.value ? activeIntent.value : (showMilestoneTab.value ? activeSection.value : null),
)
function onNavBarIntentChange(id) {
  if (isMultiLevel.value) activeIntent.value = id
  else activeSection.value = id
}

// Inject --page-bg-image CSS var when the store provides a background image asset.
// efootball.css uses html[data-theme="efootball"] .device__screen to apply it.
const bgImageStyle = computed(() => {
  // Don't paint the store's fixed page art behind the library page (the opaque
  // .lib chrome covers it anyway — this is belt-and-braces).
  if (libraryActive.value) return {}
  const bg = storeAssets.value?.brand?.bg
  return bg ? { '--page-bg-image': `url(${bg})` } : {}
})

// SKU section arrangement is a store capability (FCM: 2-col grid; COD:M: stack).
const skuLayout = computed(() => config.value.skuList.layout)
// Explicit SKU-grid column count (e.g. Codashop's 5-up grid). null for every
// other store — SkuList falls back to its default 2→4 responsive behaviour.
const skuColumns = computed(() => config.value.skuList.columns ?? null)

// Page model — 'filter' (FCM category hide/show) vs 'page' (COD:M single-scroll).
// Read from the store-agnostic config flag; never test theme identity here.
const isFilter = computed(() => config.value.catalog.mode === 'filter')

// Two-column split layout (4-of-12 left rail / 8-of-12 right rail at M/L —
// see Span.vue's col-lead/col-main sizes and docs/grid-layout-system.md).
// Every store other than Codashop omits config.page.layout, so isSplit is
// false and the storefront renders exactly as before.
//
// `&& !showHomeView.value` matters specifically for Codashop: config.home
// makes its storefront a homepage (HomeView), but config.page.layout is
// STILL 'split' (that capability belongs to the split-layout MLBB product
// page underneath, a separate view entirely) — without this guard, `provide`
// below leaks bare-grid mode into every <Span> HomeView/HomeStandard/
// HomeVisual render too, since provide/inject doesn't know which v-if
// branch is showing. Bare mode strips a Span's own max-width/centring
// constraint, which is what broke FilterTabs' internal horizontal scroll —
// with no width cap, an implicit grid track grew to fit the tabs' full
// content width instead of clipping them to trigger the scrollbar.
//
// `config.page.layoutRequiresProdCards` (FCM only) — the split layout is a
// pilot for the CURRENT production SKU card designs only; while the
// fcmSkuCardModel flag previews the new (unreleased) card designs, the page
// falls back to a single column (isSplit false) with no parent container —
// same single-column render every other non-split store already gets.
const isSplit = computed(() =>
  config.value.page?.layout === 'split'
  && !showHomeView.value
  && (!config.value.page?.layoutRequiresProdCards || isProdCards.value),
)
// Story carousel in the lead column — only meaningful while the split is
// actually active. Gating on isSplit too (not just heroColumn === 'lead')
// matters because heroColumn is a static per-store config value that doesn't
// know about layoutRequiresProdCards: without this, the new-designs fallback
// (isSplit false) would still render the carousel in the collapsed lead
// column, forced to 1:1, instead of its normal full-width spot below.
const showLeadCarousel = computed(() => isSplit.value && config.value.page?.heroColumn === 'lead')

// Inline page-step checkout (Select Payment / Zip Code / Enter Details as
// stacked cards in the right rail) instead of the overlay PurchaseSheet.
// Every store other than Codashop omits config.checkout.mode.
const isInlineCheckout = computed(() => config.value.checkout.mode === 'inline')

// Story slideshow hero — shown by default (every current store). Codashop
// hides it (config.page.hero: false); its Figma reference has no promotional
// carousel on this page. A dedicated flag rather than the page.sections
// allowlist, since several stores already use that allowlist without
// including a 'hero' id and must keep showing their hero unaffected.
const showHero = computed(() => config.value.page?.hero !== false)

// The current top-level L1 section, unified across both nav pilots so
// downstream gates (below) don't need to know which one is active: FCM's
// real intent id when isMultiLevel is on, COD:M's lightweight store/rewards
// toggle when showMilestoneTab is on, else always 'store' (every other
// store, and either pilot before a tab switch).
const currentSection = computed(() => {
  if (isMultiLevel.value) return activeIntent.value
  if (showMilestoneTab.value) return activeSection.value
  return 'store'
})

// True whenever there's nothing to disambiguate by section — the active
// section IS Store. Store-specific merchandising (story carousel,
// best-seller hero/carousel) is gated on this so switching to Milestone
// Rewards / Events reads as "different content", not "same page, nav
// changed". Sign-in / player-account sections stay visible regardless —
// they're account chrome, not store content.
const isStoreIntentActive = computed(() => currentSection.value === 'store')
const showIntentHero = computed(() => showHero.value && isStoreIntentActive.value)

// Trust bar (src/components/TrustBar.vue) — sits directly under the compact
// hero in the sticky lead rail when present, gated on config.trustBar.
// Every store but Codashop omits this key, so TrustBar never mounts elsewhere.
const showTrustBar = computed(() => !!config.value.trustBar)

// Whether the split shell's lead column actually has anything in it (story
// carousel, Codashop's compact hero, or its trust bar — the only three
// things ever rendered there, see storefront__col--lead below). FCM sets
// config.page.layout: 'split' store-wide, but the lead column only ever
// gets content on the Store intent (showIntentHero); switching to Milestone
// Rewards / Events leaves it empty while the grid still reserved its 4-of-12
// columns, pinning the main column off-centre instead of collapsing to the
// centred single-column layout the new (non-split) card designs already get.
const hasLeadContent = computed(() =>
  (showIntentHero.value && showLeadCarousel.value) || !!config.value.identity || showTrustBar.value,
)
// Only actually lay out the two-column grid when there's lead content to
// justify it — otherwise render as if isSplit were false (single, centred
// column), same fallback every other non-split store already gets.
const isSplitActive = computed(() => isSplit.value && hasLeadContent.value)
// Tells nested Grid/Span instances (including CategoryCatalog's internal
// ones) to collapse to a bare block at M/L instead of laying out a second
// nested 12-col grid inside an already-gridded split column.
provide(GRID_BARE_KEY, isSplitActive)

// Catalog "card" — bounds the New Users Promo banner + CP SKU grid in a single
// bordered/rounded panel (Figma node 2198:6506's "Select Recharge" container)
// instead of the default unboxed sections separated by dividers. Every store
// but Codashop omits config.page.catalogBoxed, so the default (unboxed)
// rendering below is unaffected.
const catalogBoxed = computed(() => config.value.page?.catalogBoxed === true)

// Optional section allowlist: if config.page.sections is set, only listed IDs render.
function showSection(id) {
  const sections = config.value.page?.sections
  return !sections || sections.includes(id)
}

// Active category id for filter mode.
const activeCat       = ref(null)
const catalogAnchorRef = ref(null)

// Category source for activeCatData below — the active L1 intent's categories
// in multi-level mode, else the plain per-store catalogue tree exactly as
// before. Nothing downstream needs to know which case it is: activeCatData,
// subcategoryTabs, etc. all read through this unchanged.
const activeCategories = computed(() =>
  isMultiLevel.value ? (activeIntentData.value?.categories ?? []) : (catalog.value ?? []),
)

// True when L2 filtering's actual unit is the SUBCATEGORY (FCM's flat nav —
// CatalogNavStack's flat row already flattens to one tab per subcategory,
// not per category), rather than the CATEGORY (a category's subcategories
// all shown together). Scoped to isMultiLevel && isFilter — FCM's only
// combination today — so a plain filter-mode store with no flat nav
// (TDR, Rogue Trader, …) keeps showing a category's subcategories together,
// unchanged.
const isSubFiltered = computed(() => isMultiLevel.value && isFilter.value)

// Every subcategory of every category in activeCategories, flattened —
// mirrors CatalogNavStack's own internal allSubcategories (same shape) so
// the end-of-category jump dropdown lists the same units the flat nav does.
const flatSubcategories = computed(() =>
  activeCategories.value.flatMap(c =>
    (c.subcategories ?? []).map(s => ({ id: s.id, label: s.navLabel ?? s.label, categoryId: c.id })),
  ),
)

// Same double-gate CategoryCatalog uses for its own end-of-category dropdown
// (see useFeatureFlags.js) — needed again here because the Gifts tab bypasses
// CategoryCatalog entirely (its own bespoke markup, both branches below), so
// it would otherwise never get the dropdown CategoryCatalog gives every other
// category.
const showCategoryJumpNav = computed(
  () => isEnabled('categoryJumpNav') && !!config.value.nav?.categoryJump,
)

// FCM gifts tab — BundleSkuCard items use @click.capture.stop so checkout is
// suppressed; this opens the gift claim sheet instead.
function onFcmGiftTap(item) {
  if (isClaimed(item.id)) return
  openGiftClaim({
    id:       item.id,
    title:    item.title,
    subtitle: item.subtitle ?? null,
    image:    item.skuImage ?? null,
  })
}

function onCategorySelect(id) {
  activeCat.value = id
  nextTick(() => scrollIntoScreen(catalogAnchorRef.value))
}

// Drawer nav item tapped — FCM: switch category filter; COD:M: scroll to section.
function onDrawerNavigate(anchor) {
  if (!anchor) return
  if (isMultiLevel.value) {
    // Category AND subcategory ids are unique across intents (see
    // fcm/intents.js), so the owning intent can be found by a plain search —
    // no need to thread intent id through the drawer's emit contract (kept
    // identical to CommandConsole's). Every category is already on the page
    // (no filtering), so this scrolls straight to the anchor rather than
    // going through onCategorySelect (which targets catalogAnchorRef, the
    // legacy-mode path). Category anchors are prefixed `cat-{id}`;
    // subcategory anchors are the raw (unprefixed) id, same as CategoryCatalog's
    // own `:id="sub.id"` — so which one this is has to be resolved first.
    let owner = null
    let isCategoryAnchor = false
    for (const i of intents.value ?? []) {
      if (i.categories?.some(c => c.id === anchor)) { owner = i; isCategoryAnchor = true; break }
      if (i.categories?.some(c => c.subcategories?.some(s => s.id === anchor))) { owner = i; isCategoryAnchor = false; break }
    }
    const switchingIntent = owner && owner.id !== activeIntent.value
    if (owner) activeIntent.value = owner.id

    // L2 filtered (isFilter): only the active category is on the page, so a
    // category anchor can't be scrolled to directly — select it instead
    // (mirrors the plain isFilter branch below). A subcategory anchor needs
    // its owning category selected first, then scrolls once that category
    // (and the subcategory's anchor with it) has mounted. Mirrors
    // onFlatNavSelect below — same activeCatData-watcher race (it resets
    // activeSub to the category's first subcategory) must be waited out
    // before overriding activeSub to the one actually tapped.
    if (isFilter.value) {
      const categoryId = isCategoryAnchor
        ? anchor
        : owner?.categories?.find(c => c.subcategories?.some(s => s.id === anchor))?.id ?? null
      const select = () => {
        const switchingCategory = categoryId && categoryId !== activeCat.value
        if (switchingCategory) activeCat.value = categoryId
        if (isCategoryAnchor) {
          nextTick(() => scrollIntoScreen(catalogAnchorRef.value))
        } else if (switchingCategory) {
          nextTick(() => {
            activeSub.value = anchor
            scrollToAnchorWhenMounted(anchor)
          })
        } else {
          activeSub.value = anchor
          scrollIntoScreen(document.getElementById(anchor))
        }
      }
      if (switchingIntent) nextTick(select)
      else select()
      return
    }

    const targetId = isCategoryAnchor ? `cat-${anchor}` : anchor
    const scrollToCategory = () => scrollIntoScreen(document.getElementById(targetId))
    // Switching intent swaps the whole page body — wait for the new content
    // (and its anchors) to mount before scrolling to it.
    if (switchingIntent) nextTick(() => nextTick(scrollToCategory))
    else scrollToCategory()
  } else if (isFilter.value) {
    onCategorySelect(anchor)
  } else {
    nextTick(() => scrollIntoScreen(document.getElementById(anchor)))
  }
}

// The active category's full node (subcategories + items) — drives CategoryCatalog.
const activeCatData = computed(() =>
  activeCategories.value?.find(c => c.id === activeCat.value) ?? null,
)

// Whenever the category source changes (theme switch into or out of filter
// mode, or — multi-level only — the active intent switching to a different
// category list) reset to the first category. immediate:true handles the
// initial load — onMounted fires too late when the theme is already FCM on
// first render.
watch(activeCategories, (cats) => {
  if (isFilter.value && cats?.length) {
    activeCat.value = cats[0].id
  } else {
    activeCat.value = null
  }
}, { immediate: true })

// ── Subcategory navigation (FCM filter mode) ─────────────────────────────────
const activeSub = ref(null)

const subcategoryTabs = computed(() =>
  activeCatData.value?.subcategories?.map(s => ({ id: s.id, label: s.navLabel ?? s.label })) ?? []
)

// Reset to the first subcategory whenever the active category changes.
watch(activeCatData, (cat) => {
  activeSub.value = cat?.subcategories?.[0]?.id ?? null
}, { immediate: true })

const prefersReduced = () =>
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches

// Scrolls only the phone mockup's own scroll container (.device__screen),
// never the outer preview page — a bare el.scrollIntoView() walks up EVERY
// scrollable ancestor it finds, and if the outer page is ever scrollable
// (e.g. the toolbar+device briefly exceeds the window before useDeviceScale
// catches up), it cascades there too, sliding the whole device mockup up
// behind the sticky preview toolbar. Mirrors CatalogNavStack's own scrollToId.
function scrollIntoScreen(el) {
  if (!el) return
  const behavior = prefersReduced() ? 'auto' : 'smooth'
  const screen = el.closest('.device__screen')
  if (!screen) {
    el.scrollIntoView({ behavior, block: 'start' })
    return
  }
  const delta = el.getBoundingClientRect().top - screen.getBoundingClientRect().top
  screen.scrollBy({ top: delta, behavior })
}

// Waits for an anchor that isn't mounted yet — e.g. a subcategory anchor
// inside CategoryCatalog, which only mounts once its `mode="out-in"` leave
// transition for the PREVIOUS category finishes. A fixed nextTick count
// races that CSS transition and silently no-ops via scrollIntoScreen's own
// `if (!el) return`, so this polls on rAF instead. Capped so a missing/
// mistyped anchor id can't poll forever.
function scrollToAnchorWhenMounted(id, framesLeft = 60) {
  const el = document.getElementById(id)
  if (el) { scrollIntoScreen(el); return }
  if (framesLeft <= 0) return
  requestAnimationFrame(() => scrollToAnchorWhenMounted(id, framesLeft - 1))
}

// Story CTA navigation — legacy filter mode switches the active category then
// scrolls to the subcategory section once the out-in transition (200ms leave)
// has settled. Multi-level mode has nothing to switch (every category is
// already on the page) so it scrolls directly, same as page mode.
function onStoryCta(slide) {
  if (!slide) return
  if (slide.ctaAction === 'pwa-install') {
    openTaskGiftSheet()
    return
  }
  if (slide.ctaAction === 'web-push') {
    enableWebPush()
    return
  }
  if (slide.ctaAction === 'gift-task') {
    openTaskGiftSheet()
    return
  }
  if (slide.ctaCategory && isFilter.value && !isMultiLevel.value) {
    activeCat.value = slide.ctaCategory
    setTimeout(() => scrollIntoScreen(document.getElementById(slide.ctaTarget)), 220)
  } else if (slide.ctaTarget) {
    scrollIntoScreen(document.getElementById(slide.ctaTarget))
  }
}

function onSubcategorySelect(id) {
  activeSub.value = id
  nextTick(() => scrollIntoScreen(document.getElementById(id)))
}

// CatalogNavStack's flat row, filter mode only: tapping a subcategory tab
// that belongs to a category other than the one currently filtered in must
// switch categories first — only the active category is mounted (isFilter),
// so an inactive category's subcategory anchor doesn't exist yet.
function onFlatNavSelect({ categoryId, subcategoryId }) {
  const switchingCategory = categoryId && categoryId !== activeCat.value
  if (switchingCategory) {
    activeCat.value = categoryId
    // activeCatData's own watcher (below) resets activeSub to the category's
    // FIRST subcategory — wait for that to settle, then override to the one
    // actually tapped.
    nextTick(() => { activeSub.value = subcategoryId })
  } else {
    activeSub.value = subcategoryId
  }
  // Whether or not the category switched, isSubFiltered means CategoryCatalog
  // only mounts the ONE subcategory matching activeSub (a v-if toggle, same
  // as any other category's own subcategory switch) — that mount is async
  // relative to this synchronous assignment, so poll rather than assume a
  // fixed nextTick count is enough (doubly true across a category switch,
  // which also waits on CategoryCatalog's own mode="out-in" transition).
  scrollToAnchorWhenMounted(subcategoryId)
}

// End-of-category dropdown, isSubFiltered only: options are flatSubcategories
// (every subcategory of every category, matching CatalogNavStack's flat row),
// so picking one may belong to a different category — resolve that owner and
// reuse onFlatNavSelect's exact switch-then-select logic.
function onSubcategoryDropdownSelect(subcategoryId) {
  const categoryId = flatSubcategories.value.find(s => s.id === subcategoryId)?.categoryId ?? null
  onFlatNavSelect({ categoryId, subcategoryId })
}

// Show the top subcategory nav only once the user has scrolled DOWN into the first
// subcategory. The anchor div sits just above CategoryCatalog (after the featured
// carousel); the nav appears once that anchor has scrolled ABOVE the viewport top.
// Note: a not-intersecting anchor can be either above OR below the fold, so we must
// check boundingClientRect.top against the viewport top — not isIntersecting alone,
// which would (wrongly) show the nav while the catalogue is still below the fold.
const showSubcatNav = ref(false)
let catalogObserver = null

// Also re-evaluated when isMultiLevel flips (flag toggle) so the observer is
// torn down immediately rather than continuing to run unused.
watch([catalogAnchorRef, isMultiLevel], ([el, multi]) => {
  if (catalogObserver) { catalogObserver.disconnect(); catalogObserver = null }
  // Multi-level nav: CatalogNavStack docks/undocks via native `position:
  // sticky`, not a scroll-spied show/hide gate, so this observer — which
  // exists solely to decide when to reveal the legacy top subcategory bar —
  // has nothing to do.
  if (!el || multi) return
  const root = device.value !== 'none'
    ? document.querySelector('.device__screen')
    : null
  catalogObserver = new IntersectionObserver(
    ([entry]) => {
      const rootTop = entry.rootBounds?.top ?? 0
      showSubcatNav.value = !entry.isIntersecting && entry.boundingClientRect.top < rootTop
    },
    { root, threshold: 0 }
  )
  catalogObserver.observe(el)
})

onBeforeUnmount(() => {
  if (catalogObserver) catalogObserver.disconnect()
  window.removeEventListener('keydown', onGlobalKey)
})

// CP/currency coin SVG — inline icon in SKU cards. Computed so it updates reactively
// when the theme switches (one-time reads like `storeAssets.value.brand.cpIcon` break
// on theme switch because the outer computed ref is not re-tracked).
const CP_ICON   = computed(() => storeAssets.value.brand.cpIcon)
const CP_BANNER  = computed(() => storeAssets.value.content.cpSkuBanner)
const CP_COIN_1  = computed(() => storeAssets.value.content.cpCoins?.[58000])

// Per-SKU CP coin product image (checkout thumbnail / bundle tile), looked up
// by exact CP amount. Falls back to the generic coin for stores that don't
// ship a cpCoins map.
function cpCoinFor(amount) {
  const coins = storeAssets.value.content.cpCoins
  return coins?.[amount] ?? storeAssets.value.content.skuCodPoint
}

// Figma asset URLs (photographic) — valid for 7 days from generation.
const BANNER_BG      = 'https://www.figma.com/api/mcp/asset/3964affe-7c43-457a-8507-1e77cabac474'
const HALL_ICON      = 'https://www.figma.com/api/mcp/asset/445c4a1d-e073-4f84-8c49-eb0f237e1af3'
const BESTSELLER_IMG = 'https://www.figma.com/api/mcp/asset/c0d9e901-cce5-438c-af39-3ce185b22b9b'

// Bundle event countdown — ~20d 02h 34m out (matches the Figma reference).
const BUNDLE_ENDS_AT =
  Date.now() + 20 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000 + 34 * 60 * 1000

// FCM daily gift resets every ~24h — demo value puts it in the warning band (14h 48m).
const FCM_GIFT_DAILY_ENDS_AT = Date.now() + 14 * 60 * 60 * 1000 + 48 * 60 * 1000

// On a real touch device the device-frame preview is meaningless — force
// Responsive (no frame) and keep it there.
const { isMobile } = useDeviceDetect()
const figmaCaptureStep = (!__STORE_LOCKED__ && import.meta.env.DEV && typeof window !== 'undefined')
  ? new URLSearchParams(window.location.search).get('figmaCapture')
  : null
const figmaCaptureDevice = !figmaCaptureStep
  ? null
  : figmaCaptureStep === 'codashop-homepage'
    ? 'none'
    : 'iphone'
// device is a shared singleton (useDeviceFrame.js) so usePwaInstall.js and
// tour setup() hooks can read/set it too — this just aliases that ref.
const { device } = useDeviceFrame()
device.value = figmaCaptureDevice
  ?? (isMobile.value ? 'none' : (config.value.device?.default ?? 'iphone'))
// When the active store changes, reset the device frame to the new store's preferred default.
// This makes switching from a mobile store (iPhone) to a PC store (Responsive) automatic.
watch(config, (newConfig) => {
  if (figmaCaptureStep) return
  device.value = isMobile.value ? 'none' : (newConfig.device?.default ?? 'iphone')
})
watch(isMobile, (v) => {
  if (figmaCaptureStep) return
  if (v) device.value = 'none'
})

const { menuOpen } = useNavDrawer()  // nav drawer open state

// Real vue-router routes for the storefront's page-level views (see
// router.js) — '/', '/product' (Codashop only), '/order-complete', '/history'.
// Gives the browser back/forward buttons real history entries to walk
// between instead of leaving the SPA/doing nothing.
const route = useRoute()
const router = useRouter()

// ── Shareable URL state (device/orientation/store/overlay) ──────────────────
// ?device=ios|android|responsive (+ &orientation=landscape&theme=<store>&
// overlay=<name>) lets a dev — or an external handoff scraper — jump straight
// into a specific state instead of whatever the app happened to boot into.
// Query wins over the store-default device pick above, but still loses to
// the figmaCapture override and the real-touch-device Responsive force (a
// physical phone always gets Responsive regardless of what's in the URL).
// See useUrlState.js for the read-on-boot/write-going-forward mechanics and
// the closed set of overlays it can address.
useUrlState({ device, isMobile, figmaCaptureStep })

// Transaction History full-page view — swaps the storefront for the page (NavBar
// stays). Opened from the signed-in AccountPopover; reachable in every store.
const { historyOpen, openHistory, closeHistory } = useTransactionHistory()
const { orderCompleteOpen, openOrderComplete, closeOrderComplete } = useOrderComplete()

// ── Codashop aggregator homepage (config.home) ──────────────────────────────
// Codashop is the only store that ships config.home — its storefront IS the
// title-listing homepage; the existing MLBB product page becomes the
// representative "title detail" view, reached by tapping any title card and
// left by tapping the navbar logo (NavBar's @home) or the page's own back
// control. Every other store omits config.home, so homeView never renders
// and the storefront behaves exactly as before (two-gate pattern, never
// `theme.value === 'codashop'`).
const { homeView, goHome: goHomeCodashop, openTitle } = useCodashopHome()
const showHomeView = computed(() => !!config.value.home && homeView.value)

// Route → page-state sync — the ONLY place that flips the 3 page composables'
// refs. Every other call site (DeviceToolbar, PurchaseSheet, OrderCompletePage,
// AccountPopover, goHome below) pushes a route instead of calling
// openX()/closeX() directly, so the URL stays the single source of truth for
// "which page" and browser back/forward (which re-run this watcher, same as
// a push) always lands the composables in the right state.
watch(() => route.path, (path) => {
  const wantHistory = path === '/history'
  const wantOrderComplete = path === '/order-complete'
  const wantProduct = path === '/product'
  if (wantHistory && !historyOpen.value) openHistory()
  else if (!wantHistory && historyOpen.value) closeHistory()
  if (wantOrderComplete && !orderCompleteOpen.value) openOrderComplete()
  else if (!wantOrderComplete && orderCompleteOpen.value) closeOrderComplete()
  if (config.value.home) {
    if (wantProduct && homeView.value) openTitle()
    else if (!wantProduct && !homeView.value) goHomeCodashop()
  }
}, { immediate: true })

// Safety: if the store is switched (dev console) to one that doesn't ship the
// Transaction History / Order Complete copy, fall back to the storefront
// rather than leave the view swapped to a page that renders nothing.
watch(strings, (s) => {
  if (route.path === '/history' && !s.transactionHistory) router.push('/')
  if (route.path === '/order-complete' && !s.page.orderComplete) router.push('/')
})

// Reset to the homepage whenever the store is switched TO Codashop (dev
// console/toolbar) rather than leaving a stale "inside a title" state.
watch(() => config.value.home, (home) => { if (home) router.push('/') })

// The navbar logo's universal "go to default page" handler (see NavBar's
// `home` emit doc). Pushing '/' lets the route→state watcher above apply
// every page-composable's own reset (Codashop home, Order Complete,
// Transaction History) in one place — the logo always lands you back on the
// default page, not just one of the three.
function goHome () {
  router.push('/')
}
// Visual (cinematic) vs standard editorial vs blob (acrylic) layout —
// Codashop-only enum flag.
const homeLayout = computed(() => flagValue('homepageLayout'))
// Mirrors the SKU-card material pilot's own <html data-sku-material> pattern
// (see below) so themes/codashop.css can scope the blob variant's own
// palette/radii to html[data-theme="codashop"][data-home-layout="blob"] —
// never leaking into Standard/Visual or any other store. Empty string (not
// a value) when the blob layout isn't active, so the attribute selector
// never matches on a state that didn't opt in.
watchEffect(() => {
  document.documentElement.dataset.homeLayout = homeLayout.value === 'blob' ? 'blob' : ''
})

// ── Command console (`/` palette) ─────────────────────────────────────────────
// Mounted on every build, including store-locked ("isolated") ones — it's the
// only way to reach dev-only affordances (like the session tracker) that are
// deliberately kept off the toolbar there. CommandConsole's own registry
// already excludes the store-locked-incompatible commands (library, inspector,
// screenshot — see its `!__STORE_LOCKED__` Tools gate).
const isStoreLocked = __STORE_LOCKED__

// Component library viewer (dev chrome) — lazily imported and ONLY referenced
// when not store-locked, so the whole src/library tree (viewer + stories) is
// dead-code-eliminated from store-locked ("isolated") bundles.
const LibraryViewer = isStoreLocked
  ? null
  : defineAsyncComponent(() => import('./library/LibraryViewer.vue'))
// When the library page is active, App unmounts the store (toolbar + frame) and
// shows the full-page viewer instead — no overlay stacking, no store bleed-through.
const { active: libraryActive } = useLibrary()

// Handoff surface (dev chrome, real /handoff child URL — see useHandoff.js) —
// same lazy-import + store-lock gating as the library, and the same "unmount
// the store while active" treatment. Tree-shaken from store-locked builds
// since nothing else imports src/handoff outside this guard.
const HandoffApp = isStoreLocked
  ? null
  : defineAsyncComponent(() => import('./handoff/HandoffApp.vue'))
const { active: handoffActive } = useHandoff()

// Token usage dashboard (dev chrome, real /tokens child URL — see
// useTokenAudit.js). Same lazy-import + store-lock gating as the library
// and handoff — nothing else imports src/token-audit outside this guard,
// so its whole raw-source scan (sources.js's import.meta.glob) tree-shakes
// out of store-locked builds.
const TokenAuditApp = isStoreLocked
  ? null
  : defineAsyncComponent(() => import('./token-audit/TokenAuditApp.vue'))
const { active: tokenAuditActive } = useTokenAudit()
// Global `/` opens the dev command palette, but only when the user isn't typing
// into a field (matches GitHub/Slack). Escape-to-close lives in the component.
const { open: consoleOpen, openConsole } = useCommandConsole()
// Collaborator comment mode — toggled with `C`. Gated on its own runtime flag
// (Vercel/PROD + local opt-in), NOT __STORE_LOCKED__, so it works on the locked
// per-store review deployments where the `/` console is compiled out.
const { enabled: commentsEnabled, toggle: toggleComments, setContext: setCommentContext } = useComments()
function isTypingTarget (el) {
  if (!el) return false
  const tag = el.tagName
  return el.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}
function onGlobalKey (e) {
  // Read the retargeting-safe origin: while typing inside comment-kit's shadow
  // root, e.target is retargeted to the <comment-kit-layer> host, which would
  // slip past isTypingTarget and let `c`/`/` fire mid-compose.
  const origin = e.composedPath?.()[0] ?? e.target
  // No `/` palette on the library page — the store (and its CommandConsole) is
  // unmounted there, so opening it would only flip a phantom state. (The
  // library page itself is unreachable in store-locked builds, so this only
  // matters on the internal build.)
  if (e.key === '/' && !consoleOpen.value && !libraryActive.value && !handoffActive.value && !tokenAuditActive.value && !isTypingTarget(origin)) {
    e.preventDefault()
    openConsole()
  } else if (
    commentsEnabled &&
    (e.key === 'c' || e.key === 'C') &&
    !e.metaKey && !e.ctrlKey && !e.altKey &&
    !consoleOpen.value && !libraryActive.value && !handoffActive.value && !isTypingTarget(origin)
  ) {
    // Bare `c` toggles comment mode. Guarded against typing targets (and against
    // Cmd/Ctrl+C copy) so it never fires mid-edit or while composing a comment.
    e.preventDefault()
    toggleComments()
  }
}

// --toolbar-h (used by the responsive overlays to dock below the bar) is owned
// by DeviceToolbar, which measures itself live via ResizeObserver so it tracks
// the collapse/expand animation.
onMounted(() => {
  // Always registered — `/` opens the command console on every build (including
  // store-locked), and `c` additionally toggles comment mode when it's enabled.
  window.addEventListener('keydown', onGlobalKey)

  if (figmaCaptureStep) {
    import('./dev/figmaCapture.js').then(({ applyFigmaCapture }) => {
      applyFigmaCapture(figmaCaptureStep, { goHome })
    })
  }

  // (activeCat default is handled by the catalog watcher below)
})

// Publish the current page/view to comment mode so pins scope to where they were
// left: filter-mode stores key on the active category; page-mode stores are one
// scroll (single 'storefront' bucket). Transaction history is its own view.
if (commentsEnabled) {
  // Flow-state aggregation: derive the topmost open overlay so a comment records
  // (and re-shows in) the surface it was left on. There's no runtime stacking
  // resolver, so this is a static priority by z-index (highest wins). Transient
  // toasts and the dev console are intentionally excluded. NavDrawer's open lives
  // in the local `menuOpen` ref. Composables are singletons — re-calling is free.
  const { sheetOpen: checkoutOpen } = useCheckout()
  const { summaryOpen } = useItemSummary()
  const { claimSheetOpen } = useGiftClaim()
  const {
    signInSheetOpen, accountMenuOpen, signingIn, eaSignInOpen, konamiSignInOpen,
  } = useAuth()
  const { regionSelectorOpen, languageSelectorOpen } = useLocale()

  // [key, label, isOpenRef] in priority order — first match wins.
  const SURFACES = [
    ['account',       'Account',        accountMenuOpen],
    ['checkout',      'Checkout',       checkoutOpen],
    ['item-summary',  'Item summary',   summaryOpen],
    ['claim-gift',    'Claim gift',     claimSheetOpen],
    ['signin',        'Sign in',        signInSheetOpen],
    ['region',        'Region',         regionSelectorOpen],
    ['language',      'Language',       languageSelectorOpen],
    ['ea-signin',     'EA sign in',     eaSignInOpen],
    ['konami-signin', 'KONAMI sign in', konamiSignInOpen],
    ['signin-loader', 'Signing in',     signingIn],
    ['nav-drawer',    'Menu',           menuOpen],
  ]

  watchEffect(() => {
    const active = SURFACES.find(([, , open]) => open.value)
    setCommentContext({
      page: historyOpen.value ? 'transaction-history' : (isFilter.value ? (activeCat.value ?? 'storefront') : 'storefront'),
      view: historyOpen.value ? 'history' : 'store',
      surface: active ? active[0] : 'storefront',
      surfaceLabel: active ? active[1] : 'Storefront',
    })
  })
}

// Signed-in state — gates the Player Account sign-in prompt section
const { signedIn, showSnackbar } = useAuth()

// Bottom category nav tabs.
// filter mode → derived from the catalogue tree (FCM: Daily Supplies / Limited Offers / Top Ups).
// page mode   → static section anchors from strings (COD:M: Best Sellers / 2x CP / …).
const categories = computed(() => {
  // Both filter and page-with-catalog derive tabs from catalog categories.
  // Filter mode uses raw id (activeCat matching); page mode prefixes `cat-` to
  // match the on-page section anchor ids that CategoryNav scrolls to.
  if (catalog.value) {
    return catalog.value.map(c => ({
      id: isFilter.value ? c.id : `cat-${c.id}`,
      label: c.label,
    }))
  }
  const t = strings.value.page.tabs
  // Stores with an explicit section allowlist (e.g. YGO:DL) drive the nav from it,
  // zipping each section id to its tab label by position — so the nav only ever
  // lists sections that actually render. Stores without one use the default
  // COD:M section map below.
  const sections = config.value.page?.sections
  if (sections) {
    return sections.map((id, i) => ({ id: `cat-${id}`, label: t[i] ?? id }))
  }
  return [
    { id: 'cat-best-seller', label: t[0] },
    { id: 'cat-bundle',      label: t[1] },
    { id: 'cat-gifts',       label: t[2] },
    { id: 'cat-new-users',   label: t[3] },
    { id: 'cat-cp',          label: t[4] },
    { id: 'cat-cp-img-newuser', label: t[5] },
    { id: 'cat-cp-img',         label: t[6] },
  ]
})

// Entrance cascade: each section starts a beat after the previous one.
const DELAY_STORY = 100
const DELAY_ACCOUNT = 180
const DELAY_BESTSELLER = 250
const DELAY_BS_CAROUSEL = 450
const DELAY_BUNDLE = 550
const DELAY_GIFTS = 620
const DELAY_PROMO = 720
const DELAY_CP = 950
const DELAY_CP_IMG_NEW = 1050
const DELAY_CP_IMG = 1150
// All demo data that references images is a computed so it stays reactive when
// the active theme changes and storeAssets updates.
const bundle = computed(() => ({
  bannerImage: storeAssets.value.content.bannerTerminator2,
  skuImage:    storeAssets.value.content.skuVmpJudgementDay,
  skuOnBanner: true,
  title: '2,600 CP + BONUS VMP - JUDGEMENT DAY',
  subtitle: 'TERMINATOR 2',
  currentPrice: '$0.99',
  originalPrice: '$1.99',
  discountPercent: '-49%',
  limitLabel: common.value.sku.limitLabel,
  loyaltyPoints: 72,
  endsAt: BUNDLE_ENDS_AT,
  // `name`/`media`/`description` drive the Item Summary accordion; `image`/`tileBg`/
  // `tag`/`quantity` drive the bundle breakdown tile. One item carries a video to
  // exercise the <Media> video path.
  items: [
    {
      image: storeAssets.value.content.itemVmpJudgementDay,
      tileBg: 'var(--x-rarity-gradient-legendary)',
      tag: { label: strings.value.sku.bonusTag, variant: 'value' }, quantity: 1,
      name: 'VMP - JUDGEMENT DAY', media: storeAssets.value.content.avatarPreviewVideo,
      description: 'A Terminator 2-themed weapon blueprint for the VMP — cold chrome and blood-red HUD accents straight from Judgement Day.',
    },
    {
      image: cpCoinFor(2600), quantity: 2600,
      tileBg: 'var(--x-rarity-gradient-common)',
      name: '2,600 CP',
      description: 'Call of Duty Points — the in-game currency used to unlock Battle Pass tiers, bundles, and Draw events across COD:M.',
    },
  ],
}))

const bundle2 = computed(() => ({
  bannerImage: storeAssets.value.content.bannerTheBoys,
  skuImage:    storeAssets.value.content.skuMidnightSunHero,
  skuOnBanner: true,
  title: '4000 CP + 50 BONUS STRONGBOXES',
  currentPrice: '$24.99',
  originalPrice: '$49.99',
  discountPercent: '-50%',
  limitLabel: common.value.sku.limitLabel,
  loyaltyPoints: 1820,
  endsAt: BUNDLE_ENDS_AT,
  items: [
    {
      image: storeAssets.value.content.skuCrate,
      tileBg: 'var(--x-rarity-gradient-common)',
      tag: { label: strings.value.sku.bonusTag, variant: 'value' }, quantity: 50,
      name: 'STRONGBOX', media: storeAssets.value.content.avatarPreviewVideo,
      description: 'A stack of 50 Strongboxes — every box rolls from the current featured pool for a shot at Mythic blueprints and operator skins.',
    },
    {
      image: cpCoinFor(4000), quantity: 4000,
      tileBg: 'var(--x-rarity-gradient-common)',
      name: '4000 CP',
      description: 'Call of Duty Points — the in-game currency used to unlock Battle Pass tiers, bundles, and Draw events across COD:M.',
    },
  ],
}))

// Gifts category demo data — COD:M scroll-page only (computed so art stays
// reactive on theme switch). FCM filter mode gets gift items directly from
// activeCatData (catalog) and renders them as BundleSkuCards in the gifts tab.
// Daily gift: <24h (error), Emote: >72h (default), Gun: 24–72h (warning).
const gifts = computed(() => [
  {
    id:               'gift-daily',
    image:            storeAssets.value.content.giftSecretCache,
    tagLabel:         strings.value.page.giftTagLabel,
    title:            strings.value.page.giftDailyTitle,
    subtitle:         strings.value.page.giftDailySub,
    limitLabel:       strings.value.page.giftLimit,
    ctaLabel:         strings.value.page.giftClaimCta,
    endsAt:           Date.now() + 14 * 60 * 60 * 1000 + 48 * 60 * 1000,
    refreshesOnClaim: true,
    endsLabel:        strings.value.page.giftEndsLabel,
    refreshesLabel:   strings.value.page.giftRefreshesLabel,
  },
  {
    id:         'gift-emote',
    image:      storeAssets.value.content.giftEmote,
    tagLabel:   strings.value.page.giftTagLabel,
    title:      strings.value.page.giftEmoteTitle,
    limitLabel: strings.value.page.giftLimit,
    ctaLabel:   strings.value.page.giftClaimCta,
    endsAt:     Date.now() + 96 * 60 * 60 * 1000,
    endsLabel:  strings.value.page.giftEndsLabel,
  },
  {
    id:         'gift-gun',
    image:      storeAssets.value.content.giftGun,
    tagLabel:   strings.value.page.giftTagLabel,
    title:      strings.value.page.giftGunTitle,
    limitLabel: strings.value.page.giftLimit,
    ctaLabel:   strings.value.page.giftClaimCta,
    endsAt:     Date.now() + 48 * 60 * 60 * 1000,
    endsLabel:  strings.value.page.giftEndsLabel,
  },
  {
    id:         'gift-task-cp',
    image:      cpCoinFor(88),
    taskGift:   true,
    tagLabel:   strings.value.page.giftTagLabel,
    title:      strings.value.page.giftTask?.cardTitle,
    subtitle:   strings.value.page.giftTask?.cardSubtitle,
    ctaLabel:   strings.value.page.giftTask?.cardCta,
    readyLabel: strings.value.page.giftClaimCta,
  },
])

// FCM gifts tab — enrich catalog BundleSkuCard items with gift-claim metadata.
// Daily Gift gets a countdown + refreshes-on-claim; First Login gets a limit label.
// Catalog items are identified by their title slug so this stays data-driven.
// Factored out of a category node (rather than reading activeCatData directly)
// so the multi-level "render every category" loop can call it per-iteration —
// legacy filter mode still gets it via the activeCatData-bound computed below.
function giftItemsFromCategory(cat) {
  return (cat?.subcategories?.[0]?.items ?? []).map((item) => {
    const id = item.title.toLowerCase().replace(/\s+/g, '-')
    if (id === 'daily-gift') {
      return { ...item, id, endsAt: FCM_GIFT_DAILY_ENDS_AT, refreshesOnClaim: true }
    }
    if (id === 'first-login-reward') {
      return { ...item, id, limitLabel: common.value.sku.limitLabel }
    }
    return { ...item, id }
  })
}
const fcmGiftItems = computed(() => giftItemsFromCategory(activeCatData.value))

const stories = computed(() => {
  // Single hero KV (eFootball) — one slide, no progress bar / auto-advance.
  // Branch on the asset's presence, not store identity, to stay theme-agnostic.
  if (storeAssets.value.content.storyHero) {
    // config.page.storyHeroLogo: false suppresses the brand-mark overlay on
    // this one slide (e.g. YGOMD, whose carousel key art already reads as
    // branded without a second logo stamped on top of it) — every other
    // store omits the flag and keeps the overlay, unchanged.
    const showLogo = config.value.page?.storyHeroLogo !== false
    return [{ image: storeAssets.value.content.storyHero, landscape: storeAssets.value.content.storyHero, logo: showLogo ? (storeAssets.value.brand.wordmark ?? null) : null, heading: null, ctaLabel: null }]
  }
  if (isFilter.value) {
    return [
      { image: storeAssets.value.content.fcmStory1, heading: null, ctaLabel: 'View TWG Packs', ctaCategory: 'limited-offers', ctaTarget: 'campaign-packs' },
      { image: storeAssets.value.content.fcmStory2, heading: null, ctaLabel: 'Claim Now', ctaCategory: 'gifts', ctaTarget: 'gifts' },
      { image: storeAssets.value.content.fcmStory3, heading: null, ctaLabel: 'Buy Now',        ctaCategory: 'daily-supplies',  ctaTarget: 'daily-boosters' },
      { image: storeAssets.value.content.fcmStory4, heading: null, ctaLabel: 'Buy Star Pass',  ctaCategory: 'limited-offers',  ctaTarget: 'star-pass' },
    ]
  }
  // PWA install slide — prepended only when the store supplies pwaInstall
  // copy (COD:M today), same content-gate convention as every other PWA
  // surface. Every other store hitting this default branch is unaffected.
  // Once installed (pwaInstalledState variant flag), swap for the Web Push
  // upsell slide instead (see useWebPush.js) — same slot, same slide count.
  const pwaSlide = pwaInstalled.value && strings.value.page.webPush ? [{
    image:     storeAssets.value.content.downloadBannerBg,
    // Confirmed state once subscribed — same slide slot, no click action
    // (onStoryCta no-ops on an unset ctaAction), checkmark-style icon instead
    // of the CTA glyph. Avoids leaving a stale "Turn on notifications" button
    // that no longer does anything once already subscribed.
    heading:   webPushSubscribed.value ? strings.value.page.webPush.storySlideConfirmedHeading : strings.value.page.webPush.storySlideHeading,
    ctaLabel:  webPushSubscribed.value ? strings.value.page.webPush.storySlideConfirmedLabel : strings.value.page.webPush.storySlideCta,
    ctaIcon:   webPushSubscribed.value ? 'notifications_active' : 'notifications',
    ctaPoi:    webPushSubscribed.value ? 'story-webpush-confirmed' : 'story-webpush-cta',
    ctaAction: webPushSubscribed.value ? null : 'web-push',
  }] : strings.value.page.pwaInstall && strings.value.page.giftTask ? [{
    // Reward nudge — same pre-install slide slot as the generic "install the
    // store" pitch below, now pointed at the 88 CP task-gated gift instead
    // (see useTaskGiftClaim.js / TaskGiftSheet.vue). Opens the instructions
    // sheet rather than triggering install directly, since there are two
    // steps to walk through, not one.
    image:     storeAssets.value.content.downloadBannerBg,
    heading:   strings.value.page.giftTask.storySlideHeading,
    ctaLabel:  strings.value.page.giftTask.cardCta,
    ctaIcon:   'install_mobile',
    ctaPoi:    'story-gift-task-cta',
    ctaAction: 'gift-task',
  }] : strings.value.page.pwaInstall ? [{
    image:     storeAssets.value.content.downloadBannerBg,
    heading:   strings.value.page.pwaInstall.storySlideHeading,
    ctaLabel:  strings.value.page.pwaInstall.storySlideCta,
    ctaIcon:   'install_mobile',
    ctaPoi:    'story-pwa-cta',
    ctaAction: 'pwa-install',
  }] : []

  return [
    ...pwaSlide,
    {
      portrait:  storeAssets.value.content.slideKuiJiPortrait,
      landscape: storeAssets.value.content.slideKuiJiLandscape,
      heading:   strings.value.page.promoTitle,
      ctaLabel:  strings.value.page.promoAction,
      ctaTarget: 'cat-bundle',
    },
    {
      portrait:  storeAssets.value.content.slideTheBoysPortrait,
      landscape: storeAssets.value.content.slideTheBoysLandscape,
      heading:   null,
      ctaLabel:  null,
    },
  ]
})

const bestSeller = computed(() => ({
  amount: 88, baseAmount: 80, bonusAmount: 8,
  bonusLabel: strings.value.sku.bonusLabel,
  originalPrice: '$1.99', discountPercent: '-49%', currentPrice: '$0.99',
  skuImage: cpCoinFor(88),
  // Loyalty row only for stores with a points programme (COD:M has none).
  loyaltyPoints: config.value.checkout.loyalty !== null ? 72 : null,
  endsAt: BUNDLE_ENDS_AT,
  // Demo: this best-seller is bundled — 88 CP plus a bonus Strongbox.
  items: [
    { image: cpCoinFor(88), tileBg: 'var(--x-rarity-gradient-common)', quantity: 88 },
    { image: storeAssets.value.content.skuCrate, tileBg: 'var(--x-rarity-gradient-common)', tag: { label: strings.value.sku.bonusTag, variant: 'value' }, quantity: 1 },
  ],
}))

const fcmBestSeller = computed(() => {
  const d = featuredItems.value?.[0]
  return {
    label:         'Daily Booster D',
    subtitle:      '18% more FC Points than in-game*',
    amount:        499,
    currentPrice:  '$4.99',
    loyaltyPoints: config.value.checkout.loyalty !== null ? 499 : null,
    image:    d?.bannerImage ?? storeAssets.value.content.bestSellerImage,
    skuImage: d?.skuImage    ?? storeAssets.value.content.bestSellerImage,
  }
})

// Demo data for the horizontal best-seller carousel (multiple recommendations).
// Computed so bonusLabel reacts when the theme switches.
const bestSellerCarousel = computed(() => {
  const bl = strings.value.sku.bonusLabel
  // Loyalty row only for stores with a points programme (COD:M has none).
  const lp = (n) => (config.value.checkout.loyalty !== null ? n : null)
  return [
    { amount: 88,    baseAmount: 80,   bonusAmount: 8,    bonusLabel: bl, originalPrice: '$1.99',   discountPercent: '-49%', currentPrice: '$0.99',  loyaltyPoints: lp(72),   skuImage: cpCoinFor(88),    endsAt: BUNDLE_ENDS_AT },
    { amount: 11600, baseAmount: 8000, bonusAmount: 3600, bonusLabel: bl,                                                   currentPrice: '$99.99', loyaltyPoints: lp(7291), skuImage: cpCoinFor(11600), endsAt: BUNDLE_ENDS_AT },
    { amount: 420,   baseAmount: 380,  bonusAmount: 40,   bonusLabel: bl, originalPrice: '$4.99',   discountPercent: '-40%', currentPrice: '$2.99',  loyaltyPoints: lp(218),  skuImage: cpCoinFor(420),   endsAt: BUNDLE_ENDS_AT },
  ]
})

const promoItems = computed(() => {
  const bl = strings.value.sku.bonusLabel
  // Store-specific SKU override (e.g. Codashop's MLBB placeholder catalog) —
  // use the store's own items directly, same pattern as cpImageRegular below.
  if (storeSkus.value?.promo) return storeSkus.value.promo.map(s => ({ bonusLabel: bl, ...s }))
  return [
    { amount: 460,  baseAmount: 400,  bonusAmount: 60,   bonusLabel: bl, bonusType: 'codashop', originalPrice: '$4.99',  discountPercent: '-49%', currentPrice: '$2.50',  isBestValue: false, loyaltyPoints: 182,  skuImage: cpCoinFor(460) },
    { amount: 960,  baseAmount: 800,  bonusAmount: 160,  bonusLabel: bl, bonusType: 'codashop', originalPrice: '$9.99',  discountPercent: '-49%', currentPrice: '$5.00',  isBestValue: false, loyaltyPoints: 365,  skuImage: cpCoinFor(960) },
    { amount: 2600, baseAmount: 2000, bonusAmount: 600,  bonusLabel: bl, bonusType: 'codashop', originalPrice: '$24.99', discountPercent: '-49%', currentPrice: '$12.50', isBestValue: false, loyaltyPoints: 911,  skuImage: cpCoinFor(2600) },
    { amount: 5400, baseAmount: 4000, bonusAmount: 1400, bonusLabel: bl, bonusType: 'codashop', originalPrice: '$49.99', discountPercent: '-49%', currentPrice: '$25.00', isBestValue: true,  loyaltyPoints: 1822, skuImage: cpCoinFor(5400) },
  ]
})

const cpItems = computed(() => {
  const bl = strings.value.sku.bonusLabel
  // Store-specific SKU override (e.g. Codashop's MLBB placeholder catalog) —
  // use the store's own items directly, same pattern as cpImageRegular below.
  if (storeSkus.value?.cp) return storeSkus.value.cp.map(s => ({ bonusLabel: bl, ...s }))
  return [
    { amount: 88,    baseAmount: 80,    bonusAmount: 8,     bonusLabel: bl, bonusType: 'cp', currentPrice: '$0.99',   isBestValue: false, loyaltyPoints: 72,    skuImage: cpCoinFor(88) },
    { amount: 160,   baseAmount: 80,    bonusAmount: 80,    bonusLabel: bl, bonusType: 'cp', currentPrice: '$0.99',   isBestValue: true,  loyaltyPoints: 72,    skuImage: cpCoinFor(160) },
    { amount: 11600, baseAmount: 8000,  bonusAmount: 3600,  bonusLabel: bl, bonusType: 'cp', currentPrice: '$99.99',  isBestValue: false, loyaltyPoints: 7291,  skuImage: cpCoinFor(11600) },
    { amount: 23200, baseAmount: 16000, bonusAmount: 7200,  bonusLabel: bl, bonusType: 'cp', currentPrice: '$199.99', isBestValue: false, loyaltyPoints: 14583, skuImage: cpCoinFor(23200) },
    { amount: 34800, baseAmount: 24000, bonusAmount: 10800, bonusLabel: bl, bonusType: 'cp', currentPrice: '$299.99', isBestValue: false, loyaltyPoints: 21875, skuImage: cpCoinFor(34800) },
    { amount: 58000, baseAmount: 40000, bonusAmount: 18000, bonusLabel: bl, bonusType: 'cp', currentPrice: '$499.99', isBestValue: false, loyaltyPoints: 36458, skuImage: cpCoinFor(58000) },
  ]
})

// Image-led CP categories (SkuImageCard panel variant) — the coin art is rendered
// on the card itself, unlike the text-only SkuList sections above. currencyLabel
// is supplied per-section by the template (strings.currency.name); each item just
// carries its amount/pricing + the tiered coin image. loyaltyPoints is omitted —
// COD:M has no loyalty programme, so the inline loyalty row stays hidden.
const cpImageNewUser = computed(() => {
  const bl = strings.value.sku.bonusLabel
  return [
    { amount: 460,  baseAmount: 400,  bonusAmount: 60,   bonusLabel: bl, originalPrice: '$4.99',  discountPercent: '-49%', currentPrice: '$2.50',  skuImage: cpCoinFor(460) },
    { amount: 960,  baseAmount: 800,  bonusAmount: 160,  bonusLabel: bl, originalPrice: '$9.99',  discountPercent: '-49%', currentPrice: '$5.00',  skuImage: cpCoinFor(960) },
    { amount: 2600, baseAmount: 2000, bonusAmount: 600,  bonusLabel: bl, originalPrice: '$24.99', discountPercent: '-49%', currentPrice: '$12.50', skuImage: cpCoinFor(2600) },
    { amount: 5400, baseAmount: 4000, bonusAmount: 1400, bonusLabel: bl, originalPrice: '$49.99', discountPercent: '-49%', currentPrice: '$25.00', isBestValue: true, skuImage: cpCoinFor(5400) },
  ]
})

const cpImageRegular = computed(() => {
  const bl = strings.value.sku.bonusLabel
  // Store-specific SKU override (e.g. TDR) — use the store's own items directly.
  if (storeSkus.value?.cpImageRegular) {
    return storeSkus.value.cpImageRegular.map(s => ({ bonusLabel: bl, ...s }))
  }
  return [
    { amount: 88,    baseAmount: 80,    bonusAmount: 8,     bonusLabel: bl, currentPrice: '$0.99',   skuImage: cpCoinFor(88) },
    // Demo: a bundled image-led SKU — 160 CP plus a bonus Strongbox.
    { amount: 160,   baseAmount: 80,    bonusAmount: 80,    bonusLabel: bl, currentPrice: '$0.99',   isBestValue: true, skuImage: cpCoinFor(160),
      items: [
        { image: cpCoinFor(160), tileBg: 'var(--x-rarity-gradient-common)', quantity: 160 },
        { image: storeAssets.value.content.skuCrate, tileBg: 'var(--x-rarity-gradient-common)', tag: { label: strings.value.sku.bonusTag, variant: 'value' }, quantity: 1 },
      ] },
    { amount: 11600, baseAmount: 8000,  bonusAmount: 3600,  bonusLabel: bl, currentPrice: '$99.99',  skuImage: cpCoinFor(11600) },
    { amount: 23200, baseAmount: 16000, bonusAmount: 7200,  bonusLabel: bl, currentPrice: '$199.99', skuImage: cpCoinFor(23200) },
    { amount: 34800, baseAmount: 24000, bonusAmount: 10800, bonusLabel: bl, currentPrice: '$299.99', skuImage: cpCoinFor(34800) },
    { amount: 58000, baseAmount: 40000, bonusAmount: 18000, bonusLabel: bl, currentPrice: '$499.99', skuImage: cpCoinFor(58000) },
  ]
})

// Optional image-led "Best Seller" section (config.page.sections id
// 'best-seller-img') — same SkuImageCard grid as cpImageRegular, just a
// separate titled section above it. Only renders when a store supplies
// skus.bestSeller (Diablo Immortal / demo data have none, so this stays
// null and the section self-omits — see showSection below).
const bestSellerImage = computed(() => {
  const bl = strings.value.sku.bonusLabel
  const tag = strings.value.sku.bestSeller
  if (storeSkus.value?.bestSeller) {
    return storeSkus.value.bestSeller.map(s => ({ bonusLabel: bl, tagLabel: tag, ...s }))
  }
  return null
})

// ── Store-driven page sections (Regular / Limited / Free Rewards) ────────────
// Driven entirely by the active store's per-store SKU data (storeSkus), so these
// sections render ONLY for a store that defines them (e.g. YGO:DL) — never a
// theme-name test. Relative `endsInMs` offsets are resolved to absolute epoch
// countdowns once, at app boot.
const PAGE_NOW = Date.now()
const regularImageItems = computed(() => {
  const items = storeSkus.value?.regular
  if (!items) return null
  const bl = strings.value.sku.bonusLabel
  const limitText = common.value.sku.limitLabel
  return items.map(({ tagKey, limited, ...s }) => ({
    bonusLabel: bl,
    // tagKey names a `strings.sku` key; fall back to the raw key so a bad
    // marker shows visibly instead of silently dropping the tag.
    ...(tagKey ? { tagLabel: strings.value.sku[tagKey] ?? tagKey } : {}),
    ...(limited ? { subtitle: limitText } : {}),
    ...s,
  }))
})
const limitedBundles = computed(() => {
  const items = storeSkus.value?.limited
  if (!items) return null
  const limitText = common.value.sku.limitLabel
  return items.map(s => ({
    limitLabel: limitText,
    ...s,
    items: s.items.map(it => it.tag?.labelKey
      ? { ...it, tag: { ...it.tag, label: strings.value.sku[it.tag.labelKey] ?? it.tag.labelKey } }
      : it),
    endsAt: s.endsInMs != null ? PAGE_NOW + s.endsInMs : null,
  }))
})
const rewardGifts = computed(() => {
  const items = storeSkus.value?.gift
  if (!items) return null
  const p = strings.value.page
  return items.map(s => ({
    tagLabel: p.giftTagLabel, title: p.giftTitle, subtitle: p.giftSubtitle,
    limitLabel: common.value.sku.limitLabel, ctaLabel: p.giftCta,
    endsLabel: p.giftEndsLabel, refreshesLabel: p.giftRefreshesLabel,
    ...s,
    endsAt: s.endsInMs != null ? PAGE_NOW + s.endsInMs : null,
  }))
})
</script>

<template>
  <div class="app" :style="bgImageStyle">
    <!-- Store shell — unmounted while the component library, /handoff, or
         /tokens page is active, so the page has the screen to itself (no
         overlay stacking, no store bleed-through). -->
    <template v-if="!libraryActive && !handoffActive && !tokenAuditActive">
    <DeviceToolbar v-if="!figmaCaptureStep" v-model:device="device" />

    <div class="app__stage" :class="{ 'app__stage--framed': device !== 'none' }">
      <DeviceFrame :device="device">
        <!-- Slide-in nav drawer (overlays the device screen, not the window) -->
        <template #overlay>
          <NavDrawer
            :open="menuOpen"
            :intents="isMultiLevel ? intents : null"
            @close="menuOpen = false"
            @navigate="onDrawerNavigate"
          />
          <!-- Sign-in flow overlays (read shared useAuth state). The loader uses
               the device frame as a mobile proxy: framed = mobile app loader,
               'none' (Responsive) = desktop QR sign-in. -->
          <SignInLoader :is-mobile="device !== 'none'" />
          <Snackbar :is-mobile="device !== 'none'" />
          <!-- Post-sign-in purchase surface — info step → payment/checkout step,
               as ONE persistent PurchaseSheet (reads usePurchaseFlow, itself
               composing useItemSummary/useCheckout) instead of separate sheets
               faking a handoff — see usePurchaseFlow.js. Mobile = bottom sheet;
               responsive M+ = centered modal. Hidden entirely when
               config.checkout.mode === 'inline' (Codashop) — that store's
               payment/zip/details steps render as page cards in the right rail
               instead (see storefront__col--main below).
               FCM Buy Now pilot (fcmPaymentSheet flag): a SKU tap docks the
               sticky BuyNowBar instead of opening the sheet directly; its BUY
               NOW promotes into PurchaseSheet's payment step. fcmPaymentSheet
               is a single SHARED flag (not per-store — see useFeatureFlags),
               so config.checkout.buyNow is the real capability gate — see
               showBuyNowBar above. -->
          <template v-if="config.checkout.mode !== 'inline'">
            <BuyNowBar v-if="showBuyNowBar" :is-mobile="device !== 'none'" />
            <PurchaseSheet :is-mobile="device !== 'none'" />
          </template>
          <!-- Guided checkout (config.checkout.stepCta) — docked sticky bar,
               same absolute/fixed device-frame pattern as BuyNowBar. Once both
               real gates clear (checkoutReady), it transitions into the SAME
               Buy Now widget FCM's pilot uses (force-ready, so it renders
               outside that pilot's own auth gate — see BuyNowBar.vue's header
               comment). Every other inline-checkout store keeps the CTA
               inside StepDetails instead. -->
          <Transition v-if="config.checkout.stepCta" name="guided-cta" mode="out-in">
            <BuyNowBar
              v-if="checkoutReady"
              key="buy-now"
              :is-mobile="device !== 'none'"
              force-ready
              @buy-now="onGuidedCheckoutBuy"
            />
            <InlineCheckoutCta v-else key="guided" :is-mobile="device !== 'none'" />
          </Transition>
          <!-- Region / language selectors (read useLocale). Opened from the
               drawer footer or the navbar switcher. Mobile = bottom sheet;
               responsive M+ = centered modal. -->
          <RegionSelectorSheet :is-mobile="device !== 'none'" />
          <LanguageSelectorSheet :is-mobile="device !== 'none'" />
          <!-- Gift-claim sheet (reads useGiftClaim) — confirm + success views. -->
          <ClaimGiftSheet :is-mobile="device !== 'none'" :upsell-item="isFilter ? fcmBestSeller : bestSeller" />
          <!-- TaskGiftSheet above is THE merged install/notify sheet — every
               install/enable-notifications touchpoint opens it; there is no
               separate standalone IosInstallSheet any more (retired). -->
          <TaskGiftSheet :is-mobile="device !== 'none'" :upsell-item="isFilter ? fcmBestSeller : bestSeller" />
          <!-- "SIGN IN TO PURCHASE" sheet (navbar SIGN IN) + "YOUR ACCOUNT" popover
               (avatar tap). Both scrim-less; popover sits at z-index 5, above all. -->
          <SignInSheet :is-mobile="device !== 'none'" />
          <AccountPopover :is-mobile="device !== 'none'" />
          <!-- EA Account sign-in overlay — FCM only (config.signIn.flow = 'ea-redirect') -->
          <EaSignInPage />
          <!-- KONAMI ID sign-in overlay — eFootball only (signIn.flows includes 'mykonami') -->
          <KonamiSignInPage />
          <!-- Command console (`/` palette) — dev shortcut to switch store / device /
               auth / section. Mounted on every build, including store-locked, so
               dev-only affordances like the session tracker stay reachable there
               even with their toolbar button hidden. Floats above all overlays
               (z:6). device is two-way bound; navigation reuses the drawer handlers. -->
          <CommandConsole
            v-model:device="device"
            :sections="categories"
            @navigate="onDrawerNavigate"
            @open-drawer="menuOpen = true"
          />
          <!-- Sticky bottom category nav (L2 surface).
               scroll mode (COD:M): scroll-spies the on-page sections.
               filter mode (FCM):   emits update:active on tap; parent controls active tab.
               hidden when config.catalog.hideNav is true (e.g. TDR — single category),
               and superseded entirely by CatalogNavStack in multi-level mode. -->
          <CategoryNav
            v-if="!isMultiLevel && activeSection === 'store' && !config.catalog.hideNav && !historyOpen && !showHomeView && !orderCompleteOpen"
            :tabs="categories"
            :is-mobile="device !== 'none'"
            :mode="isFilter ? 'filter' : 'scroll'"
            :active="isFilter ? activeCat : undefined"
            @update:active="onCategorySelect"
          />
          <!-- Top subcategory nav (L3 surface) — FCM filter mode, mobile only.
               Appears when the user scrolls past the catalog anchor (catalog in view).
               Tabs are the active category's subcategories; tapping scrolls to the section.
               Superseded entirely by CatalogNavStack in multi-level mode. -->
          <Transition name="subcat-nav">
            <CategoryNav
              v-if="!isMultiLevel && activeSection === 'store' && isFilter && device !== 'none' && subcategoryTabs.length > 1 && showSubcatNav && !showHomeView && !orderCompleteOpen"
              :tabs="subcategoryTabs"
              :is-mobile="true"
              mode="filter"
              variant="top"
              :active="activeSub"
              @update:active="onSubcategorySelect"
            />
          </Transition>
        </template>

        <!-- In-app top bar -->
        <NavBar
          :is-mobile="device !== 'none'"
          :intents="navBarIntents"
          :active-intent="navBarActiveIntent"
          @menu="menuOpen = true"
          @update:active-intent="onNavBarIntentChange"
          @home="goHome"
        />

        <!-- Codashop aggregator homepage (config.home) — the title-listing
             surface, reached via the navbar logo. Takes over the whole
             storefront body; Footer (below, outside this template) still
             renders underneath it, same as every other view here. -->
        <HomeView v-if="showHomeView" :layout="homeLayout" @open-title="openTitle" />

        <!-- Storefront — swapped out for the Order Complete / Transaction
             History pages when either is open, or for the Codashop homepage
             above when showHomeView is true. -->
        <template v-else-if="!historyOpen && !orderCompleteOpen">

        <!-- Reseller compliance banner — FCM only -->
        <ResellerBanner v-if="config.catalog?.reseller" />

        <!-- Two-column split shell (config.page.layout === 'split', e.g. Codashop).
             storefront__col is `display: contents` unless storefront--split is
             active, so this wrapper is a complete no-op for every other store —
             see the .storefront rules below. -->
        <div class="storefront" :class="{ 'storefront--split': isSplitActive }">

        <!-- Left rail — compact game-identity card. Renders only when the store
             provides config.identity (Codashop today); every other store leaves
             this column empty (and, being `display: contents`, invisible).
             Wrapped in the standard .section treatment so it picks up the same
             top/bottom rhythm every other section uses, rather than the
             component supplying its own padding. -->
        <div class="storefront__col storefront__col--lead">
          <!-- showLeadCarousel (isSplit && config.page.heroColumn === 'lead',
               FCM) — story carousel moves into this sticky left rail instead
               of its normal top-of-main-column spot (see the two carousel
               instances in storefront__col--main below, both excluded via the
               same computed). Forced 1:1 here rather than config.carousel?.
               aspectRatio: the frame's own responsive default (1:1 narrow /
               2.6:1 at >=801px) is keyed to the PAGE container's width, not
               this rail's own ~4/12-column width, so past 801px it would
               otherwise flip to the wide landscape crop inside a column too
               narrow for it. -->
          <section v-if="showIntentHero && showLeadCarousel" class="section section--flush-top">
            <Grid>
              <Span size="carousel">
                <StoryCarousel :slides="stories" aspect-ratio="1 / 1" :base-delay="DELAY_STORY" @cta="onStoryCta" />
              </Span>
            </Grid>
          </section>

          <section v-if="config.identity" class="section" :class="{ 'section--tight-bottom': showTrustBar }">
            <CompactHero v-bind="config.identity" :delivery-label="strings.identity?.deliveryLabel" />
          </section>

          <!-- Trust bar (config.trustBar, Codashop only) — sits directly under
               the compact hero in the sticky lead rail at M/L (so it scrolls
               with the hero rather than sitting beside the checkout flow in
               the main column). Below 801px the split collapses to one
               column, so it still renders right after the hero in DOM order.
               TrustBar's own container queries are self-scoped (see
               TrustBar.vue) so it stays in its compact carousel layout at the
               rail's ~4/12-column width instead of trying to lay out the
               2x2/4-up grid meant for a full-width placement.
               A deliberate tight 12px rhythm (not the default .section gap)
               on both sides: --tight-top pairs with CompactHero's own
               --tight-bottom above, and --tight-bottom pairs with
               StepGamerId's --tight-top below (single-column collapse only —
               see that section's comment). -->
          <section
            v-if="showTrustBar"
            class="section trust-bar-section section--tight-bottom"
            :class="{ 'section--flush-top': !config.identity, 'section--tight-top': config.identity }"
          >
            <TrustBar />
          </section>
        </div>

        <div class="storefront__col storefront__col--main">

        <!-- Story slideshow hero — flush under the NavBar (no top padding, no top border).
             Hidden via config.page.hero: false (Codashop) — its Figma reference has no
             promotional carousel on this page. Sits ABOVE the inline checkout's Player/
             Gamer ID step for stores that want the hero seen before any form field
             (config.page.heroBeforeGamerId — Diablo Immortal; every other inline-checkout
             store keeps Gamer ID first, unaffected). -->
        <section v-if="showIntentHero && config.page?.heroBeforeGamerId && !showLeadCarousel" class="section section--flush-top">
          <Grid>
            <Span size="carousel">
              <StoryCarousel :slides="stories" :aspect-ratio="config.carousel?.aspectRatio" :base-delay="DELAY_STORY" @cta="onStoryCta" />
            </Span>
          </Grid>
        </section>

        <!-- Inline checkout, step 1 — "Enter Gamer ID" / "Player ID" (config.checkout.mode
             === 'inline'). Matches the page order the store's Figma/content reference
             calls for. Flush-top only when it's the actual first section (hero hidden/
             not-yet-shown above AND no trust bar). --tight-top pairs with the hero's own
             --tight-bottom below it, or with TrustBar's, whichever actually sits above. -->
        <section
          v-if="isInlineCheckout"
          class="section section--divided section--tight-bottom"
          :class="{ 'section--flush-top': !(showIntentHero && config.page?.heroBeforeGamerId) && !showTrustBar, 'section--tight-top': (showIntentHero && config.page?.heroBeforeGamerId) || showTrustBar }"
        >
          <Grid>
            <Span size="content">
              <StepGamerId />
            </Span>
          </Grid>
        </section>

        <!-- Story slideshow hero, default position (below Gamer/Player ID) — every
             inline-checkout store except those opting into heroBeforeGamerId above. -->
        <section v-if="showIntentHero && !config.page?.heroBeforeGamerId && !showLeadCarousel" class="section section--divided section--flush-top">
          <Grid>
            <Span size="carousel">
              <StoryCarousel :slides="stories" :aspect-ratio="config.carousel?.aspectRatio" :base-delay="DELAY_STORY" @cta="onStoryCta" />
            </Span>
          </Grid>
        </section>

        <!-- Sign-in / Player Profile — for stores that require auth (no guest flow).
             Signed-out: prompt + EA-red CTA. Signed-in: PlayerCard.
             COD:M (allowGuest) uses the PlayerAccount section below instead. -->
        <section v-if="!config.checkout.allowGuest" class="section section--divided">
          <Grid>
            <Span size="content">
              <PageSignInSection :is-mobile="device !== 'none'" />
            </Span>
          </Grid>
        </section>

        <!-- Player Account — guest Player ID lookup. Hidden for stores with no guest
             flow (FCM requires EA sign-in) and for stores that don't link a game account
             (e.g. Rogue Trader sells Steam keys — no player account to associate). -->
        <section v-if="!signedIn && config.checkout.allowGuest && config.profile?.showPlayerAccount !== false" id="player-account" class="section section--divided">
          <Grid>
            <Span size="content">
              <PlayerAccount :base-delay="DELAY_ACCOUNT" />
            </Span>
          </Grid>
        </section>

        <!-- ── Page model sections (COD:M: single-scroll bespoke page) ─────── -->
        <!-- `&& activeSection === 'store'` additionally hides this whole block
             while COD:M's lightweight Milestone Rewards tab is active (see
             showMilestoneTab) — the rewards section below renders instead. -->
        <template v-if="!isFilter && activeSection === 'store'">

          <!-- Catalog — page-mode stores that provide a catalog tree (e.g. Rogue Trader:
               Games & Editions + DLC). Each top-level category becomes a scroll section;
               its id (cat-{id}) is what CategoryNav uses as the scroll anchor.
               No outer Grid/Span — CategoryCatalog handles its own layout internally. -->
          <template v-if="catalog">
            <section
              v-for="cat in catalog"
              :key="cat.id"
              :id="`cat-${cat.id}`"
              class="section section--divided"
            >
              <CategoryCatalog :category="cat" :base-delay="200" />
            </section>
          </template>

          <!-- Best Seller -->
          <section v-if="showSection('best-seller')" id="cat-best-seller" class="section section--divided">
            <Grid>
              <Span size="content">
                <BestSellerCard
                  v-bind="bestSeller"
                  :image="CP_BANNER"
                  :cp-icon="CP_ICON"
                  :description="strings.page.bestSellerDesc"
                  :base-delay="DELAY_BESTSELLER"
                />
              </Span>
            </Grid>
          </section>

          <!-- Best Seller — horizontal carousel variant — full width on XS/S and L (≥1280px) -->
          <section v-if="showSection('best-seller')" class="section section--carousel">
            <Grid>
              <Span size="carousel">
                <BestSellerCarousel
                  :items="bestSellerCarousel"
                  :image="CP_BANNER"
                  :heading="common.carousel.bestSellers"
                  :cp-icon="CP_ICON"
                  :sku-image="storeAssets.content.skuCodPoint"
                  :description="strings.page.bestSellerDesc"
                  :base-delay="DELAY_BS_CAROUSEL"
                />
              </Span>
            </Grid>
          </section>

          <!-- Top category nav for the 'page' single-scroll model
               (config.page.topNav) — a generic capability, not store-
               specific (opted into by Zenless Zone Zero and Codashop).
               Mirrors FCM's CatalogNavStack placement: sits right after
               Best Seller (deliberately NOT part of this nav — Best Seller
               is a merchandising hero, not a catalogue destination the nav
               should switch away from), wrapping the REST of the store's
               catalog/SKU section run (whichever of the sections below
               config.page.sections actually enables — never a hardcoded
               pair) in one parent element — `position: sticky` (not an
               overlay) is what gives it dock/undock for free, no
               JS/IntersectionObserver bookkeeping needed. The wrapper div
               itself carries no layout CSS (see .page-nav-stack-wrap
               below) — every store not opting into topNav renders the
               identical section markup inside it with zero visual
               difference; only the sticky <nav> inside is conditional. It
               sits at its natural in-flow position until the page scrolls
               past it, then sticks at the top through the rest of the
               catalog run; it releases again the moment this wrapping
               element's bottom edge (i.e. the end of the last catalog
               section) scrolls past too — sticky is bounded by its own
               parent's box. -->
          <div class="page-nav-stack-wrap">
            <!-- catalogBoxed stores (Codashop) render their nav INSIDE the
                 boxed catalog-card instead (see the catalogBoxed section
                 below) — this sticky wrapper is for flat/unboxed page-mode
                 catalogs (ZZZ) only, so the two never double-render. -->
            <nav
              v-if="config.page?.topNav && !catalogBoxed"
              class="page-nav-stack"
              :class="{ 'page-nav-stack--responsive': device === 'none' }"
              aria-label="Categories"
            >
              <CategoryNav :tabs="categories" :is-mobile="device !== 'none'" mode="scroll" variant="row" level="l2" />
            </nav>

          <!-- Bundle -->
          <section v-if="showSection('bundle')" id="cat-bundle" class="section section--divided section--bundle">
            <!-- Optional full-bleed category backdrop + scrim (wired when asset added) -->
            <div v-if="storeAssets.content.cpCategoryBg" class="section__bg" aria-hidden="true">
              <Media :src="storeAssets.content.cpCategoryBg" class="section__bg-img" />
              <div class="section__bg-scrim" />
            </div>
            <Grid>
              <Span size="content">
                <div class="section__content">
                  <CategoryBanner
                    :background-image="CP_BANNER"
                    :icon="CP_COIN_1"
                    :title="strings.page.doubleCurrencyHeading"
                    :countdown-label="common.carousel.eventEndsIn"
                    :description="strings.page.doubleCurrencyDesc"
                  />
                  <BundleGrid>
                    <BundleSkuCard v-bind="bundle"  :base-delay="DELAY_BUNDLE" />
                    <BundleSkuCard v-bind="bundle2" :base-delay="DELAY_BUNDLE + 120" />
                  </BundleGrid>
                </div>
              </Span>
            </Grid>
          </section>

          <!-- Gifts -->
          <section v-if="showSection('gifts')" id="cat-gifts" class="section section--divided">
            <Grid>
              <Span size="content">
                <div class="section__content">
                  <!-- Gifts banner — only renders when a store supplies a
                       giftsBanner background asset (assets.content.
                       giftsBanner); every other store falls back to the
                       plain heading below, unaffected. The action slot holds
                       the PWA install CTA (not installed) or a Web Push
                       opt-in toggle (installed but not yet subscribed — see
                       the pwaInstalledState variant flag), both content-gated
                       so it's COD:M-only today. Once subscribed, the action
                       slot is omitted entirely — nothing left to invite here;
                       the toggle to turn it back off lives only in the nav
                       drawer now (see NavDrawer.vue). -->
                  <CategoryBanner
                    v-if="storeAssets.content.giftsBanner"
                    :background-image="storeAssets.content.giftsBanner"
                    :icon="cpCoinFor(88)"
                    :title="strings.page.giftsHeading"
                    :description="pwaInstalled ? strings.page.webPush?.giftsBannerDesc : strings.page.pwaInstall?.giftsBannerDesc"
                  >
                    <template v-if="pwaInstalled && strings.page.webPush && !webPushSubscribed" #action>
                      <div class="gifts-banner__webpush-wrap">
                        <div class="gifts-banner__webpush-glow" :class="{ 'gifts-banner__webpush-glow--active': webPushJustEnabled }" aria-hidden="true" />
                        <ToggleSwitch
                          :model-value="webPushSubscribed"
                          data-poi="gifts-banner-webpush-toggle"
                          :aria-label="strings.page.webPush.giftsBannerAriaLabel"
                          @update:model-value="toggleWebPush()"
                        />
                      </div>
                    </template>
                    <template v-else-if="!pwaInstalled && strings.page.pwaInstall" #action>
                      <button
                        v-ripple v-haptic
                        type="button"
                        class="gifts-banner__pwa-cta"
                        data-poi="gifts-banner-pwa-cta"
                        @click="openTaskGiftSheet()"
                      >
                        <MaterialIcon name="install_mobile" variant="round" :size="18" />
                        <span class="text-style-utility-default-uppercase">{{ strings.page.pwaInstall.bannerCta }}</span>
                      </button>
                    </template>
                  </CategoryBanner>
                  <h2 v-else class="gifts__heading text-style-heading-banner">{{ strings.page.giftsHeading }}</h2>
                  <GiftGrid :count="gifts.length">
                    <GiftSkuCard
                      v-for="(gift, i) in gifts"
                      :key="i"
                      v-bind="gift"
                      :claimed-label="common.sku.claimedLabel"
                      :base-delay="DELAY_GIFTS + i * 120"
                    />
                  </GiftGrid>
                </div>
              </Span>
            </Grid>
          </section>

          <!-- New Users Promo + CP — boxed variant (config.page.catalogBoxed,
               Codashop only). Bounds both in a single bordered/rounded panel
               matching the Figma "Select Recharge" container (node 2198:6506)
               instead of two separate dividered sections. -->
          <section
            v-if="catalogBoxed && (showSection('new-users') || showSection('cp'))"
            id="cat-new-users"
            class="section section--divided section--tight-top section--tight-bottom"
          >
            <Grid>
              <Span size="content">
                <div class="catalog-card">
                  <!-- Category nav embedded IN the SKU card (config.page.topNav,
                       Codashop only) — a plain in-flow tab row at the top of the
                       bordered panel, not the sticky page-nav-stack used by
                       stores with a flat (unboxed) catalog run. -->
                  <nav v-if="config.page?.topNav" class="catalog-card__nav" aria-label="Categories">
                    <CategoryNav :tabs="categories" :is-mobile="device !== 'none'" mode="scroll" variant="row" level="l2" />
                  </nav>
                  <div v-if="showSection('new-users')" class="section__content">
                    <CategoryBanner
                      :background-image="CP_BANNER"
                      :icon="CP_COIN_1"
                      :title="strings.page.newUsersHeading"
                      :countdown-label="common.carousel.eventEndsIn"
                      :description="strings.page.newUsersDesc"
                      :subtext="strings.page.newUsersSub"
                    />
                    <SkuList
                      :items="promoItems"
                      :cp-icon="CP_ICON"
                      :sku-image="storeAssets.content.skuCodPoint"
                      :layout="skuLayout"
                      :columns="skuColumns"
                      :base-delay="DELAY_PROMO"
                    />
                  </div>
                  <SkuList
                    v-if="showSection('cp')"
                    id="cat-cp"
                    :title="strings.page.currencySection"
                    :items="cpItems"
                    :cp-icon="CP_ICON"
                    :sku-image="storeAssets.content.skuCodPoint"
                    :layout="skuLayout"
                    :columns="skuColumns"
                    :base-delay="DELAY_CP"
                  />
                </div>
              </Span>
            </Grid>
          </section>

          <!-- New Users Promo — default (unboxed) variant, every other store. -->
          <section v-if="!catalogBoxed && showSection('new-users')" id="cat-new-users" class="section section--divided">
            <Grid>
              <Span size="content">
                <div class="section__content">
                  <CategoryBanner
                    :background-image="CP_BANNER"
                    :icon="CP_COIN_1"
                    :title="strings.page.newUsersHeading"
                    :countdown-label="common.carousel.eventEndsIn"
                    :description="strings.page.newUsersDesc"
                    :subtext="strings.page.newUsersSub"
                  />
                  <SkuList
                    :items="promoItems"
                    :cp-icon="CP_ICON"
                    :sku-image="storeAssets.content.skuCodPoint"
                    :layout="skuLayout"
                    :columns="skuColumns"
                    :base-delay="DELAY_PROMO"
                  />
                </div>
              </Span>
            </Grid>
          </section>

          <!-- CP — default (unboxed) variant, every other store. -->
          <section v-if="!catalogBoxed && showSection('cp')" id="cat-cp" class="section section--divided">
            <Grid>
              <Span size="content">
                <SkuList
                  :title="strings.page.currencySection"
                  :items="cpItems"
                  :cp-icon="CP_ICON"
                  :sku-image="storeAssets.content.skuCodPoint"
                  :layout="skuLayout"
                  :columns="skuColumns"
                  :base-delay="DELAY_CP"
                />
              </Span>
            </Grid>
          </section>

          <!-- CP Deals — new-user discount CP (image-led cards) -->
          <section v-if="showSection('cp-img-newuser')" id="cat-cp-img-newuser" class="section section--divided">
            <Grid>
              <Span size="content">
                <div class="section__content">
                  <CategoryBanner
                    :background-image="CP_BANNER"
                    :icon="CP_COIN_1"
                    :title="strings.page.cpDealsHeading"
                    :countdown-label="common.carousel.eventEndsIn"
                    :description="strings.page.cpDealsDesc"
                    :subtext="strings.page.cpDealsSub"
                  />
                  <SkuImageList
                    :items="cpImageNewUser"
                    :base-delay="DELAY_CP_IMG_NEW"
                  />
                </div>
              </Span>
            </Grid>
          </section>

          <!-- Best Sellers (image-led cards) — same SkuImageCard art as
               cpImageRegular below, wide (2-up) cards for more visual
               weight, its own titled section above it. Only renders when a
               store supplies skus.bestSeller (see the bestSellerImage
               computed above). -->
          <section v-if="bestSellerImage && showSection('best-seller-img')" id="cat-best-seller-img" class="section">
            <Grid>
              <Span size="content">
                <SkuImageList
                  :title="strings.page.bestSellerImageSection ?? strings.sku.bestSeller"
                  :items="bestSellerImage"
                  :currency-label="strings.currency.name"
                  wide
                  :base-delay="DELAY_CP_IMG"
                />
              </Span>
            </Grid>
          </section>

          <!-- Buy CP — regular CP (image-led cards). CategoryBanner replaces
               the plain text header when the store supplies banner content
               (config.page.cpImgBanner) — Diablo Immortal; every other
               store omits the flag and keeps SkuImageList's own title/
               description. -->
          <section v-if="showSection('cp-img')" id="cat-cp-img" class="section">
            <Grid>
              <Span size="content">
                <div v-if="config.page?.cpImgBanner" class="section__content">
                  <CategoryBanner
                    :background-image="storeAssets.content.cpImgBannerBg"
                    :icon="storeAssets.content.cpImgBannerIcon"
                    :title="strings.page.cpImageSection"
                    :description="strings.page.cpImageSectionDesc"
                  />
                  <SkuImageList :items="cpImageRegular" :currency-label="strings.currency.name" :base-delay="DELAY_CP_IMG" />
                </div>
                <SkuImageList
                  v-else
                  :title="strings.page.cpImageSection"
                  :description="strings.page.cpImageSectionDesc"
                  :items="cpImageRegular"
                  :base-delay="DELAY_CP_IMG"
                />
              </Span>
            </Grid>
          </section>

          <!-- Regular items — web-exclusive Crystal Pack deals (image-led).
               Renders only for a store that ships skus.regular (e.g. YGO:DL). -->
          <section v-if="regularImageItems && showSection('regular')" id="cat-regular" class="section section--divided">
            <Grid>
              <Span size="content">
                <SkuImageList
                  :title="strings.page.regularHeading"
                  :currency-label="strings.currency.name"
                  :items="regularImageItems"
                  :base-delay="DELAY_CP_IMG"
                />
              </Span>
            </Grid>
          </section>

          <!-- Limited items — Starter Set bundles with purchase limit + countdown. -->
          <section v-if="limitedBundles && showSection('limited')" id="cat-limited" class="section section--divided">
            <Grid>
              <Span size="content">
                <div class="section__content">
                  <h2 class="gifts__heading text-style-heading-banner">{{ strings.page.limitedHeading }}</h2>
                  <BundleGrid>
                    <BundleSkuCard
                      v-for="(b, i) in limitedBundles"
                      :key="b.id"
                      v-bind="b"
                      :base-delay="DELAY_BUNDLE + i * 120"
                    />
                  </BundleGrid>
                </div>
              </Span>
            </Grid>
          </section>

          <!-- Free Rewards — weekly free gift (self-wires the claim sheet). -->
          <section v-if="rewardGifts && showSection('free-rewards')" id="cat-free-rewards" class="section">
            <Grid>
              <Span size="content">
                <div class="section__content">
                  <h2 class="gifts__heading text-style-heading-banner">{{ strings.page.giftsHeading }}</h2>
                  <GiftGrid :count="rewardGifts.length">
                    <GiftSkuCard
                      v-for="(gift, i) in rewardGifts"
                      :key="gift.id"
                      v-bind="gift"
                      :claimed-label="common.sku.claimedLabel"
                      :base-delay="DELAY_GIFTS + i * 120"
                    />
                  </GiftGrid>
                </div>
              </Span>
            </Grid>
          </section>

          </div>

        </template>

        <!-- ── Filter model sections (FCM: category hide/show catalogue) ──── -->
        <template v-else>
        <!-- SKU listings — best-seller hero, featured carousel, category nav
             (CatalogNavStack), milestone rewards, and the category-catalogue
             loops below, all unchanged in position/order. The bordered parent
             container is scoped to isProdCards, same gate as the split layout
             itself (isSplit) — previewing the new SKU card designs renders
             this as a bare, unstyled div (single column, no panel), matching
             every other non-split store. -->
        <div :class="{ 'storefront__sku-listings': isProdCards }">
          <!-- Best Seller — standalone hero card (FCM, Daily Booster D demo).
               Gated per store: filter-mode stores that don't merchandise a
               best-seller hero (e.g. Rogue Trader's edition catalogue) opt out.
               Multi-level nav: Store-only merchandising (see isStoreIntentActive).
               fcmSkuCardModel: swaps to the production highlighted-SKU card —
               a hardcoded-data hero like BestSellerCard, so a plain v-if/v-else
               here; it never touches CategoryCatalog's cardType/cardVariant path. -->
          <section v-if="config.catalog.featuredHero && isStoreIntentActive" class="section section--divided">
            <Grid>
              <Span size="content">
                <ProdHighlightedSkuCard
                  v-if="isProdCards"
                  v-bind="fcmBestSeller"
                  :base-delay="DELAY_BESTSELLER"
                />
                <BestSellerCard
                  v-else
                  v-bind="fcmBestSeller"
                  :base-delay="DELAY_BESTSELLER"
                />
              </Span>
            </Grid>
          </section>

          <!-- Best sellers — always visible regardless of active category tab
               (but, in multi-level mode, only under the Store intent).
               fcmSkuCardModel 'prod': prod's design has no separate "Best
               sellers" recommendations carousel — only the single highlighted
               hero above — so this section doesn't render at all under the
               flag. -->
          <Grid v-if="featuredItems?.length && isStoreIntentActive && !isProdCards">
            <Span size="content">
              <FeaturedCarousel
                :items="featuredItems"
                :heading="common.carousel.bestSellers"
                :base-delay="100"
              />
            </Span>
          </Grid>

          <!-- L2/L3 surface (multi-level nav pilot) — sits right after Best
               Sellers (which is deliberately NOT part of this nav), not at
               the very top. `position: sticky` (see CatalogNavStack.vue): it
               renders in its own normal in-flow spot here and only docks
               (sticks to the top, below NavBar) once the user scrolls past
               that natural position — undocking again when scrolled back
               above it — same dock/undock behaviour the legacy top
               subcategory bar had, just via native sticky instead of a
               scroll-spied show/hide transition.
               Store-only, same as the Best Seller hero/carousel above
               (isStoreIntentActive): Loyalty & Rewards and Events are each a
               single stub category with a single "coming soon" subcategory
               (see intents.js), so a category/subcategory nav has nothing
               real to switch between — showing one dead L2 tab is worse than
               no nav at all. Applies across every presentation (stacked/
               dropdown/flat) since they all share this one mount point.
               Wrapped in a Transition so switching L1 intents (Store ↔
               Milestone Rewards/Events) — which mounts/unmounts this L2/L3
               surface via isStoreIntentActive above — animates rather than
               popping instantly; see CatalogNavStack.vue for the enter/leave
               classes (mirrors the slide+fade the legacy top subcategory bar
               uses for its own show/hide, App.vue's "subcat-nav" Transition). -->
          <Transition name="nav-stack">
            <CatalogNavStack
              v-if="isMultiLevel && !historyOpen && isStoreIntentActive"
              :categories="activeCategories"
              presentation="flat"
              :is-mobile="device !== 'none'"
              :mode="isFilter ? 'filter' : 'scroll'"
              :active-category-id="isFilter ? activeCat : undefined"
              :active-subcategory-id="isFilter ? activeSub : undefined"
              @select="onFlatNavSelect"
            />
          </Transition>

          <div ref="catalogAnchorRef" aria-hidden="true" />

          <!-- "Milestone Rewards" intent — real campaign content (TOTY 26
               Loyalty Rewards) instead of the intent's own "coming soon" stub
               categories (see intents.js). Bypasses the activeCategories
               v-for below entirely; CatalogNavStack/story/best-seller already
               hide for non-store intents via isStoreIntentActive above. -->
          <section
            v-if="isMultiLevel && activeIntentData?.id === 'rewards' && milestone"
            id="cat-rewards"
            class="section section--divided"
          >
            <MilestoneRewards :data="milestone" @go-to-store="activeIntent = 'store'" />
          </section>

          <!-- Multi-level nav: every category (and its subcategories) renders on
               the page at once, for discoverability by scroll — no filtering.
               Each gets a `cat-{id}` anchor (CatalogNavStack's L2 scroll target);
               the gifts special case (click-intercepted BundleSkuCards routing to
               the claim sheet) still needs handling per-category since
               CategoryCatalog has no generic notion of it. -->
          <template v-if="isMultiLevel && !isFilter && activeIntentData?.id !== 'rewards'">
            <section
              v-for="cat in activeCategories"
              :key="cat.id"
              :id="`cat-${cat.id}`"
              class="section section--divided"
            >
              <template v-if="cat.id === 'gifts'">
                <Grid>
                  <Span size="content">
                    <!-- Also carries the category's own (single) subcategory id, so
                         CatalogNavStack's dropdown option for it has a real scroll
                         target — this branch bypasses CategoryCatalog, which is what
                         normally renders that subcategory-level anchor. -->
                    <div :id="cat.subcategories?.[0]?.id" class="section__content subcat-anchor">
                      <h2 class="gifts__heading text-style-heading-banner">{{ strings.page.giftsHeading }}</h2>
                      <!-- fcmSkuCardModel 'prod': regular SKU card instead of
                           BundleSkuCard (prod has no bundle template — same
                           conversion as CategoryCatalog's TWG branch), CLAIM
                           in place of a price. currentPrice is already the
                           literal string 'Claim' in the catalog data
                           (uppercased by the card's own CSS); the claimed-
                           state swap to 'Claimed' is unchanged either way. -->
                      <div v-if="isProdCards" class="cat-catalog__sku-grid">
                        <div
                          v-for="(item, i) in giftItemsFromCategory(cat)"
                          :key="item.id"
                          class="gift-tile"
                          @click.capture.stop="onFcmGiftTap(item)"
                        >
                          <SkuImageCard
                            :title="item.title"
                            :subtitle="item.subtitle"
                            :current-price="isClaimed(item.id) ? 'Claimed' : item.currentPrice"
                            :loyalty-points="item.loyaltyPoints ?? null"
                            :sku-image="item.skuImage"
                            variant="prod"
                            :base-delay="DELAY_GIFTS + i * 120"
                          />
                        </div>
                      </div>
                      <BundleGrid v-else>
                        <div
                          v-for="(item, i) in giftItemsFromCategory(cat)"
                          :key="item.id"
                          class="gift-tile"
                          @click.capture.stop="onFcmGiftTap(item)"
                        >
                          <BundleSkuCard
                            v-bind="item"
                            :current-price="isClaimed(item.id) ? 'Claimed' : item.currentPrice"
                            :claimed="isClaimed(item.id)"
                            :base-delay="DELAY_GIFTS + i * 120"
                          />
                        </div>
                      </BundleGrid>
                    </div>
                  </Span>
                </Grid>
              </template>
              <CategoryCatalog
                v-else
                :category="cat"
                :base-delay="200"
                :card-variant="isProdCards ? 'prod' : null"
                :categories="activeCategories"
              />
            </section>
          </template>

          <!-- Filtered L2 (config.catalog.mode: 'filter'): only the active
               category renders; switching tabs swaps this content instead of
               scrolling to it. Independent of isMultiLevel (L1 intents) — a
               store can run real L1 intent tabs (Store/Milestone Rewards/
               Events) while still filtering L2 categories one at a time
               within the Store intent, same as it always could before the
               multi-level pilot; the two are separate filters over separate
               levels of the catalogue tree.
               v-else-if (not v-else) — must exclude the rewards intent, same
               as the sibling template above, so a plain v-else doesn't
               duplicate the "coming soon" CategoryCatalog outside the
               #cat-rewards section when isMultiLevel is true and rewards is
               active but has no real milestone data yet. -->
          <template v-else-if="isFilter && activeIntentData?.id !== 'rewards'">
            <!-- Gifts tab — BundleSkuCards from catalog; click interception routes
                 taps to the gift claim sheet instead of checkout.
                 fcmSkuCardModel 'prod': same regular-SKU-card conversion as
                 the multi-level branch above. -->
            <section v-if="activeCat === 'gifts'" class="section section--divided">
              <Grid>
                <Span size="content">
                  <div class="section__content">
                    <h2 class="gifts__heading text-style-heading-banner">{{ strings.page.giftsHeading }}</h2>
                    <div v-if="isProdCards" class="cat-catalog__sku-grid">
                      <div
                        v-for="(item, i) in fcmGiftItems"
                        :key="item.id"
                        class="gift-tile"
                        @click.capture.stop="onFcmGiftTap(item)"
                      >
                        <SkuImageCard
                          :title="item.title"
                          :subtitle="item.subtitle"
                          :current-price="isClaimed(item.id) ? 'Claimed' : item.currentPrice"
                          :loyalty-points="item.loyaltyPoints ?? null"
                          :sku-image="item.skuImage"
                          variant="prod"
                          :base-delay="DELAY_GIFTS + i * 120"
                        />
                      </div>
                    </div>
                    <BundleGrid v-else>
                      <div
                        v-for="(item, i) in fcmGiftItems"
                        :key="item.id"
                        class="gift-tile"
                        @click.capture.stop="onFcmGiftTap(item)"
                      >
                        <BundleSkuCard
                          v-bind="item"
                          :current-price="isClaimed(item.id) ? 'Claimed' : item.currentPrice"
                          :claimed="isClaimed(item.id)"
                          :base-delay="DELAY_GIFTS + i * 120"
                        />
                      </div>
                    </BundleGrid>
                  </div>
                </Span>
              </Grid>
              <Grid
                v-if="showCategoryJumpNav && isStoreIntentActive"
                class="gifts__jump-nav-grid"
                :class="{ 'gifts__jump-nav-grid--prod': isProdCards }"
              >
                <Span size="content">
                  <CategoryJumpNav
                    :categories="isSubFiltered ? flatSubcategories : categories"
                    current-id="gifts"
                    mode="filter"
                    @select="isSubFiltered ? onSubcategoryDropdownSelect($event) : onCategorySelect($event)"
                  />
                </Span>
              </Grid>
            </section>

            <!-- All other catalog tabs. isSubFiltered (FCM): the dropdown
                 lists flatSubcategories (matches CatalogNavStack's flat row)
                 and only activeSub's own subcategory renders; picking one
                 reuses onFlatNavSelect via the resolver below, since it may
                 belong to a different category. Otherwise (a plain filter-
                 mode store with no flat nav): unchanged — categories list,
                 whole active category renders, picking one is a category
                 switch (onCategorySelect). -->
            <CategoryCatalog
              v-else-if="activeCatData"
              :category="activeCatData"
              :base-delay="200"
              :card-variant="isProdCards ? 'prod' : null"
              :categories="isStoreIntentActive ? (isSubFiltered ? flatSubcategories : categories) : []"
              :active-subcategory-id="isSubFiltered ? activeSub : null"
              @select-category="isSubFiltered ? onSubcategoryDropdownSelect($event) : onCategorySelect($event)"
            />
          </template>
        </div>
        </template>

        <!-- Lightweight L1 tab pilot (COD:M) — Milestone Rewards content in
             place of the bespoke page-mode sections above (see the !isFilter
             template near the top of this branch). Reuses the same
             MilestoneRewards.vue FCM's own rewards intent mounts higher up in
             this filter-mode branch; see showMilestoneTab/activeSection. -->
        <section
          v-if="!isFilter && showMilestoneTab && activeSection === 'rewards' && milestone"
          id="cat-rewards"
          class="section section--divided"
        >
          <MilestoneRewards :data="milestone" @go-to-store="activeSection = 'store'" />
        </section>

        <!-- Inline checkout, steps 2-4 — "Select Payment" / "Zip Code" /
             "Enter Details" (config.checkout.mode === 'inline', Codashop
             only). Stacked below the SKU sections, matching the Figma
             reference's page order. -->
        <template v-if="isInlineCheckout">
          <section id="step-payment" class="section section--divided section--tight-top section--tight-bottom">
            <Grid>
              <Span size="content">
                <StepPayment />
              </Span>
            </Grid>
          </section>
          <!-- Zip Code step — config.checkout.zipCodeStep: false skips it entirely
               (e.g. Diablo Immortal's flow has no Zip Code step). Default (absent)
               keeps every existing inline-checkout store's behaviour unchanged. -->
          <section v-if="config.checkout.zipCodeStep !== false" class="section section--divided section--tight-top section--tight-bottom">
            <Grid>
              <Span size="content">
                <StepZipCode />
              </Span>
            </Grid>
          </section>
          <section class="section section--tight-top">
            <Grid>
              <Span size="content">
                <StepDetails />
              </Span>
            </Grid>
          </section>
        </template>

        <!-- Wraps the SEO value-prop / download-banner / FAQ sections so
             their doc order can be swapped per store via CSS `order`
             (config.content.downloadBannerFirst) without duplicating any of
             their markup. Purely a flex context for that purpose — a single
             column, so it changes nothing else about their layout. Default
             (flag absent) keeps every other store's existing order: value
             prop + FAQ adjacent (no divider between them), then the download
             banner. COD:M instead sits the download banner between the two,
             so its divider moves accordingly (see the :class bindings below). -->
        <div class="seo-download-group">
        <!-- SEO value prop — heading/body/benefit grid (strings.page.seo).
             Renders purely off that object's presence; absent for every store
             before Diablo Immortal, so this section never mounts elsewhere.
             The FAQ accordion is a separate section below (still the same
             strings.page.seo.faq data) so it can independently reorder. -->
        <section
          v-if="strings.page.seo"
          class="section section--seo"
          :class="{ 'section--divided': config.content?.downloadBannerFirst }"
          :style="[storeAssets.content.seoTile ? { '--seo-bg-tile': `url(${storeAssets.content.seoTile})` } : {}, { order: 1 }]"
        >
          <!-- Optional full-bleed tiled backdrop (behind the whole section, not
               just the copy block) — same section__bg layer other categories use
               for a cover photo, but repeating instead of object-fit: cover. -->
          <div v-if="storeAssets.content.seoTile" class="section__bg section__bg--tile" aria-hidden="true">
            <div class="section__bg-scrim section__bg-scrim--light" />
          </div>
          <Grid>
            <!-- content (8-of-12 cols, 960px cap) — same span every other
                 section on the page uses (SKU grid, UID/details, download
                 banner, etc.), rather than fluid (full grid width). The
                 heading/body stay their own readable measure regardless
                 (44ch/90ch, set directly on them below) instead of reading
                 as an outlier width. Same span for every store this section
                 renders for (ZZZ, Diablo Immortal — see the v-if above)
                 since App.vue is their shared template. -->
            <Span size="content">
              <div class="seo-content">
                <h2 class="seo-content__heading text-style-heading-page-title">{{ strings.page.seo.heading }}</h2>
                <div class="seo-content__body text-style-paragraph-regular" v-html="strings.page.seo.body"></div>

                <!-- "Why top up here" benefit grid — renders purely off
                     strings.page.seo.benefits' presence, same content-gate
                     precedent as the rest of this section. -->
                <div v-if="strings.page.seo.benefits?.length" class="seo-benefits">
                  <h3 class="seo-benefits__heading text-style-heading-section">{{ strings.page.seo.benefitsHeading }}</h3>
                  <p v-if="strings.page.seo.benefitsDesc" class="seo-benefits__desc text-style-paragraph-regular">{{ strings.page.seo.benefitsDesc }}</p>
                  <div class="seo-benefits__grid">
                    <div v-for="b in strings.page.seo.benefits" :key="b.title" class="seo-benefit">
                      <div class="seo-benefit__icon">
                        <MaterialIcon :name="b.icon" variant="round" :size="28" />
                      </div>
                      <div class="seo-benefit__body">
                        <h4 class="seo-benefit__title text-style-heading-card">{{ b.title }}</h4>
                        <p class="seo-benefit__desc text-style-paragraph-small">{{ b.desc }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- App Store / Google Play badges — normally live inside the
                     DownloadBanner box below (hideBadges left off there), but
                     config.content.badgesAboveValueProps moves them here
                     instead, right after the value-prop grid and above the
                     banner (COD:M only; every other store keeps the default
                     in-banner placement). -->
                <StoreBadges
                  v-if="config.content?.badgesAboveValueProps"
                  :app-store-label="strings.page.download?.appStoreLabel"
                  :app-store-url="strings.page.download?.appStoreUrl"
                  :app-store-badge-img="storeAssets.content.appStoreBadge"
                  :google-play-label="strings.page.download?.googlePlayLabel"
                  :google-play-url="strings.page.download?.googlePlayUrl"
                  :google-play-badge-img="storeAssets.content.googlePlayBadge"
                />
              </div>
            </Span>
          </Grid>
        </section>

        <!-- Download banner (app store / play store) — strings.page.download.
             A real containerized banner: background art + heading/body +
             badges all inside ONE box (badges no longer a separate far-away
             row). Same width as every other content section (Span
             size="content") — not full-bleed, and not an arbitrary half
             width either. Badge images are optional (assets.content.
             appStoreBadge / googlePlayBadge); a text pill stands in until
             the real SVGs land. -->
        <section v-if="strings.page.download && !webPushSubscribed" id="download-banner" data-component="download-banner" class="section section--divided" :style="{ order: config.content?.downloadBannerFirst ? 2 : 3 }">
          <Grid>
            <Span size="content">
              <!-- PWA install / Web Push upsell CTA — not installed: opens
                   TaskGiftSheet, THE merged install/notify sheet (see its own
                   doc — `variant` branches iOS/webview/Android there, not per
                   call site). Installed but not subscribed: swaps to a Web
                   Push opt-in CTA (see useWebPush.js). Once subscribed, the
                   whole section is hidden by the outer v-if above — nothing
                   left to invite here. -->
              <DownloadBanner
                :heading="strings.page.download.heading"
                :body="strings.page.download.body"
                :bg-image="storeAssets.content.downloadBannerBg"
                :hide-badges="!!config.content?.badgesAboveValueProps"
                :app-store-label="strings.page.download.appStoreLabel"
                :app-store-url="strings.page.download.appStoreUrl"
                :app-store-badge-img="storeAssets.content.appStoreBadge"
                :google-play-label="strings.page.download.googlePlayLabel"
                :google-play-url="strings.page.download.googlePlayUrl"
                :google-play-badge-img="storeAssets.content.googlePlayBadge"
                :pwa-installed="pwaInstalled"
                :pwa-install-body="strings.page.pwaInstall?.body"
                :pwa-install-cta="strings.page.pwaInstall?.cta"
                :web-push-body="strings.page.webPush?.downloadBannerBody"
                :web-push-cta="strings.page.webPush?.downloadBannerCta"
                @pwa-cta-click="openTaskGiftSheet()"
                @webpush-cta-click="toggleWebPush()"
              />
            </Span>
          </Grid>
        </section>

        <!-- FAQ accordion — same strings.page.seo.faq data as before, now its
             own section so it can independently reorder around the download
             banner (see the group comment above). Always divided: something
             always follows it (either the download banner, for every other
             store, or whatever comes after this whole group, for COD:M). -->
        <section
          v-if="strings.page.seo?.faq?.length"
          class="section section--divided section--seo"
          :style="[storeAssets.content.seoTile ? { '--seo-bg-tile': `url(${storeAssets.content.seoTile})` } : {}, { order: config.content?.downloadBannerFirst ? 3 : 2 }]"
        >
          <div v-if="storeAssets.content.seoTile" class="section__bg section__bg--tile" aria-hidden="true">
            <div class="section__bg-scrim section__bg-scrim--light" />
          </div>
          <Grid>
            <Span size="content">
              <HomeFaq :faq="strings.page.seo.faq" layout="grid" />
            </Span>
          </Grid>
        </section>
        </div>

        <!-- Bottom clearance so the sticky CategoryNav never covers the last
             section. Multi-level nav mounts no bottom bar (CatalogNavStack
             docks at the TOP instead) — collapse the reserved space so
             nothing dead is left below. config.checkout.stepCta stores
             (Diablo Immortal) have no CategoryNav and dock the guided-
             checkout bar / Buy Now widget instead — those are fixed/absolute
             overlays that don't push page content, so no reserved gap is
             needed there either. -->
        <div
          v-if="!isMultiLevel && !config.checkout.stepCta"
          class="app__nav-gap"
          aria-hidden="true"
        ></div>

        </div><!-- /.storefront__col--main -->
        </div><!-- /.storefront -->

        </template>

        <!-- Order Complete — full-page view (replaces the storefront) -->
        <OrderCompletePage v-else-if="orderCompleteOpen" @close="router.push('/')" />

        <!-- Transaction History — full-page view (replaces the storefront) -->
        <TransactionHistoryPage v-else @back="router.push('/')" />

        <!-- Global bottom chrome — visible on both the storefront and Transaction History. -->
        <Footer />
      </DeviceFrame>
    </div>
    </template>

    <!-- Element inspector (@coda/inspect-kit) — full-window capture + token/CSS/motion
         panel. Mounted at the app root (not the device #overlay slot) so its fixed UI
         isn't trapped by the device-frame transform. Hidden in store-locked builds. -->
    <InspectorLayer v-if="!isStoreLocked" :device="device" />

    <!-- Collaborator comment layer (@coda/comment-kit) — pins + threads anchored
         to store elements. Mounted at the app root (like the inspector) so its
         fixed pins/panels aren't trapped by the device-frame transform. Enabled
         on Vercel/PROD + local opt-in (NOT gated on store-lock) so it works on
         review builds. Kit config lives in main.js. -->
    <CommentLayer v-if="commentsEnabled" :device="device" />

    <!-- Component library viewer (dev chrome) — full-screen overlay below the
         inspector so its spec panel can float on top. Hidden in store-locked builds. -->
    <component :is="LibraryViewer" v-if="!isStoreLocked" />

    <!-- /handoff surface (dev chrome) — real child URL, see useHandoff.js.
         Hidden in store-locked builds. -->
    <component :is="HandoffApp" v-if="!isStoreLocked" />

    <!-- /tokens usage dashboard (dev chrome) — real child URL, see
         useTokenAudit.js. Hidden in store-locked builds. -->
    <component :is="TokenAuditApp" v-if="!isStoreLocked" />

    <!-- Tour Guide interactive walkthrough & video recorder (@coda/tourguide-kit) -->
    <TourGuideLayer />
    <TourGuideModal />
  </div>
</template>

<style scoped>
.app {
  min-height: 100dvh;
  background: var(--x-bg-page);
}

.app__stage {
  width: 100%;
}

.app__stage--framed {
  display: flex;
  justify-content: center;
  padding: 24px 16px 48px;
}

.section {
  padding-top: var(--x-pad-surface-l);
  padding-bottom: var(--x-pad-surface-xl);
  /* The NavBar no longer docks, so a tab-scrolled section only needs to clear
     the safe area (notch) at the top of the screen. --nav-stack-h is 0/unset
     everywhere except multi-level nav mode (the only case where a bar is
     docked persistently at the top of a scrolling page of sections like
     this one) — CatalogNavStack publishes its real height there so a
     category's `cat-{id}` section clears the docked bar instead of
     surfacing directly underneath it. */
  scroll-margin-top: calc(var(--safe-top, 0px) + var(--nav-stack-h, 0px));
}

/* Reserves room below the last section for the sticky bottom CategoryNav */
.app__nav-gap {
  height: 64px;
}

/* Marks an element that doubles as a subcategory-level scroll target outside
   CategoryCatalog (the gifts category's inner content div; the Best Sellers
   hero's Span — see the multi-level template branches above) — needs the same
   docked-bar clearance as .cat-catalog__section's own subcategory anchors. */
.subcat-anchor {
  scroll-margin-top: calc(var(--safe-top, 0px) + var(--nav-stack-h, 0px));
}

/* Two-column split shell (config.page.layout === 'split', e.g. Codashop).
   `display: contents` is the unconditional default for every store — the
   wrapper divs contribute no box and no layout until --split is active, so
   this is a complete no-op everywhere else. Below 801px the split always
   collapses to a single column regardless of --split, since these rules
   only exist inside the container query. */
.storefront,
.storefront__col {
  display: contents;
}

/* Trust bar section (Codashop, config.trustBar) — at S and smaller, the split
   has collapsed (.storefront__col is `display: contents`) so this section
   gets no side inset from the split shell's own grid margin; add it here,
   outside TrustBar.vue itself, so the component stays layout-agnostic. At
   M/L the lead column already sits inside .storefront--split's margin below,
   so this padding is removed there to avoid doubling it. */
.trust-bar-section {
  padding-left: var(--x-gap-grid-margin);
  padding-right: var(--x-gap-grid-margin);
}

@container (min-width: 801px) {
  .trust-bar-section {
    padding-left: 0;
    padding-right: 0;
  }

  /* Below 801px .storefront__col is `display: contents` so this panel sits
     directly in the page flow with no inherited inset — margin-left/right
     above gives it the same side gutter as the Player Profile card (Grid/
     Span's own margin). At M/L the split shell's own padding-left/right on
     .storefront--split already provides that inset, so remove this one to
     avoid doubling it. */
  .storefront__sku-listings {
    margin-left: 0;
    margin-right: 0;
  }

  .storefront--split {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--x-gap-grid-gutter-m);
    padding-left: var(--x-gap-grid-margin);
    padding-right: var(--x-gap-grid-margin);
    align-items: start;
  }
  .storefront--split .storefront__col {
    display: flex;
    flex-direction: column;
  }
  .storefront--split .storefront__col--lead {
    grid-column: 1 / 5;
    position: sticky;
    top: var(--safe-top, 0px);
  }
  .storefront--split .storefront__col--main {
    grid-column: 5 / 13;
  }
}

@container (min-width: 1280px) {
  .storefront--split {
    column-gap: var(--x-gap-grid-gutter-l);
    padding-left: var(--x-gap-grid-margin-l);
    padding-right: var(--x-gap-grid-margin-l);
    max-width: 1280px;
    margin-left: auto;
    margin-right: auto;
  }
}

/* SKU listings panel (FCM) — bordered container wrapping the category nav +
   catalogue as one boxed unit. Frosted-glass recipe (material-fx skill:
   Glass/frosted), not the opaque card-default fill: this is a large panel
   sitting over the page's own art, so it gets the same translucent fill +
   backdrop blur + weak Fresnel hairline border as every other frosted
   surface at this scale (BaseSheet, CatalogNavStack's own .nav-stack,
   the promo-code modal) — --x-bg-sheet (L2, ~8% alpha) is dim/broad, and
   --x-border-sheet (L3, oklch(1 0 0 / 0.16)) is a subtle neutral highlight
   at the pane's edge rather than a solid card-stroke. --x-bg-page under the
   blur is the deterministic opaque tint floor (css-ceiling.md) so content
   stays legible regardless of what's scrolling behind it. */
.storefront__sku-listings {
  margin-left: var(--x-gap-grid-margin);
  margin-right: var(--x-gap-grid-margin);
  padding: var(--x-pad-surface-l) var(--x-pad-surface-s);
  margin-bottom: var(--x-pad-surface-xl);
  background-image: var(--x-bg-sheet);
  background-color: var(--x-bg-page);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
  border: var(--border-weight-default) solid var(--x-border-sheet);
  border-radius: var(--x-radius-container-m);
}
/* Category nav (CatalogNavStack) — full bleed to the panel's own edges,
   cancelling the panel's side padding, instead of sitting inset with the
   rest of the listings. */
.storefront__sku-listings :deep(.nav-stack) {
  margin-left: calc(-1 * var(--x-pad-surface-s));
  margin-right: calc(-1 * var(--x-pad-surface-s));
}

/* Gift tiles — the click-interception wrapper div around each gift's card
   (BundleSkuCard/SkuImageCard) is the actual BundleGrid/.cat-catalog__sku-grid
   item, so it's what the grid's default align-items:stretch resizes to match
   the tallest card in the row — but the card inside stays content-sized
   unless it also stretches to fill that box, so shorter-content cards read
   shorter. flex + flex:1 on the card makes it fill the wrapper's full height. */
.gift-tile {
  display: flex;
}
.gift-tile > * {
  flex: 1;
}

/* Separator between sections (Figma grid border) */
.section--divided {
  border-bottom: var(--border-weight-default) solid var(--x-border-divider);
}

/* Remove dividers on M and L — wider layouts use whitespace for separation */
@container (min-width: 801px) {
  .section--divided,
  .section--carousel {
    border-bottom: none;
  }
}

/* First section (story hero) sits flush under the sticky NavBar — no top gap,
   no top border so the carousel image meets the navbar bottom edge directly. */
.section--flush-top {
  padding-top: 0;
  border-top: none;
}

/* Codashop only — "back to Codashop" affordance atop the MLBB product page
   (title detail). Small, text-first, Fitts-friendly tap target; mirrors the
   navbar logo's own click target for the same action. */
/* Tight, responsive rhythm between Codashop's inline-checkout steps (compact
   hero → trust bar → gamer ID → SKU catalog → payment → zip code → details),
   overriding the default .section gap (16px top + 24px bottom, ~40px between
   two sections). Rather than relying on two default paddings summing to a
   specific value, the preceding section's bottom is zeroed and the following
   section's top carries the full gap — deterministic regardless of any
   future change to the default .section padding tokens. 12px (S and
   smaller) / 24px (M and up), per --x-gap-section-default/-separation — the
   section-tier gap tokens, not the content-tier ones, since this is spacing
   between whole step sections, not between elements within one. */
.section--tight-bottom {
  padding-bottom: 0;
}
.section--tight-top {
  padding-top: var(--x-gap-section-default);
}
@container (min-width: 801px) {
  .section--tight-top {
    padding-top: var(--x-gap-section-separation);
  }
}

/* Carousel section — subtle dark field + divider (matches the Figma Category bg) */
.section--carousel {
  background: var(--x-field-dark);
  border-bottom: var(--border-weight-default) solid var(--x-border-divider);
}

.section__content {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  width: 100%;
}

/* Catalog "card" (config.page.catalogBoxed, Codashop only) — bounds the New
   Users Promo banner + CP SKU grid in one bordered/rounded panel, matching
   the Figma "Select Recharge" container (node 2198:6506) instead of the
   default unboxed sections. */
.catalog-card {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  width: 100%;
  background: var(--x-bg-card-default);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  border-radius: var(--x-radius-container-l);
  padding: var(--x-pad-surface-l);
}

/* Category nav embedded in the catalog card (config.page.topNav, catalogBoxed
   stores) — a plain in-flow tab row, not sticky (unlike .page-nav-stack): the
   card scrolls as one unit, so there's no separate dock/undock behaviour to
   give it. Negative margin bleeds it to the card's own edges so its border
   spans the full width despite the card's padding. */
.catalog-card__nav {
  margin: calc(var(--x-pad-surface-l) * -1) calc(var(--x-pad-surface-l) * -1) 0;
  padding: 0 var(--x-pad-surface-l);
  border-bottom: var(--border-weight-default) solid var(--x-border-sheet);
}

/* Gifts section heading — mirrors SkuList's title treatment */
.gifts__heading {
  margin: 0;
  display: block;
  text-transform: uppercase;
  color: var(--x-text-header-default);
}

/* End-of-category jump-nav gap for the Gifts tab — same rule as
   CategoryCatalog.vue's .cat-catalog__jump-nav-grid (scoped styles don't
   cross component boundaries, so it's redeclared here). */
.gifts__jump-nav-grid {
  padding-bottom: var(--x-pad-surface-xxl);
}
.gifts__jump-nav-grid--prod {
  padding-bottom: var(--x-pad-surface-xl);
}

/* fcmSkuCardModel 'prod' gifts grid — identical rule to CategoryCatalog.vue's
   own .cat-catalog__sku-grid (scoped styles don't cross component boundaries,
   so it has to be redeclared here rather than shared). SkuImageCard's 'prod'
   variant is a smaller/denser card than BundleSkuCard, so this deliberately
   does NOT reuse BundleGrid's 1-2-col layout. */
.cat-catalog__sku-grid {
  display: grid;
  gap: var(--x-gap-content-default);
  grid-template-columns: repeat(2, 1fr);
  padding-block: var(--x-motion-sys-distance-sm);
}
@container (min-width: 641px) {
  .cat-catalog__sku-grid { grid-template-columns: repeat(4, 1fr); }
}

/* Bundle category — anchors the optional full-bleed backdrop layer */
.section--bundle {
  position: relative;
}
.section__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.section__bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.section__bg-scrim {
  position: absolute;
  inset: 0;
  background: var(--x-scrim-banner-strong);
}
/* Keep the grid content above the backdrop.
   NOT `> :global(.ce-grid)` — Vue's scoped CSS already reaches a directly-
   rendered child's root element (Grid's own `.ce-grid` div gets App's scope
   attribute as a fallthrough, same as any other child-root styling), so
   `:global()` here was both unnecessary AND actively wrong: combined with
   the `>` combinator, it compiled to a bare, UNSCOPED `.ce-grid { position:
   relative; z-index: 1; }` — applying to every Grid on the entire page, not
   just this section's. Since z-index only resolves relative to same-level
   siblings, that leaked rule silently won or lost stacking fights against
   any OTHER later-DOM-order Grid on the page sharing that same z-index: 1
   (e.g. it's what was letting the footer's own Grid paint over a dropdown
   panel opened earlier on the page, however high that panel's own z-index). */
.section--bundle > .ce-grid {
  position: relative;
  z-index: 1;
}

/* ── Top category nav for the 'page' model (config.page.topNav) ──────────
   Mounted in NORMAL document flow (see the template comment) — a plain
   sibling wrapper, NOT the DeviceFrame #overlay layer. `position: sticky`
   gives the dock/undock behaviour: sits at its natural in-flow position
   until the page scrolls past it, then sticks at `top: var(--navbar-h)` —
   same var/transition/reasoning as CategoryNav's `variant="top"` and
   CatalogNavStack's own `.nav-stack`. Bounded by this wrapper's own box, so
   it releases the instant the wrapper (nav + the section after it) ends. */
.page-nav-stack {
  position: sticky;
  top: max(var(--navbar-h, 0px), var(--safe-top, 0px));
  z-index: 10;
  transition: top var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
  border-bottom: var(--border-weight-default) solid var(--x-border-sheet);
  border-bottom-left-radius: var(--x-radius-container-xs);
  border-bottom-right-radius: var(--x-radius-container-xs);
  background-image: var(--x-bg-sheet);
  background-color: var(--x-bg-page);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
}
/* Responsive (no device frame): sticks below the fixed DeviceToolbar too —
   --safe-top is unset in responsive mode, so the max() here is a no-op,
   kept only for symmetry with the framed rule above. */
.page-nav-stack--responsive {
  top: max(calc(var(--toolbar-h, 0px) + var(--navbar-h, 0px)), var(--safe-top, 0px));
}

/* Flex context purely so the SEO/download-banner sections can swap `order`
   per store (config.content.downloadBannerFirst) — single column, so it
   doesn't otherwise change their stacked-block layout. */
.seo-download-group {
  display: flex;
  flex-direction: column;
}

/* ── SEO content (strings.page.seo) ─────────────────────────────────────── */
.seo-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-loose);
  text-align: center;
}

/* Full-bleed tiled backdrop for the SEO section (config-supplied texture,
   e.g. Diablo Immortal's leather/mortar tile) — bleeds behind the whole
   section, not just the copy block; reuses the section__bg layer other
   categories use for a cover photo. */
.section--seo {
  position: relative;
  /* HomeFaq's card border falls back to transparent (--x-home-surface-border
     is only ever set by HomeVisual's cinematic hero override) — the SEO FAQ
     is the one other consumer of HomeFaq that actually wants a visible card
     edge, so it gets its own override here rather than changing the shared
     default every other "home" surface component also falls back to. */
  --x-home-surface-border: var(--x-border-card-default);
}
.section__bg--tile {
  background: var(--seo-bg-tile, none) repeat;
}
/* A tiled texture needs a lighter scrim than a photo backdrop — the
   default section__bg-scrim (88% dark) reads as solid black over a subtle
   grain; the CategoryBanner's own overlay strength (72%) still keeps the
   texture visible while legible. */
.section__bg-scrim--light {
  background: var(--x-scrim-strong);
}
/* Same fix as .section--bundle above — plain scoped selector, no :global(). */
.section--seo > .ce-grid {
  position: relative;
  z-index: 1;
}
.seo-content__heading {
  margin: 0;
  color: var(--x-text-header-default);
  max-width: 44ch;
  /* Centred text needs a centred condense transform-origin too — the
     .text-style-* default (left center) squeezes the scaleX from the left
     edge, which visibly drags a centered heading off-center. */
  transform-origin: center center;
}
.seo-content__body {
  margin: 0;
  color: var(--x-text-body-default);
  max-width: 90ch;
  text-align: left;
}
/* Rich HTML body (v-html) — short paragraphs with gaps between them instead
   of one unbroken block; bolded keywords get the header colour so they read
   as scannable emphasis, not just heavier weight of the same soft tone. */
.seo-content__body :deep(p) {
  margin: 0 0 var(--x-gap-content-default) 0;
}
.seo-content__body :deep(p:last-child) {
  margin-bottom: 0;
}
.seo-content__body :deep(strong) {
  color: var(--x-text-header-default);
  font-weight: 700; /* accepted carve-out — see CategoryBanner's identical rule; DS has no standalone weight token */
}

/* "Why top up here" benefit grid — left-aligned (unlike the centered heading/
   body above it), single column on mobile, 2 columns at the M breakpoint. */
.seo-benefits {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  width: 100%;
  text-align: left;
  /* Extra breathing room on top of .seo-content's own flex `gap` — this
     section reads as a distinct block between the intro copy above and the
     FAQ below, not just another paragraph in the stack. */
  margin: var(--x-gap-content-separation) 0;
}
.seo-benefits__heading {
  margin: 0;
  color: var(--x-text-header-default);
}
.seo-benefits__desc {
  margin: 0;
  color: var(--x-text-body-soft);
  max-width: 90ch;
}
.seo-benefits__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--x-gap-content-loose);
  margin-top: var(--x-gap-content-narrow);
}
@container (min-width: 641px) {
  .seo-benefits__grid {
    grid-template-columns: repeat(2, 1fr);
    column-gap: var(--x-gap-content-separation);
  }
}
.seo-benefit {
  display: flex;
  align-items: flex-start;
  gap: var(--x-gap-content-default);
}
.seo-benefit__icon {
  flex-shrink: 0;
  width: var(--x-size-img-xl);
  height: var(--x-size-img-xl);
  border-radius: var(--x-radius-circle);
  background: var(--x-bg-indicator-neutral-subtle);
  color: var(--x-text-header-default);
  display: flex;
  align-items: center;
  justify-content: center;
}
.seo-benefit__body {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
  min-width: 0;
}
.seo-benefit__title {
  margin: 0;
  color: var(--x-text-header-default);
}
.seo-benefit__desc {
  margin: 0;
  color: var(--x-text-body-soft);
}

/* Gifts-banner PWA install CTA — a SECONDARY button (deliberately de-
   emphasised vs. the download banner's primary shimmer CTA): the frosted
   --x-bg-action-secondary fill, no shimmer/glow choreography. Passed into
   CategoryBanner's #action slot (see CategoryBanner.vue's
   .category-banner__action wrapper), so it sits on the banner's right edge
   without CategoryBanner needing any PWA-specific knowledge. */
/* Same recipe as NavBar's .navbar__signin (transparent-outline pill) — see
   NavBar.vue — reused verbatim so this CTA reads as "the same action" as
   the navbar's own sign-in/account affordance, just relocated. */
.gifts-banner__pwa-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-narrow);
  height: var(--x-size-control-s);
  padding: 0 var(--x-pad-surface-m);
  border: var(--border-weight-selected) solid var(--x-border-signin-btn);
  border-radius: var(--x-radius-control-full);
  background: transparent;
  color: var(--x-text-header-default);
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--x-motion-sku-hover), border-color var(--x-motion-sku-hover);
}
.gifts-banner__pwa-cta:hover { background: var(--x-surface-ghost-3); }

/* Web Push toggle's "just turned on" halo — a small pill-shaped glow around
   the control itself (not the whole banner, since CategoryBanner is a shared
   generic component we don't want to grow a one-off overlay prop for a
   single caller). Mirrors ClaimGiftSheet.vue's success-bg-glow recipe.
   Animation longhands — the easing token contains a comma, shorthand is
   banned. */
.gifts-banner__webpush-wrap {
  position: relative;
  border-radius: var(--x-radius-badge-full);
}
.gifts-banner__webpush-glow {
  position: absolute;
  z-index: -1;
  inset: calc(var(--x-pad-surface-xs) * -1);
  border-radius: var(--x-radius-badge-full);
  background: var(--x-bg-indicator-success-default);
  pointer-events: none;
  opacity: 0;
}
.gifts-banner__webpush-glow--active {
  animation-name: gifts-banner-webpush-glow;
  animation-duration: var(--x-motion-sys-duration-slowest);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: forwards;
}
@keyframes gifts-banner-webpush-glow {
  0%   { opacity: 0; }
  15%  { opacity: 0.35; }
  100% { opacity: 0; }
}

/* ── Guided-checkout → Buy Now widget handoff (config.checkout.stepCta) ────
   Slides the outer swap between InlineCheckoutCta and BuyNowBar — both are
   docked to the bottom edge, so entering/leaving along that same edge (not
   a fade) reads as the widget itself arriving/departing. Each component
   also runs its own internal enter/leave (BuyNowBar's isVisible Transition)
   in the same direction, so they compose into one clean motion. */
.guided-cta-enter-active {
  transition: transform var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.guided-cta-leave-active {
  transition: transform var(--x-motion-sys-duration-exit) var(--x-motion-sys-ease-accelerate);
}
.guided-cta-enter-from,
.guided-cta-leave-to {
  transform: translateY(100%);
}
</style>
