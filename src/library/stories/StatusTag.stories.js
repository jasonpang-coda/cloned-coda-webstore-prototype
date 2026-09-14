import StatusTag from '@/components/StatusTag.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'status-tag',
  title: 'Status Tag',
  group: 'Atoms',
  component: StatusTag,
  tokens: [
    '--x-gap-content-narrow',
    '--x-pad-surface-xs',
    '--x-radius-badge-s',
    '--x-text-body-default',
    '--x-bg-indicator-success-subtle',
    '--x-border-indicator-success',
    '--x-bg-indicator-neutral-subtle',
    '--x-border-indicator-neutral',
    '--x-bg-indicator-error-subtle',
    '--x-border-indicator-error',
  ],
  states: ['default'],
  notes:
    'A bordered status pill for transaction state, used inside TransactionCard\'s ' +
    'order-history rows. A distinct family from the marketing SkuTag badge: it ' +
    'sits on a subtle indicator surface with a matching border colour rather than ' +
    'a solid fill, and its label is set in the one-off Inter ' +
    'text-style-utility-label-tall style (no Hitmarker condense).',
  rules: [
    'label is required.',
    'variant is one of "success" | "neutral" | "error" (default "neutral") — maps ' +
      'directly to the --x-bg-indicator-*-subtle / --x-border-indicator-* ramps.',
    '"success" reads as Fulfilled, "neutral" as In Progress, "error" as Failed.',
  ],
  variants: [
    { name: 'Fulfilled',   props: { label: 'Fulfilled',   variant: 'success' } },
    { name: 'In Progress', props: { label: 'In Progress', variant: 'neutral' } },
    { name: 'Failed',      props: { label: 'Failed',      variant: 'error' } },
  ],
})
