import RegionSelectorSheet from '@/components/RegionSelectorSheet.vue'
import { defineStory } from '../story.js'
import { useLocale } from '../../composables/useLocale.js'

const { openRegionSelector, closeRegionSelector, setRegion } = useLocale()

export default defineStory({
  id: 'region-selector-sheet',
  title: 'Region Selector Sheet',
  group: 'Overlays',
  component: RegionSelectorSheet,
  overlay: true,
  tokens: [
    '--x-pad-surface-m',
    '--x-gap-content-default',
    '--x-pad-surface-s',
    '--x-size-icon-m',
    '--x-border-input-default',
    '--x-radius-input-m',
    '--x-bg-input-default',
    '--x-text-body-default',
    '--x-motion-sku-hover',
    '--x-text-placeholder',
    '--x-border-input-focused',
    '--x-gap-content-narrow',
    '--x-border-card-default',
    '--x-bg-card-default',
    '--x-bg-page',
    '--x-shadow-sheet',
    '--x-radius-container-s',
    '--x-bg-indicator-neutral-default',
    '--x-size-img-xl',
    '--x-gradient-scroll-fade-bottom',
    '--x-pad-surface-l',
    '--x-gap-content-loose',
    '--x-gap-content-separation',
    '--x-text-header-default',
    '--x-text-header-strong',
  ],
  states: ['default'],
  notes:
    'The "Select Region" picker (Figma 4014:4802; typeahead 4015:5635). Opened ' +
    'from the NavDrawer footer or the navbar region switcher via ' +
    'useLocale().openRegionSelector(). The continent-grouped market list ' +
    '(two-column CSS multi-column layout) sits below a pinned search box — ' +
    'typing does NOT filter that list, it instead drops a floating suggestion ' +
    'card of substring matches (matched text bolded) anchored under the input, ' +
    'while the full list stays in place underneath. Uses BaseSheet\'s 560px ' +
    'desktop maxWidth (wider than the other sheets\' 420px default) for the ' +
    'two-column layout to breathe.',
  rules: [
    'The search input filters nothing directly — it only populates the floating suggestions dropdown; the grouped list below is always the full, unfiltered set.',
    'Escape is captured in two stages: with a non-empty query it clears the query first (stopPropagation, sheet stays open); only a second Escape (or Escape on an empty query) reaches BaseSheet and closes the sheet.',
    'query resets to empty every time the sheet re-opens (watch on regionSelectorOpen) — it never carries a stale search across sessions.',
    'Picking a market (from either the list or the suggestion dropdown) calls setRegion(code) then closeRegionSelector() immediately — no separate confirm step.',
  ],
  variants: [
    {
      name: 'Default',
      setup: () => openRegionSelector(),
      teardown: () => closeRegionSelector(),
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Non-default region selected',
      setup: () => { setRegion('sg'); openRegionSelector() },
      teardown: () => { closeRegionSelector(); setRegion('us') },
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Responsive (desktop modal)',
      setup: () => openRegionSelector(),
      teardown: () => closeRegionSelector(),
      props: () => ({ isMobile: false }),
    },
  ],
})
