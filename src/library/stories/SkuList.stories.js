import SkuList from '@/components/SkuList.vue'
import { defineStory } from '../story.js'

function coin (assets, i) {
  return assets.content?.cpCoins?.[i] || assets.brand?.cpIcon || assets.brand?.logomark
}

function items (assets, n) {
  const amounts = [160, 420, 960, 2400, 5400, 11600]
  const prices = ['$1.99', '$4.99', '$9.99', '$19.99', '$39.99', '$79.99']
  return Array.from({ length: n }, (_, i) => ({
    amount: amounts[i % amounts.length],
    currentPrice: prices[i % prices.length],
    skuImage: coin(assets, amounts[i % amounts.length]),
  }))
}

export default defineStory({
  id: 'sku-list',
  title: 'Sku List',
  group: 'Layout',
  component: SkuList,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-loose',
    '--x-text-header-default',
    '--x-gap-content-default',
  ],
  states: ['default'],
  notes:
    'A titled section of SkuCard children with three arrangements: the ' +
    'default "wrap" grid (2 columns on XS, auto-filling 4-up at ≥ 641px, ' +
    'flexing down when 4 fixed columns would not actually fit), "columns" ' +
    '(a fixed 1-col mobile → 2-col ≥ 801px grid), and "stack" (a single ' +
    'full-width column of horizontal "row"-layout cards at every width). Each ' +
    'item in `items` is spread directly onto a SkuCard via v-bind, so it takes ' +
    'the same prop shape as SkuCard itself (amount, currentPrice, skuImage, ' +
    'bonus fields, etc). Cards get a staggered 90ms entrance delay, offset by ' +
    'the section-level baseDelay.',
  rules: [
    'items is required — each element is v-bound straight onto a SkuCard, so it must carry SkuCard\'s own prop shape (amount + currentPrice at minimum).',
    'columns overrides the default 4-up count at ≥ 641px; it is ignored when layout is "columns" or "stack", which have their own fixed arrangements.',
    'layout "columns"/"stack" also force every card into SkuCard\'s row layout — do not additionally pass layout on individual items.',
    'An item\'s own skuImage/cpIcon (item.skuImage) overrides the list-level skuImage/cpIcon prop shared by every card.',
  ],
  variants: [
    {
      name: 'Wrap (default, 2→4 up)',
      props: ({ assets, strings }) => ({
        title: strings.page?.cpHeading || 'CP',
        items: items(assets, 6),
        cpIcon: assets.brand?.cpIcon,
      }),
    },
    {
      name: 'Explicit 5-up (Codashop Select Recharge)',
      props: ({ assets, strings }) => ({
        title: strings.page?.cpHeading || 'Select Recharge',
        items: items(assets, 5),
        cpIcon: assets.brand?.cpIcon,
        columns: 5,
      }),
    },
    {
      name: 'Columns (stacked → 2-up)',
      props: ({ assets, strings }) => ({
        title: strings.page?.cpHeading || 'CP',
        items: items(assets, 4),
        cpIcon: assets.brand?.cpIcon,
        layout: 'columns',
      }),
    },
    {
      name: 'Stack (single column, row cards)',
      props: ({ assets, strings }) => ({
        title: strings.page?.cpHeading || 'CP',
        items: items(assets, 3),
        cpIcon: assets.brand?.cpIcon,
        layout: 'stack',
      }),
    },
  ],
})
