/**
 * useWebviewDetect — reactive "is this an in-app WebView (Instagram, TikTok,
 * Facebook, Line, WeChat, Twitter/X, Snapchat)?" signal.
 *
 * In-app browsers can't register a service worker, show the native install
 * prompt, or show the Notification permission prompt at all — confirmed dead
 * end on both axes, not just a degraded path. UA sniffing is the only signal
 * available for this (there's no feature-detectable API), same isolated,
 * deliberate exception as useIosPwaDetect.js — don't propagate UA sniffing
 * elsewhere.
 *
 * `forceWebviewInstallSheet` dev flag previews the flow from any real
 * browser, same "real condition OR a flag" pattern as usePwaInstall's
 * shouldOfferIos.
 *
 * Singleton pinned to globalThis (same rationale as useIosPwaDetect/useTheme).
 */
import { computed } from 'vue'
import { useFeatureFlags } from './useFeatureFlags.js'

const STATE = Symbol.for('webstore.useWebviewDetect.state')

const IN_APP_UA = /FBAN|FBAV|Instagram|Line\/|MicroMessenger|TikTok|BytedanceWebview|Snapchat|Twitter/i

function detect() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  return IN_APP_UA.test(ua)
}

const state = globalThis[STATE] ?? (globalThis[STATE] = { isWebviewUa: detect() })

export function useWebviewDetect() {
  const { isEnabled } = useFeatureFlags()
  const isWebview = computed(() => state.isWebviewUa || isEnabled('forceWebviewInstallSheet'))
  return { isWebview }
}
