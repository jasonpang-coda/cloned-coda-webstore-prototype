#!/usr/bin/env node
/**
 * scripts/stage-handoff.mjs — stages the AI-readable slice of docs/Handoff/
 * into public/handoff/ so it ships to the deployed site's root and an
 * external FE engineer's scraper can fetch it directly, without cloning the
 * repo (see docs/Handoff for the human-facing versions of these packages).
 *
 * Copies ONLY the whitelisted spec filenames (SPEC_FILES below) out of each
 * docs/Handoff/<slug>/ directory — never the interactive VitePress
 * playground sites' node_modules/vendor/.vitepress/scripts/package.json;
 * those deploy separately as their own Vercel projects (see
 * web-store-interactive-handoff).
 *
 * Also generates:
 *   - public/handoff/index.json     — manifest: every staged feature, its
 *     spec URLs, deep-link state URLs, DOM-dump URLs, a content hash for
 *     change detection.
 *   - public/handoff/tokens/<store>.json — resolved semantic/space/type/
 *     extensions token values per store, reusing the exact resolver
 *     export-handoff.mjs uses (src/token-audit/core/cascade.js via
 *     resolve-css.mjs), so this can never hand-drift from spec.json's own
 *     "Resolved" column.
 *   - public/handoff/dom/**          — via dump-dom.mjs (run as a step of
 *     this script), real per-state rendered HTML for handoff-target
 *     components, so a plain `fetch` (no headless browser) still yields
 *     real markup.
 *
 * Wired as a Vite `buildStart` plugin (see vite.config.js's stage-handoff
 * plugin) — re-stages automatically on every UNLOCKED (--mode all-stores)
 * production build. Deliberately NOT run for a store-locked build
 * (--mode <store>): this manifest spans every feature and every store's
 * tokens, so shipping it in a single-client deploy would leak every other
 * client's brand tokens and feature specs at a guessable, unauthenticated
 * `/handoff/` URL — see vite.config.js's stage-handoff plugin comment.
 * External clients get a curated per-feature VitePress site under
 * docs/Handoff/<slug>/ instead. Idempotent (wipes and rebuilds
 * public/handoff/ each run).
 *
 * Usage: node scripts/stage-handoff.mjs
 */
import { readdirSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { resolveTokensForStore } from './resolve-css.mjs'
import { getAllTokens } from '../tools/token-cli.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const HANDOFF_SRC = path.join(ROOT, 'docs/Handoff')
const HANDOFF_OUT = path.join(ROOT, 'public/handoff')
const PKG = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'))

// AI/FE-readable specs only — never the VitePress site's own scaffolding.
const SPEC_FILES = [
  'AGENTS.md', 'README.md', 'component-breakdown.md',
  'motion-tokens.md', 'haptic-tokens.md', 'typography.md',
  'spec.md', 'spec.json',
]

// Sub-directories that are VitePress site scaffolding, never spec content —
// skipped when walking one level into a feature folder for bundle variants
// (e.g. pwa-web-push/for-codashop-client/).
const SKIP_SUBDIRS = new Set(['_skill', 'node_modules', 'vendor', '.vitepress', 'scripts'])

// Deep-link demo states for handoff-target features that have both an
// AGENTS.md entry point and a URL-addressable dimension (see
// useUrlState.js's OVERLAY_NAMES). Hand-maintained — not every handoff
// feature maps to a named overlay, so this can't be derived automatically.
// Update when a new feature gets deep-linkable overlay support.
const STATE_URLS = {
  'locale-selector-sheets': ['/?overlay=region', '/?overlay=language'],
  'trust-bar': ['/'],
  'download-banner': ['/'],
  'sku-card-entrance-stagger': ['/'],
  'bestseller-card-effects': ['/'],
}

function sha1 (text) {
  return createHash('sha1').update(text).digest('hex').slice(0, 12)
}

function titleFromSlug (slug) {
  return slug.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function extractTitle (text) {
  const m = text.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : null
}

/** Copies whitelisted spec files from srcDir into public/handoff/<destSlug>/, returns a manifest entry or null if nothing staged. */
function stageFeature (srcDir, destSlug) {
  const destDir = path.join(HANDOFF_OUT, destSlug)
  const staged = []
  let hashInput = ''
  let title = null
  for (const filename of SPEC_FILES) {
    const srcFile = path.join(srcDir, filename)
    if (!existsSync(srcFile)) continue
    const text = readFileSync(srcFile, 'utf8')
    if (!title) title = extractTitle(text)
    mkdirSync(destDir, { recursive: true })
    writeFileSync(path.join(destDir, filename), text)
    staged.push(`/handoff/${destSlug}/${filename}`)
    hashInput += text
  }
  if (!staged.length) return null
  return {
    slug: destSlug,
    title: title || titleFromSlug(destSlug),
    specs: staged,
    states: STATE_URLS[destSlug] || [],
    hash: sha1(hashInput),
  }
}

function stageFeatures () {
  const features = []
  const entries = readdirSync(HANDOFF_SRC, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name === '_handoff-kit') continue
    // Dot-directories (.archive/ chief among them) are retired/rotting
    // content moved out of the live tree on purpose — see
    // docs/Handoff/.archive/README.md. Never stage them: an archived
    // feature has no business appearing in the live manifest or being
    // fetchable by an external scraper as if it were current.
    if (entry.name.startsWith('.')) continue
    const fullPath = path.join(HANDOFF_SRC, entry.name)

    // Loose top-level spec file (e.g. fcm-checkout-shimmer.md) — its own single-file feature.
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const slug = entry.name.replace(/\.md$/, '')
      const text = readFileSync(fullPath, 'utf8')
      mkdirSync(path.join(HANDOFF_OUT, slug), { recursive: true })
      writeFileSync(path.join(HANDOFF_OUT, slug, 'spec.md'), text)
      features.push({
        slug,
        title: extractTitle(text) || titleFromSlug(slug),
        specs: [`/handoff/${slug}/spec.md`],
        states: STATE_URLS[slug] || [],
        hash: sha1(text),
      })
      continue
    }
    if (!entry.isDirectory()) continue

    // Shared per-component breakdown library — not a feature; stage each
    // sub-component under handoff/components/<name>/.
    if (entry.name === 'components') {
      for (const sub of readdirSync(fullPath, { withFileTypes: true })) {
        if (!sub.isDirectory()) continue
        const f = stageFeature(path.join(fullPath, sub.name), `components/${sub.name}`)
        if (f) features.push(f)
      }
      continue
    }

    const top = stageFeature(fullPath, entry.name)
    if (top) features.push(top)

    // One level of nesting for bundle variants (e.g. for-codashop-client/).
    for (const sub of readdirSync(fullPath, { withFileTypes: true })) {
      if (!sub.isDirectory() || SKIP_SUBDIRS.has(sub.name)) continue
      const nested = stageFeature(path.join(fullPath, sub.name), `${entry.name}/${sub.name}`)
      if (nested) features.push(nested)
    }
  }

  return features.sort((a, b) => a.slug.localeCompare(b.slug))
}

