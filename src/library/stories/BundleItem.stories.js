import BundleItem from '@/components/BundleItem.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'bundle-item',
  title: 'Bundle Item',
  group: 'Cards',
  component: BundleItem,
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-rarity-gradient-neutral',
    '--x-pad-surface-xs',
    '--x-radius-container-xs',
    '--x-border-sku-card-default',
    '--x-pad-surface-xxs',
    '--x-radius-control-xs',
    '--x-bg-indicator-neutral-default',
    '--x-text-body-default',
  ],
  notes:
    'One child SKU tile inside a bundle\'s breakdown row (BundleBreakdown, used by BundleSkuCard, ' +
    'BestSellerCard and SkuImageCard). Shows the square SKU image on a rarity-graded background ' +
    'with an optional tag pill (e.g. Bonus / Loyalty) straddling the top edge and a quantity badge ' +
    'in the bottom-right. `tileBg` is polymorphic — a CSS gradient/colour string is used verbatim, ' +
    'an image URL is detected by path pattern and auto-wrapped with `center / cover` sizing. ' +
    'Emits `select` on click and does not stop propagation, so a host can bubble the tap up. No ' +
    'image renders a null-sized 58.8×58.8 empty placeholder tile.',
  rules: [
    'All props are optional — image null renders an empty placeholder tile.',
    'tileBg null falls back to the neutral rarity gradient; pass a --x-rarity-gradient-* value or raw image URL for graded rarity.',
    'tag expects { label, variant } (variant defaults to "value") — omit to hide the pill entirely.',
    'quantity !== null shows the bottom-right badge; pass a Number or String.',
  ],
  variants: [
    {
      name: 'Default',
      props: ({ assets }) => ({
        image: assets.content?.cpCoins?.[160] || assets.brand?.cpIcon,
        quantity: 5,
      }),
    },
    {
      name: 'With bonus tag',
      props: ({ assets, strings }) => ({
        image: assets.content?.cpCoins?.[420] || assets.brand?.cpIcon,
        tag: { label: strings.sku?.bonusLabel || 'BONUS', variant: 'value' },
        quantity: 1,
      }),
    },
    {
      name: 'Rare rarity',
      props: ({ assets }) => ({
        image: assets.content?.skuVmpJudgementDay || assets.content?.skuCrate,
        tileBg: 'var(--x-rarity-gradient-rare)',
        quantity: 1,
      }),
    },
    {
      name: 'Empty placeholder',
      props: () => ({
        image: null,
      }),
    },
  ],
})
