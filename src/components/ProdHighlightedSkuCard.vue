<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCheckout } from '../composables/useCheckout.js'
import { useSkuRegistry } from '../composables/useSkuRegistry.js'
import { useHaptics } from '../composables/useHaptics.js'
import { formatNumber } from '../utils/formatNumber.js'
import MaterialIcon from './MaterialIcon.vue'

/**
 * ProdHighlightedSkuCard — the FCM production "highlighted SKU" card
 * (fcmSkuCardModel flag, Figma node 3361:28283). Replaces BestSellerCard at
 * its one App.vue mount only — this never touches CategoryCatalog's
 * cardType/cardVariant path, since that hero is hardcoded data (fcmBestSeller
 * in App.vue), same as BestSellerCard itself.
 *
 * Structurally a LANDSCAPE two-column layout (text + CTA left, product art
 * right), not a restyle of BestSellerCard's stacked (art-over-info-bar)
 * layout — hence a separate component rather than a BestSellerCard variant.
 * No ring/bloom effect (config.sku.heroRingEffect) and no countdown timer —
 * both are new-design-only / a hidden Figma layer respectively.
 *
 * Checkout/press/ripple wiring mirrors BestSellerCard, but itemKey is
 * deliberately prefixed ('prod-hero|...') — BestSellerCard and SkuCard both
 * build `${amount}|${currentPrice}`, which would otherwise collide with this
 * card's own selection identity if both ever rendered in the same session.
 */
const props = defineProps({
  amount: { type: Number, required: true },
  currentPrice: { type: String, required: true },
  /** Banner/product art — reused for both the card's own art panel and the checkout thumb */
  image: { type: String, default: null },
  skuImage: { type: String, default: null },
  loyaltyPoints: { type: Number, default: null },
  loyaltyIcon: { type: String, default: null },
  /** Product name (Figma: "Web One-Time Offer") */
  label: { type: String, default: null },
  /** Supporting line beneath the title (Figma: "1000 FC Points") */
  subtitle: { type: String, default: null },
  baseDelay: { type: Number, default: 0 },
})

const isPressed = ref(false)
const cardStyle = computed(() => ({ animationDelay: props.baseDelay + 'ms' }))

const { openCheckout, selectedKey, sheetOpen } = useCheckout()
const { haptic } = useHaptics()
const itemKey = computed(() => `prod-hero|${props.amount}|${props.currentPrice}`)
const isSelected = computed(() => sheetOpen.value && selectedKey.value === itemKey.value)

