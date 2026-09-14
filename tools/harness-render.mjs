#!/usr/bin/env node
/**
 * tools/harness-render.mjs — the render/crash gate the harness was missing.
 *
 * Every other harness tool is static analysis: token-cli/vue-slice/preflight
 * read source text, harness-cli resolves CSS var() names as strings. None of
 * them instantiate a component, so a runtime error in setup()/a computed —
 * the exact shape of the bug that shipped in the extracted StoryStage
 * (`renderKey` referenced a `theme` binding that no longer existed in scope)
 * — passes every one of them, and a clean `vite build`, silently.
 *
 * This renders each story's variants through @coda/harness-kit/vue's
 * StoryStage — not the leaf component alone — via Vite SSR
 * (`renderToString`, @vue/server-renderer; ships with `vue`, no new dep).
 * Rendering through StoryStage specifically is what would have caught the
 * theme.value bug; rendering a leaf component in isolation would not have,
 * since the bug was in StoryStage's own remount-key computed.
 *
 * SSR has no real DOM, so a component that touches matchMedia/
 * IntersectionObserver/ResizeObserver at setup time can throw for reasons
 * unrelated to a real bug — the shim below covers the common cases. A story
 * that still can't SSR for a legitimate reason should set `skipRender: true`
 * (visible in the report, never silent) rather than weakening this gate.
 *
 * --locales <csv|stress> adds a LOCALE dimension (default: just 'en', so the
 * existing default sweep's cost is unchanged unless explicitly opted into).
 * `--locales stress` is shorthand for `ar,ja` — COD:M's own REAL translated
 * content (src/stores/codm/store.js's `translations`), not fabricated
 * strings: `ar` for RTL-script text, `ja` for CJK text with no natural
 * word-wrap points. Both are exactly the shape of string most likely to
 * overflow a card/badge sized for English. See plans/tickets/done/design-quality-gates.md
 * Gate 2 for why real translated content beats synthetic filler, and its
 * documented limitation: this only swaps STRING CONTENT — it does not
 * simulate `dir="rtl"` mirroring, which is an app-shell-level concern
 * (useLocale.js's isRtlActive) StoryStage's isolated render never reaches.
 * A story/locale combo can't be translated for a store with no `translations`
 * entry for that language — it silently falls through to English (the real
 * app's own behavior — see useStoreStrings.js's stringsFor), so a "PASS" on
 * an unlisted locale for such a store only proves the layout didn't crash on
 * the SAME English string tested at the default locale, not that it
 * survives real translated content.
 *
 * Usage:
 *   node tools/harness-render.mjs [storyId|all] [--json] [--locales <csv|stress>]
 */

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { h, createSSRApp } from 'vue'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const STORIES_DIR = path.join(ROOT, 'src/library/stories')

// Matches StoryStage's own WIDTHS (packages/harness-kit/src/vue/components/
// StoryStage.vue) — the width dimension the static sweep (harness-cli.mjs)
// deliberately doesn't cover, since token resolution doesn't vary by width;
// a container-query layout break only shows up once something actually
// renders at each size, which is what this gate does.
const RENDER_WIDTHS = ['iphone', 'samsung', 'responsive']

// COD:M's own real translated languages (src/stores/codm/store.js) that
// stress two distinct failure shapes — see the file-header doc for why
// these two, not a synthetic guess.
const STRESS_LOCALES = ['ar', 'ja']

const args = process.argv.slice(2)
const isJson = args.includes('--json')

const localesFlagIndex = args.indexOf('--locales')
const localesArg = localesFlagIndex !== -1 ? args[localesFlagIndex + 1] : null
const RENDER_LOCALES = !localesArg
  ? ['en']
  : localesArg === 'stress'
    ? ['en', ...STRESS_LOCALES]
    : ['en', ...new Set(localesArg.split(',').map((s) => s.trim()).filter(Boolean).filter((l) => l !== 'en'))]

// Positional story id = first non-flag token that isn't `--locales`'s own value.
const consumedArgIndices = new Set(localesFlagIndex !== -1 ? [localesFlagIndex, localesFlagIndex + 1] : [])
const requestedStory = args.find((a, i) => !a.startsWith('--') && !consumedArgIndices.has(i)) || null

