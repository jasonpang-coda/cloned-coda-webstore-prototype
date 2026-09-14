import ClaimGiftSheet from '@/components/ClaimGiftSheet.vue'
import { defineStory } from '../story.js'
import { useGiftClaim } from '../../composables/useGiftClaim.js'
import { useAuth } from '../../composables/useAuth.js'
import { useCheckout } from '../../composables/useCheckout.js'

const { openGiftClaim, confirmClaim, closeGiftClaim } = useGiftClaim()
const { signedIn } = useAuth()
const { guestVerified } = useCheckout()

const DEMO_GIFT = {
  id: 'demo-gift-daily',
  title: 'Daily Login Reward',
  subtitle: '160 CP',
}

// Resets the two account-state refs this story mutates so a later variant
// (or the next story visited in the same session) doesn't inherit a stale
// signed-in/guest-verified flag left over from this one.
function resetAccountState() {
  signedIn.value = false
  guestVerified.value = false
}

export default defineStory({
  id: 'claim-gift-sheet',
  title: 'Claim Gift Sheet',
  group: 'Overlays',
  component: ClaimGiftSheet,
  overlay: true,
  tokens: [
    '--x-text-header-default',
    '--x-size-icon-l',
    '--x-motion-sku-hover',
    '--x-text-header-strong',
    '--x-text-body-default',
    '--x-pad-surface-s',
    '--x-border-soft-2',
    '--x-radius-container-xs',
    '--x-gradient-checkout-banner',
    '--x-gap-content-default',
    '--x-gradient-thumb-gloss',
    '--x-border-soft',
    '--x-gap-content-tight',
    '--x-text-bonus-amount',
    '--x-pad-surface-xl',
    '--x-radius-control-full',
    '--x-text-hyperlink-default',
    '--x-text-on-primary',
    '--x-fx-ripple-color-dark',
    '--x-motion-btn-activate',
    '--x-bg-action-signin',
    '--x-gap-content-narrow',
    '--x-bg-action-mykonami',
    '--x-motion-sys-duration-fast',
    '--x-motion-sys-ease-accelerate',
    '--x-motion-sys-duration-base',
    '--x-motion-sys-ease-decelerate',
    '--x-bg-indicator-success-default',
    '--x-motion-sys-duration-slowest',
    '--x-motion-sys-duration-slow',
  ],
  states: ['default'],
  notes:
    'The COD:M/FCM gift-claim sheet (sibling of PurchaseSheet), opened via ' +
    'useGiftClaim().openGiftClaim(gift) from a GiftSkuCard tap. Two views on ' +
    'one BaseSheet, swapped through the contentKey resize + cross-fade engine: ' +
    'Confirm ("You are about to claim…" + SKU banner, plus an inline gamer-ID ' +
    'form when signed out) and Success (confirmation + an optional upsell SKU ' +
    'banner that hands off to PurchaseSheet). On an EA/KONAMI-flow store the ' +
    'signed-out footer swaps the disabled Claim CTA for an EA/mykonami sign-in ' +
    'button instead of showing the inline form.',
  rules: [
    'requiresAccount is captured once at open time, not derived reactively — it must not flip false mid-session or the embedded PlayerAccount form unmounts and resets guestVerified.',
    'The Claim CTA stays disabled until canClaim (signedIn || guestVerified) is true.',
    'upsellItem is optional — the success view falls back to a plain "Got it"-style CTA (giftClaimDoneCta) when it is absent.',
    'On an EA/KONAMI-flow store, the signed-out footer replaces the disabled Claim CTA entirely — it never shows both.',
  ],
  variants: [
    {
      name: 'Confirm — signed out',
      setup: () => {
        resetAccountState()
        openGiftClaim(DEMO_GIFT)
      },
      teardown: () => { closeGiftClaim(); resetAccountState() },
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Confirm — ready to claim',
      setup: () => {
        signedIn.value = true
        openGiftClaim(DEMO_GIFT)
      },
      teardown: () => { closeGiftClaim(); resetAccountState() },
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Success — no upsell',
      setup: () => {
        signedIn.value = true
        openGiftClaim(DEMO_GIFT)
        confirmClaim()
      },
      teardown: () => { closeGiftClaim(); resetAccountState() },
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Success — with upsell',
      setup: () => {
        signedIn.value = true
        openGiftClaim(DEMO_GIFT)
        confirmClaim()
      },
      teardown: () => { closeGiftClaim(); resetAccountState() },
      props: ({ assets, strings }) => ({
        isMobile: true,
        upsellItem: {
          label: strings.sku?.bonusLabel ? `528 ${strings.sku.bonusLabel}` : '528 CP',
          amount: 528,
          baseAmount: 480,
          bonusAmount: 48,
          bonusLabel: strings.sku?.bonusLabel || 'WEB BONUS',
          currentPrice: '$4.99',
          skuImage: assets.content?.cpCoins?.[420] || assets.brand?.cpIcon,
        },
      }),
    },
  ],
})
