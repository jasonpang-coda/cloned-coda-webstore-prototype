<script setup>
import { computed, ref, toRefs } from 'vue'
import MaterialIcon from '../MaterialIcon.vue'
import PromoCode from '../PromoCode.vue'
import BoletoKycForm from '../checkout/BoletoKycForm.vue'
import { useCheckout } from '../../composables/useCheckout.js'
import { useOrientation } from '../../composables/useOrientation.js'
import { formatNumber } from '../../utils/formatNumber.js'
import { parsePrice } from '../../utils/parsePrice.js'

/**
 * CheckoutStepBody — the default (non-FCM-Buy-Now) payment step's scrolling
 * body: account row, chosen-item banner (+ "Item Info" link back to the info
 * step), the literal 2x2 payment-channel grid, and the static Terms &
 * Conditions legal bar. Presentational port of CheckoutSheet.vue's body;
 * renders `data` (the resolved `checkout` content descriptor from
 * sheetContent.js) and never reads config/strings/assets directly. Sibling
 * to CheckoutStepFooter — split because BaseSheet keeps the scrolling body
 * and pinned footer as separate slots.
 *
 * Reads `useCheckout().selectedChannel` directly (the shared singleton every
 * SKU card / BuyNowBar already reads) so CheckoutStepFooter can independently
 * compute its enabled state without a prop bridge — same pattern as
 * PaymentStepBody/PaymentStepFooter.
 */
const props = defineProps({
  data: { type: Object, required: true },
  isMobile: { type: Boolean, default: true },
})
const { data } = toRefs(props)

defineEmits(['item-info'])

const { selectedChannel, promoDiscountAmount, showBoletoKyc } = useCheckout()

// Landscape full-screen (see BaseSheet's `landscapeFull` prop + Figma node
// 6060:3935): the account row, chosen-item banner, and T&Cs bar move out of
// this scrolling column — the banner + price + CTA render instead in
// CheckoutStepFooter's landscape layout (the design's right-hand column) —
// leaving this column as just the heading + payment-channel grid.
const { orientation } = useOrientation()
const isLandscapeFull = computed(() => props.isMobile && orientation.value === 'landscape')

// Every card shows the same price once a SKU is selected upstream — a flat
// per-item price, not per-channel, matching StepPayment.vue's own
// priceDisplay (no per-channel fee model in this checkout flow).
const priceDisplay = computed(() => data.value.item?.currentPrice ?? null)

// Promo code (landscape full-screen only — Figma node 6060:3945's "PC"
// frame, below the List) — the discount itself is a shared singleton
// (useCheckout().promoDiscountAmount) so CheckoutStepFooter's Subtotal
// picks it up without a prop bridge, same pattern as selectedChannel.
const promoAmount = computed(() => parsePrice(data.value.item?.currentPrice)?.amount ?? null)
function onPromoApplied(discount) {
  promoDiscountAmount.value = discount
}
function onPromoRemoved() {
  promoDiscountAmount.value = null
}

