/**
 * useStoreCatalog — per-store SKU catalogue tree
 *
 * Whitelabel data layer for stores that use the 'filter' page model
 * (config.catalog.mode === 'filter'). Returns a computed category tree for
 * the active store, or null for stores in 'page' mode (e.g. codm).
 *
 * The catalogue itself is built inside the store module (e.g.
 * src/stores/fcm/catalog.js — eager import.meta.glob over that store's image
 * folders), so store-locked builds never bundle another store's catalogue
 * imagery. This composable is just the reactive theme gate.
 *
 * Structure:
 *   [ { id, label, subcategories: [ { id, label, cardType, items[] } ] } ]
 *
 * cardType 'bundle' → items shaped for BundleSkuCard
 * cardType 'sku'    → items are stubs (image + title); SkuCard rendering deferred
 */

import { computed } from 'vue'
import { useTheme } from './useTheme.js'
import { ACTIVE_STORES } from '@active-stores'

// Registry pattern: mirrors useStoreConfig / useStoreAssets — store identity is
// encoded in the key, never tested with `=== '<store>'` inside the composable.
const CATALOG_REGISTRY  = Object.fromEntries(ACTIVE_STORES.map(s => [s.key, s.catalog]))
const FEATURED_REGISTRY = Object.fromEntries(ACTIVE_STORES.map(s => [s.key, s.featured]))
const SKUS_REGISTRY     = Object.fromEntries(ACTIVE_STORES.map(s => [s.key, s.skus ?? null]))
const INTENTS_REGISTRY  = Object.fromEntries(ACTIVE_STORES.map(s => [s.key, s.intents ?? null]))
const MILESTONE_REGISTRY = Object.fromEntries(ACTIVE_STORES.map(s => [s.key, s.milestone ?? null]))

export function useStoreCatalog() {
  const { theme } = useTheme()
  // Stores without a catalogue resolve to null (page model assumed).
  return computed(() => CATALOG_REGISTRY[theme.value] ?? null)
}

/**
 * Returns a computed array of featured / best-seller items for the active store,
 * or null when the store has no featured items. Items are shaped for FeaturedCarousel
 * (BundleSkuCard props: bannerImage, skuImage, skuOnBanner, title, subtitle, currentPrice, items).
 */
export function useFeaturedItems() {
  const { theme } = useTheme()
  return computed(() => FEATURED_REGISTRY[theme.value] ?? null)
}

/**
 * Returns a computed skus object for the active store, or null when the store
 * has no per-store SKU overrides. Shape: { cpImageRegular: Item[] }
 */
export function useStoreSkus() {
  const { theme } = useTheme()
  return computed(() => SKUS_REGISTRY[theme.value] ?? null)
}

/**
 * Returns a computed array of L1 "intent" nodes for the active store, or null
 * for stores that don't opt into the multi-level nav pilot (config.nav.multiLevel).
 * Structure: [ { id, label, categories } ] — `categories` is shaped exactly like
 * useStoreCatalog()'s tree, so any intent's categories can drive CategoryCatalog
 * unchanged.
 */
export function useStoreIntents() {
  const { theme } = useTheme()
  return computed(() => INTENTS_REGISTRY[theme.value] ?? null)
}

/**
 * Returns a computed "Milestone Rewards" campaign object for the active
 * store, or null when the store has no milestone campaign (every store but
 * FCM today). Shape: { header, hero, description, progression, rewards[] } —
 * see src/stores/fcm/milestone.js.
 */
export function useStoreMilestone() {
  const { theme } = useTheme()
  return computed(() => MILESTONE_REGISTRY[theme.value] ?? null)
}
