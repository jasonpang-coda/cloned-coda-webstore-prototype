<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useCheckout } from '../composables/useCheckout.js'
import { useSkuRegistry } from '../composables/useSkuRegistry.js'
import { useItemSummary } from '../composables/useItemSummary.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useHaptics } from '../composables/useHaptics.js'
import { useLocale } from '../composables/useLocale.js'
import BundleBreakdown from './BundleBreakdown.vue'
import Media from './Media.vue'
import MaterialIcon from './MaterialIcon.vue'
import Button from './Button.vue'

/**
 * BundleSkuCard — the bundled SKU: its banner art, a breakdown row of child
 * item tiles (each a <BundleItem> with rarity / tag / quantity), and a title +
 * price. Mirrors the inner "SKU Card Bundled" of Figma node 4843:10166.
 *
 * The surrounding event banner is a SEPARATE component (it's the same banner as
 * the New User Promo — see CategoryBanner.vue), so it is intentionally NOT part of
 * this card. Tapping opens the shared checkout sheet.
 */
const props = defineProps({
  /** Bundled SKU banner art — wide 2.6:1 background (image or video) */
  bannerImage: { type: String, required: true },
  /** When true, composite the 1:1 `skuImage` as a hero overlay on the banner.
      Off by default — bundles whose banner already bakes in the art (e.g.
      Midnight Sun) leave this false. */
  skuOnBanner: { type: Boolean, default: false },
  /** Bundle title, e.g. "160 CP + 5 BONUS STRONGBOXES" */
  title: { type: String, required: true },
  /** Displayed price, e.g. "$0.99" */
  currentPrice: { type: String, required: true },
  /** Original (crossed-out) price */
  originalPrice: { type: String, default: null },
  /** Discount percentage label, e.g. "-49%" */
  discountPercent: { type: String, default: null },
  /** Child items: [{ image, rarity, tag, quantity }] */
  items: { type: Array, default: () => [] },
  /** Square SKU product image — shown in the checkout banner thumb */
  skuImage: { type: String, default: null },
  /** Loyalty points earned on purchase — drives the checkout loyalty banner. */
  loyaltyPoints: { type: Number, default: null },
  /** Optional short description line below the title */
  subtitle: { type: String, default: null },
  /** Purchase-limit line, e.g. "Limit: 1" */
  limitLabel: { type: String, default: null },
  /** Entrance delay (ms) */
  baseDelay: { type: Number, default: 0 },
  /** Event end time (ms epoch). When set, a live countdown is shown below the title. */
  endsAt: { type: Number, default: null },
  /** Whether this item has been claimed — dims the banner and changes countdown prefix. */
  claimed: { type: Boolean, default: false },
  /** When true, countdown prefix switches "Ends:" → "Refreshes:" after claiming. */
  refreshesOnClaim: { type: Boolean, default: false },
  /** When true, the breakdown row scrolls horizontally (for wide item sets). */
  breakdownScrollable: { type: Boolean, default: false },
  /** SKU info bottom sheet (ItemSummarySheet, config.itemSummary) contents —
      [{ image, name, quantity, description }]. When set, an (i) icon renders
      at the end of the title; tapping it opens the sheet instead of checkout.
      Null (default) omits the icon. */
  infoItems: { type: Array, default: null },
})

const isPressed = ref(false)
const cardStyle = computed(() => ({ animationDelay: props.baseDelay + 'ms' }))

const now = ref(Date.now())
let timer = null
onMounted(() => { if (props.endsAt != null) timer = setInterval(() => { now.value = Date.now() }, 1000) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })

const countdown = computed(() => {
  if (props.endsAt == null) return null
  const ms = Math.max(0, props.endsAt - now.value)
  const totalMin = Math.floor(ms / 60000)
  const days = Math.floor(totalMin / 1440)
  const hours = Math.floor((totalMin % 1440) / 60)
  const mins = totalMin % 60
  const pad = (n) => String(n).padStart(2, '0')
  return days > 0 ? `${days}d ${pad(hours)}h ${pad(mins)}m` : `${pad(hours)}h ${pad(mins)}m`
})

const countdownUrgency = computed(() => {
  if (props.endsAt == null) return 'default'
  const hoursLeft = (props.endsAt - now.value) / 3600000
  if (hoursLeft >= 72) return 'default'
  if (hoursLeft >= 24) return 'warning'
  return 'error'
})

// Shared, store-agnostic chrome copy (localised via the language switcher).
const { common } = useLocale()

const countdownPrefix = computed(() =>
  props.claimed && props.refreshesOnClaim ? common.value.sku.refreshesLabel : common.value.sku.endsLabel
)

const { openCheckout, selectedKey, sheetOpen } = useCheckout()
const { openItemSummary } = useItemSummary()
const config = useStoreConfig()
const { haptic } = useHaptics()

