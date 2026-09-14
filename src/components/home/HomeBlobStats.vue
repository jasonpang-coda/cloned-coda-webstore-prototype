<script setup>
import HomeBlobStatItem from './HomeBlobStatItem.vue'

/**
 * HomeBlobStats — Home Blob's own trust-stats band, replacing the shared
 * HomeStatBand/HomeStatItem this section used to reuse via a plain CSS-var
 * reskin. That approach read as "just a bunch of numbers" on a flat dark
 * card — this version gives the band a slow-drifting blob-palette gradient
 * background (the same purple/teal/gold hues Spotlight/Highlights/Genres
 * already use) plus a bare, glowing icon per stat, matching this layout's
 * own playful, colourful identity instead of borrowing Standard/Visual's
 * neutral card treatment.
 *
 * Icons are keyed by POSITION, not by stat content (there's no semantic
 * field like "kind: countries" in the trustStats data to match against) —
 * same "index into a fixed list" precedent as HomeReviewRail's own
 * AVATAR_COLORS. If trustStats' shared data ever reorders/adds entries,
 * revisit this mapping.
 */
defineProps({
  stats: { type: Array, default: () => [] }, // [{ value, suffix, label }]
})

const ICONS = ['sports_esports', 'public', 'star', 'bolt']
</script>

<template>
  <div class="blob-stats">
    <HomeBlobStatItem
      v-for="(s, i) in stats"
      :key="s.label"
      :icon="ICONS[i % ICONS.length]"
      :value="s.value"
      :suffix="s.suffix"
      :label="s.label"
    />
  </div>
</template>

<style scoped>
.blob-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--x-gap-content-separation) var(--x-gap-content-loose);
  padding: var(--x-pad-surface-l);
  border-radius: var(--x-radius-home-blob-card);
  corner-shape: var(--x-corner-shape-home-blob);
  /* Same 3 hues Spotlight/Highlights/Genres already use, oversized (200%)
     and looped via background-position instead of a fixed diagonal — a slow
     "liquid" drift that suits an "acrylic organic shapes" layout better than
     a static gradient. Ambient/continuous per the motion-design skill:
     ease-in-out (not linear) reads as an organic drift rather than a
     mechanical scan, and it's decorative only — never the sole carrier of
     information — so reduced-motion can freeze it with nothing lost. */
  background: linear-gradient(
    120deg,
    var(--x-home-blob-fill-spotlight),
    var(--x-home-blob-fill-highlights),
    var(--x-home-blob-fill-genres),
    var(--x-home-blob-fill-spotlight)
  );
  background-size: 300% 300%;
  animation: blob-stats-drift 12s ease-in-out infinite;
  box-shadow: var(--x-shadow-home-blob-l1);
}
@keyframes blob-stats-drift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@media (prefers-reduced-motion: reduce) {
  .blob-stats { animation: none; }
}
@container (min-width: 801px) {
  .blob-stats { grid-template-columns: repeat(4, 1fr); }
}
</style>
