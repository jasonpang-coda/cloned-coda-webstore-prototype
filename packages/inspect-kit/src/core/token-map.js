/**
 * token-map.js — runtime reverse-map of a CSS custom-property design-token
 * system, framework-free.
 *
 * There is usually no JSON token manifest for a CSS-custom-property design
 * system — tokens live only as `--*` declarations on `:root` (and per-theme
 * `[data-theme]` blocks). To tell a dev "this padding is --pad-surface-main",
 * the inspector must reverse a concrete computed value (e.g. "12px",
 * "rgb(20, 20, 22)", "350ms") back to the token name that produced it.
 *
 * Strategy:
 *   1. Enumerate every `--*` custom property off :root via getComputedStyle.
 *   2. Classify each by its resolved value (colour / length / duration /
 *      easing / motion-pair / other).
 *   3. Colours don't compute to a concrete rgb when read as a custom property
 *      (color-mix()/oklch() stay symbolic), so resolve each colour token
 *      through a throwaway probe element, giving a concrete rgb() string
 *      that matches what getComputedStyle returns for a real element's
 *      `color` / `background-color`.
 *
 * The whole map is rebuilt on invalidate() (call on theme switch) so
 * per-theme token differences reverse-map correctly.
 *
 * `tokenRules` lets a host describe its own prefix conventions instead of
 * hardcoding one design system:
 *   {
 *     colorPrefixes: RegExp,  // e.g. /^--(bg|text|border|...)/  — extra hint
 *                             // that a symbolic value (oklch()/color-mix())
 *                             // not otherwise classifiable is a colour token
 *     tierRank(name) → number // lower = preferred when several tokens share
 *                             // a value (semantic tier should win over the
 *                             // primitive it aliases)
 *   }
 * Both are optional; sane defaults classify by value shape alone and rank
 * every token equally.
 */

const NUM = '-?[\\d.]+'
const RE_LENGTH   = new RegExp(`^${NUM}(px|rem|em)$`)
const RE_DURATION = new RegExp(`^${NUM}m?s$`)

function defaultTierRank () { return 0 }

function classify (name, value, colorPrefixes) {
  const v = value.toLowerCase()
  const hasEase = v.includes('cubic-bezier') || /\b(ease|linear|steps)\b/.test(v)
  const hasDur  = /[\d.]+\s*m?s\b/.test(v)
  if (hasDur && hasEase) return 'motion'          // composite "350ms cubic-bezier(…)"
  if (hasEase && !hasDur) return 'easing'
  if (RE_DURATION.test(value)) return 'duration'
  if (RE_LENGTH.test(value)) return 'length'
  if (
    /oklch|oklab|rgb|hsl|color-mix|#[0-9a-f]/.test(v) ||
    (colorPrefixes && colorPrefixes.test(name))
  ) return 'color'
  return 'other'
}

function build (probe, tokenRules) {
  const cs = getComputedStyle(document.documentElement)
  const tierRank = tokenRules?.tierRank || defaultTierRank
  const colorPrefixes = tokenRules?.colorPrefixes || null
  const tokens = []
  for (const name of cs) {
    if (!name.startsWith('--')) continue
    const value = cs.getPropertyValue(name).trim()
    if (!value) continue
    const kind = classify(name, value, colorPrefixes)
    let norm = value
    if (kind === 'color') {
      probe.style.backgroundColor = ''
      probe.style.backgroundColor = `var(${name})`
      const c = getComputedStyle(probe).backgroundColor
      if (c && c !== 'rgba(0, 0, 0, 0)') norm = c
    }
    tokens.push({ name, value, kind, norm, rank: tierRank(name) })
  }
  return tokens
}

// ── value normalisers (compare like-for-like) ────────────────────────────────
function toMs (s) {
  const m = String(s).trim().match(/^(-?[\d.]+)(m?s)$/)
  if (!m) return null
  return m[2] === 's' ? parseFloat(m[1]) * 1000 : parseFloat(m[1])
}
function normEase (s) { return String(s).replace(/\s+/g, ' ').trim().toLowerCase() }

function sortByTier (list) {
  return list.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name))
}

/**
 * createTokenMap(tokenRules) → { matchToken, matchMotionPair, all, invalidate }
 *
 * Framework-free. A host wraps this with its own theme-change watcher and
 * calls `invalidate()` when the active theme changes.
 */
export function createTokenMap (tokenRules = {}) {
  let cache = null

  function rebuild () {
    const probe = document.createElement('div')
    probe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:0;height:0;opacity:0;pointer-events:none'
    document.documentElement.appendChild(probe)
    try {
      cache = build(probe, tokenRules)
    } finally {
      probe.remove()
    }
    return cache
  }

  function ensure () {
    if (!cache) rebuild()
    return cache
  }

  function invalidate () { cache = null }

  /**
   * matchToken(value, kind) → { name, value, all } | null
   *   value: a concrete computed CSS value ("12px" / "rgb(…)" / "0.35s" / "cubic-bezier(…)")
   *   kind:  'color' | 'length' | 'duration' | 'easing'
   * Returns the best (most semantic) token plus all candidates as `all`.
   */
  function matchToken (value, kind) {
    const tokens = ensure()
    if (value == null || value === '') return null
    let hits = []
    if (kind === 'color') {
      const v = value.trim()
      hits = tokens.filter(t => t.kind === 'color' && t.norm === v)
    } else if (kind === 'length') {
      const v = value.trim()
      hits = tokens.filter(t => t.kind === 'length' && t.norm === v)
    } else if (kind === 'duration') {
      const ms = toMs(value)
      if (ms == null) return null
      hits = tokens.filter(t => t.kind === 'duration' && toMs(t.value) === ms)
    } else if (kind === 'easing') {
      const v = normEase(value)
      hits = tokens.filter(t => t.kind === 'easing' && normEase(t.value) === v)
    }
    if (!hits.length) return null
    sortByTier(hits)
    return { name: hits[0].name, value: hits[0].value, all: hits.map(h => h.name) }
  }

  /**
   * matchMotionPair(durationCss, easingCss) → composite token name | null
   * Surfaces tokens whose value is a composite "350ms cubic-bezier(…)" pair
   * matching an animation/transition's duration+easing.
   */
  function matchMotionPair (durationCss, easingCss) {
    const tokens = ensure()
    const ms = toMs(durationCss)
    const ease = normEase(easingCss)
    if (ms == null) return null
    const hits = tokens.filter(t => {
      if (t.kind !== 'motion') return false
      const dm = t.value.match(/(-?[\d.]+m?s)/)
      const em = t.value.match(/(cubic-bezier\([^)]*\)|ease[a-z-]*|linear)/i)
      return dm && em && toMs(dm[1]) === ms && normEase(em[1]) === ease
    })
    if (!hits.length) return null
    sortByTier(hits)
    return hits[0].name
  }

  return { matchToken, matchMotionPair, all: ensure, invalidate }
}
