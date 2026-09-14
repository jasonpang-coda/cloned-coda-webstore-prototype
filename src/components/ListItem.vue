<script setup>
import { computed } from 'vue'
import MaterialIcon from './MaterialIcon.vue'
import { vRipple as vRippleBase } from '../directives/vRipple.js'
import { vHaptic as vHapticBase } from '../directives/vHaptic.js'

/**
 * ListItem — a full-width selectable/tappable row (a list of options, a
 * flat nav link, an account-menu link). Grounded in the two real "row"
 * families found in the codebase: LanguageSelectorSheet's padded, rounded,
 * hover-bg row with a trailing selected-check, and AccountPopover's plain
 * padded row with a leading icon. Both share the same underlying shape —
 * full-width flex row, optional leading/trailing icon, label, hover state —
 * just different token values, which is what the --li-* overrides below are
 * for. NOT used for: NavDrawer's indented L1/L2/L3 rows (real structural
 * differences — nesting, expand/collapse chevron-swap) or PcCard-style
 * selectable cards (multi-line content, not a row) — see Button.vue's own
 * "not worth migrating" notes for the same reasoning applied to rows.
 */
const props = defineProps({
  icon: { type: String, default: null }, // leading MaterialIcon name
  iconSize: { type: Number, default: 20 }, // AccountPopover's transaction-history row uses 24
  trailingIcon: { type: String, default: null }, // trailing MaterialIcon name (e.g. a selected checkmark)
  selected: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  as: { type: String, default: 'button' }, // 'button' | 'a'
  href: { type: String, default: null },
  labelStyle: { type: String, default: 'text-style-paragraph-regular' },
  label: { type: String, default: null }, // fallback content when no default slot is provided (e.g. in the harness, which only binds props)
  ariaLabel: { type: String, default: null },
  ripple: { type: Boolean, default: true },
  haptic: { type: Boolean, default: true },
})

defineEmits(['click'])

const tag = computed(() => (props.as === 'a' ? 'a' : 'button'))
const vRipple = { mounted: (el) => { if (props.ripple) vRippleBase.mounted(el) }, unmounted: vRippleBase.unmounted }
const vHaptic = { mounted: (el) => { if (props.haptic) vHapticBase.mounted(el, { arg: 'press' }) }, unmounted: vHapticBase.unmounted }
</script>

<template>
  <component
    :is="tag"
    v-ripple
    v-haptic
    class="li"
    :class="{ 'li--selected': selected }"
    :type="tag === 'button' ? 'button' : undefined"
    :href="tag === 'a' ? href : undefined"
    :disabled="tag === 'button' ? disabled : undefined"
    :aria-disabled="tag === 'a' && disabled ? 'true' : undefined"
    :aria-label="ariaLabel"
    :aria-pressed="selected ? 'true' : undefined"
    @click="$emit('click', $event)"
  >
    <slot name="icon">
      <MaterialIcon v-if="icon" :name="icon" variant="round" :size="iconSize" class="li__icon" />
    </slot>
    <span class="li__label" :class="labelStyle"><slot>{{ label }}</slot></span>
    <slot name="trailing-icon">
      <MaterialIcon v-if="trailingIcon" :name="trailingIcon" variant="round" :size="16" class="li__trailing-icon" />
    </slot>
  </component>
</template>

<style scoped>
.li {
  display: flex;
  align-items: center;
  gap: var(--li-gap, var(--x-gap-content-default));
  width: 100%;
  padding: var(--li-padding, var(--x-pad-surface-s));
  border: none;
  border-radius: var(--li-radius, 0);
  background: var(--li-bg, transparent);
  color: var(--li-color, var(--x-text-body-default));
  text-align: start;
  cursor: pointer;
  transition: color var(--x-motion-sku-hover), background-color var(--x-motion-sku-hover);
}
.li:hover:not(:disabled) {
  color: var(--li-color-hover, var(--x-text-header-strong));
  background-color: var(--li-bg-hover, transparent);
}
.li:active:not(:disabled) {
  color: var(--li-color-active, var(--li-color-hover, var(--x-text-header-strong)));
}
.li:disabled,
.li[aria-disabled="true"] {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}
.li--selected {
  color: var(--li-color-selected, var(--x-text-hyperlink-default));
}

.li__icon,
.li__trailing-icon {
  flex-shrink: 0;
}
.li__label {
  flex: 1;
  min-width: 0;
  transform-origin: left center;
}
</style>
