// Token-reading helpers — ported from docs/Handoff/_handoff-kit/template/.vitepress/theme/utils/tokens.js.
// Per-flow token catalogs live in each flows/*.flow.js manifest, not here.

/** Read a CSS custom property from an element (defaults to :root). */
export function getToken (name, el = null) {
  const target = el || (typeof document !== 'undefined' ? document.documentElement : null)
  if (!target) return ''
  return getComputedStyle(target).getPropertyValue(name).trim()
}

/** Parse "350ms" / "0.35s" → 350 */
export function parseDuration (val) {
  if (!val) return 0
  const n = parseFloat(String(val).replace(/ms|s$/i, ''))
  if (String(val).endsWith('s') && !String(val).endsWith('ms')) return n * 1000
  return n || 0
}

/** Resolve a composite token like "350ms cubic-bezier(...)" into { duration, easing }. */
export function parseTransitionToken (val) {
  if (!val) return { duration: 0, easing: 'linear' }
  const parts = val.split(/\s+(cubic-bezier|linear)/)
  if (parts.length >= 3) {
    return { duration: parseDuration(parts[0]), easing: `${parts[1]}${parts[2]}` }
  }
  return { duration: parseDuration(val), easing: 'linear' }
}

/** The easing primitives offered by TokenSandbox's selects. */
export const EASING_OPTIONS = [
  { label: 'Standard', value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  { label: 'Decelerate', value: 'cubic-bezier(0, 0, 0.2, 1)' },
  { label: 'Accelerate', value: 'cubic-bezier(0.4, 0, 1, 1)' },
  { label: 'Spring', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  { label: 'Linear', value: 'linear' },
]

/**
 * Resolve every token in `names` against `el` (defaults to <html>), returning
 * a plain { name: value } map. Used by resolve.js's per-theme sampling and by
 * TokenLibrary/TokenContract to display the live value under the active theme.
 */
export function resolveTokens (names, el = null) {
  const out = {}
  for (const name of names) out[name] = getToken(name, el)
  return out
}
