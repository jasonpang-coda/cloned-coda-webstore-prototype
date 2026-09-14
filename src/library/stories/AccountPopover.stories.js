import AccountPopover from '@/components/AccountPopover.vue'
import { defineStory } from '../story.js'
import { useAuth } from '@/composables/useAuth.js'

// AccountPopover's visibility is NOT a prop — it reads the shared
// `accountMenuOpen` singleton from useAuth() directly (same ref NavBar's
// avatar button toggles). There is no story-schema hook that runs before
// mount, so the only working way to exercise the open state here is the same
// trick the app itself uses everywhere else for singleton-gated UI: call the
// composable's own opener as a side effect of the variant's props factory
// (re-invoked on every theme switch, which is exactly when we want it open
// again). "Closed" explicitly calls the closer so switching between variants
// doesn't leave a stale open popover from whichever variant rendered before it.
const { openAccountMenu, closeAccountMenu } = useAuth()

export default defineStory({
  id: 'account-popover',
  title: 'Account Popover',
  group: 'Navigation',
  component: AccountPopover,
  overlay: true,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-pad-surface-m',
    '--x-pad-surface-s',
    '--x-gap-content-loose',
    '--x-pad-surface-l',
    '--x-border-sheet',
    '--x-radius-container-s',
    '--x-bg-sheet',
    '--x-bg-page',
    '--x-blur-container',
    '--x-shadow-sheet',
    '--x-gap-content-default',
    '--x-text-header-default',
    '--x-size-icon-l',
    '--x-motion-sku-hover',
    '--x-text-header-strong',
    '--x-gap-content-narrow',
    '--x-text-body-default',
    '--x-motion-hover',
    '--x-text-hyperlink-hover',
    '--x-text-hyperlink-pressed',
    '--x-border-divider',
    '--x-text-hyperlink-default',
    '--x-motion-modal-enter',
    '--x-motion-modal-exit',
  ],
  states: ['default', 'hover', 'pressed'],
  notes:
    '"YOUR ACCOUNT" popover opened by tapping the in-game avatar in NavBar\'s ' +
    'signed-in state (Figma 5199:12187). Anchored 8px below the navbar, right-' +
    'aligned with the avatar — deliberately no dimming scrim, so the page behind ' +
    'stays visible and interactive. Reads its own visibility from useAuth()\'s ' +
    '`accountMenuOpen` singleton rather than a prop, and dismisses itself on ' +
    'Escape, an outside pointerdown, or any page scroll (a fixed-offset popover ' +
    'would otherwise float unanchored once NavBar hides on scroll-down). The ' +
    'PlayerCard variant/avatar/label are driven by useStoreConfig/useStoreAssets/ ' +
    'useStoreStrings; the Transaction History link only renders where a store ' +
    'defines strings.transactionHistory (opt-in per store, never a theme check).',
  rules: [
    'Never gate this popover on a prop — it is always driven by the shared accountMenuOpen singleton so NavBar\'s avatar button and this panel never disagree.',
    'No scrim: the page behind stays interactive, so outside-tap dismissal must not eat clicks meant for other UI (see the data-account-toggle skip in onPointerDown).',
    'The Transaction History row is opt-in per store via strings.transactionHistory, never a theme identity check.',
    'Sign Out calls the shared signOut() from useAuth — it does not manage its own signed-in state.',
  ],
  variants: [
    {
      name: 'Closed',
      props: () => {
        closeAccountMenu()
        return { isMobile: true }
      },
    },
    {
      name: 'Open (framed)',
      props: () => {
        openAccountMenu()
        return { isMobile: true }
      },
    },
    {
      name: 'Open (responsive, no device frame)',
      props: () => {
        openAccountMenu()
        return { isMobile: false }
      },
    },
  ],
})
