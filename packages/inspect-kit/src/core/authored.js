/**
 * authored.js — recover the ACTUAL authored `var(--token)` reference for a
 * picked element's CSS property, instead of reverse-guessing a token name
 * from the resolved computed value (see ./token-map.js for that strategy).
 *
 * `getComputedStyle(el)` has already resolved `var(--x-text-header-default)`
 * down to a concrete `oklch(...)` — the custom-property reference is gone by
 * the time it reaches computed style. To show the real token, this module
 * walks `document.styleSheets` directly (the same idiom already used by
 * `buildHoverOverride`/`standalone.js` in this package, `try/catch`-guarding
 * cross-origin sheets), finds every rule whose selector matches the element,
 * determines the CASCADE WINNER for the requested property (important >
 * specificity > source order — there is no browser API for this since
 * `getMatchedCSSRules()` was removed and no specificity library is available
 * here, so it's hand-rolled), and reads that rule's *authored* declaration
 * text via `CSSStyleRule.style.getPropertyValue(prop)` — which returns the
 * literal `var(--x-...)` string, not a resolved value.
 *
 * Resolved PER PICK (no caching) — inspection is a low-frequency manual
 * action, and a sheet walk is cheap at that cadence; this avoids having to
 * invalidate a cache on every stylesheet/theme change.
 *
 * Shorthand caveat (this is why a plain longhand-only read isn't enough):
 * when a declaration's value contains `var()`, the browser CANNOT expand a
 * shorthand into its constituent longhands at parse time (custom properties
 * are opaque token sequences substituted at computed-value time, so the UA
 * doesn't yet know if `--x-bg-sheet` resolves to a colour, an image, or a
 * full multi-part background list). So `rule.style.getPropertyValue(
 * 'background-color')` returns '' for a rule that wrote
 * `background: var(--x-bg-sheet)` — the value only shows up under the
 * shorthand's own name, `'background'`. SHORTHAND_FALLBACKS below lists the
 * shorthand(s) to retry when the primary longhand comes back empty.
 */

