import { defineComponent, h } from 'vue'
import BundleGrid from '@/components/BundleGrid.vue'
import BundleSkuCard from '@/components/BundleSkuCard.vue'
import { defineStory } from '../story.js'

// BundleGrid takes no props at all — just a default slot of BundleSkuCard
// children (see App.vue / CategoryCatalog.vue). This wrapper supplies real
// bundle data so the 1-up → 2-up container-query behaviour is visible; its
// own `count` prop is a story-only knob, not part of BundleGrid's API.
function bundleItems (assets) {
  const coin = (i) => assets.content?.cpCoins?.[i] || assets.brand?.logomark
  return [
    { image: coin(160), rarity: 'legendary', tag: 'x3', quantity: 3 },
    { image: coin(960), rarity: 'epic', tag: 'x5', quantity: 5 },
    { image: coin(5400), rarity: 'rare', tag: 'x1', quantity: 1 },
  ]
}

function banner (assets) {
  return assets.content?.bannerMidnightSun || assets.content?.cpSkuBanner || assets.brand?.wordmark
}

function bundle (assets, i) {
  // The bundle title is assigned onto `out` below rather than written as a
  // `title` object-literal key here — the harness CLI's static regex parser
  // grabs the FIRST such literal in the whole file's source text to label
  // this story, so it must only ever match defineStory's own fields further down.
  const title = `BUNDLE OFFER ${i + 1}`
  const out = {
    bannerImage: banner(assets),
    currentPrice: '$0.99',
    originalPrice: '$1.99',
    discountPercent: '-50%',
    items: bundleItems(assets),
    skuImage: assets.content?.skuMidnightSunHero || assets.brand?.logomark,
    limitLabel: 'Limit: 1',
  }
  out.title = title
  return out
}

const BundleGridDemo = defineComponent({
  name: 'BundleGridStoryDemo',
  props: {
    count: { type: Number, default: 2 },
    assets: { type: Object, default: () => ({}) },
  },
  setup (props) {
    return () => h(BundleGrid, null, {
      default: () => Array.from({ length: props.count }, (_, i) =>
        h(BundleSkuCard, { key: i, ...bundle(props.assets, i), baseDelay: i * 120 })),
    })
  },
})

export default defineStory({
  id: 'bundle-grid',
  title: 'Bundle Grid',
  group: 'Layout',
  component: BundleGridDemo,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-default',
  ],
  states: ['default'],
  notes:
    'A plain CSS grid wrapper for BundleSkuCard rows: single column on XS/S, ' +
    '2-up from the 801px container breakpoint. It carries no props of its own — ' +
    'callers just drop BundleSkuCard children straight into the default slot ' +
    '(e.g. the Currency+Bonus and New Users Promo sections in App.vue, and ' +
    'CategoryCatalog\'s bundle subcategories). Typically holds 1-4 bundle cards ' +
    'per section; more than 4 simply wraps to additional rows at the same ' +
    '2-up cadence.',
  rules: [
    'BundleGrid takes no props — column count is purely a function of container width and child count.',
    'Children are expected to be BundleSkuCard (or equivalent) elements; the grid does not care about their content.',
    'A single child still renders inside the 2-up track and does not stretch to fill both columns.',
  ],
  variants: [
    {
      name: 'Single bundle',
      props: ({ assets }) => ({ count: 1, assets }),
    },
    {
      name: 'Two bundles (2-up)',
      props: ({ assets }) => ({ count: 2, assets }),
    },
    {
      name: 'Four bundles (wraps to 2 rows)',
      props: ({ assets }) => ({ count: 4, assets }),
    },
  ],
})
