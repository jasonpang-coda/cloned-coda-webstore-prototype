<script setup>
import { ref } from 'vue'
import HomeBlobCard from './HomeBlobCard.vue'
import HomeBlobPillNav from './HomeBlobPillNav.vue'
import { useDragScroll } from '../../composables/useDragScroll.js'

/**
 * HomeBlobGenreRail — Genres/Category CONTENT (Figma node 4114:1610): a
 * sticky category pill, then a horizontally drag-scrollable rail of
 * same-size squircle title cards. The blob background itself lives in
 * HomeBlobSection.vue, which wraps this component (full-bleed) in
 * HomeBlob.vue.
 */
defineProps({
  categories: { type: Array, default: () => [] }, // [{ id, label }]
  active: { type: String, default: null },
  titles: { type: Array, default: () => [] },
})
defineEmits(['select', 'open-title'])

const railRef = ref(null)
const { isDragging } = useDragScroll(railRef)
</script>

<template>
  <div class="home-blob-genres">
    <div class="home-blob-genres__nav-wrap">
      <HomeBlobPillNav :tabs="categories" :active="active" @update:active="$emit('select', $event)" />
    </div>
    <div ref="railRef" class="home-blob-genres__rail" :class="{ 'is-dragging': isDragging }">
      <TransitionGroup name="blob-card">
        <div v-for="t in titles" :key="t.name" class="home-blob-genres__item">
          <HomeBlobCard :name="t.name" :tile="t.tile" size="rail" aspect="1 / 1" @click="$emit('open-title')" />
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.home-blob-genres {
  display: flex;
  flex-direction: column;
}

/* Full width on mobile, matching the full-bleed rail below it — was 5/6 and
   centred at every breakpoint, which read as an unwanted inset next to the
   rail's own edge-to-edge cards. Kept narrower and centred at 801px+, where
   it now sits above the equally-confined content column. */
.home-blob-genres__nav-wrap {
  width: 100%;
}
@container (min-width: 801px) {
  .home-blob-genres__nav-wrap {
    width: 83.3333%;
    margin-inline: auto;
  }
}

.home-blob-genres__rail {
  display: flex;
  gap: var(--x-gap-content-default);
  overflow-x: auto;
  cursor: grab;
  /* `overflow-x: auto` forces this element's own overflow-y to clip too
     (its clip region is the padding box) — too little padding-block clips
     the card's own drop-shadow at the top/bottom of every row. Hover's L2
     shadow reaches furthest (24px offset + 64px blur + 16px spread ≈ 104px
     below, ~64px above) — this is trimmed noticeably tighter than that full
     math (per an explicit "make the blob shorter" request), so a hovered
     card near the rail's top/bottom edge can clip a bit of its own glow;
     that's a deliberate size-over-full-shadow trade-off, not an oversight. */
  padding-top: 24px;
  padding-bottom: 56px;
  padding-inline: var(--x-pad-surface-l);
  scroll-padding-inline: var(--x-pad-surface-l);
  scrollbar-width: none;
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}
.home-blob-genres__rail::-webkit-scrollbar { display: none; }
.home-blob-genres__rail.is-dragging {
  cursor: grabbing;
  user-select: none;
  -webkit-user-select: none;
}
.home-blob-genres__item {
  /* 144px shows ~2.5 cards at a 390px mobile width (was 202px, only ~1.5) —
     this rail (unlike Spotlight/Picked/Highlights) has no mobile/desktop
     split otherwise, so the original 202px is restored at 801px+ below
     rather than shrinking the desktop rail too. */
  flex: 0 0 144px;
  /* flex items default to min-width:auto, which floors their size at their
     CONTENT's min-content width — for a long, non-wrapping caption (e.g.
     "PlayStation Store Gift Cards") that's wider than 202px, so the item
     (and the whole card inside it) silently grew past 202px instead of
     truncating, making some rail cards visibly bigger than others. min-
     width:0 lets the fixed flex-basis actually win, so the caption's own
     overflow:hidden/ellipsis (HomeBlobCard.vue) does the truncating instead. */
  min-width: 0;
}
@container (min-width: 801px) {
  .home-blob-genres__item { flex-basis: 202px; }
}

/* Playful bounce when switching category chips — same elastic curve as
   HomeBlobHighlights.vue's identical transition (kept as a per-component
   duplicate since Vue scoped styles can't share a snippet across files
   without a separate stylesheet import for four rules). */
.blob-card-enter-active {
  transition:
    transform var(--x-motion-sys-duration-slow) var(--x-motion-home-blob-ease-elastic),
    opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
}
.blob-card-leave-active {
  transition:
    transform var(--x-motion-sys-duration-fast) var(--x-motion-sys-ease-accelerate),
    opacity var(--x-motion-sys-duration-fast) var(--x-motion-sys-ease-accelerate);
}
.blob-card-move {
  transition: transform var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
}
.blob-card-enter-from {
  opacity: 0;
  transform: scale(0.7);
}
.blob-card-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
</style>
