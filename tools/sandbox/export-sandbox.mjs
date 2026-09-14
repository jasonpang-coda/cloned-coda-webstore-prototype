#!/usr/bin/env node
/**
 * tools/sandbox/export-sandbox.mjs — PM Ideation Sandbox exporter.
 *
 * Stamps a self-contained, throwaway bundle at <dest>: the curated component
 * closure, one or more stores' data + theme, the read-only token cascade, a
 * guardrail CLI, and a trimmed agent ruleset — real components + real
 * tokens, no npm registry, nothing durable for the PM. `src/` stays the
 * single source of truth; re-run this to refresh a bundle.
 *
 * Usage:
 *   node tools/sandbox/export-sandbox.mjs <dest-dir> [--store <key>[,<key2>,...]]
 *
 * `--store` defaults to `codm` alone. Passing a comma-separated list (e.g.
 * `--store codm,fcm`) vendors every listed store and the canvas host shows a
 * runtime store switcher (see src/CanvasHost.vue) — omitted entirely for a
 * single-store bundle, unchanged from Milestone 1's behavior.
 *
 * See /Users/yiwei/.claude/plans/majestic-noodling-teapot.md for the full
 * milestone plan this implements.
 */
import {
  copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync,
  statSync, writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ALWAYS_VENDOR, CURATED_COMPONENTS, DEFAULT_STORE, EXCLUDED_COMPONENT_DIRS,
  EXCLUDED_COMPONENT_FILES, TOKEN_FILES, WHOLESALE_DIRS,
} from './curated.manifest.mjs'
import {
  walkClosure, copyClosure, copyTokens, copyWholesale, writeActiveStores, writeCatalog,
} from './lib/vendor.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const SRC = path.join(ROOT, 'src')
const TEMPLATE_DIR = path.join(__dirname, 'template')

// ─── CLI args ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const dest = args.find((a) => !a.startsWith('--'))
const storeFlagIdx = args.indexOf('--store')
const storeArg = storeFlagIdx !== -1 ? args[storeFlagIdx + 1] : DEFAULT_STORE
const stores = storeArg.split(',').map((s) => s.trim()).filter(Boolean)

if (!dest || stores.length === 0) {
  console.error('Usage: export-sandbox.mjs <dest-dir> [--store <key>[,<key2>,...]]')
  process.exit(1)
}

const availableStores = readdirSync(path.join(SRC, 'stores'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(path.join(SRC, 'stores', d.name, 'store.js')))
  .map((d) => d.name)
  .sort()

const unknown = stores.filter((s) => !availableStores.includes(s))
if (unknown.length > 0) {
  console.error(`✗ Unknown store(s): ${unknown.join(', ')}. Available: ${availableStores.join(', ')}`)
  process.exit(1)
}

const destAbs = path.resolve(dest)
if (existsSync(destAbs) && readdirSync(destAbs).length > 0) {
  console.error(`✗ Destination is not empty: ${destAbs}`)
  process.exit(1)
}

const VENDOR = path.join(destAbs, 'vendor')

// ctx passed to every lib/vendor.mjs function — see that file's header for
// the shape rationale.
const ctx = {
  ROOT, SRC, VENDOR, stores,
  CURATED_COMPONENTS, ALWAYS_VENDOR, EXCLUDED_COMPONENT_DIRS, EXCLUDED_COMPONENT_FILES,
  TOKEN_FILES, WHOLESALE_DIRS,
}

console.log(`\nExporting PM Ideation Sandbox → ${destAbs}  (store${stores.length > 1 ? 's' : ''}: ${stores.join(', ')})\n`)

// ─── Copy the canvas-app template, substituting placeholders ───────────────
// {{STORE}}/{{STORE_LABEL}} resolve to the PRIMARY store (stores[0]) — the
// one the bundle boots into (<html data-theme>, package name). Additional
// stores only show up via the runtime switcher, not the template's static
// substitutions. {{STORES_NOTE}} is empty for a single-store bundle and a
// short generated paragraph naming every vendored store otherwise.

const PRIMARY = stores[0]
const STORE_LABEL = PRIMARY.toUpperCase()
const STORES_NOTE = stores.length > 1
  ? `\n> **This bundle vendors ${stores.length} stores** (${stores.join(', ')}) — use the store ` +
    `switcher in the top-right of the canvas to preview each. \`catalog.json\`'s ` +
    `resolved token values are shown for **${PRIMARY}** only (the primary store); ` +
    `the real cascade re-resolves correctly for whichever store is active at ` +
    `runtime regardless.\n`
  : ''
const SUBSTITUTED_EXTS = new Set(['.json', '.md', '.html', '.js', '.vue'])

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function copyTemplate() {
  let count = 0
  for (const src of walk(TEMPLATE_DIR)) {
    const rel = path.relative(TEMPLATE_DIR, src)
    const out = path.join(destAbs, rel)
    mkdirSync(path.dirname(out), { recursive: true })
    const ext = path.extname(src)
    if (SUBSTITUTED_EXTS.has(ext)) {
      const content = readFileSync(src, 'utf8')
        .replaceAll('{{STORE}}', PRIMARY)
        .replaceAll('{{STORE_LABEL}}', STORE_LABEL)
        .replaceAll('{{STORES_NOTE}}', STORES_NOTE)
      writeFileSync(out, content, 'utf8')
    } else {
      copyFileSync(src, out)
    }
    count++
  }
  console.log(`  + ${count} template files`)
}

// ─── run ────────────────────────────────────────────────────────────────────

// lib/vendor.mjs throws (never process.exit()s) so it stays unit-testable —
// this is the one place that turns a thrown error into a printed message +
// exit code.
try {
  // Validate the full closure (including the boundary rule) BEFORE writing
  // anything to disk, so a violation leaves no partial bundle behind.
  const closure = walkClosure(ctx)

  mkdirSync(VENDOR, { recursive: true })
  copyTemplate()
  copyClosure(closure, ctx)
  copyTokens(ctx)
  copyWholesale(ctx)
  writeActiveStores(ctx)
  writeCatalog(destAbs, ctx)
} catch (err) {
  console.error(`\n✗ ${err.message}\n`)
  process.exit(1)
}

console.log(`\n✓ Bundle created at ${destAbs}\n`)
console.log('Next steps:')
console.log(`  cd ${dest}`)
console.log('  npm install')
console.log('  npm run dev     # view the canvas at the printed localhost URL')
console.log('  npm run lint    # guardrail check on your authored src/*.vue pages')
console.log('  Read AGENTS.md before composing a new idea page.\n')
