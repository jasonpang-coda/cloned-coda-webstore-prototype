<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import BundleSkuCard from './BundleSkuCard.vue'
import MaterialIcon from './MaterialIcon.vue'
import { useDragScroll } from '../composables/useDragScroll.js'

const props = defineProps({
  items:     { type: Array,  default: () => [] },
  heading:   { type: String, default: 'BEST SELLERS' },
  baseDelay: { type: Number, default: 0 },
})

const listRef     = ref(null)
const hasOverflow = ref(false)
const canLeft     = ref(false)
const canRight    = ref(true)

let cw = 0, sw = 0
function measure() {
  const el = listRef.value; if (!el) return
  cw = el.clientWidth; sw = el.scrollWidth
}
function update() {
  const el = listRef.value; if (!el) return
  const sl = el.scrollLeft
  hasOverflow.value = sw > cw + 1
  canLeft.value     = sl > 0
  canRight.value    = sl + cw < sw - 1
}

const prefersReduced = () =>
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches

const { isDragging, stop: stopDrag } = useDragScroll(listRef, { onScroll: update })

function scrollByDir(dir) {
  const el = listRef.value; if (!el) return
  stopDrag()
  el.scrollBy({ left: dir * cw * 0.8, behavior: prefersReduced() ? 'auto' : 'smooth' })
}

let ro = null
onMounted(() => {
  nextTick(() => { measure(); update() })
  if (typeof ResizeObserver !== 'undefined' && listRef.value) {
    ro = new ResizeObserver(() => { measure(); update() })
    ro.observe(listRef.value)
  }
})
onBeforeUnmount(() => { if (ro) ro.disconnect() })
</script>

<template>
  <div class="featured-carousel">
    <div class="featured-carousel__header">
      <h2 class="featured-carousel__title text-style-heading-banner">{{ heading }}</h2>
      <div v-if="hasOverflow" class="featured-carousel__nav">
        <button v-haptic type="button" class="featured-carousel__chevron"
                :class="{ 'is-disabled': !canLeft }" :disabled="!canLeft"
                aria-label="Previous" @click="scrollByDir(-1)">
          <MaterialIcon name="chevron_left" variant="round" :size="24" />
        </button>
        <button v-haptic type="button" class="featured-carousel__chevron"
                :class="{ 'is-disabled': !canRight }" :disabled="!canRight"
                aria-label="Next" @click="scrollByDir(1)">
          <MaterialIcon name="chevron_right" variant="round" :size="24" />
        </button>
      </div>
    </div>

    <div ref="listRef" class="featured-carousel__list"
         :class="{ 'is-dragging': isDragging }"
         @scroll.passive="update">
      <div v-for="(item, i) in items" :key="i" class="featured-carousel__item">
        <BundleSkuCard v-bind="item" :base-delay="baseDelay + i * 90" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.featured-carousel {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  width: 100%;
}

.featured-carousel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--x-gap-content-default);
  padding-inline: var(--x-pad-surface-m);
}
@container (min-width: 801px) {
  .featured-carousel__header { padding-inline: 0; }
}

.featured-carousel__title {
  text-transform: uppercase;
  color: var(--x-text-header-default);
  margin: 0;
  display: block;
}

.featured-carousel__nav {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
  flex-shrink: 0;
}

.featured-carousel__chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--x-size-icon-l);
  height: var(--x-size-icon-l);
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--x-text-header-default);
  cursor: pointer;
  transition:
    color var(--x-motion-sku-hover),
    transform var(--x-motion-sku-hover),
    opacity var(--x-motion-btn-activate);
}
.featured-carousel__chevron:hover {
  color: var(--x-text-hyperlink-default);
  transform: scale(1.1);
}
.featured-carousel__chevron:active {
  transform: scale(0.95);
}
.featured-carousel__chevron.is-disabled {
  opacity: 0.3;
  transform: scale(0.97);
  pointer-events: none;
  cursor: default;
}

.featured-carousel__list {
  display: flex;
  gap: var(--x-gap-content-default);
  overflow-x: auto;
  overflow-y: hidden;
  cursor: grab;
  padding-block: 6px;
  padding-inline: var(--x-pad-surface-m);
  scroll-padding-inline: var(--x-pad-surface-m);
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}
.featured-carousel__list::-webkit-scrollbar { display: none; }
.featured-carousel__list.is-dragging {
  cursor: grabbing;
  user-select: none;
  -webkit-user-select: none;
}
@container (min-width: 801px) {
  .featured-carousel__list { padding-inline: 0; }
}

.featured-carousel__item {
  flex: 0 0 calc(72% - 3px);
  display: flex;
  flex-direction: column;
}
.featured-carousel__item :deep(.bundle) {
  flex: 1;
  min-height: 0;
}
@container (min-width: 801px) {
  .featured-carousel__item {
    flex: 0 0 calc((100% - 16px) / 3);
    min-width: 220px;
  }
}
</style>
