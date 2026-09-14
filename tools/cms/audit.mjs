#!/usr/bin/env node
/**
 * tools/cms/audit.mjs — diff every store module against the schema registry.
 *
 * This is the first thing the store CMS produces, and it pays for itself
 * immediately: it's what surfaced that config.profile.showPlayerRank exists in
 * only 5 of 10 stores, that docs/multi-store-whitelabel.md described several
 * flags that don't match the code, and that src/tokens/ds/themes/mcoc.css is
 * an orphan theme with no store module.
 *
 * Usage:
 *   node tools/cms/audit.mjs            # all stores, summary + gaps
 *   node tools/cms/audit.mjs codm fcm   # only these stores
 *   node tools/cms/audit.mjs --json     # machine-readable output
 *
 * This is READ-ONLY — it imports store.js modules for inspection and never
 * writes anything. Exits non-zero only on a hard structural problem (a
 * required field entirely missing), so it's safe to wire into CI later.
 */

import { readdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../..')
const STORES_DIR = resolve(REPO_ROOT, 'src/stores')
const THEMES_DIR = resolve(REPO_ROOT, 'src/tokens/ds/themes')

const { CONFIG_SCHEMA } = await import('./schema/config.js')
const { STRINGS_SCHEMA } = await import('./schema/strings.js')

// store.js modules import Vite-only things (the `@/` alias, CSS side-effect
// imports, asset files) that plain Node can't resolve. Loading them through a
// real Vite dev server's ssrLoadModule gives us the exact same resolution the
// app itself uses — aliases resolve, CSS imports become no-ops, asset imports
// resolve to a URL string — without needing a second, parallel mini-resolver
// to keep in sync with vite.config.js.
let viteServer

const args = process.argv.slice(2)
const asJson = args.includes('--json')
const wantStores = args.filter(a => !a.startsWith('--'))

function get (obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
}

function discoverStores () {
  return readdirSync(STORES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(resolve(STORES_DIR, d.name, 'store.js')))
    .map(d => d.name)
    .sort()
}

async function loadStore (key) {
  const mod = await viteServer.ssrLoadModule(`/src/stores/${key}/store.js`)
  return mod.default
}

function auditConfig (store) {
  const missing = []
  const unexpected = []
  for (const field of CONFIG_SCHEMA) {
    const value = get(store.config, field.path)
    if (value === undefined && field.required) missing.push(field.path)
  }
  // Flag config keys present in the store but not in the schema at all — the
  // drift direction that caused the original problem (a newer flag reaching
  // only some stores with nobody tracking it).
  const known = new Set(CONFIG_SCHEMA.map(f => f.path))
  const seen = new Set()
  ;(function walk (obj, prefix) {
    if (obj == null || typeof obj !== 'object' || Array.isArray(obj)) return
    for (const k of Object.keys(obj)) {
      const path = prefix ? `${prefix}.${k}` : k
      seen.add(path)
      walk(obj[k], path)
    }
  })(store.config, '')
  for (const path of seen) {
    const isKnownGroup = [...known].some(k => k === path || k.startsWith(path + '.') || path.startsWith(k + '.'))
    if (!isKnownGroup) unexpected.push(path)
  }
  return { missing, unexpected }
}

function auditStrings (store) {
  const missing = []
  for (const [groupName, group] of Object.entries(STRINGS_SCHEMA.groups)) {
    for (const [fieldName, field] of Object.entries(group.fields)) {
      if (field.optional) continue
      const value = get(store.strings, `${groupName}.${fieldName}`)
      if (value === undefined) missing.push(`strings.${groupName}.${fieldName}`)
    }
  }
  return { missing }
}

function auditOrphanThemes (storeKeys) {
  const themeFiles = readdirSync(THEMES_DIR)
    .filter(f => f.endsWith('.css'))
    .map(f => f.replace(/\.css$/, ''))
  return themeFiles.filter(t => !storeKeys.includes(t))
}

async function main () {
  viteServer = await createServer({
    root: REPO_ROOT,
    configFile: resolve(REPO_ROOT, 'vite.config.js'),
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    logLevel: 'silent',
  })

  const allStores = discoverStores()
  const targets = wantStores.length ? wantStores.filter(s => allStores.includes(s)) : allStores
  const results = []

  for (const key of targets) {
    const store = await loadStore(key)
    const config = auditConfig(store)
    const strings = auditStrings(store)
    results.push({ key, label: store.label, config, strings })
  }

  await viteServer.close()

  const orphanThemes = auditOrphanThemes(allStores)

  if (asJson) {
    console.log(JSON.stringify({ results, orphanThemes }, null, 2))
    return
  }

  console.log(`\nStore config/strings audit — ${targets.length} store(s) checked against tools/cms/schema/\n`)
  let hadIssues = false

  for (const r of results) {
    const issues = r.config.missing.length + r.config.unexpected.length + r.strings.missing.length
    if (!issues) {
      console.log(`✓ ${r.key.padEnd(14)} clean`)
      continue
    }
    hadIssues = true
    console.log(`✗ ${r.key.padEnd(14)} ${issues} issue(s)`)
    for (const m of r.config.missing) console.log(`    missing required config: ${m}`)
    for (const u of r.config.unexpected) console.log(`    config key not in schema (update tools/cms/schema/config.js if intentional): ${u}`)
    for (const m of r.strings.missing) console.log(`    missing required ${m}`)
  }

  if (orphanThemes.length) {
    hadIssues = true
    console.log(`\n✗ orphan theme file(s) with no matching store module:`)
    for (const t of orphanThemes) console.log(`    src/tokens/ds/themes/${t}.css`)
  }

  console.log(hadIssues
    ? '\nSchema drift found — see above. This is informational; nothing was changed.'
    : '\nNo drift found — every checked store matches the schema.')

  // Non-zero exit only for a hard requirement violation, not for schema-vs-code
  // exploration gaps (unexpected keys are usually the schema catching up, not
  // the store being wrong).
  const hardFailure = results.some(r => r.config.missing.length || r.strings.missing.length)
  process.exit(hardFailure ? 1 : 0)
}

main().catch(err => {
  console.error(err)
  process.exit(2)
})
