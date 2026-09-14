import PaymentStepFooter from '@/components/steps/PaymentStepFooter.vue'
import { defineStory } from '../story.js'
import { useLocale } from '../../composables/useLocale.js'
import { useCheckout } from '../../composables/useCheckout.js'

const { common } = useLocale()
const { selectedChannel } = useCheckout()

function makeData({ assets, strings, loyalty }) {
  return {
    actionLabel: strings.checkout?.actionLabel ?? 'CHECK OUT',
    selectPaymentCta: common.value.checkout.selectPaymentCta,
    viewTerms: common.value.checkout.viewTerms,
    loyalty,
    loyaltyPoints: loyalty ? 40 : null,
    loyaltyIcon: assets.brand?.loyaltyIcon,
  }
}

export default defineStory({
  id: 'payment-step-footer',
  title: 'Payment Step Footer',
  group: 'Steps',
  component: PaymentStepFooter,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    'Presentational port of the payment step\'s pinned footer: rewards line + ' +
    'full-width CTA (disabled and reading "Select Payment Method" until a channel ' +
    'is chosen), then the "View Terms and Conditions" link that scrolls ' +
    'PaymentStepBody\'s static legal bar into view. Reads useCheckout().' +
    'selectedChannel directly — the same shared singleton PaymentStepBody reads — ' +
    'so the two halves stay in sync without a prop bridge. Sibling to ' +
    'PaymentStepBody; see that file for why the step is split in two.',
  rules: [
    '`data` is required; the CTA label and enabled state are NOT driven by `primaryAction` here (unlike CheckoutStepFooter) — they\'re computed locally from `useCheckout().selectedChannel`: disabled + `data.selectPaymentCta` until a channel is picked, then enabled + `data.actionLabel`.',
    '`canScrollBody` (from BaseSheet\'s #footer scoped slot) hides the terms link once the legal bar it jumps to already fits on screen.',
    'A story that wants to show the "channel selected" state must write to the shared `useCheckout().selectedChannel` singleton directly (via setup/teardown) — there is no prop for it.',
    'The rewards line only renders when both `data.loyalty` and `data.loyaltyPoints` are set.',
  ],
  variants: [
    {
      name: 'No channel selected (disabled)',
      setup: () => { selectedChannel.value = null },
      teardown: () => { selectedChannel.value = null },
      props: ({ assets, strings }) => ({
        data: makeData({ assets, strings, loyalty: { label: 'Reward Points' } }),
        canScrollBody: true,
      }),
    },
    {
      name: 'Channel selected (enabled)',
      setup: () => { selectedChannel.value = 0 },
      teardown: () => { selectedChannel.value = null },
      props: ({ assets, strings }) => ({
        data: makeData({ assets, strings, loyalty: { label: 'Reward Points' } }),
        canScrollBody: true,
      }),
    },
    {
      name: 'No rewards, terms link hidden',
      setup: () => { selectedChannel.value = 0 },
      teardown: () => { selectedChannel.value = null },
      props: ({ assets, strings }) => ({
        data: makeData({ assets, strings, loyalty: null }),
        canScrollBody: false,
      }),
    },
  ],
})
