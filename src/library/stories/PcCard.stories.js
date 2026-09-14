import PcCard from '@/components/checkout/PcCard.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'pc-card',
  title: 'PC Card',
  group: 'Checkout',
  component: PcCard,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    'One payment-channel tile: logo (or a generic MaterialIcon fallback when no ' +
    'logo asset exists yet), label, and an optional price line. Extracted from ' +
    'PaymentStepBody\'s "Select Payment Method" grid so both the overlay ' +
    'CheckoutSheet and the inline checkout\'s StepPayment share one component ' +
    'instead of two parallel implementations.',
  rules: [
    'label is required; logo and icon are both optional — pass logo when a real brand mark is shipped, icon (a MaterialIcon name) as the "text-only, no fabricated logos" fallback for channels without one.',
    'price is null until a SKU is selected upstream — omit it entirely rather than passing an empty string.',
    'selected drives both the highlighted background and the accent border — it does not change layout.',
  ],
  variants: [
    {
      name: 'Default (with logo)',
      props: ({ assets }) => ({
        logo: assets.pc?.creditCard,
        label: 'Credit Card',
        price: null,
        selected: false,
      }),
    },
    {
      name: 'Selected, with price',
      props: ({ assets }) => ({
        logo: assets.pc?.googleApple,
        label: 'Google Pay / Apple Pay',
        price: '$9.99',
        selected: true,
      }),
    },
    {
      name: 'Icon fallback (no logo asset)',
      props: () => ({
        icon: 'qr_code_2',
        label: 'PayNow',
        price: '$9.99',
        selected: false,
      }),
    },
  ],
})
