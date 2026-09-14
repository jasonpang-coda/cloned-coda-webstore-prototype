<script setup>
import { ref } from 'vue'
import TitleCard from './TitleCard.vue'
import { useDragScroll } from '../../composables/useDragScroll.js'

/**
 * TitleRail — horizontal drag-scroll row of TitleCards ("Picked for you").
 * Reuses useDragScroll (mouse click-drag + momentum; touch keeps native
 * pan-x) rather than re-rolling scroll mechanics — see BestSellerCarousel
 * for the same pattern.
 */
defineProps({
  titles: { type: Array, default: () => [] },
  variant: { type: String, default: 'standard' },
  baseDelay: { type: Number, default: 0 },
})
defineEmits(['open-title'])

const listRef = ref(null)
const { isDragging } = useDragScroll(listRef)
</script>

<template>
  <div ref="listRef" class="title-rail" :class="{ 'is-dragging': isDragging }">
    <div v-for="(t, i) in titles" :key="t.name" class="title-rail__item" :class="`title-rail__item--${variant}`">
      <TitleCard v-bind="t" :variant="variant" :base-delay="baseDelay + i * 40" @click="$emit('open-title')" />
    </div>
  </div>
</template>

<style scoped>
.title-rail {
  display: flex;
  gap: var(--x-gap-content-default);
  overflow-x: auto;
  cursor: grab;
  padding-block: 4px;
  padding-inline: var(--x-pad-surface-m);
  scroll-padding-inline: var(--x-pad-surface-m);
  scrollbar-width: none;
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}
.title-rail::-webkit-scrollbar { display: none; }
.title-rail.is-dragging {
  cursor: grabbing;
  user-select: none;
  -webkit-user-select: none;
}

/* Sizing is variant-driven here — the ONE place a rail item's width is set —
   so "Featured titles" (visual) and "Picked for you" (standard/visual both
   use this same rail) never have two competing size rules fighting over
   the same element (that's what left items inconsistently sized before). */
.title-rail__item--standard {
  flex: 0 0 132px;
}
@container (min-width: 801px) {
  .title-rail__item--standard { flex: 0 0 160px; }
}
.title-rail__item--visual {
  flex: 0 0 200px;
}
@container (min-width: 801px) {
  .title-rail__item--visual { flex: 0 0 260px; }
}
</style>
