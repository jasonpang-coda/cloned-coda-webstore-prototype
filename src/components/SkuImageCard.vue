<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCheckout } from '../composables/useCheckout.js'
import { useSkuRegistry } from '../composables/useSkuRegistry.js'
import { useItemSummary } from '../composables/useItemSummary.js'
import { useHaptics }  from '../composables/useHaptics.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { formatNumber } from '../utils/formatNumber.js'
import SkuTag from './SkuTag.vue'
import BundleBreakdown from './BundleBreakdown.vue'
import Button from './Button.vue'
const strings = useStoreStrings()

/**
 * SkuImageCard — an image-led SKU card with three layouts (store-agnostic; the
 * variant is chosen by the data layer, never by store identity):
 *
 *  'panel'      — the SKU art sits in a dedicated 1:1 square panel at the top,
 *                 text below (Figma node 2655:14676).
 *  'background' — the SKU art is an oversized, bottom-anchored full-bleed
 *                 background, cropped by the card edge, with a dark overlay so
 *                 the text stays readable (Figma node 2563:3197).
 *  'prod'       — the FCM production-SKU-card pilot (fcmSkuCardModel flag,
 *                 Figma node 24732:16873). Info block ABOVE the art (opposite
 *                 order from 'panel'), a dark reward strip, then a champagne
 *                 gold price bar — square corners, an OUTSIDE 1px hairline
 *                 (not the gradient mask-border the other variants use).
 *                 Deliberately omits two Figma elements that need data this
 *                 card doesn't carry: the inline "info" glyph beside the
 *                 title, and a "Purchase Limit" line — both cosmetic, neither
 *                 backed by an existing prop. Card background is a shared
 *                 raster image (--x-bg-image-sku-card-prod), not per-SKU art.
 *
 * Motion + haptics mirror SkuCard exactly: staggered entrance, price reveal,
 * hover lift, press scale, ripple, and a gated 'select' haptic on a real open.
 * The title is a bare amount — no currency icon (currency differs per store).
 */
const props = defineProps({
  /** Main amount shown large, e.g. 460. Null for non-numeric SKUs (e.g. Daily Boosters). */
  amount: { type: Number, default: null },
  /** Displayed price, e.g. "$2.50" */
  currentPrice: { type: String, required: true },
  /** Square SKU product image — rendered as the panel art / background, and
      passed to the checkout banner thumb. */
  skuImage: { type: String, default: null },
  /** Original (crossed-out) price, e.g. "$4.99" — optional */
  originalPrice: { type: String, default: null },
  /** Discount percentage label, e.g. "-49%" — optional */
  discountPercent: { type: String, default: null },
  /** Base amount before bonus, e.g. 400 — optional (renders the bonus line with bonusAmount) */
  baseAmount: { type: Number, default: null },
  /** Bonus amount, e.g. 60 — optional */
  bonusAmount: { type: Number, default: null },
  /** Bonus label (passed from parent strings); empty string fallback */
  bonusLabel: { type: String, default: '' },
  /** Loyalty points earned — drives the checkout loyalty banner + the optional inline row */
  loyaltyPoints: { type: Number, default: null },
  /** Loyalty (MP) icon for the optional inline loyalty row */
  loyaltyIcon: { type: String, default: null },
  /** Currency name appended to the amount, e.g. "FC Points" or "Silver" */
  currencyLabel: { type: String, default: '' },
  /** Product name — 'prod' variant only. For plain currency SKUs the title
   *  line is just amount+currencyLabel (no separate name exists); bundle/gift
   *  items (Campaign Packs, Daily Gift) DO have a real product name distinct
   *  from any amount, so this takes precedence over amount+currencyLabel
   *  when set. */
  title: { type: String, default: null },
  /** Optional short description line below the amount */
  subtitle: { type: String, default: null },
  /** Optional full-bleed background image behind the card surface (panel variant).
      When set, renders beneath the L1 scrim so the dark tint applies over it. */
  backgroundImage: { type: String, default: null },
  /** Custom badge label — renders a SkuTag above the amount when set */
  tagLabel: { type: String, default: null },
  /** Shorthand to show the default BEST VALUE badge without a custom label */
  isBestValue: { type: Boolean, default: false },
  /** Layout variant: 'background' | 'panel' | 'prod' */
  variant: { type: String, default: 'panel' },
  /** Optional bundled child items: [{ image, tileBg, tag, quantity }]. When set,
      a breakdown row of BundleItem tiles renders below the SKU art. */
  items: { type: Array, default: () => [] },
  /** SKU info bottom sheet (ItemSummarySheet, config.itemSummary) contents —
      [{ image, name, quantity, description }]. When set, an (i) icon renders
      at the end of the title; tapping it opens the sheet instead of checkout.
      Null (default) omits the icon entirely — e.g. FCM's Top Ups currencies. */
  infoItems: { type: Array, default: null },
  /** Per-card stagger delay in ms */
  animDelay: { type: Number, default: 0 },
  /** Section base delay offset in ms (cascades sections top-to-bottom) */
  baseDelay: { type: Number, default: 0 },
})

