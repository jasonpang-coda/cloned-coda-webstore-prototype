<script setup>
import MaterialIcon from './MaterialIcon.vue'

/**
 * LinkRow — full-row tappable external link-out (label + trailing chevron).
 * Grounded in OrderCompletePage's Need Help list. Deliberately NOT built on
 * ListItem — ListItem has no gradient-border hook and renders on a flat
 * `--li-bg`, while this row needs the same mask-composite ring + sku-card
 * fill tokens as SkuBanner (a genuinely different visual language, not just
 * a missing override).
 */
defineProps({
  href: { type: String, default: '#' },
  label: { type: String, default: null },
  external: { type: Boolean, default: true },
})
</script>

<template>
  <a
    v-ripple
    :href="href"
    :target="external ? '_blank' : null"
    :rel="external ? 'noopener noreferrer' : null"
    class="link-row"
  >
    <span class="link-row__label text-style-paragraph-regular"><slot>{{ label }}</slot></span>
    <MaterialIcon name="chevron_right" variant="round" :size="24" class="link-row__chevron" />
  </a>
</template>

<style scoped>
/* Gradient border — same mask-composite ring technique as SkuBanner. */
.link-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-m) var(--x-pad-surface-s);
  border-radius: var(--lr-radius, var(--x-radius-container-xs));
  background: var(--lr-bg, var(--x-bg-sku-card-default));
  color: var(--x-text-header-default);
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  transition: background-color var(--x-motion-sku-hover);
}
.link-row::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: var(--border-weight-default);
  background: var(--lr-border, var(--x-border-sku-card-default));
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: destination-out;
  pointer-events: none;
  z-index: 2;
}
.link-row:hover { background: var(--lr-bg-hover, var(--x-bg-tag-neutral)); }
.link-row__label { flex: 1 1 0; min-width: 0; }
.link-row__chevron { flex-shrink: 0; color: var(--x-text-hyperlink-default); }
</style>
