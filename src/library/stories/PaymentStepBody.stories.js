import PaymentStepBody from '@/components/steps/PaymentStepBody.vue'
import { defineStory } from '../story.js'
import { useLocale } from '../../composables/useLocale.js'

const { common } = useLocale()

const ITEM = {
  label: null,
  amount: 528,
  currencyLabel: 'CP',
  currentPrice: '$4.99',
  subtitle: '2028 Diamonds',
  skuImage: null,
  loyaltyPoints: 40,
}

function channels(assets) {
  return [
    { logo: assets.pc?.googleApple, name: 'Google Pay / Apple Pay', price: null },
    { logo: assets.pc?.creditCard, name: 'Credit / Debit Card', price: null },
    { logo: assets.pc?.paypalVenmo, name: 'PayPal', price: null },
    { logo: assets.pc?.cashApp, name: 'Cash App', price: '$5.24' },
  ]
}

function makeData({ assets, strings, item, loyalty }) {
  return {
    item,
    accountName: 'codayw',
    summaryLabel: item.label || [item.amount, item.currencyLabel].filter((v) => v != null).join(' '),
    breakdown: { item: '$4.75', tax: '$0.24', total: '$4.99' },
    totalDisplay: '$4.99',
    channels: channels(assets),
    actionLabel: strings.checkout?.actionLabel ?? 'CHECK OUT',
    selectPaymentCta: common.value.checkout.selectPaymentCta,
    accountLabel: common.value.checkout.accountLabel,
    itemPriceLabel: common.value.checkout.itemPrice,
    taxLabel: common.value.checkout.tax,
    totalLabel: common.value.checkout.totalPayment,
    selectPaymentHeading: common.value.checkout.selectPayment,
    promoDiscountLabel: common.value.checkout.promoDiscountLabel,
    promoDetailsTitle: common.value.checkout.promoDetailsTitle,
    promoDetailsHeading: common.value.checkout.promoDetailsHeading,
    promoDetailsBody: common.value.checkout.promoDetailsBody,
    promoTermsHeading: common.value.checkout.promoTermsHeading,
    promoTermsBody: common.value.checkout.promoTermsBody,
    promoClose: common.value.checkout.promoClose,
    termsHeading: common.value.checkout.termsHeading,
    termsBody: strings.checkout?.termsBody ?? common.value.checkout.termsBodyGeneric,
    viewTerms: common.value.checkout.viewTerms,
    loyalty,
    loyaltyPoints: loyalty ? item.loyaltyPoints : null,
    loyaltyIcon: assets.brand?.loyaltyIcon,
  }
}

export default defineStory({
  id: 'payment-step-body',
  title: 'Payment Step Body',
  group: 'Steps',
  component: PaymentStepBody,
  overlay: true,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    'Presentational port of the "Order Summary / Select Payment Method" step\'s ' +
    'scrolling body: collapsible order-summary accordion (with a Promo Code mini- ' +
    'accordion + its own T&Cs details modal), the static Terms & Conditions legal ' +
    'bar, and the payment-channel grid built from PcCard. Renders `data`, the ' +
    'resolved `payment` descriptor from src/content/sheetContent.js ' +
    '(paymentDescriptor) — never reads config/strings/assets directly. Reads ' +
    'useCheckout().selectedChannel directly (the shared singleton every SKU card / ' +
    'BuyNowBar already reads) so PaymentStepFooter can independently compute ' +
    'canCheckout without a prop bridge. Owns its own promo-code and T&Cs-modal ' +
    'state — a fresh mount each time the step is entered is what resets it.',
  rules: [
    '`data` is required; `overlayTarget` is the mount point the Promo Code T&Cs modal Teleports into (BaseSheet\'s #overlay slot) — pass null in isolation and the Teleport disables itself, rendering the modal inline instead.',
    'The order-summary accordion starts open and auto-collapses once its nearest `.sheet__body` scroll ancestor scrolls past a small threshold — in isolation (no such ancestor) it simply never auto-collapses.',
    'The payment-channel grid comes from `data.channels`, each `{ logo, name, price }` — `price` is per-channel surcharge math from sheetContent.js\'s `channelPrice()`, not a flat fee; omit it (null) for channels with no surcharge.',
    '`data.termsBody` is rendered via v-html (it may embed inline hyperlink spans for named legal documents) — never pass unsanitised/user-provided text through it.',
    'Channel selection is read from the shared `useCheckout().selectedChannel` singleton, not a prop.',
  ],
  variants: [
    {
      name: 'Default',
      props: ({ assets, strings }) => ({
        data: makeData({ assets, strings, item: ITEM, loyalty: { label: 'Reward Points' } }),
        overlayTarget: null,
      }),
    },
    {
      name: 'No loyalty rewards',
      props: ({ assets, strings }) => ({
        data: makeData({ assets, strings, item: { ...ITEM, loyaltyPoints: null }, loyalty: null }),
        overlayTarget: null,
      }),
    },
  ],
})
