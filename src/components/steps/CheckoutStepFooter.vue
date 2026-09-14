<script setup>
import { computed, toRefs } from 'vue'
import Button from '../Button.vue'
import { useCheckout } from '../../composables/useCheckout.js'
import { useOrientation } from '../../composables/useOrientation.js'
import { formatNumber } from '../../utils/formatNumber.js'
import { parsePrice } from '../../utils/parsePrice.js'

/**
 * CheckoutStepFooter — the default (non-FCM-Buy-Now) payment step's pinned
 * footer: subtotal/price + CTA row, then the "View Terms and Conditions"
 * link that scrolls CheckoutStepBody's static legal bar into view. Sibling
 * to CheckoutStepBody — see that file for why the step is split in two.
 * Presentational port of CheckoutSheet.vue's footer.
 */
const props = defineProps({
  data: { type: Object, required: true },
  primaryAction: { type: Object, required: true },
  // From BaseSheet's #footer scoped slot — true while the body has more
  // content below the fold. Hides the terms link once the legal bar it
  // jumps to already fits on screen (a "view" link is redundant then).
  canScrollBody: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: true },
})
const { data, primaryAction } = toRefs(props)

const emit = defineEmits(['confirm'])

// Landscape full-screen (see BaseSheet's `landscapeFull` prop + Figma node
// 6060:3935): this footer becomes the design's right-hand column — the
// chosen-item banner CheckoutStepBody hides in that mode renders HERE
// instead (mirroring its own fallback-label logic), stacked above the same
// price + CTA this footer always shows.
const { orientation } = useOrientation()
const isLandscapeFull = computed(() => props.isMobile && orientation.value === 'landscape')
const itemDisplayLabel = computed(() => {
  const item = data.value.item
  if (!item) return ''
  return item.label || [formatNumber(item.amount), item.currencyLabel].filter(v => v != null && v !== '').join(' ')
})

// Selected payment channel — shown as its own row above Subtotal in the
// landscape summary column, so the chosen method is visible without also
// needing sight of the grid it was picked from (the two sit in separate
// columns there). Reads the same `channels`/`selectedChannel` CheckoutStepBody's
// grid reads/writes.
const { selectedChannel, promoDiscountAmount, showBoletoKyc } = useCheckout()
const selectedChannelLabel = computed(() => data.value.channels?.[selectedChannel.value]?.label ?? null)
const isBoletoSelected = computed(() => data.value.channels?.[selectedChannel.value]?.key === 'boleto')

// Boleto BR — Buy Now shows the KYC form (CheckoutStepBody, both
// orientations) instead of proceeding, when that channel is selected.
function onBuyNow() {
  if (isBoletoSelected.value) {
    showBoletoKyc.value = true
    return
  }
  emit('confirm')
}

// Subtotal, net of the promo discount CheckoutStepBody's PromoCode applies
// (same shared-singleton pattern as selectedChannel — see that field).
const subtotalDisplay = computed(() => {
  if (promoDiscountAmount.value == null) return data.value.item?.currentPrice
  const parsed = parsePrice(data.value.item?.currentPrice)
  if (!parsed) return data.value.item?.currentPrice
  const amt = Math.max(0, parsed.amount - promoDiscountAmount.value)
  return `${parsed.prefix}${amt.toFixed(2)}`
})

