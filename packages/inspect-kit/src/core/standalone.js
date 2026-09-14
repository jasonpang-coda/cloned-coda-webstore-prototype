/**
 * standalone.js — build a self-contained "states + tokens" export page for a
 * selected element, opened in a new browser tab: any selected element → one
 * page showing every interaction state next to its resolved token contract.
 *
 * No server round-trip and no framework remount: the selected subtree is
 * DOM-cloned once per simulated state, the host document's stylesheets +
 * resolved custom properties are inlined so the clone renders identically
 * outside the app, and interaction states that only exist via CSS
 * pseudo-classes (:hover / :focus) are baked in by cloning matching rules
 * onto a state-specific class — the same idiom as inspect.js's
 * buildHoverOverride, kept as static CSS instead of a live, cleanup-able
 * override.
 *
 * Framework-free: depends only on collectStyles() from ./inspect.js and a
 * token-map object built by ./token-map.js.
 */
import { collectStyles } from './inspect.js'

export const DEFAULT_STATES = ['default', 'hover', 'pressed', 'disabled', 'focus']

const STATE_LABEL = { default: 'Default', hover: 'Hover', pressed: 'Pressed', disabled: 'Disabled', focus: 'Focus' }

// ── pseudo-class → static class rewrite (for hover/focus in a page with no
//    real mouse/keyboard focus) ────────────────────────────────────────────
function pseudoRuleCss (pseudo, className) {
  const aliases = pseudo === 'focus' ? [':focus-visible', ':focus'] : [`:${pseudo}`]
  const injected = []
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (!(rule instanceof CSSStyleRule)) continue
        const hit = aliases.find(a => rule.selectorText.includes(a))
        if (!hit) continue
        const newSel = aliases.reduce((sel, a) => sel.split(a).join(`.${className}`), rule.selectorText)
        injected.push(`${newSel} { ${rule.style.cssText} }`)
      }
    } catch { /* cross-origin sheet — skip */ }
  }
  return injected.join('\n')
}

// BEM root class (e.g. "sku-card" from "sku-card sku-card--featured").
function bemRoot (el) {
  const cls = (el.getAttribute?.('class') || '').split(/\s+/)
    .find(c => c && !c.includes('__') && !c.includes('--') && !c.startsWith('text-style-'))
  return cls || null
}

function stateClone (el, state) {
  const clone = el.cloneNode(true)
  if (state === 'hover' || state === 'focus') {
    clone.classList.add(`ik-state-${state}`)
  } else if (state === 'pressed') {
    const root = bemRoot(clone)
    if (root) clone.classList.add(`${root}--pressed`)
    clone.classList.add('pressed')
  } else if (state === 'disabled') {
    clone.setAttribute('disabled', '')
    clone.classList.add('disabled')
  }
  return clone
}

function escapeHtml (s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

// Inline every same-origin stylesheet's cssText, skipping cross-origin ones.
function inlineStylesheets () {
  const out = []
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) out.push(rule.cssText)
    } catch { /* cross-origin sheet — skip */ }
  }
  return out.join('\n')
}

// The active theme's resolved :root custom properties, as a literal `:root{}` block.
function rootTokenCss (tokenMap) {
  const lines = tokenMap.all().map(t => `  ${t.name}: ${t.value};`)
  return `:root {\n${lines.join('\n')}\n}`
}

/**
 * collectTokenContract(el, tokenMap, screenRoot) → { used: Map, untokenised: [] }
 *
 * Walks the selected subtree, running collectStyles on every node, and
 * aggregates every unique matched token (deduped, with a use count) plus a
 * flat list of tokenisable values that had no match — the same "not a
 * token" lint the live panel shows, aggregated across the whole component.
 */
function collectTokenContract (el, tokenMap, screenRoot) {
  const nodes = [el, ...el.querySelectorAll('*')]
  const used = new Map() // token name → { token, value, count }
  const untokenised = []
  const seenUntok = new Set()

  for (const node of nodes) {
    const spec = collectStyles(node, tokenMap, screenRoot)
    for (const group of spec.groups) {
      for (const f of group.fields) {
        if (f.token) {
          const row = used.get(f.token) || { token: f.token, value: f.value, count: 0 }
          row.count++
          used.set(f.token, row)
        } else if (f.warning) {
          const key = `${group.title}:${f.label}:${f.value}`
          if (!seenUntok.has(key)) {
            seenUntok.add(key)
            untokenised.push({ group: group.title, label: f.label, value: f.value })
          }
        }
      }
    }
  }
  return { used: [...used.values()].sort((a, b) => a.token.localeCompare(b.token)), untokenised }
}

function familyOf (tokenName) {
  if (/colou?r|^--bg-|^--text-|^--border-(?!weight)/.test(tokenName)) return 'Colour'
  if (/radius/.test(tokenName)) return 'Radius'
  if (/^--(pad|gap|size)-|space/.test(tokenName)) return 'Spacing & size'
  if (/font|weight|tracking|line-height|size-h\d/.test(tokenName)) return 'Typography'
  if (/motion|duration|ease/.test(tokenName)) return 'Motion'
  return 'Other'
}

