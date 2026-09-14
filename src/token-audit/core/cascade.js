/**
 * cascade.js — the cascade/specificity engine, extracted from the original
 * scripts/resolve-css.mjs so it can run in the browser (no `node:fs`) as
 * well as in a Node CLI. Framework-free: takes source *text*, never touches
 * the filesystem.
 *
 * Re-derives the cascade result exactly as the browser would compute it, by
 * parsing the token CSS files in the order src/main.js imports them and
 * simulating the import-order + specificity rule from the web-store-tokens
 * skill (§3): `html[data-theme="x"]` (specificity 0,1,1) always wins over a
 * bare `:root` or `[data-theme="x"]` declaration (specificity 0,1,0)
 * regardless of source order; among declarations of EQUAL specificity, the
 * later-imported file wins.
 *
 * Unlike the original, every declaration — winner AND losers — is kept with
 * its provenance (file, line, selector, wins/losesTo). That's what turns a
 * pure value-resolver into a drift detector: a losing `[data-theme="x"]`
 * declaration whose value never reaches any consumer *is* the dead-override
 * bug class this repo keeps re-introducing (see drift-audit.md §1).
 *
 * Parsing is store-INDEPENDENT: a selector's store key (if any) is read off
 * the selector itself (`[data-theme="codm"]` etc.), not passed in. So every
 * source file is parsed exactly once and the same declaration list feeds the
 * cascade for all 13 stores — this is also what makes it possible to build
 * the "declared token universe" (used by the audit's classify step) without
 * re-parsing per store.
 *
 * Two bugs fixed here vs. the original resolve-css.mjs:
 *  1. ROOT_TIER_FILES was missing `light.css` and `materials.css` — src/main.js
 *     imports them between ds/extensions.css and motion.css (see below), so
 *     31 tokens were invisible to the old resolver and every var() chain that
 *     passed through them resolved to `(unresolved: --x)`.
 *  2. The old parser's `root.walkRules()` descended into `@media
 *     (dynamic-range: high)` blocks and merged their HDR-only overrides into
 *     the base cascade as if unconditional — and because those blocks use
 *     `html[data-theme]` and sit later in the file, they *won*, silently
 *     replacing every SDR value with its (out-of-gamut) HDR sibling. HDR
 *     declarations are now parsed into a separate `hdr` layer and never
 *     merged into the base map.
 */
import postcss from 'postcss'

// Mirrors src/main.js's import order for the :root structural tiers (the
// store's own theme.css is prepended per-store by the caller, since main.js
// pulls it in first via `import '@active-stores'`).
export const ROOT_TIER_FILES = [
  'ds/system.css',
  'ds/semantics.css',
  'ds/space.css',
  'ds/text-styles.css',
  'ds/extensions.css',
  'light.css',
  'materials.css',
  'motion.css',
  'motion-sku.css',
  'motion-trust.css',
  'keyframes.css',
  'effects.css',
  'reduced-motion.css',
]

// The four files whose :root declarations form the prod-contract set (see
// docs/token-reconcile.md — the --x- prefix rename target). Relative to
// src/tokens/.
export const PROD_CONTRACT_FILES = [
  'ds/system.css',
  'ds/semantics.css',
  'ds/space.css',
  'ds/text-styles.css',
]

const THEME_ATTR_RE = /^(html)?\[data-theme=(?:"([^"]+)"|'([^']+)'|([^\]]+))\](.*)$/

/**
 * Classify one selector. Returns null for anything irrelevant to token
 * resolution. `store` is the theme key read off the selector itself (null
 * for a bare `:root`, which applies to every store). `variant` carries any
 * EXTRA attribute selector chained after the theme attribute, e.g.
 * `[data-home-layout="blob"]` on
 * `html[data-theme="codashop"][data-home-layout="blob"]` — a conditional
 * sub-theme scope (sku-material, colour-scheme, home-layout, body-font),
 * never merged into the unconditional base cascade.
 */
