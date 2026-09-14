<script setup>
import { ref } from 'vue'
import HomeBlobCard from './HomeBlobCard.vue'
import { useDragScroll } from '../../composables/useDragScroll.js'

/**
 * HomeBlobPicked — "Picked for you" CONTENT. No Figma mock of its own;
 * per the current design pass this now mirrors Publisher Spotlight's own
 * layout (heading + up to 3 panel cards) rather than the Genres rail
 * pattern it originally adopted. The blob background lives in
 * HomeBlobSection.vue, which wraps this component in HomeBlob.vue, right
 * after Publisher Spotlight.
 *
 * The card row is a horizontal drag-scroll rail below 801px (same pattern
 * as HomeBlobSpotlight/HomeBlobGenreRail) and the existing 3-up grid at
 * 801px+.
 */
defineProps({
  heading: { type: String, default: '' },
  titles: { type: Array, default: () => [] },
})
defineEmits(['open-title'])

const rowRef = ref(null)
const { isDragging } = useDragScroll(rowRef)
</script>

<template>
  <div class="home-blob-picked">
    <div class="home-blob-picked__head">
      <h3 class="home-blob-picked__heading text-style-heading-card">{{ heading }}</h3>
    </div>
    <div ref="rowRef" class="home-blob-picked__row" :class="{ 'is-dragging': isDragging }">
      <HomeBlobCard
        v-for="t in titles.slice(0, 3)"
        :key="t.name"
        class="home-blob-picked__item"
        :name="t.name"
        :tile="t.tile"
        size="panel"
        aspect="1920 / 1080"
        wrap
        @click="$emit('open-title')"
      />
    </div>
  </div>
</template>

<style scoped>
.home-blob-picked {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-loose);
}
.home-blob-picked__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.home-blob-picked__heading {
  display: block;
  margin: 0;
  /* Header-inverse (near-white) read as low-contrast against the green
     Picked-for-you blob fill — tertiary (gold) reads clearly instead. */
  color: var(--x-sys-colour-tertiary-main);
  text-transform: uppercase;
  /* Same text-style-heading-card metrics (18px/bold) as HomeBlobSpotlight's
     own heading — was previously bumped to 24px/extra-bold to read as a
     step above the card captions below it, per design feedback this should
     instead match Spotlight's heading exactly. */
}
/* Mobile: horizontal drag-scroll rail (matches HomeBlobSpotlight's identical
   pattern). Desktop (801px+): the original 3-up grid, no scrolling.
   This row lives inside HomeBlobSection's `Span size="content"` > `__content`
   box, which stacks TWO ancestor insets: Grid's own --x-gap-grid-margin
   (12px) AND HomeBlobSection's __content padding-inline (--x-pad-surface-xl,
   24px) — 36px total. Cancel both with a negative margin (same fix as
   HomeBlobHighlights' identical rail) then re-add a comfortable
   --x-pad-surface-l lead-in so cards aren't flush against the true edge. */
.home-blob-picked__row {
  display: flex;
  gap: var(--x-gap-content-loose);
  /* align-self: stretch (not the parent's own align-items: center) — with a
     negative margin AND a fixed width:100%, the item's used width still
     resolves to 100% of the *pre-margin* available space and centering just
     added equal blank space on both sides instead of actually expanding the
     box, silently no-opping the full-bleed trick below. `stretch` sizes the
     item to fill available space MINUS its own margins, so a negative
     margin correctly expands it — same reason HomeBlobHighlights' rail
     (whose flex parent defaults to stretch, not center) needed no override. */
  align-self: stretch;
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
}
.home-blob-picked__row::-webkit-scrollbar { display: none; }
.home-blob-picked__row.is-dragging {
  cursor: grabbing;
  user-select: none;
  -webkit-user-select: none;
}
.home-blob-picked__item {
  /* Same 144px as HomeBlobSpotlight's identical rail — shows ~2.5 cards at
     a 390px mobile width (was 240px, only ~1.5). */
  flex: 0 0 144px;
  min-width: 0;
}
@container (min-width: 801px) {
  .home-blob-picked__row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow-x: visible;
    cursor: auto;
    margin-inline: 0;
    padding-inline: 0;
    padding-bottom: 0;
  }
  .home-blob-picked__item { flex-basis: auto; }
}
</style>
