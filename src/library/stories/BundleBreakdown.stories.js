import BundleBreakdown from '@/components/BundleBreakdown.vue'
import { defineStory } from '../story.js'

// Same "whatever coin/content art the active store ships" fallback pattern
// used by BundleItem.stories.js / BundleSkuCard.stories.js.
function coin (assets, i) {
  return assets.content?.cpCoins?.[i] || assets.brand?.cpIcon || assets.brand?.logomark
}

export default defineStory({
  id: 'bundle-breakdown',
  title: 'Bundle Breakdown',
  group: 'Content',
  component: BundleBreakdown,
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-narrow',
  ],
  notes:
    'The row of child SKU tiles ("what\'s inside") shared by every card that can surface bundled ' +
    'items — BundleSkuCard, BestSellerCard and SkuImageCard. Owns the flex row, the BundleItem loop ' +
    'and (when scrollable) a horizontal drag-scroll via useDragScroll(). Renders nothing (no root ' +
    'element at all) when items is empty, so a host can mount it unconditionally without an ' +
    'extra v-if. Clicking a tile emits `select` with the click event, which the host forwards to ' +
    'open the Item Summary sheet.',
  rules: [
    'items is the only real driver of content — each entry is passed straight through to BundleItem: { image, tileBg, tag: { label, variant }, quantity }.',
    'Renders nothing when items is empty — hosts do not need to guard with v-if.',
    'scrollable=true switches from wrapping/overflowing to a horizontal drag-scroll row (scrollbar hidden) — use it when the item set is wider than its host card.',
    'A class passed by the host falls through to the root and merges with the component\'s own layout styles (used for overlap margin / inset padding tuning).',
  ],
  variants: [
    {
      name: 'Default (3 items)',
      props: ({ assets, strings }) => ({
        items: [
          { image: coin(assets, 160), quantity: 3 },
          { image: coin(assets, 960), tag: { label: strings.sku?.bonusLabel || 'BONUS', variant: 'value' }, quantity: 5 },
          { image: coin(assets, 5400), quantity: 1 },
        ],
      }),
    },
    {
      name: 'Graded rarities',
      props: ({ assets }) => ({
        items: [
          { image: assets.content?.skuCrate || coin(assets, 160), tileBg: 'var(--x-rarity-gradient-legendary)', quantity: 1 },
          { image: assets.content?.skuVmpJudgementDay || coin(assets, 420), tileBg: 'var(--x-rarity-gradient-rare)', quantity: 1 },
          { image: coin(assets, 960), quantity: 1 },
        ],
      }),
    },
    {
      name: 'Scrollable (wide set)',
      props: ({ assets, strings }) => ({
        scrollable: true,
        items: [
          { image: coin(assets, 160), quantity: 1 },
          { image: coin(assets, 420), quantity: 1 },
          { image: coin(assets, 960), tag: { label: strings.sku?.bonusLabel || 'BONUS' }, quantity: 1 },
          { image: coin(assets, 2400), quantity: 1 },
          { image: coin(assets, 5400), quantity: 1 },
          { image: coin(assets, 160), quantity: 99 },
        ],
      }),
    },
    {
      name: 'Empty (renders nothing)',
      props: () => ({
        items: [],
      }),
    },
  ],
})
