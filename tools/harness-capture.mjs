#!/usr/bin/env node
/**
 * tools/harness-capture.mjs — deterministic capture-target planner for the
 * design harness (Plan 3 / plans/tickets/in-progress/visual-capture-rig.md, Phase 1 + the
 * Phase 2 curated-matrix selection).
 *
 * Actual pixel capture needs a REAL browser paint — this repo has no
 * headless-browser dependency (Playwright/Puppeteer), and adding one is a
 * real infra decision (a new multi-hundred-MB devDependency, CI runner
 * setup) this script deliberately does NOT make unilaterally; see the "Not
 * done here" note in plans/tickets/in-progress/visual-capture-rig.md. What this script owns is
 * the DETERMINISTIC part every capture consumer needs regardless of what
 * eventually drives the browser: for a story (or the curated matrix across
 * every story), the exact (story, variant, theme, width) targets, the exact
 * deep-link URL each is addressed by (`#library=<id>&v=<n>&w=<width>` from
 * plans/tickets/done/library-viewer-ux.md, composed with `?theme=<store>`), and the exact
 * file path the resulting PNG belongs at.
 *
 * A human or agent drives the actual capture from this manifest — the same
 * hand-off-a-file pattern tools/figma-harness.mjs's diff-tokens already
 * uses for Figma captures (a detached node process here has no more access
 * to a real renderer than that script's process has to the Figma MCP).
 *
 * Curated matrix (Phase 2 of the plan — NOT the full variant×theme×width
 * cross product, ~774 shots; a deliberately small, high-signal subset):
 *   - 3 contrast-extreme stores: COD:M (dark), Codashop (light), FCM.
 *   - 3 widths: iphone, samsung, responsive (same set harness-render.mjs
 *     already sweeps for the render/crash gate).
 *   - 1 variant per story — the "worst case" for that component: an
 *     explicit `captureVariant` on the story (see src/library/story.js),
 *     else the LAST authored variant by convention (authors tend to order
 *     variants by ascending complexity — confirm/override per-component
 *     with `captureVariant` once that default picks the wrong one).
 *
 * Usage:
 *   node tools/harness-capture.mjs manifest [storyId] [--json]
 *     Prints capture targets for one story (matched the same fuzzy way
 *     harness-cli.mjs's `test <name>` does) or, with no id, every story.
 *
 *   node tools/harness-capture.mjs save --from <file> --to <outFile> [--raw]
 *     The Node-side half of the actual capture — decodes a base64 PNG
 *     payload and writes it to a manifest target's `outFile`. Pairs with
 *     src/dev/captureHelper.js's `captureCurrentStage()`, which is what a
 *     human/agent runs IN the browser to produce that payload (see that
 *     file's own doc for the full recipe). `--from` defaults to expecting
 *     the JSON array shape the Browser pane's own tools auto-save large
 *     results to (`[{type, text}, ...]` — picks the largest `text` entry,
 *     the actual capture, and strips the surrounding tool-log noise); pass
 *     `--raw` if `--from` is already just the bare base64 string with
 *     nothing else in the file.
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { loadAllStories } from './harness-cli.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

export const CURATED_STORES = [
  { key: 'codm',     label: 'COD:M (dark)' },
  { key: 'codashop', label: 'Codashop (light)' },
  { key: 'fcm',      label: 'FCM' },
]
export const CURATED_WIDTHS = ['iphone', 'samsung', 'responsive']

// The "~60 shots, not 774" subset plans/tickets/in-progress/visual-capture-rig.md Phase 2 calls
// for is 3 stores × 3 widths PER STORY (9 shots) — running that against
// every one of the ~86 registered stories would be 774, the exact count the
// plan rejects. "Curated" therefore also means a curated SET OF STORIES, not
// just fewer dimensions per story: 7 stories picked to span the structural
// categories most likely to break differently (an atom, a content-heavy
// card, a bundle/composite card, chrome/nav, a carousel, an overlay sheet, a
// layout primitive) — 7 × 9 = 63 shots. Pass `--curated` to target exactly
// this set; pass an explicit story id/name for anything outside it; naming
// every one of the 86 stories yourself still works (via `manifest all`) but
// reproduces the 774-shot count this subset exists to avoid.
export const CURATED_STORY_IDS = [
  'info-tag',            // atom
  'sku-card',            // content-heavy card (breakdown rows, badges, bonus)
  'bundle-sku-card',      // composite/bundle card
  'nav-bar',              // chrome/nav
  'best-seller-carousel', // carousel
  'sign-in-sheet',        // overlay sheet
  'grid',                 // layout primitive
]

/** Resolve a story's "worst case" variant index — see the file-header doc. */
export function resolveCaptureVariantIndex (story) {
  const count = story.variants.length
  if (count === 0) return 0
  const cv = story.captureVariant
  if (cv === null || cv === undefined) return count - 1
  if (typeof cv === 'number') return Math.min(Math.max(cv, 0), count - 1)
  const byName = story.variants.findIndex((v) => v === cv)
  return byName !== -1 ? byName : count - 1
}

