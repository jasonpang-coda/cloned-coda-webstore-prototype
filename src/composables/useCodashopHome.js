import { ref } from 'vue'
import { closeAllOverlays } from './useCloseAllOverlays.js'
import { scrollToTop } from './useScrollReset.js'

/**
 * useCodashopHome — shared singleton for Codashop's aggregator-homepage /
 * product-page toggle (config.home gates it; every other store never reads
 * this ref). Lifted out of App.vue's local scope into a singleton, same
 * reason and pattern as useDeviceFrame.js: DeviceToolbar's "Pages" dropdown
 * needs to read/set it directly, without App.vue wiring a dedicated prop/emit
 * pair just for dev chrome.
 *
 * goHome()/openTitle() (not a raw homeView.value assignment) are the
 * sanctioned way to flip this — both also closeAllOverlays(), so switching
 * between Codashop's two pages never leaves a sheet/popup stranded over the
 * wrong one, regardless of whether the switch came from NavBar's logo or
 * DeviceToolbar's "Pages" dropdown.
 */
const homeView = ref(true)

function goHome() {
  homeView.value = true
  closeAllOverlays()
  scrollToTop({ smooth: false })
}

function openTitle() {
  homeView.value = false
  closeAllOverlays()
  scrollToTop({ smooth: false })
}

export function useCodashopHome() {
  return { homeView, goHome, openTitle }
}
