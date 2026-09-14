import { useCheckout } from './useCheckout.js'
import { useAuth } from './useAuth.js'
import { useGiftClaim } from './useGiftClaim.js'
import { useTaskGiftClaim } from './useTaskGiftClaim.js'
import { useItemSummary } from './useItemSummary.js'
import { useLocale } from './useLocale.js'
import { useNavDrawer } from './useNavDrawer.js'

/**
 * closeAllOverlays — dismisses every sheet/popup/modal/drawer the app can
 * have open, regardless of which one, so switching pages (navbar logo,
 * DeviceToolbar's "Pages" dropdown) never leaves one stranded over a view it
 * no longer belongs to. Mirrors App.vue's own comment-mode SURFACES list
 * (the app's one other place that already enumerates every overlay) — keep
 * the two in sync if a new overlay is added.
 *
 * Deliberately does NOT touch useOrderComplete/useTransactionHistory/
 * useCodashopHome — those ARE the pages being switched between, not
 * overlays, and importing them back here would be circular (they call this).
 *
 * Closes VISIBILITY only, never the underlying selection — deliberately
 * closeCheckout() + buyNowVisible=false, NOT dismissBuyNow(), which also
 * clears selectedChannel/selectedKey. Order Complete reads selectedChannel
 * to persist the payment method the user actually picked; wiping it here
 * (dismissBuyNow runs as part of openOrderComplete's own closeAllOverlays
 * call) would erase it before that read ever happens.
 */
export function closeAllOverlays() {
  const checkout = useCheckout()
  checkout.closeCheckout()
  checkout.buyNowVisible.value = false
  const auth = useAuth()
  auth.closeSignInSheet()
  auth.closeAccountMenu()
  auth.cancelSignIn()
  auth.cancelEaSignIn()
  auth.cancelKonamiSignIn()
  useGiftClaim().closeGiftClaim()
  useTaskGiftClaim().closeSheet()
  useItemSummary().closeItemSummary()
  const locale = useLocale()
  locale.closeRegionSelector()
  locale.closeLanguageSelector()
  useNavDrawer().menuOpen.value = false
}
