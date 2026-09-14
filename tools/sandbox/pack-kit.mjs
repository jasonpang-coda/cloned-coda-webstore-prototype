#!/usr/bin/env node
/**
 * tools/sandbox/pack-kit.mjs — builds an installable, git-installable
 * package folder at <dest>: the same curated component/composable/token
 * vendoring export-sandbox.mjs does (via lib/vendor.mjs), but defaulting to
 * ALL discovered stores (not one), with NO canvas-app scaffold (a kit
 * consumer supplies their own Vite project) and a real package.json instead.
 *
 * Ships raw, unbundled .vue SFCs — unlike every other package in this repo's
 * packages/ workspace (harness-kit/inspect-kit/tourguide-kit all pre-compile
 * via `vite build` into dist/vue.js). That's deliberate: a kit consumer's own
 * Vite build needs to compile real component source, not consume a
 * pre-bundled blob, to keep the "real components, not mocked" promise.
 *
 * Usage:
 *   node tools/sandbox/pack-kit.mjs <dest-dir> [--store <key>[,<key2>,...]]
 *
 * `--store` defaults to every store discovered under src/stores/ (not one) —
 * the opposite default from export-sandbox.mjs, since a durable installed
 * package is more useful able to preview any store than pinned to one.
 *
 * See /Users/yiwei/.claude/plans/majestic-noodling-teapot.md (Milestone 2 §4).
 */
import {
  copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync,
  statSync, writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ALWAYS_VENDOR, CURATED_COMPONENTS, EXCLUDED_COMPONENT_DIRS,
  EXCLUDED_COMPONENT_FILES, TOKEN_FILES, WHOLESALE_DIRS,
} from './curated.manifest.mjs'
import {
  walkClosure, copyClosure, copyTokens, copyWholesale, writeActiveStores, writeCatalog,
} from './lib/vendor.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const SRC = path.join(ROOT, 'src')
const KIT_TEMPLATE_DIR = path.join(__dirname, 'kit-template')
const CANVAS_TEMPLATE_DIR = path.join(__dirname, 'template')

// ─── CLI args ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const dest = args.find((a) => !a.startsWith('--'))
const storeFlagIdx = args.indexOf('--store')

