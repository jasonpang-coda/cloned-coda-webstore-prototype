<script setup>
import { ref, computed, toRefs, onMounted, onBeforeUnmount } from 'vue'
import MaterialIcon from '../MaterialIcon.vue'
import PcCard from '../checkout/PcCard.vue'
import PromoCode from '../PromoCode.vue'
import { useCheckout } from '../../composables/useCheckout.js'
import { parsePrice } from '../../utils/parsePrice.js'

/**
 * PaymentStepBody — the "Order Summary / Select Payment Method" step's
 * scrolling body: collapsible order-summary accordion (with the Promo Code
 * mini-accordion + its T&Cs details modal), the static Terms & Conditions
 * legal bar, and the payment-channel grid. Presentational over `data` (the
 * resolved `payment` content descriptor from sheetContent.js); reads
 * `useCheckout().selectedChannel` directly (the shared singleton every SKU
 * card / BuyNowBar already reads) so PaymentStepFooter can independently
 * compute canCheckout without a prop bridge. Sibling to PaymentStepFooter —
 * split because BaseSheet keeps the scrolling body and pinned footer as
 * separate slots.
 *
 * Owns the promo-code state itself (discount amount, T&Cs modal visibility)
 * since it's fresh-mounted every time the payment step is entered (a plain
 * v-if branch in PurchaseSheet, not kept-alive) — that natural remount is
 * what resets it each time, mirroring the original OrderSummarySheet's
 * `watch(sheetOpen)` reset with no extra code. The T&Cs modal itself must
 * render as a sibling of BaseSheet's own panel (not clipped by its
 * overflow:hidden) — it Teleports into the mount point PurchaseSheet renders
 * via BaseSheet's `#overlay` slot.
 */
const props = defineProps({
  data: { type: Object, required: true },
  overlayTarget: { type: Object, default: null },
})
const { data } = toRefs(props)

const { selectedChannel } = useCheckout()

const rootRef = ref(null)
const accordionOpen = ref(true)
const COLLAPSE_SCROLL_THRESHOLD = 24 // px — small tolerance before collapsing

let scrollTarget = null
function onBodyScroll(e) {
  if (e.target.scrollTop > COLLAPSE_SCROLL_THRESHOLD) accordionOpen.value = false
}
onMounted(() => {
  // The actual scroller is BaseSheet's `.sheet__body` — the nearest scrolling
  // ancestor of this component's own root, not an element PaymentStepBody
  // owns itself (BaseSheet owns the scroll container; see BaseSheet.vue).
  scrollTarget = rootRef.value?.closest('.sheet__body') ?? null
  scrollTarget?.addEventListener('scroll', onBodyScroll, { passive: true })
})
onBeforeUnmount(() => scrollTarget?.removeEventListener('scroll', onBodyScroll))

function selectChannel(i) {
  selectedChannel.value = i
}

// ── Promo code — prototype demo discount, applied on top of the breakdown ──
const priceAmount = computed(() => parsePrice(data.value.item?.currentPrice)?.amount ?? null)
const promoDiscountAmount = ref(null) // numeric amount, or null when no code applied
function onPromoApplied(discount) {
  promoDiscountAmount.value = discount
}
function onPromoRemoved() {
  promoDiscountAmount.value = null
}
const promoDiscountDisplay = computed(() => {
  if (promoDiscountAmount.value == null) return null
  const parsed = parsePrice(data.value.item?.currentPrice)
  return `${parsed?.prefix ?? ''}${promoDiscountAmount.value.toFixed(2)}`
})
const finalTotalDisplay = computed(() => {
  if (!data.value.breakdown) return null
  if (promoDiscountAmount.value == null) return data.value.breakdown.total
  const parsed = parsePrice(data.value.item?.currentPrice)
  if (!parsed) return data.value.breakdown.total
  const amt = Math.max(0, parsed.amount - promoDiscountAmount.value)
  return `${parsed.prefix}${amt.toFixed(2)}`
})
const totalDisplay = computed(() => finalTotalDisplay.value ?? data.value.totalDisplay)

// T&C details modal — triggered by PromoCode's "Tap to see terms and
// conditions" line once a code is applied. Teleports into the mount point
// PurchaseSheet renders via BaseSheet's #overlay slot.
const promoDetailsOpen = ref(false)

