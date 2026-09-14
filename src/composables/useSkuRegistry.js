import { onUnmounted } from 'vue'

/**
 * useSkuRegistry — shared singleton letting checkout deep-linking
 * (`?sku=<key>` in useUrlState.js) resolve a card's synthetic itemKey (e.g.
 * `"199|$4.99"` — see each card family's own `itemKey` computed) back to the
 * full item props object openCheckout() needs.
 *
 * Every SKU card family (SkuCard, BestSellerCard, BundleSkuCard, HeroSkuCard,
 * ProdHighlightedSkuCard, SkuImageCard) already derives an `itemKey` and an
 * item-shaped object to pass to openCheckout() on tap — this registry just
 * makes that same key→item mapping available BEFORE a tap happens, so
 * useUrlState can call openCheckout() itself on boot.
 *
 * Cards register a GETTER, not a snapshot, so a lookup always reads current
 * props (relevant for e.g. a live-priced item), and unregister on unmount so
 * a stale key — e.g. after switching category, where a different item can
 * reuse the same synthesized key — never resolves to a torn-down card's last
 * props.
 *
 * globalThis-pinned like useTheme.js/useDeviceFrame.js, for the same reason:
 * a mixed-specifier import of this module must still share one Map.
 */
const STATE = Symbol.for('webstore.useSkuRegistry.state')
const registry = globalThis[STATE] ?? (globalThis[STATE] = new Map())

export function useSkuRegistry () {
  function register (key, getItem) {
    if (!key) return
    registry.set(key, getItem)
    onUnmounted(() => { if (registry.get(key) === getItem) registry.delete(key) })
  }
  function resolve (key) {
    const getItem = registry.get(key)
    return getItem ? getItem() : null
  }
  return { register, resolve }
}