const availableStores = readdirSync(path.join(SRC, 'stores'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(path.join(SRC, 'stores', d.name, 'store.js')))
  .map((d) => d.name)
  .sort()

const stores = storeFlagIdx !== -1
  ? args[storeFlagIdx + 1].split(',').map((s) => s.trim()).filter(Boolean)
  : availableStores // default: ALL stores — the opposite default from export-sandbox.mjs

if (!dest || stores.length === 0) {
  console.error('Usage: pack-kit.mjs <dest-dir> [--store <key>[,<key2>,...]]')
  process.exit(1)
}

const unknown = stores.filter((s) => !availableStores.includes(s))
if (unknown.length > 0) {
  console.error(`✗ Unknown store(s): ${unknown.join(', ')}. Available: ${availableStores.join(', ')}`)
  process.exit(1)
}

const destAbs = path.resolve(dest)
// A bare `.git` dir is tolerated — publish-kit.mjs packs directly into a
// fresh git clone (which starts with only `.git` tracked) rather than a
// truly empty folder.
if (existsSync(destAbs) && readdirSync(destAbs).some((f) => f !== '.git')) {
  console.error(`✗ Destination is not empty: ${destAbs}`)
  process.exit(1)
}

// Unlike export-sandbox.mjs's bundle (vendor/ nested under a canvas-app
// scaffold), the kit's package root IS the vendored content — no nesting.
const VENDOR = destAbs

const ctx = {
  ROOT, SRC, VENDOR, stores,
  CURATED_COMPONENTS, ALWAYS_VENDOR, EXCLUDED_COMPONENT_DIRS, EXCLUDED_COMPONENT_FILES,
  TOKEN_FILES, WHOLESALE_DIRS,
}

console.log(`\nPacking @coda/sandbox-kit → ${destAbs}  (stores: ${stores.join(', ')})\n`)

const { version: KIT_VERSION } = JSON.parse(readFileSync(path.join(__dirname, 'kit-version.json'), 'utf8'))

// ─── package.json + kit docs (substituting {{STORES}}/{{VERSION}}) ─────────

// Written LAST, after every vendoring step — `files` is computed from what's
// actually on disk in destAbs at that point, not a hand-maintained literal
// list. A hand-maintained list silently drifts the moment the closure walk
// starts vendoring a new top-level src/ directory (this bit once already:
// the first version of this script hardcoded the list and omitted `utils/`,
// which several stores' data modules import — npm's `files` allowlist
// dropped it from every real install even though it existed in this folder).
function writePackageJson() {
  // `.git` shows up here when publish-kit.mjs packs directly into a fresh
  // clone (see pack-kit.mjs's destination check above) — never a real kit
  // file, so it's excluded alongside package.json itself.
  const files = readdirSync(destAbs).filter((f) => f !== 'package.json' && f !== '.git')
  const pkg = {
    name: '@coda/sandbox-kit',
    version: KIT_VERSION,
    private: false,
    description: 'Curated, real production components from the COD:M/FCM web-store prototype, vendored read-only for ideation.',
    files,
    exports: { './*': './*' },
    peerDependencies: { vue: '^3.4.0' },
  }
  writeFileSync(path.join(destAbs, 'package.json'), JSON.stringify(pkg, null, 2) + '\n', 'utf8')
  console.log(`  + package.json (files: ${files.join(', ')})`)
}

function copyKitDocs() {
  for (const name of ['AGENTS.md', 'README.md']) {
    const content = readFileSync(path.join(KIT_TEMPLATE_DIR, name), 'utf8')
      .replaceAll('{{STORES}}', stores.join(', '))
      .replaceAll('{{VERSION}}', KIT_VERSION)
    writeFileSync(path.join(destAbs, name), content, 'utf8')
  }
  console.log('  + AGENTS.md + README.md')
}

// Reuse the canvas bundle's guardrail + ruleset verbatim — same lint rules,
// same generated docs, no separate copy to keep in sync.
function copyGuardrailAndRuleset() {
  for (const rel of ['guardrail', 'ruleset']) {
    const src = path.join(CANVAS_TEMPLATE_DIR, rel)
    const out = path.join(destAbs, rel)
    for (const file of walkDir(src)) {
      const relFile = path.relative(src, file)
      const outFile = path.join(out, relFile)
      mkdirSync(path.dirname(outFile), { recursive: true })
      copyFileSync(file, outFile)
    }
  }
  console.log('  + guardrail/ + ruleset/  (reused verbatim from the canvas-bundle template)')
}

function walkDir(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walkDir(full, out)
    else out.push(full)
  }
  return out
}

// ─── run ────────────────────────────────────────────────────────────────────

// lib/vendor.mjs throws (never process.exit()s) so it stays unit-testable —
// this is the one place that turns a thrown error into a printed message +
// exit code, mirroring export-sandbox.mjs.
try {
  // Validate the full closure (including the boundary rule) BEFORE writing
  // anything to disk, mirroring export-sandbox.mjs.
  const closure = walkClosure(ctx)

  mkdirSync(destAbs, { recursive: true })
  copyKitDocs()
  copyGuardrailAndRuleset()
  copyClosure(closure, ctx)
  copyTokens(ctx)
  copyWholesale(ctx)
  writeActiveStores(ctx)
  writeCatalog(destAbs, ctx)
  writePackageJson() // last — files list reflects everything written above
} catch (err) {
  console.error(`\n✗ ${err.message}\n`)
  process.exit(1)
}

console.log(`\n✓ Kit packed at ${destAbs} (v${KIT_VERSION})\n`)
console.log('Next steps:')
console.log(`  npm install ${dest}                    # local install to try it`)
console.log(`  node tools/sandbox/publish-kit.mjs <git-remote-url>   # push to a real repo`)
