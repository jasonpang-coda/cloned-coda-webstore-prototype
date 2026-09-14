<script setup>
import { ref, computed } from 'vue'
import { useCheckout } from '../composables/useCheckout.js'
import { useSkuRegistry } from '../composables/useSkuRegistry.js'
import { useHaptics } from '../composables/useHaptics.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useFeatureFlags } from '../composables/useFeatureFlags.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import SkuTag from './SkuTag.vue'
import BundleBreakdown from './BundleBreakdown.vue'
import { formatNumber } from '../utils/formatNumber.js'

const props = defineProps({
  /** Main currency amount shown large, e.g. 460 */
  amount: { type: Number, required: true },
  /** Base amount before bonus, e.g. 400 */
  baseAmount: { type: Number, default: null },
  /** Bonus amount, e.g. 60 */
  bonusAmount: { type: Number, default: null },
  /** Controls bonus text colour: 'codashop' = purple, 'cp' = blue */
  bonusType: { type: String, default: 'codashop' },
  /** Label for the bonus — passed from parent (strings.sku.bonusLabel); empty string fallback. */
  bonusLabel: { type: String, default: '' },
  /** Original (crossed-out) price, e.g. "$4.99" */
  originalPrice: { type: String, default: null },
  /** Discount percentage label, e.g. "-49%" */
  discountPercent: { type: String, default: null },
  /** Displayed price, e.g. "$2.50" */
  currentPrice: { type: String, required: true },
  /** Shows the "Best Value" badge */
  isBestValue: { type: Boolean, default: false },
  /** Custom badge label — overrides isBestValue when set */
  tagLabel: { type: String, default: null },
  /** URL for the CP icon image */
  cpIcon: { type: String, default: null },
  /** Square SKU product image — shown in the checkout banner thumb */
  skuImage: { type: String, default: null },
  /** Loyalty points earned on purchase — drives the checkout loyalty banner
      (stores whose config enables it; ignored elsewhere). */
  loyaltyPoints: { type: Number, default: null },
  /** Optional supporting line below the amount/bonus, e.g. "10% more FC Points than in-game*" */
  subtitle: { type: String, default: null },
  /** Per-card stagger delay in ms */
  animDelay: { type: Number, default: 0 },
  /** Section base delay offset in ms (cascades sections top-to-bottom) */
  baseDelay: { type: Number, default: 0 },
  /** Optional bundled child items: [{ image, tileBg, tag, quantity }]. When set,
      a breakdown row of BundleItem tiles renders below the amount/bonus block
      (shape + rendering per BundleBreakdown, shared with SkuImageCard/BestSellerCard). */
  items: { type: Array, default: () => [] },
  /**
   * Card orientation:
   *  'default' — vertical column (badge → info → breakdown, price pinned to bottom).
   *  'row'     — horizontal row (left: badge + info + breakdown; right: price).
   */
  layout: { type: String, default: 'default' },
})

const isPressed = ref(false)

// Tap → open checkout (no-op when signed out; the composable gates on auth).
const { openCheckout, isItemSelected } = useCheckout()
const { haptic } = useHaptics()
const itemKey = computed(() => `${props.amount}|${props.currentPrice}`)
// isItemSelected also requires sheetOpen in sheet mode (unchanged behaviour);
// inline mode (Codashop) has no sheet, so a tap alone marks the card selected.
const isSelected = computed(() => isItemSelected(itemKey.value))
function buildItem () {
  return {
    amount: props.amount,
    baseAmount: props.baseAmount,
    bonusAmount: props.bonusAmount,
    bonusType: props.bonusType,
    bonusLabel: props.bonusLabel,
    currentPrice: props.currentPrice,
    skuImage: props.skuImage,
    loyaltyPoints: props.loyaltyPoints,
  }
}
// Makes this card checkout-deep-linkable via ?sku=<itemKey> — see
// useSkuRegistry.js / useUrlState.js.
useSkuRegistry().register(itemKey.value, buildItem)
function onSelect() {
  // Fire the 'select' haptic only when checkout actually opens — a gated no-op
  // tap (signed out) returns false and stays silent.
  const opened = openCheckout(buildItem(), itemKey.value)
  if (opened) haptic('select')
}

const strings = useStoreStrings()

