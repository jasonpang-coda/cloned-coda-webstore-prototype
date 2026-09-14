import { ref } from 'vue'

/**
 * useNavDrawer — shared singleton for the hamburger nav drawer's open state.
 * Lifted out of App.vue's local scope (same reason/pattern as
 * useCodashopHome.js / useDeviceFrame.js) so useCloseAllOverlays.js can close
 * it directly without App.vue wiring a dedicated prop/emit pair just for that.
 */
const menuOpen = ref(false)

export function useNavDrawer() {
  return { menuOpen }
}
