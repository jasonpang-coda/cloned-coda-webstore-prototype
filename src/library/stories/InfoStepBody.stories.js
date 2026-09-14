import InfoStepBody from '@/components/steps/InfoStepBody.vue'
import { defineStory } from '../story.js'

function banner (assets) {
  return assets.content?.bannerMidnightSun
    || assets.content?.cpSkuBanner
    || assets.brand?.wordmark
}

// "You will receive" list rows — ItemSummaryAccordion's own prop shape
// (name/image/tileBg/quantity/description), spread via v-bind by InfoStepBody.
function items (assets) {
  return [
    {
      name: 'MYTHIC WEAPON SKIN',
      image: assets.brand?.cpIcon,
      tileBg: 'var(--x-rarity-gradient-mythic)',
      quantity: 1,
      description: 'A limited-edition weapon skin with exclusive kill effects.',
    },
    {
      name: '2,028 CP',
      image: assets.brand?.cpIcon,
      tileBg: 'var(--x-rarity-gradient-legendary)',
      quantity: '2,028',
    },
  ]
}

const BUNDLE = {
  bannerImage: null,
  skuOnBanner: false,
  skuImage: null,
  title: 'MIDNIGHT SUN BUNDLE',
  limitLabel: 'Limit: 1 per account',
  originalPrice: '$9.99',
  discountPercent: '-50%',
  currentPrice: '$4.99',
  endsAt: null,
  loyaltyPoints: 40,
}

export default defineStory({
  id: 'info-step-body',
  title: 'Info Step Body',
  group: 'Steps',
  component: InfoStepBody,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    'Presentational port of the "ITEM SUMMARY" step\'s scrolling body — the ' +
    'signed-in-state account row (or a signed-out message), the product block ' +
    '(banner, optional composited SKU art, title, limit label, live countdown, ' +
    'price/discount), and the "you will receive" ItemSummaryAccordion list. ' +
    'Renders `data`, the resolved `info` descriptor from ' +
    'src/content/sheetContent.js (infoDescriptor) — never reads config/strings/ ' +
    'assets directly. Sibling to InfoStepFooter, split because BaseSheet keeps the ' +
    'scrolling body and pinned footer as separate slots.',
  rules: [
    "A live countdown (bundle.endsAt set) used to hang npm run harness:render forever: composables/useCountdown.js's watch(...,{immediate:true}) started a real setInterval during setup(), which Vue SSR's renderToString() also executes (unlike onMounted, which SSR skips) — the pending timer kept the Node process alive indefinitely. Fixed in useCountdown.js by guarding start() with '!import.meta.env.SSR'. Any future composable starting a timer/interval from an immediate watch or top-level setup code (not onMounted) needs the same guard.",
    '`data` is the only prop, and is required — `data.bundle` is the full SKU/bundle object, plus the resolved copy/flags around it.',
    '`data.showProduct: false` (FCM Buy Now\'s compact sheet) hides the whole account row + product block, leaving only the receive list.',
    '`data.canBuy` toggles between the account row (signed in / guest-verified) and `data.signedOutMessage`.',
    'A live countdown only renders when `bundle.endsAt` is a future ms epoch — `useCountdown` drives the "ends in" text and its urgency color tier.',
    '`data.compactAccordion` is forwarded to every ItemSummaryAccordion row (hides the rarity thumb — used by stores with no rarity thumb concept).',
  ],
  variants: [
    {
      name: 'Default (signed in)',
      props: ({ assets }) => ({
        data: {
          bundle: { ...BUNDLE, bannerImage: banner(assets), skuImage: assets.content?.skuMidnightSunHero || assets.brand?.logomark, items: items(assets) },
          accountName: 'codayw',
          showProduct: true,
          compactAccordion: false,
          footer: 'default',
          canBuy: true,
          rewardsLabel: null,
          showRating: false,
          logomark: assets.brand?.logomark,
          loyaltyIcon: assets.brand?.loyaltyIcon,
          receiveLabel: 'You will receive',
          signedOutMessage: 'Sign in to purchase this item',
          endsLabel: 'Ends in',
          signInCta: 'Sign In',
          orLabel: 'OR',
          signInIdCta: 'Sign in with Player ID',
        },
      }),
    },
    {
      name: 'Signed out',
      props: ({ assets }) => ({
        data: {
          bundle: { ...BUNDLE, bannerImage: banner(assets), skuImage: assets.content?.skuMidnightSunHero || assets.brand?.logomark, items: items(assets) },
          accountName: null,
          showProduct: true,
          compactAccordion: false,
          footer: 'default',
          canBuy: false,
          rewardsLabel: null,
          showRating: false,
          logomark: assets.brand?.logomark,
          loyaltyIcon: assets.brand?.loyaltyIcon,
          receiveLabel: 'You will receive',
          signedOutMessage: 'Sign in to purchase this item',
          endsLabel: 'Ends in',
          signInCta: 'Sign In',
          orLabel: 'OR',
          signInIdCta: 'Sign in with Player ID',
        },
      }),
    },
    {
      name: 'With countdown + rewards (FCM Buy Now, compact)',
      props: ({ assets }) => ({
        data: {
          bundle: {
            ...BUNDLE,
            bannerImage: banner(assets),
            skuImage: assets.content?.skuMidnightSunHero || assets.brand?.logomark,
            items: items(assets),
            endsAt: Date.now() + 26 * 60 * 60 * 1000,
          },
          accountName: 'codayw',
          showProduct: true,
          compactAccordion: true,
          footer: 'buyNow',
          canBuy: true,
          rewardsLabel: 'Earn Reward Points 40',
          showRating: false,
          logomark: assets.brand?.logomark,
          loyaltyIcon: assets.brand?.loyaltyIcon,
          receiveLabel: 'You will receive',
          signedOutMessage: 'Sign in to purchase this item',
          endsLabel: 'Ends in',
          signInCta: 'Sign In',
          orLabel: 'OR',
          signInIdCta: 'Sign in with Player ID',
        },
      }),
    },
  ],
})
