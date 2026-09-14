import { createTokenMap } from '../core/token-map.js'
import { getConfig } from './config.js'

/**
 * useTokenMap — Vue-facing singleton wrapper over core/token-map.js.
 *
 * Rebuilds are cheap-ish but not free (walks every `:root` custom property),
 * so the cache is invalidated only when the host's theme attribute actually
 * changes — watched via MutationObserver on <html> rather than importing the
 * host's own theme composable, so this package stays decoupled from any
 * particular state-management choice.
 */
let map = null
let observing = false

function ensureObserving () {
  if (observing || typeof MutationObserver === 'undefined') return
  observing = true
  const { themeAttr } = getConfig()
  if (!themeAttr) return
  const observer = new MutationObserver((mutations) => {
    if (mutations.some(m => m.attributeName === themeAttr)) map.invalidate()
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [themeAttr] })
}

export function useTokenMap () {
  if (!map) map = createTokenMap(getConfig().tokenRules)
  ensureObserving()
  return map
}
