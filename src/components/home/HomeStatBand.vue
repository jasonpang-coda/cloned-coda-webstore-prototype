<script setup>
import HomeStatItem from './HomeStatItem.vue'

/**
 * HomeStatBand — 2x2 (4-up at M/L) trust stats, each counting up on mount
 * (see HomeStatItem for why each stat is its own component instance).
 */
defineProps({
  stats: { type: Array, default: () => [] }, // [{ value, suffix, label }]
})
</script>

<template>
  <div class="stat-band">
    <HomeStatItem v-for="s in stats" :key="s.label" :value="s.value" :suffix="s.suffix" :label="s.label" />
  </div>
</template>

<style scoped>
.stat-band {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--x-gap-content-separation) var(--x-gap-content-loose);
  padding: var(--x-pad-surface-l);
  border-radius: var(--x-radius-container-s);
  background: var(--x-home-surface-bg, var(--x-bg-card-default));
  border: var(--border-weight-default) solid var(--x-home-surface-border, transparent);
  box-shadow: var(--x-shadow-card);
  backdrop-filter: var(--x-home-surface-blur, none);
  -webkit-backdrop-filter: var(--x-home-surface-blur, none);
}
@container (min-width: 801px) {
  .stat-band { grid-template-columns: repeat(4, 1fr); }
}
</style>
