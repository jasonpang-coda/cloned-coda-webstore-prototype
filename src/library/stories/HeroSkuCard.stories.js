import HeroSkuCard from '@/components/HeroSkuCard.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'hero-sku-card',
  title: 'Hero SKU Card',
  group: 'Cards',
  component: HeroSkuCard,
  tokens: [
    '--x-radius-container-s',
    '--x-bg-sku-card-default',
    '--x-shadow-card',
    '--x-motion-sku-hover',
    '--x-motion-sys-duration-slow',
    '--x-motion-sys-ease-decelerate',
    '--x-shadow-card-hover',
    '--x-motion-sku-press',
    '--x-bg-card-selected',
    '--x-shadow-card-selected',
    '--x-motion-sku-select',
    '--border-weight-selected',
    '--x-border-sku-card-selected',
    '--x-gradient-hero-scrim',
    '--x-gap-content-default',
    '--x-pad-surface-l',
    '--x-pad-surface-m',
    '--x-gap-content-narrow',
    '--x-text-hyperlink-default',
    '--x-text-header-default',
    '--x-gap-content-tight',
    '--x-pad-surface-xxs',
    '--x-pad-surface-s',
    '--x-radius-badge-full',
    '--border-weight-default',
    '--x-border-card-default',
    '--x-bg-card-default',
    '--x-text-body-default',
    '--x-text-success-default',
  ],
  states: ['default', 'hover', 'pressed'],
  notes:
    'Full-width landscape showcase for a premium NAMED product — a game edition, ' +
    'collector\'s pack, or flagship bundle — as opposed to a currency/coin SKU. Key art ' +
    'fills the card; a bottom-up scrim keeps the overlaid name, "what\'s included" chips ' +
    'and discounted price legible. Tapping opens the shared checkout sheet (a no-op until ' +
    'the account is identified); the CTA verb comes from config.checkout.actionLabel. ' +
    'Wired into CategoryCatalog via cardType: "hero".',
  rules: [
    'Use for named products with an includes list — not for currency/coin SKUs (use SkuCard/SkuImageCard).',
    'title and image are required; eyebrow, includes, discount and loyalty are all additive.',
    'The CTA label is store-driven (config.checkout.actionLabel) — never hardcode the verb.',
  ],
  variants: [
    {
      name: 'Edition (full)',
      props: ({ assets }) => ({
        eyebrow: 'ULTIMATE EDITION',
        title: 'Voidfarer Edition',
        description: 'Everything in the Expanse — base game, packs and the Season Pass.',
        includes: ['Base Game', 'Deluxe Pack', 'Voidfarer Pack', 'Season Pass'],
        image: assets.content?.storyHero,
        skuImage: assets.content?.skuCodPoint || assets.brand?.logomark,
        currentPrice: '$44.50',
        originalPrice: '$113.75',
        discountPercent: '-61%',
      }),
    },
    {
      name: 'No discount',
      props: ({ assets }) => ({
        eyebrow: 'COMPLETE COLLECTION',
        title: 'Deluxe Edition',
        includes: ['Base Game', 'Deluxe Pack'],
        image: assets.content?.storyHero,
        skuImage: assets.content?.skuCodPoint || assets.brand?.logomark,
        currentPrice: '$73.50',
      }),
    },
    {
      name: 'Minimal',
      props: ({ assets }) => ({
        title: 'Base Game',
        image: assets.content?.storyHero,
        currentPrice: '$59.00',
      }),
    },
  ],
})