const isPressed = ref(false)

const { openCheckout, isItemSelected } = useCheckout()
const { openItemSummary } = useItemSummary()
const { haptic } = useHaptics()

// Stable identity for this card — used to highlight it while its sheet is open
// (sheet mode), while the Buy Now bar is docked, or — inline checkout, no
// sheet at all — for as long as it stays the active selection. isItemSelected()
// already resolves all three presentations correctly; a local sheetOpen-only
// check here (the previous approach) always read false for inline stores.
const itemKey = computed(() => `${props.currencyLabel}|${props.amount}|${props.currentPrice}`)
const isSelected = computed(() => isItemSelected(itemKey.value))

function buildItem () {
  return {
    // Bundle/gift items (Campaign Packs, Daily Gift) have a real product name
    // distinct from amount+currencyLabel — same `label` field ItemSummarySheet
    // passes for bundles, so CheckoutSheet/BuyNowBar/OrderSummarySheet's shared
    // "label || amount+currencyLabel" fallback picks it up with no other change.
    label: props.title || null,
    amount: props.amount,
    currencyLabel: props.currencyLabel || null,
    subtitle: props.subtitle || null,
    baseAmount: props.baseAmount,
    bonusAmount: props.bonusAmount,
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
  const opened = openCheckout(buildItem(), itemKey.value)
  if (opened) haptic('select')
}

// (i) icon beside the title — opens the info sheet instead of checkout.
// stopPropagation keeps the card-level onSelect (Buy Now dock) from also firing.
function onInfo(event) {
  event.stopPropagation()
  haptic('select')
  openItemSummary({
    title: props.title || props.currencyLabel,
    currentPrice: props.currentPrice,
    originalPrice: props.originalPrice,
    discountPercent: props.discountPercent,
    subtitle: props.subtitle,
    skuImage: props.skuImage,
    loyaltyPoints: props.loyaltyPoints,
    items: props.infoItems,
  })
}

// Inline stagger delays — longhand animation props live in <style>.
const cardStyle = computed(() => ({ animationDelay: props.baseDelay + props.animDelay + 'ms' }))
// Price reveals after the card has finished its entrance (slow = 350ms).
const priceStyle = computed(() => ({ animationDelay: props.baseDelay + props.animDelay + 350 + 'ms' }))

// Image load state — the SKU .webp can be heavy, so we show a skeleton
// placeholder and only reveal the real image once it has finished decoding.
const imgEl = ref(null)
const imgLoaded = ref(false)
function onImgReady() { imgLoaded.value = true }
onMounted(() => {
  // A cached image can already be complete before @load binds — catch that case.
  const el = imgEl.value
  if (el && el.complete && el.naturalWidth > 0) imgLoaded.value = true
})
</script>

<template>
  <!-- 'prod' — separate top-level branch, not sprinkled v-ifs: content ORDER
       inverts (info block above the art, not below) and the footer is a
       reward strip + gold price bar instead of the shared price block, so
       reusing the existing markup piecemeal would be more confusing than a
       second template. -->
  <div
    v-if="variant === 'prod'"
    v-ripple
    class="sku-image-card sku-image-card--prod"
    :class="{ 'sku-image-card--pressed': isPressed, 'sku-image-card--selected': isSelected }"
    :style="cardStyle"
    @mousedown="isPressed = true"
    @mouseup="isPressed = false"
    @mouseleave="isPressed = false"
    @touchstart.passive="isPressed = true"
    @touchend.passive="isPressed = false"
    @click="onSelect"
  >
    <div class="sku-image-card__prod-info">
      <div class="sku-image-card__prod-title">
        <template v-if="title">
          <span>{{ title }}</span>
        </template>
        <template v-else>
          <span v-if="amount !== null">{{ formatNumber(amount) }}</span>
          <span v-if="currencyLabel">{{ currencyLabel }}</span>
        </template>
        <Button
          v-if="infoItems"
          variant="icon"
          size="small"
          icon="info"
          icon-variant="outlined"
          aria-label="Item info"
          class="sku-image-card__info-btn"
          @click="onInfo($event)"
        />
      </div>
      <p v-if="subtitle" class="sku-image-card__prod-subtitle">{{ subtitle }}</p>
    </div>

    <div class="sku-image-card__prod-art">
      <div v-if="skuImage && !imgLoaded" class="sku-image-card__skeleton fx-skeleton" />
      <img
        v-if="skuImage"
        ref="imgEl"
        :src="skuImage"
        alt=""
        class="sku-image-card__prod-art-img"
        :class="{ 'is-loaded': imgLoaded }"
        @load="onImgReady"
        @error="onImgReady"
      />
    </div>

    <div class="sku-image-card__prod-footer" :style="priceStyle">
      <div v-if="loyaltyPoints !== null" class="sku-image-card__prod-reward">
        <span
          v-if="loyaltyIcon"
          class="sku-image-card__loyalty-icon"
          aria-hidden="true"
          :style="{ '--loyalty-icon-url': `url(${loyaltyIcon})` }"
        />
        <span class="sku-image-card__prod-reward-label">{{ formatNumber(loyaltyPoints) }}</span>
      </div>
      <div class="sku-image-card__prod-price">{{ currentPrice }}</div>
    </div>
  </div>

  <div
    v-else
    v-ripple
    class="sku-image-card"
    :class="{
      'sku-image-card--pressed':    isPressed,
      'sku-image-card--selected':   isSelected,
      'sku-image-card--background': variant === 'background',
      'sku-image-card--panel':      variant === 'panel',
      'sku-image-card--has-bg':     backgroundImage !== null,
    }"
    :style="cardStyle"
    @mousedown="isPressed = true"
    @mouseup="isPressed = false"
    @mouseleave="isPressed = false"
    @touchstart.passive="isPressed = true"
    @touchend.passive="isPressed = false"
    @click="onSelect"
  >
    <!-- Full-bleed card background image — sits beneath the L1 scrim (__bg) -->
    <img
      v-if="backgroundImage"
      :src="backgroundImage"
      alt=""
      class="sku-image-card__card-bg"
      aria-hidden="true"
    />
    <div class="sku-image-card__bg" aria-hidden="true" />

    <!-- Background variant: oversized, bottom-anchored SKU art + dark overlay -->
    <template v-if="variant === 'background'">
      <div class="sku-image-card__bg-art" aria-hidden="true">
        <div v-if="skuImage && !imgLoaded" class="sku-image-card__skeleton fx-skeleton" />
        <img
          v-if="skuImage"
          ref="imgEl"
          :src="skuImage"
          alt=""
          class="sku-image-card__bg-img"
          :class="{ 'is-loaded': imgLoaded }"
          @load="onImgReady"
          @error="onImgReady"
        />
      </div>
      <div class="sku-image-card__overlay" aria-hidden="true" />
    </template>

    <!-- Panel variant: dedicated 1:1 square SKU art frame at the top -->
    <div v-else class="sku-image-card__panel" aria-hidden="true">
      <div v-if="skuImage && !imgLoaded" class="sku-image-card__skeleton fx-skeleton" />
      <img
        v-if="skuImage"
        ref="imgEl"
        :src="skuImage"
        alt=""
        class="sku-image-card__panel-img"
        :class="{ 'is-loaded': imgLoaded }"
        @load="onImgReady"
        @error="onImgReady"
      />
    </div>

    <!-- Bundled child items — renders below the SKU art when present -->
    <BundleBreakdown v-if="items.length" :items="items" scrollable class="sku-image-card__breakdown" />

    <!-- Top-left badge — absolute over the card, matching GiftSkuCard placement -->
    <SkuTag v-if="tagLabel || isBestValue" class="sku-image-card__badge" :label="tagLabel ?? strings.sku.bestValue" variant="value" />

    <!-- Product info: amount + optional bonus + optional loyalty row -->
    <div class="sku-image-card__info">
      <div class="sku-image-card__title">
        <!-- Named non-numeric SKU (e.g. a membership/subscription pack) —
             title takes precedence over amount+currencyLabel, same rule the
             'prod' variant already documents above. -->
        <span v-if="title" class="sku-image-card__amount text-style-heading-sku-title">{{ title }}</span>
        <template v-else>
          <span v-if="amount !== null" class="sku-image-card__amount text-style-heading-sku-title">{{ formatNumber(amount) }}</span>
          <span v-if="currencyLabel" class="sku-image-card__currency text-style-heading-sku-title">{{ currencyLabel }}</span>
        </template>
        <Button
          v-if="infoItems"
          variant="icon"
          size="small"
          icon="info"
          icon-variant="outlined"
          aria-label="Item info"
          class="sku-image-card__info-btn"
          @click="onInfo($event)"
        />
      </div>

      <div v-if="baseAmount !== null && bonusAmount !== null" class="sku-image-card__bonus text-style-utility-label-regular">
        <span class="sku-image-card__bonus-base">{{ formatNumber(baseAmount) }} + </span>
        <span class="sku-image-card__bonus-amount text-style-utility-label-bold">{{ formatNumber(bonusAmount) }} {{ bonusLabel }}</span>
      </div>

      <p v-if="subtitle" class="sku-image-card__subtitle text-style-utility-label-regular">{{ subtitle }}</p>

      <!-- MP loyalty row — shows whenever loyaltyPoints is set; icon is optional.
           The icon is CSS-masked so it inherits currentColor (white-on-transparent
           SVGs rendered as <img> are invisible at small sizes). -->
      <div v-if="loyaltyPoints !== null" class="sku-image-card__loyalty">
        <span
          v-if="loyaltyIcon"
          class="sku-image-card__loyalty-icon"
          aria-hidden="true"
          :style="{ '--loyalty-icon-url': `url(${loyaltyIcon})` }"
        />
        <span class="sku-image-card__loyalty-amount text-style-utility-label-regular">{{ formatNumber(loyaltyPoints) }}</span>
      </div>
    </div>

    <!-- Price block -->
    <div class="sku-image-card__price" :style="priceStyle">
      <div v-if="originalPrice || discountPercent" class="sku-image-card__discount">
        <span v-if="originalPrice" class="sku-image-card__original-price text-style-utility-label-regular">{{ originalPrice }}</span>
        <span v-if="discountPercent" class="sku-image-card__discount-pct text-style-utility-label-regular">{{ discountPercent }}</span>
      </div>
      <div class="sku-image-card__current-price text-style-heading-sku-title">{{ currentPrice }}</div>
    </div>
  </div>
