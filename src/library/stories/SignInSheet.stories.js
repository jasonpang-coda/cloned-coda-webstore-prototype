import SignInSheet from '@/components/SignInSheet.vue'
import { defineStory } from '../story.js'
import { useAuth } from '../../composables/useAuth.js'

const { openSignInSheet, closeSignInSheet } = useAuth()

export default defineStory({
  id: 'sign-in-sheet',
  title: 'Sign In Sheet',
  group: 'Overlays',
  component: SignInSheet,
  overlay: true,
  tokens: [
    '--x-gap-content-default',
    '--x-text-on-primary',
    '--x-motion-sku-hover',
    '--x-motion-btn-activate',
    '--x-text-body-default',
    '--x-size-icon-m',
    '--x-pad-surface-xs',
    '--x-text-body-soft',
    '--x-text-hyperlink-default',
  ],
  states: ['default'],
  notes:
    '"SIGN IN TO PURCHASE" bottom sheet (Figma 4863:14324), opened from the ' +
    'navbar SIGN IN button via useAuth().openSignInSheet(). Rendered with NO ' +
    'dimming scrim — the page behind stays visible and interactive; BaseSheet ' +
    'falls back to a document-level outside-tap listener for dismissal instead. ' +
    'activeFlows is device-split for eFootball (desktop: mykonami only; mobile: ' +
    'mykonami + efootball) and a single-item array derived from ' +
    'config.signIn.flow for every legacy (COD:M/FCM/single-flow) store. Guest ' +
    'checkout is config-gated (config.checkout.allowGuest) and closes the sheet ' +
    'then scrolls to + focuses the Player Account section.',
  rules: [
    'scrim=false and ariaModal=false — this sheet never blocks interaction with the page behind it, unlike every other sheet in this group.',
    'The guest-checkout button + "or" separator render only when config.checkout.allowGuest is true.',
    'Each sign-in flow button\'s CTA copy comes from strings.signIn[flow].cta for a multi-flow store, or strings.signIn.cta for a single-flow store — never hardcoded.',
    'Picking any flow calls closeSignInSheet() before handing off to that flow\'s own overlay/loader (startSignIn/startEaSignIn/startKonamiSignIn) — the sheet never stays open underneath.',
  ],
  variants: [
    {
      name: 'Default (single flow + guest)',
      setup: () => openSignInSheet(),
      teardown: () => closeSignInSheet(),
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Responsive (desktop modal)',
      setup: () => openSignInSheet(),
      teardown: () => closeSignInSheet(),
      props: () => ({ isMobile: false }),
    },
  ],
})
