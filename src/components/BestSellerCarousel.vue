<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import BestSellerCard from './BestSellerCard.vue'
import MaterialIcon from './MaterialIcon.vue'
import { useDragScroll } from '../composables/useDragScroll.js'

/**
 * BestSellerCarousel — the horizontal "multiple recommendations" variant.
 * Renders a section header (label + chevron nav) and a row of compact
 * BestSellerCards. Cards are column-width-driven: up to 3 fit per row when the
 * column is wide enough; otherwise the row scrolls horizontally and the chevrons
 * appear. Chevron enabled/disabled state tracks scroll position.
 */
const props = defineProps({
  items: { type: Array, default: () => [] },
  heading: { type: String, default: 'BEST SELLERS' },
  description: { type: String, default: null },
  cpIcon: { type: String, default: null },
  /** Fallback hero image used for any item without its own `image` field */
  image: { type: String, default: null },
  /** Square SKU product image — forwarded to each card's checkout thumb */
  skuImage: { type: String, default: null },
  baseDelay: { type: Number, default: 0 },
})

const listRef = ref(null)
const hasOverflow = ref(false) // controls whether chevrons render at all
const canLeft = ref(false)
const canRight = ref(true)

// Cached layout metrics — clientWidth/scrollWidth only change on resize, NOT on
// scroll. Caching them keeps update() free of forced layout reads, so writing
// scrollLeft every frame during a drag/coast never triggers read-after-write
// layout thrash (the main source of the jitter).
let cw = 0
let sw = 0
function measure() {
  const el = listRef.value
  if (!el) return
  cw = el.clientWidth
  sw = el.scrollWidth
}
function update() {
  const el = listRef.value
  if (!el) return
  const sl = el.scrollLeft
  hasOverflow.value = sw > cw + 1
  canLeft.value = sl > 0
  canRight.value = sl + cw < sw - 1
}

const prefersReduced = () =>
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches

// Click-and-drag scrolling (mouse). Touch keeps native pan-x. The composable
// owns pointer capture, momentum, and click suppression; it writes scrollLeft,
// and `onScroll: update` keeps the chevron enabled/disabled state in sync.
const { isDragging, stop: stopDrag } = useDragScroll(listRef, { onScroll: update })

function scrollByDir(dir) {
  const el = listRef.value
  if (!el) return
  stopDrag() // cancel any in-flight drag/coast before the chevron takes over
  el.scrollBy({
    left: dir * cw * 0.8,
    behavior: prefersReduced() ? 'auto' : 'smooth',
  })
}

// ResizeObserver catches clientWidth changes from ANY cause — device switch,
// span resize, container queries — not just window resizes.
let ro = null
onMounted(() => {
  nextTick(() => { measure(); update() })
  if (typeof ResizeObserver !== 'undefined' && listRef.value) {
    ro = new ResizeObserver(() => { measure(); update() })
    ro.observe(listRef.value)
  }
})
onBeforeUnmount(() => {
  if (ro) ro.disconnect()
})
</script>

<template>
  <div class="bs-carousel">
    <div class="bs-carousel__header">
      <div class="bs-carousel__header-row">
        <h2 class="bs-carousel__title text-style-heading-banner">{{ heading }}</h2>

        <div v-if="hasOverflow" class="bs-carousel__nav">
        <button
          v-haptic
          type="button"
          class="bs-carousel__chevron"
          :class="{ 'is-disabled': !canLeft }"
          :disabled="!canLeft"
          aria-label="Previous"
          @click="scrollByDir(-1)"
        >
          <MaterialIcon name="chevron_left" variant="round" :size="24" />
        </button>
        <button
          v-haptic
          type="button"
          class="bs-carousel__chevron"
          :class="{ 'is-disabled': !canRight }"
          :disabled="!canRight"
          aria-label="Next"
          @click="scrollByDir(1)"
        >
          <MaterialIcon name="chevron_right" variant="round" :size="24" />
        </button>
      </div>
      </div>
      <p v-if="description" class="bs-carousel__desc text-style-paragraph-regular">{{ description }}</p>
    </div>

    <div ref="listRef" class="bs-carousel__list"
         :class="{ 'is-dragging': isDragging }"
         @scroll.passive="update"
    >
      <div v-for="(item, i) in items" :key="i" class="bs-carousel__item">
        <BestSellerCard
          compact
          :show-heading="false"
          :image="image"
          v-bind="item"
          :cp-icon="cpIcon"
          :sku-image="item.skuImage ?? skuImage"
          :base-delay="baseDelay + i * 90"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bs-carousel {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  width: 100%;
}

