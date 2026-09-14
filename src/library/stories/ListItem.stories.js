import ListItem from '@/components/ListItem.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'list-item',
  title: 'List Item',
  group: 'Primitives',
  component: ListItem,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-default',
    '--x-motion-sku-hover',
  ],
  notes: 'Rendered in isolation via StoryStage. Verifies container queries and store theme reskinning.',
  rules: [
    'Enforce @container query layouts (never @media).',
    'Use semantic tokens for colors and spacing.',
  ],
  variants: [
    { name: 'Default', props: () => ({ label: 'English (US)' }) },
    { name: 'Selected', props: () => ({ label: 'English (US)', selected: true, trailingIcon: 'check_circle' }) },
    { name: 'Leading icon', props: () => ({ icon: 'swap_horiz', label: 'Transaction history' }) },
    { name: 'Disabled', props: () => ({ label: 'Unavailable', disabled: true }) },
    { name: 'As link', props: () => ({ as: 'a', href: '#', label: 'View details' }) },
  ],
})