function parseSelector (sel) {
  const norm = sel.replace(/\s+/g, '')
  if (norm === ':root') return { kind: 'root', store: null, variant: null, specificity: [0, 1, 0] }
  const m = norm.match(THEME_ATTR_RE)
  if (!m) return null
  const html = !!m[1]
  const store = m[2] ?? m[3] ?? m[4]
  const variant = m[5] || null
  return {
    kind: html ? 'html-theme-attr' : 'theme-attr',
    store,
    variant,
    specificity: html ? [0, 1, 1] : [0, 1, 0],
  }
}

/** True if `rule` sits inside an `@media (dynamic-range: high)` block. */
function isUnderHdrMedia (rule) {
  let p = rule.parent
  while (p && p.type !== 'root') {
    if (p.type === 'atrule' && p.name === 'media' && /dynamic-range/i.test(p.params || '')) return true
    p = p.parent
  }
  return false
}

/**
 * Parse one source file's text into a flat list of declaration records, in
 * document order. `importIndex` is the caller-assigned position in the
 * resolved-order file list (theme file, then ROOT_TIER_FILES) — used only
 * when a caller later filters/orders per store; parsing itself doesn't need
 * a store key.
 */
export function parseSource (file, text, importIndex = 0) {
  const out = []
  let root
  try {
    root = postcss.parse(text, { from: file })
  } catch {
    return out
  }
  root.walkRules((rule) => {
    const hdr = isUnderHdrMedia(rule)
    const selectors = rule.selector.split(',').map((s) => s.trim())
    for (const sel of selectors) {
      const parsed = parseSelector(sel)
      if (!parsed) continue
      const layer = hdr ? 'hdr' : (parsed.variant ? 'variant' : 'base')
      rule.walkDecls((d) => {
        if (!d.prop.startsWith('--')) return
        out.push({
          name: d.prop,
          file,
          line: d.source?.start?.line ?? null,
          selector: sel,
          selectorKind: parsed.kind,
          specificity: parsed.specificity,
          layer,
          variant: parsed.variant,
          importIndex,
          rawValue: d.value.trim(),
          store: parsed.store, // null = applies to every store (:root)
          wins: null,          // computed below, base layer only
          losesTo: null,
        })
      })
    }
  })
  return out
}

/**
 * Compute the winning declaration per token name within one layer, applying
 * the specificity + source-order rule. Mutates `wins`/`losesTo` on every
 * declaration passed in. Only meaningful for the 'base' layer — hdr/variant
 * layers apply conditionally, not competitively, so "dead override" has no
 * meaning there.
 */
function resolveLayerWinners (decls) {
  const byName = new Map()
  for (const d of decls) {
    if (!byName.has(d.name)) byName.set(d.name, [])
    byName.get(d.name).push(d)
  }
  const map = {}
  for (const [name, group] of byName) {
    const high = group.filter((d) => d.selectorKind === 'html-theme-attr')
    const normal = group.filter((d) => d.selectorKind !== 'html-theme-attr')
    const winner = high.length ? high[high.length - 1] : normal[normal.length - 1]
    if (!winner) continue
    map[name] = winner.rawValue
    for (const d of group) {
      d.wins = d === winner
      d.losesTo = d.wins
        ? null
        : {
            file: winner.file,
            line: winner.line,
            reason: high.length && d.selectorKind !== 'html-theme-attr'
              ? 'lower-specificity'
              : 'equal-specificity-later-source',
          }
    }
  }
  return map
}

/** Simple last-wins map for a set of declarations, no provenance bookkeeping. */
function lastWinsMap (decls) {
  const map = {}
  const high = decls.filter((d) => d.selectorKind === 'html-theme-attr')
  const normal = decls.filter((d) => d.selectorKind !== 'html-theme-attr')
  for (const d of normal) map[d.name] = d.rawValue
  for (const d of high) map[d.name] = d.rawValue
  return map
}

