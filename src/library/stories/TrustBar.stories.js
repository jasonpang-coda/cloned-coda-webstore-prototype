import TrustBar from '@/components/TrustBar.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'trust-bar',
  title: 'Trust Bar',
  group: 'Content',
  component: TrustBar,
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-bg-navbar',
    '--x-border-navbar',
    '--x-radius-container-m',
    '--x-motion-trust-slide',
    '--x-gap-content-default',
    '--x-pad-surface-m',
    '--x-pad-surface-l',
    '--x-sys-size-xxxl',
    '--x-size-control-m',
    '--x-radius-control-full',
    '--x-bg-indicator-brand-subtle',
    '--x-bg-indicator-brand-default',
    '--x-text-header-inverse',
    '--x-text-body-inverse',
    '--x-gap-content-narrow',
    '--x-pad-surface-xxs',
    '--x-pad-surface-s',
    '--x-radius-container-xs',
    '--x-bg-card-default',
    '--x-size-icon-m',
    '--x-motion-trust-rotate-fade',
    '--x-radius-badge-full',
    '--x-bg-indicator-neutral-default',
    '--x-motion-sys-duration-fast',
    '--x-bg-indicator-selected-default',
    '--x-gap-content-loose',
  ],
  notes:
    'Four-card trust-signal row (officially partnered / trusted-by-gamers count / ' +
    'fast delivery / pay-your-way) sitting in the left rail under the compact hero ' +
    'on Codashop only — App.vue gates it on `config.trustBar` (`showTrustBar`), a key ' +
    'only src/stores/codashop/store.js sets, so it never mounts anywhere else. Takes ' +
    'no props at all: every stat, string and logo comes straight from ' +
    'useStoreConfig()/useStoreStrings()/useStoreAssets() inside the component itself, ' +
    'so the only way to see it change is switching the active store theme in the ' +
    'harness, not passing different props. Runs two independent self-driven timers ' +
    'on mount — a publisher-logo crossfade rotator (useCountUp for the animated ' +
    'gamer/delivery stats) and, at XS/S widths, a one-card-peek carousel with drag-' +
    'to-swipe and dot nav — both respect prefers-reduced-motion and are torn down ' +
    'onBeforeUnmount. Uses a self-named `trust-bar` container-query context (not the ' +
    "app's anonymous `.device__screen` one) because it now lives inside App.vue's " +
    'narrower sticky lead rail, not the full-width main column.',
  rules: [
    'No props — content is entirely composable-driven; never thread trust-bar copy/stats through props, add them to a store\'s config.trustBar / strings.trustBar instead.',
    'Only ever renders where a store defines config.trustBar (Codashop today) — every other store must leave that key absent, not falsy, for App.vue\'s v-if gate to skip it.',
    'Layout breakpoints must stay on the named `trust-bar` container query, not the app-wide `.device__screen` one, or the rail-embedded instance breaks.',
  ],
  variants: [
    {
      name: 'Default',
      props: () => ({}),
    },
  ],
})