// Terms & Conditions — always-expanded legal bar below the payment-channel
// list; the footer link just scrolls it into view.
const termsRef = ref(null)
function onViewTerms() {
  termsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

defineExpose({ onViewTerms })
</script>

<template>
  <!-- Boleto BR KYC form — replaces this whole column (both orientations)
       once selected and Buy Now is tapped (CheckoutStepFooter's onBuyNow).
       Cross-fade, not a slide/scale — same calm asymmetric fast-out/base-in
       opacity idiom as PromoCode.vue's own form↔success swap and
       ClaimGiftSheet's confirm↔success swap (the established "swap this
       step's content in place" transition in this codebase). -->
  <Transition name="ckb-swap" mode="out-in">
  <BoletoKycForm v-if="showBoletoKyc" key="boleto-kyc" @back="showBoletoKyc = false" />

  <div v-else key="channels" class="checkout-step-body" :class="{ 'checkout-step-body--landscape': isLandscapeFull }">
  <!-- Account -->
  <div v-if="!isLandscapeFull" class="sheet__account">
    <MaterialIcon name="account_circle" variant="round" :size="16" />
    <span class="sheet__account-name text-style-utility-default-bold">{{ data.accountName }}</span>
  </div>

  <!-- Chosen item banner (placeholder imagery — real art swaps in later).
       Landscape full-screen moves this into CheckoutStepFooter's right
       column instead (see that component). -->
  <div v-if="!isLandscapeFull" class="sheet__banner" data-poi="purchase-sheet">
    <div class="sheet__banner-bg" aria-hidden="true"></div>
    <div class="sheet__banner-content">
      <img
        v-if="data.item?.skuImage"
        :src="data.item.skuImage"
        alt=""
        class="sheet__banner-thumb sheet__banner-thumb--img"
      />
      <div v-else class="sheet__banner-thumb" aria-hidden="true"></div>
      <div class="sheet__banner-info" v-if="data.item">
        <p
          v-if="data.item.label || data.item.amount != null || data.item.currencyLabel"
          class="sheet__banner-amount text-style-heading-banner"
        >{{ data.item.label || [formatNumber(data.item.amount), data.item.currencyLabel].filter(v => v != null && v !== '').join(' ') }}</p>
        <p
          v-if="data.item.subtitle"
          class="sheet__banner-subtitle text-style-utility-label-regular"
        >{{ data.item.subtitle }}</p>
        <p
          v-if="data.item.baseAmount != null && data.item.bonusAmount != null"
          class="sheet__banner-bonus text-style-utility-label-regular"
        >
          <span>{{ formatNumber(data.item.baseAmount) }} + </span>
          <span class="sheet__bonus text-style-utility-default-bold"
          >{{ formatNumber(data.item.bonusAmount) }} {{ data.item.bonusLabel || data.bonusLabelFallback }}</span>
        </p>
      </div>
      <button
        v-if="data.item?.bundleInfo"
        v-ripple v-haptic
        type="button"
        class="sheet__banner-item-info"
        @click="$emit('item-info')"
      >
        <span class="sheet__banner-item-info-label text-style-utility-label-regular">{{ data.itemInfoLabel }}</span>
      </button>
    </div>
  </div>

  <!-- Payment channels — 3-up in landscape full-screen (matches Figma's
       "List" grid, node 6060:3962), 2-up otherwise. -->
  <p class="sheet__pc-heading text-style-utility-micro-regular">{{ data.selectPaymentHeading }}</p>
  <div class="sheet__pc-list" :class="{ 'sheet__pc-list--landscape': isLandscapeFull }">
    <button
      v-for="(c, i) in data.channels"
      :key="i"
      v-ripple
      v-haptic:chip
      type="button"
      class="sheet__pc-card"
      :class="{ 'is-selected': selectedChannel === i }"
      :data-poi="i === 0 ? 'payment-channel' : null"
      @click="selectedChannel = i"
    >
      <img v-if="c.logo" :src="c.logo" alt="" class="sheet__pc-logo" />
      <span class="sheet__pc-label text-style-utility-micro-regular">{{ c.label }}</span>
      <span v-if="priceDisplay" class="sheet__pc-price text-style-utility-action-bold">{{ priceDisplay }}</span>
    </button>
  </div>

  <PromoCode
    v-if="isLandscapeFull"
    :amount="promoAmount"
    @applied="onPromoApplied"
    @removed="onPromoRemoved"
  />

  <!-- Terms & Conditions — always-expanded legal bar. Hidden in landscape
       full-screen — no room for it alongside the payment grid (matches
       Figma, which omits it there too). -->
  <div v-if="!isLandscapeFull" ref="termsRef" class="sheet__terms">
    <span class="sheet__terms-heading text-style-utility-default-bold">{{ data.termsHeading }}</span>
    <p class="sheet__terms-body text-style-utility-micro-regular">{{ data.termsBody }}</p>
  </div>
  </div>
  </Transition>
</template>

<style scoped>
.checkout-step-body {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  width: 100%;
}
.checkout-step-body--landscape {
  gap: var(--x-gap-content-default);
}

/* Boleto KYC form <-> channel grid — opacity-only cross-fade, same
   asymmetric fast-out/base-in timing as PromoCode.vue's form<->success swap. */
.ckb-swap-leave-active {
  transition: opacity var(--x-motion-sys-duration-fast) var(--x-motion-sys-ease-accelerate);
}
.ckb-swap-leave-to { opacity: 0; }
.ckb-swap-enter-active {
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.ckb-swap-enter-from { opacity: 0; }

/* Account */
.sheet__account {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-narrow);
  width: 100%;
  padding: var(--x-pad-surface-xs) var(--x-pad-surface-s);
  border-radius: var(--x-radius-container-xs);
  background: var(--x-bg-indicator-neutral-default);
  color: var(--x-text-body-default);
}
.sheet__account-name {
  transform-origin: center center;
}

/* Chosen-item banner */
.sheet__banner {
  position: relative;
  width: 100%;
  height: 80px;
  /* .sheet__body is a flex column with more content than fits in a short
     viewport (e.g. this sheet in the device frame's landscape orientation,
     where total screen height can be under 450px) — it's built to scroll in
     that case (overflow-y:auto), not shrink its children. But `overflow:
     hidden` below makes this element's flexbox automatic minimum size 0
     (spec: a scroll-container's auto-min is 0, same as `overflow-x/y:auto`),
     so without flex-shrink:0 it was the one child flexbox was free to
     compress toward nothing, squashing the banner to a sliver instead of
     leaving it at 80px and letting the body scroll past it. */
  flex-shrink: 0;
  padding: var(--x-pad-surface-s);
  border: var(--border-weight-default) solid var(--x-border-soft-2);
  border-radius: var(--x-radius-container-xs);
  overflow: hidden;
  display: flex;
  align-items: center;
}
/* Placeholder banner background (real art swaps in later) + dark legibility scrim */
.sheet__banner-bg {
  position: absolute;
  inset: 0;
  background: var(--x-gradient-checkout-banner);
}
.sheet__banner-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  width: 100%;
}
/* 64×64 placeholder product tile */
.sheet__banner-thumb {
  flex-shrink: 0;
  width: var(--x-size-img-xl);
  height: var(--x-size-img-xl);
  border-radius: var(--x-radius-container-xs);
  background: var(--x-gradient-thumb-gloss);
  border: var(--border-weight-default) solid var(--x-border-soft);
}
/* When a SKU image is present, the 64×64 tile shows the product art itself.
   Use contain (not cover) so transparent-bg product art sits cleanly over the
   dark checkout banner without clipping or the gloss tile showing through. */
.sheet__banner-thumb--img {
  object-fit: contain;
  background: none;
}
.sheet__banner-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
}
.sheet__banner-amount {
  color: var(--x-text-header-default);
}
.sheet__banner-subtitle {
  color: var(--x-text-body-default);
}
.sheet__banner-bonus {
  text-transform: uppercase;
  color: var(--x-text-header-strong);
  display: block;
}
.sheet__bonus { color: var(--x-text-bonus-amount); }

