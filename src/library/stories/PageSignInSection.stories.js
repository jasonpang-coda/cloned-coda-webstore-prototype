import PageSignInSection from '@/components/PageSignInSection.vue'
import { defineStory } from '../story.js'
import { useAuth } from '../../composables/useAuth.js'

const { signedIn, signOut } = useAuth()

export default defineStory({
  id: 'page-sign-in-section',
  title: 'Page Sign In Section',
  group: 'SignIn',
  component: PageSignInSection,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-loose',
    '--x-pad-surface-l',
    '--x-pad-surface-m',
    '--x-radius-container-s',
    '--x-bg-sku-card-default',
    '--x-blur-container',
    '--x-border-sku-card-default',
    '--x-text-body-default',
    '--x-gap-content-default',
    '--x-gap-content-narrow',
    '--x-radius-control-full',
    '--x-bg-action-signin',
    '--x-text-on-primary',
    '--x-motion-sku-hover',
    '--x-motion-btn-activate',
    '--x-bg-action-mykonami',
    '--x-hm-scale',
    '--x-text-hyperlink-inverse',
  ],
  notes:
    'Page-level sign-in prompt / player profile card, mounted directly on the ' +
    'page (not an overlay) — see App.vue. Signed-out renders an L1 card with ' +
    'prompt copy + one button per config.signIn active flow (mirrors ' +
    "SignInSheet's activeFlows logic); signed-in renders PlayerCard instead. " +
    'Multi-flow stores (eFootball) render every active flow inline rather than ' +
    'a single "open sheet" button.',
  rules: [
    'Enforce @container query layouts (never @media).',
    'Use semantic tokens for colors and spacing.',
    'activeFlows is device-split (isMobile) for multi-flow stores — same derivation as SignInSheet.',
    'Signed-in state swaps the whole card for PlayerCard; it never renders alongside the prompt.',
  ],
  variants: [
    {
      name: 'Default (signed out)',
      setup: () => { signedIn.value = false },
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Signed In',
      setup: () => { signedIn.value = true },
      teardown: () => signOut(),
      props: () => ({ isMobile: true }),
    },
  ],
})
