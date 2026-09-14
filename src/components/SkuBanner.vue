<script setup>
import SkuTag from './SkuTag.vue'

/**
 * SkuBanner — read-only L1 pane summarizing one SKU (art + amount + bonus
 * breakdown), with an optional corner tag. Grounded in OrderCompletePage's
 * Order Summary banner — NOT a reuse of SkuCard/SkuImageCard, which are both
 * full interactive product cards (click-to-checkout, hover/press states,
 * price blocks); this is purely presentational, like TransactionCard.
 * amountText/bonusText arrive pre-formatted from the caller — this component
 * does no number formatting itself (same contract as TransactionCard's
 * date/total).
 */
defineProps({
  image: { type: String, default: null },
  imageAlt: { type: String, default: '' },
  amountText: { type: String, required: true },
  bonusText: { type: String, default: null },
  tagLabel: { type: String, default: null },
  tagVariant: { type: String, default: 'value' },
})
</script>

<template>
  <div class="sku-banner">
    <SkuTag v-if="tagLabel" class="sku-banner__tag" :label="tagLabel" :variant="tagVariant" />
    <img v-if="image" :src="image" :alt="imageAlt" class="sku-banner__image" />
    <div class="sku-banner__info">
      <span class="sku-banner__amount text-style-heading-banner">{{ amountText }}</span>
      <span v-if="bonusText" class="sku-banner__bonus text-style-utility-label-regular">{{ bonusText }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Gradient border — same mask-composite ring technique as SkuCard/
   SkuImageCard/BundleItem/etc. (repeated 10+ times in this codebase). */
.sku-banner {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-m) var(--x-pad-surface-s);
  border-radius: var(--sb-radius, var(--x-radius-container-xs));
  background: var(--sb-bg, var(--x-bg-sku-card-default));
  overflow: hidden;
}
.sku-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: var(--border-weight-default);
  background: var(--sb-border, var(--x-border-sku-card-default));
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: destination-out;
  pointer-events: none;
  z-index: 2;
}
.sku-banner__tag {
  position: absolute;
  top: var(--x-pad-surface-xxs);
  left: var(--x-pad-surface-xxs);
}
.sku-banner__image {
  flex-shrink: 0;
  width: var(--sb-image-size, 64px);
  height: var(--sb-image-size, 64px);
  object-fit: contain;
}
.sku-banner__info {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
  color: var(--x-text-header-default);
}
.sku-banner__amount { text-transform: uppercase; }
.sku-banner__bonus { color: var(--x-text-body-default); }
</style>