/** Build the exact deep-link URL + output file path for one capture target. */
export function buildCaptureTarget (story, variantIndex, storeKey, width) {
  const params = new URLSearchParams()
  params.set('library', story.id)
  if (variantIndex > 0) params.set('v', String(variantIndex))
  if (width !== 'iphone') params.set('w', width)
  const hash = params.toString()
  return {
    story: story.id,
    variantIndex,
    store: storeKey,
    width,
    // capture=1 (LibraryViewer.vue) hides all chrome but the staged
    // component and sets document.documentElement.dataset.captureReady once
    // images/fonts/entrance-motion have settled — wait on THAT signal, not a
    // fixed timeout, before taking the actual shot.
    url: `?theme=${storeKey}&capture=1#${hash}`,
    outFile: path.join('docs/Handoff/components', story.id, 'captures', `${storeKey}-${width}.png`),
  }
}

/** Full curated manifest for one story. */
export function manifestForStory (story) {
  const variantIndex = resolveCaptureVariantIndex(story)
  const targets = []
  for (const { key: storeKey } of CURATED_STORES) {
    for (const width of CURATED_WIDTHS) {
      targets.push(buildCaptureTarget(story, variantIndex, storeKey, width))
    }
  }
  return targets
}

/**
 * Extracts a base64 payload out of the JSON-array shape the Browser pane's
 * tools auto-save an oversized result to: `[{type, text}, ...]`, one entry
 * per action in a batch (navigate/wait/exec), each `text` prefixed with a
 * `[tool:action] ` label and — for the entry actually returning our capture
 * — trailed by "Tab Context: ..." noise appended after the real return
 * value. Picks the LARGEST `text` entry (the capture payload; navigate/wait
 * log lines are short), then takes the content between the first and last
 * `"` before that trailing noise. Returns null (never throws) if the shape
 * doesn't match, so the caller can report a clear error instead of a raw
 * parse exception.
 */
function extractBase64FromToolResult (raw) {
  let entries
  try {
    entries = JSON.parse(raw)
  } catch {
    return null
  }
  if (!Array.isArray(entries) || entries.length === 0) return null
  const entry = entries.reduce((a, b) => ((b.text || '').length > (a.text || '').length ? b : a))
  const text = entry.text || ''
  const before = text.split('\n\n\nTab Context:')[0]
  const first = before.indexOf('"')
  const last = before.lastIndexOf('"')
  if (first === -1 || last === -1 || last <= first) return null
  return before.slice(first + 1, last)
}

function handleSave (options) {
  const { from, to, raw } = options
  if (!from || !to) {
    console.error('Usage: node tools/harness-capture.mjs save --from <file> --to <outFile> [--raw]')
    process.exitCode = 1
    return
  }

  const fromPath = path.isAbsolute(from) ? from : path.resolve(process.cwd(), from)
  if (!existsSync(fromPath)) {
    console.error(`Error: --from not found: ${from}`)
    process.exitCode = 1
    return
  }

  const content = readFileSync(fromPath, 'utf8')
  const base64 = raw ? content.trim() : extractBase64FromToolResult(content)
  if (!base64) {
    console.error('Error: could not find a base64 payload in --from (expected the Browser pane\'s auto-saved [{type,text}] JSON shape). If --from already contains just the bare base64 string, pass --raw.')
    process.exitCode = 1
    return
  }

  let bytes
  try {
    bytes = Buffer.from(base64, 'base64')
    if (bytes.length === 0) throw new Error('decoded to zero bytes')
  } catch (e) {
    console.error(`Error: --from did not decode as valid base64: ${e.message}`)
    process.exitCode = 1
    return
  }

  const toPath = path.isAbsolute(to) ? to : path.resolve(process.cwd(), to)
  mkdirSync(path.dirname(toPath), { recursive: true })
  writeFileSync(toPath, bytes)
  console.log(`${bytes.length} bytes -> ${path.relative(ROOT, toPath)}`)
}

