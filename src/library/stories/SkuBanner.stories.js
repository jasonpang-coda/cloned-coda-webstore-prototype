import SkuBanner from '@/components/SkuBanner.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'sku-banner',
  title: 'Sku Banner',
  group: 'Cards',
  component: SkuBanner,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-default',
    '--x-radius-container-xs',
    '--x-bg-sku-card-default',
    '--x-border-sku-card-default',
    '--x-pad-surface-xxs',
    '--x-gap-content-tight',
    '--x-text-header-default',
    '--x-text-body-default',
  ],
  states: ['default'],
  notes:
    'Read-only L1 pane summarizing one SKU (art + amount + bonus breakdown), ' +
    'with an optional corner tag — grounded in OrderCompletePage\'s Order ' +
    'Summary banner. NOT a reuse of SkuCard/SkuImageCard, which are both ' +
    'full interactive product cards (click-to-checkout, hover/press states); ' +
    'this is purely presentational. amountText/bonusText arrive pre-formatted ' +
    'from the caller, same contract as TransactionCard\'s date/total.',
  rules: [
    'amountText is required; image, bonusText and tagLabel are all optional.',
    'Does no number formatting itself — the caller formats amount/bonus into display strings.',
    'Border uses the same mask-composite gradient-ring technique as SkuCard/BundleItem, not a plain border-color.',
  ],
  variants: [
    {
      name: 'Default',
      props: ({ assets, strings }) => ({
        image: assets.content?.cpCoins?.[460] || assets.brand?.cpIcon,
        imageAlt: strings.currency?.name,
        amountText: `460 ${strings.currency?.abbr || 'CP'}`,
        bonusText: '(400 + 60 WEB BONUS)',
      }),
    },
    {
      name: 'New user tag, no bonus',
      props: ({ assets, strings }) => ({
        image: assets.content?.cpCoins?.[88] || assets.brand?.cpIcon,
        imageAlt: strings.currency?.name,
        amountText: `88 ${strings.currency?.abbr || 'CP'}`,
        tagLabel: 'NEW USER',
      }),
    },
  ],
})
