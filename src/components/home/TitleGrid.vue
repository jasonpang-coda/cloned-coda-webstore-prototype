<script setup>
import { ref } from 'vue'
import TitleCard from './TitleCard.vue'
import { useScrollBloom } from '../../composables/useScrollBloom.js'

/**
 * TitleGrid — the 2-up (XS/S) / wider (M/L) responsive grid of TitleCards,
 * used by "Trending titles" and (with scrollBloom) "Picked for you".
 * Container-query driven, not viewport media queries (per the FE skill).
 *
 * scrollBloom — scroll-LINKED (not reveal-once) reveal for the section with
 * the most tiles ("Picked for you"), in the spirit of
 * https://codepen.io/argyleink/pen/wBMvNaN ("Scroll to bloom"): each tile
 * scales up from .85 and settles its tiny alternating left/right tilt back
 * to 0 as its scroll progress increases — and reverses the same way when
 * scrolling back up. See useScrollBloom.js for why this recomputes progress
 * from getBoundingClientRect() rather than the source pen's
 * `animation-timeline: view()` (that CSS API doesn't reliably span this
 * app's two different scroll contexts — framed vs. Responsive device mode).
 */
const props = defineProps({
  titles: { type: Array, default: () => [] },
  variant: { type: String, default: 'standard' },
  baseDelay: { type: Number, default: 0 },
  scrollBloom: { type: Boolean, default: false },
})
defineEmits(['open-title'])

const itemRefs = ref([])
function setItemRef (el, i) {
  if (el) itemRefs.value[i] = el
}

if (props.scrollBloom) useScrollBloom(itemRefs)
</script>

<template>
  <div class="title-grid" :class="`title-grid--${variant}`">
    <div
      v-for="(t, i) in titles"
      :key="t.name"
      :ref="(el) => setItemRef(el, i)"
      class="title-grid__item"
      :class="{ 'title-grid__item--bloom': scrollBloom }"
      :style="{ '--side': i % 2 === 0 ? -1 : 1 }"
    >
      <TitleCard
        v-bind="t"
        :variant="variant"
        :base-delay="baseDelay + i * 40"
        @click="$emit('open-title')"
      />
    </div>
  </div>
</template>

<style scoped>
.title-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--x-gap-content-default);
}
@container (min-width: 641px) {
  .title-grid { grid-template-columns: repeat(3, 1fr); }
}
@container (min-width: 801px) {
  .title-grid { grid-template-columns: repeat(4, 1fr); }
}
@container (min-width: 1280px) {
  .title-grid { grid-template-columns: repeat(6, 1fr); }
}

/* Visual variant leans into a denser, more immersive wall at larger sizes. */
.title-grid--visual {
  gap: var(--x-gap-content-loose);
}

.title-grid__item {
  min-width: 0;
}

/* --bloom-progress (0→1) is written directly by useScrollBloom.js every
   scroll frame — calc() here turns that single continuous value into the
   scale/rotate interpolation, so un-scrolling smoothly reverses it too
   (no discrete "revealed" class to get stuck once true). */
.title-grid__item--bloom {
  --bloom-progress: 0;
  scale: calc(0.85 + 0.15 * var(--bloom-progress));
  rotate: calc(var(--side, 1) * 4deg * (1 - var(--bloom-progress)));
}
</style>
