<script setup>
/**
 * HomeBlobShape — the acrylic-blob decorative background for a Home Blob
 * section (Publisher Spotlight / Picked for you / Highlighted Titles /
 * Genres rail). Renders the exact Figma-exported path as an inline SVG
 * <path> (not a CSS clip-path/mask on a DOM element — a plain path keeps
 * the fill trivially reskinnable via a CSS custom property, and avoids the
 * backdrop-root gotchas the material-fx skill's css-ceiling.md documents
 * for clip-path/mask elsewhere).
 *
 * `viewBoxWidth`/`viewBoxHeight` must be the Figma export's own SVG
 * width/height so the path's coordinates line up unscaled;
 * preserveAspectRatio="none" (matching the export) then stretches the whole
 * shape to fill this component's box, exactly like the original asset.
 */
defineProps({
  viewBoxWidth: { type: Number, required: true },
  viewBoxHeight: { type: Number, required: true },
  /** The exact `d` string from the Figma export (absolute M/C/H/V/Z only). */
  path: { type: String, required: true },
  /** CSS colour — usually a var(--x-home-blob-fill-*) token. */
  fill: { type: String, required: true },
})
</script>

<template>
  <svg
    class="home-blob-shape"
    preserveAspectRatio="none"
    :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`"
    aria-hidden="true"
  >
    <path :d="path" :fill="fill" />
  </svg>
</template>

<style scoped>
.home-blob-shape {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
