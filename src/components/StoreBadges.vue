<script setup>
defineProps({
  appStoreLabel: { type: String, default: null },
  appStoreUrl: { type: String, default: null },
  appStoreBadgeImg: { type: String, default: null },
  googlePlayLabel: { type: String, default: null },
  googlePlayUrl: { type: String, default: null },
  googlePlayBadgeImg: { type: String, default: null },
})
</script>

<template>
  <div v-if="appStoreLabel || googlePlayLabel" class="store-badges">
    <a
      v-if="appStoreLabel"
      v-ripple
      :href="appStoreUrl ?? '#'"
      target="_blank"
      rel="noopener noreferrer"
      class="store-badges__badge"
      :data-state="appStoreBadgeImg ? 'badge_image' : 'badge_text_pill'"
    >
      <img v-if="appStoreBadgeImg" :src="appStoreBadgeImg" :alt="appStoreLabel" />
      <span v-else class="text-style-utility-action-uppercase">{{ appStoreLabel }}</span>
    </a>
    <a
      v-if="googlePlayLabel"
      v-ripple
      :href="googlePlayUrl ?? '#'"
      target="_blank"
      rel="noopener noreferrer"
      class="store-badges__badge"
      :data-state="googlePlayBadgeImg ? 'badge_image' : 'badge_text_pill'"
    >
      <img v-if="googlePlayBadgeImg" :src="googlePlayBadgeImg" :alt="googlePlayLabel" />
      <span v-else class="text-style-utility-action-uppercase">{{ googlePlayLabel }}</span>
    </a>
  </div>
</template>

<style scoped>
.store-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-default);
}
.store-badges__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}
.store-badges__badge img {
  height: var(--x-size-control-m);
  width: auto;
  display: block;
  transition: opacity var(--x-motion-sku-hover);
}
.store-badges__badge:hover img {
  opacity: 0.85;
}
/* Fallback text pill — only used while no real badge SVG is wired up. */
.store-badges__badge span {
  display: inline-flex;
  align-items: center;
  height: var(--x-size-control-m);
  padding: 0 var(--x-pad-surface-l);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  border-radius: var(--x-radius-control-full);
  background: var(--x-bg-card-default);
  color: var(--x-text-hyperlink-default);
  transition: background-color var(--x-motion-sku-hover);
}
.store-badges__badge:hover span {
  background: var(--x-bg-action-primary);
}
</style>
