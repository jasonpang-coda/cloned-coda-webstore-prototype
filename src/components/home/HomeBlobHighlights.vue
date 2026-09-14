<script setup>
import { ref } from 'vue'
import HomeBlobCard from './HomeBlobCard.vue'
import HomeBlobPillNav from './HomeBlobPillNav.vue'
import { useDragScroll } from '../../composables/useDragScroll.js'

/**
 * HomeBlobHighlights — Highlighted Titles CONTENT (Figma node 4109:1005):
 * a sticky genre-filter pill, a full-width hero card ALWAYS in its own row
 * (mobile and desktop alike — kept as a deliberately distinct, prominent
 * element per design feedback), then the remaining titles in an equal-width
 * row: a horizontal drag-scroll rail below 801px, a plain 3-up grid at
 * 801px+ — same responsive pattern as HomeBlobSpotlight/Picked's own row.
 * The row's cards use size="panel" (not "featured") so their caption reads
 * at the same weight/size as every other section's rail cards; only the
 * hero keeps the bigger "featured" treatment.
 * The blob background itself lives in HomeBlobSection.vue, which wraps
 * this component in HomeBlob.vue.
 */
defineProps({
  tabs: { type: Array, default: () => [] },
  active: { type: String, default: 'all' },
  titles: { type: Array, default: () => [] },
})
defineEmits(['update:active', 'open-title'])

const rowRef = ref(null)
const { isDragging } = useDragScroll(rowRef)
</script>

<template>
  <div class="home-blob-highlights">
    <HomeBlobPillNav :tabs="tabs" :active="active" @update:active="$emit('update:active', $event)" />

    <div class="home-blob-highlights__hero-wrap">
      <!-- Full-row-width card, so its aspect ratio alone sets the section's
           height — 16:9 (the other cards' ratio) made this card ~810px tall
           at a 1440px content column, dwarfing the rest of the page. 2.6:1
           matches the hero carousel above instead, for a proportionate hero
           height that still reads as "featured". -->
      <Transition name="blob-card">
        <HomeBlobCard
          v-if="titles[0]"
          :key="titles[0].name"
          class="home-blob-highlights__hero"
          :name="titles[0].name"
          :tile="titles[0].tile"
          size="featured"
          aspect="2.6 / 1"
          @click="$emit('open-title')"
        />
      </Transition>
    </div>

    <!-- Plain div carries the ref (a `ref` on TransitionGroup itself resolves
         to its component instance, not a DOM node — useDragScroll needs a
         real element) and the scroll/flex CSS; TransitionGroup inside it
         (no `tag`, so it renders no wrapper of its own — same pattern
         HomeBlobGenreRail's rail uses) drives the bounce transition on
         genre-filter changes this section already had. -->
    <div ref="rowRef" class="home-blob-highlights__row" :class="{ 'is-dragging': isDragging }">
      <TransitionGroup name="blob-card">
        <HomeBlobCard
          v-for="t in titles.slice(1, 4)"
          :key="t.name"
          class="home-blob-highlights__item"
          :name="t.name"
          :tile="t.tile"
          size="panel"
          aspect="1920 / 1080"
          @click="$emit('open-title')"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.home-blob-highlights {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
}
/* The pill nav sits in the same 36px-inset box as the row below it (see
   that comment) but had no cancel of its own, so it stayed inset while the
   row went full-bleed — its own padding: var(--x-pad-surface-l) already
   provides the chips' lead-in, so only the ancestor margin needs cancelling
   here. Reset at 801px+, where the nav sits above the equally-confined
   hero/row grid instead and should stay inset to match them. */
.home-blob-highlights :deep(.home-blob-nav) {
  margin-inline: calc(-1 * (var(--x-gap-grid-margin) + var(--x-pad-surface-xl)));
}
@container (min-width: 801px) {
  .home-blob-highlights :deep(.home-blob-nav) { margin-inline: 0; }
}

/* Row of the remaining 3 titles — same responsive rail(mobile)/grid(desktop)
   pattern as HomeBlobSpotlight/Picked's own row, including the identical
   36px ancestor-inset cancel (see their own copy of this comment for the
   full breakdown: Grid's --x-gap-grid-margin + HomeBlobSection's __content
   padding-inline). The hero above is a separate, always-visible row instead
   of joining this one — kept as a deliberately distinct, prominent element
   per design feedback, not folded into the scrollable set. */
.home-blob-highlights__row {
  display: flex;
  gap: var(--x-gap-content-loose);
  overflow-x: auto;
  cursor: grab;
  margin-inline: calc(-1 * (var(--x-gap-grid-margin) + var(--x-pad-surface-xl)));
  padding-inline: var(--x-pad-surface-l);
  padding-bottom: 4px;
  scroll-padding-inline: var(--x-pad-surface-l);
  scrollbar-width: none;
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  position: relative; /* anchors a leaving card's position:absolute below */
}
.home-blob-highlights__row::-webkit-scrollbar { display: none; }
.home-blob-highlights__row.is-dragging {
  cursor: grabbing;
  user-select: none;
  -webkit-user-select: none;
}
.home-blob-highlights__item {
  /* Same 144px as the other Home Blob rails — shows ~2.5 cards at a 390px
     mobile width. */
  flex: 0 0 144px;
  min-width: 0;
}
@container (min-width: 801px) {
  .home-blob-highlights__row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow-x: visible;
    cursor: auto;
    margin-inline: 0;
    padding-inline: 0;
    padding-bottom: 0;
  }
  .home-blob-highlights__item { flex-basis: auto; }
}
/* Anchor point for the hero's single-card Transition — without a wrapper,
   removing (mode-less) has BOTH old and new cards in normal flow briefly,
   which either doubles the height or (with mode="out-in") collapses it to 0
   between leave-finish and enter-start. Either way, the section's height
   lurched, and since Highlighted Titles' blob fills the section (blobFull,
   HomeBlobSection.vue), that lurch visibly "morphed" the blob shape via its
   own non-uniform preserveAspectRatio="none" stretch — not an intentional
   effect. The wrap + the leave-active rule below (pull the LEAVING card out
   of flow, overlapping the entering one) keeps the section's height stable,
   driven only by the entering/idle card. The row above needs no such
   wrapper — TransitionGroup's own FLIP move animation handles reflow for
   multiple items without the height lurching a single v-if Transition gets. */
.home-blob-highlights__hero-wrap {
  position: relative;
  /* Full-bleed on mobile, same 36px ancestor-inset cancel as the pill nav/
     row above (see their own copies of this comment) — was sitting inset
     like everything else in this section used to. Reset at 801px+, where
     the hero sits above the equally-confined row again. */
  margin-inline: calc(-1 * (var(--x-gap-grid-margin) + var(--x-pad-surface-xl)));
}
@container (min-width: 801px) {
  .home-blob-highlights__hero-wrap { margin-inline: 0; }
}

/* Playful bounce when switching genre chips — cards pop out and in, same
   elastic curve as the hover/press warp elsewhere in this variant, rather
   than a plain fade/slide. */
.blob-card-enter-active {
  transition:
    transform var(--x-motion-sys-duration-slow) var(--x-motion-home-blob-ease-elastic),
    opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
}
.blob-card-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
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
