import LanguageSelectorSheet from '@/components/LanguageSelectorSheet.vue'
import { defineStory } from '../story.js'
import { useLocale } from '../../composables/useLocale.js'

const { openLanguageSelector, closeLanguageSelector, setLanguage } = useLocale()

export default defineStory({
  id: 'language-selector-sheet',
  title: 'Language Selector Sheet',
  group: 'Overlays',
  component: LanguageSelectorSheet,
  overlay: true,
  tokens: [
    '--x-gap-content-default',
    '--x-pad-surface-s',
    '--x-radius-container-s',
    '--x-text-body-default',
    '--x-motion-sku-hover',
    '--x-bg-indicator-neutral-default',
    '--x-text-hyperlink-default',
  ],
  states: ['default'],
  notes:
    'The "Select Language" picker (Figma 4016:6248). A flat, un-grouped list of ' +
    'the languages available in the current region (English always first); the ' +
    'active language row is tinted and check-marked. Opened from the navbar/ ' +
    'NavDrawer language switcher via useLocale().openLanguageSelector(). Uses ' +
    'the same BaseSheet chrome as RegionSelectorSheet, but with ' +
    'size-hint="content" — the list is short enough to hug its own height ' +
    'instead of a fixed 85%.',
  rules: [
    'Picking a row calls setLanguage(code) then immediately closeLanguageSelector() — there is no separate confirm step.',
    'Each row label renders dir="auto" so an RTL language endonym (e.g. Arabic) still lays out correctly inside an otherwise LTR list.',
    'availableLanguages is regional — it is not the full language catalogue, only what the current region/market exposes.',
  ],
  variants: [
    {
      name: 'Default',
      setup: () => openLanguageSelector(),
      teardown: () => closeLanguageSelector(),
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Non-English selected',
      setup: () => { setLanguage('es'); openLanguageSelector() },
      teardown: () => { closeLanguageSelector(); setLanguage('en') },
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Responsive (desktop modal)',
      setup: () => openLanguageSelector(),
      teardown: () => closeLanguageSelector(),
      props: () => ({ isMobile: false }),
    },
  ],
})
