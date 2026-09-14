import HomeNewsletter from '@/components/home/HomeNewsletter.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'home-newsletter',
  title: 'Home Newsletter',
  group: 'Home',
  component: HomeNewsletter,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    'Newsletter signup band on the Codashop aggregator homepage (HomeStandard/ ' +
    'HomeVisual). Its own form submit is intentionally prevented — no real ' +
    'target in this prototype. `socialIcons` comes from Codashop\'s own ' +
    'supplied art (config.home.social in store data), not the shared market ' +
    'social-link registry, so it is empty for every other store.',
  rules: [
    'Enforce @container query layouts (never @media).',
    'Use semantic tokens for colors and spacing.',
    'socialIcons is optional — the row hides entirely when the object is empty (Object.keys check).',
  ],
  variants: [
    {
      name: 'Default (with social icons)',
      props: ({ assets, strings }) => ({
        heading: strings.home?.newsletterHeading || 'Get deals before anyone else',
        body: strings.home?.newsletterBody || 'Bonus events, price drops and new-title launches — to your inbox.',
        cta: strings.home?.newsletterCta || 'Subscribe',
        socialIcons: assets.home?.social || {},
      }),
    },
    {
      name: 'No social icons',
      props: ({ strings }) => ({
        heading: strings.home?.newsletterHeading || 'Get deals before anyone else',
        body: strings.home?.newsletterBody || 'Bonus events, price drops and new-title launches — to your inbox.',
        cta: strings.home?.newsletterCta || 'Subscribe',
        socialIcons: {},
      }),
    },
  ],
})
