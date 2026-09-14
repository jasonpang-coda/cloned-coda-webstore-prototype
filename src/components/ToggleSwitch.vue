<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  /** Accessible label — every usage should pass one; the control has no visible label of its own. */
  ariaLabel: { type: String, required: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <button
    type="button"
    role="switch"
    class="toggle-switch"
    :class="{ 'toggle-switch--on': modelValue }"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    :disabled="disabled"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span class="toggle-switch__thumb" />
  </button>
</template>

<style scoped>
/* Matches Figma node 6424:11355 ("Toggle", COD:M v3 Tokens) — track 48x24,
   2px inset, 20px thumb, pill radius throughout. Token mapping (confirmed via
   get_variable_defs): Figma's chip radius maps to --x-radius-badge-full, the
   control x/y xs padding maps to --x-pad-surface-xxs, the icon-m size maps to
   --x-size-icon-m (thumb), off-state fill rgba(251,252,255,.08) and border
   rgba(251,252,255,.12) map to the ghost ramp's -2/-4 steps (oklch 8%/12%
   white — same values), border weight default maps to --border-weight-default,
   and the thumb's 5-layer drop shadow maps to the closest existing DS shadow,
   --x-shadow-story-card (matches its first 3 layers exactly; the remaining
   two are near-imperceptible long-throw layers at this scale). Figma only
   supplied the OFF state — ON reuses this repo's existing "active control"
   semantics (--x-bg-control-active / --x-border-control-active, the same
   brand-fill treatment every other active control in this DS uses). */
.toggle-switch {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  width: calc(var(--x-size-control-xs) * 2);
  height: var(--x-size-control-xs);
  padding: var(--x-pad-surface-xxs);
  border-radius: var(--x-radius-badge-full);
  border: var(--border-weight-default) solid var(--x-surface-ghost-4);
  background: var(--x-surface-ghost-2);
  cursor: pointer;
  transition: background-color var(--x-motion-toggle), border-color var(--x-motion-toggle), transform var(--x-motion-toggle);
}

.toggle-switch--on {
  background: var(--x-bg-control-active);
  border-color: var(--x-border-control-active);
}

/* Immediate press feedback on every click — independent of whether the
   subsequent permission request resolves, so a denied/blocked click still
   feels responsive instead of a dead no-op. */
.toggle-switch:not(:disabled):active {
  transform: scale(var(--x-motion-control-press-scale));
}

.toggle-switch:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.toggle-switch__thumb {
  display: block;
  width: var(--x-size-icon-m);
  height: var(--x-size-icon-m);
  border-radius: var(--x-radius-badge-full);
  background: var(--x-bg-action-neutral);
  box-shadow: var(--x-shadow-story-card);
  transform: translateX(0);
  transition: transform var(--x-motion-toggle);
}

.toggle-switch--on .toggle-switch__thumb {
  transform: translateX(calc(var(--x-size-control-xs) * 2 - 2 * var(--x-pad-surface-xxs) - var(--x-size-icon-m)));
}
</style>
