<script setup>
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseSheet from './base/BaseSheet.vue'
import MaterialIcon from './MaterialIcon.vue'
import InfoStepBody from './steps/InfoStepBody.vue'
import InfoStepFooter from './steps/InfoStepFooter.vue'
import PaymentStepBody from './steps/PaymentStepBody.vue'
import PaymentStepFooter from './steps/PaymentStepFooter.vue'
import CheckoutStepBody from './steps/CheckoutStepBody.vue'
import CheckoutStepFooter from './steps/CheckoutStepFooter.vue'
import { usePurchaseFlow } from '../composables/usePurchaseFlow.js'
import { useItemSummary } from '../composables/useItemSummary.js'
import { useCheckout } from '../composables/useCheckout.js'
import { useAuth } from '../composables/useAuth.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { triggerHaptic } from '../composables/useHaptics.js'
import { formatNumber } from '../utils/formatNumber.js'

/**
 * PurchaseSheet — the single persistent surface for EVERY store's "buy
 * something" workflow: info step → payment/checkout step, as ONE BaseSheet
 * whose body/footer swap in place (BaseSheet's `contentKey` resize +
 * cross-fade engine) instead of separate sheet components (ItemSummarySheet
 * ⇄ CheckoutSheet/OrderSummarySheet) faking a handoff through
 * useSheetTransition's captured-height JS hooks.
 *
 * `usePurchaseFlow` derives which step is showing from the SAME singletons
 * every existing entry point already reads (useItemSummary/useCheckout) —
 * this component only needs to drive those singletons the same way
 * ItemSummarySheet's FCM branch and CheckoutSheet used to. `config.
 * checkout.buyNow` (FCM only) selects between the 'payment' view
 * (PaymentStepBody, promo-code order summary) and the 'checkout' view
 * (CheckoutStepBody, the 2x2 channel grid every default/non-FCM store uses).
 */
defineProps({
  isMobile: { type: Boolean, default: true },
})

const { open, currentStep, descriptor, usesPaymentView, viewInfo, close } = usePurchaseFlow()
const { closeItemSummary, savePendingReturn } = useItemSummary()
const { openCheckout, openPaymentSheet, pendingBuyNowSignIn } = useCheckout()
const { startEaSignIn, startSignIn } = useAuth()
const config = useStoreConfig()
const assets = useStoreAssets()
const strings = useStoreStrings()
const router = useRouter()

// Registers the bundle as a checkout selection so useCheckout/BuyNowBar read
// a consistent shape regardless of which entry point opened the flow. Same
// shape ItemSummarySheet's FCM branch built (no bonusLabel — FCM bundles
// aren't a base+bonus currency SKU).
function fcmCheckoutArgs(b) {
  return [
    {
      label: b.title,
      currentPrice: b.currentPrice,
      skuImage: b.skuImage,
      loyaltyPoints: b.loyaltyPoints,
      bundleInfo: b,
    },
    `${b.title}|${b.currentPrice}`,
  ]
}

// Default (non-FCM-Buy-Now) shape — mirrors ItemSummarySheet.onBuyNow()'s
// default branch exactly, incl. the 'BUNDLE' bonus tag every default store's
// checkout banner shows for a bundle bought via its info step.
function defaultCheckoutArgs(b) {
  return [
    {
      label: b.title,
      currentPrice: b.currentPrice,
      bonusLabel: 'BUNDLE',
      skuImage: b.skuImage,
      loyaltyPoints: b.loyaltyPoints,
      bundleInfo: b,
    },
    `${b.title}|${b.currentPrice}`,
  ]
}

