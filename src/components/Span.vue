<script setup>
import { inject } from 'vue'
import { GRID_BARE_KEY } from '../composables/gridBare.js'

/**
 * Span — a column slot that lives inside a Grid.
 * Houses the actual content. The column span changes per breakpoint via
 * container queries.
 *
 *   size="fluid"     full content width (minus gutters) at ALL breakpoints.
 *                    Used by the navbar.
 *   size="content"   full width on XS/S; centred 1/2 (6 of 12 cols) on M/L,
 *                    capped so SKU cards stay ≤5 per row. Used by SKU sections.
 *   size="full"      alias of fluid.
 *   size="carousel"  FULL BLEED (edge-to-edge, no side padding) on XS/S;
 *                    centred 1/2 (6 of 12 cols) on M/L — same as content at
 *                    ≥801px. Used by StoryCarousel and BestSellerCarousel.
 *   size="col-lead"  4-of-12 left rail on M/L (grid-column: 1 / 5), full
 *                    width on XS/S. Used by the split layout's left column
 *                    (config.page.layout === 'split', e.g. Codashop).
 *   size="col-main"  8-of-12 right rail on M/L (grid-column: 5 / 13), full
 *                    width on XS/S. Used by the split layout's right column.
 *
 * `bare` (injected, not a prop): inside a split-layout column, an inner
 * Span must not re-apply the `content`/`carousel` centring/max-width — the
 * outer split shell already owns column placement. See Grid.vue and
 * docs/grid-layout-system.md.
 */
defineProps({
  size: { type: String, default: 'fluid' }, // 'fluid' | 'content' | 'full' | 'carousel' | 'col-lead' | 'col-main'
})

const bare = inject(GRID_BARE_KEY, false)
</script>

<template>
  <div class="ce-span" :class="[`ce-span--${size}`, { 'ce-span--bare': bare }]">
    <slot />
  </div>
</template>

<style scoped>
.ce-span {
  min-width: 0;
}

/* fluid / full: span every column at all breakpoints (full width minus gutters) */
.ce-span--full,
.ce-span--fluid {
  grid-column: 1 / -1;
}

/* content + carousel: span every column on XS/S (8-col grids) … */
.ce-span--content,
.ce-span--carousel,
.ce-span--col-lead,
.ce-span--col-main {
  grid-column: 1 / -1;
}

/* carousel on XS/S = FULL BLEED (no side padding): cancel the Grid's 12px
   side padding with negative margins so the image reaches the screen edges
   end-to-end. width stays `auto`, so the negative margins expand the used
   width out to the full container.
   NOTE: -12px must match Grid.vue's XS/S/M padding-left/right. */
.ce-span--carousel {
  margin-left: -12px;
  margin-right: -12px;
}

/* … then centred 2/3 on M/L (12-col grids): cols 3–10 inclusive = 8 of 12.
   max-width caps it on very wide screens.
   The carousel matches `content` here (2/3 centred on BOTH M and L) and resets
   its full-bleed margins. */
@container (min-width: 801px) {
  .ce-span--content,
  .ce-span--carousel {
    grid-column: 3 / 11;
    max-width: 960px;
    justify-self: center;
    width: 100%;
  }
  .ce-span--carousel {
    margin-left: 0;
    margin-right: 0;
  }

  /* col-lead / col-main: the two-column split (4-of-12 / 8-of-12). No
     max-width/centring — these fill their rail edge to edge. */
  .ce-span--col-lead {
    grid-column: 1 / 5;
  }
  .ce-span--col-main {
    grid-column: 5 / 13;
  }

  /* Bare mode (split-layout columns only) — the outer split shell already
     placed this section in its column; an inner Span here must just stretch,
     not re-centre to 3/11 or cap at 960px. */
  .ce-span--bare {
    grid-column: auto;
    max-width: none;
    justify-self: stretch;
    width: 100%;
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
