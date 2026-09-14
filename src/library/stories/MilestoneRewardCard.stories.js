import MilestoneRewardCard from '@/components/MilestoneRewardCard.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'milestone-reward-card',
  title: 'Milestone Reward Card',
  group: 'Cards',
  component: MilestoneRewardCard,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-pad-surface-m',
    '--x-pad-surface-s',
    '--x-pad-surface-l',
    '--x-gap-content-default',
    '--x-radius-container-s',
    '--x-blur-container',
    '--x-shadow-card',
    '--x-motion-sys-duration-slow',
    '--x-motion-sys-ease-decelerate',
    '--x-motion-sku-hover',
    '--x-shadow-card-hover',
    '--x-motion-sku-hover-in',
    '--x-border-sku-card-hover',
    '--x-motion-sku-press-scale',
    '--x-motion-sku-press',
    '--x-shadow-card-selected',
    '--x-motion-sku-select',
    '--x-border-sku-card-selected',
    '--x-border-sku-card-default',
    '--x-bg-sku-card-default',
    '--x-motion-sys-duration-base',
    '--x-bg-card-selected',
    '--x-fx-gradient-muted-blue',
    '--x-gap-content-tight',
    '--x-text-header-default',
    '--x-border-divider',
    '--x-text-body-default',
    '--x-motion-sys-ease-standard',
    '--x-size-img-xxl',
    '--x-size-control-m',
    '--x-radius-control-full',
    '--x-bg-action-primary',
    '--x-text-on-primary',
    '--x-bg-action-secondary',
    '--x-text-body-soft',
    '--x-size-icon-xs',
  ],
  notes:
    'One reward tile in the Milestone Rewards rail (layout adapted from the PvZ3 "SKU Box" reward ' +
    'card, Figma node 5131:261345). Three states drive both the CTA and interactivity: `claimable` ' +
    'is tappable and opens the shared gift-claim sheet (useGiftClaim — the same composable FCM\'s ' +
    'Gifts tab uses); `locked` shows a dim MP progress fraction and is not tappable; `claimed` dims ' +
    'the reward art and shows a static CLAIMED label. `isFinalTier` swaps the fill for a muted-blue ' +
    'gradient plus a bloom halo while not yet claimed, marking the headline (Champion) prize as special.',
  rules: [
    'id, image and title are required; id is the stable claim identity keyed against useGiftClaim().isClaimed().',
    'progress/threshold only render (as a fraction) when state is locked.',
    'Only claimable cards respond to hover/press/tap — locked and claimed are inert.',
    'isFinalTier only changes appearance while the tier is not yet claimed; once claimed it matches every other tier.',
  ],
  variants: [
    {
      name: 'Claimable',
      props: ({ assets }) => ({
        id: 'milestone-3',
        image: assets.content?.giftGun || assets.content?.skuCrate,
        title: 'Tactical Operator Crate',
        subtitle: '3rd Reward',
        state: 'claimable',
      }),
    },
    {
      name: 'Locked',
      props: ({ assets }) => ({
        id: 'milestone-5',
        image: assets.content?.giftSecretCache || assets.content?.skuCrate,
        title: 'Epic Secret Cache',
        subtitle: '5th Reward',
        state: 'locked',
        progress: 3200,
        threshold: 5000,
      }),
    },
    {
      name: 'Claimed',
      props: ({ assets }) => ({
        id: 'milestone-1',
        image: assets.content?.giftEmote || assets.content?.skuCrate,
        title: 'Affirmative Emote',
        subtitle: '1st Reward',
        state: 'claimed',
      }),
    },
    {
      name: 'Final tier (locked, special)',
      props: ({ assets }) => ({
        id: 'milestone-10',
        image: assets.content?.skuVmpJudgementDay || assets.content?.skuCrate,
        title: 'Champion',
        subtitle: '10th Reward',
        state: 'locked',
        progress: 8400,
        threshold: 10000,
        isFinalTier: true,
      }),
    },
  ],
})
