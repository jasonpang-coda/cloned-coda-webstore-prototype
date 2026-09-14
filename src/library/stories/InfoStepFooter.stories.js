import InfoStepFooter from '@/components/steps/InfoStepFooter.vue'
import { defineStory } from '../story.js'

const BUNDLE = { currentPrice: '$4.99' }

function makeData({ assets, canBuy, footer, rewardsLabel }) {
  return {
    bundle: BUNDLE,
    canBuy,
    footer,
    rewardsLabel,
    logomark: assets.brand?.logomark,
    loyaltyIcon: assets.brand?.loyaltyIcon,
    signInCta: 'Sign In',
    orLabel: 'OR',
    signInIdCta: 'Sign in with Player ID',
  }
}

export default defineStory({
  id: 'info-step-footer',
  title: 'Info Step Footer',
  group: 'Steps',
  component: InfoStepFooter,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    'Presentational port of the "ITEM SUMMARY" step\'s pinned footer. Branches on ' +
    '`data.footer`: the default (non-FCM) layout shows a full-width BUY button ' +
    '(signed in) or a sign-in-with-account / "OR" / sign-in-with-Player-ID pair ' +
    '(signed out); `data.footer === \'buyNow\'` (FCM Buy Now) instead shows a price ' +
    '+ pill-CTA row plus an optional reward-points line below. Sibling to ' +
    'InfoStepBody — see that file for why the step is split into a body + footer ' +
    'component pair.',
  rules: [
    '`data` and `primaryAction` are both required — `primaryAction.label` drives the buy/buy-now CTA text.',
    '`data.footer === \'buyNow\'` switches the whole footer shape (price+pill row) — every other value renders the default full-width-button layout.',
    '`data.canBuy` toggles buy vs sign-in controls independently of the footer shape.',
    'The buyNow layout\'s reward-points line only renders when `data.rewardsLabel` is set.',
  ],
  variants: [
    {
      name: 'Default (signed in)',
      props: ({ assets }) => ({
        data: makeData({ assets, canBuy: true, footer: 'default', rewardsLabel: null }),
        primaryAction: { kind: 'buy', label: 'Buy Now • $4.99', enabled: true },
      }),
    },
    {
      name: 'Default (signed out)',
      props: ({ assets }) => ({
        data: makeData({ assets, canBuy: false, footer: 'default', rewardsLabel: null }),
        primaryAction: { kind: 'buy', label: 'Buy Now • $4.99', enabled: true },
      }),
    },
    {
      name: 'FCM Buy Now (signed in, with rewards)',
      props: ({ assets }) => ({
        data: makeData({ assets, canBuy: true, footer: 'buyNow', rewardsLabel: 'Earn Reward Points 40' }),
        primaryAction: { kind: 'buyNow', label: 'BUY NOW', enabled: true },
      }),
    },
    {
      name: 'FCM Buy Now (signed out)',
      props: ({ assets }) => ({
        data: makeData({ assets, canBuy: false, footer: 'buyNow', rewardsLabel: null }),
        primaryAction: { kind: 'buyNow', label: 'BUY NOW', enabled: true },
      }),
    },
  ],
})
