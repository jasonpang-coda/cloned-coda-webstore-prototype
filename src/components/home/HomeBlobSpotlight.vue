<script setup>
import { ref } from 'vue'
import HomeBlobCard from './HomeBlobCard.vue'
import { useDragScroll } from '../../composables/useDragScroll.js'

/**
 * HomeBlobSpotlight — Publisher Spotlight CONTENT (Figma node 4109:900):
 * heading + publisher logo + title cards. The blob background itself lives
 * in HomeBlobSection.vue, which wraps this component in HomeBlob.vue — see
 * that file for why.
 *
 * The card row is a horizontal drag-scroll rail below 801px (same pattern
 * as HomeBlobGenreRail/HomeReviewRail) and the existing 3-up grid at 801px+.
 */
defineProps({
  heading: { type: String, default: '' },
  logo: { type: String, default: null },
  logoAlt: { type: String, default: '' },
  titles: { type: Array, default: () => [] },
})
defineEmits(['open-title'])

const rowRef = ref(null)
const { isDragging } = useDragScroll(rowRef)
</script>

<template>
  <div class="home-blob-spotlight">
    <div class="home-blob-spotlight__head">
      <span class="home-blob-spotlight__eyebrow text-style-utility-default-bold">PUBLISHER SPOTLIGHT</span>
      <img v-if="logo" :src="logo" :alt="logoAlt" class="home-blob-spotlight__logo" />
      <h3 v-else class="home-blob-spotlight__heading text-style-heading-card">{{ heading }}</h3>
    </div>
    <div ref="rowRef" class="home-blob-spotlight__row" :class="{ 'is-dragging': isDragging }">
      <HomeBlobCard
        v-for="t in titles"
        :key="t.name"
        class="home-blob-spotlight__item"
        :name="t.name"
        :tile="t.tile"
        size="panel"
        aspect="1920 / 1080"
        @click="$emit('open-title')"
      />
    </div>
  </div>
</template>

<style scoped>
.home-blob-spotlight {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-loose);
}
.home-blob-spotlight__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-tight);
}
.home-blob-spotlight__eyebrow {
  color: var(--x-home-blob-fill-genres, var(--x-text-hyperlink-default));
  letter-spacing: 0.16em;
}
.home-blob-spotlight__logo {
  display: block;
  max-height: 64px;
  width: auto;
  object-fit: contain;
}
.home-blob-spotlight__heading {
  display: block;
  margin: 0;
  color: var(--x-text-header-inverse);
  text-transform: uppercase;
}
/* Mobile: horizontal drag-scroll rail (matches HomeBlobGenreRail's pattern).
   Desktop (801px+): the original 3-up grid, no scrolling.
   This row lives inside HomeBlobSection's `Span size="content"` > `__content`
   box, which stacks TWO ancestor insets: Grid's own --x-gap-grid-margin
   (12px) AND HomeBlobSection's __content padding-inline (--x-pad-surface-xl,
   24px) — 36px total. Cancel both with a negative margin (same fix as
   HomeBlobHighlights' identical rail) then re-add a comfortable
   --x-pad-surface-l lead-in so cards aren't flush against the true edge. */
.home-blob-spotlight__row {
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
  padding-bottom: 4px; /* clears the card's own drop-shadow at the rail's bottom edge */
  scroll-padding-inline: var(--x-pad-surface-l);
  scrollbar-width: none;
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}
.home-blob-spotlight__row::-webkit-scrollbar { display: none; }
.home-blob-spotlight__row.is-dragging {
  cursor: grabbing;
  user-select: none;
  -webkit-user-select: none;
}
.home-blob-spotlight__item {
  /* 144px shows ~2.5 cards at a 390px mobile width (was 240px, only ~1.5) —
     144*2.5 + gap*2 (--x-gap-content-loose, 12px) ≈ 384px against the
     ~374px actually visible past the rail's own 16px lead-in padding. */
  flex: 0 0 144px;
  min-width: 0; /* lets the fixed flex-basis win over the card's content min-width */
}
@container (min-width: 801px) {
  .home-blob-spotlight__row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow-x: visible;
    cursor: auto;
    margin-inline: 0;
    padding-inline: 0;
    padding-bottom: 0;
  }
  .home-blob-spotlight__item { flex-basis: auto; }
}
</style>