</template>

<style scoped>
.sku-image-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  /* --x-sku-image-pad-top lets a store retune just the space above the
     thumbnail without touching every other --x-pad-surface-m consumer in
     the app; falls back to the original value, so every other store is
     byte-for-byte unchanged. */
  padding: var(--x-sku-image-pad-top, var(--x-pad-surface-m)) var(--x-pad-surface-s) var(--x-pad-surface-l);
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

/* Gradient border — mask-composite technique (matches SkuCard / BundleItem). */
.sku-image-card::before {
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
  z-index: 3;
  transition: background var(--x-motion-sku-hover);
}

/* Hover: card lifts 4px with decelerate ease-out — pronounced but smooth arrival */
.sku-image-card:hover {
  z-index: 1;
  transform: translateY(calc(-1 * var(--x-motion-sys-distance-sm)));
  box-shadow: var(--x-shadow-card-hover);
  transition:
    transform var(--x-motion-sku-hover-in),
    border-color var(--x-motion-sku-hover-in),
    box-shadow var(--x-motion-sku-hover-in);
}
.sku-image-card:hover::before {
  background: var(--x-border-sku-card-hover);
}
.sku-image-card--selected::before {
  background: var(--x-border-sku-card-selected);
  padding: var(--border-weight-selected);
}