// skuCardMaterial flag — experimental alternates to the card's default
// glass/frost treatment, physically classified per the material-fx skill
// (see the .sku-card--metal/--plastic/--carbonFibre rules below). Gated on
// the active store's OWN capability flag (config.skuCard.materialExploration
// — currently only Codashop's store.js sets this), never on theme.value
// directly, per useStoreConfig's whitelabel rule — every other store stays
// 'glass' (a no-op modifier class) regardless of the raw flag value, so
// flipping it in the toolbar can't leak into a store that didn't opt in.
const { flagValue } = useFeatureFlags()
const config = useStoreConfig()
const material = computed(() => (
  config.value.skuCard?.materialExploration ? flagValue('skuCardMaterial') : 'glass'
))

// Inline stagger delays — longhand animation props live in <style>.
const cardStyle = computed(() => ({ animationDelay: props.baseDelay + props.animDelay + 'ms' }))
// Price reveals after the card has finished its entrance (slow = 350ms).
const priceStyle = computed(() => ({ animationDelay: props.baseDelay + props.animDelay + 350 + 'ms' }))
</script>

<template>
  <div
    v-ripple
    class="sku-card"
    data-component="sku-card-entrance-stagger"
    :data-entrance-delay-ms="props.baseDelay + props.animDelay"
    :class="{
      'sku-card--pressed': isPressed,
      'sku-card--row': layout === 'row',
      'sku-card--selected': isSelected,
      [`sku-card--${material}`]: material !== 'glass',
    }"
    :style="cardStyle"
    @mousedown="isPressed = true"
    @mouseup="isPressed = false"
    @mouseleave="isPressed = false"
    @touchstart.passive="isPressed = true"
    @touchend.passive="isPressed = false"
    @click="onSelect"
  >
    <div class="sku-card__bg" aria-hidden="true" />

    <!-- Left column: badge + product info -->
    <div class="sku-card__left">
      <!-- Badge slot — always reserves height so amounts align across cards
           (matches Figma's opacity-0 placeholder tags). -->
      <div class="sku-card__badge-slot">
        <SkuTag v-if="tagLabel || isBestValue" class="sku-card__badge" :label="tagLabel ?? strings.sku.bestValue" variant="value" />
      </div>

      <!-- Product info: amount + icon + web bonus -->
      <div class="sku-card__info">
        <div class="sku-card__title">
          <img v-if="cpIcon" :src="cpIcon" :alt="strings.currency.name" class="sku-card__cp-icon" />
          <span v-else class="sku-card__icon-label text-style-utility-micro-bold">{{ strings.currency.abbr }}</span>
          <span class="sku-card__amount text-style-heading-sku-title">{{ formatNumber(amount) }}</span>
        </div>

        <div v-if="baseAmount !== null && bonusAmount !== null" class="sku-card__bonus text-style-utility-label-regular">
          <span class="sku-card__bonus-base">{{ formatNumber(baseAmount) }} + </span>
          <span class="sku-card__bonus-amount text-style-utility-label-bold">{{ formatNumber(bonusAmount) }} {{ bonusLabel }}</span>
        </div>
        <div v-if="subtitle" class="sku-card__subtitle text-style-utility-label-regular">{{ subtitle }}</div>

        <!-- Bundled child items — renders below the amount/bonus/subtitle block.
             Scrollable: this card's own footprint (flex 1 1 140px, min-width
             130px) is narrower than SkuImageCard's dedicated art panel, so a
             wide item set needs to scroll rather than squeeze every tile down. -->
        <BundleBreakdown v-if="items.length" :items="items" scrollable class="sku-card__breakdown" />
      </div>
    </div>

    <!-- Right column / price block -->
    <div class="sku-card__price" :style="priceStyle">
      <div v-if="originalPrice || discountPercent" class="sku-card__discount">
        <span v-if="originalPrice" class="sku-card__original-price text-style-utility-label-regular">{{ originalPrice }}</span>
        <span v-if="discountPercent" class="sku-card__discount-pct text-style-utility-label-regular">{{ discountPercent }}</span>
      </div>
      <div class="sku-card__current-price text-style-heading-sku-title">{{ currentPrice }}</div>
    </div>
  </div>
</template>