// Scrolls CheckoutStepBody's `.sheet__terms` legal bar into view — a sibling
// component's element, queried directly rather than plumbed through a ref
// (a pure scroll convenience, no state to keep in sync — same pattern as
// PaymentStepFooter).
function onViewTerms() {
  document.querySelector('.sheet__terms')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <!-- Landscape full-screen — right-hand column (Figma node 6060:3946):
       chosen item, then price, then the full-width CTA. -->
  <div v-if="isLandscapeFull" class="checkout-footer-landscape">
    <div class="cfl__item" v-if="data.item">
      <img
        v-if="data.item.skuImage"
        :src="data.item.skuImage"
        alt=""
        class="cfl__thumb cfl__thumb--img"
      />
      <div v-else class="cfl__thumb" aria-hidden="true"></div>
      <div class="cfl__item-info">
        <p v-if="itemDisplayLabel" class="cfl__item-title text-style-heading-card">{{ itemDisplayLabel }}</p>
        <p v-if="data.item.subtitle" class="cfl__item-subtitle text-style-utility-label-regular">{{ data.item.subtitle }}</p>
      </div>
    </div>

    <div class="cfl__rows">
      <div v-if="selectedChannelLabel" class="cfl__row cfl__row--channel">
        <!-- Not data.selectPaymentHeading — that's the picker's own "Select
             Payment" heading (CheckoutStepBody's grid). This row displays
             the already-chosen channel, so it reads "Selected Payment". -->
        <span class="cfl__row-label text-style-utility-label-regular">Selected Payment</span>
        <span class="cfl__row-value cfl__row-value--channel text-style-utility-label-regular">{{ selectedChannelLabel }}</span>
      </div>

      <div class="cfl__row">
        <span class="cfl__row-label text-style-utility-default-regular">{{ data.subtotalLabel }}</span>
        <span class="cfl__row-value text-style-heading-page-title">{{ subtotalDisplay }}</span>
      </div>
    </div>

    <Button
      variant="primary"
      size="large"
      full-width
      shimmer
      haptic-token="confirm"
      label-style="text-style-heading-banner"
      data-poi="purchase-cta"
      class="sheet__checkout"
      @click="onBuyNow()"
    >{{ primaryAction.label }}</Button>
  </div>

  <div v-else class="checkout-footer-wrap">
    <div class="checkout-footer">
      <div class="sheet__footer-info">
        <p class="sheet__subtotal text-style-utility-label-regular">{{ data.subtotalLabel }}</p>
        <p class="sheet__price text-style-heading-page-title">{{ data.item?.currentPrice }}</p>
        <p v-if="data.showPoweredByCoda" class="sheet__powered">
          <span class="sheet__powered-text text-style-utility-micro-regular">{{ data.poweredByLabel }}</span>
          <img :src="data.codaLogo" alt="Coda" class="sheet__coda" />
        </p>
      </div>
      <!-- CTA column: action button + right-aligned rating badge below. -->
      <div class="sheet__checkout-wrap">
        <div class="sheet__checkout-cta">
          <!-- fx-shimmer--metal-gloss: gloss-metal sweep (primary CTA, from
               effects.css/materials.css). Hot core set in scoped CSS to this
               button's own brand fill so the sweep tints toward it instead of
               a generic white streak (see .claude/skills/material-fx). -->
          <Button
            variant="primary"
            size="large"
            shimmer
            haptic-token="confirm"
            label-style="text-style-heading-banner"
            data-poi="purchase-cta"
            class="sheet__checkout"
            @click="onBuyNow()"
          >{{ primaryAction.label }}</Button>
          <img v-if="data.showRating" :src="data.ratingImage" alt="" class="sheet__rating" aria-hidden="true" />
        </div>
      </div>
    </div>
    <!-- Terms link — full-width, centered under the whole footer row
         (not just the right-hand CTA column above). Hidden once the
         legal bar it jumps to is already visible without scrolling —
         a "view" link is redundant when the thing it reveals is already
         on screen. -->
    <Button
      v-if="canScrollBody"
      variant="link"
      full-width
      label-style="text-style-utility-label-regular"
      class="sheet__terms-link"
      @click="onViewTerms()"
    >{{ data.viewTerms }}</Button>
  </div>
</template>

<style scoped>
/* ── Landscape full-screen — right-hand column ───────────────────────────
   BaseSheet's `.sheet--landscape-full .sheet__footer` override already
   turns the shared footer chrome into the L1 container box (Figma node
   6060:3946's "Left" frame); this is just its content stack — 8px gap,
   matching that frame's own `gap: 8px`. */
.checkout-footer-landscape {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  width: 100%;
}
.cfl__item {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  width: 100%;
}
.cfl__thumb {
  flex-shrink: 0;
  width: var(--x-size-img-xl);
  height: var(--x-size-img-xl);
  border-radius: var(--x-radius-container-xs);
  background: var(--x-gradient-thumb-gloss);
  border: var(--border-weight-default) solid var(--x-border-soft);
}
.cfl__thumb--img {
  object-fit: contain;
  background: none;
}
.cfl__item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
}
.cfl__item-title {
  color: var(--x-text-header-default);
  text-align: right;
  transform-origin: right center;
}
.cfl__item-subtitle {
  color: var(--x-text-body-default);
  text-align: right;
  transform-origin: right center;
}
/* Wraps the (optional) selected-channel row + the always-shown subtotal
   row — one divider above the pair, not one per row. Gap bumped one step,
   var(--x-gap-content-narrow) [4px] -> var(--x-gap-content-default) [8px]
   (now matching every other gap in this column) — the rows read too
   cramped against each other at the tighter step. */
