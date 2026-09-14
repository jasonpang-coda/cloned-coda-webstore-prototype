import SkuImageList from '@/components/SkuImageList.vue'
import { defineStory } from '../story.js'

function coin (assets, i) {
  return assets.content?.cpCoins?.[i] || assets.brand?.cpIcon || assets.brand?.logomark
}

function items (assets, n) {
  const amounts = [400, 1000, 2400, 5000, 11600]
  const prices = ['$3.99', '$9.99', '$19.99', '$39.99', '$79.99']
  return Array.from({ length: n }, (_, i) => ({
    amount: amounts[i % amounts.length],
    currentPrice: prices[i % prices.length],
    skuImage: coin(assets, amounts[i % amounts.length]),
  }))
}

export default defineStory({
  id: 'sku-image-list',
  title: 'Sku Image List',
  group: 'Layout',
  component: SkuImageList,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-loose',
    '--x-gap-content-narrow',
    '--x-text-header-default',
    '--x-sku-image-list-title-size',
    '--x-text-body-soft',
    '--x-gap-content-default',
  ],
  states: ['default'],
  notes:
    'The SkuImageCard-only sibling of SkuList — same titled-section shape, ' +
    'but items are spread onto SkuImageCard rather than SkuCard (a different ' +
    'prop set: currencyLabel/variant/loyaltyIcon instead of cpIcon/row layout). ' +
    'Grid is fixed (no `columns` override like SkuList): 2 columns on XS, 4 at ' +
    '≥ 641px. The `wide` prop switches to fewer, bigger cards (1 col mobile, ' +
    '2 at ≥ 641px — the same ratio as BundleGrid) for a featured row that ' +
    'wants more visual weight per card, independent of the `variant` art ' +
    'treatment. An optional description line renders under the title.',
  rules: [
    'items is required — each element is v-bound straight onto a SkuImageCard, so it must carry that card\'s prop shape (currentPrice at minimum).',
    'variant ("panel" | "background") and currencyLabel/loyaltyIcon are shared by every card in the list — set them once here, not per item.',
    'wide is independent of variant — it only changes column count/card size, not the art treatment.',
    'description only renders when title is also set (the header block is skipped entirely when both are empty).',
  ],
  variants: [
    {
      name: 'Panel (2→4 up)',
      props: ({ assets, strings }) => ({
        title: strings.page?.cpHeading || 'CP',
        description: strings.page?.cpDesc || null,
        items: items(assets, 6),
        currencyLabel: strings.currency?.name || 'CP',
        variant: 'panel',
      }),
    },
    {
      name: 'Background variant',
      props: ({ assets, strings }) => ({
        title: strings.page?.cpHeading || 'CP',
        items: items(assets, 4).map((it) => ({ ...it, backgroundImage: assets.content?.cpCategoryBg || it.skuImage })),
        currencyLabel: strings.currency?.name || 'CP',
        variant: 'background',
      }),
    },
    {
      name: 'Wide (featured row, 1→2 up)',
      props: ({ assets, strings }) => ({
        title: strings.page?.bestSellersHeading || 'Best Sellers',
        items: items(assets, 2),
        currencyLabel: strings.currency?.name || 'CP',
        variant: 'panel',
        wide: true,
      }),
    },
  ],
})
