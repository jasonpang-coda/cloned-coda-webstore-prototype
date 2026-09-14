<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useCheckout } from '../composables/useCheckout.js'
import { useSkuRegistry } from '../composables/useSkuRegistry.js'
import { useHaptics } from '../composables/useHaptics.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useLocale } from '../composables/useLocale.js'
// Generic loyalty-points glyph — used when the store doesn't ship a branded
// loyalty icon (assets.brand.loyaltyIcon). Both render via CSS mask + currentColor.
import genericLoyaltyIcon from '@material-symbols/svg-400/rounded/stars.svg?url'
import { formatNumber } from '../utils/formatNumber.js'
import MaterialIcon from './MaterialIcon.vue'
import BundleBreakdown from './BundleBreakdown.vue'

/**
 * BestSellerCard — full-width hero card with a coin image on top and an info
 * bar below. Ring treatment is a capability flag (config.sku.heroRingEffect,
 * default 'hdr' — an animated OKLCH conic border) plus a soft breathing bloom
 * behind it, so most stores get an "offer pops" feel; a store may opt into a
 * calmer fx-glow-border-* family member instead (e.g. 'camo-breathe' — see
 * src/tokens/effects.css). Shared flag name with HeroSkuCard (default 'dual'
 * there) — both play the same "flagship hero SKU" role depending on
 * catalog.mode/cardType, so one config line covers whichever renders.
 */
const props = defineProps({
  amount: { type: Number, required: true },
  baseAmount: { type: Number, default: null },
  bonusAmount: { type: Number, default: null },
  /** Label for the bonus — passed from parent (strings.sku.bonusLabel); empty string fallback. */
  bonusLabel: { type: String, default: '' },
  originalPrice: { type: String, default: null },
  discountPercent: { type: String, default: null },
  currentPrice: { type: String, required: true },
  image: { type: String, default: null },
  cpIcon: { type: String, default: null },
  /** Square SKU product image — shown in the checkout banner thumb */
  skuImage: { type: String, default: null },
  /** Loyalty points earned on purchase — drives the checkout loyalty banner. */
  loyaltyPoints: { type: Number, default: null },
  /** Section base delay offset in ms (entrance cascade) */
  baseDelay: { type: Number, default: 0 },
  /** Compact variant for the carousel: shorter image, no bloom */
  compact: { type: Boolean, default: false },
  /** Product name shown inside the card info bar (e.g. "Daily Booster D") */
  label: { type: String, default: null },
  /** Supporting subtitle below the product name (e.g. "18% more FC Points than in-game*") */
  subtitle: { type: String, default: null },
  /** Show the built-in "BEST SELLER" heading above the card */
  showHeading: { type: Boolean, default: true },
  /** Optional blurb shown below the heading (section-level, not card content) */
  description: { type: String, default: null },
  /** Event end time (ms epoch). When set, a live countdown is shown below the title. */
  endsAt: { type: Number, default: null },
  /** Optional bundled child items: [{ image, tileBg, tag, quantity }]. When set,
      a breakdown row of BundleItem tiles renders beneath the coin image. */
  items: { type: Array, default: () => [] },
})

const strings = useStoreStrings()
const assets = useStoreAssets()
const config = useStoreConfig()
// Shared, store-agnostic chrome copy (localised via the language switcher).
const { common } = useLocale()
const loyaltyIconUrl = computed(() => assets.value.brand.loyaltyIcon || genericLoyaltyIcon)

// Ring effect — a capability flag, not a store-name check (see web-store-
// whitelabel golden rule). Defaults to the spinning 'hdr' comet every store
// used before this flag existed; a store opts into a calmer family member
// (e.g. MGSSE's 'camo-breathe') via config.sku.heroRingEffect (shared
// with HeroSkuCard's own ring selection). Only one fx-glow-border--*::before
// can render per element, so this picks exactly one.
const bestSellerEffectClass = computed(
  () => `fx-glow-border--${config.value.sku?.heroRingEffect ?? 'hdr'}`
)

