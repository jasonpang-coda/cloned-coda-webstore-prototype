import LinkRow from '@/components/LinkRow.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'link-row',
  title: 'Link Row',
  group: 'Primitives',
  component: LinkRow,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-default',
    '--x-pad-surface-m',
    '--x-radius-container-xs',
    '--x-bg-sku-card-default',
    '--x-border-sku-card-default',
    '--x-text-header-default',
    '--x-motion-sku-hover',
    '--x-bg-tag-neutral',
    '--x-text-hyperlink-default',
  ],
  states: ['default', 'hover'],
  notes:
    'Full-row tappable external link-out (label + trailing chevron) — ' +
    'grounded in OrderCompletePage\'s Need Help list. Deliberately not built ' +
    'on ListItem — ListItem has no gradient-border hook and renders on a ' +
    'flat --li-bg, while this row needs the same mask-composite ring + ' +
    'sku-card fill tokens as SkuBanner.',
  rules: [
    'external=true (the default) opens in a new tab with rel="noopener noreferrer" — set false for an in-app route.',
    'Border uses the same mask-composite gradient-ring technique as SkuBanner, not a plain border-color.',
  ],
  variants: [
    { name: 'Default', props: () => ({ href: '#', label: 'Contact Support' }) },
    { name: 'FAQ', props: () => ({ href: '#', label: 'Frequently Asked Questions' }) },
  ],
})
