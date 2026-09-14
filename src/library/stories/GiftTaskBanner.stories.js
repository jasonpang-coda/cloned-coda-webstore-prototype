import GiftTaskBanner from '@/components/GiftTaskBanner.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'gift-task-banner',
  title: 'Gift Task Banner',
  group: 'Content',
  component: GiftTaskBanner,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-border-tag-success',
    '--x-bg-info-banner-success',
    '--x-border-signin-btn',
    '--x-text-header-default',
    '--x-surface-ghost-3',
  ],
  states: ['default'],
  notes:
    'CategoryBanner wrapped with the task-gated gift\'s step-driven action — ' +
    'a ToggleSwitch for the "push" step, a Button tertiary CTA pill ' +
    'otherwise. Grounded in OrderCompletePage\'s gift banner. Presentational ' +
    'only — the caller owns which step is active (useTaskGiftClaim.js) and ' +
    'reacts to update:toggle/cta-click. App.vue\'s own Gifts-category banner ' +
    'uses a near-identical pattern but adds a glow animation this component ' +
    'doesn\'t have, so it stays a one-off consumer, not migrated to this yet.',
  rules: [
    'mode="toggle" renders a ToggleSwitch in the #action slot; any other mode renders a CTA pill Button.',
    'tone="success" tints the border + overlay for a "reward just earned" banner — omit for CategoryBanner\'s own default dark-scrim look.',
    'The CTA pill uses Button\'s tertiary variant with --btn-border/--btn-bg-hover/--btn-hover-filter overrides, not a bespoke button.',
  ],
  variants: [
    {
      name: 'CTA — install step',
      props: ({ assets }) => ({
        tone: 'success',
        icon: assets.content?.cpCoins?.[88] || assets.brand?.cpIcon,
        title: 'Claim your 88 CP',
        description: 'Install the COD:M Store and turn on notifications to claim 88 CP, free.',
        mode: 'cta',
        ctaLabel: 'Install',
        ctaIcon: 'install_mobile',
      }),
    },
    {
      name: 'Toggle — push step',
      props: ({ assets }) => ({
        tone: 'success',
        icon: assets.content?.cpCoins?.[88] || assets.brand?.cpIcon,
        title: 'Claim your 88 CP',
        description: 'Turn on notifications to claim 88 CP, free.',
        mode: 'toggle',
        toggleModelValue: false,
        toggleAriaLabel: 'Turn on notifications',
      }),
    },
    {
      name: 'CTA — claim step',
      props: ({ assets }) => ({
        tone: 'success',
        icon: assets.content?.cpCoins?.[88] || assets.brand?.cpIcon,
        title: 'Claim your 88 CP',
        description: 'You\'re all set — claim your reward.',
        mode: 'cta',
        ctaLabel: 'Claim 88 CP',
      }),
    },
  ],
})
