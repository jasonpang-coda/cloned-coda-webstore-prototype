/**
 * Tour Guide Registry — discovers all `*.tour.js` tour manifests under `./flows`.
 */

const modules = import.meta.glob('./flows/*.tour.js', { eager: true })

export const TOURS = Object.values(modules)
  .map(m => m.default)
  .filter(Boolean)
  .sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.title.localeCompare(b.title))

const byId = new Map(TOURS.map(f => [f.id, f]))

export function getTour (id) {
  return byId.get(id) || null
}
