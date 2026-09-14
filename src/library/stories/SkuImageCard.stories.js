import SkuImageCard from '@/components/SkuImageCard.vue'
import { defineStory } from '../story.js'

function coin (assets, i) {
  return assets.content?.cpCoins?.[i] || assets.brand?.cpIcon || assets.brand?.logomark
}

export default defineStory({
  id: 'sku-image-card',
  title: 'SKU Image Card',
  group: 'Cards',
  component: SkuImageCard,
  tokens: [
    '--x-gap-content-loose',
    '--x-sku-image-pad-top',
    '--x-pad-surface-m',
    '--x-pad-surface-s',
    '--x-pad-surface-l',
    '--x-radius-container-s',
    '--x-blur-container',
    '--x-shadow-card',
    '--x-motion-sys-duration-slow',
    '--x-motion-sys-ease-decelerate',
    '--x-motion-sku-hover',
    '--border-weight-default',
    '--x-border-sku-card-default',
    '--x-motion-sys-distance-sm',
    '--x-shadow-card-hover',
    '--x-motion-sku-hover-in',
    '--x-border-sku-card-hover',
    '--x-border-sku-card-selected',
    '--border-weight-selected',
    '--x-motion-sku-press-scale',
    '--x-motion-sku-press',
    '--x-mask-sku-card-bg-fade',
    '--x-bg-sku-card-default',
    '--x-motion-sys-duration-base',
    '--x-bg-card-selected',
    '--x-gradient-sku-image-card-fade',
    '--x-pad-surface-xs',
    '--x-sku-image-aspect',
    '--x-radius-container-xs',
    '--x-sku-image-gap-adjust',
    '--x-border-sku-card-prod',
    '--x-bg-image-sku-card-prod',
    '--x-gap-content-tight',
    '--x-sys-weight-bold',
    '--x-text-body-default',
    '--x-sys-weight-regular',
    '--x-text-header-default',
    '--x-bg-sku-card-prod-reward',
    '--x-gradient-sku-card-prod-price',
    '--x-text-body-inverse',
    '--x-gap-content-narrow',
    '--x-text-hyperlink-default',
    '--x-text-hyperlink-hover',
    '--x-text-bonus-amount',
    '--x-text-success-default',
  ],
  states: ['default', 'hover', 'pressed'],
  notes:
    'Image-led SKU card. The "panel" variant renders the product art on a card ' +
    'surface; the "background" variant uses backgroundImage as a full-bleed bed ' +
    'beneath an L1 scrim. amount is optional (null for non-numeric SKUs); ' +
    'currencyLabel appends the store currency name after the amount.',
  rules: [
    'currentPrice is required; amount may be null for non-numeric SKUs.',
    'variant "background" needs backgroundImage; "panel" uses skuImage as art.',
    'isBestValue shows the default badge; tagLabel renders a custom SkuTag instead.',
  ],
  variants: [
    {
      name: 'Panel',
      props: ({ assets, strings }) => ({
        amount: 1000,
        currencyLabel: strings.currency?.name || '',
        currentPrice: '$9.99',
        variant: 'panel',
        skuImage: coin(assets, 2600),
      }),
    },
    {
      name: 'Background',
      props: ({ assets, strings }) => ({
        amount: 2400,
        currencyLabel: strings.currency?.name || '',
        currentPrice: '$19.99',
        variant: 'background',
        skuImage: coin(assets, 5400),
        backgroundImage: assets.content?.cpCategoryBg || coin(assets, 5400),
      }),
    },
    {
      name: 'Best value',
      props: ({ assets, strings }) => ({
        amount: 5000,
        currencyLabel: strings.currency?.name || '',
        currentPrice: '$49.99',
        originalPrice: '$79.99',
        discountPercent: '-37%',
        isBestValue: true,
        variant: 'panel',
        skuImage: coin(assets, 11600),
      }),
    },
  ],
})
