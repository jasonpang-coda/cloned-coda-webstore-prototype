<script setup>
import { computed } from 'vue'
import SkuTag from './SkuTag.vue'

/**
 * BundleItem — one child SKU tile inside a bundle's breakdown row.
 * Shows the square SKU image on a rarity-graded background, with an optional
 * tag pill on top (Bonus / Loyalty) and a quantity badge in the bottom-right.
 * Rarity drives the tile fill via the --rarity-gradient-* tokens; unranked
 * items fall back to the neutral near-white fill.
 */
const props = defineProps({
  /** Square SKU image src (e.g. Crate / CP coin / AP coin). Null for empty placeholder tiles. */
  image: { type: String, default: null },
  /**
   * Tile background — accepts any CSS background value (gradient, colour) OR a
   * plain image URL (Vite asset import). Image URLs are detected by path pattern
   * and wrapped with `center / cover` sizing automatically. Null = neutral fill.
   */
  tileBg: { type: String, default: null },
  /** Optional top pill, e.g. { label: 'BONUS', variant: 'value' } | { label: 'Loyalty' } */
  tag: { type: Object, default: null },
  /** Quantity badge (bottom-right), e.g. 5 / 160 / 99 */
  quantity: { type: [Number, String], default: null },
})

// Emitted when the tile is tapped. The parent BundleSkuCard decides what to do
// (e.g. open the Item Summary sheet) — we don't stop propagation here, so stores
// that don't opt in still let the click bubble to the card's default action.
const emit = defineEmits(['select'])

const _IS_URL = /^(\/|https?:|data:|blob:)|\.(?:webp|jpe?g|png|gif|svg|avif)(\?|$)/i

// Resolve the tile background to a CSS background shorthand.
// Image URLs get cover sizing; CSS gradient/colour strings are used verbatim.
const tileStyle = computed(() => {
  const bg = props.tileBg
  if (!bg) return { background: 'var(--x-rarity-gradient-neutral)' }
  if (bg.startsWith('url(') || _IS_URL.test(bg)) {
    const src = bg.startsWith('url(') ? bg : `url('${bg}')`
    return { background: `${src} center / cover no-repeat` }
  }
  return { background: bg }
})
</script>

<template>
  <div class="bundle-item" :class="{ 'bundle-item--empty': !image }" :style="tileStyle" @click="emit('select', $event)">
    <SkuTag v-if="tag" class="bundle-item__tag" :label="tag.label" :variant="tag.variant ?? 'value'" />

    <img v-if="image" :src="image" alt="" class="bundle-item__img" />

    <span v-if="quantity !== null" class="bundle-item__qty">
      <span class="bundle-item__condense text-style-utility-label-regular">{{ quantity }}</span>
    </span>
  </div>
</template>

<style scoped>
.bundle-item--empty {
  width: 58.8px;
  height: 58.8px;
}

.bundle-item {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--x-pad-surface-xs); /* 4px → 56px image inside a 64px tile */
  border-radius: var(--x-radius-container-xs);
  backdrop-filter: blur(64px);
  -webkit-backdrop-filter: blur(64px);
  /* will-change promotes the tile to its own compositor layer, bypassing the
     Safari bug where backdrop-filter stops working inside overflow:hidden parents */
  will-change: backdrop-filter;
}

/* Tokenised gradient border ring — same mask-composite effect as the SKU card */
.bundle-item::before {
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
  z-index: 2;
}

.bundle-item__img {
  width: 56px;
  height: 56px;
  object-fit: contain;
  display: block;
  pointer-events: none;
  z-index: 1;
}

/* Tag pill — straddles the top edge, centred. Visual styling is in SkuTag. */
.bundle-item__tag {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
}

/* Condense only the badge TEXT (not the pill box) so the glyphs match the
   project's Hitmarker condense without scaling the background/padding.
   display/transform/transform-origin are handled by the .text-style-* class. */
.bundle-item__condense {
  transform-origin: center center;
}

/* Quantity badge — bottom-right corner */
.bundle-item__qty {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 2;
  min-width: 16px;
  padding: var(--x-pad-surface-xxs);
  border-radius: var(--x-radius-control-xs);
  background: var(--x-bg-indicator-neutral-default);
  color: var(--x-text-body-default);
  line-height: 1;
  text-align: center;
}
</style>
