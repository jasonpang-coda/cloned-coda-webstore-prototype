#!/usr/bin/env node
/**
 * token-crosswalk.mjs — classifies every token a flow manifest declares against the
 * REAL token set of the production repo (codapayments-codashop-client), so a handoff
 * spec never asks an FE engineer to invent a token name that already exists under a
 * different one, and never hands them a bare "add this token" instruction where their
 * own design system requires sign-off first (web-store-tokens skill §2b: the semantic
 * tiers are a closed set).
 *
 * Classification, per token in a flow's affectedTokens():
 *   EXACT         — the exact `--x-*` name is declared in the production repo's
 *                   sitebuilder token files. No action needed; cite it as-is.
 *   RENAME        — absent by that name, but scripts/token-crosswalk.map.js has a
 *                   curated production equivalent. Use the production name.
 *   NEW_SEMANTIC  — absent, no curated equivalent, and the token's own prefix falls in
 *                   a closed semantic tier (--x-bg-*, --x-text-*, --x-border-*,
 *                   --x-pad-*, --x-gap-*, --x-radius-*, --x-size-*,
 *                   --x-border-weight-*). GATED: never a directive. The design-system
 *                   owner decides; the crosswalk's `fallback` (if curated) or a
 *                   "needs a fallback decided" note (if not yet curated) is what an
 *                   engineer actually uses meanwhile.
 *   NEW_EFFECT    — absent, no curated equivalent, prefix is an effect/extension
 *                   token (--x-shadow-*, --x-glow-*, --x-blur-*, --x-fx-*). Exempt
 *                   from the closed-set rule per web-store-tokens §2b — may be added
 *                   directly.
 *   UNCLASSIFIED  — absent, no curated equivalent, and the prefix doesn't match any
 *                   known tier. Surfaced so a human decides rather than the script
 *                   guessing; never silently folded into NEW_SEMANTIC or NEW_EFFECT.
 *
 * Token discovery in BOTH repos uses postcss to walk actual CSS declarations (the same
 * approach resolve-css.mjs uses for the live prototype), never a hand-rolled regex over
 * raw text — a naive `--x-[a-z0-9-]+` character class is exactly the kind of thing that
 * silently truncates or misses names depending on whitespace/casing, which is how an
 * earlier manual audit of this same token set produced false "missing" verdicts.
 *
 * Usage:
 *   node scripts/token-crosswalk.mjs --flow <slug> [--prod-root <path>] [--json]
 *
 * `--prod-root` defaults to $CODASHOP_CLIENT_ROOT if set, else
 * ~/Desktop/Work/codapayments-codashop-client-09ce85cb9b88 (this developer's current
 * checkout) — pass --prod-root explicitly, or set the env var, on any other machine.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import postcss from 'postcss'
import { createServer } from 'vite'
import { affectedTokens } from '../src/handoff/flow.js'
import { CROSSWALK_MAP } from './token-crosswalk.map.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const FLOWS_DIR = path.join(ROOT, 'src/handoff/flows')

const DEFAULT_PROD_ROOT = process.env.CODASHOP_CLIENT_ROOT
  || path.join(process.env.HOME || '', 'Desktop/Work/codapayments-codashop-client-09ce85cb9b88')

const SEMANTIC_PREFIXES = [
  '--x-bg-', '--x-text-', '--x-border-', '--x-pad-', '--x-gap-',
  '--x-radius-', '--x-size-', '--x-border-weight-',
]
const EFFECT_PREFIXES = ['--x-shadow-', '--x-glow-', '--x-blur-', '--x-fx-', '--x-effect-']

function classifyPrefix (tokenName) {
  if (SEMANTIC_PREFIXES.some((p) => tokenName.startsWith(p))) return 'semantic'
  if (EFFECT_PREFIXES.some((p) => tokenName.startsWith(p))) return 'effect'
  return 'unknown'
}

/** Recursively collect every .scss file under a directory. */
function walkScss (dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) walkScss(full, out)
    else if (entry.endsWith('.scss')) out.push(full)
  }
  return out
}

/**
 * Strip SCSS `//` line comments before handing a file to postcss's plain-CSS parser.
 * postcss (without the postcss-scss syntax plugin, which isn't a dependency here) treats
 * `//` as an "Unknown word" parse error and throws on the WHOLE FILE — every token
 * production actually declares in that file then silently vanishes from the crosswalk
 * and misreports as absent. This bit us during development: tokens/_motion.scss and
 * tokens/_radius.scss both open with a `//` comment and both showed up as missing/
 * UNCLASSIFIED until this strip was added. Safe here because these are token-only
 * partials with no string literals that legitimately contain `//` (no url() values).
 */
