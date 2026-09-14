<script setup>
import { inject } from 'vue'
import { GRID_BARE_KEY } from '../composables/gridBare.js'

/**
 * Grid — Commerce Engine responsive grid.
 * Driven by CSS *container queries* (not viewport media queries) so it reacts
 * to the device-screen width, not the browser window.
 *
 *   BP   range        cols  col-gap             pad-x
 *   XS   < 641px      8     --x-gap-grid-gutter   --x-gap-grid-margin
 *   S    641–800px    8     --x-gap-grid-gutter   --x-gap-grid-margin
 *   M    801–1279px   12    --x-gap-grid-gutter-m --x-gap-grid-margin
 *   L    ≥ 1280px     12    --x-gap-grid-gutter-l --x-gap-grid-margin-l
 *
 * `bare` (injected, not a prop): split-layout stores (config.page.layout ===
 * 'split', e.g. Codashop) provide `true` from App.vue for Grids that sit
 * inside a column that is ALREADY a grid cell (the outer split shell) — see
 * docs/grid-layout-system.md. A bare Grid renders as an unstyled block at
 * M/L only; XS/S keep the normal 8-col grid, since the split collapses to
 * one column below 801px and these sections need their own layout there.
 */
defineProps({
  as: { type: String, default: 'div' },
})

const bare = inject(GRID_BARE_KEY, false)
</script>

<template>
  <component :is="as" class="ce-grid" :class="{ 'ce-grid--bare': bare }">
    <slot />
  </component>
</template>

<style scoped>
.ce-grid {
  display: grid;
  /* XS default */
  grid-template-columns: repeat(8, minmax(0, 1fr));
  column-gap: var(--x-gap-grid-gutter);
  /* Row gap is its own token, not the column gutter — --x-gap-grid-row-*
     (space.css) was defined for exactly this but never actually wired up
     here, so wrapped rows at XS/S were using the column gutter (8px) and
     read as cramped. --x-gap-grid-row-default is 12px at every breakpoint
     (no S/M/L escalation the way column-gap has one — nothing has asked
     for tighter/looser row spacing per breakpoint yet). */
  row-gap: var(--x-gap-grid-row-default);
  padding-left: var(--x-gap-grid-margin);
  padding-right: var(--x-gap-grid-margin);
  width: 100%;
}

@container (min-width: 641px) {
  .ce-grid { /* S */
    grid-template-columns: repeat(8, minmax(0, 1fr));
    column-gap: var(--x-gap-grid-gutter);
    padding-left: var(--x-gap-grid-margin);
    padding-right: var(--x-gap-grid-margin);
  }
}

@container (min-width: 801px) {
  .ce-grid { /* M */
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--x-gap-grid-gutter-m);
    padding-left: var(--x-gap-grid-margin);
    padding-right: var(--x-gap-grid-margin);
  }

  /* Bare mode (split-layout columns only) — the outer split shell already
     provides the 12-col grid + side padding, so a nested Grid here just
     stacks its children. Below 801px the split has collapsed, so bare Grids
     fall through to the normal XS/S rules above. */
  .ce-grid--bare {
    display: block;
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
