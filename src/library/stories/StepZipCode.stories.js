import StepZipCode from '@/components/checkout/StepZipCode.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'step-zip-code',
  title: 'Step Zip Code',
  group: 'Checkout',
  component: StepZipCode,
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    '"Zip Code" step (Figma 2198:5138) — the simplest of the inline-checkout ' +
    'panels: a single text input inside StepCard. No real props; the input is ' +
    'local component state.',
  rules: [
    'A single uncontrolled text input — no validation happens in this step.',
  ],
  variants: [
    {
      name: 'Default',
      props: () => ({}),
    },
  ],
})