<style scoped>
.sku-card {
  position: relative;
  /* Fill the span; wrap responsively (2-up on phones → up to 5 on wide). */
  flex: 1 1 140px;
  min-width: 130px;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-narrow);
  padding: var(--x-pad-surface-m) var(--x-pad-surface-s) var(--x-pad-surface-l);
  /* Gradient border via ::before mask-composite (border-image can't combine
     with border-radius). The border fades from transparent at the top to
     white at the bottom-left/right — see ::before below. */
  border: 0;
  border-radius: var(--x-radius-container-s);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
  box-shadow: var(--x-shadow-card);
  overflow: hidden;
  cursor: pointer;

  /* Entrance — animation LONGHANDS (shorthand + comma-easing var is invalid).
     Slower, deliberate cascade (slow = 350ms). */
  animation-name: sku-enter;
  animation-duration: var(--x-motion-sys-duration-slow);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;
  /* animation-delay supplied inline for stagger */

  /* Hover-out / resting transition — controls return from hover */
  transition:
    transform var(--x-motion-sku-hover),
    border-color var(--x-motion-sku-hover),
    box-shadow var(--x-motion-sku-hover);
}

/* Gradient border — mask-composite technique. The pseudo fills the card;
   masking out the padding-box leaves only a 1px gradient ring. The gradient
   itself lives in --x-border-sku-card-default (style.css), which the HDR @media block
   there upgrades automatically for wide-gamut panels. */
.sku-card::before {
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
  transition: background var(--x-motion-sku-hover);
}

/* Soft hover: card lifts with ease-out (hover-in transition overrides here) */
.sku-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--x-shadow-card-hover);
  transition:
    transform var(--x-motion-sku-hover-in),
    border-color var(--x-motion-sku-hover-in),
    box-shadow var(--x-motion-sku-hover-in);
}
.sku-card:hover::before {
  background: var(--x-border-sku-card-hover);
}
.sku-card--selected::before {
  background: var(--x-border-sku-card-selected);
  padding: var(--border-weight-selected);
}
.sku-card--selected {
  box-shadow: var(--x-shadow-card-selected);
  /* transform was missing here — a selected card's hover lift (.sku-card:hover's
     translateY) had no transition of its own in this rule, so it snapped back
     instantly on mouse-out instead of animating like border-color/box-shadow
     did, reading as a jarring two-step lag. Included now so all three ease
     together regardless of which state is currently governing the element. */
  transition:
    transform var(--x-motion-sku-select),
    border-color var(--x-motion-sku-select),
    box-shadow var(--x-motion-sku-select);
}

.sku-card--pressed {
  transform: scale(var(--x-motion-sku-press-scale)) !important;
  transition:
    transform var(--x-motion-sku-press),
    border-color var(--x-motion-sku-press);
}

/* Ripple wave sits above the background (z-0) but below the content (z-1)
   and the gradient border ring (z-2). */
.sku-card :deep(.fx-ripple__wave) {
  z-index: 1;
}

.sku-card__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  background: var(--x-bg-sku-card-default);
  /* filter is here too (not a separate rule) — the metal/carbonFibre variants'
     hover brightness-lift needs its own transition, and a second .sku-card__bg
     rule declaring `transition: filter …` later in the cascade would silently
     replace this whole property instead of adding to it. */
  transition:
    background var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate),
    filter var(--x-motion-sku-hover-in);
}
.sku-card--selected .sku-card__bg {
  background: var(--x-bg-card-selected);
}

/* Left wrapper — in default column layout this is a transparent passthrough;
   in row layout it becomes the flex-1 left column (see .sku-card--row below). */
.sku-card__left {
  display: contents; /* no box in column mode — children flow directly into .sku-card */
}

/* ── Row variant (layout='row') ─────────────────────────────────────────────
   Used by SkuList when layout='columns'/'stack' (horizontal cards).
   Left: badge + product info; Right: price stack. */
.sku-card--row {
  flex-direction: row;
  align-items: center;
  gap: var(--x-gap-content-default);
}
.sku-card--row .sku-card__left {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
  flex: 1;
  min-width: 0;
}
/* No badge → no reserved space in the horizontal layout */
.sku-card--row .sku-card__badge-slot:empty { display: none; }
.sku-card--row .sku-card__price {
  margin-top: 0;
  align-items: flex-end;
  flex-shrink: 0;
}

