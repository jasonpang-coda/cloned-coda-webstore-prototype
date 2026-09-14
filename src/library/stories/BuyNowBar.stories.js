import BuyNowBar from '@/components/BuyNowBar.vue'
import { defineStory } from '../story.js'
import { useCheckout } from '../../composables/useCheckout.js'
import { useAuth } from '../../composables/useAuth.js'

const { selectedItem, buyNowVisible, selectedChannel, sheetOpen } = useCheckout()
const { signedIn } = useAuth()

const DEMO_ITEM = {
  label: null,
  amount: 528,
  currencyLabel: 'CP',
  currentPrice: '$4.99',
  loyaltyPoints: 40,
}

function resetCheckoutState() {
  buyNowVisible.value = false
  sheetOpen.value = false
  selectedItem.value = null
  selectedChannel.value = null
}

export default defineStory({
  id: 'buy-now-bar',
  title: 'Buy Now Bar',
  group: 'Controls',
  component: BuyNowBar,
  overlay: true,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-pad-surface-m',
    '--x-pad-surface-xl',
    '--x-border-soft',
    '--x-radius-container-s',
    '--x-bg-sheet',
    '--x-bg-page',
    '--x-blur-container',
    '--x-shadow-sheet',
    '--x-gap-content-default',
    '--x-gap-content-narrow',
    '--x-text-header-default',
    '--x-text-final-price',
    '--x-gap-control-m',
    '--x-pad-surface-l',
    '--x-radius-control-full',
    '--x-motion-sku-hover',
    '--x-bg-action-primary',
    '--x-text-on-primary',
    '--x-fx-ripple-color-dark',
    '--x-text-header-strong',
    '--x-size-icon-s',
    '--x-text-body-default',
    '--x-text-body-soft',
    '--x-size-icon-xs',
    '--x-motion-modal-enter',
    '--x-motion-modal-exit',
    '--x-motion-sys-duration-exit',
    '--x-motion-sys-ease-accelerate',
    '--x-motion-sys-duration-slow',
    '--x-motion-sys-ease-decelerate',
    '--x-border-sheet',
  ],
  notes:
    'Docked "Buy Now" strip (Figma 2867:9216 signed-in / 2542:3187 signed-out) — ' +
    'the FCM Buy Now pilot\'s first step after a SKU tap, gated behind the ' +
    'fcmPaymentSheet flag. It sits ON the page with no scrim (storefront stays ' +
    'visible/scrollable behind it). Signed-out shows a SIGN IN CTA; signed-in shows ' +
    'BUY NOW, which promotes the bar into the full OrderSummarySheet via ' +
    'openPaymentSheet(). All visible content is derived from useCheckout/useAuth ' +
    'singleton state, not props — a story drives it via setup()/teardown() writing ' +
    'directly to those composables, the same idiom as PurchaseSheet\'s story.',
  rules: [
    'Visibility, content, and auth branch are entirely derived from useCheckout()/useAuth() state — isMobile and forceReady are the ONLY two real props.',
    'forceReady (Diablo Immortal\'s guided inline checkout) bypasses the FCM buyNowVisible/signedIn gating entirely and always shows the BUY NOW branch — its click emits `buy-now` to the parent instead of calling openPaymentSheet(), since there is no OrderSummarySheet to promote into on that path.',
    'isMobile: false switches to the fixed, centered "responsive" (desktop) presentation at max-width 420px — this only takes effect at container widths ≥ 801px (a @media query, not @container — see the FE report note below).',
    'The bar hides itself whenever sheetOpen, eaSignInOpen, or konamiSignInOpen is true, even if buyNowVisible/forceReady would otherwise show it — those overlays take the same slot.',
  ],
  variants: [
    {
      name: 'Signed out',
      setup: () => {
        selectedItem.value = { ...DEMO_ITEM, label: 'Starter Bundle' }
        buyNowVisible.value = true
        signedIn.value = false
      },
      teardown: resetCheckoutState,
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Signed in, no channel picked',
      setup: () => {
        selectedItem.value = { ...DEMO_ITEM, label: 'Starter Bundle' }
        buyNowVisible.value = true
        signedIn.value = true
        selectedChannel.value = null
      },
      teardown: () => { resetCheckoutState(); signedIn.value = false },
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Signed in, channel selected',
      setup: () => {
        selectedItem.value = { ...DEMO_ITEM, label: 'Starter Bundle' }
        buyNowVisible.value = true
        signedIn.value = true
        selectedChannel.value = 0
      },
      teardown: () => { resetCheckoutState(); signedIn.value = false },
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Force-ready (guided inline checkout)',
      setup: () => {
        selectedItem.value = { ...DEMO_ITEM, label: '1,060 Diamonds' }
      },
      teardown: resetCheckoutState,
      props: () => ({ isMobile: true, forceReady: true }),
    },
    {
      name: 'Responsive (desktop)',
      setup: () => {
        selectedItem.value = { ...DEMO_ITEM, label: 'Starter Bundle' }
        buyNowVisible.value = true
        signedIn.value = true
        selectedChannel.value = 0
      },
      teardown: () => { resetCheckoutState(); signedIn.value = false },
      props: () => ({ isMobile: false }),
    },
  ],
})
