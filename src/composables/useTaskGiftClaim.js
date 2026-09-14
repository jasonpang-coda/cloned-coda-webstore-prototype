/**
 * useTaskGiftClaim — shared singleton for the "enable notifications"
 * task-gated gift (sibling of useGiftClaim). Unlike a normal gift, tapping the
 * card doesn't open an instant-claim sheet — it opens TaskGiftSheet, which
 * walks the user through the prerequisite(s) (usePwaInstall's isInstalled —
 * skipped on Android, since Web Push there doesn't require it — then
 * useWebPush's subscribed) before the claim CTA becomes available.
 *
 * `claimed` is persisted to localStorage (same ad hoc per-feature pattern as
 * useWebPush.js's `subscribed` flag — this repo has no shared persisted-ref
 * utility) so the reward stays claimed across reloads, and is read from both
 * the Gifts-category card and the Order Complete banner so either surface
 * reflects the same state.
 *
 * Singleton pinned to globalThis (same rationale as usePwaInstall/useWebPush).
 */
import { ref, computed } from 'vue'
import { usePwaInstall } from './usePwaInstall.js'
import { useWebPush } from './useWebPush.js'
import { triggerHaptic } from './useHaptics.js'

export const TASK_GIFT_ID = 'gift-task-cp'

const STATE = Symbol.for('webstore.useTaskGiftClaim.state')
const STORAGE_KEY = 'webstore:taskGiftClaimed'

function readPersisted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function persist(value) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch { /* storage unavailable — state lives for the session only */ }
}

const state = globalThis[STATE] ?? (globalThis[STATE] = {
  sheetOpen: ref(false),
  claimed: ref(readPersisted()),
})

export function useTaskGiftClaim() {
  const { sheetOpen, claimed } = state
  const { isInstalled, variant } = usePwaInstall()
  const { subscribed } = useWebPush()

  // 'install' → 'push' → 'claim' → 'claimed', in order — each step only
  // advances once the prior one is satisfied. Android skips 'install'
  // entirely: Chrome/Android decouples Web Push from PWA install (confirmed —
  // subscribe() works from a plain tab), so requiring install there would be
  // an artificial gate. iOS and in-app WebViews both need it — iOS because
  // PushManager only exists for an installed PWA, WebView because it can't
  // reach either capability without first leaving to a real browser.
  const step = computed(() => {
    if (claimed.value) return 'claimed'
    if (variant.value !== 'android' && !isInstalled.value) return 'install'
    if (!subscribed.value) return 'push'
    return 'claim'
  })

  function openSheet() {
    sheetOpen.value = true
  }

  function closeSheet() {
    sheetOpen.value = false
  }

  function claim() {
    if (step.value !== 'claim') return
    claimed.value = true
    persist(true)
    triggerHaptic('success')
  }

  // Debug-only reset (see the `allowGiftUnclaim` feature flag) — resets the
  // claim so the whole install→push→claim flow can be retested without
  // clearing localStorage by hand. Doesn't touch isInstalled/subscribed, so
  // `step` falls back to wherever those two now stand (usually 'claim').
  function unclaim() {
    claimed.value = false
    persist(false)
  }

  return {
    sheetOpen,
    claimed,
    step,
    variant,
    openSheet,
    closeSheet,
    claim,
    unclaim,
  }
}
