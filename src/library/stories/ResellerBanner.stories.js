import ResellerBanner from '@/components/ResellerBanner.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'reseller-banner',
  title: 'Reseller Banner',
  group: 'Content',
  component: ResellerBanner,
  states: ['collapsed', 'expanded'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-bg-sheet',
    '--x-pad-surface-m',
    '--x-pad-surface-l',
    '--x-gap-control-s',
    '--x-pad-surface-xs',
    '--x-text-body-default',
    '--x-motion-sys-duration-exit',
    '--x-motion-sys-ease-standard',
    '--x-motion-accordion',
  ],
  notes:
    'Legal-disclosure strip mounted at the very top of the page in App.vue, gated on ' +
    '`config.catalog?.reseller` (only FCM sets that flag today — see ' +
    'src/stores/fcm/store.js — so this never renders on Codashop-family stores). ' +
    'Takes no props: both the always-visible short line and the expandable long ' +
    'disclosure are hardcoded English legal copy in the component itself, not read ' +
    'from useStoreStrings(). Internal `isExpanded` ref drives the chevron rotation ' +
    'and a grid-template-rows 0fr→1fr accordion reveal (the same --x-motion-accordion ' +
    'recipe ItemSummaryAccordion uses) — there is no `defaultOpen` prop, it always ' +
    'mounts collapsed.',
  rules: [
    'No props — purely self-contained; do not add prop-driven copy here, edit the component text directly if the legal line changes.',
    'Only rendered when config.catalog.reseller is truthy for the active store (FCM today).',
    'The long disclosure text is a single fixed EA Sports FC Mobile reseller statement — not localized per store.',
  ],
  variants: [
    {
      name: 'Default',
      props: () => ({}),
    },
  ],
})
