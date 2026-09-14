#!/usr/bin/env node
/**
 * scripts/token-audit.mjs — read-only CLI over the token audit engine
 * (src/token-audit/core/*). Same engine the /tokens dashboard page uses in
 * the browser; this is the terminal/CI-safe caller. Mirrors
 * tools/cms/audit.mjs's conventions: read-only, plain stdout table,
 * --json for machine output, non-zero exit only on a hard (error-severity,
 * non-allowlisted) drift finding.
 *
 * Usage:
 *   node scripts/token-audit.mjs             # summary table
 *   node scripts/token-audit.mjs --json       # machine-readable, to stdout
 *   node scripts/token-audit.mjs --drift      # full drift finding list
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { buildAudit } from '../src/token-audit/core/build.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const TOKENS_DIR = path.join(ROOT, 'src/tokens')
const SRC_DIR = path.join(ROOT, 'src')
const STORES_DIR = path.join(ROOT, 'src/stores')

const args = process.argv.slice(2)
const asJson = args.includes('--json')
const showDrift = args.includes('--drift')

function walk (dir, exts, out = []) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) walk(full, exts, out)
    else if (exts.some((ext) => e.name.endsWith(ext))) out.push(full)
  }
  return out
}

function readRel (absPath, relTo) {
  return { file: path.relative(relTo, absPath).replace(/\\/g, '/'), text: readFileSync(absPath, 'utf8') }
}

// tokenCss: every .css file under src/tokens/, path relative to src/tokens/.
const tokenCss = walk(TOKENS_DIR, ['.css']).map((p) => readRel(p, TOKENS_DIR))

// vue/js: every source file under src/, excluding node_modules-adjacent noise.
const vueFiles = walk(SRC_DIR, ['.vue']).map((p) => readRel(p, ROOT))
const jsFiles = walk(SRC_DIR, ['.js']).map((p) => readRel(p, ROOT))

const storeModuleKeys = (() => {
  try {
    return readdirSync(STORES_DIR, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
  } catch {
    return []
  }
})()

const model = buildAudit({ tokenCss, vue: vueFiles, js: jsFiles, storeModuleKeys })

if (asJson) {
  const serializable = {
    meta: model.meta,
    stats: model.stats,
    perStore: model.perStore,
    drift: model.drift,
    tokens: Object.fromEntries([...model.tokens.entries()].map(([k, v]) => [k, { ...v, declarations: v.declarations.map((d) => ({ file: d.file, line: d.line, selectorKind: d.selectorKind, store: d.store, wins: d.wins })) }])),
  }
  process.stdout.write(JSON.stringify(serializable, null, 2) + '\n')
} else {
  const pct = (s) => `${s.pct.toFixed(1)}%`
  const frac = (s) => `${s.count}/${s.total}`
  console.log(`\nToken usage audit — ${model.meta.stores.length} stores, ${model.meta.tokenCount.declared} declared tokens\n`)
  console.log(`Prod contract:     ${model.meta.tokenCount.prod}`)
  console.log(`Prototype-only:    ${model.meta.tokenCount.prototype}`)
  console.log('')
  console.log(`Prod coverage (used/unused):`)
  console.log(`  used            ${frac(model.stats.usage.usedAny)}  ${pct(model.stats.usage.usedAny)}`)
  console.log(`  unused          ${frac(model.stats.usage.unused)}  ${pct(model.stats.usage.unused)}`)
  console.log(`  css read        ${frac(model.stats.usage.bySignal.css)}  ${pct(model.stats.usage.bySignal.css)}`)
  console.log(`  aliased         ${frac(model.stats.usage.bySignal.alias)}  ${pct(model.stats.usage.bySignal.alias)}`)
  console.log(`  dynamic (js)    ${frac(model.stats.usage.bySignal.js)}  ${pct(model.stats.usage.bySignal.js)}`)
  console.log(`  theme-only      ${frac(model.stats.usage.bySignal.theme)}  ${pct(model.stats.usage.bySignal.theme)}`)
  console.log(`  dev-chrome-only ${frac(model.stats.usage.devChromeOnly)}  ${pct(model.stats.usage.devChromeOnly)}`)
  console.log('')
  console.log('Coverage by family (lowest first):')
  for (const f of model.stats.families.slice(0, 15)) {
    console.log(`  ${f.family.padEnd(24)} ${frac(f)}  ${pct(f)}`)
  }
  console.log('')
  console.log(`Custom tokens (component-local declarations): ${model.stats.local.total}`)
  console.log(`  minted            ${model.localByKind.minted.length}`)
  console.log(`  local override    ${model.localByKind.localOverride.length}`)
  console.log(`  layout var        ${model.localByKind.layoutVar.length}`)
  console.log('')
  console.log(`Drift findings: ${model.drift.length}  (error ${model.stats.drift.bySeverity.error} · warn ${model.stats.drift.bySeverity.warn} · info ${model.stats.drift.bySeverity.info})`)
  const byRule = {}
  for (const d of model.drift) byRule[d.rule] = (byRule[d.rule] || 0) + 1
  for (const [rule, count] of Object.entries(byRule).sort()) console.log(`  ${rule.padEnd(10)} ${count}`)
  console.log('')
  console.log('Per-store overrides:')
  for (const [store, s] of Object.entries(model.perStore).sort((a, b) => b[1].overrideCount - a[1].overrideCount)) {
    console.log(`  ${store.padEnd(16)} ${String(s.overrideCount).padStart(4)} overrides   ${s.deadOverrideCount} dead${s.orphan ? '   ⚠ ORPHAN (no src/stores/ module)' : ''}`)
  }

  if (showDrift) {
    console.log('\n--- Findings ---\n')
    for (const d of model.drift) {
      console.log(`[${d.severity.toUpperCase()}] ${d.rule} — ${d.title}`)
      console.log(`  ${d.message}`)
      if (d.grep) console.log(`  $ ${d.grep}`)
      console.log('')
    }
  }
}

const hardFailures = model.drift.filter((d) => d.severity === 'error' && !d.allowlisted)
if (hardFailures.length) {
  console.error(`\n${hardFailures.length} error-severity drift finding(s). Run with --drift for details.`)
  process.exit(1)
}
