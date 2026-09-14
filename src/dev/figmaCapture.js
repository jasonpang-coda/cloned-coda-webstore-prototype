import { nextTick } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useCheckout } from '../composables/useCheckout.js'
import { useItemSummary } from '../composables/useItemSummary.js'
import { usePurchaseFlow } from '../composables/usePurchaseFlow.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useTheme } from '../composables/useTheme.js'

/** Dev-only capture states (`?figmaCapture=<step>`). */
export const FIGMA_CAPTURE_STEPS = [
  'sign-in-sheet',
  'sign-in-loader',
  'player-account-idle',
  'player-account-found',
  'item-summary',
  'checkout',
  'checkout-selected',
  'item-info-on-checkout',
  'codashop-homepage',
]

/** Per-step capture config consumed by App.vue (device frame, selector, theme). */
export const FIGMA_CAPTURE_CONFIG = {
  'codashop-homepage': {
    theme: 'codashop',
    device: 'none',
    selector: '.device__screen',
    viewportWidth: 1440,
    label: 'Codashop Homepage — Responsive',
  },
}

export function getFigmaCaptureConfig (step) {
  return FIGMA_CAPTURE_CONFIG[step] ?? { device: 'iphone', selector: '.device-stage > .device' }
}

async function waitForImages (root = document) {
  const imgs = [...root.querySelectorAll('img')]
  await Promise.all(imgs.map(img => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve()
    return new Promise(resolve => {
      img.addEventListener('load', resolve, { once: true })
      img.addEventListener('error', resolve, { once: true })
    })
  }))
}

// Exported (not just used internally) so tools/harness-capture.mjs's
// consumer — LibraryViewer.vue's `?capture=1` mode (plans/tickets/in-progress/visual-capture-rig.md) —
// waits on the same real settle conditions (images loaded, fonts ready, a
// short delay for CSS transitions/entrance motion to finish) instead of a
// second hand-rolled version or an arbitrary fixed timeout.
export async function waitForCaptureReady ({ root = document, minDelayMs = 1200 } = {}) {
  await waitForImages(root)
  if (document.fonts?.ready) await document.fonts.ready
  await new Promise(r => setTimeout(r, minDelayMs))
}

const BUNDLE_ENDS_AT =
  Date.now() + 20 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000 + 34 * 60 * 1000

function cpCoinFor (assets, amount) {
  return assets.content.cpCoins?.[amount] ?? assets.content.skuCodPoint
}

function demoBundle (assets, strings) {
  return {
    bannerImage: assets.content.bannerTerminator2,
    skuImage: assets.content.skuVmpJudgementDay,
    skuOnBanner: true,
    title: '2,600 CP + BONUS VMP - JUDGEMENT DAY',
    subtitle: 'TERMINATOR 2',
    currentPrice: '$0.99',
    originalPrice: '$1.99',
    discountPercent: '-49%',
    limitLabel: 'Limit: 1 per account',
    loyaltyPoints: 72,
    endsAt: BUNDLE_ENDS_AT,
    items: [
      {
        image: assets.content.itemVmpJudgementDay,
        tileBg: 'var(--x-rarity-gradient-legendary)',
        tag: { label: strings.sku.bonusTag, variant: 'value' },
        quantity: 1,
        name: 'VMP - JUDGEMENT DAY',
        description: 'A Terminator 2-themed weapon blueprint for the VMP.',
      },
      {
        image: cpCoinFor(assets, 2600),
        quantity: 2600,
        tileBg: 'var(--x-rarity-gradient-common)',
        name: '2,600 CP',
        description: 'Call of Duty Points.',
      },
    ],
  }
}

function demoCheckoutItem (assets, strings) {
  return {
    amount: 88,
    baseAmount: 80,
    bonusAmount: 8,
    bonusLabel: strings.sku.bonusLabel,
    originalPrice: '$1.99',
    discountPercent: '-49%',
    currentPrice: '$0.99',
    skuImage: cpCoinFor(assets, 88),
    loyaltyPoints: null,
  }
}

