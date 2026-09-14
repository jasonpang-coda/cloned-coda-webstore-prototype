import FilterDropdown from '@/components/FilterDropdown.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'filter-dropdown',
  title: 'Filter Dropdown',
  group: 'Navigation',
  component: FilterDropdown,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-motion-sys-stagger-sm',
    '--x-gap-content-default',
    '--x-size-input-m',
    '--x-pad-surface-m',
    '--x-border-action-tertiary',
    '--x-radius-control-s',
    '--x-bg-input-default',
    '--x-text-header-default',
    '--x-motion-hover',
    '--x-motion-press',
    '--x-surface-frost-hover',
    '--x-motion-control-press-scale',
    '--x-motion-dropdown',
    '--x-gap-content-loose',
    '--x-border-sheet',
    '--x-radius-container-xs',
    '--x-bg-sheet',
    '--x-bg-page',
    '--x-blur-container',
    '--x-shadow-sheet',
    '--x-border-divider',
    '--x-text-body-default',
    '--x-motion-sys-duration-base',
    '--x-motion-sys-ease-decelerate',
    '--x-bg-card-selected',
    '--x-text-hyperlink-default',
    '--x-motion-sys-distance-sm',
    '--x-motion-sys-duration-exit',
    '--x-motion-sys-ease-accelerate',
  ],
  states: ['default', 'hover', 'focus', 'pressed'],
  notes:
    'Generic select: a button trigger + a frosted options panel that drops in ' +
    '12px below it. Built for the Transaction History range filter, and reused ' +
    'as the base for CatalogNavStack\'s archived L2+L3 "breadcrumb" dropdown ' +
    'presentation. Open/close state is fully internal (a local `open` ref toggled ' +
    'on trigger click, dismissed on Escape, an outside pointerdown, or selecting ' +
    'an option) — there is no prop to force it open, so this story only shows the ' +
    'closed trigger; the panel\'s appearance is exercised interactively in the app.',
  rules: [
    "A consumer's scoped CSS ':deep(.child-class)' override stops working the moment that child element is later made to render via <Teleport> — Teleport physically moves the DOM node out of the scoping ancestor, so Vue's scoped data-v attribute matching no longer applies, and the override silently no-ops with no warning. Style teleported content via explicit props (panelBlur/panelOpaque) instead.",
    '`groups` wins over `options` when non-empty — the two option shapes are mutually exclusive, never combine them.',
    'The trigger keeps its static `label` as the accessible name even when `triggerLabel` overrides the visible text (e.g. a breadcrumb path) — never omit `label`.',
    'Selecting an option emits `update:modelValue` with the option\'s `key` and closes the panel — this component holds no selection state of its own beyond `open`.',
    'Grouped options render no visible per-group header (feedback: it read as clutter) — only a divider between groups; the group label still reaches assistive tech via the group `<div>`\'s own `aria-label`.',
  ],
  variants: [
    {
      name: 'Flat options',
      props: ({ strings }) => ({
        label: strings.transactionHistory?.filterLabel || 'Filter Transactions',
        modelValue: 'd30',
        options: [
          { key: 'd7', label: strings.transactionHistory?.ranges?.d7 || 'Past 7 days' },
          { key: 'd30', label: strings.transactionHistory?.ranges?.d30 || 'Past 30 days' },
          { key: 'd90', label: strings.transactionHistory?.ranges?.d90 || 'Past 90 days' },
        ],
      }),
    },
    {
      name: 'Grouped options (breadcrumb trigger)',
      props: () => ({
        label: 'Category',
        triggerLabel: 'Top Ups › FC Points',
        modelValue: 'fc-points',
        groups: [
          {
            label: 'Top Ups',
            options: [
              { key: 'fc-points', label: 'FC Points' },
              { key: 'ultimate-team', label: 'Ultimate Team' },
              { key: 'career-mode', label: 'Career Mode' },
            ],
          },
          {
            label: 'Daily Supplies',
            options: [{ key: 'gifts', label: 'Gifts' }],
          },
        ],
      }),
    },
    {
      name: 'No selection (default label)',
      props: () => ({
        options: [
          { key: 'd7', label: 'Past 7 days' },
          { key: 'd30', label: 'Past 30 days' },
        ],
      }),
    },
  ],
})