// Terms & Conditions — always-expanded legal bar below the payment-channel
// list; the footer link just scrolls it into view.
const termsRef = ref(null)
function onViewTerms() {
  termsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Escape closes the promo T&Cs modal first (if open), otherwise the whole
// sheet — PurchaseSheet's own Escape handling (via BaseSheet) covers the
// close-the-sheet half; this only needs to intercept while the modal shows.
function onKey(e) {
  if (e.key === 'Escape' && promoDetailsOpen.value) {
    e.stopPropagation()
    promoDetailsOpen.value = false
  }
}
onMounted(() => window.addEventListener('keydown', onKey, true))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey, true))

defineExpose({ onViewTerms })
</script>

<template>
  <div ref="rootRef" class="osum-root">
    <div v-if="data.item" class="osum" :class="{ 'osum--open': accordionOpen }">
      <button v-ripple type="button" class="osum__head" :aria-expanded="accordionOpen" @click="accordionOpen = !accordionOpen">
        <img v-if="data.item.skuImage" :src="data.item.skuImage" alt="" class="osum__thumb osum__thumb--img" />
        <div v-else class="osum__thumb" aria-hidden="true"></div>
        <div class="osum__info">
          <span class="osum__name text-style-heading-sku-title">{{ data.summaryLabel }}</span>
          <span v-if="data.item.subtitle" class="osum__subtitle text-style-utility-label-regular">{{ data.item.subtitle }}</span>
        </div>
        <span class="osum__total text-style-heading-card">{{ totalDisplay }}</span>
        <MaterialIcon
          name="expand_more"
          variant="round"
          :size="24"
          class="osum__chevron"
          :class="{ 'is-open': accordionOpen }"
        />
      </button>

      <div class="osum__detail" :class="{ 'is-open': accordionOpen }">
        <div class="osum__detail-inner">
          <div class="osum__detail-pad">
            <div class="osum__row">
              <span class="osum__row-label text-style-utility-default-regular">{{ data.accountLabel }}</span>
              <span class="osum__row-value text-style-utility-default-regular">{{ data.accountName }}</span>
            </div>
            <div class="osum__row">
              <span class="osum__row-label text-style-utility-default-regular">{{ data.itemPriceLabel }}</span>
              <span class="osum__row-value text-style-utility-default-regular">{{ data.breakdown?.item }}</span>
            </div>
            <div class="osum__row">
              <span class="osum__row-label text-style-utility-default-regular">{{ data.taxLabel }}</span>
              <span class="osum__row-value text-style-utility-default-regular">{{ data.breakdown?.tax }}</span>
            </div>

            <div v-if="promoDiscountAmount != null" class="osum__row">
              <span class="osum__row-label text-style-utility-default-regular">{{ data.promoDiscountLabel }}</span>
              <span class="osum__row-value osum__row-value--discount text-style-utility-default-regular">-{{ promoDiscountDisplay }}</span>
            </div>

            <div class="osum__row osum__row--total">
              <span class="osum__row-label text-style-utility-default-bold">{{ data.totalLabel }}</span>
              <span class="osum__row-value text-style-utility-default-bold">{{ finalTotalDisplay }}</span>
            </div>

            <PromoCode
              :amount="priceAmount"
              @applied="onPromoApplied"
              @removed="onPromoRemoved"
              @show-terms="promoDetailsOpen = true"
            />
          </div>
        </div>
      </div>
    </div>

    <p class="sheet__pc-heading text-style-utility-label-regular">{{ data.selectPaymentHeading }}</p>
    <div class="sheet__pc-list">
      <PcCard
        v-for="(c, i) in data.channels"
        :key="i"
        :logo="c.logo"
        :label="c.name"
        :price="c.price"
        :selected="selectedChannel === i"
        @click="selectChannel(i)"
      />
    </div>

    <!-- Terms & Conditions — always-expanded legal bar. Named legal documents
         wrapped in .sheet__terms-link-inline (hyperlink token styling) —
         rendered via v-html, same convention as SignInLoader's
         openingApp/qrInstruction strings embedding a raw <sup> tag. -->
    <div ref="termsRef" class="sheet__terms">
      <span class="sheet__terms-heading text-style-utility-default-bold">{{ data.termsHeading }}</span>
      <p class="sheet__terms-body text-style-utility-micro-regular" v-html="data.termsBody"></p>
    </div>
  </div>

  <!-- Promo Code T&Cs details — teleports into the mount point PurchaseSheet
       renders via BaseSheet's #overlay slot, so it isn't clipped by the
       scrolling body and disappears together with the sheet when it closes.
       Explicit :duration (mirrors BaseSheet's own outer Transition) — Vue's
       CSS auto-detection reads the transition off the ROOT element passed to
       Transition (.promo-modal), but the actual transition lives on its
       children (.promo-modal__panel/__scrim); without an explicit duration
       Vue finds nothing on the root and unmounts within a couple frames,
       cutting the leave animation off before it's visible. -->
  <Teleport :to="overlayTarget" :disabled="!overlayTarget">
    <Transition name="promo-modal" :duration="{ enter: 350, leave: 200 }">
      <div v-if="promoDetailsOpen" class="promo-modal" role="dialog" aria-modal="true" :aria-label="data.promoDetailsTitle">
        <div class="promo-modal__scrim" @click="promoDetailsOpen = false"></div>
        <div class="promo-modal__panel">
          <div class="promo-modal__header">
            <span class="promo-modal__title text-style-heading-modal">{{ data.promoDetailsTitle }}</span>
          </div>
          <div class="promo-modal__section">
            <span class="promo-modal__section-heading text-style-heading-subtitle">{{ data.promoDetailsHeading }}</span>
            <p class="promo-modal__section-body text-style-utility-default-regular">{{ data.promoDetailsBody }}</p>
          </div>
          <div class="promo-modal__section">
            <span class="promo-modal__section-heading text-style-heading-subtitle">{{ data.promoTermsHeading }}</span>
            <p class="promo-modal__section-body text-style-utility-default-regular">{{ data.promoTermsBody }}</p>
          </div>
          <button v-ripple v-haptic type="button" class="promo-modal__close" @click="promoDetailsOpen = false">
            <span class="promo-modal__close-label text-style-heading-banner">{{ data.promoClose }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.osum-root {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  width: 100%;
}

.osum {
  width: 100%;
  flex-shrink: 0;
  border: var(--border-weight-default) solid var(--x-border-soft);
  border-radius: var(--x-radius-container-s);
  background-image: var(--x-bg-card-default);
  overflow: hidden;
}
.osum__head {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  width: 100%;
  padding: var(--x-pad-surface-s);
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
}
.osum--open .osum__head {
  border-bottom: var(--border-weight-default) solid var(--x-border-divider);
}
.osum__thumb {
  flex-shrink: 0;
  width: var(--x-size-img-xl);
  height: var(--x-size-img-xl);
  border-radius: var(--x-radius-container-xs);
  background: var(--x-gradient-thumb-gloss);
  border: var(--border-weight-default) solid var(--x-border-soft);
  object-fit: contain;
}
.osum__thumb--img { background: none; }
.osum__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
}
.osum__name { color: var(--x-text-header-default); transform-origin: left center; }
.osum__subtitle { color: var(--x-text-body-default); transform-origin: left center; }
.osum__total {
  flex-shrink: 0;
  color: var(--x-text-final-price);
  white-space: nowrap;
  transform-origin: right center;
}
.osum__chevron {
  flex-shrink: 0;
  color: var(--x-text-body-soft);
  transition: transform var(--x-motion-toggle);
}
.osum__chevron.is-open { transform: rotate(180deg); }

.osum__detail {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--x-motion-accordion);
}
.osum__detail.is-open { grid-template-rows: 1fr; }
.osum__detail-inner { min-height: 0; overflow: hidden; }
.osum__detail-pad {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-s) var(--x-pad-surface-s) var(--x-pad-surface-m);
}
.osum__row {
  display: flex;
  align-items: flex-start;
  gap: var(--x-gap-content-default);
  color: var(--x-text-body-default);
}
.osum__row-label { flex: 1; min-width: 0; transform-origin: left center; }
.osum__row-value { flex-shrink: 0; text-align: right; transform-origin: right center; white-space: nowrap; }
.osum__row-value--discount { color: var(--x-text-success-default); }
.osum__row--total { padding-top: var(--x-pad-surface-xs); border-top: var(--border-weight-default) solid var(--x-border-divider); }

