/**
 * useStoreConfig — per-store capability / behaviour map
 *
 * The third whitelabel layer, alongside the CSS token cascade (themes/<store>.css)
 * and the image registry (useStoreAssets). Where those handle look (colour/type/
 * surface) and imagery, this handles STRUCTURE & COPY: whether a region renders,
 * which layout mode a list uses, button labels, payment-logo polarity, etc.
 *
 * The per-store data lives in src/stores/<store>/store.js (config key) and is
 * assembled here from the @active-stores manifest, so store-locked builds only
 * carry the active store's config.
 *
 * Returns a computed of the active theme's config (reactive off useTheme), so a
 * theme switch re-resolves it with zero cost and no network request — the same
 * shape as useStoreAssets.
 *
 * THE RULE: components consume these store-AGNOSTIC capability flags
 * (config.checkout.showPoweredByCoda, config.skuList.layout) — they must NEVER
 * test `theme.value === '<store>'`. Store identity lives only in the store
 * modules and the theme CSS files.
 *
 * checkout.loyaltyFlag (optional): a store whose loyalty programme is pre-wired
 * but not yet launched (e.g. COD:M's Armory Point) can name a dev flag here
 * instead of setting checkout.loyalty to null outright. When that flag is off,
 * this composable nulls checkout.loyalty out for every consumer (NavBar's icon/
 * pill, the checkout loyalty banner, MilestoneRewards, …) in one place — no
 * component needs to know the flag exists. Every other store omits this key, so
 * its config passes through unchanged.
 */

import { computed } from 'vue'
import { useTheme } from './useTheme.js'
import { useFeatureFlags } from './useFeatureFlags.js'
import { ACTIVE_STORES } from '@active-stores'

const CONFIG = Object.fromEntries(ACTIVE_STORES.map(s => [s.key, s.config]))
const DEFAULT = ACTIVE_STORES[0].config

// Exported (not just used internally) so a caller that needs an EXPLICIT
// store's config without going through the single global active theme — the
// library viewer's theme-grid mode (all 12 stores rendered simultaneously,
// each needing its OWN config, not the one shared `theme` ref) — can get it
// directly, the same reason useStoreStrings.js exports `stringsFor`.
export function configFor (key) {
  const { isEnabled } = useFeatureFlags()
  const base = CONFIG[key] ?? DEFAULT
  const flagKey = base.checkout?.loyaltyFlag
  if (!flagKey || isEnabled(flagKey)) return base
  return { ...base, checkout: { ...base.checkout, loyalty: null } }
}

export function useStoreConfig () {
  const { theme } = useTheme()
  return computed(() => configFor(theme.value))
}
