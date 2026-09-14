import TransactionHistoryPage from '@/components/TransactionHistoryPage.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'transaction-history-page',
  title: 'Transaction History Page',
  group: 'Pages',
  component: TransactionHistoryPage,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-pad-surface-l',
    '--x-pad-surface-xl',
    '--x-pad-surface-s',
    '--x-gap-content-separation',
    '--x-gap-content-default',
    '--x-size-icon-l',
    '--x-text-header-default',
    '--x-motion-hover',
    '--x-text-header-strong',
    '--x-text-body-default',
  ],
  states: ['default'],
  notes:
    'Full-page Transaction History view (Figma XS7.1.1) — a VIEW swapped in by ' +
    'App.vue in place of the storefront, not an overlay. Reached from the ' +
    'signed-in AccountPopover in every store. Demo data comes entirely from ' +
    'useStoreTransactions() (per-store `transactions` array — see ' +
    'src/stores/<store>/store.js); a store with no array renders the empty ' +
    'state. The "Past N days" range filter is functional and clock-robust — ' +
    'each demo item carries a `daysAgo` offset, filtered against runtime now.',
  rules: [
    'No props — everything (list, copy, empty state) is derived from useStoreStrings()/useStoreTransactions() for the active theme.',
    'selectedRange defaults to 7, matching the Figma default ("Past 7 days").',
    'A store without a `transactions` array in its store.js falls back to the empty-state copy, not an error.',
  ],
  variants: [
    { name: 'Default', props: () => ({}) },
  ],
})