function handleManifest (target, options) {
  const stories = loadAllStories()

  if (options.curated && target) {
    console.error('Error: --curated already names its own fixed set of stories — pass either --curated or a story id/name, not both.')
    process.exitCode = 1
    return
  }

  let toCapture
  if (options.curated) {
    toCapture = stories.filter((s) => CURATED_STORY_IDS.includes(s.id))
    const missing = CURATED_STORY_IDS.filter((id) => !toCapture.some((s) => s.id === id))
    if (missing.length) {
      console.error(`Error: --curated names ${missing.length} story id(s) that no longer resolve to a real story (renamed/removed?): ${missing.join(', ')}. Update CURATED_STORY_IDS in tools/harness-capture.mjs.`)
      process.exitCode = 1
      return
    }
  } else if (target) {
    toCapture = stories.filter((s) =>
      s.componentName.toLowerCase() === target.toLowerCase() ||
      s.id.toLowerCase() === target.toLowerCase() ||
      s.title.toLowerCase().includes(target.toLowerCase())
    )
    if (toCapture.length === 0) {
      console.error(`Error: No matching story found for "${target}". Run "npm run harness list" to view available stories.`)
      process.exitCode = 1
      return
    }
  } else {
    // No story id and no --curated: every registered story — this is the
    // 774-shot count Phase 2 exists to avoid; not refused outright (an
    // explicit, deliberate full sweep is a legitimate thing to want), but
    // surfaced loudly rather than silently run so it's never an accident.
    toCapture = stories
    if (!options.json) {
      console.log(`Warning: no story id and no --curated — this manifest covers ALL ${stories.length} stories (${stories.length * CURATED_STORES.length * CURATED_WIDTHS.length} shots), the full count plans/tickets/in-progress/visual-capture-rig.md's curated subset exists to avoid. Pass --curated for the ~63-shot representative set, or a story id to scope to one component.\n`)
    }
  }

  const manifest = toCapture.flatMap(manifestForStory)

  if (options.json) {
    console.log(JSON.stringify(manifest, null, 2))
    return
  }

  console.log(`=== Capture manifest: ${toCapture.length} stor${toCapture.length === 1 ? 'y' : 'ies'} × ${CURATED_STORES.length} stores × ${CURATED_WIDTHS.length} widths = ${manifest.length} target(s) ===\n`)
  for (const story of toCapture) {
    const variantIndex = resolveCaptureVariantIndex(story)
    const pickedBy = story.captureVariant !== null ? 'captureVariant' : 'last variant (default)'
    console.log(`${story.title} — variant #${variantIndex} "${story.variants[variantIndex]}" (${pickedBy})`)
    for (const { key: storeKey } of CURATED_STORES) {
      for (const width of CURATED_WIDTHS) {
        const t = buildCaptureTarget(story, variantIndex, storeKey, width)
        console.log(`  [${storeKey}/${width}] ${t.url}  ->  ${t.outFile}`)
      }
    }
  }
}

function flagValue (args, name) {
  const i = args.indexOf(name)
  return i !== -1 ? args[i + 1] : null
}

const args = process.argv.slice(2)
const command = args[0]
const isJson = args.includes('--json')
const isCurated = args.includes('--curated')
const isRaw = args.includes('--raw')
const positional = args.slice(1).find((a) => !a.startsWith('--')) || null

switch (command) {
  case 'manifest':
    handleManifest(positional, { json: isJson, curated: isCurated })
    break
  case 'save':
    handleSave({ from: flagValue(args, '--from'), to: flagValue(args, '--to'), raw: isRaw })
    break
  default:
    console.log(`
Usage:
  node tools/harness-capture.mjs manifest [storyId | --curated] [--json]

  --curated   The ~63-shot representative subset (7 stories × 3 stores × 3
              widths) plans/tickets/in-progress/visual-capture-rig.md Phase 2 calls for — see
              CURATED_STORY_IDS in this file for the list and why each was
              picked. Omitting both storyId and --curated covers every
              registered story (774 shots) and prints a loud warning first.

  node tools/harness-capture.mjs save --from <file> --to <outFile> [--raw]

  --from      A file holding the base64 PNG src/dev/captureHelper.js's
              captureCurrentStage() returned — normally the Browser pane's
              own auto-saved [{type,text}] JSON dump of an oversized tool
              result (the default assumption); pass --raw if --from is
              already just the bare base64 string.
  --to        Output path — normally a manifest target's own \`outFile\`.
    `.trim())
    break
}
