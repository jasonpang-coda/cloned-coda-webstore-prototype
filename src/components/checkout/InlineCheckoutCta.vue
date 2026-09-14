<script setup>
import { computed } from 'vue'
import MaterialIcon from '../MaterialIcon.vue'
import { useCheckout } from '../../composables/useCheckout.js'
import { useStoreStrings } from '../../composables/useStoreStrings.js'

/**
 * InlineCheckoutCta — the "guided checkout button". Docked sticky to the
 * bottom of the screen (config.checkout.stepCta — mounted directly, no
 * sheet/panel container around it — see App.vue's #overlay mount, same
 * absolute/fixed device-frame positioning as BuyNowBar.vue). Not a page
 * section — it must stay visible while the user scrolls through every
 * remaining step. Once both real gates clear (a SKU AND a payment channel),
 * App.vue swaps this component out for the Buy Now widget entirely (see its
 * own comment) — so this component only ever renders two states:
 *
 *   step 0 — no SKU selected yet     → strings.details.submitCta ("Select Your Item"), cart icon, empty donut
 *   step 1 — SKU selected, no PC yet → strings.details.selectPaymentCta ("Select Payment Method"), wallet icon, half-filled donut
 *
 * The leading icon crossfades between the cart (nothing chosen yet) and the
 * wallet (once a SKU is picked) rather than a static icon — the swap itself
 * is the "you've added something" signal, no extra badge needed. The donut
 * fills from empty to half in the same step, both driven by --x-motion-*
 * tokens, never an instant snap.
 */
defineProps({
  isMobile: { type: Boolean, default: true },
})

const strings = useStoreStrings()
const { selectedItem } = useCheckout()

const hasItem = computed(() => !!selectedItem.value)
const icon = computed(() => (hasItem.value ? 'wallet' : 'add_shopping_cart'))
const label = computed(() => (hasItem.value ? strings.value.details?.selectPaymentCta : strings.value.details?.submitCta))

// Donut ring — empty at step 0, half-filled at step 1 (r=8 circle).
const RADIUS = 8
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const donutOffset = computed(() => CIRCUMFERENCE * (hasItem.value ? 0.5 : 1))

// Anchors to whichever step the label is currently asking for — the SKU
// grid at step 0, the payment-channel grid once an item is picked (step 1).
function onClick() {
  const targetId = hasItem.value ? 'step-payment' : 'cat-cp-img'
  document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="checkout-cta" :class="{ 'checkout-cta--responsive': !isMobile }">
    <button v-ripple type="button" class="checkout-cta__btn" @click="onClick">
      <Transition name="icon-swap" mode="out-in">
        <MaterialIcon :key="icon" :name="icon" variant="round" :size="20" />
      </Transition>
      <span class="text-style-utility-action-uppercase">{{ label }}</span>
      <svg class="checkout-cta__donut" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <circle class="checkout-cta__donut-track" cx="10" cy="10" :r="RADIUS" fill="none" stroke-width="2" />
        <circle
          class="checkout-cta__donut-fill"
          cx="10"
          cy="10"
          :r="RADIUS"
          fill="none"
          stroke-width="2"
          :stroke-dasharray="CIRCUMFERENCE"
          :stroke-dashoffset="donutOffset"
          transform="rotate(-90 10 10)"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* No sheet/panel container — just the pill button, docked. Positioning
   mirrors BuyNowBar.vue's device-frame pattern (absolute within the framed
   screen, fixed for the responsive frame). */
.checkout-cta {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3; /* above CategoryNav (0) / drawer (1) / loader (2), below sheets (4) */
  padding: 0 var(--x-pad-surface-m) var(--x-pad-surface-xl);
  pointer-events: none;
  /* The button's own max-width (420px) only matters once the screen is
     wider than that — below it the button fills the row edge-to-edge
     anyway — but centering must always be on: without it, any width
     between ~420px and the old 801px breakpoint left the button hugging
     the left edge instead of sitting in the middle of the row. */
  display: flex;
  justify-content: center;
}
/* Responsive (desktop) frame — the app scrolls the window, not a bounded
   device screen, so this must pin to the viewport instead of scrolling away
   with the page (same reasoning as BuyNowBar.vue's own --responsive variant). */
.checkout-cta--responsive {
  position: fixed;
}

.checkout-cta__btn {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-tight);
  width: 100%;
  max-width: 420px;
  height: var(--x-size-control-m);
  padding: 0 var(--x-pad-surface-xl);
  border: 0;
  border-radius: var(--x-radius-control-full);
  background: var(--x-bg-action-primary);
  color: var(--x-text-on-primary);
  cursor: pointer;
  box-shadow: var(--x-shadow-card-hover);
  transition: filter var(--x-motion-sku-hover), transform var(--x-motion-btn-activate);
}
.checkout-cta__btn:hover {
  filter: brightness(1.08);
}
.checkout-cta__btn:active {
  transform: scale(0.97);
}

/* Icon crossfade — cart → wallet, the "you've added something" signal. */
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
}
.icon-swap-enter-from,
.icon-swap-leave-to {
  opacity: 0;
}

.checkout-cta__donut {
  flex-shrink: 0;
  display: block;
  color: var(--x-text-on-primary);
}
.checkout-cta__donut-track {
  stroke: currentColor;
  opacity: 0.35;
}
.checkout-cta__donut-fill {
  /* Success-indicator token, not currentColor — progress toward a completed
     purchase is a positive/success signal. */
  stroke: var(--x-bg-indicator-success-default);
  transition: stroke-dashoffset var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard);
}
</style>
