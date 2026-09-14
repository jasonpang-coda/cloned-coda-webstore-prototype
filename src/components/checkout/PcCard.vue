<script setup>
import MaterialIcon from '../MaterialIcon.vue'

/**
 * PcCard — one payment-channel tile: logo (or a generic MaterialIcon fallback
 * when no logo asset exists yet), label, and an optional price line. Extracted
 * from PaymentStepBody.vue's `.sheet__pc-card` markup (the "Select Payment
 * Method" grid inside the overlay CheckoutSheet) so every payment-channel
 * grid in the app — the overlay sheet's and the inline checkout's StepPayment —
 * shares one component instead of two parallel implementations.
 */
defineProps({
  logo: { type: String, default: null },
  /** MaterialIcon name — fallback tile art when no logo asset is shipped for this channel */
  icon: { type: String, default: null },
  label: { type: String, required: true },
  /** Price line — shown once a SKU is selected upstream; omitted (null) shows nothing */
  price: { type: String, default: null },
  selected: { type: Boolean, default: false },
})

defineEmits(['click'])
</script>

<template>
  <button
    v-ripple
    v-haptic:chip
    type="button"
    class="pc-card"
    :class="{ 'pc-card--selected': selected }"
    @click="$emit('click')"
  >
    <img v-if="logo" :src="logo" alt="" class="pc-card__logo" />
    <MaterialIcon v-else-if="icon" :name="icon" variant="round" :size="24" class="pc-card__icon" />
    <span class="pc-card__label text-style-utility-label-regular">{{ label }}</span>
    <span v-if="price" class="pc-card__price text-style-utility-action-bold">{{ price }}</span>
  </button>
</template>

<style scoped>
.pc-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--x-gap-content-narrow);
  width: 100%;
  padding: var(--x-pad-surface-s) var(--x-pad-surface-s) var(--x-pad-surface-m);
  border: 0;
  border-radius: var(--x-radius-container-xs);
  background-image: var(--x-bg-card-default);
  cursor: pointer;
  transition: background-color var(--x-motion-sku-hover);
}
.pc-card::before {
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
  transition: background var(--x-motion-sku-hover);
}
.pc-card:hover::before {
  background: var(--x-border-sku-card-hover);
}
.pc-card--selected {
  /* --x-bg-card-selected is a flat colour (unlike --x-bg-card-default, a
     gradient) — background-image silently drops plain colours, so this uses
     background instead. */
  background: var(--x-bg-card-selected);
}
.pc-card--selected::before {
  padding: var(--border-weight-selected);
  background: var(--x-text-hyperlink-default);
}
.pc-card__logo {
  height: var(--x-size-icon-l);
  width: 72px;
  object-fit: contain;
  object-position: left center;
  display: block;
}
.pc-card__icon {
  color: var(--x-text-body-soft);
}
.pc-card__label {
  color: var(--x-text-body-soft);
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
.pc-card__price {
  color: var(--x-text-final-price);
  text-align: left;
}
</style>
