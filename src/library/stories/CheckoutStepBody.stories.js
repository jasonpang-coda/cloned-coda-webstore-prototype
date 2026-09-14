import CheckoutStepBody from '@/components/steps/CheckoutStepBody.vue'
import { defineStory } from '../story.js'
import { useLocale } from '../../composables/useLocale.js'

const { common } = useLocale()

const CHECKOUT_ITEM = {
  label: null,
  amount: 528,
  currencyLabel: 'CP',
  currentPrice: '$4.99',
  baseAmount: 500,
  bonusAmount: 28,
  bonusLabel: 'BONUS CP',
  subtitle: '2028 Diamonds',
  skuImage: null,
  bundleInfo: null,
  loyaltyPoints: 40,
}

const CHECKOUT_ITEM_WITH_BUNDLE = {
  ...CHECKOUT_ITEM,
  label: 'Starter Bundle',
  subtitle: null,
  baseAmount: null,
  bonusAmount: null,
  bundleInfo: { items: [] },
}

function makeData({ assets, strings, item, showPoweredByCoda, showRating, loyalty }) {
  return {
    item,
    accountName: 'codayw',
    bonusLabelFallback: strings.sku?.bonusLabel ?? 'BONUS',
    itemInfoLabel: common.value.checkout.itemInfo,
    selectPaymentHeading: common.value.checkout.selectPayment,
    channels: [
      { logo: assets.pc?.googleApple, label: 'Google Pay / Apple Pay' },
      { logo: assets.pc?.creditCard, label: common.value.checkout.cardPayments },
      { logo: assets.pc?.paypalVenmo, label: 'PayPal' },
      { logo: assets.pc?.cashApp, label: 'Cash App' },
    ],
    subtotalLabel: common.value.checkout.subtotal,
    poweredByLabel: common.value.checkout.poweredBy,
    showPoweredByCoda,
    showRating,
    codaLogo: assets.brand?.coda,
    ratingImage: assets.brand?.rating,
    termsHeading: common.value.checkout.termsHeading,
    termsBody: strings.checkout?.termsBody ?? common.value.checkout.termsBodyGeneric,
    viewTerms: common.value.checkout.viewTerms,
    loyalty,
    loyaltyPoints: loyalty ? 40 : null,
    loyaltyIcon: assets.brand?.loyaltyIcon,
  }
}

export default defineStory({
  id: 'checkout-step-body',
  title: 'Checkout Step Body',
  group: 'Steps',
  component: CheckoutStepBody,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    'Presentational port of CheckoutSheet.vue\'s scrolling body — the default ' +
    '(non-FCM-Buy-Now) payment step: account row, chosen-item banner (+ optional ' +
    '"Item Info" link back to the info step), the literal 2x2 payment-channel grid, ' +
    'and the static Terms & Conditions legal bar. Renders `data`, the resolved ' +
    '`checkout` descriptor from src/content/sheetContent.js (checkoutDescriptor) — ' +
    'never reads config/strings/assets directly. Sibling to CheckoutStepFooter, ' +
    'split because BaseSheet keeps the scrolling body and pinned footer as separate ' +
    'slots; both read useCheckout().selectedChannel directly so the footer can ' +
    'compute its enabled state without a prop bridge.',
  rules: [
    '`data` is the only prop, and is required — it is the full `checkout` step descriptor, not a raw item.',
    'The item banner shows `label` when set, otherwise falls back to `amount` + `currencyLabel`; `baseAmount`/`bonusAmount` render the "500 + 28 BONUS CP" split line only when both are non-null.',
    '"Item Info" only renders when `data.item.bundleInfo` is present — a plain currency SKU has no bundle to drill into.',
    'The payment-channel grid is a literal 4-entry list built in sheetContent.js (Google Pay/Apple Pay, card, PayPal, Cash App) — not config-driven, unlike PaymentStepBody\'s per-store `config.checkout.channels`.',
    'Selection is read from the shared `useCheckout().selectedChannel` singleton, not a prop — driving it in a story means writing to that composable directly if a specific selected state is needed.',
  ],
  variants: [
    {
      name: 'Default',
      props: ({ assets, strings }) =>
        ({
          data: makeData({
            assets,
            strings,
            item: CHECKOUT_ITEM,
            showPoweredByCoda: true,
            showRating: true,
            loyalty: { label: 'Reward Points' },
          }),
        }),
    },
    {
      name: 'Bundle item (with Item Info)',
      props: ({ assets, strings }) =>
        ({
          data: makeData({
            assets,
            strings,
            item: CHECKOUT_ITEM_WITH_BUNDLE,
            showPoweredByCoda: false,
            showRating: false,
            loyalty: null,
          }),
        }),
    },
  ],
})
