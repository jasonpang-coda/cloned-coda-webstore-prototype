#!/usr/bin/env node
/**
 * tools/figma-harness.mjs — Figma capture priming + file-based token drift audit.
 *
 * NOT a live MCP bridge — a standalone node process (this script) cannot call
 * an MCP tool itself; MCP tools are only reachable from inside a live Claude
 * session. "Bidirectional ... loop" in earlier docs overstated this. The real
 * shape, and the only shape achievable from a detached script, is:
 *   1. Primes and captures named prototype states via figmaCapture.js (?figmaCapture=<step>).
 *   2. Diffs a Figma variables export FILE (produced separately — see below)
 *      against the prototype's resolved design tokens for a store.
 * The MCP round-trip that produces that file is a Claude-driven step: Claude
 * calls the Figma MCP's get_variable_defs, writes the result to a JSON file
 * shaped like docs/style-guides/<store>/*-figma-tokens.json (the same shape
 * the web-store-figma-tokens skill already produces), then runs `diff-tokens
 * --figma-file <that file>`. See the design-harness skill for that workflow.
 *
 * Usage:
 *   node tools/figma-harness.mjs prime <step-name> [--port 5173]
 *   node tools/figma-harness.mjs diff-tokens --figma-file <path> [--store <store>]
 *   node tools/figma-harness.mjs list-steps
 */

import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAllTokens } from './token-cli.mjs'
import { resolveTokensForStore } from '../scripts/resolve-css.mjs'
import { normalizeColor } from './lib/color.mjs'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

export const FIGMA_CAPTURE_STEPS = [
  'sign-in-sheet',
  'sign-in-loader',
  'player-account-idle',
  'player-account-found',
  'item-summary',
  'checkout',
  'checkout-selected',
  'item-info-on-checkout',
  'codashop-homepage',
]

export const FIGMA_CAPTURE_CONFIG = {
  'codashop-homepage': {
    theme: 'codashop',
    device: 'none',
    selector: '.device__screen',
    viewportWidth: 1440,
    label: 'Codashop Homepage — Responsive',
  },
}

/**
 * List all supported figmaCapture states
 */
function handleListSteps(options) {
  if (options.json) {
    console.log(JSON.stringify({ steps: FIGMA_CAPTURE_STEPS, configs: FIGMA_CAPTURE_CONFIG }, null, 2))
    return
  }

  console.log(`=== Figma Capture Harness Steps (${FIGMA_CAPTURE_STEPS.length} available) ===\n`)
  for (const step of FIGMA_CAPTURE_STEPS) {
    const cfg = FIGMA_CAPTURE_CONFIG[step] || { device: 'iphone', selector: '.device-stage > .device' }
    console.log(`• ${step.padEnd(24)} -> Device: ${(cfg.device || 'iphone').padEnd(10)} | Theme: ${cfg.theme || 'default'}`)
  }
}

/**
 * Prime a specific state for capture
 */
function handlePrime(step, options) {
  if (!step || !FIGMA_CAPTURE_STEPS.includes(step)) {
    console.error(`Error: Invalid step "${step}". Supported steps:`)
    console.error(FIGMA_CAPTURE_STEPS.map((s) => `  - ${s}`).join('\n'))
    process.exit(1)
  }

  const port = options.port || '5173'
  const url = `http://localhost:${port}/?figmaCapture=${step}`
  const config = FIGMA_CAPTURE_CONFIG[step] || { device: 'iphone', selector: '.device-stage > .device' }

  const result = {
    step,
    captureUrl: url,
    targetSelector: config.selector,
    device: config.device || 'iphone',
    theme: config.theme || 'codm',
    readyAttribute: 'data-figma-capture-ready',
    readyValue: step,
    instructions: `Navigate to ${url} in browser/Playwright. Wait for document.documentElement[data-figma-capture-ready="${step}"], then capture screenshot of "${config.selector}".`
  }

  if (options.json) {
    console.log(JSON.stringify(result, null, 2))
    return
  }

  console.log(`=== Priming Figma Capture: ${step} ===\n`)
  console.log(`Target URL        : ${result.captureUrl}`)
  console.log(`Device Frame      : ${result.device}`)
  console.log(`Store Theme       : ${result.theme}`)
  console.log(`Capture Selector  : ${result.targetSelector}`)
  console.log(`Ready Signal      : document.documentElement[${result.readyAttribute}="${result.readyValue}"]`)
  console.log(`\nAutomation Note: External screenshot runners or MCP tools can now capture this element.`)
}

/**
 * Diff token variables against a real Figma variables export file.
 *
 * Expects the export shaped like this repo's own Figma-import JSON
 * (docs/style-guides/<store>/*-figma-tokens.json, produced by the
 * web-store-figma-tokens skill): an array of { name, tokens: [...] }
 * collections, each token carrying { name, value, type }. Since a Figma
 * variable's own name (e.g. "ref/primary") doesn't inherently know which
 * `--x-*`/`--sys-*` CSS custom property it maps to, this only diffs entries
 * that carry an explicit `cssVar` field (the mapping a disciplined export
 * should include) — entries without one are reported as UNMAPPED, not
 * silently ignored, so a real drift can't hide behind a missing mapping.
 */
