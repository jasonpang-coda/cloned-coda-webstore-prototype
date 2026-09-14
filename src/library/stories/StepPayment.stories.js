import StepPayment from '@/components/checkout/StepPayment.vue'
import { defineStory } from '../story.js'
import { useCheckout } from '../../composables/useCheckout.js'

const { selectedItem, selectedChannel } = useCheckout()

const DEMO_ITEM = {
  label: '1,060 Diamonds',
  amount: 1060,
  currencyLabel: 'Diamonds',
  currentPrice: '$9.99',
}

function resetCheckoutState() {
  selectedItem.value = null
  selectedChannel.value = null
}

export default defineStory({
  id: 'step-payment',
  title: 'Step Payment',
  group: 'Checkout',
  component: StepPayment,
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    '"Select Payment" step (Figma 2198:5134). A grid of PcCard payment-channel ' +
    'tiles, modelled on CheckoutSheet\'s own channel list but laid out as its ' +
    'own page section with NO enclosing StepCard. Has no real props: the ' +
    'channel set is config.checkout.paymentChannels (an ordered array of ' +
    'CHANNEL_DEFS keys — omitted keeps the original 4-channel default), and ' +
    'selection reads/writes the shared useCheckout() singleton (selectedItem, ' +
    'selectedChannel), not local state — a story drives it via setup()/' +
    'teardown() writing directly to that composable, the same idiom as ' +
    'BuyNowBar\'s story.',
  rules: [
    'Every tile shows the same price once a SKU is selected upstream (useCheckout().selectedItem) — price is not per-channel.',
    'A channel with no shipped logo asset renders a generic icon + label tile rather than a fabricated brand mark.',
    '2 columns on mobile, 4 columns at the >= 641px container breakpoint.',
  ],
  variants: [
    {
      name: 'No item selected yet',
      setup: () => { selectedItem.value = null; selectedChannel.value = null },
      teardown: resetCheckoutState,
      props: () => ({}),
    },
    {
      name: 'Item + channel selected',
      setup: () => { selectedItem.value = { ...DEMO_ITEM }; selectedChannel.value = 0 },
      teardown: resetCheckoutState,
      props: () => ({}),
    },
  ],
})
