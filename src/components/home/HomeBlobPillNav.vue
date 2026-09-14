<script setup>
import { ref } from 'vue'
import { useDragScroll } from '../../composables/useDragScroll.js'

/**
 * HomeBlobPillNav — the floating filter/category pill shared by Highlighted
 * Titles and Genres/Category (Home Blob layout). `position: sticky` (not
 * absolute) so it docks to the top of the viewport (below the navbar) while
 * its section is in view, then undocks naturally once the section scrolls
 * past — same sticky-within-its-own-section pattern CatalogNavStack.vue
 * already uses (`top: max(var(--navbar-h), var(--safe-top))`).
 *
 * Below 801px, equal-width flex chips (see desktop note below) squeezed
 * every label down to 3-4 truncated characters ("M...", "BA...") once there
 * were more than ~3 tabs — unreadable, so mobile instead gets a horizontal
 * drag-scroll rail (same useDragScroll pattern as HomeBlobGenreRail) with
 * each chip sized to its own label, never truncated.
 * At 801px+, chips are equal-width flex items (matches the Figma export's
 * own `flex-[1_0_0]` on every chip) with no background at rest — only the
 * active chip fills, at full pill roundness.
 */
defineProps({
  tabs: { type: Array, default: () => [] }, // [{ id, label }]
  active: { type: String, default: null },
})
defineEmits(['update:active'])

const navRef = ref(null)
const { isDragging } = useDragScroll(navRef)
</script>

<template>
  <div ref="navRef" class="home-blob-nav" :class="{ 'is-dragging': isDragging }" role="tablist">
    <button
      v-for="t in tabs"
      :key="t.id"
      type="button"
      class="home-blob-nav__chip text-style-utility-action-bold"
      :class="{ 'is-active': t.id === active }"
      role="tab"
      :aria-selected="t.id === active"
      @click="$emit('update:active', t.id)"
    >
      {{ t.label }}
    </button>
  </div>
</template>

<style scoped>
.home-blob-nav {
  position: sticky;
  top: max(var(--navbar-h, 0px), var(--safe-top, 0px));
  z-index: 10;
  display: flex;
  gap: var(--x-gap-content-tight);
  /* 16px all around, per Figma. */
  padding: var(--x-pad-surface-l);
  /* Pulls the pill UP so it sits offset at the blob's own top edge
     (straddling it, half in/half out) instead of floating well inside the
     section with a big gap above it — matches the Figma reference. Still
     `position: sticky`, so this is only its RESTING offset; scrolling still
     docks/undocks it normally. */
  margin-top: -48px;
  margin-bottom: 8px;
  border-radius: var(--x-radius-home-blob-pill);
  /* Dark mode pass — same neutral-900 dark surface as HomeBlobCard. */
  background: var(--x-palette-home-blob-neutral-900, #1a0038);
  box-shadow: var(--x-shadow-home-blob-l2);
  transition: top var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
  /* Mobile: horizontal drag-scroll rail (same pattern as HomeBlobGenreRail's
     own rail) — overridden back to a plain non-scrolling flex row at 801px+
     below, where the equal-width chips fit without truncating. */
  overflow-x: auto;
  cursor: grab;
  scroll-padding-inline: var(--x-pad-surface-l);
  scrollbar-width: none;
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}
.home-blob-nav::-webkit-scrollbar { display: none; }
.home-blob-nav.is-dragging {
  cursor: grabbing;
  user-select: none;
  -webkit-user-select: none;
}
.home-blob-nav__chip {
  /* Mobile: sized to its own label, never truncated — flex:1 equal-width
     is what caused the truncation this rail exists to fix. Restored at
     801px+ below. */
  flex: 0 0 auto;
  text-align: center;
  padding: var(--x-pad-surface-l) var(--x-pad-surface-m);
  /* Full pill radius, no corner-shape — squircle's superellipse curve read
     as "soft" here; a plain circular/stadium radius is what "full
     roundness" means for a pill this short. */
  border-radius: var(--x-radius-home-blob-pill);
  background: transparent;
  /* Dark mode pass: neutral light instead of the purple link accent, to
     match HomeBlobCard's identical change against the now-dark pill. */
  color: var(--x-palette-home-blob-neutral-0, #fff8fc);
  text-transform: uppercase;
  white-space: nowrap;
  /* text-style-utility-action-bold's own 16px (--x-sys-size-body-l) truncated
     the longer category labels ("Entertainment & Social", "Gift Cards &
     Vouchers") inside a flex:1 equal-width chip — no token between body-s
     (12px, too small to read as a nav label) and body-l exists, so 13px is
     a deliberate one-off (same "intentional one-off" reasoning text-
     styles.css already uses for --x-sys-line-height-tall). */
  font-size: 13px;
  /* The global [class*="text-style-"] rule sets transform-origin:left
     center (for Hitmarker's condense scaleX) — left-anchored, so the hover/
     press scaleX below only grew/shrank the RIGHT edge. Centring it here
     makes the squash-and-stretch symmetric on both sides. */
  transform-origin: center center;
  /* Playful bounce, matching HomeBlobCard's own — classic squash-and-
     stretch (widen/flatten on hover, the opposite on press) rather than a
     radius warp, since a chip is already a plain stadium pill with nothing
     for an asymmetric corner warp to read against. Same shared spring
     curve as every other bounce in this variant. */
  transition:
    background-color var(--x-motion-sku-hover),
    color var(--x-motion-sku-hover),
    transform var(--x-motion-sys-duration-base) var(--x-motion-home-blob-ease-elastic);
}
@media (hover: hover) and (pointer: fine) {
  .home-blob-nav__chip:hover {
    transform: scaleX(1.06) scaleY(0.94);
  }
}
.home-blob-nav__chip:active {
  transform: scaleX(0.94) scaleY(1.06);
  transition: transform var(--x-motion-sku-press);
}
.home-blob-nav__chip.is-active {
  background: var(--x-home-blob-fill-spotlight);
  /* Gold-on-purple, per the Figma export's own text-on-primary spec.
     --x-text-on-primary is already repointed to tertiary (gold) under the
     blob attribute scope (themes/codashop.css) — the same override that
     fixes the Sign In button's text, reused here rather than a second
     bespoke token. */
  color: var(--x-text-on-primary);
}

/* Desktop: back to a plain non-scrolling row of equal-width chips — there's
   enough room for every label to fit without the mobile rail. */
@container (min-width: 801px) {
  .home-blob-nav {
    overflow-x: visible;
    cursor: auto;
  }
  .home-blob-nav__chip {
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