const isPressed = ref(false)
const cardStyle = computed(() => ({ animationDelay: props.baseDelay + 'ms' }))

// Tap → open checkout. Best-seller bonus is always the codashop (purple) style.
// (In the carousel, the parent suppresses clicks that follow a drag.)
const { openCheckout, selectedKey, sheetOpen } = useCheckout()
const { haptic } = useHaptics()
const itemKey = computed(() => `${props.amount}|${props.currentPrice}`)
const isSelected = computed(() => sheetOpen.value && selectedKey.value === itemKey.value)
function buildItem () {
  return {
    amount: props.amount,
    label: props.label,
    subtitle: props.subtitle,
    baseAmount: props.baseAmount,
    bonusAmount: props.bonusAmount,
    bonusType: 'codashop',
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
  // 'select' haptic fires only on a real open (gated no-op stays silent).
  const opened = openCheckout(buildItem(), itemKey.value)
  if (opened) haptic('select')
}

// Image load state — the hero .webp can be heavy, so we show a skeleton
// placeholder and only reveal the real image once it has finished decoding.
const imgEl = ref(null)
const imgLoaded = ref(false)
function onImgReady() { imgLoaded.value = true }

onMounted(() => {
  // A cached image can already be complete before @load binds — catch that case.
  const el = imgEl.value
  if (el && el.complete && el.naturalWidth > 0) imgLoaded.value = true

  if (props.endsAt != null) bsTimer = setInterval(() => { bsNow.value = Date.now() }, 1000)
})
onBeforeUnmount(() => { if (bsTimer) clearInterval(bsTimer) })

const bsNow = ref(Date.now())
let bsTimer = null

const countdown = computed(() => {
  if (props.endsAt == null) return null
  const ms = Math.max(0, props.endsAt - bsNow.value)
  const totalMin = Math.floor(ms / 60000)
  const days = Math.floor(totalMin / 1440)
  const hours = Math.floor((totalMin % 1440) / 60)
  const mins = totalMin % 60
  const pad = (n) => String(n).padStart(2, '0')
  return days > 0 ? `${days}d ${pad(hours)}h ${pad(mins)}m` : `${pad(hours)}h ${pad(mins)}m`
})

const countdownUrgency = computed(() => {
  if (props.endsAt == null) return 'default'
  const hoursLeft = (props.endsAt - bsNow.value) / 3600000
  if (hoursLeft >= 72) return 'default'
  if (hoursLeft >= 24) return 'warning'
  return 'error'
})
</script>

<template>
  <div class="bestseller">
    <h2 v-if="showHeading" class="bestseller__heading text-style-heading-banner">{{ strings.sku.bestSeller }}</h2>
    <p v-if="showHeading && description" class="bestseller__section-desc text-style-paragraph-regular">{{ description }}</p>

    <div class="bestseller__card" data-poi="best-seller-card" data-component="bestseller-card-effects" :style="cardStyle"
         :data-state="(compact ? 'compact' : 'hero') + '-' + (isSelected ? 'selected' : 'default')"
         :class="[{
           'bestseller__card--pressed':  isPressed,
           'bestseller__card--compact':  compact,
           'bestseller__card--selected': isSelected,
           'fx-bloom':             !compact,
         }, !compact ? bestSellerEffectClass : '']"
         @mousedown="isPressed = true"
         @mouseup="isPressed = false"
         @mouseleave="isPressed = false"
         @touchstart.passive="isPressed = true"
         @touchend.passive="isPressed = false"
         @click="onSelect"
    >
      <!-- Hero image — skeleton placeholder until the (often heavy) webp loads -->
      <div class="bestseller__image">
        <div
          v-if="image && !imgLoaded"
          class="bestseller__skeleton fx-skeleton"
          aria-hidden="true"
        ></div>
        <img
          v-if="image"
          ref="imgEl"
          :src="image"
          alt=""
          class="bestseller__banner-img"
          :class="{ 'is-loaded': imgLoaded }"
          @load="onImgReady"
          @error="onImgReady"
        />
        <!-- Coin overlay — denomination-specific SKU art centered over the banner -->
        <img
          v-if="skuImage"
          :src="skuImage"
          alt=""
          class="bestseller__sku-overlay"
        />
      </div>

      <!-- Info bar — flex-column: breakdown row on top (half-overlapping the
           coin image above via negative margin), then title + price -->
      <div class="bestseller__info">
        <!-- Bundled child items — first child of the info bar; pulled up via
             negative margin so tiles half-overlap the coin image. Tiles carry
             no background of their own — each BundleItem tile is individually
             opaque, so the overlap zone just shows tiles floating on the photo
             (like the coin overlay already does), with no compositing seam. -->
        <BundleBreakdown v-if="items.length" :items="items" class="bestseller__breakdown" />

        <div class="bestseller__info-row">
          <div class="bestseller__title-col">
            <div class="bestseller__title">
              <template v-if="label">
                <span class="bestseller__amount text-style-heading-section">{{ label }}</span>
              </template>
              <template v-else>
                <span class="bestseller__amount text-style-heading-section">{{ formatNumber(amount) }}</span>
              </template>
            </div>
            <div v-if="baseAmount !== null && bonusAmount !== null" class="bestseller__bonus text-style-utility-label-regular">
              <span>{{ formatNumber(baseAmount) }} + </span>
              <span class="bestseller__bonus-amount text-style-utility-label-bold">{{ formatNumber(bonusAmount) }} {{ bonusLabel }}</span>
            </div>
            <span v-if="subtitle" class="bestseller__subtitle text-style-utility-label-regular">{{ subtitle }}</span>
            <div v-if="loyaltyPoints !== null" class="bestseller__loyalty">
              <span
                class="bestseller__loyalty-icon"
                aria-hidden="true"
                :style="{ '--loyalty-icon-url': `url(${loyaltyIconUrl})` }"
              />
              <span class="bestseller__loyalty-amount text-style-utility-label-regular">{{ formatNumber(loyaltyPoints) }}</span>
            </div>
            <span v-if="countdown" class="bestseller__countdown" :data-urgency="countdownUrgency">
              <MaterialIcon name="schedule" :size="14" class="bestseller__countdown-icon" />
              <span class="bestseller__countdown-text text-style-utility-label-regular">{{ common.sku.endsLabel }} {{ countdown }}</span>
            </span>
          </div>

          <div class="bestseller__price">
            <div v-if="originalPrice || discountPercent" class="bestseller__discount">
              <span v-if="originalPrice" class="bestseller__original text-style-utility-label-regular">{{ originalPrice }}</span>
              <span v-if="discountPercent" class="bestseller__pct text-style-utility-label-regular">{{ discountPercent }}</span>
            </div>
            <div class="bestseller__current text-style-heading-sku-title">{{ currentPrice }}</div>
          </div>
        </div><!-- /.bestseller__info-row -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.bestseller {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  width: 100%;
}

