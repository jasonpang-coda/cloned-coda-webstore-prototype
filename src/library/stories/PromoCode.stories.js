import PromoCode from '@/components/PromoCode.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'promo-code',
  title: 'Promo Code',
  group: 'Controls',
  component: PromoCode,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-narrow',
    '--x-pad-surface-s',
    '--x-text-hyperlink-default',
    '--x-motion-toggle',
    '--x-motion-accordion',
    '--x-gap-content-default',
    '--x-motion-sys-duration-fast',
    '--x-motion-sys-ease-accelerate',
    '--x-motion-sys-duration-base',
    '--x-motion-sys-ease-decelerate',
    '--x-border-input-default',
    '--x-radius-input-s',
    '--x-bg-input-default',
    '--x-motion-sku-hover',
    '--x-border-input-error',
    '--x-bg-input-error',
    '--x-text-body-default',
    '--x-text-placeholder',
    '--x-text-error-default',
    '--x-border-input-success',
    '--x-bg-sku-card-success',
    '--x-text-success-default',
  ],
  notes:
    'Collapsible "Have a promo code?" mini-accordion nested inside OrderSummarySheet\'s ' +
    'Order Summary detail — the same grid-rows 0fr→1fr accordion recipe as ' +
    'ItemSummaryAccordion, applied a second time inside an already-open parent ' +
    'accordion. Prototype-only validation: the single hardcoded demo code ' +
    '"SAVE10" succeeds and applies a flat 10% discount off `amount` (emitted via ' +
    '`applied`); anything else non-empty shows the input\'s error state. Success ' +
    'cross-fades the form into a pill with a remove (×) control; removing returns ' +
    'to the expanded empty form, not the collapsed head.',
  rules: [
    'amount is optional — when omitted, a successful apply still fires `applied` but with a 0 discount (no item total to compute a percentage against).',
    'All interaction state (expanded/collapsed, idle/error/applied) is internal — there is no prop to force a state; drive it by typing into the field in the rendered story.',
    'The demo code is case-insensitive ("save10", "SAVE10" both match) — anything else non-empty on Apply shows the error state, and an empty field no-ops.',
    'show-terms is emitted, not handled internally — the host is responsible for opening whatever terms surface it points to.',
  ],
  variants: [
    {
      name: 'Default',
      props: () => ({
        amount: null,
      }),
    },
    {
      name: 'With item amount',
      props: () => ({
        amount: 499,
      }),
    },
  ],
})