.sheet__pc-heading {
  margin: 0;
  width: 100%;
  text-transform: uppercase;
  color: var(--x-text-body-soft);
  display: block;
}

.sheet__pc-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--x-gap-content-default);
  width: 100%;
}
/* Each PcCard sizes to a fixed 2-up column within this list (unlike
   StepPayment's 4-up SkuImageList-style grid) — sized here, on the list,
   since PcCard itself is width:100% and layout-agnostic. flex-grow:0 keeps
   every card the same width even when a trailing odd card is alone in the
   last row — flex-grow:1 would stretch that card to fill the row instead. */
.sheet__pc-list > * {
  flex: 0 1 calc(50% - var(--x-gap-content-default));
  min-width: 0;
}

/* Terms & Conditions — static legal bar, always expanded. No margin-top of
   its own — the parent's flex gap is enough separation from the
   payment-channel list; stacking an extra margin on top of that pushed this
   block down near the footer's scroll-fade/shadow, where it read as covered
   by the footer's scrim instead of sitting with the payment list above it. */
.sheet__terms {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-narrow);
  width: 100%;
  padding-top: var(--x-pad-surface-m);
  border-top: var(--border-weight-default) solid var(--x-border-divider);
}
.sheet__terms-heading {
  color: var(--x-text-body-default);
}
.sheet__terms-body {
  margin: 0;
  padding-bottom: var(--x-pad-surface-s);
  color: var(--x-text-body-default);
  white-space: pre-line;
}
/* Named legal documents (User Agreement / Terms & Conditions / Privacy
   Notice) inline within the body copy — same hyperlink token as
   .sheet__terms-link, the footer's own T&C link. */