// Mirrors ItemSummarySheet.onBuyNowFcm()/onBuyNow() exactly, minus the
// handoffHeight capture — BaseSheet's contentKey engine (bound to
// currentStep) now handles the resize + cross-fade on its own once
// sheetOpen flips true below. Branches on the same config.checkout.buyNow
// capability flag useCheckout.js gates the Buy Now bar on: FCM promotes
// through the docked bar (openPaymentSheet); every default store's item tap
// opens the checkout sheet directly (openCheckout alone already does this —
// openPaymentSheet is a no-op there).
function onBuyNow() {
  const bundle = descriptor.value?.data?.bundle
  if (!bundle) return
  if (usesPaymentView.value) {
    openCheckout(...fcmCheckoutArgs(bundle))
    openPaymentSheet()
  } else {
    openCheckout(...defaultCheckoutArgs(bundle))
  }
  // Close the info step's underlying flag now — sheetOpen (just set true
  // above) already takes priority in usePurchaseFlow's currentStep, so this
  // is purely cleanup: it stops a later plain closeCheckout() from falling
  // back to re-showing a stale info step.
  closeItemSummary()
}

// COD:M's/every default store's "Item Info" link — shows the info step on
// top of the still-open checkout step; mirrors CheckoutSheet.onItemInfo().
function onItemInfo() {
  viewInfo(descriptor.value?.data?.item?.bundleInfo)
}

function onSignIn() {
  const bundle = descriptor.value?.data?.bundle
  if (usesPaymentView.value) {
    // FCM: register the selection BEFORE handing off to sign-in so the
    // existing auto-promote watcher (useCheckout.js watch(signedIn)) can
    // jump straight to the payment step once sign-in completes, instead of
    // reopening this info step.
    if (bundle) openCheckout(...fcmCheckoutArgs(bundle))
    pendingBuyNowSignIn.value = true
  } else {
    // Default (non-FCM) stores have no Buy Now bar to auto-promote through —
    // preserve the bundle so usePurchaseFlow's own watch(signedIn) can
    // re-open the info step once sign-in completes (mirrors
    // ItemSummarySheet.onSignIn()'s savePendingReturn() branch).
    savePendingReturn()
  }
  closeItemSummary()
  if (config.value.signIn?.flow === 'ea-redirect') startEaSignIn()
  else startSignIn()
}

