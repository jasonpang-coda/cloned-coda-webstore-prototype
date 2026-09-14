import { computed, ref, watch } from 'vue'
import { useItemSummary } from './useItemSummary.js'
import { useCheckout } from './useCheckout.js'
import { useAuth } from './useAuth.js'
import { useStoreConfig } from './useStoreConfig.js'
import { useStoreStrings } from './useStoreStrings.js'
import { useStoreAssets } from './useStoreAssets.js'
import { useLocale } from './useLocale.js'
import { useFeatureFlags } from './useFeatureFlags.js'
import { fetchSheetContent } from '../content/sheetContent.js'

// Module-scope singleton — see useCheckout.js/useItemSummary.js for the
// pattern this composable follows (one module-scope ref set, imported via
// one specifier, no per-call state).
const stepOverride = ref(null) // null | 'info' — COD:M's in-sheet "Item Info" back-nav

/**
 * usePurchaseFlow — orchestrates EVERY store's "single workflow to buy
 * something" as steps inside ONE persistent PurchaseSheet, instead of
 * separate sheet components (ItemSummarySheet ⇄ CheckoutSheet/OrderSummarySheet)
 * faking a handoff through useSheetTransition's captured-height/cross-mount
 * JS hooks.
 *
 * `currentStep` is mostly DERIVED from the two existing singletons every
 * entry point already reads/writes: useItemSummary().summaryOpen (the
 * (i)-icon "info" step) and useCheckout().sheetOpen (BuyNowBar's BUY NOW,
 * a direct SKU tap, and the post-sign-in auto-promote watcher — all already
 * just flip sheetOpen true). Payment/checkout takes priority over info: once
 * sheetOpen is true that step shows even if summaryOpen is still true
 * underneath (the caller is expected to closeItemSummary() right after
 * opening the payment step — see PurchaseSheet.onBuyNow — so a later plain
 * closeCheckout() can't fall back to re-showing a stale info step).
 *
 * `config.checkout.buyNow` (FCM only) selects which payment step VIEW shows
 * once sheetOpen is true — 'payment' (PaymentStepView, the promo-code order
 * summary) vs 'checkout' (CheckoutStepView, COD:M's/every other default
 * store's 2x2 channel grid). This is the same capability flag useCheckout.js
 * already gates the Buy Now bar on — never branch on theme identity.
 *
 * The one thing that ISN'T pure derivation is COD:M's in-sheet "Item Info"
 * link: from the checkout/payment step, tapping it needs to show the info
 * step ON TOP of (not instead of) the still-open checkout/payment step, and
 * "back" needs to return to exactly that step — a genuinely bidirectional,
 * in-sheet stack the external singletons alone can't express. `stepOverride`
 * layers that on top of the derived step; `viewInfo()`/`viewPayment()` drive
 * it. It's reset automatically whenever a fresh external flow starts or the
 * whole flow closes, so it never leaks into the next purchase.
 */
export function usePurchaseFlow() {
  const { summaryOpen, selectedBundle, pendingReturn, openItemSummary, closeItemSummary, savePendingReturn, clearPendingReturn } = useItemSummary()
  const { sheetOpen, selectedItem, guestVerified, guestPlayerName, closeCheckout } = useCheckout()
  const { signedIn, playerName } = useAuth()
  const config = useStoreConfig()
  const strings = useStoreStrings()
  const assets = useStoreAssets()
  const { common } = useLocale()
  const { isEnabled } = useFeatureFlags()

  // Same two-gate check useCheckout.js's usesBuyNowBar() makes: the STATIC
  // capability (config.checkout.buyNow, FCM only) AND the runtime dev-preview
  // flag together. With the flag off, FCM falls back to the same
  // 'checkout'-step content (CheckoutStepView) every default store uses —
  // this is what used to happen when App.vue mounted the old CheckoutSheet
  // fallback instead of PurchaseSheet; PurchaseSheet must reproduce it
  // itself now that it's the only surface that ever mounts.
  const usesPaymentView = computed(() => !!config.value.checkout?.buyNow && isEnabled('fcmPaymentSheet'))

  // Re-open the info step after sign-in completes if the default (non-FCM)
  // sign-in flow was started from it — ported verbatim from
  // ItemSummarySheet's own watch(signedIn); this composable is the one
  // place still alive for every store once ItemSummarySheet is retired.
  watch(signedIn, (isSignedIn) => {
    if (isSignedIn && pendingReturn.value) {
      openItemSummary(pendingReturn.value)
      clearPendingReturn()
    }
  })

  const derivedStep = computed(() => {
    if (sheetOpen.value) return usesPaymentView.value ? 'payment' : 'checkout'
    if (summaryOpen.value) return 'info'
    return null
  })

  // A fresh external flow starting (derivedStep null → non-null) or the
  // whole flow closing (non-null → null) always clears any stale override —
  // it only ever applies ON TOP OF the checkout/payment step it was opened
  // from, never carried into a new one.
  watch(derivedStep, (step, prevStep) => {
    if (step === null || prevStep === null) stepOverride.value = null
  })

  const currentStep = computed(() => {
    if (derivedStep.value === null) return null
    if (stepOverride.value === 'info' && derivedStep.value !== 'info') return 'info'
    return derivedStep.value
  })
  const open = computed(() => currentStep.value !== null)

  const stepItem = computed(() => (currentStep.value === 'info' ? selectedBundle.value : selectedItem.value))

  // fcmFewerPaymentChannels dev flag — trims the channel list so the payment
  // sheet body fits without scrolling, letting PaymentStepFooter's canScrollBody
  // go false and hide the T&C link. Shallow override only, applied here (not in
  // store.js) so the flag can flip the scenario live without touching the
  // static per-store config sheetContent.js otherwise reads unmodified.
  const effectiveConfig = computed(() => {
    const channels = config.value.checkout?.channels
    if (!isEnabled('fcmFewerPaymentChannels') || !channels) return config.value
    return { ...config.value, checkout: { ...config.value.checkout, channels: channels.slice(0, 3) } }
  })

  const descriptor = computed(() => {
    if (!currentStep.value) return null
    return fetchSheetContent(currentStep.value, {
      item: stepItem.value,
      signedIn: signedIn.value,
      guestVerified: guestVerified.value,
      playerName: playerName.value,
      guestPlayerName: guestPlayerName.value,
      config: effectiveConfig.value,
      strings: strings.value,
      assets: assets.value,
      common: common.value,
    })
  })

  // COD:M's "Item Info" link — shows the info step on top of the still-open
  // checkout step; populates selectedBundle the same way the standalone
  // info-step entry point does.
  function viewInfo(bundleInfo) {
    if (bundleInfo) openItemSummary(bundleInfo)
    stepOverride.value = 'info'
  }
  // Back from the overridden info step to whatever checkout/payment step
  // is still open underneath.
  function viewPayment() {
    stepOverride.value = null
  }

  // The header close (X). While the info step is showing ON TOP of a still-
  // open checkout/payment step (COD:M's "Item Info" link), this returns to
  // that step instead of cancelling the flow — mirrors ItemSummarySheet's old
  // close behaviour, which only ever called closeItemSummary() and left
  // CheckoutSheet mounted (and now revealed) underneath. Otherwise cancels
  // the whole flow.
  function close() {
    if (stepOverride.value === 'info' && sheetOpen.value) {
      closeItemSummary()
      stepOverride.value = null
      return
    }
    closeItemSummary()
    closeCheckout()
  }

  return {
    open,
    currentStep,
    descriptor,
    usesPaymentView,
    viewInfo,
    viewPayment,
    close,
  }
}