/* "Item Info" hyperlink — sits to the right of the banner info block */
.sheet__banner-item-info {
  flex-shrink: 0;
  align-self: center;
  display: flex;
  align-items: center;
  padding: var(--x-pad-surface-xs) 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--x-text-hyperlink-default);
}
.sheet__banner-item-info-label {
  text-decoration: underline;
  transform-origin: right center;
}

/* "SELECT PAYMENT" micro-uppercase label above the channel grid */
.sheet__pc-heading {
  margin: 0;
  width: 100%;
  text-transform: uppercase;
  color: var(--x-text-body-soft);
  display: block;
}

/* Payment-channel grid */
.sheet__pc-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--x-gap-content-default);
  width: 100%;
}
/* Landscape full-screen — 3-up instead of 2-up (Figma node 6060:3962's List).
   flex-grow:0 (unlike the 2-up default below, which grows to fill) — this list
   only ever holds COD:M's fixed 4 channels, so the last row is a lone card;
   flex-grow:1 there would stretch it to the full row width while its 3
   siblings above stay a third each, sizing every card differently. */
.sheet__pc-list--landscape .sheet__pc-card {
  flex: 0 1 calc(33.333% - var(--x-gap-content-default));
}

.sheet__pc-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--x-gap-content-narrow);
  /* flex-grow:0 — same reasoning as the landscape 3-up variant above: this
     list can hold an odd number of channels (5, with Boleto), so the last
     row is a lone card; flex-grow:1 would stretch it to the full row width
     while every other card stays a fixed fraction, sizing it differently. */
  flex: 0 1 calc(50% - var(--x-gap-content-default));
  min-width: 0;
  padding: var(--x-pad-surface-s) var(--x-pad-surface-s) var(--x-pad-surface-m);
  border: 0;
  border-radius: var(--x-radius-container-xs);
  background-image: var(--x-bg-card-default);
  cursor: pointer;
  transition: background-color var(--x-motion-sku-hover);
}
.sheet__pc-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: var(--border-weight-default);
  background: var(--x-border-sku-card-default);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: destination-out;
  pointer-events: none;
  transition: background var(--x-motion-sku-hover);
}
.sheet__pc-card:hover::before {
  background: var(--x-border-sku-card-hover);
}
.sheet__pc-card.is-selected {
  background: var(--x-bg-card-selected);
}
.sheet__pc-card.is-selected::before {
  padding: var(--border-weight-selected); /* 2px ring on the chosen channel */
  background: var(--x-text-hyperlink-default);
}
.sheet__pc-logo {
  height: var(--x-size-icon-l);
  width: 72px; /* Phase 3 — off-scale, pending Figma check */
  object-fit: contain;
  object-position: left center;
  display: block;
}
.sheet__pc-label {
  color: var(--x-text-body-soft);
  text-align: left;
}
.sheet__pc-price {
  color: var(--x-text-final-price);
  text-align: left;
}

/* Terms & Conditions — static legal bar, always expanded. */
.sheet__terms {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-narrow);
  width: 100%;
  margin-top: var(--x-gap-content-separation);
  padding-top: var(--x-pad-surface-m);
  border-top: var(--border-weight-default) solid var(--x-border-divider);
}
.sheet__terms-heading {
  color: var(--x-text-body-default);
}
.sheet__terms-body {
  margin: 0;
  color: var(--x-text-body-default);
  white-space: pre-line;
}
</style>
