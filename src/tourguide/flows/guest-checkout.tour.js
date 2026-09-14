import { defineTour } from '@coda/tourguide-kit'
import { useAuth } from '../../composables/useAuth.js'
import { useCheckout } from '../../composables/useCheckout.js'
import { useItemSummary } from '../../composables/useItemSummary.js'

export default defineTour({
  id: 'guest-checkout',
  title: 'Guest Checkout & Purchase',
  category: 'Purchase Flows',
  description: 'Step through browsing a promotional SKU, reviewing item summary, and completing payment as a guest.',
  defaultTheme: 'codm',
  defaultDevice: 'iphone',

  setup: async () => {
    const { signOut } = useAuth()
    const { closeCheckout, setGuestVerified, setGuestPlayerName } = useCheckout()
    const { closeItemSummary } = useItemSummary()
    signOut()
    closeCheckout()
    closeItemSummary()
    // openCheckout() (a SKU tap) is a no-op for a signed-out, unverified
    // guest — see useCheckout.js's sheet-mode gate. A real guest verifies
    // their Player ID via PlayerAccount before tapping a SKU; this demo
    // simulates that already-verified state so the tour can tap straight
    // into checkout instead of stalling silently on step 1.
    setGuestPlayerName('Demo Operator')
    setGuestVerified(true)
    await new Promise(r => setTimeout(r, 150))
  },

  steps: [
    {
      id: 'browse-best-seller',
      title: 'Featured Promotion SKU Card',
      explanation: 'Users browse high-value promotional bundles featuring bonus weapon blueprints and Call of Duty Points.',
      poiSelector: 'best-seller-card',
      poiPlacement: 'bottom',
      holdMs: 3200,
      action: {
        type: 'click',
        target: 'best-seller-card',
        delayBeforeActionMs: 500,
        delayAfterActionMs: 700,
      },
    },
    {
      id: 'purchase-sheet-details',
      title: 'Item Summary & Purchase Sheet',
      explanation: 'The persistent purchase sheet displays the selected package breakdown, pricing discount, and loyalty rewards.',
      poiSelector: 'purchase-sheet',
      poiPlacement: 'top',
      holdMs: 3000,
    },
    {
      id: 'payment-channel-select',
      title: 'Select Payment Method',
      explanation: 'Select from available local payment channels including e-Wallets, Cards, and direct billing.',
      poiSelector: 'payment-channel',
      poiPlacement: 'top',
      holdMs: 2800,
      action: {
        type: 'click',
        target: 'payment-channel',
        delayBeforeActionMs: 400,
        delayAfterActionMs: 600,
      },
    },
    {
      id: 'confirm-purchase',
      title: 'Complete Transaction',
      explanation: 'Confirming the order triggers immediate client feedback, haptic pulses, and a completion receipt snackbar.',
      poiSelector: 'purchase-cta',
      poiPlacement: 'top',
      holdMs: 2500,
      action: {
        type: 'click',
        target: 'purchase-cta',
        delayBeforeActionMs: 500,
        delayAfterActionMs: 800,
      },
    },
  ],
})
