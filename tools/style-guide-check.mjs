#!/usr/bin/env node
/**
 * tools/style-guide-check.mjs — style-guide spec ↔ theme CSS drift audit.
 *
 * A `docs/style-guides/<slug>/spec.json` (produced by the style-guide-designer
 * skill) declares a `codashop.brandLocked` block: the 7 ref-seed hex colors
 * and the heading/body font families that ARE the brand, meant to be
 * brand-locked invariants. Nothing previously checked that the theme CSS a
 * human hand-tunes in `src/tokens/ds/themes/<store>.css` still matches what
 * the spec says the brand is — a spec and a theme could silently diverge the
 * same way a Figma export and the prototype can (see figma-harness.mjs
 * diff-tokens, which this script mirrors and shares --x-ref-* colour
 * normalization with, via tools/lib/color.mjs — see the design-harness
 * skill's "no duplicate extractor" gotcha).
 *
 * Usage:
 *   node tools/style-guide-check.mjs <store-slug> [--theme-key <key>] [--spec <path>] [--json]
 *   node tools/style-guide-check.mjs all [--json]
 *   node tools/style-guide-check.mjs list
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveTokensForStore } from '../scripts/resolve-css.mjs'
import { normalizeColor, colorsApproxEqual } from './lib/color.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const GUIDES_DIR = path.join(ROOT, 'docs/style-guides')
const THEMES_DIR = path.join(ROOT, 'src/tokens/ds/themes')

// A style-guide folder slug (docs/style-guides/<slug>) doesn't always equal
// the theme CSS storeKey (src/tokens/ds/themes/<storeKey>.css) — the two
// naming conventions (brand-readable vs. build-mode-short) drifted
// independently. Known mappings live here; anything not listed falls back to
// stripping dashes, then errors with the available theme files so a typo
// fails loud (see design-harness gotcha: a name filter must never silently
// no-op on a miss).
const SLUG_TO_THEME_KEY = {
  'diablo-immortal': 'diabloimmortal',
  'mgs-delta': 'mgsse',
  'zenless-zone-zero': 'zzz',
  'yugioh-masterduel': 'ygomd',
  'yugioh-master-duel': 'ygomd',
}

const REF_ROLE_TO_CSS_VAR = {
  primary: '--x-ref-primary',
  secondary: '--x-ref-secondary',
  tertiary: '--x-ref-tertiary',
  neutral: '--x-ref-neutral',
  statusPositive: '--x-ref-status-positive',
  statusCaution: '--x-ref-status-caution',
  statusNegative: '--x-ref-status-negative',
}

const FONT_ROLE_TO_CSS_VAR = {
  fontHeading: '--x-sys-font-family-heading',
  fontBody: '--x-sys-font-family-body',
}

function resolveThemeKey(slug, explicit) {
  if (explicit) return explicit
  if (SLUG_TO_THEME_KEY[slug]) return SLUG_TO_THEME_KEY[slug]
  const stripped = slug.replace(/-/g, '')
  if (existsSync(path.join(THEMES_DIR, `${stripped}.css`))) return stripped
  if (existsSync(path.join(THEMES_DIR, `${slug}.css`))) return slug
  return null
}

function listAvailableThemes() {
  return readdirSync(THEMES_DIR).filter((f) => f.endsWith('.css')).map((f) => f.replace(/\.css$/, ''))
}

function listGuidesWithSpec() {
  if (!existsSync(GUIDES_DIR)) return []
  return readdirSync(GUIDES_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((slug) => existsSync(path.join(GUIDES_DIR, slug, 'spec.json')))
}

/**
 * Font-family comparison is substring-based, not exact-match: the theme CSS
 * declares a full stack (`'Exocet Immortal', sans-serif`) while the spec
 * names just the brand font (`Exocet Immortal`). An exact-match comparison
 * would false-positive on every store.
 */
