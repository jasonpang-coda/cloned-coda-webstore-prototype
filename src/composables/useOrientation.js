/**
 * useOrientation — portrait/landscape toggle for the framed device preview
 * (iPhone/Android only; irrelevant in Responsive mode). Shared singleton,
 * same globalThis-pinned pattern as useDeviceFrame.js.
 *
 * Values: 'portrait' | 'landscape'.
 */
import { ref } from 'vue'

const STATE = Symbol.for('webstore.useOrientation.state')

const orientation = globalThis[STATE] ?? (globalThis[STATE] = ref('portrait'))

export function useOrientation() {
  function toggle() {
    orientation.value = orientation.value === 'portrait' ? 'landscape' : 'portrait'
  }
  return { orientation, toggle }
}
