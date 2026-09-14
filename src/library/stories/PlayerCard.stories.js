import PlayerCard from '@/components/PlayerCard.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'player-card',
  title: 'Player Card',
  group: 'Cards',
  component: PlayerCard,
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-default',
    '--x-pad-surface-s',
    '--x-border-soft',
    '--x-radius-container-xs',
    '--x-bg-sku-card-default',
    '--x-size-img-l',
    '--x-radius-badge-full',
    '--x-gap-content-narrow',
    '--x-text-header-default',
    '--x-text-body-soft',
    '--x-gap-content-tight',
  ],
  notes:
    'Reusable player-identity card (L1 ghost surface, hairline border) used wherever a player\'s ' +
    'account info needs to be shown: AccountPopover (signed-in state, `full` variant) and ' +
    'PlayerAccount\'s guest-lookup "found" state. `nickname-only` is FCM\'s reduced mode — EA\'s ' +
    'public-facing profile API only surfaces the display name, so avatar, masked ID and stats are ' +
    'hidden and a small category label can appear above the name instead. Not interactive itself.',
  rules: [
    'name is required; every other prop is optional with a demo-data default.',
    'avatarSrc only renders when variant is not nickname-only — nickname-only never shows an avatar.',
    'label (the small category caption) only appears in nickname-only mode, and only when set.',
    'showRank: false hides the MP Rank stat in full mode; level always shows.',
    'The `link` slot is empty for every existing consumer (AccountPopover) — used by PlayerAccount for a trailing PWA-install hyperlink.',
  ],
  variants: [
    {
      name: 'Full (default)',
      props: ({ assets }) => ({
        name: 'ShadowStrikerXO',
        idMasked: '**** 9859',
        level: 80,
        rank: 'Rookie 1',
        avatarSrc: assets.content?.avatar,
        variant: 'full',
      }),
    },
    {
      name: 'Full, no rank',
      props: ({ assets }) => ({
        name: 'ShadowStrikerXO',
        idMasked: '**** 9859',
        level: 80,
        avatarSrc: assets.content?.avatar,
        variant: 'full',
        showRank: false,
      }),
    },
    {
      name: 'Nickname only (FCM)',
      props: ({ strings }) => ({
        name: 'ShadowStrikerXO',
        variant: 'nickname-only',
        label: strings.account?.playerCardLabel || 'Player Profile',
      }),
    },
  ],
})
