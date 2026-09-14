import PlayerAccount from '@/components/PlayerAccount.vue'
import { defineStory } from '../story.js'
import { useCheckout } from '@/composables/useCheckout.js'

// PlayerAccount's "found" state is not exposed as a prop — on mount it reads
// its initial `status` from useCheckout()'s shared guestVerified/guestPlayerName
// singleton (so re-opening the surface after a prior lookup shows the same
// card instead of an empty field). There is no story-schema hook that runs
// before mount, so — same pattern as AccountPopover.stories.js — the props
// factory itself primes the singleton as a side effect before the component
// reads it. "Idle" explicitly clears it so switching variants doesn't leave a
// stale "found" card bleeding from whichever variant rendered before it.
const { setGuestVerified, setGuestPlayerName } = useCheckout()

export default defineStory({
  id: 'player-account',
  title: 'Player Account',
  group: 'Navigation',
  component: PlayerAccount,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-loose',
    '--x-motion-sys-duration-base',
    '--x-motion-sys-ease-decelerate',
    '--x-text-header-default',
    '--x-gap-content-default',
    '--x-pad-surface-s',
    '--x-border-soft-2',
    '--x-radius-container-xs',
    '--x-surface-ghost',
    '--x-text-body-default',
    '--x-text-body-soft',
    '--x-border-input-focused',
    '--x-text-hyperlink-default',
    '--x-radius-badge-full',
    '--x-motion-spinner',
    '--x-motion-sys-ease-linear',
    '--x-gap-content-narrow',
    '--x-motion-accordion',
    '--x-pad-surface-l',
    '--x-border-divider',
    '--x-rarity-gradient-neutral',
    '--x-motion-tab-indicator',
    '--x-motion-sys-ease-standard',
    '--x-pad-surface-m',
    '--x-motion-hover',
    '--x-text-hyperlink-hover',
    '--x-text-hyperlink-pressed',
    '--x-motion-sys-duration-exit',
    '--x-motion-sys-duration-fast',
    '--x-motion-sys-ease-accelerate',
    '--x-motion-sys-distance-sm',
  ],
  states: ['default', 'hover', 'focus', 'pressed'],
  notes:
    '"YOUR COD:M ACCOUNT" guest Player ID entry (Figma 5147:22653). A text ' +
    'input triggers a simulated lookup on blur/Enter: a donut spinner shows for ' +
    '~1.1s, then a PlayerCard fades in reflecting the typed value. Reaching the ' +
    '"found" state calls useCheckout().setGuestVerified(true), which unlocks ' +
    'guest checkout — this component is one of the (potentially several) places ' +
    'that can flip that shared flag, and it mirrors updates made elsewhere (e.g. ' +
    'the same component reused inside ClaimGiftSheet) via a watcher, so both ' +
    'instances always agree on the verified account. The disclosure panel\'s ' +
    'chips + instruction copy come from strings.account.chips and are hidden ' +
    'entirely once an account is found, or if a store sets ' +
    'config.profile.showAccountInstructions to false.',
  rules: [
    'Editing the Player ID after a successful lookup calls onEdit(), which resets status to "idle" AND calls setGuestVerified(false) — never leave a stale verified flag while the field no longer matches it.',
    'Do not reset guestVerified on unmount — the verified state must survive the component unmounting (e.g. a sheet closing and reopening); only a deliberate edit clears it.',
    'The instructions disclosure is fully hidden once status is "found", and gated on config.profile.showAccountInstructions for stores that don\'t want it at all.',
  ],
  variants: [
    {
      name: 'Idle',
      props: () => {
        setGuestVerified(false)
        return { baseDelay: 0 }
      },
    },
    {
      name: 'Found (verified account)',
      props: ({ strings }) => {
        const name = strings.account?.demoPlayerName || 'CodPlayerOne'
        setGuestPlayerName(name)
        setGuestVerified(true)
        return { baseDelay: 0 }
      },
    },
  ],
})
