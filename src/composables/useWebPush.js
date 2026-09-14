/**
 * useWebPush — Web Push opt-in state for the "post PWA installed" upsell
 * surfaces (Gifts-banner toggle, Order Complete bar, drawer row, carousel
 * slide — see the `pwaInstalledState` variant flag in
 * useFeatureFlags.js and its OR into usePwaInstall's `isInstalled`).
 *
 * `subscribed` is one shared ref every surface binds to, so flipping any one
 * toggle updates them all. `enable()` calls the real
 * `Notification.requestPermission()` — this is a genuine browser permission
 * prompt, not a simulation. The multi-store dev build never registers a
 * service worker (see main.js's `__STORE_LOCKED__` gate), so there is no real
 * `PushManager` subscription behind this — `subscribed` only tracks
 * Notification permission having been granted once, persisted so the demo
 * doesn't re-prompt every reload.
 *
 * Browser permission, once denied, cannot be re-requested from the page —
 * `isBlocked` surfaces that so a caller COULD show a "check your browser
 * settings" hint instead of a dead toggle, but nothing does today: no
 * snackbar fires here on purpose (see the "No confirmation snackbar"
 * paragraph below) — the browser's own permission UI is the only feedback
 * this flow surfaces, blocked or granted.
 *
 * Live tracking: the Permissions API (`navigator.permissions.query({name:
 * 'notifications'})`) returns a PermissionStatus with an `onchange` event,
 * which is the ONLY way to learn a permission changed from OUTSIDE this
 * page (the user flipping it in browser/OS settings while the tab stays
 * open) — `Notification.permission` itself is a plain snapshot with no
 * change event of its own. Wired once, module-level, same "real condition
 * OR a flag" + WIRED-symbol precedent as usePwaInstall.js's beforeinstall-
 * prompt listener, so `permission` (and everything derived from it) never
 * goes stale against the real OS-level state. There is still no way to
 * confirm a message actually reaches the device — that requires a real
 * PushManager subscription + your own server round-trip, which this
 * prototype doesn't have (see the class doc above).
 *
 * `simulateWebPushGranted` dev flag — like usePwaInstall.js's
 * `pwaInstalledState`, this is a direct "real condition OR a flag" override
 * on the exposed `subscribed`, not just a one-time bypass inside enable().
 * Flipping it in the toolbar previews the granted state everywhere
 * INSTANTLY (bell hides, banners/toggles flip on, no click needed) — same
 * expectation `pwaInstalledState` already sets for `isInstalled`. It also
 * still short-circuits enable() itself, for surfaces that call enable()
 * directly (some browsers/sandboxes auto-deny Notification permission with
 * no real prompt ever shown, so there'd be no way to preview the granted
 * state by actually clicking anything either). While the flag is "on",
 * toggling off in the UI can't stick — same one-way-preview trade-off
 * `pwaInstalledState` already has; flip the flag back off to un-preview.
 *
 * `justEnabled` is a shared transient flag every touchpoint can read to play
 * a "just turned on" one-shot confirmation (see ClaimGiftSheet.vue's
 * success-bg-glow for the visual recipe this mirrors) — centralised here
 * rather than duplicated per surface so every mounted touchpoint reacts
 * together off one timer.
 *
 * No confirmation snackbar anywhere in this flow, granted or blocked — the
 * browser's own permission prompt (or its own site-settings UI, once
 * blocked) is the feedback; layering our own toast on top reads as one
 * moving part too many. `justEnabled` below still drives a quieter, ambient
 * confirmation for the granted case.
 *
 * Singleton pinned to globalThis (same rationale as usePwaInstall/useTheme).
 */
import { ref, computed } from 'vue'
import { useFeatureFlags } from './useFeatureFlags.js'

const STATE = Symbol.for('webstore.useWebPush.state')
const STORAGE_KEY = 'webstore:webpush'
const JUST_ENABLED_DURATION = 1800

function readPersisted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function initialPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

const state = globalThis[STATE] ?? (globalThis[STATE] = {
  permission: ref(initialPermission()),
  subscribed: ref(readPersisted()),
  justEnabled: ref(false),
  justEnabledTimer: null,
})

function persist(value) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch { /* storage unavailable — state lives for the session only */ }
}

// Live permission tracking — see the class doc above. navigator.permissions
// may not exist (older Safari) or may reject for the 'notifications' name
// on some engines; either way this degrades to the plain snapshot already
// taken by initialPermission() above, no worse than before this existed.
const WIRED = Symbol.for('webstore.useWebPush.wired')
if (typeof navigator !== 'undefined' && navigator.permissions?.query && !globalThis[WIRED]) {
  globalThis[WIRED] = true
  navigator.permissions.query({ name: 'notifications' })
    .then((status) => {
      status.onchange = () => {
        state.permission.value = Notification.permission
        // The user revoked it at the OS/browser level — reflect that in the
        // in-store toggle too, same "can't stay on if permission isn't
        // granted" rule enable()/disable() already enforce.
        if (Notification.permission !== 'granted' && state.subscribed.value) {
          state.subscribed.value = false
          persist(false)
        }
      }
    })
    .catch(() => { /* unsupported — permission stays a static snapshot */ })
}

export function useWebPush() {
  const { permission, subscribed: rawSubscribed, justEnabled } = state
  const { flagValue } = useFeatureFlags()

  const isSupported = computed(() => permission.value !== 'unsupported')
  const isBlocked = computed(() => permission.value === 'denied')

  // Real toggle state OR'd with the dev flag — see the class doc's
  // `simulateWebPushGranted` section for why this must be a direct override
  // (mirrors usePwaInstall.js's `isInstalled`), not just a bypass inside
  // enable(): every consumer reads this one computed, so flipping the flag
  // in the toolbar previews "granted" everywhere with no click required.
  const subscribed = computed(() => rawSubscribed.value || flagValue('simulateWebPushGranted') === 'on')

  function markSubscribed() {
    rawSubscribed.value = true
    persist(true)
    justEnabled.value = true
    clearTimeout(state.justEnabledTimer)
    state.justEnabledTimer = setTimeout(() => { justEnabled.value = false }, JUST_ENABLED_DURATION)
    // No confirmation snackbar here on purpose — the browser's own
    // permission prompt is already the feedback moment; stacking our own
    // toast on top of that (plus the justEnabled glow every surface already
    // plays) is one moving part too many. `justEnabled` above still drives
    // that quieter, ambient confirmation.
  }

  async function enable() {
    if (flagValue('simulateWebPushGranted') === 'on') {
      permission.value = 'granted'
      markSubscribed()
      return true
    }
    if (!isSupported.value || isBlocked.value) return false
    const result = await Notification.requestPermission()
    permission.value = result
    if (result === 'granted') markSubscribed()
    else {
      rawSubscribed.value = false
      persist(false)
    }
    return subscribed.value
  }

  function disable() {
    // Permission itself can't be revoked from the page — this only turns the
    // in-store opt-in back off; the browser stays "granted" until the user
    // changes it in site settings. (If the dev flag is still "on", the
    // exposed `subscribed` stays true regardless — see the class doc.)
    rawSubscribed.value = false
    persist(false)
  }

  async function toggle() {
    if (subscribed.value) disable()
    else await enable()
  }

  return {
    permission,
    subscribed,
    justEnabled,
    isSupported,
    isBlocked,
    enable,
    disable,
    toggle,
  }
}