.bestseller__heading {
  display: block;
  text-transform: uppercase;
  color: var(--x-text-header-default);
  margin: 0;
}

.bestseller__section-desc {
  color: var(--x-text-body-default);
  margin: 0;
}

/* Bloom halo — two-colour radial (secondary yellow-green core → primary green mid)
   matching the conic border palette. Reduced blur keeps the halo visible despite
   the keyframe's low opacity range (0.12 → 0.22); brightness compensates further. */
.bestseller__card {
  --x-fx-bloom-image: radial-gradient(
    ellipse at 50% 55%,
    var(--x-hdr-hot) 0%,
    var(--x-hdr-hot) 22%,
    var(--x-hdr-glow) 55%,
    transparent 72%
  );
}
.bestseller__card::after {
  inset: -10%;
  filter: blur(44px) brightness(1.1) saturate(1.1);
}

/* The hero card — warm orange surface; fx-glow-border--hdr + fx-bloom add the
   animated OKLCH border, outer glow and breathing bloom. The bloom halo reuses
   the same orange field via --x-fx-bloom-image. */
.bestseller__card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  /* No overflow:hidden here — it clips the ::before conic border.
     Clipping is handled per-child (image has its own overflow:hidden). */
  border-radius: var(--x-radius-container-s);
  /* Static under-border (top + left only) — a warm cream highlight that sits
     beneath the animated running border. Overrides .fx-glow-border--hdr's border:0
     via the higher-specificity scoped selector. */
  border-top: var(--border-weight-default) solid var(--x-border-warm);
  border-left: var(--border-weight-default) solid var(--x-border-warm);
  background: var(--x-gradient-bestseller-hero);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);

  animation-name: sku-enter;
  animation-duration: var(--x-motion-sys-duration-slow);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;

  cursor: pointer;
  transition:
    background var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate),
    transform var(--x-motion-sku-hover),
    box-shadow var(--x-motion-sku-hover);
}