.cfl__rows {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  width: 100%;
  padding-top: var(--x-pad-surface-s);
  border-top: var(--border-weight-default) solid var(--x-border-divider);
}
.cfl__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--x-gap-content-default);
  width: 100%;
}
.cfl__row-label {
  color: var(--x-text-body-default);
}
.cfl__row-value {
  text-transform: uppercase;
  color: var(--x-text-hyperlink-default);
  text-align: right;
  transform-origin: right center;
}
/* Selected-channel row — a plain informational line, not a final-price
   value, so it skips the price row's uppercase + hyperlink-colour treatment. */
.cfl__row-value--channel {
  text-transform: none;
  color: var(--x-text-body-default);
}

/* Single root so BaseSheet's shared .sheet__footer (flex-direction:column,
   tuned for the other sheets' stacked footers) never applies here — this
   footer is a horizontal row (info block | CTA column), controlled entirely
   within this component. */
.checkout-footer-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-separation);
  width: 100%;
}
.checkout-footer {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  width: 100%;
}

/* Footer — price + CTA action bar. Slides up over the loyalty ribbon by
   --x-checkout-loyalty-overlap so the rounded top corners overlap the green band. */
.sheet__footer-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
}
.sheet__subtotal {
  color: var(--x-text-body-default);
  margin: 0;
}
.sheet__price {
  text-transform: uppercase;
  color: var(--x-text-hyperlink-default);
}
.sheet__powered {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-narrow);
  color: var(--x-text-body-soft);
}
.sheet__coda {
  height: var(--x-size-icon-xs);
  width: auto;
  display: block;
}
/* Right-aligned CTA column (button + rating badge). */
.sheet__checkout-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}
/* Buy Now button + rating badge, unchanged 4px spacing between the two. */
.sheet__checkout-cta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--x-gap-content-narrow);
}

.sheet__rating {
  display: block;
  height: auto;
  width: auto;
  max-width: 100%;
}

/* Full-width sibling of .checkout-footer (not nested in the right-aligned
   CTA column) — centers under the whole footer, not just under the button.
   transform-origin must target Button's inner label span (:deep) — the
   condense scaleX is applied there, not on this outer element. */
.sheet__terms-link :deep(.btn__label) {
  transform-origin: center center;
}

/* Same fix, same reason, on the Buy Now CTA itself: its label is centered
   (Button's own justify-content:center) but text-styles.css's condense
   scaleX defaults transform-origin to the LEFT edge (correct for
   left-aligned text) — left uncorrected here, a condensed store's (e.g.
   COD:M, --x-sys-font-condense < 1) "Buy Now" visibly drifts left of
   center instead of scaling evenly from its own middle. */
.sheet__checkout :deep(.btn__label) {
  transform-origin: center center;
}

.sheet__checkout {
  flex-shrink: 0;
  --btn-bg: var(--x-text-hyperlink-default);
  --btn-bg-hover: var(--x-text-hyperlink-default);
  --btn-bg-pressed: var(--x-text-hyperlink-default);
  /* Dark ripple on the yellow CTA — use the tokenised dark variant */
  --x-fx-ripple-color: var(--x-fx-ripple-color-dark);
  /* gloss-metal shimmer: hot core tints toward this button's own fill instead
     of a generic white streak; rim stays the bright HDR-boosted light colour
     (--x-light-color -> --x-gloss-sheen) by default. */
  --x-material-metal-gloss-shimmer-core: var(--x-text-hyperlink-default);
}
/* --btn-bg-hover/-pressed can't express a hyperlink-default that's simply
   brighter (no such token exists) — brighten via filter instead, layered on
   top of the (unchanged) custom fill, matching this CTA's original hover. */
.sheet__checkout:hover { filter: brightness(1.05); }
.sheet__checkout:disabled { transform: scale(0.97); }
/* HDR glint is handled by --x-light-color's --x-gloss-sheen alias (upgraded in style.css @media). */
</style>
