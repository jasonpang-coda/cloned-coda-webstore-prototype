<script setup>
import { computed } from 'vue'
import { useCountUp } from '../../composables/useCountUp.js'

/**
 * HomeStatItem — a single count-up stat cell, split out of HomeStatBand so
 * each stat gets its own useCountUp() call scoped to its own component
 * instance (useCountUp registers onMounted/watch/onBeforeUnmount, which must
 * run inside an active component's setup — not inside a parent's computed
 * mapping over an array, which can re-evaluate outside setup).
 *
 * The number uses the DS's largest heading class (text-style-heading-
 * display-hero) as-is — never a raw font-size override or a transform:scale()
 * on top of it, which threw off the token's own line-height/margin rhythm —
 * in white with a soft glow (--x-hdr-glow, the same motion-tier glow token
 * used elsewhere for HDR effects) for a dramatic, on-brand hero number.
 */
const props = defineProps({
  value: { type: Number, default: 0 },
  suffix: { type: String, default: '' },
  label: { type: String, default: '' },
})
const { value: animated } = useCountUp(computed(() => props.value))
</script>

<template>
  <div class="stat-item">
    <div class="stat-item__value text-style-heading-display-hero">{{ animated }}{{ suffix }}</div>
    <div class="stat-item__label text-style-paragraph-small">{{ label }}</div>
  </div>
</template>

<style scoped>
.stat-item {
  text-align: center;
  padding: var(--x-pad-surface-xl) var(--x-pad-surface-xs);
}
.stat-item__value {
  display: block;
  margin: 0 0 var(--x-gap-content-tight);
  color: var(--x-text-header-default);
  filter: drop-shadow(0 0 16px var(--x-hdr-glow));
}
.stat-item__label {
  color: var(--x-home-surface-text-sub, var(--x-text-body-default));
}
</style>
