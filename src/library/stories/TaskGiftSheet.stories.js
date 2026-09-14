import TaskGiftSheet from '@/components/TaskGiftSheet.vue'
import { defineStory } from '../story.js'
import { useTaskGiftClaim } from '../../composables/useTaskGiftClaim.js'
import { usePwaInstall } from '../../composables/usePwaInstall.js'
import { useWebPush } from '../../composables/useWebPush.js'

const { openSheet, closeSheet, claim, unclaim } = useTaskGiftClaim()
const { isInstalled } = usePwaInstall()
const { subscribed } = useWebPush()

// Snapshot + restore the two prerequisite flags this story forces per-variant
// (install/push are both real, persisted singletons shared with the rest of
// the app — a story that flips them must put them back).
let savedInstalled, savedSubscribed
function snapshot() {
  savedInstalled = isInstalled.value
  savedSubscribed = subscribed.value
}
function restore() {
  isInstalled.value = savedInstalled
  subscribed.value = savedSubscribed
  closeSheet()
  unclaim()
}

export default defineStory({
  id: 'task-gift-sheet',
  title: 'Task Gift Sheet',
  group: 'Overlays',
  component: TaskGiftSheet,
  overlay: true,
  tokens: [
    '--x-text-header-default',
    '--x-size-icon-l',
    '--x-motion-sku-hover',
    '--x-text-header-strong',
    '--x-motion-sys-duration-fast',
    '--x-motion-sys-ease-accelerate',
    '--x-motion-sys-duration-base',
    '--x-motion-sys-ease-decelerate',
    '--x-bg-indicator-success-default',
    '--x-motion-sys-duration-slowest',
    '--x-motion-sys-duration-slow',
    '--x-gap-content-loose',
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
    '--x-text-body-soft',
    '--x-motion-sys-ease-standard',
    '--x-text-success-default',
    '--x-radius-badge-full',
    '--x-gap-content-narrow',
    '--x-size-control-m',
    '--x-pad-surface-l',
    '--x-radius-control-full',
    '--x-bg-action-primary',
    '--x-text-on-primary',
    '--x-fx-ripple-color-dark',
    '--x-radius-container-s',
    '--x-bg-card-default',
    '--x-surface-ghost-2',
  ],
  states: ['default'],
  notes:
    'THE merged install/notify sheet — every install/enable-notifications ' +
    'touchpoint in the store opens this one component (useTaskGiftClaim.js); ' +
    'there is no separate standalone install sheet any more. Its body is fully ' +
    'driven by `step` ("install" → "push" → "claim" → "claimed") and `variant` ' +
    '("ios" | "webview" | "android", from usePwaInstall.js). Android skips ' +
    '"install" entirely (Web Push there doesn\'t need it) and shows its single ' +
    'requirement as prose instead of a checklist; iOS/webview keep the 2-item ' +
    'checklist, with "install" driving a media+steps detour rendered INLINE ' +
    '(showStepsDetour, via BaseSheet\'s contentKey engine growing this one ' +
    'sheet) rather than opening a second sheet on top of it — stacking two ' +
    'sheets for one action would read as a glitch. Opened from both the ' +
    'Gifts-category GiftSkuCard and the Order Complete banner — both read the ' +
    'same shared singleton, so progress made on either surface shows here.',
  rules: [
    'step is entirely derived from isInstalled + subscribed (usePwaInstall/useWebPush) plus the persisted claimed flag — there is no local "current step" prop to set directly.',
    'variant is entirely derived from device/UA (usePwaInstall\'s shouldOfferIos + useWebviewDetect\'s isWebview) — there is no local "current variant" prop to set directly; preview it via the device-frame selector (iPhone → ios) or the forceWebviewInstallSheet dev flag.',
    'showStepsDetour is local UI state, separate from step — closing the sheet while viewing it returns to the checklist instead of dismissing the whole sheet (onSheetClose checks it first).',
    'justClaimed (the one-shot success glow) is a transient flag set only the moment Claim is tapped — reopening an already-claimed sheet must never replay it.',
    'upsellItem is optional, same contract as ClaimGiftSheet\'s — its absence falls back to a plain gotIt-style CTA in the claimed view.',
  ],
  variants: [
    {
      name: 'Step 1 — install PWA',
      setup: () => { snapshot(); isInstalled.value = false; subscribed.value = false; openSheet() },
      teardown: () => restore(),
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Step 2 — enable push',
      setup: () => { snapshot(); isInstalled.value = true; subscribed.value = false; openSheet() },
      teardown: () => restore(),
      props: () => ({ isMobile: true }),
    },
    {
      name: 'Claimed — with upsell',
      setup: () => { snapshot(); isInstalled.value = true; subscribed.value = true; openSheet(); claim() },
      teardown: () => restore(),
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
