<script setup>
import SkuImageCard from './SkuImageCard.vue'

/**
 * SkuImageList — a titled section of image-led SKU cards (SkuImageCard). The
 * SkuCard-only sibling is SkuList; this wrapper exists because the image card
 * takes a different prop set (currencyLabel / variant / loyaltyIcon rather than
 * cpIcon / row layout). Cards sit in the same responsive grid as SkuList's
 * default 'wrap' layout: 2 columns on XS (< 641px container), 4 at S/M/L
 * (≥ 641px). Each card gets a staggered entrance delay.
 */
defineProps({
  title: { type: String, default: null },
  /** Optional subtitle shown below the title */
  description: { type: String, default: null },
  items: { type: Array, required: true },
  /** Currency name appended to each amount, e.g. "CP" — shared by every card */
  currencyLabel: { type: String, default: '' },
  /** Loyalty (MP) icon for the optional inline loyalty row — shared by every card */
  loyaltyIcon: { type: String, default: null },
  /** SkuImageCard layout variant: 'panel' | 'background' */
  variant: { type: String, default: 'panel' },
  /** Fewer, bigger cards — 1 col mobile / 2 at ≥ S, same ratio as BundleGrid,
      instead of the default 2/4. For a featured row (e.g. Best Sellers)
      that wants more visual weight per card without switching art
      treatment — independent of `variant`. */
  wide: { type: Boolean, default: false },
  /** Section base delay offset in ms (cascades sections top-to-bottom) */
  baseDelay: { type: Number, default: 0 },
})
</script>

<template>
  <div class="sku-image-list">
    <div v-if="title || description" class="sku-image-list__header">
      <h2 v-if="title" class="sku-image-list__title text-style-heading-banner">{{ title }}</h2>
      <p v-if="description" class="sku-image-list__description text-style-paragraph-regular">{{ description }}</p>
    </div>
    <div class="sku-image-list__grid" :class="{ 'sku-image-list__grid--wide': wide }">
      <SkuImageCard
        v-for="(item, index) in items"
        :key="index"
        v-bind="item"
        :currency-label="currencyLabel"
        :loyalty-icon="loyaltyIcon"
        :variant="variant"
        :anim-delay="index * 90"
        :base-delay="baseDelay"
      />
    </div>
  </div>
</template>

<style scoped>
.sku-image-list {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  width: 100%;
}

.sku-image-list__header {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-narrow);
}

.sku-image-list__title {
  text-transform: uppercase;
  color: var(--x-text-header-default);
  margin: 0;
  display: block;
  /* --x-sku-image-list-title-size lets a store bump this header past its
     text-style-heading-banner default (--x-sys-size-h6) without touching
     that shared class everywhere else it's used — inherit is a no-op for
     every other store. */
  font-size: var(--x-sku-image-list-title-size, inherit);
}

.sku-image-list__description {
  margin: 0;
  color: var(--x-text-body-soft);
}

/* Base grid: 2 columns on mobile, 4 at ≥ S breakpoint (641px container).
   Container queries resolve against .device__screen (container-type: inline-size). */
.sku-image-list__grid {
  display: grid;
  gap: var(--x-gap-content-default);
  grid-template-columns: repeat(2, 1fr);
}
@container (min-width: 641px) {
  .sku-image-list__grid { grid-template-columns: repeat(4, 1fr); }
}

/* wide prop — fewer, bigger cards (1 col mobile, 2 at ≥ S), same ratio as
   BundleGrid, for a featured row that wants more visual weight per card. */
.sku-image-list__grid--wide {
  grid-template-columns: 1fr;
}
@container (min-width: 641px) {
  .sku-image-list__grid--wide { grid-template-columns: repeat(2, 1fr); }
}
</style>
