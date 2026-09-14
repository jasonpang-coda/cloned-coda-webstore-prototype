<script setup>
import { computed } from 'vue'
import MaterialIcon from './MaterialIcon.vue'
import { vRipple as vRippleBase } from '../directives/vRipple.js'
import { vHaptic as vHapticBase } from '../directives/vHaptic.js'

/**
 * AccordionHeader — the clickable disclosure trigger for an accordion row
 * (a rotating expand_more chevron + `aria-expanded`). Grounded in the
 * "sanctioned accordion pattern" already documented identically in three
 * places (HomeFaq, ItemSummaryAccordion, PromoCode's head): full-width
 * button, optional leading content, label, chevron that rotates 180° via
 * `--x-motion-accordion`. `justify` covers the one real layout split found —
 * HomeFaq/ItemSummaryAccordion space their content and chevron to the row's
 * far edges; PromoCode groups icon+label+chevron as one centered cluster.
 * Pairs with AccordionPanel for the collapsible content below it — this
 * component is the trigger only, not the panel.
 */
const props = defineProps({
  open: { type: Boolean, required: true },
  disabled: { type: Boolean, default: false },
  icon: { type: String, default: null }, // leading MaterialIcon name (e.g. PromoCode's discount icon)
  chevron: { type: Boolean, default: true }, // hide entirely (not just static) when a row has nothing to expand (e.g. ItemSummaryAccordion's !hasDetail)
  chevronSize: { type: Number, default: 24 }, // PromoCode's compact head uses 20
  justify: { type: String, default: 'between' }, // 'between' | 'center'
  labelStyle: { type: String, default: 'text-style-utility-action-bold' },
  label: { type: String, default: null }, // fallback content when no default slot is provided (e.g. in the harness, which only binds props)
  ariaLabel: { type: String, default: null },
  ripple: { type: Boolean, default: true },
  haptic: { type: Boolean, default: true },
})

defineEmits(['click'])

const vRipple = { mounted: (el) => { if (props.ripple) vRippleBase.mounted(el) }, unmounted: vRippleBase.unmounted }
const vHaptic = { mounted: (el) => { if (props.haptic) vHapticBase.mounted(el, { arg: 'press' }) }, unmounted: vHapticBase.unmounted }
</script>

<template>
  <button
    v-ripple
    v-haptic
    type="button"
    class="ah"
    :class="[`ah--${justify}`, { 'is-open': open }]"
    :aria-expanded="open"
    :aria-label="ariaLabel"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot name="content">
      <slot name="icon">
        <MaterialIcon v-if="icon" :name="icon" variant="round" :size="20" class="ah__icon" />
      </slot>
      <span class="ah__label" :class="labelStyle"><slot>{{ label }}</slot></span>
    </slot>
    <MaterialIcon v-if="chevron" name="expand_more" variant="round" :size="chevronSize" class="ah__chevron" />
  </button>
</template>

<style scoped>
.ah {
  display: flex;
  align-items: center;
  gap: var(--ah-gap, var(--x-gap-content-default));
  width: 100%;
  padding: var(--ah-padding, var(--x-pad-surface-s) 0);
  border: none;
  background: var(--ah-bg, transparent);
  color: var(--ah-color, var(--x-text-body-default));
  text-align: left;
  cursor: pointer;
  transition: background-color var(--x-motion-sku-hover);
}
.ah:hover:not(:disabled) {
  background: var(--ah-bg-hover, transparent);
}
.ah:active:not(:disabled) {
  transform: var(--ah-active-transform, none);
}
.ah:disabled {
  cursor: default;
}

.ah--between {
  justify-content: space-between;
}
.ah--center {
  justify-content: center;
}
.ah--center .ah__label {
  flex: none;
}

.ah__icon {
  flex-shrink: 0;
}
.ah__label {
  flex: 1;
  min-width: 0;
  transform-origin: left center;
}

.ah__chevron {
  flex-shrink: 0;
  color: var(--ah-chevron-color, currentColor);
  transition: transform var(--ah-chevron-motion, var(--x-motion-accordion));
}
.ah.is-open .ah__chevron {
  transform: rotate(180deg);
}
</style>
