import SignInLoader from '@/components/SignInLoader.vue'
import { defineStory } from '../story.js'
import { useAuth } from '../../composables/useAuth.js'

const { signingIn } = useAuth()

export default defineStory({
  id: 'sign-in-loader',
  title: 'Sign In Loader',
  group: 'Content',
  component: SignInLoader,
  overlay: true,
  // The component renders nothing (v-if="signingIn") until the shared useAuth
  // singleton's `signingIn` ref is true — force it open for the story instead
  // of calling startSignIn(), which starts a 5s auto-dismiss timer.
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-scrim',
    '--x-pad-surface-xl',
    '--x-pad-surface-m',
    '--x-gap-content-loose',
    '--x-gap-content-default',
    '--x-radius-badge-full',
    '--x-bg-indicator-neutral-subtle',
    '--x-bg-action-primary',
    '--x-motion-sys-ease-linear',
    '--x-text-body-default',
    '--x-pad-surface-xs',
    '--x-bg-page',
    '--x-radius-container-xs',
    '--x-pad-surface-s',
    '--x-border-soft-2',
    '--x-radius-control-xs',
    '--x-text-header-default',
    '--x-motion-modal-enter',
    '--x-motion-modal-exit',
  ],
  notes:
    'Full-screen sign-in overlay shown while the simulated COD:M sign-in is in flight, mounted in ' +
    'DeviceFrame\'s #overlay slot. Reads `signingIn` off the shared useAuth() singleton (also read ' +
    'by NavBar, NavDrawer and Snackbar) rather than a prop — so it appears automatically whenever ' +
    'anything calls startSignIn(), and "Cancel Sign In" calls cancelSignIn() to abort. isMobile ' +
    'is device-driven in App.vue (device !== \'none\'), not user-chosen: it swaps the whole content ' +
    'block between an "Opening COD:M app…" indeterminate-bar loader (Figma 4990:12116) and a ' +
    'QR-code sign-in panel (Figma 5031:15622). The blurred scrim captures pointer events so the ' +
    'screen underneath is inert while it is open.',
  rules: [
    'Visibility is NOT prop-driven — it only renders while useAuth().signingIn is true; the story forces this open directly since startSignIn() would also arm a 5s auto-dismiss timer.',
    'isMobile switches between the two entirely different content blocks (app-opening loader vs QR code) — there is no combined or partial state.',
    '.loader--desktop switches position:fixed (full viewport) instead of position:absolute (bounded to the device screen box) — required because the responsive layout has no transformed ancestor to bound against.',
    'Cancel always calls cancelSignIn(), never a local handler — it clears the shared signInTimer so a cancelled flow cannot still flip signedIn later.',
  ],
  variants: [
    {
      name: 'Mobile (opening app)',
      setup: () => { signingIn.value = true },
      teardown: () => { signingIn.value = false },
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Desktop / responsive (QR sign-in)',
      setup: () => { signingIn.value = true },
      teardown: () => { signingIn.value = false },
      props: () => ({ isMobile: false }),
    },
  ],
})