/* Press: scale-down (matches SkuCard / BundleSkuCard) */
.sku-image-card--pressed {
  transform: scale(var(--x-motion-sku-press-scale)) !important;
  transition:
    transform var(--x-motion-sku-press),
    border-color var(--x-motion-sku-press);
}

/* Ripple wave sits above the background/art (z-0..1) but below content (z-2). */
.sku-image-card :deep(.fx-ripple__wave) {
  z-index: 1;
}

/* Full-bleed card background image — sits below the L1 scrim (z-index: 0)
   so the dark tint in --x-sys-colour-surface-l1-fill renders over it for text legibility.
   The bottom-fade mask blends the image into the dark surface below so there
   is no hard crop at the lower edge. */
.sku-image-card__card-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  z-index: -1;
  -webkit-mask-image: var(--x-mask-sku-card-bg-fade);
  mask-image: var(--x-mask-sku-card-bg-fade);
}

/* When a card background image is present, suppress the default dark scrim so
   the image shows through unobstructed. The success tint still applies on select
   because .sku-image-card--selected overrides background regardless of this rule. */
.sku-image-card--has-bg:not(.sku-image-card--selected) .sku-image-card__bg {
  background: transparent;
}

/* L1 surface fill — transitions to the success tint when selected */
.sku-image-card__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  background: var(--x-bg-sku-card-default);
  z-index: 0;
  transition: background var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.sku-image-card--selected .sku-image-card__bg {
  background: var(--x-bg-card-selected);
}

