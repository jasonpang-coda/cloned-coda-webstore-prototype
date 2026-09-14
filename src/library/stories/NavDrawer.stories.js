import NavDrawer from '@/components/NavDrawer.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'nav-drawer',
  title: 'Nav Drawer',
  group: 'Navigation',
  component: NavDrawer,
  overlay: true,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-scrim',
    '--x-bg-page',
    '--x-border-divider',
    '--x-shadow-drawer',
    '--x-pad-surface-m',
    '--x-pad-surface-s',
    '--x-text-header-default',
    '--x-size-icon-l',
    '--x-motion-sku-hover',
    '--x-text-header-strong',
    '--x-gap-content-default',
    '--x-radius-container-xs',
    '--x-text-body-default',
    '--x-motion-btn-activate',
    '--x-bg-indicator-neutral-subtle',
    '--x-text-hyperlink-default',
    '--x-bg-indicator-neutral-default',
    '--x-pad-surface-l',
    '--x-pad-surface-xs',
    '--x-gap-content-narrow',
    '--x-border-signin-btn',
    '--x-radius-control-full',
    '--x-surface-ghost-3',
    '--x-bg-indicator-success-default',
    '--x-motion-sys-duration-slowest',
    '--x-motion-sys-ease-decelerate',
    '--x-pad-surface-xl',
    '--x-surface-ghost-2',
    '--x-size-icon-s',
    '--x-motion-sys-duration-base',
    '--x-motion-sys-ease-standard',
    '--x-motion-modal-enter',
    '--x-motion-modal-exit',
  ],
  states: ['default', 'hover', 'pressed'],
  notes:
    'Left slide-in menu opened from the NavBar burger, mounted into DeviceFrame\'s ' +
    '#overlay slot. Nav content is store-driven: COD:M/FCM both render an ' +
    'expandable "Store" group (L1) with category children (L2) plus a flat ' +
    '"Code Redemption" row, sourced from strings.nav.groups/items via useStoreStrings. ' +
    'When the `intents` prop is supplied (non-null, non-empty — the multi-level nav ' +
    'pilot), the drawer instead builds one group per intent from useStoreIntents\' ' +
    'category tree, with an L3 subcategory tier for any category that has more than ' +
    'one subcategory — the drawer never owns this data itself. Also hosts the PWA ' +
    'install / Web Push opt-in rows and the region/language switcher footer ' +
    '(gated on the localeSwitcher feature flag), both singleton-composable driven.',
  rules: [
    'The drawer renders nothing while `open` is false — Transition unmounts the whole tree, so it never occupies layout space closed.',
    'Pass `duration` is baked into the component\'s own Transition; the parent only toggles `open` and listens for "close"/"navigate".',
    'L3 (subcategory) rows only render for a category with more than one subcategory — matches CatalogNavStack\'s own L3 gate so the two surfaces never disagree.',
    'Never branch on theme identity — nav structure comes entirely from strings/intents props, never a hardcoded store check.',
    'Emits "navigate" with the tapped anchor only after the exit transition settles (or immediately if prefers-reduced-motion is set) — the parent should not scroll before that.',
  ],
  variants: [
    {
      name: 'Open',
      props: () => ({
        open: true,
      }),
    },
    {
      name: 'Open — multi-level intents (L1/L2/L3)',
      props: () => ({
        open: true,
        intents: [
          {
            id: 'store',
            label: 'Store',
            categories: [
              {
                id: 'top-ups',
                label: 'Top Ups',
                subcategories: [
                  { id: 'fc-points', label: 'FC Points' },
                  { id: 'ultimate-team', label: 'Ultimate Team' },
                  { id: 'career-mode', label: 'Career Mode' },
                ],
              },
              {
                id: 'daily-supplies',
                label: 'Daily Supplies',
                subcategories: [{ id: 'gifts', label: 'Gifts' }],
              },
            ],
          },
          {
            id: 'events',
            label: 'Events',
            categories: [
              { id: 'milestones', label: 'Milestone Rewards', subcategories: [] },
            ],
          },
        ],
      }),
    },
    {
      name: 'Closed',
      props: () => ({
        open: false,
      }),
    },
  ],
})