function fontMatches(specFont, cssFontStack) {
  if (typeof specFont !== 'string' || typeof cssFontStack !== 'string') return false
  const primary = specFont.split(',')[0].trim().replace(/^['"]|['"]$/g, '').toLowerCase()
  return cssFontStack.toLowerCase().includes(primary)
}

function checkOneStore(slug, options) {
  const specPath = options.spec
    ? (path.isAbsolute(options.spec) ? options.spec : path.resolve(ROOT, options.spec))
    : path.join(GUIDES_DIR, slug, 'spec.json')

  if (!existsSync(specPath)) {
    return { slug, ok: false, error: `spec not found: ${path.relative(ROOT, specPath)}` }
  }

  const themeKey = resolveThemeKey(slug, options['theme-key'])
  if (!themeKey) {
    return {
      slug,
      ok: false,
      error: `no theme CSS found for "${slug}" — tried "${slug.replace(/-/g, '')}" and "${slug}". Available themes: ${listAvailableThemes().join(', ')}. Pass --theme-key to override.`,
    }
  }

  let spec
  try {
    spec = JSON.parse(readFileSync(specPath, 'utf8'))
  } catch (err) {
    return { slug, ok: false, error: `invalid JSON in ${path.relative(ROOT, specPath)}: ${err.message}` }
  }

  const brandLocked = spec?.codashop?.brandLocked
  if (!brandLocked) {
    return { slug, ok: false, error: `${path.relative(ROOT, specPath)} has no codashop.brandLocked block — nothing to check` }
  }

  const mismatches = []
  const checked = []

  // Ref-seed colours
  const ref = brandLocked.ref || {}
  const refCssVars = Object.values(REF_ROLE_TO_CSS_VAR)
  const resolvedRef = resolveTokensForStore(refCssVars, themeKey)
  for (const [role, cssVar] of Object.entries(REF_ROLE_TO_CSS_VAR)) {
    const specValue = ref[role]
    if (specValue === undefined) continue
    const themeValue = resolvedRef[cssVar]
    const specHex = normalizeColor(specValue)
    const themeHex = normalizeColor(themeValue)
    checked.push(cssVar)
    if (!colorsApproxEqual(specHex, themeHex)) {
      mismatches.push({ token: cssVar, role, specValue, themeValue, themeHex, specHex })
    }
  }

  // Brand-locked fonts
  const typePrimitives = brandLocked.typePrimitives || {}
  const fontCssVars = Object.values(FONT_ROLE_TO_CSS_VAR)
  const resolvedFonts = resolveTokensForStore(fontCssVars, themeKey)
  for (const [role, cssVar] of Object.entries(FONT_ROLE_TO_CSS_VAR)) {
    const specValue = typePrimitives[role]
    if (specValue === undefined) continue
    const themeValue = resolvedFonts[cssVar]
    checked.push(cssVar)
    if (!fontMatches(specValue, themeValue)) {
      mismatches.push({ token: cssVar, role, specValue, themeValue })
    }
  }

  return { slug, themeKey, ok: mismatches.length === 0, checked: checked.length, mismatches }
}

function printResult(result, isJson) {
  if (isJson) return
  if (result.error) {
    console.log(`[ERROR] ${result.slug}: ${result.error}`)
    return
  }
  if (result.ok) {
    console.log(`[ALIGNED] ${result.slug} (theme: ${result.themeKey}) — ${result.checked} brand-locked token(s) match spec.`)
    return
  }
  console.log(`[DRIFT] ${result.slug} (theme: ${result.themeKey}) — ${result.mismatches.length}/${result.checked} mismatch(es):`)
  for (const m of result.mismatches) {
    console.log(`  - ${m.token} (${m.role}): spec=${JSON.stringify(m.specValue)} vs theme=${JSON.stringify(m.themeValue)}`)
  }
}

const args = process.argv.slice(2)
const command = args[0]
const flags = {}
const positional = []
for (let i = 1; i < args.length; i++) {
  const arg = args[i]
  if (arg.startsWith('--')) {
    const key = arg.slice(2)
    if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
      flags[key] = args[i + 1]
      i++
    } else {
      flags[key] = true
    }
  } else {
    positional.push(arg)
  }
}
const isJson = !!flags.json

if (!command || command === '--help' || command === '-h') {
  console.log(`
Usage:
  node tools/style-guide-check.mjs <store-slug> [--theme-key <key>] [--spec <path>] [--json]
  node tools/style-guide-check.mjs all [--json]
  node tools/style-guide-check.mjs list
  `.trim())
  process.exit(command ? 0 : 1)
}

if (command === 'list') {
  const guides = listGuidesWithSpec()
  if (isJson) {
    console.log(JSON.stringify({ guides }, null, 2))
  } else if (guides.length === 0) {
    console.log('No docs/style-guides/*/spec.json found.')
  } else {
    console.log(`=== Style guides with a spec.json (${guides.length}) ===\n`)
    for (const slug of guides) console.log(`• ${slug}`)
  }
  process.exit(0)
}

if (command === 'all') {
  const guides = listGuidesWithSpec()
  if (guides.length === 0) {
    console.error('No docs/style-guides/*/spec.json found — nothing to check.')
    process.exit(1)
  }
  const results = guides.map((slug) => checkOneStore(slug, flags))
  if (isJson) {
    console.log(JSON.stringify({ results, passed: results.every((r) => r.ok) }, null, 2))
  } else {
    console.log(`=== Style Guide Drift Audit (${results.length} store(s)) ===\n`)
    for (const r of results) printResult(r, false)
  }
  process.exit(results.every((r) => r.ok) ? 0 : 1)
}

// Single-store mode. Fail loud on an unknown slug rather than silently
// producing an empty/degenerate result (design-harness gotcha).
const known = listGuidesWithSpec()
if (!known.includes(command) && !flags.spec) {
  console.error(`Error: no spec.json found for "${command}". Known style guides: ${known.join(', ') || '(none)'}`)
  console.error(`Pass --spec <path> to check a spec outside docs/style-guides/.`)
  process.exit(1)
}

const result = checkOneStore(command, flags)
if (isJson) {
  console.log(JSON.stringify(result, null, 2))
} else {
  printResult(result, false)
}
process.exit(result.ok ? 0 : 1)
