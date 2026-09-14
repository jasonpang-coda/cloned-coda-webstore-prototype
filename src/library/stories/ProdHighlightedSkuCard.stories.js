import ProdHighlightedSkuCard from '@/components/ProdHighlightedSkuCard.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'prod-highlighted-sku-card',
  title: 'Prod Highlighted Sku Card',
  group: 'Cards',
  component: ProdHighlightedSkuCard,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-pad-surface-l',
    '--x-pad-surface-s',
    '--x-border-sku-card-prod-highlighted',
    '--x-bg-sku-card-prod-reward',
    '--x-bg-image-sku-card-prod-highlighted',
    '--x-motion-sys-duration-slow',
    '--x-motion-sys-ease-decelerate',
    '--x-motion-sku-hover',
    '--x-motion-sys-distance-sm',
    '--x-motion-sku-press-scale',
    '--x-motion-sku-press',
    '--x-border-sku-card-selected',
    '--x-pad-surface-m',
    '--x-gap-content-tight',
    '--x-pad-surface-xxs',
    '--x-pad-surface-xs',
    '--x-gradient-sku-card-prod-gold',
    '--x-text-sku-tag-popular',
    '--x-sys-weight-regular',
    '--x-gap-content-narrow',
    '--x-text-header-default',
    '--x-text-shadow-sku-card-prod',
    '--x-text-body-default',
    '--x-radius-control-full',
    '--x-bg-loyalty-badge-prod',
    '--x-text-body-inverse',
    '--x-motion-sys-duration-base',
  ],
  notes:
    'The FCM production "highlighted SKU" card (fcmSkuCardModel flag, Figma node 3361:28283), ' +
    'replacing BestSellerCard at its one App.vue mount only. A landscape two-column layout ' +
    '(text + CTA left, product art right) rather than a restyle of BestSellerCard\'s stacked ' +
    'layout. Tapping anywhere opens the checkout sheet via useCheckout(); itemKey is deliberately ' +
    'prefixed (`prod-hero|...`) so its selection identity never collides with SkuCard/BestSellerCard.',
  rules: [
    'amount and currentPrice are required; every other prop is optional.',
    'loyaltyPoints !== null shows the "Loyalty Reward" row; loyaltyIcon only renders inside it when supplied.',
    'skuImage falls back to image — pass either one for the art panel.',
    'The RECOMMENDED tag always renders; there is no prop to hide it.',
  ],
  variants: [
    {
      name: 'Default',
      props: ({ assets }) => ({
        amount: 1000,
        currentPrice: '$9.99',
        label: 'Web One-Time Offer',
        subtitle: '1000 FC Points',
        skuImage: assets.content?.cpCoins?.[960] || assets.brand?.cpIcon,
      }),
    },
    {
      name: 'With loyalty reward',
      props: ({ assets }) => ({
        amount: 2600,
        currentPrice: '$19.99',
        label: 'Web One-Time Offer',
        subtitle: '2600 FC Points',
        loyaltyPoints: 500,
        loyaltyIcon: assets.brand?.loyaltyIcon,
        skuImage: assets.content?.cpCoins?.[2600] || assets.brand?.cpIcon,
      }),
    },
    {
      name: 'No subtitle',
      props: ({ assets }) => ({
        amount: 420,
        currentPrice: '$4.99',
        label: 'Web One-Time Offer',
        skuImage: assets.content?.cpCoins?.[420] || assets.brand?.cpIcon,
      }),
    },
  ],
})