// Properties inherited by the CSS spec — for these, when no rule on the
// element itself declares the property, walk up to the nearest ancestor
// that does (mirrors how the browser would actually resolve the value).
// Non-inherited properties (background, border, padding, …) never walk.
const INHERITED = new Set(['color', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing'])

// prop → shorthand(s) to retry, nearest first, when the longhand isn't
// found as its own declaration (see the shorthand caveat above).
const SHORTHAND_FALLBACKS = {
  'padding-top': ['padding'], 'padding-right': ['padding'], 'padding-bottom': ['padding'], 'padding-left': ['padding'],
  'margin-top': ['margin'], 'margin-right': ['margin'], 'margin-bottom': ['margin'], 'margin-left': ['margin'],
  'background-color': ['background'],
  'border-top-color': ['border-color', 'border-top', 'border'],
  'border-top-width': ['border-width', 'border-top', 'border'],
  'font-size': ['font'],
  'font-weight': ['font'],
  'line-height': ['font'],
  'font-family': ['font'],
}

// Skip state-variant rules entirely when resolving the DEFAULT state — a
// `:hover`/`:disabled` declaration must never be reported as "the" authored
// token for the element's resting appearance. (The inspector's own state
// picker re-collects with the real state applied via class/attribute, at
// which point those rules legitimately win on their own merits.)
const STATE_SELECTOR_RE = /:(hover|active|focus(-visible|-within)?|disabled|checked|invalid|indeterminate)\b|\[disabled\b/i

// A rule whose selector is (or contains) a pseudo-element targets a
// generated box, not the real element — el.matches() can't evaluate it
// meaningfully, so skip rather than guess by stripping the pseudo-element.
const PSEUDO_ELEMENT_RE = /::[-a-zA-Z]+/

function splitSelectors (sel) {
  const out = []
  let depth = 0
  let cur = ''
  for (const ch of sel) {
    if (ch === '(' || ch === '[') depth++
    if (ch === ')' || ch === ']') depth--
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = '' } else cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

// Approximate CSS specificity as a single comparable integer
// (ids*10000 + classes/attrs/pseudo-classes*100 + type-selectors). Ignores
// the nested specificity of :not()/:is()/:where() arguments — a reasonable
// approximation for a dev handoff tool, not a spec-perfect cascade engine.
function specificityOf (sel) {
  const ids = (sel.match(/#[-\w]+/g) || []).length
  const classesEtc =
    (sel.match(/\.[-\w]+/g) || []).length +
    (sel.match(/\[[^\]]*\]/g) || []).length +
    (sel.match(/:[-\w]+(\([^)]*\))?/g) || []).length
  const types = (sel.match(/(^|[\s>+~(),])[a-zA-Z][-\w]*/g) || []).length
  return ids * 10000 + classesEtc * 100 + types
}

// Walk every stylesheet/rule (recursing into @media/@container/@supports/
// @layer grouping rules), collecting every declaration of `prop` on a
// CSSStyleRule whose selector matches `el`. @media is gated on
// window.matchMedia; @supports on CSS.supports; other grouping rules
// (@container, @layer) are included unconditionally — there is no runtime
// "does this container currently match" API, so a @container-scoped
// declaration may be reported even if its condition isn't currently true.
// Documented imprecision, acceptable for a handoff tool (it still shows a
// real authored token, just possibly not the one active at this exact
// viewport — the same ambiguity a human reading the stylesheet would face).
function collectMatchingDeclarations (el, prop) {
  const hits = []
  let order = 0

  function walk (rules) {
    if (!rules) return
    for (const rule of rules) {
      order++
      if (typeof CSSMediaRule !== 'undefined' && rule instanceof CSSMediaRule) {
        let ok = true
        try { ok = window.matchMedia(rule.conditionText).matches } catch { /* malformed condition — include */ }
        if (ok) walk(rule.cssRules)
        continue
      }
      if (typeof CSSSupportsRule !== 'undefined' && rule instanceof CSSSupportsRule) {
        let ok = true
        try { ok = CSS.supports(rule.conditionText) } catch { /* malformed condition — include */ }
        if (ok) walk(rule.cssRules)
        continue
      }
      if (rule instanceof CSSStyleRule) {
        const value = rule.style.getPropertyValue(prop)
        if (value && !PSEUDO_ELEMENT_RE.test(rule.selectorText)) {
          for (const sel of splitSelectors(rule.selectorText)) {
            if (STATE_SELECTOR_RE.test(sel)) continue
            let matches = false
            try { matches = el.matches(sel) } catch { /* unsupported/invalid selector — skip */ }
            if (!matches) continue
            hits.push({
              value,
              important: rule.style.getPropertyPriority(prop) === 'important',
              specificity: specificityOf(sel),
              order,
            })
          }
        }
        // CSS Nesting: a style rule can itself contain nested rules, exposed
        // via this SAME `.cssRules` property modern browsers now put on
        // every CSSStyleRule (not just grouping rules) — recurse into it
        // AFTER handling this rule's own declaration, never instead of.
        if (rule.cssRules && rule.cssRules.length) walk(rule.cssRules)
        continue
      }
      // @container, @layer, and any future grouping rule that isn't itself
      // a style rule (CSSStyleRule is handled above, deliberately first —
      // it now also carries a `.cssRules` property per the CSS Nesting
      // spec, so checking `rule.cssRules` before the instanceof check would
      // wrongly treat every style rule as a grouping rule and skip reading
      // its own declaration entirely).
      if (rule.cssRules) { walk(rule.cssRules); continue }
    }
  }

  for (const sheet of document.styleSheets) {
    try { walk(sheet.cssRules) } catch { /* cross-origin sheet — skip */ }
  }
  return hits
}

// Hints for picking the right var() out of a compound declaration with more
// than one, e.g. `border: var(--border-weight-default) solid
// var(--x-border-card-default)` — a colour-kind query should prefer the
// colour-flavoured token, not whichever var() happens to appear first.
const COLOR_HINT = /-(colou?r|bg-|text-|border(?!-weight))/i
const LENGTH_HINT = /-(radius|pad|gap|size|weight|space)/i

function extractToken (value, kind) {
  const names = [...value.matchAll(/var\(\s*(--[A-Za-z0-9-]+)/g)].map(m => m[1])
  if (!names.length) return { token: null, raw: true }
  if (names.length === 1) return { token: names[0], raw: false }
  const hint = kind === 'color' ? COLOR_HINT : kind === 'length' ? LENGTH_HINT : null
  const best = hint ? names.find(n => hint.test(n)) : null
  return { token: best || names[names.length - 1], raw: false }
}

/**
 * resolveAuthored(el, cssProp, { kind }) → { token, raw, authoredValue } | null
 *
 * `cssProp` is the real CSS longhand (e.g. 'color', 'background-color',
 * 'border-top-color', 'border-radius', 'font-size') — or an ARRAY of
 * longhands to try in order (e.g. the 4 padding sides), for a box-model
 * field whose "representative" side isn't fixed: a component may set only
 * `padding-left` (asymmetric) rather than the shorthand `padding`, so a
 * single hardcoded side would miss it. First candidate with a match wins.
 * `kind` ('color' | 'length' | other) only tunes the multi-var()
 * disambiguation above — it doesn't gate whether authored resolution runs.
 *
 * Returns:
 *   { token: '--x-text-header-default', raw: false, authoredValue }  — a var() was found (the definitive answer)
 *   { token: null, raw: true, authoredValue }                        — a rule matched but its value has no var() (a raw literal — un-tokenised CSS)
 *   null                                                              — no rule anywhere in the (optionally inherited) chain declares this property; caller should fall back to the value-based guess
 */
export function resolveAuthored (el, cssProp, { kind } = {}) {
  const props = Array.isArray(cssProp) ? cssProp : [cssProp]
  const inherited = props.some(p => INHERITED.has(p))
  const candidates = props.flatMap(p => [p, ...(SHORTHAND_FALLBACKS[p] || [])])

  let node = el
  while (node && node.nodeType === 1) {
    // Merge hits from every candidate property name (the longhand AND its
    // shorthand fallback(s)) BEFORE picking a winner — real CSS cascade
    // resolves the final value for a property by considering every
    // declaration that affects it together, not "check the longhand's own
    // rules first, and only consult the shorthand if literally none exist."
    // A low-specificity reset rule on the bare longhand (e.g. a `button {
    // padding-top: 0 }` normalize/reset) would otherwise short-circuit
    // before ever reaching a higher-specificity scoped rule that only
    // declares the shorthand (`padding: var(--x-pad-surface-m)`).
    const hits = candidates.flatMap(prop => collectMatchingDeclarations(node, prop))
    if (hits.length) {
      hits.sort((a, b) => (b.important - a.important) || (b.specificity - a.specificity) || (b.order - a.order))
      const winner = hits[0].value
      const { token, raw } = extractToken(winner, kind)
      return { token, raw, authoredValue: winner }
    }
    if (!inherited) break
    node = node.parentElement
  }
  return null
}
