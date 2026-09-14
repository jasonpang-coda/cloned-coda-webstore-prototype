/**
 * useDeviceDetect — reactive "is this a touch/mobile device?" signal.
 *
 * Uses matchMedia('(pointer: coarse) and (hover: none)') — the standard
 * "primary input is a touchscreen, no hover" test — rather than user-agent
 * sniffing. Stays reactive (tablet rotation, devtools device emulation) via a
 * `change` listener on the MediaQueryList.
 *
 * Singleton pinned to a global symbol (mirrors useTheme) so every consumer
 * shares one ref even if this module is evaluated more than once under mixed
 * import specifiers. Exports a readonly ref — read everywhere, mutated only here.
 */
import { ref, readonly } from 'vue'

const MQ = '(pointer: coarse) and (hover: none)'

const STATE = Symbol.for('webstore.useDeviceDetect.state')
const WIRED = Symbol.for('webstore.useDeviceDetect.wired')

const mql = typeof matchMedia !== 'undefined' ? matchMedia(MQ) : null

const isMobile = globalThis[STATE]
  ?? (globalThis[STATE] = ref(mql ? mql.matches : false))

// Attach the listener once (first module evaluation) — the singleton ref is
// updated in place, so all consumers react.
if (mql && !globalThis[WIRED]) {
  globalThis[WIRED] = true
  mql.addEventListener('change', (e) => { isMobile.value = e.matches })
}

export function useDeviceDetect () {
  return { isMobile: readonly(isMobile) }
}
