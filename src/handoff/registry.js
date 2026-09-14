/**
 * registry — discovers every *.flow.js under ./flows and exposes them as an
 * ordered list plus a lookup by slug (mirrors src/library/registry.js).
 *
 * `import.meta.glob(..., { eager: true })` is build-time: in a store-locked
 * ("isolated") build nothing imports this module (HandoffApp is lazily
 * imported only behind `!__STORE_LOCKED__` in App.vue), so the whole flows
 * tree tree-shakes out — handoff data never reaches the shipped bundle.
 *
 * Adding a feature to the handoff is purely additive: drop a new
 * `<slug>.flow.js` file in ./flows and it appears automatically.
 */

const modules = import.meta.glob('./flows/*.flow.js', { eager: true })

export const FLOWS = Object.values(modules)
  .map(m => m.default)
  .filter(Boolean)
  .sort((a, b) => a.title.localeCompare(b.title))

const bySlug = new Map(FLOWS.map(f => [f.slug, f]))

export function getFlow (slug) {
  return bySlug.get(slug) || null
}
