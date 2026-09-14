import { ref } from 'vue'
import { closeAllOverlays } from './useCloseAllOverlays.js'
import { scrollToTop } from './useScrollReset.js'

/**
 * useTransactionHistory — shared singleton for the full-page Transaction History
 * view (sibling of useGiftClaim / useCheckout). The signed-in AccountPopover calls
 * openHistory() to switch the storefront out for the page; App.vue reads historyOpen
 * to swap the view and to hide the bottom CategoryNav while it's open.
 *
 * It's a VIEW switch, not an overlay — no scrim, no z-index. The NavBar stays
 * mounted above it. Reached only when signed in (the popover is the only opener),
 * and the popover is reachable in every store regardless of sign-in flow, so the
 * one link serves both COD:M and FCM.
 */
const historyOpen = ref(false)

function openHistory() {
  historyOpen.value = true
  closeAllOverlays()
  scrollToTop({ smooth: false })
}

function closeHistory() {
  historyOpen.value = false
  closeAllOverlays()
  scrollToTop({ smooth: false })
}

export function useTransactionHistory() {
  return { historyOpen, openHistory, closeHistory }
}
