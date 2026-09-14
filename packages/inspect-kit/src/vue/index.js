import { setConfig, getConfig } from './config.js'
import InspectorOverlay from './InspectorOverlay.vue'

export { useInspector } from './useInspector.js'
export { useTokenMap } from './useTokenMap.js'
// Exposed so a host surface can retarget the inspector at runtime — e.g. the
// handoff surface pointing `screenRoot` at its component stage instead of the
// live storefront while its Components tab is open (see config.js's header
// comment on why this is safe: setConfig mutates one stable object in place).
export { setConfig, getConfig }

// Mount this once at the host app's root, alongside its own root-level
// overlays — NOT inside any transformed/scaled/clipped ancestor (see
// InspectorOverlay.vue's header comment).
export { InspectorOverlay as InspectorLayer }

/**
 * createInspector(opts) → Vue plugin
 *
 * See config.js for the full option list and defaults. Usage:
 *
 *   app.use(createInspector({
 *     screenRoot: '.device__screen',
 *     chromeSelectors: '.toolbar, .inspector, .lib__sidebar',
 *     enabled: () => !__STORE_LOCKED__,
 *     resolveSource: (file) => import(`/@fs${file}?raw`).then(m => m.default),
 *     libraryLink: (component) => { ... },
 *   }))
 */
export function createInspector (opts = {}) {
  return {
    install () {
      setConfig(opts)
    },
  }
}
