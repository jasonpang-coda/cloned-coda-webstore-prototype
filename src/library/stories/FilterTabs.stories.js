import FilterTabs from '@/components/home/FilterTabs.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'filter-tabs',
  title: 'Filter Tabs',
  group: 'Home',
  component: FilterTabs,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [] /* component not found yet — auto-derived once src/components/FilterTabs.vue exists */,
  notes: 'Rendered in isolation via StoryStage. Verifies container queries and store theme reskinning.',
  rules: [
    'Enforce @container query layouts (never @media).',
    'Use semantic tokens for colors and spacing.',
  ],
  variants: [
    {
      name: 'Default',
      props: () => ({
        tabs: [
          { id: 'all', label: 'All' },
          { id: 'action', label: 'Action' },
          { id: 'adventure', label: 'Adventure' },
          { id: 'rpg', label: 'RPG' },
        ],
        active: 'all',
      }),
    },
    {
      name: 'Middle tab active',
      props: () => ({
        tabs: [
          { id: 'all', label: 'All' },
          { id: 'action', label: 'Action' },
          { id: 'adventure', label: 'Adventure' },
          { id: 'rpg', label: 'RPG' },
        ],
        active: 'adventure',
      }),
    },
  ],
})