// Minimal shim so module-top-level and setup()-time reads of these globals
// (composables like useTheme.js, drag/scroll listeners, etc.) don't throw
// under Node's SSR environment, which has none of them. Mirrors
// scripts/export-handoff.mjs's installBrowserGlobalShim, extended with the
// browser APIs that render-time (not just module-eval-time) code tends to
// reach for.
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
  const files = readdirSync(STORIES_DIR).filter((f) => f.endsWith('.stories.js'))
  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const targets = requestedStory
    ? files.filter((f) => normalize(f).includes(normalize(requestedStory)))
    : files

  if (requestedStory && targets.length === 0) {
    const available = files.map((f) => f.replace(/\.stories\.js$/, '')).join(', ')
    console.error(`No story matches "${requestedStory}". Available: ${available}`)
    process.exitCode = 1
    return
  }

  // optimizeDeps.force — see scripts/export-handoff.mjs for why: a stale
  // node_modules/.vite dep cache can make two identical invocations of an
  // SSR-loading script return different results.
  const server = await createServer({ root: ROOT, server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'warn', optimizeDeps: { force: true } })
  installRenderShim()

  const { StoryStage } = await server.ssrLoadModule('@coda/harness-kit/vue')
  const { renderToString } = await import('@vue/server-renderer')

  // Global custom directives (v-ripple, v-haptic, …) are registered on the
  // real app instance in src/main.js — a bare h()/renderToString(vnode) call
  // has no app context at all, so EVERY global directive resolves to
  // undefined and Vue's SSR codegen throws reading `.getSSRProps` off it.
  // Mirror main.js's registration on a throwaway SSR app per render so
  // components using them render the same way the real app does.
  const { vRipple } = await server.ssrLoadModule(path.join(ROOT, 'src/directives/vRipple.js'))
  const { vHaptic } = await server.ssrLoadModule(path.join(ROOT, 'src/directives/vHaptic.js'))

  // Real store data (plain objects — key/config/strings/assets on a default
  // export, no composable, no window/document touch) rather than an empty
  // context, so a variant's props(ctx) function that reads e.g.
  // ctx.assets.brand.icon doesn't false-positive on a shape it didn't expect.
  let context = { assets: {}, config: {}, strings: {}, theme: 'codm' }
  // One context per requested locale — `strings` is the only thing that
  // varies; assets/config/theme are locale-independent. contextByLocale.en
  // is always the plain store.strings (identical to the pre-locale-flag
  // behavior), so the default (no --locales) run is byte-for-byte unchanged.
  const contextByLocale = {}
  try {
    const storeMod = await server.ssrLoadModule(path.join(ROOT, 'src/stores/codm/store.js'))
    const store = storeMod.default
    context = { assets: store.assets || {}, config: store.config || {}, strings: store.strings || {}, theme: 'codm' }
    const { stringsFor } = await server.ssrLoadModule(path.join(ROOT, 'src/composables/useStoreStrings.js'))
    for (const locale of RENDER_LOCALES) {
      contextByLocale[locale] = locale === 'en' ? context : { ...context, strings: stringsFor('codm', locale) }
    }
  } catch (err) {
    // A silent fallback here is exactly the swallow-and-mask pattern this
    // gate exists to catch elsewhere (REG-RETRO01) — surface it loudly (the
    // gate still runs on the empty context, since the store failing to load
    // isn't itself a component-render bug) rather than letting a real
    // store.js regression hide behind an unrelated-looking wall of PASS/FAIL
    // render results.
    console.warn(`[harness-render] WARNING: src/stores/codm/store.js failed to load (${err.message}) — falling back to an empty context. A variant that reads e.g. ctx.assets.brand.icon may now false-fail. Investigate store.js before trusting this run.`)
    for (const locale of RENDER_LOCALES) contextByLocale[locale] = context
  }

  const results = []
  for (const file of targets) {
    const mod = await server.ssrLoadModule(path.join(STORIES_DIR, file))
    const story = mod.default
    if (!story) continue

    if (story.skipRender) {
      results.push({ story: story.id, status: 'SKIPPED', reason: 'skipRender: true on the story' })
      continue
    }

    const variants = story.variants || []
    for (let variantIndex = 0; variantIndex < variants.length; variantIndex++) {
      const variantName = variants[variantIndex]?.name || `#${variantIndex}`
      // Render at every width StoryStage supports, not just 'iphone' — a
      // container-query layout break at the Samsung (384px) or responsive
      // (100%) width previously had zero SSR coverage; the static sweep
      // (harness-cli.mjs) can't cover this either, since token resolution
      // doesn't vary by width.
      for (const width of RENDER_WIDTHS) {
        for (const locale of RENDER_LOCALES) {
          // We report render errors ourselves (one line, with story/variant
          // context) — silence Vue's own console dump of the full story object
          // for the duration of this render so a failure doesn't scroll a wall
          // of noise past it. NOT using app.config.errorHandler for this: when
          // set, Vue routes the error there INSTEAD of rejecting/throwing, which
          // would make renderToString resolve normally and this gate silently
          // miss every failure — the opposite of what it exists to do.
          const realWarn = console.warn
          const realError = console.error
          console.warn = () => {}
          console.error = () => {}
          try {
            const app = createSSRApp(h(StoryStage, { story, variantIndex, width, context: contextByLocale[locale] }))
            app.directive('ripple', vRipple)
            app.directive('haptic', vHaptic)
            await renderToString(app)
            results.push({ story: story.id, variant: variantName, width, locale, status: 'PASS' })
          } catch (err) {
            results.push({ story: story.id, variant: variantName, width, locale, status: 'FAIL', error: err.message })
          } finally {
            console.warn = realWarn
            console.error = realError
          }
        }
      }
    }
  }

  await server.close()

  const failures = results.filter((r) => r.status === 'FAIL')
  const skipped = results.filter((r) => r.status === 'SKIPPED')
  const rendered = results.length - skipped.length

  if (isJson) {
    console.log(JSON.stringify({
      results,
      renderedCount: rendered,
      skippedCount: skipped.length,
      failuresCount: failures.length,
      passed: failures.length === 0
    }, null, 2))
  } else {
    // Only print `@ locale` when more than one locale actually ran — the
    // default (--locales unset) output stays exactly as it was before this
    // dimension existed.
    const localeSuffix = (r) => (RENDER_LOCALES.length > 1 ? ` [${r.locale}]` : '')
    for (const r of results) {
      if (r.status === 'PASS') console.log(`[PASS] ${r.story} — ${r.variant} @ ${r.width}${localeSuffix(r)}`)
      else if (r.status === 'SKIPPED') console.log(`[SKIP] ${r.story} — ${r.reason}`)
      else console.error(`[RENDER_FAILURE] ${r.story} — ${r.variant} @ ${r.width}${localeSuffix(r)}: ${r.error}`)
    }
    console.log('')
    // skipRender opts a story out of this entire gate — surface the count
    // every run (not just when nonzero would be alarming) so coverage
    // erosion from an accumulating pile of skips is always visible, not
    // just discoverable by someone thinking to go check.
    console.log(`${skipped.length} of ${targets.length} stor${targets.length === 1 ? 'y' : 'ies'} skipped (skipRender: true)${skipped.length ? ': ' + skipped.map((s) => s.story).join(', ') : ''}.`)
    if (RENDER_LOCALES.length > 1) {
      console.log(`Locales rendered: ${RENDER_LOCALES.join(', ')} (content only — no dir="rtl" mirroring; see file-header doc).`)
    }
    console.log(failures.length === 0
      ? `[HARNESS RENDER PASS] ${rendered} render(s) (variant × width${RENDER_LOCALES.length > 1 ? ' × locale' : ''}) clean.`
      : `[HARNESS RENDER FAIL] ${failures.length} of ${rendered} render(s) failed — see [RENDER_FAILURE] lines above.`)
  }

  if (failures.length > 0) process.exitCode = 1
}

main().catch((err) => { console.error(err); process.exitCode = 1 })