/** Resolve var(--x) / var(--x, fallback) chains against a raw map. Cycle-safe. */
export function resolveValue (value, rawMap, seen = new Set()) {
  if (!value) return value
  return value.replace(/var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,\s*([^)]+))?\)/g, (match, name, fallback) => {
    if (seen.has(name)) return `(cycle: ${name})`
    if (name in rawMap) return resolveValue(rawMap[name], rawMap, new Set([...seen, name]))
    if (fallback != null) return resolveValue(fallback.trim(), rawMap, seen)
    return `(unresolved: ${name})`
  })
}

/**
 * Build the ordered, per-file declaration list for one store: the theme
 * file first (mirrors main.js's `@active-stores` import), then
 * ROOT_TIER_FILES in order. `allDeclarations` is the full, store-independent
 * parse of every token source file (see buildDeclarationUniverse below).
 * Declarations are filtered to those relevant to this store (store === null
 * i.e. :root, or store === storeKey) and re-ordered by (file import index,
 * original position) so "later file wins" is well-defined.
 */
function declarationsForStore (allDeclarations, storeKey, fileOrder) {
  const indexOf = new Map(fileOrder.map((f, i) => [f, i]))
  return allDeclarations
    .filter((d) => d.store === null || d.store === storeKey)
    .filter((d) => indexOf.has(d.file))
    .map((d) => ({ ...d, importIndex: indexOf.get(d.file) }))
    // `allDeclarations` is in UNIVERSE parse order (whatever order the
    // caller listed source files in), not the resolved import order — sort
    // by the just-assigned importIndex so "last in array = later-imported =
    // wins at equal specificity" is actually true. Array.prototype.sort is
    // stable, so declarations from the same file keep their original
    // (document) order relative to each other.
    .sort((a, b) => a.importIndex - b.importIndex)
}

/**
 * Build the full cascade for one store from the store-independent
 * declaration universe. `fileOrder` is the ordered list of relative file
 * paths for this store: `[themeFile, ...ROOT_TIER_FILES]`.
 *
 * Returns:
 *   declarations — every `--x` declaration relevant to this store, winner
 *                   and losers, with provenance.
 *   base         — { name: resolvedValue } for the unconditional cascade.
 *   variants     — { [variantKey]: { name: resolvedValue } } for each
 *                   conditional sub-theme scope found, resolved as an
 *                   overlay on top of `base`.
 *   hdr          — { name: resolvedValue } for the `@media
 *                   (dynamic-range: high)` overlay on top of `base`, or null
 *                   if this store has no HDR block.
 */
export function buildCascadeForStore (allDeclarations, storeKey, fileOrder) {
  const declarations = declarationsForStore(allDeclarations, storeKey, fileOrder)

  const baseDecls = declarations.filter((d) => d.layer === 'base')
  const baseRaw = resolveLayerWinners(baseDecls)

  const hdrDecls = declarations.filter((d) => d.layer === 'hdr')
  const hdrOverlay = lastWinsMap(hdrDecls)
  const hdrRaw = { ...baseRaw, ...hdrOverlay }

  const variantKeys = [...new Set(declarations.filter((d) => d.layer === 'variant').map((d) => d.variant))]
  const variantRaw = {}
  for (const key of variantKeys) {
    const overlay = lastWinsMap(declarations.filter((d) => d.layer === 'variant' && d.variant === key))
    variantRaw[key] = { ...baseRaw, ...overlay }
  }

  const resolveMap = (raw) => {
    const out = {}
    for (const name of Object.keys(raw)) out[name] = resolveValue(raw[name], raw)
    return out
  }

  return {
    declarations,
    base: resolveMap(baseRaw),
    hdr: hdrDecls.length ? resolveMap(hdrRaw) : null,
    variants: Object.fromEntries(Object.entries(variantRaw).map(([k, raw]) => [k, resolveMap(raw)])),
    rawBase: baseRaw,
  }
}

/**
 * Parse every token source file exactly once (store-independent) and return
 * the flat declaration list. `sources` is `{ file, text }[]` covering
 * `ds/themes/*.css` plus every ROOT_TIER_FILES entry.
 */
export function buildDeclarationUniverse (sources) {
  return sources.flatMap((s) => parseSource(s.file, s.text))
}
