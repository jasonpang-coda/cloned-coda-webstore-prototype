import BestSellerCard from '@/components/BestSellerCard.vue'
import { defineStory } from '../story.js'

function coin (assets, i) {
  return assets.content?.cpCoins?.[i] || assets.brand?.cpIcon || assets.brand?.logomark
}

export default defineStory({
  id: 'best-seller-card',
  title: 'Best Seller Card',
  group: 'Cards',
  component: BestSellerCard,
  tokens: [
    '--x-gap-content-default',
    '--x-text-header-default',
    '--x-text-body-default',
    '--x-hdr-hot',
    '--x-hdr-glow',
    '--x-radius-container-s',
    '--border-weight-default',
    '--x-border-warm',
    '--x-gradient-bestseller-hero',
    '--x-motion-sys-duration-slow',
    '--x-motion-sys-ease-decelerate',
    '--x-motion-sys-duration-base',
    '--x-motion-sku-hover',
    '--x-bg-card-selected',
    '--x-shadow-bestseller-selected',
    '--x-motion-sku-select',
    '--border-weight-selected',
    '--x-border-sku-card-selected',
    '--x-shadow-bestseller',
    '--x-motion-sku-press',
    '--x-pad-surface-s',
    '--x-gradient-bestseller-hero-hover',
    '--x-gradient-bestseller-metallic-shine',
    '--x-fx-bestseller-shimmer-opacity',
    '--x-motion-sku-shimmer',
    '--x-motion-sys-ease-linear',
    '--x-pad-surface-xs',
    '--x-pad-surface-l',
    '--x-gradient-bestseller-vignette',
    '--x-gap-content-narrow',
    '--x-text-icon-faint',
    '--x-pad-surface-xxs',
    '--x-gap-content-tight',
    '--x-text-warning-default',
    '--x-text-error-default',
    '--x-text-bonus-amount',
    '--x-text-success-default',
    '--x-text-hyperlink-default',
  ],
  states: ['default', 'hover'],
  notes:
    'The hero "best seller" card. By default it renders its own BEST SELLER ' +
    'heading above the card; set showHeading=false for the compact variant used ' +
    'inside the BestSellerCarousel. The compact variant drops the bloom and uses ' +
    'a shorter image.',
  rules: [
    'amount and currentPrice are required.',
    'showHeading controls the section heading; description is section-level copy, not card content.',
    'compact is for the carousel context — shorter image, no bloom.',
  ],
  variants: [
    {
      name: 'Hero',
      props: ({ assets, strings }) => ({
        amount: 3200,
        baseAmount: 2800,
        bonusAmount: 400,
        bonusLabel: strings.sku?.bonusLabel || 'WEB BONUS',
        currentPrice: '$24.99',
        originalPrice: '$49.99',
        discountPercent: '-50%',
        label: 'Mega Pack',
        subtitle: 'Most popular this week',
        showHeading: true,
        image: coin(assets, 11600),
        skuImage: coin(assets, 11600),
      }),
    },
    {
      name: 'Compact',
      props: ({ assets, strings }) => ({
        amount: 1200,
        currentPrice: '$9.99',
        currencyLabel: strings.currency?.name || '',
        label: 'Starter Pack',
        subtitle: 'Great value',
        compact: true,
        showHeading: false,
        image: coin(assets, 960),
        skuImage: coin(assets, 960),
      }),
    },
  ],
})
