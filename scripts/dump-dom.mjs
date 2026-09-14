#!/usr/bin/env node
/**
 * scripts/dump-dom.mjs — writes real rendered HTML per story variant for
 * every handoff-target component, so an external scraper's plain `fetch`
 * (no headless browser) still gets real markup instead of the SPA's empty
 * `<div id="app">` shell.
 *
 * Reuses the exact SSR render path tools/harness-render.mjs already proved
 * out (StoryStage via Vite SSR + @vue/server-renderer, same directive/shim/
 * context setup) — this script just captures renderToString()'s output to a
 * file per (story, variant, width) instead of discarding it after a
 * PASS/FAIL check. If a story fails to render, harness-render.mjs is the
 * place to fix that — this script assumes it already passes.
 *
 * Scoped to STORY_TO_SLUG below (the handoff-target components — see
 * docs/Handoff/<slug>/AGENTS.md) rather than every story in
 * src/library/stories/, since a full DOM dump of every component the
 * harness knows about is out of scope for this feature.
 *
 * Output: public/handoff/dom/<slug>/<variant>-<width>.html, one file per
 * (story, variant, width) combination, listed in public/handoff/index.json
 * (see scripts/stage-handoff.mjs's DOM_DUMP_SLUGS).
 *
 * Usage: node scripts/dump-dom.mjs
 */
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { h, createSSRApp } from 'vue'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const STORIES_DIR = path.join(ROOT, 'src/library/stories')
const OUT_DIR = path.join(ROOT, 'public/handoff/dom')

// Handoff-target components only — keep in sync with docs/Handoff/*/AGENTS.md
// and stage-handoff.mjs's STATE_URLS. story.id -> handoff slug.
const STORY_TO_SLUG = {
  'trust-bar': 'trust-bar',
  'best-seller-card': 'bestseller-card-effects',
  'sku-card': 'sku-card-entrance-stagger',
  'region-selector-sheet': 'locale-selector-sheets/region',
  'language-selector-sheet': 'locale-selector-sheets/language',
}

const RENDER_WIDTHS = ['iphone', 'samsung', 'responsive']

function slugifyVariant (name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'default'
}

// Same shim as tools/harness-render.mjs / scripts/export-handoff.mjs — lets
// module-top-level and setup()-time reads of these globals survive Node's
// SSR environment, which has none of them.
function installRenderShim () {
  if (typeof globalThis.window === 'undefined') {
    globalThis.window = { location: { search: '', hash: '' }, addEventListener () {}, removeEventListener () {}, matchMedia: () => ({ matches: false, addEventListener () {}, removeEventListener () {} }) }
  }
  if (typeof globalThis.document === 'undefined') {
    globalThis.document = { documentElement: { dataset: {} } }
  }
  if (typeof globalThis.matchMedia === 'undefined') {
    globalThis.matchMedia = globalThis.window.matchMedia
  }
  if (typeof globalThis.IntersectionObserver === 'undefined') {
    globalThis.IntersectionObserver = class { observe () {} unobserve () {} disconnect () {} }
  }
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class { observe () {} unobserve () {} disconnect () {} }
  }
}

async function main () {
  const server = await createServer({ root: ROOT, server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'warn', optimizeDeps: { force: true } })
  installRenderShim()

  const { StoryStage } = await server.ssrLoadModule('@coda/harness-kit/vue')
  const { renderToString } = await import('@vue/server-renderer')
  const { vRipple } = await server.ssrLoadModule(path.join(ROOT, 'src/directives/vRipple.js'))
  const { vHaptic } = await server.ssrLoadModule(path.join(ROOT, 'src/directives/vHaptic.js'))

  let context = { assets: {}, config: {}, strings: {}, theme: 'codm' }
  try {
    const storeMod = await server.ssrLoadModule(path.join(ROOT, 'src/stores/codm/store.js'))
    const store = storeMod.default
    context = { assets: store.assets || {}, config: store.config || {}, strings: store.strings || {}, theme: 'codm' }
  } catch (err) {
    console.warn(`[dump-dom] WARNING: src/stores/codm/store.js failed to load (${err.message}) — falling back to an empty context.`)
  }

  const written = []

  for (const file of readdirSync(STORIES_DIR)) {
    if (!file.endsWith('.stories.js')) continue
    const mod = await server.ssrLoadModule(path.join(STORIES_DIR, file))
    const story = mod.default
    if (!story || !STORY_TO_SLUG[story.id]) continue
    const slug = STORY_TO_SLUG[story.id]
    if (story.skipRender) {
      console.warn(`[dump-dom] SKIP ${story.id} (skipRender: true) — no DOM dump written.`)
      continue
    }

    const variants = story.variants || []
    for (let variantIndex = 0; variantIndex < variants.length; variantIndex++) {
      const variantName = variants[variantIndex]?.name || `#${variantIndex}`
      for (const width of RENDER_WIDTHS) {
        const realWarn = console.warn
        const realError = console.error
        console.warn = () => {}
        console.error = () => {}
        try {
          const app = createSSRApp(h(StoryStage, { story, variantIndex, width, context }))
          app.directive('ripple', vRipple)
          app.directive('haptic', vHaptic)
          const html = await renderToString(app)
          const destDir = path.join(OUT_DIR, slug)
          mkdirSync(destDir, { recursive: true })
          const destFile = path.join(destDir, `${slugifyVariant(variantName)}-${width}.html`)
          writeFileSync(destFile, html)
          written.push(destFile)
        } catch (err) {
          console.error(`[dump-dom] FAILED to render ${story.id} — ${variantName} @ ${width}: ${err.message}`)
        } finally {
          console.warn = realWarn
          console.error = realError
        }
      }
    }
  }

  await server.close()
  console.log(`dump-dom: wrote ${written.length} file(s) -> public/handoff/dom/`)
}

main().catch((err) => { console.error(err); process.exitCode = 1 })
