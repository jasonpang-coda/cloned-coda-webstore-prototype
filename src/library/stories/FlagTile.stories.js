import FlagTile from '@/components/FlagTile.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'flag-tile',
  title: 'Flag Tile',
  group: 'Controls',
  component: FlagTile,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-radius-control-xs',
    '--x-flag-tile-border',
    '--x-flag-tile-gloss',
  ],
  notes:
    'Purely decorative 4:3 market flag art (20×15 Figma flag component) with a ' +
    'hairline border + top-light gloss overlay. Falls back to the regional-indicator ' +
    'emoji (via flagEmoji) for markets that have no bundled SVG in ' +
    'src/shared/flags/ (currently IE, GT, FI, GR, SK, TW) — the emoji fallback ' +
    'intentionally skips the border/gloss ring, since a translucent frame around a ' +
    'transparent glyph reads as an empty box. Consumers (LanguageSelectorSheet, ' +
    'RegionSelectorSheet rows, NavBar) supply the visible label; this component ' +
    'carries none itself (aria-hidden).',
  rules: [
    'code is required — a two-letter ISO country code; anything else falls through flagEmoji to the globe placeholder.',
    'width controls both dimensions (height follows at a fixed 4:3 ratio) — 20 for drawer/search rows, 24 for the navbar.',
    'Purely visual/decorative — always render it alongside a real text label for accessibility, never as the sole market identifier.',
  ],
  variants: [
    {
      name: 'SVG artwork (default width)',
      props: () => ({
        code: 'SG',
        width: 20,
      }),
    },
    {
      name: 'SVG artwork (navbar width)',
      props: () => ({
        code: 'US',
        width: 24,
      }),
    },
    {
      name: 'Emoji fallback (no SVG art)',
      props: () => ({
        code: 'TW',
        width: 20,
      }),
    },
  ],
})
