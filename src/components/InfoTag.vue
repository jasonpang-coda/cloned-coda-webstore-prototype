<script setup>
import MaterialIcon from './MaterialIcon.vue'

/**
 * InfoTag — icon+label pill for informational chips (Figma "Tag"), distinct
 * from SkuTag (marketing badges: bonus/value/success) and StatusTag
 * (bordered transaction-state pills). Subtle bordered fill rather than a
 * solid colour — see --x-bg-tag-neutral / --x-border-tag-neutral.
 *
 * variant: 'neutral' (default) uses the neutral fill/border/inverse-text
 * triplet; 'success' reuses the same -success tokens SkuTag's success
 * variant already relies on, for a positive-confirmation badge (e.g.
 * TrustBar's "Delivered or your money back").
 */
defineProps({
  /** MaterialIcon name — omit to render the label with no leading icon. */
  icon: { type: String, default: null },
  iconVariant: { type: String, default: 'round' },
  label: { type: String, required: true },
  variant: { type: String, default: 'neutral' }, // 'neutral' | 'success'
})
</script>

<template>
  <span class="info-tag" :class="`info-tag--${variant}`">
    <MaterialIcon v-if="icon" :name="icon" :variant="iconVariant" :size="20" />
    <span class="info-tag__label text-style-utility-label-tall">{{ label }}</span>
  </span>
</template>

<style scoped>
.info-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--x-gap-content-narrow);
  width: fit-content;
  padding: var(--x-pad-surface-xs);
  border-radius: var(--x-radius-badge-s);
}

.info-tag--neutral {
  border: var(--border-weight-default) solid var(--x-border-tag-neutral);
  background: var(--x-bg-tag-neutral);
  color: var(--x-text-header-inverse);
}

.info-tag--success {
  border: var(--border-weight-default) solid var(--x-border-tag-success);
  background: var(--x-bg-tag-success);
  color: var(--x-text-success-default);
}

/* This instance bolds the label (Figma: Inter Bold), overriding
   .text-style-utility-label-tall's default regular weight. */
.info-tag__label {
  display: block;
  font-weight: var(--x-sys-weight-bold);
  white-space: nowrap;
}
</style>