function stageTokens () {
  // Only the tiers components may consume (web-store-tokens §1) — never
  // system/palette/ref, which are upstream structure, not a public contract.
  const CONSUMABLE_TIERS = new Set(['semantics', 'space', 'text-styles', 'extensions'])
  const tokenNames = [...new Set(
    getAllTokens().tokens.filter(t => CONSUMABLE_TIERS.has(t.tier)).map(t => t.name)
  )]
  const storeKeys = readdirSync(path.join(ROOT, 'src/stores'), { withFileTypes: true })
    .filter(e => e.isDirectory() && existsSync(path.join(ROOT, 'src/stores', e.name, 'store.js')))
    .map(e => e.name)
    .sort()

  mkdirSync(path.join(HANDOFF_OUT, 'tokens'), { recursive: true })
  const tokenFiles = []
  for (const store of storeKeys) {
    const resolved = resolveTokensForStore(tokenNames, store)
    writeFileSync(
      path.join(HANDOFF_OUT, 'tokens', `${store}.json`),
      JSON.stringify({ store, tokens: resolved }, null, 2)
    )
    tokenFiles.push(`/handoff/tokens/${store}.json`)
  }
  return { stores: storeKeys, tokenFiles }
}

/** Runs dump-dom.mjs and returns { [slug]: ['/handoff/dom/<slug>/<file>.html', ...] }. */
function stageDomDumps () {
  try {
    execFileSync('node', [path.join(ROOT, 'scripts/dump-dom.mjs')], { stdio: 'inherit' })
  } catch (err) {
    console.warn(`[stage-handoff] WARNING: dump-dom.mjs failed (${err.message}) — continuing without DOM dumps.`)
    return {}
  }
  const domRoot = path.join(HANDOFF_OUT, 'dom')
  if (!existsSync(domRoot)) return {}

  const bySlug = {}
  function walk (dir, slugParts) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), [...slugParts, entry.name])
        continue
      }
      if (!entry.name.endsWith('.html')) continue
      const slug = slugParts.join('/')
      const url = `/handoff/dom/${slug}/${entry.name}`
      ;(bySlug[slug] ??= []).push(url)
    }
  }
  walk(domRoot, [])
  return bySlug
}

function main () {
  rmSync(HANDOFF_OUT, { recursive: true, force: true })
  mkdirSync(HANDOFF_OUT, { recursive: true })

  const features = stageFeatures()
  const { stores, tokenFiles } = stageTokens()
  const domBySlug = stageDomDumps()
  for (const feature of features) {
    // A feature can own more than one dumped sub-slug (e.g.
    // locale-selector-sheets/region + /language for its two sheets) — match
    // both the exact slug and any dom slug nested under it.
    feature.dom = Object.entries(domBySlug)
      .filter(([domSlug]) => domSlug === feature.slug || domSlug.startsWith(`${feature.slug}/`))
      .flatMap(([, urls]) => urls)
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    prototypeVersion: PKG.version,
    stores,
    tokenFiles,
    features,
  }
  writeFileSync(path.join(HANDOFF_OUT, 'index.json'), JSON.stringify(manifest, null, 2))

  const domCount = Object.values(domBySlug).reduce((n, arr) => n + arr.length, 0)
  console.log(`stage-handoff: ${features.length} feature(s), ${stores.length} store token file(s), ${domCount} DOM dump(s) -> public/handoff/`)
}

main()
