import BestSellerCarousel from '@/components/BestSellerCarousel.vue'
import { defineStory } from '../story.js'

function coin(assets, i) {
  return assets.content?.cpCoins?.[i] || assets.brand?.cpIcon || assets.brand?.logomark
}

// BestSellerCard items forwarded via v-bind="item" — same shape as BestSellerCard's
// own props (amount/currentPrice required; bonus/discount fields are additive).
function items(assets, strings) {
  return [
    {
      amount: 528,
      baseAmount: 480,
      bonusAmount: 48,
      bonusLabel: strings.sku?.bonusLabel || 'WEB BONUS',
      currentPrice: '$4.99',
      originalPrice: '$9.99',
      discountPercent: '-50%',
      label: 'Starter Pack',
      image: coin(assets, 420),
    },
    {
      amount: 1200,
      currentPrice: '$9.99',
      label: 'Value Pack',
      image: coin(assets, 960),
    },
    {
      amount: 3200,
      baseAmount: 2800,
      bonusAmount: 400,
      bonusLabel: strings.sku?.bonusLabel || 'WEB BONUS',
      currentPrice: '$24.99',
      originalPrice: '$49.99',
      discountPercent: '-50%',
      label: 'Mega Pack',
      image: coin(assets, 11600),
    },
    {
      amount: 6400,
      currentPrice: '$49.99',
      label: 'Ultimate Pack',
      image: coin(assets, 5400),
    },
  ]
}

export default defineStory({
  id: 'best-seller-carousel',
  title: 'Best Seller Carousel',
  group: 'Carousels',
  component: BestSellerCarousel,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-default',
    '--x-gap-content-narrow',
    '--x-pad-surface-m',
    '--x-text-body-default',
    '--x-text-header-default',
    '--x-gap-content-tight',
    '--x-motion-sku-hover',
    '--x-motion-btn-activate',
    '--x-text-hyperlink-default',
  ],
  states: ['default', 'hover'],
  notes:
    'Horizontal row of compact BestSellerCards (showHeading=false) under a section ' +
    'heading with chevron nav. Cards are 62.5%-width on narrow containers (row always ' +
    'scrolls) and settle to 3-per-row at >=801px, at which point the chevrons ' +
    'auto-hide via hasOverflow. Scrolling is free-drag (useDragScroll — mouse ' +
    'click-drag with inertia, native touch pan-x) rather than snap; chevrons jump ' +
    '80% of the visible width with smooth scroll, disabled instantly at either end ' +
    'via ResizeObserver + scroll-position tracking. No autoplay.',
  rules: [
    'items is required — each entry is spread onto a compact BestSellerCard, so amount and currentPrice are mandatory per item.',
    'Chevrons render only when hasOverflow is true (content wider than the visible row); they hide themselves once every card fits.',
    'image/skuImage are carousel-level fallbacks used only for items missing their own image/skuImage.',
    'baseDelay staggers each card entrance by +90ms per index.',
  ],
  variants: [
    {
      name: 'Default (4 items)',
      props: ({ assets, strings }) => ({
        heading: 'BEST SELLERS',
        items: items(assets, strings),
        cpIcon: assets.brand?.cpIcon,
      }),
    },
    {
      name: 'With description',
      props: ({ assets, strings }) => ({
        heading: 'BEST SELLERS',
        description: 'Our most popular purchases this week.',
        items: items(assets, strings),
        cpIcon: assets.brand?.cpIcon,
      }),
    },
    {
      name: 'Overflow (8 items, scrollable)',
      props: ({ assets, strings }) => ({
        heading: 'BEST SELLERS',
        items: [...items(assets, strings), ...items(assets, strings)],
        cpIcon: assets.brand?.cpIcon,
      }),
    },
    {
      name: 'Single item (no scroll, chevrons hidden)',
      props: ({ assets, strings }) => ({
        heading: 'BEST SELLERS',
        items: items(assets, strings).slice(0, 1),
        cpIcon: assets.brand?.cpIcon,
      }),
    },
  ],
})