const itemKey = computed(() => `${props.title}|${props.currentPrice}`)
const isSelected = computed(() => sheetOpen.value && selectedKey.value === itemKey.value)

// Tapping a child item tile opens the Item Summary sheet (config opt-in: COD:M).
// stopPropagation prevents the card-level checkout from also firing. Stores that
// don't opt in let the click bubble to onSelect (existing direct-checkout behavior).
function onItemSelect(event) {
  if (!config.value.bundle?.itemSummary) return
  event.stopPropagation()
  haptic('select')
  openItemSummary({
    title: props.title,
    currentPrice: props.currentPrice,
    originalPrice: props.originalPrice,
    discountPercent: props.discountPercent,
    limitLabel: props.limitLabel,
    endsAt: props.endsAt,
    bannerImage: props.bannerImage,
    skuImage: props.skuImage,
    skuOnBanner: props.skuOnBanner,
    loyaltyPoints: props.loyaltyPoints,
    items: props.items,
  })
}

// (i) icon beside the title — opens the info sheet instead of checkout.
// stopPropagation keeps the card-level onSelect (Buy Now dock) from also firing.
function onInfo(event) {
  event.stopPropagation()
  haptic('select')
  openItemSummary({
    title: props.title,
    currentPrice: props.currentPrice,
    originalPrice: props.originalPrice,
    discountPercent: props.discountPercent,
    limitLabel: props.limitLabel,
    endsAt: props.endsAt,
    bannerImage: props.bannerImage,
    skuImage: props.skuImage,
    skuOnBanner: props.skuOnBanner,
    loyaltyPoints: props.loyaltyPoints,
    items: props.infoItems,
  })
}

function buildItem () {
  return {
    amount: props.title,
    currentPrice: props.currentPrice,
    bonusLabel: 'BUNDLE',
    skuImage: props.skuImage,
    loyaltyPoints: props.loyaltyPoints,
    // Full bundle payload so CheckoutSheet can surface the "Item Info" link.
    bundleInfo: {
      title:           props.title,
      currentPrice:    props.currentPrice,
      originalPrice:   props.originalPrice,
      discountPercent: props.discountPercent,
      limitLabel:      props.limitLabel,
      endsAt:          props.endsAt,
      bannerImage:     props.bannerImage,
      skuImage:        props.skuImage,
      skuOnBanner:     props.skuOnBanner,
      loyaltyPoints:   props.loyaltyPoints,
      items:           props.items,
    },
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
</script>

<template>
  <div
    v-ripple
    class="bundle"
    :class="{ 'bundle--pressed': isPressed, 'bundle--selected': isSelected, 'bundle--claimed': claimed }"
    :style="cardStyle"
    @mousedown="isPressed = true"
    @mouseup="isPressed = false"
    @mouseleave="isPressed = false"
    @touchstart.passive="isPressed = true"
    @touchend.passive="isPressed = false"
    @click="onSelect"
  >
    <!-- Bundled SKU banner art -->
    <div class="bundle__banner">
      <Media :src="bannerImage" class="bundle__banner-img" />
      <div class="bundle__banner-scrim" />
      <!-- Optional 1:1 SKU hero composited onto the banner backdrop (above scrim) -->
      <Media
        v-if="skuOnBanner && skuImage"
        :src="skuImage"
        class="bundle__banner-sku"
      />
    </div>

    <!-- Breakdown row of child item tiles — omitted entirely when a bundle has no
         child items (e.g. an edition / digital key), so the -20px overlap row
         doesn't leave an empty gap above the title. -->
    <BundleBreakdown
      v-if="items.length"
      :items="items"
      :scrollable="breakdownScrollable"
      class="bundle__breakdown"
      @select="onItemSelect"
    />

    <!-- Info row: title + optional subtitle + price -->
    <div class="bundle__info">
      <div class="bundle__title-group">
        <p class="bundle__title">
          <span class="text-style-heading-sku-title">{{ title }}</span>
          <Button
            v-if="infoItems"
            variant="icon"
            size="small"
            icon="info"
            icon-variant="outlined"
            aria-label="Item info"
            class="bundle__info-btn"
            @click="onInfo($event)"
          />
        </p>
        <p v-if="subtitle" class="bundle__subtitle text-style-utility-label-regular">{{ subtitle }}</p>
        <p v-if="limitLabel" class="bundle__limit text-style-utility-label-regular">{{ limitLabel }}</p>
        <span v-if="countdown" class="bundle__countdown" :data-urgency="countdownUrgency">
          <MaterialIcon name="schedule" :size="14" class="bundle__countdown-icon" />
          <span class="bundle__countdown-text text-style-utility-label-regular">{{ countdownPrefix }} {{ countdown }}</span>
        </span>
      </div>
      <div class="bundle__price">
        <div v-if="originalPrice || discountPercent" class="bundle__discount">
          <span v-if="originalPrice" class="bundle__original text-style-utility-label-regular">{{ originalPrice }}</span>
          <span v-if="discountPercent" class="bundle__discount-pct text-style-utility-label-bold">{{ discountPercent }}</span>
        </div>
        <span class="bundle__current text-style-heading-sku-title">{{ currentPrice }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bundle {
  position: relative;
  border-radius: var(--x-radius-container-s);
  background: var(--x-bg-sku-card-default);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
  overflow: hidden;
  cursor: pointer;
  transition:
    background var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate),
    box-shadow var(--x-motion-sku-hover);
  animation-name: bundle-enter;
  animation-duration: var(--x-motion-sys-duration-slow);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;
}
/* Tokenised gradient border ring */
.bundle::before {
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
}
.bundle--selected {
  background: var(--x-bg-card-selected);
}
.bundle:hover {
  box-shadow: var(--x-shadow-card-hover);
  transition:
    background var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate),
    box-shadow var(--x-motion-sku-hover-in);
}
.bundle:hover::before { background: var(--x-border-sku-card-hover); }
.bundle--selected::before {
  background: var(--x-border-sku-card-selected);
  padding: var(--border-weight-selected);
}
.bundle--pressed {
  transform: scale(var(--x-motion-sku-press-scale)) !important;
  transition:
    transform var(--x-motion-sku-press),
    box-shadow var(--x-motion-sku-press) !important;
}

/* Claimed state — dim the banner art; price/CTA text stays at full opacity. */
.bundle--claimed { cursor: default; }
.bundle--claimed .bundle__banner {
  opacity: 0.3;
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
}

/* Banner art */
.bundle__banner {
  position: relative;
  height: 184px;
  border-radius: var(--x-radius-container-xs);
  overflow: hidden;
}

.bundle__banner-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Fade only the bottom edge of the banner into the card's dark surface */
  -webkit-mask-image: linear-gradient(to bottom, #000 70%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 70%, transparent 100%);
}
.bundle__banner-scrim {
  position: absolute;
  inset: 0;
  background: var(--x-gradient-bundle-banner);
}
/* 1:1 SKU hero overlay — centred horizontally in the banner, capped at 160×160.
   object-fit:contain keeps the square art undistorted on the wide backdrop. */
.bundle__banner-sku {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 160px;
  object-fit: contain;
  pointer-events: none;
}

/* Breakdown row position — overlaps the banner bottom by 20px (Figma: top:108px
   on a 128px banner → 128-108 = 20px overlap). Row layout + scroll behaviour live
   in BundleBreakdown.vue; this just positions it within the card. */
.bundle__breakdown {
  padding: 0 var(--x-pad-surface-s);
  margin-top: -20px;
}

/* Info row */
.bundle__info {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-m) var(--x-pad-surface-s) var(--x-pad-surface-xl);
}
.bundle__title-group {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
}
/* Flex row so the (i) icon sits beside the title without inheriting the text's
   own condense scaleX (applied to the inner span, not this row). */
