import HomeFaq from '@/components/home/HomeFaq.vue'
import { defineStory } from '../story.js'

// Real content shapes pulled from the store data files (codm/store.js
// keeps it to 2 items; diabloimmortal/store.js runs 6 — used below to
// exercise the layout="grid" 3-per-row wrap).
const SHORT_FAQ = [
  {
    q: 'How to buy COD Points?',
    a: 'Enter your Call of Duty Player ID, select the amount of COD Points you wish to purchase, choose your preferred mode of payment, then review your order and complete the payment — your COD Points will be instantly credited to your Call of Duty: Mobile account.',
  },
  {
    q: 'How to send gifts in Call of Duty: Mobile?',
    a: 'Enter the Call of Duty Player ID of a friend in your region, choose the number of COD Points you wish to purchase, then enter your payment details and click "Buy Now" — the COD Points will be automatically credited to your recipient\'s account.',
  },
]

const LONG_FAQ = [
  { q: 'Is Diablo Immortal free to play?', a: 'Yes, Diablo Immortal is free to download and play, with optional in-app purchases available.' },
  { q: 'Can I play Diablo Immortal on both mobile and PC?', a: 'Yes, Diablo Immortal supports seamless cross-platform play, allowing you to play on both mobile devices and PC.' },
  { q: 'What multiplayer features does Diablo Immortal offer?', a: 'You can join clans, form Warbands for co-op play, participate in raids, trade loot, and compete in PvP arenas.' },
  { q: 'What are Eternal Orbs used for?', a: 'Eternal Orbs are Diablo Immortal\'s premium currency — spend them on gear, cosmetics, Battle Pass tiers, and other in-game upgrades.' },
  { q: 'How often does Diablo Immortal get new content?', a: 'The game receives regular updates that introduce new story chapters, world bosses, events, and seasonal challenges.' },
  { q: 'Do I need an account to top up?', a: 'No — enter your in-game Player ID directly on this page. No separate account sign-up is required to purchase Eternal Orbs.' },
]

export default defineStory({
  id: 'home-faq',
  title: 'Home Faq',
  group: 'Home',
  component: HomeFaq,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    'Accordion FAQ list. `layout="stack"` (default, HomeStandard/HomeVisual, ' +
    'the Codashop-style homepage) is a single stacked column; `layout="grid"` ' +
    '(App.vue\'s SEO content block, e.g. Diablo Immortal) arranges min(3, count) ' +
    'columns per row at the M breakpoint (>=801px).',
  rules: [
    'Enforce @container query layouts (never @media).',
    'Use semantic tokens for colors and spacing.',
    'All items render collapsed by default (openIndex = -1) — only one item open at a time.',
  ],
  variants: [
    {
      name: 'Default (stack, short list)',
      props: () => ({
        faq: SHORT_FAQ,
        layout: 'stack',
      }),
    },
    {
      name: 'Grid layout (6 items)',
      props: () => ({
        faq: LONG_FAQ,
        layout: 'grid',
      }),
    },
  ],
})
