<script setup>
import { ref } from 'vue'
import MaterialIcon from './MaterialIcon.vue'
import Button from './Button.vue'
import AccordionHeader from './AccordionHeader.vue'
import AccordionPanel from './AccordionPanel.vue'
import { useLocale } from '../composables/useLocale.js'

const { common } = useLocale()

const props = defineProps({
  /** Pre-discount item amount (numeric) — used to compute the demo discount. */
  amount: { type: Number, default: null },
})
const emit = defineEmits(['applied', 'removed', 'show-terms'])

/**
 * PromoCode — collapsible "Have a promo code?" mini-accordion inside
 * OrderSummarySheet's Order Summary detail (Figma 3451:23381 collapsed,
 * :23386 expanded, :23401 success, :23436 collapsed-success). Same
 * grid-rows 0fr→1fr height transition as `.osum__detail`/`ItemSummaryAccordion`
 * — the sanctioned accordion recipe, applied to a second, nested collapsible
 * unit inside the sheet's own already-open Order Summary accordion.
 *
 * Prototype-only validation: one hardcoded demo code succeeds with a flat
 * discount; anything else non-empty shows the input's error state (this
 * repo's first consumer of --x-border-input-error/--x-bg-input-error and
 * --x-border-input-success). No real backend — replace DEMO_CODE / the
 * discount math with the real thing when one exists.
 */
const DEMO_CODE = 'SAVE10'
const DEMO_DISCOUNT_RATE = 0.1

const open = ref(false)
const code = ref('')
const status = ref('idle') // 'idle' | 'error' | 'applied'

function onApply() {
  if (!code.value.trim()) return
  if (code.value.trim().toUpperCase() === DEMO_CODE) {
    status.value = 'applied'
    const discount = props.amount != null ? Math.round(props.amount * DEMO_DISCOUNT_RATE * 100) / 100 : 0
    emit('applied', discount)
  } else {
    status.value = 'error'
  }
}
function onRemove() {
  status.value = 'idle'
  code.value = ''
  emit('removed')
  // Removing a code returns to the default EXPANDED empty state, not collapsed.
  open.value = true
}
</script>

<template>
  <div class="promo">
    <AccordionHeader
      :open="open"
      icon="discount"
      justify="center"
      chevron-size="20"
      label-style="text-style-utility-default-regular"
      class="promo__head"
      @click="open = !open"
    >{{ status === 'applied' ? common.checkout.promoCodeAppliedLabel : common.checkout.promoCodeLabel }}</AccordionHeader>

    <AccordionPanel :open="open" class="promo__detail">
      <!-- Cross-fade between the input/error form and the success pill —
           same idiom as ClaimGiftSheet's claim-footer transition
           (opacity-only, fast accelerate-out / base decelerate-in). -->
      <Transition name="promo-status" mode="out-in">
        <div v-if="status !== 'applied'" key="form" class="promo__form">
          <div class="promo__field" :class="{ 'is-error': status === 'error' }">
            <input
              v-model="code"
              type="text"
              class="promo__input text-style-utility-label-regular"
              :placeholder="common.checkout.promoPlaceholder"
              @keydown.enter="onApply"
              @input="status = 'idle'"
            />
            <Button
              variant="link"
              :underline="false"
              label-style="text-style-utility-label-regular"
              :disabled="!code.trim()"
              class="promo__apply"
              @click="onApply"
            >{{ common.checkout.promoApply }}</Button>
          </div>
          <p class="promo__helper text-style-utility-micro-regular" :class="{ 'is-error': status === 'error' }">
            {{ status === 'error' ? common.checkout.promoInvalid : common.checkout.promoHelper }}
          </p>
        </div>
        <div v-else key="applied" class="promo__applied">
          <div class="promo__pill">
            <MaterialIcon name="check_circle" variant="round" :size="20" class="promo__pill-icon" />
            <span class="promo__pill-label text-style-utility-label-regular">{{ common.checkout.promoSuccess }}</span>
            <Button variant="icon" size="medium" icon="close" aria-label="Remove promo code" class="promo__pill-close" @click="onRemove" />
          </div>
          <button type="button" class="promo__viewterms text-style-utility-micro-regular" @click="emit('show-terms')">
            {{ common.checkout.promoViewTerms }}
          </button>
        </div>
      </Transition>
    </AccordionPanel>
  </div>
</template>

<style scoped>
.promo {
  width: 100%;
}
/* AccordionHeader/AccordionPanel own the shared layout+motion; this file
   only needs its own colour + spacing deviations from their defaults. */
.promo__head {
  --ah-gap: var(--x-gap-content-narrow);
  --ah-color: var(--x-text-hyperlink-default);
  --ah-chevron-color: var(--x-text-hyperlink-default);
  /* Same toggle idiom as .osum__chevron in the parent sheet — rotate in
     place rather than swapping expand_more/expand_less icons. */
  --ah-chevron-motion: var(--x-motion-toggle);
}
.promo__detail :deep(.ap__pad) {
  --ap-padding: 0 0 var(--x-pad-surface-s);
}

/* Both cross-fade branches share this layout — a control row + a line of
   micro text below it. */
.promo__form,
.promo__applied {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
}

/* Cross-fade between the form and the success pill — opacity-only, same
   asymmetric fast-out/base-in timing as ClaimGiftSheet's claim-footer. */
.promo-status-leave-active {
  transition: opacity var(--x-motion-sys-duration-fast) var(--x-motion-sys-ease-accelerate);
}
.promo-status-leave-to { opacity: 0; }
.promo-status-enter-active {
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.promo-status-enter-from { opacity: 0; }

.promo__field {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  width: 100%;
  height: 40px;
  padding: var(--x-pad-surface-s);
  border: var(--border-weight-default) solid var(--x-border-input-default);
  border-radius: var(--x-radius-input-s);
  background: var(--x-bg-input-default);
  transition: border-color var(--x-motion-sku-hover), background-color var(--x-motion-sku-hover);
}
.promo__field.is-error {
  border-color: var(--x-border-input-error);
  background: var(--x-bg-input-error);
}
.promo__input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--x-text-body-default);
  outline: none;
}
.promo__input::placeholder { color: var(--x-text-placeholder); }
.promo__apply {
  flex-shrink: 0;
}

.promo__helper {
  margin: 0;
  color: var(--x-text-body-default);
}
.promo__helper.is-error { color: var(--x-text-error-default); }

.promo__pill {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  width: 100%;
  height: 40px;
  padding: var(--x-pad-surface-s);
  border: var(--border-weight-default) solid var(--x-border-input-success);
  border-radius: var(--x-radius-input-s);
  background-image: var(--x-bg-sku-card-success);
}
.promo__pill-icon { flex-shrink: 0; color: var(--x-text-success-default); }
.promo__pill-label {
  flex: 1;
  text-align: center;
  color: var(--x-text-success-default);
  text-transform: uppercase;
}
.promo__pill-close {
  flex-shrink: 0;
  --btn-icon-color: var(--x-text-success-default);
  --btn-icon-color-hover: var(--x-text-success-default);
}

.promo__viewterms {
  margin: 0;
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
  color: var(--x-text-body-default);
  cursor: pointer;
}
</style>
