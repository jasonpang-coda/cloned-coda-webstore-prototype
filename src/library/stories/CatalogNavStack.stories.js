import CatalogNavStack from '@/components/CatalogNavStack.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'catalog-nav-stack',
  title: 'Catalog Nav Stack',
  group: 'Navigation',
  component: CatalogNavStack,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-motion-sys-duration-base',
    '--x-motion-sys-ease-standard',
    '--x-border-sheet',
    '--x-radius-container-xs',
    '--x-bg-sheet',
    '--x-bg-page',
    '--x-blur-container',
    '--x-gap-content-narrow',
    '--x-size-control-s',
    '--x-motion-sys-ease-decelerate',
    '--x-motion-sys-duration-exit',
    '--x-motion-sys-ease-accelerate',
  ],
  states: ['default', 'hover', 'pressed'],
  notes:
    'The sticky L2/L3 navigation aid for the FCM multi-level pilot, mounted in ' +
    'normal document flow right after Best Sellers (not the overlay layer). It ' +
    'is a pure navigation aid over a single continuous page that already renders ' +
    'every category/subcategory — tapping a tab scrolls to the matching section; ' +
    'an internal IntersectionObserver scroll-spy keeps the highlight (and, in the ' +
    '"stacked" presentation, the visible L3 row) in sync as the user scrolls past ' +
    'sections without tapping anything. It publishes --nav-stack-h so page sections ' +
    'can size their own scroll-margin-top against this bar\'s real height. In this ' +
    'isolated story the on-page section anchors (`cat-<id>` / subcategory ids) the ' +
    'scroll-spy looks for do not exist, so the observer simply finds nothing to ' +
    'watch and the first tab stays highlighted — this is graceful, not a bug.',
  rules: [
    'App.vue hardcodes presentation="flat" in production — "stacked" is kept only as an archived, still-functional presentation.',
    '`categories` must already be fully rendered on the page elsewhere; this component never filters or owns what content shows, only the affordance to jump to it.',
    'The L3 row only renders when the in-view category has more than one subcategory — a 1-subcategory category (e.g. Gifts) collapses it to nothing, not an empty bar.',
    '`isMobile` selects the scroll container: `.device__screen` when true, `window` when false (responsive/no device frame).',
  ],
  variants: [
    {
      name: 'Flat presentation (production default)',
      props: () => ({
        presentation: 'flat',
        isMobile: true,
        categories: [
          {
            id: 'daily-supplies',
            label: 'Daily Supplies',
            subcategories: [{ id: 'gifts', label: 'Gifts' }],
          },
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
            id: 'limited-offers',
            label: 'Limited Offers',
            subcategories: [{ id: 'bundles', label: 'Bundles' }],
          },
        ],
      }),
    },
    {
      name: 'Stacked presentation (archived, L2 + L3)',
      props: () => ({
        presentation: 'stacked',
        isMobile: true,
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
      }),
    },
    {
      name: 'Responsive (no device frame)',
      props: () => ({
        presentation: 'flat',
        isMobile: false,
        categories: [
          {
            id: 'daily-supplies',
            label: 'Daily Supplies',
            subcategories: [{ id: 'gifts', label: 'Gifts' }],
          },
          {
            id: 'top-ups',
            label: 'Top Ups',
            subcategories: [{ id: 'fc-points', label: 'FC Points' }],
          },
        ],
      }),
    },
  ],
})