function stripScssLineComments (css) {
  return css.replace(/\/\/[^\n]*/g, '')
}

/**
 * Parse the production repo's token declarations via postcss (SCSS syntax is close
 * enough to CSS for this purpose — we only need custom-property declarations, and
 * postcss's default CSS parser tolerates SCSS's `@use`/nesting-free token partials
 * fine since they're just flat rule blocks of `--x-*: value;`, once `//` comments are
 * stripped — see stripScssLineComments above).
 */
function collectProductionTokens (prodRoot) {
  const tokensDir = path.join(prodRoot, 'assets/css/sitebuilder/tokens')
  const presetsFile = path.join(prodRoot, 'assets/css/sitebuilder/presets.scss')
  const files = [...walkScss(tokensDir), presetsFile].filter(existsSync)
  const names = new Set()
  const failed = []
  for (const file of files) {
    let css
    try { css = readFileSync(file, 'utf8') } catch { continue }
    let root
    try { root = postcss.parse(stripScssLineComments(css)) } catch { failed.push(file); continue } // a handful of SCSS constructs (e.g. @each loops, interpolation) still aren't valid CSS even after the strip; skip rather than crash
    root.walkDecls((d) => { if (d.prop.startsWith('--')) names.add(d.prop) })
  }
  if (failed.length) {
    console.error(`[token-crosswalk] ${failed.length} token file(s) failed to parse and were SKIPPED — any token declared ONLY in these is misclassified as missing:`)
    for (const f of failed) console.error(`  - ${path.relative(prodRoot, f)}`)
  }
  return names
}

export { collectProductionTokens, DEFAULT_PROD_ROOT }

export function classifyToken (tokenName, productionTokens) {
  if (productionTokens.has(tokenName)) {
    return { token: tokenName, class: 'EXACT', production: tokenName, action: 'Cite as-is.' }
  }
  const curated = CROSSWALK_MAP[tokenName]
  if (curated?.class === 'RENAME') {
    return {
      token: tokenName,
      class: 'RENAME',
      production: curated.productionName,
      action: `Use \`${curated.productionName}\`. ${curated.note}`,
    }
  }
  if (curated?.class === 'NEW_SEMANTIC') {
    return {
      token: tokenName,
      class: 'NEW_SEMANTIC',
      production: null,
      gated: true,
      recommend: curated.recommend,
      fallback: curated.fallback,
      action: `GATED — design-system owner decides. Proposed: add to ${curated.recommend}. Default path until sign-off: use \`${curated.fallback}\`. ${curated.note}`,
    }
  }
  if (curated?.class === 'NEW_EFFECT') {
    return {
      token: tokenName,
      class: 'NEW_EFFECT',
      production: null,
      gated: false,
      recommend: curated.recommend,
      fallback: curated.fallback,
      action: `Exempt from closed-set rule — may add directly. Proposed: ${curated.recommend}. Fallback if you'd rather not add yet: \`${curated.fallback}\`. ${curated.note}`,
    }
  }
  // Not in production, not curated yet — classify by prefix so it's at least routed
  // correctly, but never silently treated as approved.
  const tier = classifyPrefix(tokenName)
  if (tier === 'semantic') {
    return {
      token: tokenName,
      class: 'NEW_SEMANTIC',
      production: null,
      gated: true,
      recommend: null,
      fallback: null,
      action: `GATED, UNCURATED — no entry in token-crosswalk.map.js yet. Add one (recommend + fallback) before this reaches an engineer; do not let them add a semantic token unsupervised.`,
    }
  }
  if (tier === 'effect') {
    return {
      token: tokenName,
      class: 'NEW_EFFECT',
      production: null,
      gated: false,
      recommend: null,
      fallback: null,
      action: `UNCURATED — no entry in token-crosswalk.map.js yet. Exempt from sign-off, but add a curated fallback so this doesn't ship as a guess.`,
    }
  }
  return {
    token: tokenName,
    class: 'UNCLASSIFIED',
    production: null,
    action: `Doesn't match a known prefix tier and isn't curated. Resolve manually — do not guess a classification.`,
  }
}

