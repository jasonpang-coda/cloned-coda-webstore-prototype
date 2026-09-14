import PurchaseSheet from '@/components/PurchaseSheet.vue'
import { defineStory } from '../story.js'
import { useItemSummary } from '../../composables/useItemSummary.js'
import { useCheckout } from '../../composables/useCheckout.js'
import { useAuth } from '../../composables/useAuth.js'

const { openItemSummary, closeItemSummary } = useItemSummary()
const { openCheckout, closeCheckout } = useCheckout()
const { signedIn } = useAuth()

const DEMO_BUNDLE = {
  title: 'Starter Bundle',
  currentPrice: '$4.99',
  originalPrice: '$9.99',
  discountPercent: '-50%',
  loyaltyPoints: 40,
}

function closeAll() {
  closeItemSummary()
  closeCheckout()
}

export default defineStory({
  id: 'purchase-sheet',
  title: 'Purchase Sheet',
  group: 'Overlays',
  component: PurchaseSheet,
  overlay: true,
  tokens: [
    '--x-gap-content-narrow',
    '--x-pad-surface-m',
    '--x-pad-surface-xl',
    '--x-border-soft',
    '--x-radius-container-s',
    '--x-bg-loyalty-banner',
    '--x-text-header-strong',
    '--x-size-icon-s',
  ],
  states: ['default'],
  notes:
    'The single persistent surface for EVERY store\'s "buy something" ' +
    'workflow: info step → payment/checkout step, as ONE BaseSheet whose body/ ' +
    'footer swap in place via BaseSheet\'s contentKey resize + cross-fade engine ' +
    '— never a separate sheet component faking a handoff. usePurchaseFlow() ' +
    'derives which step shows from the same singletons every entry point ' +
    'already writes: useItemSummary().summaryOpen (the (i) "info" step) and ' +
    'useCheckout().sheetOpen (a direct SKU tap or Buy Now bar). ' +
    'config.checkout.buyNow (FCM only, behind the fcmPaymentSheet dev flag) ' +
    'selects the payment-step view (promo-code order summary) over the ' +
    'default checkout-step view (2x2 payment-channel grid) once sheetOpen is ' +
    'true.',
  rules: [
    'currentStep (and therefore what renders) is entirely derived — there is no local open/step prop; a story or caller drives it by writing to useItemSummary/useCheckout, not by passing props to PurchaseSheet.',
    'openCheckout() is gated: it is a no-op while signed out and not guest-verified (unless in Buy-Now-bar or inline mode) — a demo must set signedIn/guestVerified true first.',
    'The "Item Info" link from the checkout/payment step layers the info step ON TOP of (not instead of) the still-open checkout step via stepOverride — closing it returns to the step underneath, never to the SKU grid.',
    'The loyalty earn banner (#pre-footer) only renders on the checkout step, and only when the descriptor carries both a loyalty config object and a loyaltyPoints number.',
  ],
  variants: [
    {
      name: 'Info step',
      setup: () => openItemSummary(DEMO_BUNDLE),
      teardown: () => closeAll(),
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Checkout step (signed in)',
      setup: () => {
        signedIn.value = true
        openCheckout(
          { label: DEMO_BUNDLE.title, currentPrice: DEMO_BUNDLE.currentPrice, bonusLabel: 'BUNDLE', loyaltyPoints: DEMO_BUNDLE.loyaltyPoints, bundleInfo: DEMO_BUNDLE },
          `${DEMO_BUNDLE.title}|${DEMO_BUNDLE.currentPrice}`,
        )
      },
      teardown: () => { closeAll(); signedIn.value = false },
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Responsive (desktop modal)',
      setup: () => openItemSummary(DEMO_BUNDLE),
      teardown: () => closeAll(),
      props: () => ({ isMobile: false }),
    },
  ],
})
