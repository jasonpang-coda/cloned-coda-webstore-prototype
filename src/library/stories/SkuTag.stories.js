import SkuTag from '@/components/SkuTag.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'sku-tag',
  title: 'SKU Tag',
  group: 'Atoms',
  component: SkuTag,
  tokens: [
    '--x-pad-surface-xxs',
    '--x-radius-container-xs',
    '--x-bg-tag-bonus',
    '--x-text-tag-bonus',
    '--x-bg-tag-success',
    '--x-text-success-default',
  ],
  states: ['default'],
  notes:
    'The shared pill badge used across SKU / Bundle / Gift cards. Provides ' +
    'consistent display, padding, radius and per-variant colours; positioning is ' +
    'the consumer\'s responsibility (absolute on BundleItem / GiftSkuCard, in flow ' +
    'on SkuCard). The inner label is condensed via an inner span so the badge ' +
    'background is never scaled.',
  rules: [
    'label is required.',
    'variant "bonus" and "value" share the bonus colours; "success" is the green FREE GIFT pill.',
    'Do not scale the pill itself for Hitmarker condense — condense the inner text span.',
  ],
  variants: [
    { name: 'Bonus',   props: { label: 'BONUS',      variant: 'bonus' } },
    { name: 'Value',   props: { label: 'BEST VALUE', variant: 'value' } },
    { name: 'Success', props: { label: 'FREE GIFT',  variant: 'success' } },
  ],
})
