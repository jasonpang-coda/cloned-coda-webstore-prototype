/**
 * usePwaInstall — install-CTA state for the download-banner PWA row (see
 * App.vue's download-banner section, gated on strings.page.pwaInstall), and
 * the `variant` every TaskGiftSheet touchpoint reads to pick its content.
 *
 * Android/Chromium: captures the deferred `beforeinstallprompt` event once,
 * globally (available for any consumer that still wants a plain native
 * install prompt — TaskGiftSheet's own Android path no longer uses it, since
 * Web Push there doesn't require install; see `variant` below).
 * iOS Safari has no such event — `shouldOfferIos` (folded into `variant`)
 * gates the CTA to TaskGiftSheet's inline steps detour instead, based on
 * useIosPwaDetect's real-device check OR'd with the `forceIosInstallSheet`
 * dev flag (same "real condition OR a flag" pattern App.vue already uses for
 * fcmPaymentSheet/codmMilestoneRewards) OR'd with the device-frame selector
 * (useDeviceFrame.js) being set to iPhone — so switching the dev-toolbar/
 * command-console device to iPhone previews the
 * detour with zero extra steps, without needing the manual flag toggle.
 * Android ('samsung') and Responsive ('none') never trigger it this way —
 * only a genuine iOS device or the manual flag still can.
 *
 * No dismissal/frequency-cap logic — this is a static, always-visible row
 * (same visibility model as the App Store/Google Play badges next to it),
 * not an interruptive nudge, so it doesn't need cooldown state.
 *
 * `isInstalled` also honours the `pwaInstalledState` dev/variant flag, which
 * lets the Variants toolbar preview the "post PWA installed" store (every
 * install signpost swaps for a Web Push upsell — see useWebPush.js) without a
 * real install.
 *
 * Singleton pinned to globalThis (same rationale as useTheme/useDeviceDetect).
 */
import { ref, computed } from 'vue'
import { useIosPwaDetect } from './useIosPwaDetect.js'
import { useFeatureFlags } from './useFeatureFlags.js'
import { useDeviceFrame } from './useDeviceFrame.js'
import { useWebviewDetect } from './useWebviewDetect.js'

const STATE = Symbol.for('webstore.usePwaInstall.state')
const WIRED = Symbol.for('webstore.usePwaInstall.wired')

const deferredPrompt = globalThis[STATE] ?? (globalThis[STATE] = ref(null))

if (typeof window !== 'undefined' && !globalThis[WIRED]) {
  globalThis[WIRED] = true
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null
  })
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator?.standalone === true
  )
}

export function usePwaInstall() {
  const { isEligible: iosEligible } = useIosPwaDetect()
  const { isEnabled, flagValue } = useFeatureFlags()
  const { device } = useDeviceFrame()
  const { isWebview } = useWebviewDetect()

  // isStandalone() covers a real installed PWA; OR'd with the dev-only
  // `pwaInstalledState` variant flag so the "post PWA installed" preview
  // (Web Push upsell replacing every install signpost) can be toggled from
  // the Variants toolbar without a real install — same "real condition OR a
  // flag" pattern as forceIosInstallSheet above.
  const isInstalled = computed(() =>
    isStandalone() || flagValue('pwaInstalledState') === 'installed',
  )
  const canPrompt = computed(() => !!deferredPrompt.value)
  const shouldOfferIos = computed(() =>
    device.value === 'iphone' || iosEligible.value || isEnabled('forceIosInstallSheet'),
  )

  // Merged install/notify sheet variant — webview beats iOS (an iPhone inside
  // Instagram's in-app browser is still a dead end on both axes, so it must
  // get the "open in your browser" content, not the Add-to-Home-Screen one).
  // Everything else (Android/Chromium, desktop) is the plain 'android' path.
  const variant = computed(() => {
    if (isWebview.value) return 'webview'
    if (shouldOfferIos.value) return 'ios'
    return 'android'
  })

  async function promptInstall() {
    if (!deferredPrompt.value) return null
    deferredPrompt.value.prompt()
    const choice = await deferredPrompt.value.userChoice
    deferredPrompt.value = null
    return choice
  }

  return {
    isInstalled,
    canPrompt,
    shouldOfferIos,
    variant,
    promptInstall,
  }
}
