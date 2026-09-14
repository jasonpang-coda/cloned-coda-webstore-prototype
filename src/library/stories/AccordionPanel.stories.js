import AccordionPanel from '@/components/AccordionPanel.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'accordion-panel',
  title: 'Accordion Panel',
  group: 'Primitives',
  component: AccordionPanel,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-motion-accordion',
    '--x-pad-surface-m',
  ],
  notes: 'Rendered in isolation via StoryStage. Verifies container queries and store theme reskinning.',
  rules: [
    'Enforce @container query layouts (never @media).',
    'Use semantic tokens for colors and spacing.',
  ],
  variants: [
    { name: 'Closed', props: () => ({ open: false, text: 'We support Visa, Mastercard, PayPal, and all major mobile wallets.' }) },
    { name: 'Open', props: () => ({ open: true, text: 'We support Visa, Mastercard, PayPal, and all major mobile wallets.' }) },
  ],
})
