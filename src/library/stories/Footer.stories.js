import Footer from '@/components/Footer.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'footer',
  title: 'Footer',
  group: 'Content',
  component: Footer,
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-bg-navbar',
    '--x-border-divider',
    '--x-pad-surface-l',
    '--x-pad-surface-xl',
    '--x-gap-content-loose',
    '--x-gap-content-default',
    '--x-text-header-default',
    '--x-size-input-m',
    '--x-pad-surface-s',
    '--x-bg-input-inverse',
    '--x-border-input-inverse',
    '--x-radius-input-m',
    '--x-text-body-default',
    '--x-size-icon-l',
    '--x-bg-nav',
    '--x-pad-surface-m',
    '--x-text-body-soft',
    '--x-gap-content-tight',
    '--x-radius-badge-full',
  ],
  notes:
    'Site footer: an Actions bar (support link, region/language switcher, cookie ' +
    'preference, social links) over a TM/legal bar (publisher wordmark, disclaimer, ' +
    'Powered-By-Coda, copyright, legal links). Takes NO props — every piece of ' +
    'content comes straight from useStoreAssets/useStoreStrings/useStoreConfig plus ' +
    'useLocale (region/language) and useTransactionHistory (only used to decide ' +
    'whether to reserve extra bottom clearance for the fixed CategoryNav bar), so ' +
    'this story exercises exactly what mounting <Footer /> in App.vue produces for ' +
    'the currently active store theme — it never branches on theme identity itself. ' +
    'Because content is entirely theme-driven, the harness\'s per-store sweep IS the ' +
    'variant matrix here; there is no meaningful prop combination to vary.',
  rules: [
    'No props — do not add any; all content is sourced reactively from composables.',
    'The Support action only renders when config.footer.supportUrl is set.',
    'The Language pill only renders when the current region offers more than one ' +
      'language (availableLanguages.length > 1).',
    'Each social icon is individually gated on config.footer.social?.[network] — ' +
      'absent networks are v-show hidden, not removed, so layout stays stable.',
    'The region/language actions are always visible here, unlike NavBar/NavDrawer\'s ' +
      'equivalents which are gated behind the localeSwitcher feature flag.',
  ],
  variants: [
    {
      name: 'Default',
      props: () => ({}),
    },
  ],
})
