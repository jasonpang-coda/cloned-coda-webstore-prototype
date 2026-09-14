/**
 * deepMerge — recursively merge `override` onto `base`, returning a new object.
 *
 * Used by useStoreStrings to layer a per-language translation (partial) over a
 * store's English `strings` base, so any untranslated key falls through to
 * English key-by-key.
 *
 * Rules:
 *  - Plain objects are merged recursively.
 *  - Arrays are replaced WHOLESALE (never element-merged) — a translated
 *    `page.tabs` / `nav.groups` must supply the full array, not a sparse patch.
 *  - Any other value (string, number, null, …) in `override` replaces `base`.
 *  - Keys present only in `base` are preserved.
 *  - Inputs are not mutated.
 */
function isPlainObject (v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

export function deepMerge (base, override) {
  if (!isPlainObject(override)) return override
  const out = { ...base }
  for (const key of Object.keys(override)) {
    const b = base?.[key]
    const o = override[key]
    out[key] = isPlainObject(b) && isPlainObject(o) ? deepMerge(b, o) : o
  }
  return out
}