.bs-carousel__header {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-narrow);
  /* The component is full-bleed (carousel Span), but the HEADER is inset to the
     content gutter so the title/chevrons get padding — only the card list below
     bleeds to the screen edges. */
  padding-inline: var(--x-pad-surface-m); /* 12px — matches the Grid gutter on XS/S */
}
/* At M/L the carousel Span is centred (no bleed), so the header aligns to the
   Span edges and needs no extra inset. */
@container (min-width: 801px) {
  .bs-carousel__header { padding-inline: 0; }
}

.bs-carousel__header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--x-gap-content-default);
}

.bs-carousel__desc {
  color: var(--x-text-body-default);
  margin: 0;
}

/* Same heading style as the other category sections (sku-list__title).
   Typography handled by text-style-heading-banner. */
.bs-carousel__title {
  text-transform: uppercase;
  color: var(--x-text-header-default);
  margin: 0;
  display: block;
}

.bs-carousel__nav {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-tight); /* 2px */
  flex-shrink: 0;
}

.bs-carousel__chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
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
.bs-carousel__chevron:hover {
  color: var(--x-text-hyperlink-default);
  transform: scale(1.1);
}
.bs-carousel__chevron:active {
  transform: scale(0.95);
}
.bs-carousel__chevron.is-disabled {
  opacity: 0.3;
  transform: scale(0.97);
  pointer-events: none;
  cursor: default;
}

.bs-carousel__list {
  display: flex;
  gap: var(--x-gap-content-default); /* 8px */
  overflow-x: auto;
  cursor: grab;
  overflow-y: hidden;
  /* breathing room so the running-border ::before (inset -1.5px) and the hover
     translateY(-2px) lift are not clipped by the scroll container */
  padding-block: 6px;
  padding-inline: var(--x-pad-surface-m); /* 12px edge inset — matches Grid gutter */
  scroll-padding-inline: var(--x-pad-surface-m);
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  /* Touch swipe scrolling:
     - touch-action:pan-x lets the browser know this element owns horizontal panning
       so the parent's vertical scroll doesn't steal the gesture mid-swipe.
     - -webkit-overflow-scrolling:touch gives iOS the native momentum feel.
     - scroll-snap-type makes each swipe/drag/chevron-press come to rest on a
       card boundary — cards are ~62.5%/33% width by design (a peek of the
       next card while actively scrolling is intended, as the affordance that
       the row scrolls), but the row must never come to REST with a card
       sitting half-cut at the visible edge. `mandatory` (not `proximity`)
       because a drag release can land at an arbitrary offset — proximity
       only snaps when already close to a boundary, which wouldn't fix that. */
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  /* Prevent horizontal momentum from propagating to the parent vertical scroller */
  overscroll-behavior-x: contain;
}
.bs-carousel__list::-webkit-scrollbar {
  display: none;
}
.bs-carousel__list.is-dragging {
  cursor: grabbing;
  /* Prevent text/image selection while dragging */
  user-select: none;
  -webkit-user-select: none;
}

/* Column-driven width.
   XS/S: ~5 of 8 columns (≈62.5%) → wider cards, the row always scrolls.
   M/L:  3 fit per row (1/3 each), 207px floor so it scrolls until the span is
   wide enough (~637px), at which point the chevrons auto-hide. */
.bs-carousel__item {
  flex: 0 0 calc(62.5% - 3px);
  /* flex column so the BestSellerCard inside can fill the item height,
     making all cards in the row the same height regardless of content. */
  display: flex;
  flex-direction: column;
  scroll-snap-align: start;
}
/* Reach into the child component to make both the wrapper and the card
   fill the available height. :deep() pierces the scoped style boundary. */
.bs-carousel__item :deep(.bestseller),
.bs-carousel__item :deep(.bestseller__card) {
  flex: 1;
  min-height: 0;
}
@container (min-width: 801px) {
  .bs-carousel__item {
    flex: 0 0 calc((100% - 16px) / 3);
    min-width: 207px;
  }
}
</style>