function resetFlowState () {
  const auth = useAuth()
  const checkout = useCheckout()
  const summary = useItemSummary()

  auth.closeSignInSheet()
  auth.closeAccountMenu()
  auth.dismissSnackbar()
  auth.cancelSignIn()
  auth.signOut()

  checkout.closeCheckout()
  checkout.dismissBuyNow()
  checkout.setGuestVerified(false)
  checkout.selectedChannel.value = null

  summary.closeItemSummary()
}

/**
 * Drive the prototype into a named purchase-flow step for Figma capture.
 * @param {string} step — one of FIGMA_CAPTURE_STEPS
 */
export async function applyFigmaCapture (step, hooks = {}) {
  if (!FIGMA_CAPTURE_STEPS.includes(step)) return

  const captureConfig = getFigmaCaptureConfig(step)

  if (captureConfig.theme) {
    useTheme().setTheme(captureConfig.theme)
  }

  const auth = useAuth()
  const checkout = useCheckout()
  const summary = useItemSummary()
  const { viewInfo } = usePurchaseFlow()
  const assets = useStoreAssets().value
  const strings = useStoreStrings().value
  const bundle = demoBundle(assets, strings)
  const item = demoCheckoutItem(assets, strings)

  resetFlowState()
  await nextTick()

  switch (step) {
    case 'codashop-homepage':
      hooks.goHome?.()
      break

    case 'sign-in-sheet':
      auth.openSignInSheet()
      break

    case 'sign-in-loader':
      auth.signingIn.value = true
      break

    case 'player-account-idle':
      break

    case 'player-account-found':
      checkout.setGuestPlayerName('1234567890123456789')
      checkout.setGuestVerified(true)
      break

    case 'item-summary':
      auth.signedIn.value = true
      summary.openItemSummary(bundle)
      break

    case 'checkout':
      auth.signedIn.value = true
      checkout.openCheckout(
        {
          label: bundle.title,
          currentPrice: bundle.currentPrice,
          bonusLabel: 'BUNDLE',
          skuImage: bundle.skuImage,
          loyaltyPoints: bundle.loyaltyPoints,
          bundleInfo: bundle,
        },
        `${bundle.title}|${bundle.currentPrice}`,
      )
      break

    case 'checkout-selected':
      auth.signedIn.value = true
      checkout.openCheckout(
        {
          label: bundle.title,
          currentPrice: bundle.currentPrice,
          bonusLabel: 'BUNDLE',
          skuImage: bundle.skuImage,
          loyaltyPoints: bundle.loyaltyPoints,
          bundleInfo: bundle,
        },
        `${bundle.title}|${bundle.currentPrice}`,
      )
      checkout.selectedChannel.value = 0
      break

    case 'item-info-on-checkout':
      auth.signedIn.value = true
      checkout.openCheckout(
        {
          label: bundle.title,
          currentPrice: bundle.currentPrice,
          bonusLabel: 'BUNDLE',
          skuImage: bundle.skuImage,
          loyaltyPoints: bundle.loyaltyPoints,
          bundleInfo: bundle,
        },
        `${bundle.title}|${bundle.currentPrice}`,
      )
      viewInfo(bundle)
      break

    default:
      break
  }

  await nextTick()

  if (step === 'player-account-idle' || step === 'player-account-found') {
    document.getElementById('player-account')?.scrollIntoView({ block: 'start' })
  }

  const screen = document.querySelector(captureConfig.selector ?? '.device__screen')
  await waitForCaptureReady({ root: screen ?? document, minDelayMs: step === 'codashop-homepage' ? 2000 : 1200 })

  // Signal capture tools that the UI has settled.
  document.documentElement.dataset.figmaCaptureReady = step
  document.documentElement.dataset.figmaCaptureSelector = captureConfig.selector ?? '.device-stage > .device'
}