/* Skeleton shimmer while the SKU art decodes — fills its parent frame. */
.sku-image-card__skeleton {
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* ── Background variant ─────────────────────────────────────────────────────
   Oversized SKU art anchored to the bottom edge, cropped by the card, with a
   dark overlay so the overlaid text stays readable. */
.sku-image-card--background {
  aspect-ratio: 3 / 4;
}
.sku-image-card__bg-art {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
}
.sku-image-card__bg-img {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  /* Larger than the card so it is cropped by .sku-image-card's overflow:hidden,
     and bottom-anchored so it stays planted on the base edge as it scales. */
  width: 132%;
  height: 132%;
  object-fit: cover;
  object-position: center bottom;
  /* Hidden until decoded, then fades in over the skeleton. */
  opacity: 0;
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.sku-image-card__bg-img.is-loaded { opacity: 1; }
.sku-image-card__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  border-radius: inherit;
  background: var(--x-gradient-sku-image-card-fade);
}

/* ── Panel variant ──────────────────────────────────────────────────────────
   1:1 square frame housing the SKU art at the top of the card.
   Capped at 160×160 so the image never renders beyond that dimension. */
.sku-image-card__badge {
  position: absolute;
  top: var(--x-pad-surface-xs);
  left: var(--x-pad-surface-xs);
  z-index: 3;
}

.sku-image-card__panel {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 160px;
  max-height: 160px;
  /* --x-sku-image-aspect lets a store match its OWN art's real aspect ratio
     instead of the forced square crop — 1/1 for every other store (no-op),
     so this never changes anything but the store that sets it. Forcing a
     non-square image into a square panel just letterboxes it, wasting space. */
  aspect-ratio: var(--x-sku-image-aspect, 1 / 1);
  overflow: hidden;
  border-radius: var(--x-radius-container-xs);
  margin: 0 auto;
  /* --x-sku-image-gap-adjust trims the flex `gap` above (which also spaces
     every other child row) down to a smaller value specifically after the
     thumbnail, via a negative margin — 0px for every other store (no-op),
     so this never changes anything but the store that sets it. */
  margin-bottom: var(--x-sku-image-gap-adjust, 0px);
}
.sku-image-card__panel-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  opacity: 0;
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.sku-image-card__panel-img.is-loaded { opacity: 1; }

/* ── 'prod' variant (fcmSkuCardModel pilot, FCM only) ─────────────────────────
   Square corners, an OUTSIDE hairline (not the other variants' gradient
   mask-border), no blur/shadow — prod's card has neither. Every token here
   defaults to inert (see semantics.css); only FCM's theme gives them real
   values, and only variant="prod" ever applies this class at all. */
.sku-image-card--prod {
  padding: 0;
  gap: 0;
  border-radius: 0;
  outline: var(--border-weight-default) solid var(--x-border-sku-card-prod);
  outline-offset: 0;
  background-image: var(--x-bg-image-sku-card-prod);
  background-size: cover;
  background-position: center;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
}
/* The other variants' gradient mask-border and generic L1 surface fill don't
   apply here — this variant supplies its own background/border above. */
.sku-image-card--prod::before,
.sku-image-card--prod .sku-image-card__bg {
  display: none;
}

.sku-image-card__prod-info {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-tight);
  padding: var(--x-pad-surface-l) var(--x-pad-surface-s) var(--x-pad-surface-xs);
  text-align: center;
}
.sku-image-card__prod-title {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--x-gap-content-tight);
  font-size: 16px;
  font-weight: var(--x-sys-weight-bold);
  color: var(--x-text-body-default);
  text-transform: uppercase;
}
.sku-image-card__prod-subtitle {
  margin: 0;
  font-size: 10px;
  line-height: 1;
  font-weight: var(--x-sys-weight-regular);
  color: var(--x-text-header-default);
}

