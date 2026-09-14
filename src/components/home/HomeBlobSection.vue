<script setup>
import Grid from '../Grid.vue'
import Span from '../Span.vue'
import HomeBlobShape from './HomeBlobShape.vue'

/**
 * HomeBlobSection — shared section shell for every Home Blob acrylic-blob
 * section (Publisher Spotlight, Picked for you, Highlighted Titles,
 * Genres/Category).
 *
 * Two independent knobs, since only SOME sections should bleed:
 *  - `blobFull` — the blob background itself spans the full device width,
 *    edge-to-edge, instead of being confined to the page's centred
 *    "content" column. Only Highlighted Titles and Genres/Category set
 *    this; Publisher Spotlight and Picked for you keep their blob confined
 *    to the content column (their original, non-bleeding treatment).
 *  - `full` — the INNER content (cards/nav) also spans full width, not
 *    just the blob. Only Genres/Category sets this (its own explicit
 *    "full width" request); Highlighted Titles bleeds its blob but keeps
 *    its card grid at the normal centred content width.
 *
 * When `blobFull` is false, the shape renders INSIDE the same Grid/Span box
 * as the content (both position:relative siblings sharing that box) so the
 * blob is confined to exactly the content column's bounds — this is
 * Spotlight/Picked-for-you's original (pre-bleed) treatment. When true, the
 * shape is a section-level sibling BEFORE the Grid, sized to the full
 * `<section>` box.
 *
 * Either way, content (and the shape-sharing wrapper) needs its own
 * `position: relative` + a z-index above the shape — CSS stacks POSITIONED
 * descendants (the shape, absolute) above non-positioned in-flow siblings
 * regardless of z-index:0 vs auto, so plain content would otherwise render
 * BEHIND the blob without this.
 */
const props = defineProps({
  viewBoxWidth: { type: Number, required: true },
  viewBoxHeight: { type: Number, required: true },
  path: { type: String, required: true },
  fill: { type: String, required: true },
  blobFull: { type: Boolean, default: false },
  full: { type: Boolean, default: false },
})
</script>

<template>
  <section class="section home-blob-section" :class="{ 'home-blob-section--bleed': blobFull }">
    <HomeBlobShape
      v-if="blobFull"
      :view-box-width="viewBoxWidth"
      :view-box-height="viewBoxHeight"
      :path="path"
      :fill="fill"
    />
    <div v-if="full" class="home-blob-section__full">
      <slot />
    </div>
    <Grid v-else>
      <Span size="content">
        <div class="home-blob-section__inner" :class="{ 'home-blob-section__inner--confined': !blobFull }">
          <HomeBlobShape
            v-if="!blobFull"
            :view-box-width="viewBoxWidth"
            :view-box-height="viewBoxHeight"
            :path="path"
            :fill="fill"
          />
          <div class="home-blob-section__content">
            <slot />
          </div>
        </div>
      </Span>
    </Grid>
  </section>
</template>

<style scoped>
.home-blob-section {
  position: relative;
  padding-top: 48px;
  padding-bottom: 64px;
}
/* Full-bleed blob sections (Highlighted Titles, Genres/Category) get extra
   clearance on top of the base spacing above — their blob shapes are edge-
   to-edge and their curved corners bulge close to the section's own box, so
   the base gap read as the two blobs visually touching/overlapping at the
   seam between them. This margin is what actually separates them; padding
   alone (which sits INSIDE each section, above/below its own blob) doesn't
   add space BETWEEN two adjacent sections' boxes. */
.home-blob-section--bleed {
  margin-top: 48px;
  margin-bottom: 48px;
  /* Shifts the nav pill + cards up, closer to the blob's own top edge —
     the base 48px above was on top of the nav's own -40px overlap and
     margin-bottom, compounding into a bigger gap than intended. */
  padding-top: 16px;
}
/* Confined (blob NOT full-bleed) — the shape and content share one relative
   box sized to the content column, so the blob never exceeds it. */
.home-blob-section__inner--confined {
  position: relative;
}
.home-blob-section__content,
.home-blob-section__full {
  position: relative;
  z-index: 1;
}
/* Breathing room against the blob's own edge — content sitting flush
   against it read as cramped, whether the blob is confined to the content
   column (Spotlight/Picked for you) or bleeding full-bleed behind it
   (Highlighted Titles). */
.home-blob-section__content {
  padding: var(--x-pad-surface-l) var(--x-pad-surface-xl);
}
/* No inline padding here (unlike __content) — Genres/Category's rail wants
   to bleed truly edge-to-edge; its own nav pill insets itself via its own
   5/6-width wrapper regardless of this container's padding, and the rail
   applies its own comfortable start/end padding directly (see
   HomeBlobGenreRail.vue) rather than through this shared shell. */
</style>
