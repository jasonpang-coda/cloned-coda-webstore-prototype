<script setup>
import { computed } from 'vue'
import MaterialIcon from '../MaterialIcon.vue'
import { useCountUp } from '../../composables/useCountUp.js'

/**
 * HomeBlobStatItem — one count-up stat cell for HomeBlobStats, split out
 * the same way HomeStatItem is split from HomeStatBand (useCountUp must run
 * inside its own component's setup, not a parent's v-for mapping).
 * The icon renders bare (no chip/circle background) at a large size with a
 * soft glow — reads as a bigger graphic anchor for the number rather than a
 * small badge, per design feedback that a contained chip made it read too
 * much like a UI control and too little like a hero graphic.
 */
const props = defineProps({
  icon: { type: String, required: true },
  value: { type: Number, default: 0 },
  suffix: { type: String, default: '' },
  label: { type: String, default: '' },
})
const { value: animated } = useCountUp(computed(() => props.value))
</script>

<template>
  <div class="blob-stat-item">
    <MaterialIcon :name="icon" :size="36" class="blob-stat-item__icon" />
    <div class="blob-stat-item__value text-style-heading-display-hero">{{ animated }}{{ suffix }}</div>
    <div class="blob-stat-item__label text-style-paragraph-small">{{ label }}</div>
  </div>
</template>

<style scoped>
.blob-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--x-gap-content-tight);
  padding: var(--x-pad-surface-l) var(--x-pad-surface-xs);
}
.blob-stat-item__icon {
  color: var(--x-palette-home-blob-neutral-0, #fff8fc);
  filter: drop-shadow(0 0 12px var(--x-hdr-glow));
}
.blob-stat-item__value {
  display: block;
  margin: 0;
  color: var(--x-palette-home-blob-neutral-0, #fff8fc);
}
.blob-stat-item__label {
  color: color-mix(in oklch, var(--x-palette-home-blob-neutral-0, #fff8fc) 80%, transparent);
}
</style>
