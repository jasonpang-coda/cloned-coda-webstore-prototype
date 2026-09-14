import HomeSteps from '@/components/home/HomeSteps.vue'
import { defineStory } from '../story.js'

// Real content from codashop/store.js's home.steps — 4 icon-led steps.
const STEP_COPY = [
  { heading: 'Pick your title', body: 'Search or browse and choose your game, app, or gift card.' },
  { heading: 'Pay your way', body: '200+ local payment methods to choose from.' },
  { heading: 'Get it instantly', body: 'Credits land in your account in seconds.' },
  { heading: '24/7 support', body: 'A dedicated team on hand if anything needs a hand.' },
]

export default defineStory({
  id: 'home-steps',
  title: 'Home Steps',
  group: 'Home',
  component: HomeSteps,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    '"How it works" step list on the Codashop aggregator homepage ' +
    '(HomeStandard/HomeVisual). Each card washes a different hue across the ' +
    '1-2-3 sequence via nth-child (--x-wash-home-step-1/2/3, --x-home-step-ink-2/3) ' +
    '— a 4th+ step repeats the 3rd card\'s wash/ink, same index-based limitation ' +
    'as HomePromoTiles\' alternation.',
  rules: [
    'Enforce @container query layouts (never @media).',
    'Use semantic tokens for colors and spacing.',
    'icon is optional per-step — omitting it falls back to a numbered badge (i + 1) instead of the masked icon glyph.',
  ],
  variants: [
    {
      name: 'Default (with icons)',
      props: ({ assets }) => ({
        steps: STEP_COPY.map((s) => ({ ...s, icon: assets.brand?.logomark || null })),
      }),
    },
    {
      name: 'Numbered (no icons)',
      props: () => ({
        steps: STEP_COPY.map((s) => ({ ...s, icon: null })),
      }),
    },
  ],
})