/* Badge slot reserves a constant height → amount rows align across all cards */
.sku-card__badge-slot {
  min-height: 16px;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

/* SkuTag handles all visual styling. Only the pop entrance animation is here. */
.sku-card__badge {
  animation-name: pop;
  animation-duration: var(--x-motion-sys-duration-slow);
  animation-timing-function: var(--x-motion-sys-ease-spring);
  animation-fill-mode: both;
}

/* Product info */
.sku-card__info {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-narrow);
  position: relative;
  z-index: 1;
}

.sku-card__title {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-narrow); /* 4px CSS gap */
}


.sku-card__amount {
  /* font-size from .text-style-heading-sku-title (applied in template); scaleX condense
     and transform-origin: left center come from the class — dead space sits on the right. */
  text-transform: uppercase;
  color: var(--x-text-header-default);
  white-space: nowrap;
}

.sku-card__cp-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: block;
}

.sku-card__icon-label {
  color: var(--x-text-icon-muted);
  white-space: nowrap;
  text-transform: uppercase;
}

.sku-card__bonus {
  display: block;
  text-transform: uppercase;
  white-space: nowrap;
}

.sku-card__bonus-base { color: var(--x-text-body-default); }
.sku-card__bonus-amount { color: var(--x-text-bonus-amount); }

.sku-card__subtitle {
  color: var(--x-text-body-default);
}

/* Bleeds edge-to-edge past the card's own horizontal padding (--x-pad-surface-s)
   so BundleItem tiles use the full card width — matches SkuImageCard/BestSellerCard's
   own breakdown-row bleed.

   padding-top clears BundleItem's tag pill, which straddles -8px above the
   tile (see .bundle-item__tag). .sku-card__info's own flex gap alone
   (--x-gap-content-narrow, 4px — --x-gap-content-tight in row layout, 2px)
   isn't enough clearance: the pill's own stacking context (this element is
   `position: relative`) always paints above the non-positioned bonus/subtitle
   sibling above it, so a too-small gap reads as the pill overlapping that
   text rather than being neatly clipped. --x-pad-surface-s (8px) plus the
   existing gap gives the pill full clearance in both layouts. */
.sku-card__breakdown {
  position: relative;
  z-index: 1;
  margin: 0 calc(-1 * var(--x-pad-surface-s));
  padding: var(--x-pad-surface-s) var(--x-pad-surface-s) 0;
}

/* Row layout: no horizontal bleed (the row's left column isn't full card
   width) — keep only the top clearance. */
.sku-card--row .sku-card__breakdown {
  margin: 0;
  padding: var(--x-pad-surface-s) 0 0;
}

/* Price — pinned to the bottom so prices align across cards */
.sku-card__price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--x-gap-content-tight);
  margin-top: auto;
  padding-top: var(--x-pad-surface-s);
  position: relative;
  z-index: 1;
  animation-name: fade-in;
  animation-duration: var(--x-motion-sys-duration-slow);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;
  /* animation-delay supplied inline */
}

.sku-card__discount {
  display: flex;
  gap: var(--x-gap-content-tight);
  align-items: baseline;
  align-self: flex-end;
}

.sku-card__original-price {
  color: var(--x-text-body-default);
  text-decoration: line-through;
  white-space: nowrap;
  /* Anchor condense to the right so the text's right edge meets the 2px gap —
     eliminates trailing whitespace that would otherwise widen the visual gap. */
  transform-origin: right center;
}

.sku-card__discount-pct {
  color: var(--x-text-success-default);
  white-space: nowrap;
  /* Right-anchor matches the current-price below — visual right edge aligns
     with the price CTA regardless of how much the text condenses. */
  transform-origin: right center;
}

.sku-card__current-price {
  text-transform: uppercase;
  color: var(--x-text-hyperlink-default);
  white-space: nowrap;
  /* Price is right-aligned — override the default left-origin condense */
  transform-origin: right center;
}

