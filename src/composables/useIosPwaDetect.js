/**
 * useIosPwaDetect — reactive "is this a real, supported iOS Safari that can
 * Add-to-Home-Screen?" signal.
 *
 * iOS Safari has no `beforeinstallprompt` and no other feature-detectable
 * install API, so unlike useDeviceDetect.js (which deliberately avoids UA
 * sniffing via matchMedia) this composable is a deliberate, isolated
 * exception — there is no alternative for detecting the real platform here.
 * Keep UA sniffing confined to this file; don't propagate the pattern
 * elsewhere.
 *
 * Singleton pinned to globalThis (same rationale as useDeviceDetect/useTheme
 * — mixed import specifiers must not fork the state).
 */
import { computed } from 'vue'

const STATE = Symbol.for('webstore.useIosPwaDetect.state')

function detect() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const isIos = /iPad|iPhone|iPod/.test(ua)
  const versionMatch = ua.match(/OS (\d+)_/)
  const iosMajorVersion = versionMatch ? Number(versionMatch[1]) : 0
  return { isIos, iosMajorVersion }
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari's own (non-standard) flag — not covered by the media query.
    window.navigator?.standalone === true
  )
}

const state = globalThis[STATE] ?? (globalThis[STATE] = detect())

export function useIosPwaDetect() {
  const isInstalled = computed(() => isStandalone())
  const isEligible = computed(() =>
    state.isIos && state.iosMajorVersion >= 16 && !isInstalled.value,
  )
  return {
    isIos: state.isIos,
    iosMajorVersion: state.iosMajorVersion,
    isInstalled,
    isEligible,
  }
}
