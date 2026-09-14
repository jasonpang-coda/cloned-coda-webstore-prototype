<script setup>
import { ref, computed } from 'vue'
import { useCheckout } from '../composables/useCheckout.js'
import { useSkuRegistry } from '../composables/useSkuRegistry.js'
import { useHaptics } from '../composables/useHaptics.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'

/**
 * HeroSkuCard — a full-width landscape showcase card for a premium NAMED product
 * (a game edition, a flagship bundle), as opposed to a currency/coin SKU. Key art
 * fills the card; a bottom-up scrim keeps the overlaid name, "what's included"
 * chips and discounted price legible. Tapping opens the shared checkout sheet.
 *
 * Distinct from BestSellerCard (which centres a currency coin + bonus breakdown):
 * this card leads with a product name + an includes list, the shape an edition or
 * collector's pack needs. Theme-agnostic — the gilded border, scrim void colour and
 * accent all come from semantic tokens, so any store can use it with zero edits.
 *
 * Ring effect is a capability flag (config.sku.heroRingEffect, default 'dual' —
 * the two-comet running border every store used before this flag existed) —
 * shared with BestSellerCard's own ring selection, since both play the same
 * "flagship hero SKU" role depending on catalog.mode/cardType. A store may opt
 * into a calmer fx-glow-border-* family member instead (e.g. MGSSE's
 * 'camo-breathe' — see src/tokens/effects.css).
 */
const props = defineProps({
  /** Tier eyebrow above the title, e.g. "ULTIMATE EDITION". */
  eyebrow: { type: String, default: '' },
  /** Product name, e.g. "Voidfarer Edition". */
  title: { type: String, required: true },
  /** One-line supporting blurb. */
  description: { type: String, default: null },
  /** What's included — rendered as chips, e.g. ["Base Game","Season Pass"]. */
  includes: { type: Array, default: () => [] },
  /** Full-bleed key-art background. */
  image: { type: String, required: true },
  /** Square product image shown in the checkout banner thumb. */
  skuImage: { type: String, default: null },
  /** Displayed price, e.g. "$44.50". */
  currentPrice: { type: String, required: true },
  /** Original (crossed-out) price. */
  originalPrice: { type: String, default: null },
  /** Discount percentage label, e.g. "-61%". */
  discountPercent: { type: String, default: null },
  /** Loyalty points earned on purchase — drives the checkout loyalty banner. */
  loyaltyPoints: { type: Number, default: null },
  /** Entrance cascade delay (ms). */
  baseDelay: { type: Number, default: 0 },
})

const { openCheckout, selectedKey, sheetOpen } = useCheckout()
const { haptic } = useHaptics()
const config = useStoreConfig()

const isPressed = ref(false)
const cardStyle = computed(() => ({ animationDelay: props.baseDelay + 'ms' }))

// See header comment — shared flag with BestSellerCard's ring selection.
const heroRingClass = computed(
  () => `fx-glow-border--${config.value.sku?.heroRingEffect ?? 'dual'}`
)

const itemKey = computed(() => `${props.title}|${props.currentPrice}`)
const isSelected = computed(() => sheetOpen.value && selectedKey.value === itemKey.value)

function buildItem () {
  // `amount: title` surfaces the product *name* in the checkout summary — the
  // same convention BundleSkuCard uses for named bundles.
  return {
    amount: props.title,
    label: props.title,
    currentPrice: props.currentPrice,
    originalPrice: props.originalPrice,
    discountPercent: props.discountPercent,
    bonusLabel: 'EDITION',
    skuImage: props.skuImage,
    loyaltyPoints: props.loyaltyPoints,
  }
}
// Makes this card checkout-deep-linkable via ?sku=<itemKey> — see
// useSkuRegistry.js / useUrlState.js.
useSkuRegistry().register(itemKey.value, buildItem)
function onSelect() {
  const opened = openCheckout(buildItem(), itemKey.value)
  if (opened) haptic('select')
}
</script>