/* ── Material variants (skuCardMaterial flag, useFeatureFlags.js) ───────────
   'glass' (default, no modifier class) is the card's existing frosted-blur
   treatment above, untouched. The three alternates are deliberately
   RESTRAINED "suggested material" finishes — a full-surface fill (a narrow
   lightness band near Codashop's own dark violet card, not a generic
   material colour), a thin edge, and ONE highlight cue — not literal
   material-fx simulations. See .claude/skills/material-fx/codashop-
   mapping.md for the full rationale (carbon fibre in particular drops the
   physically-mandated woven-twill pattern — too busy under SKU price/bonus
   text in a real grid). Values live in themes/codashop.css's --x-fx-*
   tokens (extension tier, per codm-mapping.md's "where new FX tokens
   belong") — this component never reads a --palette-* step directly.

   OPAQUE materials — a conductor (metal) or a pigmented dielectric
   (plastic, carbon fibre) transmits nothing, so per material-fx there is
   nothing behind them to blur; backdrop-filter comes off entirely.

   Highlight model: only PLASTIC gets a travelling sweep — the one material
   here with a real (if weak) travelling white highlight (materials.md
   §Plastic-gloss). Satin metal and dark carbon fibre have no discrete
   specular lobe to animate (§Metal-matte/brushed, §Carbon-fibre's clearcoat
   is the ONLY lobe, and it's static here since the full per-cell weave
   animation is out of scope) — their highlight is a static gradient layered
   directly into .sku-card__bg's background-image list, so it can't clip;
   hover is just a brightness lift, no moving element. */
.sku-card--metal,
.sku-card--plastic,
.sku-card--carbonFibre {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

/* Metal — satin, not chrome. Static soft highlight baked into the fill
   (top-left radial, low opacity) rather than a mirror gradient or a
   travelling comet — a satin surface has a broad, low-contrast reflection
   that doesn't read as a discrete moving highlight (materials.md
   §Metal-matte/brushed). Hover brightens the whole surface slightly. */
.sku-card--metal .sku-card__bg {
  background: var(--x-fx-metal-sheen, transparent), var(--x-fx-metal-fill, var(--x-bg-sku-card-default));
}
.sku-card--metal:hover .sku-card__bg {
  filter: brightness(1.12);
}
.sku-card--metal.sku-card::before {
  background: var(--x-fx-metal-edge, var(--x-border-sku-card-default));
}

/* Plastic — gloss pigmented dielectric, flat saturated fill (materials.md:
   "strong, saturated diffuse colour dominates" — no directional gradient,
   unlike metal's satin band). The ONE travelling highlight in the set: a
   tight, weak, neutral-white sweep, never tinted to the fill (materials.md's
   plastic-vs-metal tell). The sweep pseudo is OVERSIZED (well past the
   card's own left/right edges) before the skew is applied — a card is far
   taller/narrower than the buttons .fx-shimmer was designed for, so an
   inset:0 pseudo's skewed parallelogram doesn't fully cover a tall card's
   corners at every point of its travel, leaving triangular gaps. Widening
   the box first means the skewed shape still fully covers the card
   throughout the sweep; .sku-card's own overflow:hidden clips the excess. */
.sku-card--plastic .sku-card__bg {
  background: var(--x-fx-plastic-fill, var(--x-bg-sku-card-default));
}
.sku-card--plastic.sku-card::before {
  background: var(--x-fx-plastic-edge, var(--x-border-sku-card-default));
}
.sku-card--plastic .sku-card__bg::after {
  content: '';
  position: absolute;
  inset: 0 -60%;
  pointer-events: none;
  background: var(--x-fx-plastic-sheen, transparent);
  transform: translate3d(-150%, 0, 0) skewX(-20deg);
}
.sku-card--plastic:hover .sku-card__bg::after {
  animation: gloss-sweep var(--x-motion-shimmer-sweep) var(--x-motion-sys-ease-decelerate);
}
@media (prefers-reduced-motion: reduce) {
  .sku-card--plastic:hover .sku-card__bg::after {
    animation: none;
  }
}

/* Carbon fibre — dark technical surface, no weave. Darkest of the three
   (near-black, not pure black, per materials.md's tell), with ONE soft
   static diagonal highlight standing in for the material's anisotropic
   character — nowhere near the busy literal twill this replaces. Hover
   brightens the whole surface slightly, same as metal. */
.sku-card--carbonFibre .sku-card__bg {
  background: var(--x-fx-carbon-sheen, transparent), var(--x-fx-carbon-fill, var(--x-bg-sku-card-default));
}
.sku-card--carbonFibre:hover .sku-card__bg {
  filter: brightness(1.15);
}
.sku-card--carbonFibre.sku-card::before {
  background: var(--x-fx-carbon-edge, var(--x-border-sku-card-default));
}
</style>