.sku-image-card__prod-art {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 128px;
  max-height: 128px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  overflow: hidden;
}
.sku-image-card__prod-art-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  opacity: 0;
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.sku-image-card__prod-art-img.is-loaded { opacity: 1; }

.sku-image-card__prod-footer {
  position: relative;
  z-index: 2;
  margin-top: auto;
}
.sku-image-card__prod-reward {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-tight);
  padding: var(--x-pad-surface-xs) var(--x-pad-surface-s);
  background-color: var(--x-bg-sku-card-prod-reward);
  font-size: 10px;
  line-height: 1;
  font-weight: var(--x-sys-weight-regular);
  color: var(--x-text-body-default);
}
.sku-image-card__prod-reward-label {
  line-height: 1;
}
.sku-image-card__prod-price {
  padding: var(--x-pad-surface-xs) var(--x-pad-surface-s) var(--x-pad-surface-s);
  background-image: var(--x-gradient-sku-card-prod-price);
  /* Prod's price uses Cruyff Sans "Expanded Heavy" (900) — no such family/
     weight ships in this repo (only Regular/Medium/Bold). Approximating with
     Bold + a touch of letter-spacing rather than pulling in a new font asset;
     swap for the real face if/when it's supplied. */
  font-size: 16px;
  font-weight: var(--x-sys-weight-bold);
  letter-spacing: 0.3px;
  color: var(--x-text-body-inverse);
  text-align: center;
  text-transform: uppercase;
}

