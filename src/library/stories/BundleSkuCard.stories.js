import BundleSkuCard from '@/components/BundleSkuCard.vue'
import { defineStory } from '../story.js'

// Build a representative child-item row from whatever coin/content art the
// active store ships, falling back to the brand mark so it renders on any theme.
function items (assets) {
  const coin = (i) => assets.content?.cpCoins?.[i] || assets.brand?.logomark
  return [
    { image: coin(160), rarity: 'legendary', tag: 'x3', quantity: 3 },
    { image: coin(960), rarity: 'epic',      tag: 'x5', quantity: 5 },
    { image: coin(5400), rarity: 'rare',      tag: 'x1', quantity: 1 },
  ]
}

function banner (assets) {
  return assets.content?.bannerMidnightSun
    || assets.content?.cpSkuBanner
    || assets.brand?.wordmark
}

export default defineStory({
  id: 'bundle-sku-card',
  title: 'Bundle SKU Card',
  group: 'Cards',
  component: BundleSkuCard,
  tokens: [
    '--x-radius-container-s',
    '--x-bg-sku-card-default',
    '--x-blur-container',
    '--x-motion-sys-duration-base',
    '--x-motion-sys-ease-decelerate',
    '--x-motion-sku-hover',
    '--x-motion-sys-duration-slow',
    '--border-weight-default',
    '--x-border-sku-card-default',
    '--x-bg-card-selected',
    '--x-shadow-card-hover',
    '--x-motion-sku-hover-in',
    '--x-border-sku-card-hover',
    '--x-border-sku-card-selected',
    '--border-weight-selected',
    '--x-motion-sku-press-scale',
    '--x-motion-sku-press',
    '--x-motion-sys-ease-standard',
    '--x-radius-container-xs',
    '--x-gradient-bundle-banner',
    '--x-pad-surface-s',
    '--x-gap-content-default',
    '--x-pad-surface-m',
    '--x-pad-surface-xl',
    '--x-gap-content-tight',
    '--x-text-header-default',
    '--x-text-hyperlink-default',
    '--x-text-hyperlink-hover',
    '--x-text-body-default',
    '--x-text-warning-default',
    '--x-text-error-default',
    '--x-gap-content-narrow',
    '--x-text-body-soft',
    '--x-text-success-default',
  ],
  states: ['default', 'hover'],
  notes:
    'Bundled multi-item SKU: wide 2.6:1 banner art, a breakdown row of child ' +
    'item tiles, title, price and an optional live countdown. When endsAt is set ' +
    'a countdown renders below the title; claimed dims the banner and (with ' +
    'refreshesOnClaim) flips the prefix from "Ends:" to "Refreshes:".',
  rules: [
    'bannerImage and title are required; the breakdown row hides when items is empty.',
    'skuOnBanner composites the 1:1 skuImage over banners that do not already bake in the art.',
    'endsAt expects a ms epoch in the future — a past value reads as expired.',
  ],
  variants: [
    {
      name: 'Default',
      props: ({ assets }) => ({
        bannerImage: banner(assets),
        title: 'MIDNIGHT SUN BUNDLE',
        currentPrice: '$0.99',
        originalPrice: '$1.99',
        discountPercent: '-50%',
        items: items(assets),
        skuImage: assets.content?.skuMidnightSunHero || assets.brand?.logomark,
        limitLabel: 'Limit: 1',
      }),
    },
    {
      name: 'With countdown',
      props: ({ assets }) => ({
        bannerImage: banner(assets),
        title: 'LIMITED EVENT BUNDLE',
        subtitle: 'Available for a limited time',
        currentPrice: '$2.99',
        originalPrice: '$5.99',
        discountPercent: '-50%',
        items: items(assets),
        skuImage: assets.content?.skuMidnightSunHero || assets.brand?.logomark,
        endsAt: Date.now() + 26 * 60 * 60 * 1000,
      }),
    },
    {
      name: 'Claimed',
      props: ({ assets }) => ({
        bannerImage: banner(assets),
        title: 'DAILY STRONGBOX',
        currentPrice: 'FREE',
        items: items(assets),
        claimed: true,
        refreshesOnClaim: true,
        endsAt: Date.now() + 8 * 60 * 60 * 1000,
      }),
    },
  ],
})
