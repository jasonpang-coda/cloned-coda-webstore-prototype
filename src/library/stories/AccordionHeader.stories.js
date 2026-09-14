import AccordionHeader from '@/components/AccordionHeader.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'accordion-header',
  title: 'Accordion Header',
  group: 'Primitives',
  component: AccordionHeader,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-motion-sku-hover',
    '--x-motion-accordion',
  ],
  notes: 'Rendered in isolation via StoryStage. Verifies container queries and store theme reskinning.',
  rules: [
    'Enforce @container query layouts (never @media).',
    'Use semantic tokens for colors and spacing.',
  ],
  variants: [
    { name: 'Closed (between)', props: () => ({ open: false, label: 'What payment methods are supported?' }) },
    { name: 'Open (between)', props: () => ({ open: true, label: 'What payment methods are supported?' }) },
    { name: 'Closed (center, with icon)', props: () => ({ open: false, justify: 'center', icon: 'discount', label: 'Have a promo code?' }) },
    { name: 'Open (center, with icon)', props: () => ({ open: true, justify: 'center', icon: 'discount', label: 'Have a promo code?' }) },
    { name: 'Disabled', props: () => ({ open: false, disabled: true, label: 'No details available' }) },
  ],
})
