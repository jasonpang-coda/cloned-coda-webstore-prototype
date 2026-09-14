<script setup>
import SkuCard from './SkuCard.vue'

/**
 * SkuList — a titled section of SKU cards. Cards sit in a responsive CSS grid:
 * 2 columns on XS (< 641px container), 4 columns at S/M/L (≥ 641px).
 * The 'columns' layout variant overrides this with a stacked 1-col (mobile) →
 * 2-col (≥ 801px) grid; the 'stack' variant is a single full-width column of
 * horizontal (row) cards at every width. Each card gets a staggered entrance delay.
 */
defineProps({
  title: { type: String, default: null },
  items: { type: Array, required: true },
  cpIcon: { type: String, default: null },
  /** Square SKU product image, shared by every card in this list */
  skuImage: { type: String, default: null },
  /** Section base delay offset in ms (cascades sections top-to-bottom) */
  baseDelay: { type: Number, default: 0 },
  /**
   * Card arrangement:
   *  'wrap'    — flex-wrap, cards size to fit (2-up on phones → more per row). Default.
   *  'columns' — explicit grid: 1 column stacked on mobile, 2 columns at M/L (≥801px).
   *  'stack'   — single full-width column of horizontal (row) cards at every width.
   */
  layout: { type: String, default: 'wrap' },
  /**
   * Explicit column count at ≥641px (S/M/L), overriding the default 4-up
   * grid — e.g. Codashop's 5-up "Select Recharge" grid (config.skuList.columns).
   * null (default) keeps today's fixed 2→4 behaviour. Ignored when layout is
   * 'columns' or 'stack', which have their own fixed arrangements.
   */
  columns: { type: Number, default: null },
})
</script>

<template>
  <div class="sku-list">
    <h2 v-if="title" class="sku-list__title text-style-heading-banner">{{ title }}</h2>
    <div
      class="sku-list__grid"
      :class="{
        'sku-list__grid--columns': layout === 'columns',
        'sku-list__grid--stack': layout === 'stack',
      }"
      :style="columns && layout === 'wrap' ? { '--sku-columns': columns } : null"
    >
      <SkuCard
        v-for="(item, index) in items"
        :key="index"
        v-bind="item"
        :cp-icon="cpIcon"
        :sku-image="item.skuImage ?? skuImage"
        :anim-delay="index * 90"
        :base-delay="baseDelay"
        :layout="layout === 'columns' || layout === 'stack' ? 'row' : 'default'"
      />
    </div>
  </div>
</template>

<style scoped>
.sku-list {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  width: 100%;
}

.sku-list__title {
  text-transform: uppercase;
  color: var(--x-text-header-default);
  margin: 0;
  display: block;
}

/* Base grid: 2 columns on mobile, 4 at ≥ S breakpoint (641px container).
   Container queries resolve against .device__screen (container-type: inline-size),
   which is the FULL screen width, not this grid's own (possibly narrower, e.g.
   nested inside Codashop's padded catalog-card) rendered width — see
   docs/grid-layout-system.md's "Known limitation — anonymous container queries".
   A rigid `repeat(N, 1fr)` at this breakpoint has no fallback when N columns
   don't actually fit the grid's real width: cards shrink below their own
   min-width and the row overflows instead of wrapping. `auto-fill` fixes this:
   each column's minimum basis is "the width N even columns would need" (so at
   L, with enough room, exactly N columns render — pixel-identical to the old
   fixed rule) but --sku-card's own 130px floor wins via max() when there
   isn't enough room, so auto-fill naturally drops to fewer columns (more
   rows) instead of overflowing. The --columns modifier below overrides this
   for the explicit stacked demo. */
.sku-list__grid {
  display: grid;
  gap: var(--x-gap-content-default);
  grid-template-columns: repeat(2, 1fr);
}
@container (min-width: 641px) {
  /* --sku-columns (set inline via the `columns` prop) overrides the default
     4-up count — falls back to 4 when the prop is unset. */
  .sku-list__grid {
    grid-template-columns: repeat(
      auto-fill,
      minmax(max(130px, calc((100% - (var(--sku-columns, 4) - 1) * var(--x-gap-content-default)) / var(--sku-columns, 4))), 1fr)
    );
  }
}

/* Explicit-column variant — stacked on mobile, 2-up from the M breakpoint.
   The container query resolves against .device__screen (container-type:
   inline-size), so 801px is the device-screen width, not the viewport. */
.sku-list__grid--columns {
  display: grid;
  grid-template-columns: 1fr; /* mobile: 1 per row, stacked */
}
@container (min-width: 801px) {
  .sku-list__grid--columns { grid-template-columns: 1fr 1fr; }
}

/* Stack variant — single full-width column of row cards at every width
   (no breakpoint → never goes multi-column). */
.sku-list__grid--stack {
  display: grid;
  grid-template-columns: 1fr;
}
</style>
