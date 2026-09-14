/**
 * registry — discovers every *.stories.js under ./stories and exposes them as a
 * grouped, ordered list plus lookups by id and by component identity.
 *
 * `import.meta.glob(..., { eager: true })` is build-time: in a store-locked
 * ("isolated") build nothing imports this module (the LibraryViewer is lazily
 * imported only behind `!__STORE_LOCKED__`), so the whole stories tree
 * tree-shakes out — the viewer and its data never reach the shipped bundle.
 *
 * Adding a component to the library is purely additive: drop a new
 * `Foo.stories.js` file in ./stories and it appears automatically; no edits here.
 */

const modules = import.meta.glob('./stories/*.stories.js', { eager: true })

// Flat list of validated story objects (default export of each file).
export const STORIES = Object.values(modules)
  .map(m => m.default)
  .filter(Boolean)
  .sort((a, b) => a.title.localeCompare(b.title))

// id → story
const byId = new Map(STORIES.map(s => [s.id, s]))
// component definition → story (for the inspector "View in library" jump)
const byComponent = new Map(STORIES.map(s => [s.component, s]))

export function getStory (id) {
  return byId.get(id) || null
}

/**
 * Resolve a story from a live inspector selection. Matches on the component
 * definition first (most reliable — story files import the same SFC module),
 * then falls back to a case-insensitive name match against the story id/title.
 */
export function findStory ({ component, name } = {}) {
  if (component && byComponent.has(component)) return byComponent.get(component)
  if (name) {
    const slug = String(name).toLowerCase()
    for (const s of STORIES) {
      if (s.id === slug) return s
      if (s.title.toLowerCase().replace(/\s+/g, '') === slug.replace(/\s+/g, '')) return s
    }
  }
  return null
}

export function hasStoryFor ({ component, name } = {}) {
  return !!findStory({ component, name })
}

/** Stories grouped by `group`, groups alphabetised, stories already title-sorted. */
export const GROUPS = (() => {
  const map = new Map()
  for (const s of STORIES) {
    if (!map.has(s.group)) map.set(s.group, [])
    map.get(s.group).push(s)
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([group, stories]) => ({ group, stories }))
})()
