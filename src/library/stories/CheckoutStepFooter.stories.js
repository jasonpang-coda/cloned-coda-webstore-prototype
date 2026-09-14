import CheckoutStepFooter from '@/components/steps/CheckoutStepFooter.vue'
import { defineStory } from '../story.js'
import { useLocale } from '../../composables/useLocale.js'

const { common } = useLocale()

const CHECKOUT_ITEM = {
  currentPrice: '$4.99',
}

function makeData({ assets, strings, showPoweredByCoda, showRating }) {
  return {
    item: CHECKOUT_ITEM,
    subtotalLabel: common.value.checkout.subtotal,
    poweredByLabel: common.value.checkout.poweredBy,
    showPoweredByCoda,
    showRating,
    codaLogo: assets.brand?.coda,
    ratingImage: assets.brand?.rating,
    termsHeading: common.value.checkout.termsHeading,
    termsBody: strings.checkout?.termsBody ?? common.value.checkout.termsBodyGeneric,
    viewTerms: common.value.checkout.viewTerms,
  }
}

export default defineStory({
  id: 'checkout-step-footer',
  title: 'Checkout Step Footer',
  group: 'Steps',
  component: CheckoutStepFooter,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    'Presentational port of CheckoutSheet.vue\'s pinned footer — subtotal/price + ' +
    'CTA row, then the "View Terms and Conditions" link that scrolls ' +
    'CheckoutStepBody\'s static legal bar into view. Sibling to CheckoutStepBody; ' +
    'split because BaseSheet keeps the scrolling body and pinned footer as separate ' +
    'slots. Single flex root (not BaseSheet\'s shared `.sheet__footer` layout) since ' +
    'this footer is a horizontal price-block/CTA-column row rather than the other ' +
    'sheets\' stacked footers.',
  rules: [
    '`data` and `primaryAction` are both required — `primaryAction.label` drives the CTA button text, `data.item.currentPrice` drives the price display.',
    '`canScrollBody` (from BaseSheet\'s #footer scoped slot) hides the terms link once the legal bar it jumps to already fits on screen without scrolling — a redundant "view" link otherwise.',
    'The terms link scrolls `.sheet__terms` (CheckoutStepBody\'s own element) into view via a direct DOM query, not a prop bridge — the two components must be mounted together for that click to do anything.',
    '`data.showPoweredByCoda` / `data.showRating` are independent per-store toggles — either, both, or neither may show.',
  ],
  variants: [
    {
      name: 'Default',
      props: ({ assets, strings }) => ({
        data: makeData({ assets, strings, showPoweredByCoda: true, showRating: true }),
        primaryAction: { kind: 'checkout', label: common.value.checkout.actionLabel ?? 'CHECK OUT', enabled: true },
        canScrollBody: true,
      }),
    },
    {
      name: 'Terms link hidden (nothing left to scroll)',
      props: ({ assets, strings }) => ({
        data: makeData({ assets, strings, showPoweredByCoda: false, showRating: false }),
        primaryAction: { kind: 'checkout', label: common.value.checkout.actionLabel ?? 'CHECK OUT', enabled: true },
        canScrollBody: false,
      }),
    },
  ],
})
