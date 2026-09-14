import FeaturedCarousel from '@/components/FeaturedCarousel.vue'
import { defineStory } from '../story.js'

// BundleSkuCard items forwarded via v-bind="item" — bannerImage/title/currentPrice
// are required per item since BundleSkuCard itself requires them.
function childItems(assets) {
  const coin = (i) => assets.content?.cpCoins?.[i] || assets.brand?.logomark
  return [
    { image: coin(160), rarity: 'legendary', tag: 'x3', quantity: 3 },
    { image: coin(960), rarity: 'epic', tag: 'x5', quantity: 5 },
  ]
}

function banner(assets) {
  return assets.content?.bannerMidnightSun
    || assets.content?.cpSkuBanner
    || assets.brand?.wordmark
}

function items(assets) {
  return [
    {
      bannerImage: banner(assets),
      title: 'MIDNIGHT SUN BUNDLE',
      currentPrice: '$0.99',
      originalPrice: '$1.99',
      discountPercent: '-50%',
      items: childItems(assets),
      skuImage: assets.content?.skuMidnightSunHero || assets.brand?.logomark,
      limitLabel: 'Limit: 1',
    },
    {
      bannerImage: banner(assets),
      title: 'LIMITED EVENT BUNDLE',
      subtitle: 'Available for a limited time',
      currentPrice: '$2.99',
      originalPrice: '$5.99',
      discountPercent: '-50%',
      items: childItems(assets),
      skuImage: assets.content?.skuMidnightSunHero || assets.brand?.logomark,
      endsAt: Date.now() + 26 * 60 * 60 * 1000,
    },
    {
      bannerImage: banner(assets),
      title: 'DAILY STRONGBOX',
      currentPrice: 'FREE',
      items: childItems(assets),
      claimed: true,
      refreshesOnClaim: true,
      endsAt: Date.now() + 8 * 60 * 60 * 1000,
    },
  ]
}

export default defineStory({
  id: 'featured-carousel',
  title: 'Featured Carousel',
  group: 'Carousels',
  component: FeaturedCarousel,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-default',
    '--x-pad-surface-m',
    '--x-text-header-default',
    '--x-gap-content-tight',
    '--x-size-icon-l',
    '--x-motion-sku-hover',
    '--x-motion-btn-activate',
    '--x-text-hyperlink-default',
  ],
  states: ['default', 'hover'],
  notes:
    'Horizontal row of full BundleSkuCards under a section heading with chevron ' +
    'nav — the bundle-focused sibling of BestSellerCarousel. Cards are 72%-width on ' +
    'narrow containers (always scrolls) and settle to 3-per-row at >=801px, ' +
    'hiding the chevrons once the row no longer overflows. Same free-drag ' +
    'scrolling (useDragScroll, inertia + native touch pan-x, no scroll-snap) and ' +
    'chevron-jumps-80%-of-width behavior as BestSellerCarousel. No autoplay.',
  rules: [
    'items is required — each entry is spread onto a BundleSkuCard, so bannerImage, title and currentPrice are mandatory per item.',
    'Chevrons render only when the row actually overflows (hasOverflow), and disable individually at either scroll extreme.',
    'baseDelay staggers each card entrance by +90ms per index.',
  ],
  variants: [
    {
      name: 'Default (3 bundles)',
      props: ({ assets }) => ({
        heading: 'FEATURED BUNDLES',
        items: items(assets),
      }),
    },
    {
      name: 'Overflow (6 bundles, scrollable)',
      props: ({ assets }) => ({
        heading: 'FEATURED BUNDLES',
        items: [...items(assets), ...items(assets)],
      }),
    },
    {
      name: 'Single bundle (no scroll, chevrons hidden)',
      props: ({ assets }) => ({
        heading: 'FEATURED BUNDLES',
        items: items(assets).slice(0, 1),
      }),
    },
  ],
})
