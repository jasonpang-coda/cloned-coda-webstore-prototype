/**
 * useStoreHome — per-store homepage data (Codashop's title-listing aggregator).
 *
 * Mirrors useStoreCatalog's registry pattern: the data lives in the store
 * module (src/stores/<store>/store.js, `home` key) so store-locked builds
 * that don't ship Codashop never bundle its tile art. Resolves to null for
 * every store that doesn't define `home` — App.vue's config.home gate is
 * what actually decides whether the homepage renders; this composable just
 * supplies its content once that gate is open.
 *
 * Shape: { categories: [ { id, label, titles: [ { name, publisher?, cat,
 *   ribbon?, rating?, tile } ] } ], publisherSpotlight?: { logo, logoAlt,
 *   titles: [ { name, cat, ribbon?, tile } ] } }
 */
import { computed } from 'vue'
import { useTheme } from './useTheme.js'
import { ACTIVE_STORES } from '@active-stores'

const HOME_REGISTRY = Object.fromEntries(ACTIVE_STORES.map(s => [s.key, s.home ?? null]))

export function useStoreHome () {
  const { theme } = useTheme()
  return computed(() => HOME_REGISTRY[theme.value] ?? null)
}
