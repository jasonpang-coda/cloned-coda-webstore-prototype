<script setup>
import { computed } from 'vue'
import StatusTag from './StatusTag.vue'

/**
 * TransactionCard — one entry in the Transaction History list (Figma 5694:1389).
 * Three states drive the status pill and whether the Total Payment row shows:
 *   fulfilled → green pill + Total Payment row (dashed divider above it)
 *   pending   → grey pill,  no total
 *   failed    → red pill,   no total
 *
 * Theme-agnostic: all copy (row labels, status label) is passed in from the page,
 * which sources it from the active store's strings. The card formats nothing —
 * `date` and `total` arrive as display strings.
 */
const props = defineProps({
  state:         { type: String, default: 'fulfilled' }, // fulfilled | pending | failed
  title:         { type: String, required: true },        // product, e.g. '88 CP'
  date:          { type: String, required: true },         // formatted timestamp
  orderId:       { type: String, default: '' },
  transactionId: { type: String, default: '' },
  paymentMethod: { type: String, default: '' },
  total:         { type: String, default: null },          // null → no Total Payment row
  /** Row labels from strings.transactionHistory.row */
  labels:        { type: Object, required: true },
  /** Localised status label for this state */
  statusLabel:   { type: String, required: true },
  /** Per-card stagger delay in ms */
  animDelay:     { type: Number, default: 0 },
})

const STATUS_VARIANT = { fulfilled: 'success', pending: 'neutral', failed: 'error' }
const statusVariant = computed(() => STATUS_VARIANT[props.state] ?? 'neutral')
const isFailed = computed(() => props.state === 'failed')

const cardStyle = computed(() => ({ animationDelay: props.animDelay + 'ms' }))
</script>

<template>
  <article class="txn-card" :style="cardStyle">
    <h3 class="txn-card__title text-style-heading-page-title">{{ title }}</h3>

    <div class="txn-card__summary txn-card__summary--divided">
      <!-- Product : purchase date -->
      <div class="txn-card__row">
        <span class="txn-card__label text-style-utility-default-regular">{{ title }}</span>
        <span class="txn-card__sep text-style-utility-default-regular">:</span>
        <span class="txn-card__value text-style-utility-default-regular">{{ date }}</span>
      </div>
      <!-- Payment status : pill -->
      <div class="txn-card__row">
        <span class="txn-card__label text-style-utility-default-regular">{{ labels.paymentStatus }}</span>
        <span class="txn-card__sep text-style-utility-default-regular">:</span>
        <StatusTag :variant="statusVariant" :label="statusLabel" />
      </div>
      <!-- Order ID -->
      <div class="txn-card__row">
        <span class="txn-card__label text-style-utility-default-regular">{{ labels.orderId }}</span>
        <span class="txn-card__sep text-style-utility-default-regular">:</span>
        <span class="txn-card__value text-style-utility-default-regular">{{ orderId }}</span>
      </div>
      <!-- Transaction ID -->
      <div class="txn-card__row">
        <span class="txn-card__label text-style-utility-default-regular">{{ labels.transactionId }}</span>
        <span class="txn-card__sep text-style-utility-default-regular">:</span>
        <span class="txn-card__value text-style-utility-default-regular">{{ transactionId }}</span>
      </div>
      <!-- Payment Method -->
      <div class="txn-card__row">
        <span class="txn-card__label text-style-utility-default-regular">{{ labels.paymentMethod }}</span>
        <span class="txn-card__sep text-style-utility-default-regular">:</span>
        <span class="txn-card__value text-style-utility-default-regular">{{ paymentMethod }}</span>
      </div>
    </div>

    <!-- Total Payment — all states; failed shows "No charge Made" in regular style -->
    <div class="txn-card__total">
      <span class="txn-card__label text-style-utility-default-regular">{{ labels.totalPayment }}</span>
      <span v-if="!isFailed" class="txn-card__total-value text-style-heading-modal">{{ total }}</span>
      <span v-else class="txn-card__total-no-charge text-style-utility-default-regular">{{ labels.noCharge }}</span>
    </div>
  </article>
</template>

<style scoped>
.txn-card {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-m) var(--x-pad-surface-s) var(--x-pad-surface-l);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  border-radius: var(--x-radius-container-s);
  /* L1 surface reads as the dark page with a faint white lift (Figma's 4% sheen). */
  background: var(--x-surface-frost);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));

  /* Entrance — fade + rise, decelerate, staggered by list index (delay inline).
     Animation LONGHANDS: the easing token contains commas, so the shorthand is invalid. */
  animation-name: txn-card-enter;
  animation-duration: var(--x-motion-sys-duration-base);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;
}

@keyframes txn-card-enter {
  from { opacity: 0; transform: translateY(var(--x-motion-sys-distance-md)); }
  to   { opacity: 1; transform: none; }
}

.txn-card__title {
  color: var(--x-text-header-default);
  /* condense + left origin come from the text-style class */
}

.txn-card__summary {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
}
/* Dashed divider between the summary rows and the Total Payment row (all states). */
.txn-card__summary--divided {
  padding-bottom: var(--x-pad-surface-l);
  border-bottom: var(--border-weight-default) dashed var(--x-border-divider);
}

.txn-card__row {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  color: var(--x-text-header-default);
}
.txn-card__label {
  flex: 0 0 128px;
  color: var(--x-text-header-default);
}
.txn-card__sep {
  flex: 0 0 auto;
}
.txn-card__value {
  flex: 1 1 0;
  min-width: 0;
  color: var(--x-text-header-default);
}

.txn-card__total {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  color: var(--x-text-header-default);
}
.txn-card__total .txn-card__label {
  color: var(--x-text-header-default);
}
.txn-card__total-value {
  flex: 1 1 0;
  min-width: 0;
  text-align: right;
  text-transform: uppercase;
  color: var(--x-text-header-default);
  /* Right-aligned price → anchor the Hitmarker condense to the right edge. */
  transform-origin: right center;
}
.txn-card__total-no-charge {
  flex: 1 1 0;
  min-width: 0;
  text-align: right;
  color: var(--x-text-header-default);
}
</style>
