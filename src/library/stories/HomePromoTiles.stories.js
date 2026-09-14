import HomePromoTiles from '@/components/home/HomePromoTiles.vue'
import { defineStory } from '../story.js'

// Real content from codashop/store.js's home.promoTiles (the only store that
// currently populates this) — a horizontally-scrolling row that alternates
// promo-tile--0/--1 backgrounds by index.
const TILES = [
  { tag: 'DAILY', heading: 'Daily check-in rewards', sub: 'Earn Codashop Cash every day' },
  { tag: 'EVENT', heading: 'Spin & win vouchers', sub: 'Free spin with every top-up' },
]

export default defineStory({
  id: 'home-promo-tiles',
  title: 'Home Promo Tiles',
  group: 'Home',
  component: HomePromoTiles,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    'Horizontally-scrolling promo tile row on the Codashop aggregator ' +
    'homepage (HomeStandard/HomeVisual). 2 tiles per screen at the M ' +
    'breakpoint (>=641px), scroll-snapping to ~78% width below it. Tile ' +
    'background alternates promo-tile--0/--1 purely off array index (i % 2).',
  rules: [
    'Enforce @container query layouts (never @media).',
    'Use semantic tokens for colors and spacing.',
    'Background alternation is index-based, not content-based — a 3rd tile repeats the first color.',
  ],
  variants: [
    {
      name: 'Default',
      props: ({ strings }) => ({
        tiles: strings.home?.promoTiles || TILES,
      }),
    },
    {
      name: 'Three tiles (odd count)',
      props: () => ({
        tiles: [
          ...TILES,
          { tag: 'NEW', heading: 'Welcome bonus for first-timers', sub: 'Extra 5% on your first top-up' },
        ],
      }),
    },
  ],
})
