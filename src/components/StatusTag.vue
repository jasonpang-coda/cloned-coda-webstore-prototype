<script setup>
/**
 * StatusTag — bordered status pill for the transaction cards (Figma "Tag").
 * A different family from the marketing SkuTag: it sits on an indicator surface
 * with a matching border and uses a sentence-case Inter label (the
 * .text-style-utility-label-tall one-off — Inter, so no Hitmarker condense).
 *
 * Variants map to the semantic indicator ramps:
 *   success — Fulfilled   (green)
 *   neutral — In Progress (grey)
 *   error   — Failed      (red)
 */
defineProps({
  label:   { type: String, required: true },
  variant: { type: String, default: 'neutral' }, // success | neutral | error
})
</script>

<template>
  <span class="status-tag" :class="`status-tag--${variant}`">
    <span class="status-tag__text text-style-utility-label-tall">{{ label }}</span>
  </span>
</template>

<style scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-narrow);
  padding: var(--x-pad-surface-xs);
  border: var(--border-weight-default) solid transparent;
  border-radius: var(--x-radius-badge-s);
  white-space: nowrap;
}

.status-tag__text {
  display: block;
  line-height: 1;
  color: var(--x-text-body-default);
  white-space: nowrap;
}

.status-tag--success {
  background: var(--x-bg-indicator-success-subtle);
  border-color: var(--x-border-indicator-success);
}
.status-tag--neutral {
  background: var(--x-bg-indicator-neutral-subtle);
  border-color: var(--x-border-indicator-neutral);
}
.status-tag--error {
  background: var(--x-bg-indicator-error-subtle);
  border-color: var(--x-border-indicator-error);
}
</style>
