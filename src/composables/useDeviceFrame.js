/**
 * useDeviceFrame — the device-frame selector (iPhone / Android / Responsive)
 * as a shared singleton, so composables outside App.vue (usePwaInstall.js)
 * and tour flows (setup() hooks) can read/set it too.
 *
 * Previously this was a plain local `ref()` inside App.vue's own
 * `<script setup>`, mutated only via `v-model:device` from DeviceToolbar/
 * CommandConsole. Lifted here following the same globalThis-pinned
 * singleton pattern as useTheme.js/useDeviceDetect.js — App.vue's own
 * `device` binding now just aliases this composable's ref, so existing
 * `v-model:device="device"` usages are unaffected.
 *
 * Values: 'iphone' | 'samsung' (Android) | 'none' (Responsive) — see
 * CommandConsole.vue's DEVICES array.
 */
import { ref } from 'vue'

const STATE = Symbol.for('webstore.useDeviceFrame.state')

const device = globalThis[STATE] ?? (globalThis[STATE] = ref('iphone'))

export function useDeviceFrame() {
  return { device }
}
