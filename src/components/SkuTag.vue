<script setup>
/**
 * SkuTag — the shared pill badge used across SKU / Bundle / Gift cards.
 * Provides consistent display, padding, border-radius, and per-variant colours.
 * The consumer is responsible for positioning (position:absolute on BundleItem /
 * GiftSkuCard; flow on SkuCard).
 *
 * Variants:
 *   'bonus'   — --x-bg-tag-bonus / --x-text-tag-bonus  (BONUS pill on bundle item tiles)
 *   'value'   — --x-bg-tag-bonus / --x-text-tag-bonus  (BEST VALUE / WEB STORE EXCLUSIVE / FREE GIFT on cards)
 *   'success' — --x-bg-tag-success / --x-text-success-default  (FREE GIFT on gift cards — legacy, kept for green variant)
 */
defineProps({
  label:   { type: String, required: true },
  variant: { type: String, default: 'bonus' },
})
</script>

<template>
  <span class="sku-tag" :class="`sku-tag--${variant}`">
    <!-- display:block overrides the text-style class's inline-block so the
         flex container sizes correctly; transform-origin:center centre
         distributes the Hitmarker scaleX equally left+right — pill hugs evenly. -->
    <span class="sku-tag__text text-style-utility-micro-uppercase">{{ label }}</span>
  </span>
</template>

<style scoped>
.sku-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--x-pad-surface-xxs);
  border-radius: var(--x-radius-container-xs);
  line-height: 1;
  white-space: nowrap;
}

.sku-tag--bonus   { background: var(--x-bg-tag-bonus);   color: var(--x-text-tag-bonus); }
.sku-tag--value   { background: var(--x-bg-tag-bonus);   color: var(--x-text-tag-bonus); }
.sku-tag--success { background: var(--x-bg-tag-success); color: var(--x-text-success-default); }

/* display:block on the flex item means the container sizes to the item's
   max-content width. transform-origin:center overrides the text-style default
   (left) so the Hitmarker scaleX condenses symmetrically — equal visual space
   on both sides of the text, not extra space only on the right. */
.sku-tag__text {
  display: block;
  white-space: nowrap;
  transform-origin: center center;
}
</style>