<template>
  <div
    v-ripple
    class="hero-sku fx-bloom"
    :class="[heroRingClass, { 'hero-sku--pressed': isPressed, 'hero-sku--selected': isSelected }]"
    :style="cardStyle"
    @mousedown="isPressed = true"
    @mouseup="isPressed = false"
    @mouseleave="isPressed = false"
    @touchstart.passive="isPressed = true"
    @touchend.passive="isPressed = false"
    @click="onSelect"
  >
    <!-- Full-bleed key art + bottom-up legibility scrim -->
    <div class="hero-sku__media">
      <img :src="image" alt="" class="hero-sku__img" />
      <div class="hero-sku__scrim" aria-hidden="true" />
    </div>

    <!-- Overlaid content: text left, price right (same side-by-side pattern as BundleSkuCard) -->
    <div class="hero-sku__body">
      <div class="hero-sku__text">
        <span v-if="eyebrow" class="hero-sku__eyebrow text-style-utility-micro-uppercase">{{ eyebrow }}</span>
        <h3 class="hero-sku__title text-style-heading-section">{{ title }}</h3>
        <ul v-if="includes.length" class="hero-sku__includes">
          <li
            v-for="(item, i) in includes"
            :key="i"
            class="hero-sku__chip text-style-utility-micro-uppercase"
          >{{ item }}</li>
        </ul>
        <p v-if="description" class="hero-sku__desc text-style-utility-label-regular">{{ description }}</p>
      </div>

      <div class="hero-sku__price">
        <div v-if="originalPrice || discountPercent" class="hero-sku__discount">
          <span v-if="originalPrice" class="hero-sku__original text-style-utility-label-regular">{{ originalPrice }}</span>
          <span v-if="discountPercent" class="hero-sku__pct text-style-utility-label-bold">{{ discountPercent }}</span>
        </div>
        <span class="hero-sku__current text-style-heading-sku-title">{{ currentPrice }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-sku {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 220px;
  border-radius: var(--x-radius-container-s);
  /* No overflow:hidden here — it clips the bloom ::after halo and the
     selected-state ::before that expands beyond the card edge.
     Corner clipping is handled by overflow:hidden on __media instead. */
  cursor: pointer;
  background: var(--x-bg-sku-card-default);
  box-shadow: var(--x-shadow-card);
  transition:
    transform var(--x-motion-sku-hover),
    box-shadow var(--x-motion-sku-hover);
  animation-name: sku-enter;
  animation-duration: var(--x-motion-sys-duration-slow);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;
}

/* The running border ring comes from whichever global `.fx-glow-border-*`
   class heroRingClass resolves to (src/tokens/effects.css) — applied on the
   root element via the computed `:class` binding above. Default 'dual' (two-
   comet running border); colours are theme tokens (--x-fx-border-glow/hot,
   --x-fx-border-trail-glow/hot for variants that use a trail); every variant
   honours prefers-reduced-motion via its own reduced-motion guard. The
   `::before` ring inherits this element's border-radius. */
.hero-sku:hover {
  transform: translateY(-2px);
  box-shadow: var(--x-shadow-card-hover);
}
.hero-sku--pressed {
  transform: scale(0.98) !important;
  transition:
    transform var(--x-motion-sku-press),
    box-shadow var(--x-motion-sku-press);
}
.hero-sku--selected {
  background: var(--x-bg-card-selected);
  box-shadow: var(--x-shadow-card-selected);
  transition: box-shadow var(--x-motion-sku-select);
}
/* Selected: a static (non-spinning) thicker ring in the selection colour.
   Scoped specificity (0,2,1) wins over any single fx-glow-border-*::before
   (0,1,1), whichever variant heroRingClass resolves to. */
.hero-sku--selected::before {
  inset: calc(-1 * var(--border-weight-selected));
  padding: var(--border-weight-selected);
  background: var(--x-border-sku-card-selected);
  animation: none;
}

.hero-sku__media {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  overflow: hidden; /* clips image corners now that the root has no overflow:hidden */
}

/* Bloom halo — bleeds outside the card for the ambient glow. Larger inset than
   the .fx-bloom default (-2%) to give a more prominent hero-card presence. */
.hero-sku::after {
  inset: -8%;
  filter: blur(48px) brightness(1.05) saturate(1.1);
}
.hero-sku__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  display: block;
}
.hero-sku__scrim {
  position: absolute;
  inset: 0;
  background: var(--x-gradient-hero-scrim);
}

/* Content sits over the scrim, pinned to the bottom of the card.
   Row layout mirrors BundleSkuCard: text on the left, price on the right. */
.hero-sku__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--x-gap-content-default);
  width: 100%;
  padding: var(--x-pad-surface-l) var(--x-pad-surface-m) var(--x-pad-surface-m);
}

.hero-sku__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-narrow);
}

.hero-sku__eyebrow {
  color: var(--x-text-hyperlink-default);
}

.hero-sku__title {
  margin: 0;
  color: var(--x-text-header-default);
  text-transform: uppercase;
}

.hero-sku__includes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--x-gap-content-tight);
  padding-top: var(--x-pad-surface-xxs);
}
.hero-sku__chip {
  display: inline-flex;
  align-items: center;
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-s);
  border-radius: var(--x-radius-badge-full);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  background: var(--x-bg-card-default);
  color: var(--x-text-body-default);
}

.hero-sku__desc {
  margin: 0;
  color: var(--x-text-body-default);
}

/* Price block — aligns bottom-right of the card. */
.hero-sku__price {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--x-gap-content-tight);
}
.hero-sku__discount {
  display: flex;
  align-items: baseline;
  gap: var(--x-gap-content-tight);
}
.hero-sku__original {
  color: var(--x-text-body-default);
  text-decoration: line-through;
}
.hero-sku__pct {
  color: var(--x-text-success-default);
}
.hero-sku__current {
  color: var(--x-text-hyperlink-default);
  transform-origin: right center;
}
</style>