.bestseller__card--selected {
  background: var(--x-bg-card-selected);
  box-shadow: var(--x-shadow-bestseller-selected);
  transition: box-shadow var(--x-motion-sku-select);
}
.bestseller__card--selected::before {
  inset: calc(-1 * var(--border-weight-selected));
  padding: var(--border-weight-selected);
  background: var(--x-border-sku-card-selected);
  animation: none;
}

.bestseller__card:hover {
  transform: translateY(-2px);
  box-shadow: var(--x-shadow-bestseller);
}

.bestseller__card--pressed {
  transform: scale(0.98) !important;
  transition:
    transform var(--x-motion-sku-press),
    box-shadow var(--x-motion-sku-press);
}

.bestseller__image {
  position: relative;
  height: auto;
  width: 100%;
  overflow: hidden;
  padding: var(--x-pad-surface-s) 0;
}
/* Compact (carousel) variant — shorter image to match the design proportion */
.bestseller__card--compact {
  overflow: hidden; /* safe — no ::before conic border to clip */
  /* Design (node 4843:9834) uses ONE continuous radial across the whole card —
     orange hotspot top-left fading to near-black, so the info bar sits in the
     dark tail (legible) without a separate gradient seam. */
  background: var(--x-gradient-bestseller-hero-hover);
}
.bestseller__card--compact .bestseller__image {
  height: auto;
  padding: var(--x-pad-surface-s) 0;
}

/* Let the card's continuous radial flow through the info bar uninterrupted.
   No separate gradient, no backdrop-filter (which composites as a separate
   layer and creates a visible seam at the image/info boundary). */
