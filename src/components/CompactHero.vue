<script setup>
import Thumbnail from './Thumbnail.vue'
import InfoTag from './InfoTag.vue'

/**
 * CompactHero — compact left-rail card for the two-column split layout
 * (config.page.layout === 'split', e.g. Codashop): a square product
 * thumbnail, the game title, and an optional delivery InfoTag. Mirrors the
 * Figma reference's "Hero" block (node 2189:2730). Not to be confused with
 * StepGamerId.vue (the "Enter Gamer ID" input form) or HeroSkuCard.vue (a
 * SKU-card ring-effect variant) — this is the game-identity tile only.
 *
 * Renders only when the store provides config.identity — every store other
 * than Codashop omits that key, so this component never mounts elsewhere.
 * Content and copy come entirely from props (config.identity + strings),
 * never hardcoded — see web-store-components conventions. Only side padding
 * is its own (matches the Figma reference's page margin, --x-pad-surface-m);
 * vertical rhythm comes from the caller's standard `.section` wrapper, same
 * as every other App.vue section.
 */
defineProps({
  image: { type: String, required: true },
  title: { type: String, required: true },
  /** Delivery chip label (e.g. "Instant Delivery"). Omit to hide the chip. */
  deliveryLabel: { type: String, default: null },
})
</script>

<template>
  <div class="compact-hero">
    <Thumbnail :image="image" />
    <div class="compact-hero__text">
      <h1 class="compact-hero__title text-style-heading-banner">{{ title }}</h1>
      <InfoTag v-if="deliveryLabel" icon="verified_user" :label="deliveryLabel" />
    </div>
  </div>
</template>

<style scoped>
.compact-hero {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding-left: var(--x-pad-surface-m);
  padding-right: var(--x-pad-surface-m);
}

.compact-hero__text {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
  min-width: 0;
}

.compact-hero__title {
  margin: 0;
  color: var(--x-text-header-inverse);
}
</style>
