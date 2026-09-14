import { defineTour } from '@coda/tourguide-kit'
import { useLocale } from '../../composables/useLocale.js'
import { useCheckout } from '../../composables/useCheckout.js'

export default defineTour({
  id: 'locale-switcher',
  title: 'Market & Language Switcher',
  category: 'Localization',
  description: 'Demonstrates switching store market territories, local currency formats, and interface languages.',
  defaultDevice: 'iphone',

  setup: async () => {
    const { closeRegionSelector, closeLanguageSelector } = useLocale()
    const { closeCheckout } = useCheckout()
    closeRegionSelector()
    closeLanguageSelector()
    closeCheckout()
    await new Promise(r => setTimeout(r, 150))
  },

  steps: [
    {
      id: 'open-region-sheet',
      title: 'Region & Market Selector Trigger',
      explanation: 'Users can tap the market flag pill in the navigation header or drawer to switch their region.',
      poiSelector: 'region-pill',
      poiPlacement: 'bottom',
      holdMs: 2800,
      action: {
        type: 'call',
        handler: () => {
          const { openRegionSelector } = useLocale()
          openRegionSelector()
        },
        delayBeforeActionMs: 400,
        delayAfterActionMs: 600,
      },
    },
    {
      id: 'browse-region-list',
      title: 'Search & Continent-Grouped Markets',
      explanation: 'Searchable market list with continent grouping and currency mapping.',
      poiSelector: 'region-list',
      poiPlacement: 'top',
      holdMs: 3000,
    },
    {
      id: 'select-market-row',
      title: 'Select Regional Market',
      explanation: 'Selecting a new region instantly updates catalogue prices and available localized payment methods.',
      poiSelector: 'region-row',
      poiPlacement: 'top',
      holdMs: 2500,
      action: {
        type: 'click',
        target: 'region-row',
        delayBeforeActionMs: 400,
        delayAfterActionMs: 700,
      },
    },
  ],
})