.bestseller__card--compact .bestseller__info {
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

/* Shimmer lives on the image only — a gloss sweep across the photo, not
   the info bar beneath it. The image already has position:relative +
   overflow:hidden, so ::after is naturally contained. z-index:1 puts the
   gloss above the <img> (which is position:absolute, z-index auto). */
.bestseller__card--compact .bestseller__image::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: var(--x-gradient-bestseller-metallic-shine);
  transform: translateX(-150%) skewX(-20deg);
  pointer-events: none;
  opacity: var(--x-fx-bestseller-shimmer-opacity);
  animation-name: shimmer-loop;
  animation-duration: var(--x-motion-sku-shimmer);
  animation-timing-function: var(--x-motion-sys-ease-linear);
  animation-iteration-count: infinite;
}
.bestseller__banner-img {
  position: absolute;
  inset: 0;
  width: 108%;
  height: 131%;
  left: -4%;
  top: 0;
  max-width: none;
  object-fit: cover;
  /* Hidden until decoded, then fades in over the skeleton */
  opacity: 0;
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.bestseller__banner-img.is-loaded {
  opacity: 1;
}

/* Denomination coin — drives container height, capped at 128×128px */
.bestseller__sku-overlay {
  position: relative;
  display: block;
  margin: 0 auto;
  width: 128px;
  height: 128px;
  object-fit: contain;
  pointer-events: none;
  z-index: 1;
}

/* Skeleton fills the image box and sits above the (still-transparent) img.
   Overrides .fx-skeleton's position:relative via higher scoped specificity. */
.bestseller__skeleton {
  position: absolute;
  inset: 0;
  z-index: 2;
}

/* Bundled child-item row — first child of .bestseller__info, pulled up via
   negative margin-top so the tiles half-overlap the coin image above. No
   background/backdrop-filter of its own: each BundleItem tile is individually
   opaque, so wherever a tile overlaps the image it simply sits on top of it
   (like the coin overlay already does) — no gradient/blur compositing seam.
   Below the overlap line the row sits on .bestseller__info's own untouched,
   full-height vignette + blur surface. -29px ≈ half of BundleItem's 58.8px
   tile height. Row layout lives in BundleBreakdown.vue. */
.bestseller__breakdown {
  position: relative;
  z-index: 1;
  margin: -29px calc(-1 * var(--x-pad-surface-s)) var(--x-pad-surface-xs);
  padding: 0 var(--x-pad-surface-s);
}

/* Info bar — flex-column when a breakdown row is present, otherwise the inner
   .bestseller__info-row holds the title/price in their usual side-by-side layout. */
.bestseller__info {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
  padding: var(--x-pad-surface-s) var(--x-pad-surface-s) var(--x-pad-surface-l);
  position: relative;
  z-index: 1;
  background: var(--x-gradient-bestseller-vignette);
  /* Frosted glass over the card gradient — blurs the dark tail of the radial,
     desaturating the info bar to match the Figma treatment (64px per node
     5425:11950). */
  backdrop-filter: blur(64px);
  -webkit-backdrop-filter: blur(64px);
}

/* Title + price row — restores the original side-by-side layout inside the column */
.bestseller__info-row {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
}

.bestseller__title-col {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-narrow);
  flex: 1 1 0;
  min-width: 0;
}

.bestseller__title {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-narrow);
}

.bestseller__amount {
  text-transform: uppercase;
  color: var(--x-text-header-default);
}

.bestseller__cp-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: block;
}
.bestseller__cp-label {
  color: var(--x-text-icon-faint);
  text-transform: uppercase;
}

.bestseller__subtitle {
  display: block;
  color: var(--x-text-body-default);
  padding-bottom: var(--x-pad-surface-xxs);
}

.bestseller__countdown {
  display: inline-flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
  white-space: nowrap;
}
.bestseller__countdown[data-urgency='default'] { color: var(--x-text-body-default); }
.bestseller__countdown[data-urgency='warning']  { color: var(--x-text-warning-default); }
.bestseller__countdown[data-urgency='error']    { color: var(--x-text-error-default); }
.bestseller__countdown-icon { flex-shrink: 0; }

.bestseller__bonus {
  display: block;
  color: var(--x-text-body-default);
}
.bestseller__bonus-amount {
  color: var(--x-text-bonus-amount);
}

.bestseller__loyalty {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
  padding-top: var(--x-pad-surface-xs);
}
.bestseller__loyalty-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  background-color: currentColor;
  color: var(--x-text-body-default);
  -webkit-mask: var(--loyalty-icon-url) center / contain no-repeat;
  mask: var(--loyalty-icon-url) center / contain no-repeat;
}
.bestseller__loyalty-amount {
  color: var(--x-text-body-default);
  text-transform: uppercase;
}

.bestseller__price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--x-gap-content-narrow);
  white-space: nowrap;
}

.bestseller__discount {
  display: flex;
  gap: var(--x-gap-content-tight);
  align-items: baseline;
  align-self: flex-end;
}
.bestseller__original {
  color: var(--x-text-body-default);
  text-decoration: line-through;
  transform-origin: right center;
}
.bestseller__pct {
  color: var(--x-text-success-default);
  transform-origin: right center;
}

.bestseller__current {
  text-transform: uppercase;
  color: var(--x-text-hyperlink-default);
  /* Price is right-aligned — override the default left-origin condense */
  transform-origin: right center;
}
</style>
