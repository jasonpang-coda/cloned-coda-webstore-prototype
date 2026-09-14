<script setup>
import { computed } from 'vue'
import { flagUrl, flagEmoji } from '../locale/flags.js'

/**
 * FlagTile — a market's flag at 4:3 (Figma flag component, 20×15 art), with the
 * hairline border + top-light gloss treatment from the design. Falls back to
 * the regional-indicator emoji for markets without SVG artwork (IE, GT, FI,
 * GR, SK, TW as of now). Purely decorative — consumers carry the label.
 */
const props = defineProps({
  code: { type: String, required: true },
  /** Art width in px (height follows at 4:3). Drawer/search rows: 20; navbar: 24. */
  width: { type: Number, default: 20 },
})

const url = computed(() => flagUrl(props.code))
const emoji = computed(() => flagEmoji(props.code))
</script>

<template>
  <span class="flag-tile" :style="{ '--flag-tile-w': `${width}px` }" aria-hidden="true">
    <img v-if="url" :src="url" alt="" class="flag-tile__img" />
    <span v-else class="flag-tile__emoji">{{ emoji }}</span>
  </span>
</template>

<style scoped>
.flag-tile {
  position: relative;
  display: inline-block;
  width: var(--flag-tile-w);
  aspect-ratio: 4 / 3;
  flex-shrink: 0;
  border-radius: var(--x-radius-control-xs);
  overflow: hidden;
}
.flag-tile__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
/* Hairline border + gloss sit above the art (emoji fallback skips the border
   ring — a translucent frame around a transparent emoji tile reads as a box). */
.flag-tile:has(.flag-tile__img)::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: var(--border-weight-default) solid var(--x-flag-tile-border);
  background: var(--x-flag-tile-gloss);
  mix-blend-mode: overlay;
  pointer-events: none;
}
.flag-tile__emoji {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Emoji glyph scaled to the tile — emoji render at the em box, so the tile
     width is the effective font size. Not display text; no .text-style-*. */
  font-size: calc(var(--flag-tile-w) * 0.75);
  line-height: 1;
}
</style>
