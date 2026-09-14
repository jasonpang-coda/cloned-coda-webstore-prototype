/**
 * tools/lib/naming.mjs — case-conversion helpers shared by the scaffold and
 * harness tooling. Pulled out of tools/scaffold.mjs (which has no
 * import-guard around its CLI dispatch, so importing it directly for its
 * pure functions would also run its `process.argv`-driven side effects) so
 * they're unit-testable without spinning up the whole CLI.
 */

export function toKebabCase (str) {
  return str
    // Acronym boundary first: 'SKUCard' -> 'SKU-Card' (a run of 2+ uppercase
    // letters followed by a new Capitalized word). Without this pass, an
    // acronym-led name has no lower->upper transition anywhere for the next
    // rule to find, so it collapsed to one unbroken word ('skucard').
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

export function toCamelCase (str) {
  const s = str.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
  return s.charAt(0).toLowerCase() + s.slice(1)
}
