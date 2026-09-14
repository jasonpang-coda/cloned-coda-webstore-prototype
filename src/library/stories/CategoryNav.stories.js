import CategoryNav from '@/components/CategoryNav.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'category-nav',
  title: 'Category Nav',
  group: 'Navigation',
  component: CategoryNav,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-pad-surface-l',
    '--x-border-nav',
    '--x-radius-container-xs',
    '--x-bg-nav',
    '--x-bg-page',
    '--x-blur-container',
    '--x-shadow-nav',
    '--x-shadow-nav-inset',
    '--x-motion-nav-enter',
    '--x-motion-sys-duration-base',
    '--x-motion-sys-ease-standard',
    '--x-border-sheet',
    '--x-bg-sheet',
    '--x-border-nav-selected',
    '--x-motion-tab-indicator',
    '--x-gradient-nav-selected-stroke',
    '--x-size-control-xl',
    '--x-pad-surface-m',
    '--x-pad-surface-s',
    '--x-size-control-xxl',
    '--x-sys-size-body-main',
    '--x-gap-content-default',
    '--x-text-body-default',
    '--x-motion-sku-hover',
    '--x-motion-btn-activate',
    '--x-text-header-strong',
    '--x-bg-indicator-neutral-subtle',
    '--x-text-hyperlink-default',
    '--x-bg-indicator-neutral-default',
    '--x-bg-nav-selected',
    '--x-text-nav-selected',
    '--x-motion-hover',
    '--x-gradient-scroll-fade-left',
    '--x-gradient-scroll-fade-right',
    '--x-motion-sys-ease-decelerate',
    '--x-motion-sys-duration-exit',
    '--x-motion-sys-ease-accelerate',
  ],
  states: ['default', 'hover', 'pressed'],
  notes:
    'A frosted, self-contained horizontally-scrolling tab bar (Figma "L3 Nav" ' +
    '5100:19182) used in three shapes across the app: a fixed bar pinned to the ' +
    'bottom of the screen (`variant="bottom"`, the classic L2 category bar), one ' +
    'pinned below NavBar (`variant="top"`, the legacy L3 subcategory bar), and a ' +
    'plain in-flow row with no own surface (`variant="row"`) — the shape ' +
    'CatalogNavStack stacks two of, inside its own single frosted container. It ' +
    'resolves its own scroll container (`.device__screen` when framed, else the ' +
    'window) and runs either a scroll-spy (`mode="scroll"` — tap scrolls to a ' +
    'section id, an IntersectionObserver tracks the active tab as the user ' +
    'scrolls) or a fully parent-controlled active tab (`mode="filter"` — tap just ' +
    'emits `update:active`, no on-page anchors assumed). Edge fades appear ' +
    'whenever tabs overflow the visible width in that direction.',
  rules: [
    '`mode` must never be chosen by store identity — "scroll" is COD:M\'s single-scroll page model, "filter" is FCM\'s category hide/show model.',
    'In `mode="filter"` the `active` prop is the source of truth; in `mode="scroll"` it is ignored and the internal scroll-spy owns the active tab.',
    '`level` ("l2"/"l3") is a styling hint only, meaningful for `variant="row"` — it makes two stacked rows read as parent/child, no behavioural effect.',
    'Tab ids in `tabs` must match real on-page section element ids in scroll mode, or the scroll-spy silently observes nothing.',
  ],
  variants: [
    {
      name: 'Bottom (L2, scroll mode)',
      props: () => ({
        variant: 'bottom',
        mode: 'scroll',
        isMobile: true,
        tabs: [
          { id: 'cat-gifts', label: 'Gifts' },
          { id: 'cat-cp', label: 'CP' },
          { id: 'cat-bundles', label: 'Bundles' },
        ],
      }),
    },
    {
      name: 'Top (L3, filter mode)',
      props: () => ({
        variant: 'top',
        mode: 'filter',
        active: 'silver',
        isMobile: true,
        tabs: [
          { id: 'bronze', label: 'Bronze' },
          { id: 'silver', label: 'Silver' },
          { id: 'gold', label: 'Gold' },
          { id: 'platinum', label: 'Platinum' },
        ],
      }),
    },
    {
      name: 'Row (L3, CatalogNavStack tab strip)',
      props: () => ({
        variant: 'row',
        level: 'l3',
        mode: 'scroll',
        isMobile: true,
        tabs: [
          { id: 'fc-points', label: 'FC Points' },
          { id: 'ultimate-team', label: 'Ultimate Team' },
          { id: 'career-mode', label: 'Career Mode' },
        ],
      }),
    },
  ],
})