async function loadFlow (slug) {
  const file = path.join(FLOWS_DIR, `${slug}.flow.js`)
  if (!existsSync(file)) {
    throw new Error(`No flow found for slug "${slug}" (expected ${file})`)
  }
  const server = await createServer({ root: ROOT, server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'warn' })
  if (typeof globalThis.window === 'undefined') {
    globalThis.window = { location: { search: '', hash: '' }, addEventListener () {}, removeEventListener () {} }
  }
  if (typeof globalThis.document === 'undefined') {
    globalThis.document = { documentElement: { dataset: {} } }
  }
  const mod = await server.ssrLoadModule(file)
  await server.close()
  return mod.default
}

/** Classify every token a flow declares against a production root. Reused by export-handoff.mjs's --target mode so the two never compute this independently and drift. */
export function crosswalkFlow (flow, prodRoot) {
  const tokens = affectedTokens(flow)
  const productionTokens = collectProductionTokens(prodRoot)
  return tokens.map((t) => classifyToken(t, productionTokens))
}

export function renderCrosswalkMarkdown (flow, rows, prodRoot) {
  const lines = []
  lines.push(`# Token crosswalk — ${flow.title}`)
  lines.push('')
  lines.push(`Generated by \`scripts/token-crosswalk.mjs\` against production token files under`)
  lines.push(`\`${path.relative(ROOT, prodRoot) || prodRoot}/assets/css/sitebuilder/tokens/\`.`)
  lines.push('')
  const counts = rows.reduce((acc, r) => { acc[r.class] = (acc[r.class] || 0) + 1; return acc }, {})
  lines.push(`**Summary:** ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(' · ')} (${rows.length} total)`)
  lines.push('')
  lines.push('| Token | Class | Production name | Action |')
  lines.push('|---|---|---|---|')
  for (const r of rows) {
    const prod = r.production ? `\`${r.production}\`` : '_none_'
    lines.push(`| \`${r.token}\` | ${r.gated ? '**' + r.class + '** (gated)' : r.class} | ${prod} | ${r.action.replace(/\|/g, '\\|')} |`)
  }
  lines.push('')
  const gated = rows.filter((r) => r.class === 'NEW_SEMANTIC')
  if (gated.length) {
    lines.push('## Gated — needs design-system owner sign-off before an engineer adds these')
    lines.push('')
    lines.push('Per the prototype\'s `web-store-tokens` skill (§2b), the semantic tiers are a closed')
    lines.push('set — adding to them is a design-system decision, not an implementer\'s call. Until')
    lines.push('signed off, use the listed fallback.')
    lines.push('')
    for (const r of gated) {
      lines.push(`- \`${r.token}\` → propose ${r.recommend ?? '_(uncurated — decide target file)_'}, fallback \`${r.fallback ?? '(uncurated)'}\`.`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

async function main () {
  const args = process.argv.slice(2)
  const flowIdx = args.indexOf('--flow')
  const slug = flowIdx >= 0 ? args[flowIdx + 1] : null
  const prodIdx = args.indexOf('--prod-root')
  const prodRoot = prodIdx >= 0 ? path.resolve(args[prodIdx + 1]) : DEFAULT_PROD_ROOT
  const asJson = args.includes('--json')

  if (!slug) {
    console.error('Usage: node scripts/token-crosswalk.mjs --flow <slug> [--prod-root <path>] [--json]')
    process.exitCode = 1
    return
  }
  if (!existsSync(prodRoot)) {
    console.error(`Production repo root not found: ${prodRoot}\nPass --prod-root <path>, or set $CODASHOP_CLIENT_ROOT, if the checkout isn't at that default path.`)
    process.exitCode = 1
    return
  }

  const flow = await loadFlow(slug)
  const tokens = affectedTokens(flow)
  const productionTokens = collectProductionTokens(prodRoot)
  const rows = tokens.map((t) => classifyToken(t, productionTokens))

  if (asJson) {
    console.log(JSON.stringify({ slug, prodRoot, rows }, null, 2))
  } else {
    console.log(renderCrosswalkMarkdown(flow, rows, prodRoot))
  }
}

// Only run the CLI when this file is executed directly (`node token-crosswalk.mjs …`),
// never when export-handoff.mjs imports crosswalkFlow/renderCrosswalkMarkdown from it —
// ES module top-level code runs on import, so without this guard every import silently
// re-ran the CLI's own arg parsing, printed its usage error, and set process.exitCode.
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => { console.error(err); process.exitCode = 1 })
}