.bundle__title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
  text-transform: uppercase;
  color: var(--x-text-header-default);
}
.bundle__title > .text-style-heading-sku-title {
  transform-origin: left center;
}
.bundle__info-btn {
  flex-shrink: 0;
  --btn-icon-color: var(--x-text-hyperlink-default);
  --btn-icon-color-hover: var(--x-text-hyperlink-hover, var(--x-text-hyperlink-default));
}
.bundle__subtitle {
  margin: 0;
  color: var(--x-text-body-default);
}
.bundle__limit {
  margin: 0;
  color: var(--x-text-body-default);
}

.bundle__countdown {
  display: inline-flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
  padding-top: var(--x-pad-surface-s);
  white-space: nowrap;
}
.bundle__countdown[data-urgency='default'] { color: var(--x-text-body-default); }
.bundle__countdown[data-urgency='warning']  { color: var(--x-text-warning-default); }
.bundle__countdown[data-urgency='error']    { color: var(--x-text-error-default); }
.bundle__countdown-icon { flex-shrink: 0; }

.bundle__price {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--x-gap-content-narrow);
}
.bundle__discount {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-narrow);
}
.bundle__original {
  color: var(--x-text-body-soft);
  text-decoration: line-through;
  transform-origin: right center;
}
.bundle__discount-pct {
  color: var(--x-text-success-default);
  transform-origin: right center;
}
.bundle__current {
  color: var(--x-text-hyperlink-default);
  white-space: nowrap;
  transform-origin: right center;
}


@keyframes bundle-enter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; }
  /* No transform in `to` — animation-fill-mode:both would otherwise retain
     translateY(0) on .bundle, creating a Chromium compositor layer that prevents
     child backdrop-filter from sampling the banner image within the card. */
}
</style>