.sheet__terms-body :deep(.sheet__terms-link-inline) {
  color: var(--x-text-hyperlink-default);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ── Promo Code T&Cs details modal — small centered dialog, above this
   sheet's own panel. Shell/frosted-surface treatment matches BaseSheet's own
   panel; scale+fade motion matches SignInSheet's centered-modal breakpoint. */
.promo-modal {
  position: absolute;
  inset: 0;
  z-index: 5; /* above this sheet's own panel */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--x-pad-surface-xl);
  /* The overlay mount point's ancestor sets pointer-events:none and expects
     each child to opt back in — .sheet__scrim/.sheet__panel do this
     themselves, but this modal is a later sibling of .sheet__panel, outside
     that opt-in, so it needs its own (that's why a real click on Close did
     nothing even though a synthetic .click() in testing "worked" — that
     bypasses pointer-events entirely). */
  pointer-events: auto;
}
.promo-modal__scrim {
  position: absolute;
  inset: 0;
  background: var(--x-scrim);
}
.promo-modal__panel {
  position: relative;
  width: 100%;
  max-width: 336px;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  padding: var(--x-pad-surface-m) var(--x-pad-surface-s) var(--x-pad-surface-l);
  border: var(--border-weight-default) solid var(--x-border-sheet);
  border-radius: var(--x-radius-container-m);
  background-image: var(--x-bg-sheet);
  background-color: var(--x-bg-page);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
  box-shadow: var(--x-shadow-sheet);
}
.promo-modal__header {
  display: flex;
  justify-content: flex-start;
  padding-bottom: var(--x-pad-surface-m);
}
.promo-modal__title {
  text-align: left;
  text-transform: uppercase;
  color: var(--x-text-header-default);
}
.promo-modal__section {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
}
.promo-modal__section-heading { color: var(--x-text-header-default); }
.promo-modal__section-body { margin: 0; color: var(--x-text-header-default); }
.promo-modal__close {
  width: 100%;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--x-radius-control-full);
  background: var(--x-bg-action-primary);
  color: var(--x-text-on-primary);
  cursor: pointer;
}
.promo-modal__close-label { text-transform: uppercase; }

.promo-modal-enter-active .promo-modal__panel {
  transition: transform var(--x-motion-modal-enter), opacity var(--x-motion-modal-enter);
  transition-delay: var(--x-motion-sys-duration-modal-panel-delay);
}
.promo-modal-leave-active .promo-modal__panel { transition: transform var(--x-motion-modal-exit), opacity var(--x-motion-modal-exit); }
.promo-modal-enter-from .promo-modal__panel,
.promo-modal-leave-to .promo-modal__panel { transform: scale(0.96); opacity: 0; }
.promo-modal-enter-to .promo-modal__panel,
.promo-modal-leave-from .promo-modal__panel { transform: scale(1); opacity: 1; }

.promo-modal-enter-active .promo-modal__scrim { transition: opacity var(--x-motion-modal-enter); }
.promo-modal-leave-active .promo-modal__scrim {
  transition: opacity var(--x-motion-modal-exit);
  transition-delay: var(--x-motion-sys-duration-modal-panel-delay);
}
.promo-modal-enter-from .promo-modal__scrim,
.promo-modal-leave-to .promo-modal__scrim { opacity: 0; }
.promo-modal-enter-to .promo-modal__scrim,
.promo-modal-leave-from .promo-modal__scrim { opacity: 1; }
</style>
