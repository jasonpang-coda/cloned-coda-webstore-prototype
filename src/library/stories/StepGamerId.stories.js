import StepGamerId from '@/components/checkout/StepGamerId.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'step-gamer-id',
  title: 'Step Gamer Id',
  group: 'Checkout',
  component: StepGamerId,
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    '"Enter Gamer ID" step (Figma 2189:2731). User ID + optional Server input ' +
    'with an inline helper line — no lookup/spinner state like PlayerAccount\'s ' +
    'guest flow, since the inline checkout treats this as plain form input ' +
    'rather than a verified-account gate. Has no real props: userId/server are ' +
    'local state, and config.checkout.gamerId.showServer (whether the Server ' +
    'field renders at all — Diablo Immortal hides it for its single-Player-ID ' +
    'flow) is a store-config flag, not something a story variant can set.',
  rules: [
    'showServer defaults to true; only Diablo Immortal-style single-ID stores set config.checkout.gamerId.showServer: false to hide it.',
    'Both inputs are uncontrolled beyond local component state — no validation or lookup happens in this step.',
  ],
  variants: [
    {
      name: 'Default',
      props: () => ({}),
    },
  ],
})
