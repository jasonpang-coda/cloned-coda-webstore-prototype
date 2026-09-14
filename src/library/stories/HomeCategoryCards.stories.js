import HomeCategoryCards from '@/components/home/HomeCategoryCards.vue'
import { defineStory } from '../story.js'

// Real shape: HomeView.vue's `categoryCards` computed maps
// home.value.categories -> { id, label, count, cover }, where `cover` is the
// first title's tile image in that category (or null when the category has
// no titles yet).
const CATEGORIES = [
  { id: 'moba', label: 'MOBA', count: 6 },
  { id: 'battle', label: 'Battle Royale', count: 8 },
  { id: 'rpg', label: 'RPG / Gacha', count: 5 },
  { id: 'sandbox', label: 'Sandbox / Sim', count: 3 },
]

export default defineStory({
  id: 'home-category-cards',
  title: 'Home Category Cards',
  group: 'Home',
  component: HomeCategoryCards,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    'Home page "shop by category" grid (HomeStandard/HomeVisual). Emits ' +
    '`select` with a category id; the caller toggles `active` itself (see ' +
    'HomeView.vue\'s onCategorySelect, which clears the selection on a second ' +
    'click of the same card).',
  rules: [
    'Enforce @container query layouts (never @media) — 2-col below 801px, 4-col above.',
    'Use semantic tokens for colors and spacing.',
    '`cover` is nullable per-card (falls back to an empty tinted swatch) — do not assume every category has art yet.',
  ],
  variants: [
    {
      name: 'Default',
      props: ({ assets }) => ({
        categories: CATEGORIES.map((c, i) => ({
          ...c,
          cover: assets.home?.categoryTiles?.[i] || assets.brand?.logomark || null,
        })),
        active: null,
      }),
    },
    {
      name: 'Category selected',
      props: ({ assets }) => ({
        categories: CATEGORIES.map((c, i) => ({
          ...c,
          cover: assets.home?.categoryTiles?.[i] || assets.brand?.logomark || null,
        })),
        active: 'battle',
      }),
    },
    {
      name: 'No cover art',
      props: () => ({
        categories: CATEGORIES.map((c) => ({ ...c, cover: null })),
        active: null,
      }),
    },
  ],
})
