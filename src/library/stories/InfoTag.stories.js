import InfoTag from '@/components/InfoTag.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'info-tag',
  title: 'Info Tag',
  group: 'Atoms',
  component: InfoTag,
  tokens: [
    '--x-gap-content-narrow',
    '--x-pad-surface-xs',
    '--x-radius-badge-s',
    '--x-border-tag-neutral',
    '--x-bg-tag-neutral',
    '--x-text-header-inverse',
    '--x-border-tag-success',
    '--x-bg-tag-success',
    '--x-text-success-default',
    '--x-sys-weight-bold',
  ],
  states: ['default'],
  notes:
    'An icon+label informational chip with a subtle bordered fill, used by TrustBar ' +
    '(e.g. "Delivered or your money back") and CompactHero for short reassurance or ' +
    'callout copy. A third, distinct tag family alongside the marketing SkuTag and ' +
    'the bordered transaction StatusTag. The icon is optional — omitting it renders ' +
    'a label-only pill.',
  rules: [
    'label is required.',
    'icon is optional — a MaterialIcon name; omit to render label-only.',
    'iconVariant defaults to "round" and is passed straight through to MaterialIcon.',
    'variant is "neutral" (default, bordered grey fill with inverse text) or ' +
      '"success" (green, reuses the same -success tokens as SkuTag\'s success variant).',
  ],
  variants: [
    {
      name: 'Neutral, with icon',
      props: { icon: 'schedule', label: 'Delivered in 24h', variant: 'neutral' },
    },
    {
      name: 'Success, with icon',
      props: { icon: 'verified_user', label: 'Money-back guarantee', variant: 'success' },
    },
    {
      name: 'Label only',
      props: { label: 'Secure checkout', variant: 'neutral' },
    },
  ],
})
