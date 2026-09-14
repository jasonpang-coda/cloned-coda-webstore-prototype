import Card from '@/components/Card.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'card',
  title: 'Card',
  group: 'Primitives',
  component: Card,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-default',
    '--x-pad-surface-m',
    '--x-border-sheet',
    '--x-radius-container-xs',
    '--x-bg-sheet',
  ],
  states: ['default'],
  notes:
    'Plain bordered L2 content pane — border/background match BaseSheet\'s ' +
    'own container tier, but static (no scrim, no transition, no header/' +
    'footer slots). Grounded in OrderCompletePage\'s Order Summary / Need ' +
    'Help panes, the first two identical repeats of this exact wrapper.',
  rules: [
    'title is optional — a heading-less card is valid (plain content wrapper).',
    'All border/background/padding tokens are overridable via --card-* custom properties on the class the caller passes in.',
  ],
  variants: [
    {
      name: 'With title',
      props: () => ({ title: 'ORDER SUMMARY', text: 'Card body content goes here.' }),
    },
    {
      name: 'No title',
      props: () => ({ text: 'A plain content wrapper with no heading.' }),
    },
  ],
})
