<template>
  <div
    class="gift-grid"
    :class="{ 'gift-grid--few': count < 4 }"
    :style="count < 4 ? { '--gift-count': count } : {}"
  >
    <slot />
  </div>
</template>

<script setup>
defineProps({ count: { type: Number, default: 0 } })
</script>

<style scoped>
/* Gifts grid — 2-up at every width (incl. mobile), per Figma node 5357:10819.
   Container query resolves against .device__screen (container-type: inline-size). */
.gift-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--x-gap-content-default);
}

/* M-L: fewer than 4 items collapse to a single row */
@container (min-width: 641px) {
  .gift-grid--few {
    grid-template-columns: repeat(var(--gift-count), 1fr);
  }
}
</style>
