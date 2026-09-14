/**
 * consumers.js — scans .vue / .js source text for how tokens are READ and
 * for component-local custom-property DECLARATIONS. Pure text/regex + a
 * scoped postcss parse per <style> block; no fs, no Vue, runs identically
 * in the browser and in Node.
 *
 * Produces the evidence for the four usage signals (decision #2 in the
 * plan):
 *   a — var(--x) read inside a .vue <style> block
 *   c — read from JS/template: getPropertyValue('--x'), getToken('--x'),
 *       a quoted '--x...' string in a :style binding, or a template literal
 *       like `var(--x-size-img-${size})` (flagged NOT statically provable)
 * (signal b — aliased by another token — comes from the alias graph, not
 * from here; signal d — overridden by a theme — comes from cascade.js.)
 *
 * Also classifies every component-scoped `--`/`--x-` declaration into one
 * of three kinds (drift rule D08 family):
 *   minted        — a --x- prefixed property, declared nowhere in src/tokens
 *   local-override — a --x- prefixed property that IS a real token (a
 *                    legitimate "repoint this FX to my own brand colour")
 *   layout-var     — anything else (un-prefixed local geometry/animation
 *                    state, e.g. --px, --card-warp)
 */
import postcss from 'postcss'

const VAR_READ_RE = /var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,\s*([^)]+))?\)/g
const GET_TOKEN_RE = /\bgetToken\(\s*['"](--[a-zA-Z0-9-]+)['"]/g
const GET_PROPERTY_VALUE_RE = /getPropertyValue\(\s*['"](--[a-zA-Z0-9-]+)['"]/g
const SET_PROPERTY_RE = /setProperty\(\s*['"](--[a-zA-Z0-9-]+)['"]/g
const STYLE_BINDING_KEY_RE = /['"](--[a-zA-Z0-9-]+)['"]\s*:/g
const TEMPLATE_LITERAL_RE = /`[^`]*var\(\s*(--[a-zA-Z0-9-]+(?:-)?)\$\{[^}]*\}[^`]*`/g

function lineAt (text, index) {
  let line = 1
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++
  return line
}

/** Extract <style ...>...</style> blocks from .vue source, with absolute line offsets. */
function extractStyleBlocks (text) {
  const blocks = []
  // Anchor the opening tag to the start of a line — Vue SFC root blocks
  // always begin at column 0. Without this, a stray "<style>" mentioned
  // inside a // comment (e.g. "longhand animation props live in <style>.")
  // matches as a real open tag and swallows everything up to the file's
  // actual </style>, including the whole <script>/<template> body.
  const re = /^<style([^>]*)>([\s\S]*?)<\/style>/gm
  let m
  while ((m = re.exec(text))) {
    const attrs = m[1]
    const body = m[2]
    const bodyStart = m.index + m[0].indexOf(body)
    blocks.push({
      scoped: /\bscoped\b/.test(attrs),
      body,
      startLine: lineAt(text, bodyStart),
    })
  }
  return blocks
}

/**
 * Scan one source file's text for usage evidence + component-local
 * declarations. `kind` is 'vue' | 'js'.
 * Returns { reads: Evidence[], declarations: LocalDecl[] }.
 *   Evidence   = { token, signal:'a'|'c', file, line, kind, provable, meta }
 *   LocalDecl  = { name, file, line, kind:'minted'|'local-override'|'layout-var', rawValue }
 */
export function scanFile (file, text, kind, declaredTokenNames) {
  const reads = []
  const declarations = []

  if (kind === 'vue') {
    for (const block of extractStyleBlocks(text)) {
      let root
      try {
        root = postcss.parse(block.body, { from: file })
      } catch {
        continue
      }
      root.walkDecls((d) => {
        const line = block.startLine - 1 + (d.source?.start?.line ?? 1)
        // Signal a: var() reads in this declaration's value.
        let vm
        const re = new RegExp(VAR_READ_RE)
        while ((vm = re.exec(d.value))) {
          reads.push({ token: vm[1], signal: 'a', file, line, kind: 'css-var', provable: true, property: d.prop })
        }
        // Component-local custom-property declarations.
        if (d.prop.startsWith('--')) {
          let localKind
          if (!d.prop.startsWith('--x-')) {
            localKind = 'layout-var'
          } else if (declaredTokenNames.has(d.prop)) {
            localKind = 'local-override'
          } else {
            localKind = 'minted'
          }
          declarations.push({ name: d.prop, file, line, kind: localKind, rawValue: d.value.trim() })
        }
      })
    }
    // text-style-* class usage lives in the <template> block, not <style> —
    // scan the whole file text for it (cheap, and classes appear nowhere else).
  }

  // Signal c — dynamic JS/template reads, scanned over the WHOLE file text
  // (covers both .js files and a .vue's <script>/<template> blocks).
  for (const [re, label] of [[GET_TOKEN_RE, 'getToken'], [GET_PROPERTY_VALUE_RE, 'getPropertyValue'], [SET_PROPERTY_RE, 'setProperty']]) {
    const rgx = new RegExp(re)
    let m
    while ((m = rgx.exec(text))) {
      reads.push({ token: m[1], signal: 'c', file, line: lineAt(text, m.index), kind: label, provable: true })
    }
  }
  {
    const rgx = new RegExp(STYLE_BINDING_KEY_RE)
    let m
    while ((m = rgx.exec(text))) {
      // Avoid double-counting the getToken/getPropertyValue/setProperty matches above.
      if (/getToken|getPropertyValue|setProperty/.test(text.slice(Math.max(0, m.index - 20), m.index))) continue
      reads.push({ token: m[1], signal: 'c', file, line: lineAt(text, m.index), kind: 'style-binding', provable: true })
    }
  }
  {
    const rgx = new RegExp(TEMPLATE_LITERAL_RE)
    let m
    while ((m = rgx.exec(text))) {
      const prefix = m[1]
      reads.push({
        token: prefix,
        signal: 'c',
        file,
        line: lineAt(text, m.index),
        kind: 'template-literal',
        provable: false,
        pattern: m[0].slice(0, 80),
      })
    }
  }

  return { reads, declarations }
}

/**
 * Scan a whole CSS source file (any selector, not just :root/theme-attr)
 * for var() reads inside property values. This is what seeds reachability
 * through the DS's own internal consumers — text-styles.css's
 * `.text-style-*` classes read `--x-sys-font-family-*`/`--x-sys-weight-*`
 * etc, effects.css's `.fx-*` classes read `--x-material-*`/`--x-light-*`,
 * keyframes.css reads motion displacement tokens — none of that lives at
 * `:root`, so cascade.js's alias graph (built only from :root/theme-attr
 * declared VALUES) never sees it. Without this, every theme's
 * `--x-sys-font-family-body` declaration reads as dead, because nothing
 * outside this file appears to consume it.
 */
export function scanCssSourceForReads (file, text) {
  const out = []
  let root
  try {
    root = postcss.parse(text, { from: file })
  } catch {
    return out
  }
  root.walkDecls((d) => {
    const line = d.source?.start?.line ?? null
    let m
    const re = new RegExp(VAR_READ_RE)
    while ((m = re.exec(d.value))) {
      out.push({ token: m[1], file, line, property: d.prop })
    }
  })
  return out
}

/** Extract text-style-* class names applied anywhere in a .vue file's markup. */
export function scanTextStyleClasses (file, text) {
  const out = []
  const re = /text-style-[a-z0-9-]+/g
  let m
  while ((m = re.exec(text))) out.push({ className: m[0], file, line: lineAt(text, m.index) })
  return out
}