function onSignInWithId() {
  closeItemSummary()
  nextTick(() => {
    document.getElementById('player-account')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function onConfirmPayment() {
  triggerHaptic('success')
}

// Real "purchase complete" trigger — the COD:M-style checkout step's Buy Now
// button (usesPaymentView stores confirm via onConfirmPayment instead, which
// doesn't lead here yet — the Order Complete page is COD:M-only for now, same
// gate as page.pwaInstall). close() dismisses this sheet; useCheckout()'s
// selectedItem is untouched by that, so useOrderComplete().order still reads
// it live — the SKU persists onto the Order Complete page.
function onCheckoutConfirm() {
  triggerHaptic('success')
  if (strings.value.page.orderComplete) {
    close()
    router.push('/order-complete')
  }
}

// Mount point for PaymentStepBody's promo-code T&Cs modal — it Teleports
// there via BaseSheet's #overlay slot so it isn't clipped by the scrolling
// body and disappears together with the sheet when it closes.
const overlayTarget = ref(null)
</script>

<template>
  <BaseSheet
    :open="open"
    :is-mobile="isMobile"
    :title="descriptor?.title"
    :size-hint="descriptor?.sizeHint ?? 'tall'"
    :content-key="currentStep"
    :landscape-full="currentStep === 'checkout'"
    aria-label="Purchase"
    @close="close()"
  >
    <template v-if="currentStep === 'info' && descriptor">
      <InfoStepBody :data="descriptor.data" />
    </template>
    <template v-else-if="currentStep === 'payment' && descriptor">
      <PaymentStepBody :data="descriptor.data" :overlay-target="overlayTarget" />
    </template>
    <template v-else-if="currentStep === 'checkout' && descriptor">
      <CheckoutStepBody :data="descriptor.data" :is-mobile="isMobile" @item-info="onItemInfo()" />
    </template>

    <!-- Loyalty earn banner — full-width strip that sits behind/above the
         sticky action footer, checkout step only (FCM's payment step shows
         its rewards line inline in the footer instead — see
         PaymentStepFooter). Config-gated (COD:M has no loyalty programme). -->
    <template v-if="currentStep === 'checkout'" #pre-footer>
      <div
        v-if="descriptor?.data?.loyalty && descriptor.data.loyaltyPoints != null"
        class="sheet__loyalty"
      >
        <span class="sheet__loyalty-text text-style-utility-default-bold">
          {{ descriptor.data.loyalty.label }} {{ formatNumber(descriptor.data.loyaltyPoints) }}
        </span>
        <img
          v-if="assets.brand.loyaltyIcon"
          :src="assets.brand.loyaltyIcon"
          alt=""
          aria-hidden="true"
          class="sheet__loyalty-mp"
        />
        <MaterialIcon v-else name="stars" variant="round" :size="16" class="sheet__loyalty-icon" />
      </div>
    </template>

    <template #footer="{ canScrollBody }">
      <InfoStepFooter
        v-if="currentStep === 'info' && descriptor"
        :data="descriptor.data"
        :primary-action="descriptor.primaryAction"
        @buy-now="onBuyNow()"
        @sign-in="onSignIn()"
        @sign-in-id="onSignInWithId()"
      />
      <PaymentStepFooter
        v-else-if="currentStep === 'payment' && descriptor"
        :data="descriptor.data"
        :can-scroll-body="canScrollBody"
        @confirm="onConfirmPayment()"
      />
      <CheckoutStepFooter
        v-else-if="currentStep === 'checkout' && descriptor"
        :data="descriptor.data"
        :primary-action="descriptor.primaryAction"
        :can-scroll-body="canScrollBody"
        :is-mobile="isMobile"
        @confirm="onCheckoutConfirm()"
      />
    </template>

    <template #overlay>
      <div ref="overlayTarget"></div>
    </template>
  </BaseSheet>
</template>

<style scoped>
/* Loyalty earn banner (config-gated; checkout step only) — full-width strip
   above the footer. Single flex row so "You will earn N [MP] points" flows
   on one line. Top corners are rounded to match the Figma spec; a top
   border and upward shadow separate it from the scrollable body above.
   Ported verbatim from CheckoutSheet.vue's #pre-footer. */
.sheet__loyalty {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: var(--x-gap-content-narrow);
  /* pt 12 / px 12 / pb 24 — Figma asymmetric padding, heavier bottom. This is
     a FIXED clearance (NOT coupled to --x-checkout-loyalty-overlap): it must stay
     larger than the overlap so the footer rises into the band's lower padding
     without crowding the text. Coupling it to the overlap cancels the footer's
     negative margin and the overlap renders as zero. */
  padding: var(--x-pad-surface-m) var(--x-pad-surface-m) var(--x-pad-surface-xl);
  border-top: var(--border-weight-default) solid var(--x-border-soft);
  border-top-left-radius: var(--x-radius-container-s);
  border-top-right-radius: var(--x-radius-container-s);
  background: var(--x-bg-loyalty-banner, var(--x-bg-indicator-brand-subtle));
  /* Sits behind the footer — footer z-index: 1 paints on top */
  position: relative;
  z-index: 0;
}

/* White bold text — same style for both the label and the suffix span */
.sheet__loyalty-text {
  color: var(--x-text-header-strong);
  white-space: nowrap;
}

/* MP mark — 16 px tall, auto width (keeps the ~3.75:1 aspect ratio intact) */
.sheet__loyalty-mp {
  height: var(--x-size-icon-s);
  width: auto;
  display: block;
  flex-shrink: 0;
}

/* Fallback material icon when no asset is registered */
.sheet__loyalty-icon {
  color: var(--x-text-header-strong);
  flex-shrink: 0;
}
</style>
