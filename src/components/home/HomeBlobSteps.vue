<script setup>
import { ref, computed } from 'vue'
import { useDragScroll } from '../../composables/useDragScroll.js'

/**
 * HomeBlobSteps — Home Blob's own "how it works" section, replacing the
 * shared HomeSteps this section used to reuse via a plain CSS-var reskin.
 * That version was a vertical stack of near-identical rows whose radius
 * (--x-radius-container-s, overridden by HomeBlob.vue to the rail-card
 * value) read as a full stadium pill rather than a squircle purely because
 * the row was so much shorter than it was wide — same token, different
 * proportions. This version borrows the horizontal "icon circle → heading →
 * body" layout mobbin turned up repeatedly for how-it-works sections (Calm,
 * ClassPass), each step getting its own blob-hue gradient icon circle
 * (same purple/teal/gold cycle as HomeBlobStats' icons) instead of one
 * shared wash, in an explicit squircle card instead of a pill.
 *
 * The shared `steps` data (also used by HomeStandard/HomeVisual) has a 4th
 * entry ("24/7 support") under a "3 easy steps" heading — not actually a
 * numbered step, so it's split out and rendered as a plain text line below
 * the row instead of a 4th card (no icon, no circle, no card chrome).
 *
 * Desktop (801px+): an N-up grid. Mobile: a horizontal drag-scroll rail,
 * same pattern as every other Home Blob rail (Genres/Spotlight/Picked).
 */
const props = defineProps({
  steps: { type: Array, default: () => [] }, // [{ icon, heading, body }]
})

const HUES = ['var(--x-home-blob-fill-spotlight)', 'var(--x-home-blob-fill-highlights)', 'var(--x-home-blob-fill-genres)']

const mainSteps = computed(() => props.steps.slice(0, 3))
const extraSteps = computed(() => props.steps.slice(3))

const railRef = ref(null)
const { isDragging } = useDragScroll(railRef)
</script>

<template>
  <div>
    <div ref="railRef" class="blob-steps" :class="{ 'is-dragging': isDragging }">
      <div v-for="(s, i) in mainSteps" :key="s.heading" class="blob-steps__item">
        <span
          class="blob-steps__icon-circle"
          :style="{ background: HUES[i % HUES.length] }"
        >
          <span class="blob-steps__icon" :style="{ '--blob-steps-icon-url': `url(${s.icon})` }"></span>
        </span>
        <p class="blob-steps__heading text-style-utility-action-bold">{{ s.heading }}</p>
        <p class="blob-steps__desc text-style-paragraph-small">{{ s.body }}</p>
      </div>
    </div>
    <p v-for="s in extraSteps" :key="s.heading" class="blob-steps__extra">
      <span class="text-style-utility-action-bold">{{ s.heading }}.</span>
      <span class="text-style-paragraph-small">{{ s.body }}</span>
    </p>
  </div>
</template>

<style scoped>
.blob-steps {
  display: flex;
  gap: var(--x-gap-content-default);
  overflow-x: auto;
  cursor: grab;
  /* Unlike HomeBlobHighlights' rail, this one lives directly in a plain
     `Grid > Span size="content"` (not nested inside HomeBlobSection's extra
     __content padding) — so there's only ONE ancestor inset to cancel:
     Grid's own --x-gap-grid-margin, same as Span's own `carousel` size. */
  margin-inline: calc(-1 * var(--x-gap-grid-margin));
  padding-inline: var(--x-pad-surface-l);
  padding-bottom: 4px;
  scroll-padding-inline: var(--x-pad-surface-l);
  scrollbar-width: none;
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}
.blob-steps::-webkit-scrollbar { display: none; }
.blob-steps.is-dragging {
  cursor: grabbing;
  user-select: none;
  -webkit-user-select: none;
}
.blob-steps__item {
  flex: 0 0 220px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--x-gap-content-tight);
  padding: var(--x-pad-surface-l);
  border-radius: var(--x-radius-home-blob-rail-card);
  corner-shape: var(--x-corner-shape-home-blob);
  background: var(--x-palette-home-blob-neutral-900, #1a0038);
  box-shadow: var(--x-shadow-home-blob-l1);
}
.blob-steps__icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 56px;
  height: 56px;
  border-radius: var(--x-radius-badge-full);
}
.blob-steps__icon {
  display: block;
  width: 28px;
  height: 28px;
  background-color: var(--x-palette-home-blob-neutral-0, #fff8fc);
  mask: var(--blob-steps-icon-url) center / contain no-repeat;
  -webkit-mask: var(--blob-steps-icon-url) center / contain no-repeat;
}
.blob-steps__heading {
  display: block;
  margin: var(--x-gap-content-tight) 0 0;
  color: var(--x-palette-home-blob-neutral-0, #fff8fc);
}
.blob-steps__desc {
  display: block;
  margin: 0;
  color: color-mix(in oklch, var(--x-palette-home-blob-neutral-0, #fff8fc) 80%, transparent);
}

/* The split-out non-step line (see the component doc comment) — plain text
   on the page background, no card/icon, clearly a lesser aside next to the
   numbered steps above it. */
.blob-steps__extra {
  margin: var(--x-gap-content-default) 0 0;
  color: color-mix(in oklch, var(--x-palette-home-blob-neutral-0, #fff8fc) 80%, transparent);
}
.blob-steps__extra span:first-child {
  color: var(--x-palette-home-blob-neutral-0, #fff8fc);
  margin-right: var(--x-gap-content-tight);
}

/* Desktop: a plain N-up grid, no scrolling — matches HomeBlobSpotlight/
   Picked's identical mobile-rail/desktop-grid switch. */
@container (min-width: 801px) {
  .blob-steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    overflow-x: visible;
    cursor: auto;
    margin-inline: 0;
    padding-inline: 0;
    padding-bottom: 0;
  }
  .blob-steps__item { flex-basis: auto; }
}
</style>
