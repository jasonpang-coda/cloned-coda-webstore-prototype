/**
 * tools/sandbox/lib/naming.mjs — tiny case-conversion helper, extracted from
 * export-sandbox.mjs so pack-kit.mjs can share it without duplicating.
 */
export function toKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}
