import InlineCheckoutCta from '@/components/checkout/InlineCheckoutCta.vue'
import { defineStory } from '../story.js'
import { useCheckout } from '../../composables/useCheckout.js'

const { selectedItem } = useCheckout()

const DEMO_ITEM = {
  label: '1,060 Diamonds',
  amount: 1060,
  currencyLabel: 'Diamonds',
  currentPrice: '$9.99',
}

function resetCheckoutState() {
  selectedItem.value = null
}

export default defineStory({
  id: 'inline-checkout-cta',
  title: 'Inline Checkout Cta',
  group: 'Checkout',
  component: InlineCheckoutCta,
  overlay: true,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    'The "guided checkout button" — docked sticky to the bottom of the screen ' +
    '(config.checkout.stepCta, Diablo Immortal). Not a page section: it must ' +
    'stay visible while the user scrolls through the remaining inline-checkout ' +
    'steps. Only ever renders two states, both driven by useCheckout()\'s ' +
    'selectedItem singleton rather than props — a story drives it via ' +
    'setup()/teardown() writing directly to that composable, the same idiom as ' +
    'BuyNowBar\'s story. Once both real gates clear (a SKU AND a payment ' +
    'channel), App.vue swaps this component out for the Buy Now widget entirely.',
  rules: [
    'isMobile is the only real prop — label, icon, and donut fill are all derived from useCheckout().selectedItem.',
    'Step 0 (no SKU selected): cart icon, empty donut, "Select Your Item" label.',
    'Step 1 (SKU selected, no payment channel yet): wallet icon, half-filled donut, "Select Payment Method" label.',
    'isMobile: false switches to the fixed (viewport-pinned) responsive presentation instead of absolute-within-device-frame.',
  ],
  variants: [
    {
      name: 'Step 0 — no item selected',
      setup: () => { selectedItem.value = null },
      teardown: resetCheckoutState,
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Step 1 — item selected',
      setup: () => { selectedItem.value = { ...DEMO_ITEM } },
      teardown: resetCheckoutState,
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Responsive (desktop)',
      setup: () => { selectedItem.value = { ...DEMO_ITEM } },
      teardown: resetCheckoutState,
      props: () => ({ isMobile: false }),
    },
  ],
})