function tokenContractHtml (contract) {
  const byFamily = new Map()
  for (const row of contract.used) {
    const fam = familyOf(row.token)
    if (!byFamily.has(fam)) byFamily.set(fam, [])
    byFamily.get(fam).push(row)
  }
  const familyOrder = ['Colour', 'Spacing & size', 'Radius', 'Typography', 'Motion', 'Other']
  const sections = familyOrder
    .filter(f => byFamily.has(f))
    .map(fam => {
      const rows = byFamily.get(fam).map(r => `
        <tr>
          <td>${fam === 'Colour' ? `<span class="ik-swatch" style="background:${escapeHtml(r.value)}"></span>` : ''}${escapeHtml(r.token)}</td>
          <td><code>${escapeHtml(r.value)}</code></td>
          <td>${r.count}</td>
        </tr>`).join('')
      return `
      <h3>${fam}</h3>
      <table class="ik-table">
        <thead><tr><th>Token</th><th>Resolved value</th><th>Uses</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`
    }).join('')

  const untok = contract.untokenised.length ? `
    <h3>Not tokenised</h3>
    <table class="ik-table ik-table--warn">
      <thead><tr><th>Field</th><th>Value</th></tr></thead>
      <tbody>${contract.untokenised.map(u => `
        <tr><td>${escapeHtml(u.group)} · ${escapeHtml(u.label)}</td><td><code>${escapeHtml(u.value)}</code></td></tr>`).join('')}
      </tbody>
    </table>` : ''

  return sections + untok
}

/**
 * buildStandaloneHtml(el, opts) → full HTML document string
 *
 * opts:
 *   tokenMap   — required, from createTokenMap()
 *   screenRoot — selector used for container-context lookups (default '.device__screen')
 *   states     — array of state keys to render (default DEFAULT_STATES)
 *   themeAttr  — { name, value } to stamp on <html> so themed tokens resolve (optional)
 *   title      — page title (defaults to the element's tag)
 */
export function buildStandaloneHtml (el, opts = {}) {
  const {
    tokenMap,
    screenRoot = '.device__screen',
    states = DEFAULT_STATES,
    themeAttr = null,
    title = null,
  } = opts

  const pageTitle = title || el.tagName?.toLowerCase() || 'Element'
  const stylesheets = inlineStylesheets()
  const rootTokens = rootTokenCss(tokenMap)
  const pseudoCss = ['hover', 'focus'].map(p => pseudoRuleCss(p, `ik-state-${p}`)).join('\n')

  const stagesHtml = states.map(state => `
    <div class="ik-stage">
      <div class="ik-stage-label">${STATE_LABEL[state] || state}</div>
      <div class="ik-stage-well">${stateClone(el, state).outerHTML}</div>
    </div>`).join('')

  const contract = collectTokenContract(el, tokenMap, screenRoot)
  const contractHtml = tokenContractHtml(contract)

  const htmlAttrs = themeAttr ? ` ${themeAttr.name}="${escapeHtml(themeAttr.value)}"` : ''

  return `<!doctype html>
<html${htmlAttrs}>
<head>
<meta charset="utf-8">
<title>${escapeHtml(pageTitle)} — states &amp; tokens</title>
<style>
${rootTokens}
${stylesheets}
${pseudoCss}
html, body { margin: 0; }
body.ik-page {
  background: #0e0f12;
  color: #e7e7ea;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 32px;
}
.ik-head { margin-bottom: 24px; }
.ik-head h1 { font-size: 20px; margin: 0 0 4px; }
.ik-head p { margin: 0; color: #9a9aa2; font-size: 12.5px; }
.ik-stages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.ik-stage {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
}
.ik-stage-label {
  padding: 6px 10px;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #9a9aa2;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.ik-stage-well {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}
.ik-table { width: 100%; border-collapse: collapse; margin: 8px 0 20px; font-size: 12.5px; }
.ik-table th, .ik-table td { text-align: left; padding: 5px 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.ik-table th { color: #9a9aa2; font-weight: 600; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.4px; }
.ik-table code { color: #6aa3f8; }
.ik-table--warn td { color: #f0cd86; }
.ik-swatch { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 6px; vertical-align: -1px; border: 1px solid rgba(255,255,255,0.2); }
h3 { font-size: 13px; margin: 0 0 4px; color: #fff; }
@media print { body.ik-page { background: #fff; color: #111; } }
</style>
</head>
<body class="ik-page">
  <div class="ik-head">
    <h1>${escapeHtml(pageTitle)}</h1>
    <p>States &amp; token contract — generated by inspect-kit</p>
  </div>
  <div class="ik-stages">${stagesHtml}</div>
  <div class="ik-contract">${contractHtml}</div>
</body>
</html>`
}

/**
 * openStandalonePage(el, opts) → { ok: true, win } | { ok: false, reason }
 *
 * Builds the HTML first, then opens it as a `blob:` URL in one synchronous
 * `window.open(url, '_blank')` call. This is the popup-blocker-friendly
 * order: opening an empty window and filling it via `document.write`
 * afterwards is the same shape browsers/extensions associate with
 * pop-under spam, and some block it even from a genuine click — whereas
 * `window.open(<real url>, ...)` called synchronously in a click handler is
 * the standard case every blocker allows. Still returns `{ ok: false }`
 * rather than throwing if a blocker denies it anyway, so the caller can show
 * the user a "please allow popups" message instead of failing silently.
 */
export function openStandalonePage (el, opts = {}) {
  const html = buildStandaloneHtml(el, opts)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) {
    URL.revokeObjectURL(url)
    return { ok: false, reason: 'popup-blocked' }
  }
  // Revoke once the new tab has had time to load the blob (revoking
  // immediately can race the navigation in some browsers).
  setTimeout(() => URL.revokeObjectURL(url), 30000)
  return { ok: true, win }
}
