import SkuCard from '@/components/SkuCard.vue'
import { defineStory } from '../story.js'

// Build a representative child-item breakdown row from whatever coin/content
// art the active store ships, falling back to the brand mark so it renders on
// any theme. Shape matches BundleItem's real props (tileBg, not the stale
// `rarity` key BundleSkuCard's story still uses).
function items (assets) {
  const coin = (i) => assets.content?.cpCoins?.[i] || assets.brand?.logomark
  return [
    { image: coin(160), tag: { label: 'x3', variant: 'value' }, quantity: 3 },
    { image: coin(960), tag: { label: 'x5', variant: 'value' }, quantity: 5 },
    { image: coin(5400), tag: { label: 'x1', variant: 'value' }, quantity: 1 },
  ]
}

export default defineStory({
  id: 'sku-card',
  title: 'SKU Card',
  group: 'Cards',
  component: SkuCard,
  tokens: [
    '--x-gap-content-narrow',
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
    '--x-shadow-card-hover',
    '--x-motion-sku-hover-in',
    '--x-border-sku-card-hover',
    '--x-border-sku-card-selected',
    '--border-weight-selected',
    '--x-shadow-card-selected',
    '--x-motion-sku-select',
    '--x-motion-sku-press-scale',
    '--x-motion-sku-press',
    '--x-bg-sku-card-default',
    '--x-motion-sys-duration-base',
    '--x-bg-card-selected',
    '--x-gap-content-default',
    '--x-gap-content-tight',
    '--x-motion-sys-ease-spring',
    '--x-text-header-default',
    '--x-text-icon-muted',
    '--x-text-body-default',
    '--x-text-bonus-amount',
    '--x-text-success-default',
    '--x-text-hyperlink-default',
    '--x-fx-metal-sheen',
    '--x-fx-metal-fill',
    '--x-fx-metal-edge',
    '--x-fx-plastic-fill',
    '--x-fx-plastic-edge',
    '--x-fx-plastic-sheen',
    '--x-motion-shimmer-sweep',
    '--x-fx-carbon-sheen',
    '--x-fx-carbon-fill',
    '--x-fx-carbon-edge',
  ],
  states: ['default', 'hover', 'pressed'],
  notes:
    'The standard currency / CP card. Tapping opens the checkout sheet via ' +
    'useCheckout() (a no-op until the account is identified). The bonus chip, ' +
    'crossed-out price and discount badge are all optional and render only when ' +
    'their props are supplied. `layout: "row"` switches the vertical column to a ' +
    'horizontal row with the price pinned right — used in dense lists.',
  rules: [
    "BundleItem's tag pill straddles -8px above its tile; .sku-card__breakdown must keep padding-top: var(--x-pad-surface-s) (8px) in BOTH column and row layouts so the pill has clearance above the bonus/subtitle sibling above it — a positioned box (position:relative) always paints over a non-positioned in-flow sibling it visually overlaps, so shrinking this padding back toward the bare flex gap (4px/2px) silently reintroduces the pill overlapping that text.",
    "The metal/plastic/carbonFibre material variants read --x-fx-metal/plastic/carbon-* tokens defined only in themes/codashop.css (the sole store with skuCard.materialExploration enabled); with no var() fallback, harness test all fails UNRESOLVED_MANDATORY_TOKEN in every other store even though the modifier classes never actually apply there. Fix: fall back to the card's own --x-bg-sku-card-default/--x-border-sku-card-default for fill/edge and transparent for sheen layers, so any theme resolves safely without diluting Codashop's authored values.",
    'Never show the bonus line without a baseAmount — the breakdown needs both.',
    'isBestValue renders the default BEST VALUE badge; tagLabel overrides it with custom text.',
    'currentPrice and amount are required; everything else is additive.',
    'items renders a BundleBreakdown row (scrollable) below the amount/bonus/subtitle block — shape [{ image, tileBg, tag, quantity }], same as SkuImageCard/BestSellerCard.',
  ],
  variants: [
    {
      name: 'Default',
      props: ({ assets }) => ({
        amount: 420,
        currentPrice: '$4.99',
        cpIcon: assets.brand?.cpIcon,
        skuImage: assets.content?.cpCoins?.[160] || assets.brand?.cpIcon,
      }),
    },
    {
      name: 'With bonus',
      props: ({ assets, strings }) => ({
        amount: 528,
        baseAmount: 480,
        bonusAmount: 48,
        bonusLabel: strings.sku?.bonusLabel || 'WEB BONUS',
        currentPrice: '$4.99',
        originalPrice: '$9.99',
        discountPercent: '-50%',
        cpIcon: assets.brand?.cpIcon,
        skuImage: assets.content?.cpCoins?.[420] || assets.brand?.cpIcon,
      }),
    },
    {
      name: 'Best value',
      props: ({ assets, strings }) => ({
        amount: 2400,
        baseAmount: 2000,
        bonusAmount: 400,
        bonusLabel: strings.sku?.bonusLabel || 'WEB BONUS',
        currentPrice: '$19.99',
        originalPrice: '$39.99',
        discountPercent: '-50%',
        isBestValue: true,
        cpIcon: assets.brand?.cpIcon,
        skuImage: assets.content?.cpCoins?.[5400] || assets.brand?.cpIcon,
      }),
    },
    {
      name: 'Row layout',
      props: ({ assets, strings }) => ({
        amount: 528,
        baseAmount: 480,
        bonusAmount: 48,
        bonusLabel: strings.sku?.bonusLabel || 'WEB BONUS',
        currentPrice: '$4.99',
        originalPrice: '$9.99',
        discountPercent: '-50%',
        layout: 'row',
        cpIcon: assets.brand?.cpIcon,
        skuImage: assets.content?.cpCoins?.[420] || assets.brand?.cpIcon,
      }),
    },
    {
      name: 'With child breakdown',
      props: ({ assets, strings }) => ({
        amount: 2400,
        baseAmount: 2000,
        bonusAmount: 400,
        bonusLabel: strings.sku?.bonusLabel || 'WEB BONUS',
        currentPrice: '$19.99',
        originalPrice: '$39.99',
        discountPercent: '-50%',
        isBestValue: true,
        cpIcon: assets.brand?.cpIcon,
        skuImage: assets.content?.cpCoins?.[5400] || assets.brand?.cpIcon,
        items: items(assets),
      }),
    },
    {
      name: 'With child breakdown (row)',
      props: ({ assets, strings }) => ({
        amount: 528,
        baseAmount: 480,
        bonusAmount: 48,
        bonusLabel: strings.sku?.bonusLabel || 'WEB BONUS',
        currentPrice: '$4.99',
        originalPrice: '$9.99',
        discountPercent: '-50%',
        layout: 'row',
        cpIcon: assets.brand?.cpIcon,
        skuImage: assets.content?.cpCoins?.[420] || assets.brand?.cpIcon,
        items: items(assets),
      }),
    },
  ],
})