/* Bundled child-item row — sits above the L1 surface / background art.
   BundleItem tag pills are position:absolute; top:-8px on each tile, so they
   bleed 8px above the breakdown container. .sku-image-card has overflow:hidden
   (needed to clip the oversized bg art), so we shift the breakdown's outer edge
   up 8px (margin-top) and compensate with padding-top so the tiles stay in the
   same visual position — the tag now pops into the headroom rather than being
   clipped by the card boundary. The scroll variant keeps a wide set contained. */
.sku-image-card__breakdown {
  position: relative;
  z-index: 2;
  margin-top: -8px;
  padding-top: 8px;
}

/* Product info */
.sku-image-card__info {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-narrow);
  position: relative;
  z-index: 2;
}

.sku-image-card__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--x-gap-content-narrow);
}
.sku-image-card__amount {
  color: var(--x-text-header-default);
  text-transform: uppercase;
  white-space: nowrap;
}
.sku-image-card__currency {
  color: var(--x-text-header-default);
  text-transform: uppercase;
}

/* (i) info icon — opens ItemSummarySheet (config.itemSummary), stopping the
   click before it reaches the card's own onSelect. */
.sku-image-card__info-btn {
  flex-shrink: 0;
  --btn-icon-color: var(--x-text-hyperlink-default);
  --btn-icon-color-hover: var(--x-text-hyperlink-hover, var(--x-text-hyperlink-default));
}
.sku-image-card__subtitle {
  margin: 0;
  color: var(--x-text-body-default);
}

.sku-image-card__bonus {
  display: block;
  text-transform: uppercase;
  white-space: nowrap;
}
.sku-image-card__bonus-base { color: var(--x-text-body-default); }
.sku-image-card__bonus-amount { color: var(--x-text-bonus-amount); }

/* MP loyalty row — icon + points label */
.sku-image-card__loyalty {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
  padding-top: var(--x-pad-surface-xs);
}
.sku-image-card__loyalty-amount {
  color: var(--x-text-body-default);
  text-transform: uppercase;
}
/* CSS-masked icon inherits currentColor so it renders correctly regardless of
   the SVG's internal fill (white-on-transparent SVGs are invisible as <img>). */
.sku-image-card__loyalty-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  background-color: currentColor;
  color: var(--x-text-body-default);
  -webkit-mask: var(--loyalty-icon-url) center / contain no-repeat;
  mask: var(--loyalty-icon-url) center / contain no-repeat;
}

/* Price — pinned to the bottom so prices align across cards in the same row */
.sku-image-card__price {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-tight);
  position: relative;
  z-index: 2;
  margin-top: auto;
  animation-name: fade-in;
  animation-duration: var(--x-motion-sys-duration-slow);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;
  /* animation-delay supplied inline */
}

.sku-image-card__discount {
  display: flex;
  gap: var(--x-gap-content-tight);
  align-items: baseline;
  align-self: center;
}
.sku-image-card__original-price {
  color: var(--x-text-body-default);
  text-decoration: line-through;
  white-space: nowrap;
  transform-origin: center center;
}
.sku-image-card__discount-pct {
  color: var(--x-text-success-default);
  white-space: nowrap;
  transform-origin: center center;
}
.sku-image-card__current-price {
  text-transform: uppercase;
  color: var(--x-text-hyperlink-default);
  white-space: nowrap;
  transform-origin: center center;
}
</style>