function buildItem () {
  return {
    amount: props.amount,
    label: props.label,
    subtitle: props.subtitle,
    currentPrice: props.currentPrice,
    skuImage: props.skuImage ?? props.image,
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

// Image load state — skeleton placeholder until the (often heavy) art decodes.
const imgEl = ref(null)
const imgLoaded = ref(false)
function onImgReady() { imgLoaded.value = true }
onMounted(() => {
  const el = imgEl.value
  if (el && el.complete && el.naturalWidth > 0) imgLoaded.value = true
})
</script>

<template>
  <div
    class="prod-highlighted-sku"
    :class="{ 'prod-highlighted-sku--pressed': isPressed, 'prod-highlighted-sku--selected': isSelected }"
    :style="cardStyle"
  >
    <!-- Click/ripple hit surface — v-ripple forces overflow:hidden (to contain
         the ripple wave, see vRipple.js), which would clip the RECOMMENDED tag
         below since it deliberately overhangs the card's own box (matching the
         Figma spec). Isolating v-ripple to this full-bleed surface, BEHIND the
         tag/content (z-index 0), keeps the overhang unclipped while still
         covering the whole card as the tap target. -->
    <div
      v-ripple
      class="prod-highlighted-sku__surface"
      @mousedown="isPressed = true"
      @mouseup="isPressed = false"
      @mouseleave="isPressed = false"
      @touchstart.passive="isPressed = true"
      @touchend.passive="isPressed = false"
      @click="onSelect"
    />

    <!-- "RECOMMENDED" tag — overhangs the top-left corner, matching the Figma spec.
         Figma's icon is local_fire_department, not registered in this repo's
         MaterialIcon set — bolt is the closest already-available substitute. -->
    <div class="prod-highlighted-sku__tag" aria-hidden="true">
      <MaterialIcon name="bolt" :size="16" class="prod-highlighted-sku__tag-icon" />
      <span class="prod-highlighted-sku__tag-label">RECOMMENDED</span>
    </div>

    <div class="prod-highlighted-sku__content">
      <div class="prod-highlighted-sku__left">
        <div class="prod-highlighted-sku__info">
          <p v-if="label" class="prod-highlighted-sku__title">{{ label }}</p>
          <p v-if="subtitle" class="prod-highlighted-sku__subtitle">{{ subtitle }}</p>

          <div v-if="loyaltyPoints !== null" class="prod-highlighted-sku__loyalty">
            <span class="prod-highlighted-sku__loyalty-label">Loyalty Reward: {{ formatNumber(loyaltyPoints) }}</span>
            <span
              v-if="loyaltyIcon"
              class="prod-highlighted-sku__loyalty-icon"
              aria-hidden="true"
              :style="{ '--loyalty-icon-url': `url(${loyaltyIcon})` }"
            />
          </div>
        </div>

        <button type="button" class="prod-highlighted-sku__cta" tabindex="-1">
          {{ currentPrice }}
        </button>
      </div>

      <div class="prod-highlighted-sku__art">
        <div v-if="(skuImage ?? image) && !imgLoaded" class="prod-highlighted-sku__skeleton fx-skeleton" />
        <img
          v-if="skuImage ?? image"
          ref="imgEl"
          :src="skuImage ?? image"
          alt=""
          class="prod-highlighted-sku__art-img"
          :class="{ 'is-loaded': imgLoaded }"
          @load="onImgReady"
          @error="onImgReady"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Root card — landscape, square corners, a 2px pale-gold border ─────────── */
.prod-highlighted-sku {
  position: relative;
  width: 100%;
  padding: var(--x-pad-surface-l) var(--x-pad-surface-s) var(--x-pad-surface-s);
  border: var(--border-weight-selected) solid var(--x-border-sku-card-prod-highlighted);
  border-radius: 0;
  background-color: var(--x-bg-sku-card-prod-reward);
  background-image: var(--x-bg-image-sku-card-prod-highlighted);
  background-size: cover;
  background-position: center;
  cursor: pointer;

  animation-name: sku-enter;
  animation-duration: var(--x-motion-sys-duration-slow);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;

  transition: transform var(--x-motion-sku-hover), box-shadow var(--x-motion-sku-hover);
}
.prod-highlighted-sku:hover {
  transform: translateY(calc(-1 * var(--x-motion-sys-distance-sm)));
}
.prod-highlighted-sku--pressed {
  transform: scale(var(--x-motion-sku-press-scale)) !important;
  transition: transform var(--x-motion-sku-press);
}
.prod-highlighted-sku--selected {
  border-color: var(--x-border-sku-card-selected);
}

/* Click/ripple hit surface — see the template comment above. Sits behind the
   tag/content (z-index 0 vs. their 2), full-bleed within the card's own
   padding box so it doesn't reach the tag's overhanging sliver. */
.prod-highlighted-sku__surface {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  cursor: pointer;
}

/* "RECOMMENDED" tag — overhangs the top-left corner */
.prod-highlighted-sku__tag {
  position: absolute;
  left: calc(-1 * var(--border-weight-selected));
  top: calc(-1 * var(--x-pad-surface-m));
  z-index: 2;
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-xs);
  background-image: var(--x-gradient-sku-card-prod-gold);
}
.prod-highlighted-sku__tag-icon {
  color: var(--x-text-sku-tag-popular);
}
.prod-highlighted-sku__tag-label {
  font-size: 10px;
  line-height: 1;
  font-weight: var(--x-sys-weight-regular);
  color: var(--x-text-sku-tag-popular);
  white-space: nowrap;
}

/* ── Two-column content ─────────────────────────────────────────────────── */
.prod-highlighted-sku__content {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-narrow);
}
.prod-highlighted-sku__left {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-narrow);
  justify-content: center;
}
.prod-highlighted-sku__info {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-narrow);
}
.prod-highlighted-sku__title {
  margin: 0;
  font-size: 16px;
  font-weight: var(--x-sys-weight-regular);
  color: var(--x-text-header-default);
  text-shadow: var(--x-text-shadow-sku-card-prod);
}
.prod-highlighted-sku__subtitle {
  margin: 0;
  font-size: 14px;
  font-weight: var(--x-sys-weight-regular);
  color: var(--x-text-header-default);
  text-shadow: var(--x-text-shadow-sku-card-prod);
}
.prod-highlighted-sku__loyalty {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
}
.prod-highlighted-sku__loyalty-label {
  font-size: 10px;
  line-height: 1;
  font-weight: var(--x-sys-weight-regular);
  color: var(--x-text-body-default);
  white-space: nowrap;
}
.prod-highlighted-sku__loyalty-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: var(--x-radius-control-full);
  background-color: var(--x-bg-loyalty-badge-prod);
  -webkit-mask: var(--loyalty-icon-url) center / 60% no-repeat;
  mask: var(--loyalty-icon-url) center / 60% no-repeat;
}

/* CTA pill — gold gradient, fully rounded regardless of the card's own square corners */
.prod-highlighted-sku__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 32px;
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-s);
  border: 0;
  border-radius: var(--x-radius-control-full);
  background-image: var(--x-gradient-sku-card-prod-gold);
  font-size: 18px;
  font-weight: var(--x-sys-weight-regular);
  color: var(--x-text-body-inverse);
  cursor: pointer;
  pointer-events: none; /* the whole card is the tap target */
}

/* Product art — right column, square, overflow clipped */
.prod-highlighted-sku__art {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}
.prod-highlighted-sku__art-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.prod-highlighted-sku__art-img.is-loaded { opacity: 1; }
.prod-highlighted-sku__skeleton {
  position: absolute;
  inset: 0;
}
</style>