function handleDiffTokens(options) {
  const store = options.store || 'codm'
  const isJson = !!options.json
  const { tokens } = getAllTokens()

  if (!isJson) {
    console.log(`=== Figma Token Sync & Drift Audit (Store: ${store}) ===\n`)
    console.log(`Total Prototype Tokens: ${tokens.length}`)
  }

  if (!options['figma-file']) {
    console.error(`\nError: --figma-file <path> is required — there is nothing to diff without a real Figma variables export.`)
    console.error(`To produce one: have Claude call the Figma MCP's get_variable_defs, write the result to a JSON file shaped like docs/style-guides/<store>/*-figma-tokens.json (each token carrying a "cssVar" field mapping it to a --x-*/--sys-* name), then re-run this with --figma-file <that file>.`)
    process.exit(1)
  }

  const fullPath = path.isAbsolute(options['figma-file']) ? options['figma-file'] : path.resolve(ROOT, options['figma-file'])
  if (!existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`)
    process.exit(1)
  }
  const figmaData = JSON.parse(readFileSync(fullPath, 'utf8'))
  if (!isJson) console.log(`Loaded Figma variable definitions from: ${path.relative(ROOT, fullPath)}`)

  const figmaEntries = Array.isArray(figmaData)
    ? figmaData.flatMap((coll) => (coll.tokens || []).map((t) => ({ ...t, collection: coll.name })))
    : []
  if (figmaEntries.length === 0) {
    console.error(`\nError: no tokens found in ${path.relative(ROOT, fullPath)} — expected an array of { name, tokens: [...] } collections.`)
    process.exit(1)
  }

  const mapped = figmaEntries.filter((t) => t.cssVar)
  const unmapped = figmaEntries.filter((t) => !t.cssVar)

  const resolved = resolveTokensForStore(mapped.map((t) => t.cssVar), store)

  const mismatches = []
  const matched = []
  for (const entry of mapped) {
    const prototypeValue = resolved[entry.cssVar]
    if (prototypeValue === null || prototypeValue === undefined) {
      mismatches.push({ cssVar: entry.cssVar, figmaValue: entry.value, prototypeValue: null, reason: 'unresolved in prototype for this store' })
      continue
    }
    if (entry.type === 'COLOR') {
      const figmaHex = normalizeColor(entry.value)
      const protoHex = normalizeColor(prototypeValue)
      if (figmaHex && protoHex && figmaHex === protoHex) matched.push(entry.cssVar)
      else mismatches.push({ cssVar: entry.cssVar, figmaValue: entry.value, prototypeValue })
    } else {
      // Non-color (FLOAT/STRING/BOOLEAN): compare stringified values directly.
      if (String(entry.value) === String(prototypeValue)) matched.push(entry.cssVar)
      else mismatches.push({ cssVar: entry.cssVar, figmaValue: entry.value, prototypeValue })
    }
  }

  if (isJson) {
    // A single machine-parseable JSON blob and nothing else on stdout — no
    // interleaved prose before or after it, so a caller can safely
    // JSON.parse(stdout) without hunting for where the object starts/ends.
    console.log(JSON.stringify({ store, matched: matched.length, mismatches, unmapped: unmapped.length, passed: mismatches.length === 0 }, null, 2))
    process.exit(mismatches.length === 0 ? 0 : 1)
  }

  console.log(`\nMapped entries checked: ${mapped.length} | Matched: ${matched.length} | Mismatched: ${mismatches.length} | Unmapped (no cssVar): ${unmapped.length}`)

  if (mismatches.length > 0) {
    console.log(`\nMismatches:`)
    for (const m of mismatches) {
      console.log(`  [MISMATCH] ${m.cssVar}: Figma=${JSON.stringify(m.figmaValue)} vs Prototype(${store})=${JSON.stringify(m.prototypeValue)}${m.reason ? ` (${m.reason})` : ''}`)
    }
  }
  if (unmapped.length > 0) {
    console.log(`\nUnmapped Figma entries (no "cssVar" field — not compared):`)
    for (const u of unmapped.slice(0, 20)) console.log(`  - ${u.collection}/${u.name}`)
    if (unmapped.length > 20) console.log(`  ... and ${unmapped.length - 20} more`)
  }

  if (mismatches.length > 0) {
    console.log(`\n[DRIFT] ${mismatches.length} token(s) differ between Figma and the prototype for store "${store}".`)
    process.exit(1)
  }
  console.log(`\n[ALIGNED] Every mapped token matches for store "${store}".`)
}

// CLI Argument Parsing
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

switch (command) {
  case 'prime':
    handlePrime(positional[0], flags)
    break
  case 'list-steps':
    handleListSteps(flags)
    break
  case 'diff-tokens':
    handleDiffTokens(flags)
    break
  default:
    console.log(`
Usage:
  node tools/figma-harness.mjs prime <step-name> [--port 5173] [--json]
  node tools/figma-harness.mjs list-steps [--json]
  node tools/figma-harness.mjs diff-tokens [--store <store>] [--figma-file <path>]
    `.trim())
    break
}
