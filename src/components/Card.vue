<script setup>
/**
 * Card — plain bordered L2 "sheet" content pane (border/bg matches
 * BaseSheet's own container tier, but static — no scrim, no transition, no
 * header/footer slots). Grounded in OrderCompletePage's Order Summary / Need
 * Help panes, the first two identical repeats of this exact wrapper.
 */
defineProps({
  title: { type: String, default: null },
  text: { type: String, default: null }, // fallback body content when no default slot is provided (e.g. in the harness)
})
</script>

<template>
  <div class="card">
    <h2 v-if="title" class="card__title text-style-heading-banner">{{ title }}</h2>
    <slot>{{ text }}</slot>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: var(--card-gap, var(--x-gap-content-default));
  padding: var(--card-padding, var(--x-pad-surface-m));
  border: var(--border-weight-default) solid var(--card-border, var(--x-border-sheet));
  border-radius: var(--card-radius, var(--x-radius-container-xs));
  background: var(--card-bg, var(--x-bg-sheet));
}
.card__title {
  margin: 0;
  text-transform: uppercase;
  color: var(--x-text-header-default);
}
</style>
