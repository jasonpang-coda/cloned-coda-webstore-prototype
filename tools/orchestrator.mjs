#!/usr/bin/env node
/**
 * tools/orchestrator.mjs — End-to-End Design Harness Pipeline Orchestrator (Level 3)
 *
 * Chains the entire development and verification workflow into an automated pipeline:
 * 1. Intake & Interface Analysis (vue-slice contract)
 * 2. Story Scaffolding (scaffold.mjs story)
 * 3. Headless Matrix Sweep across 12 Store Themes & 3 Widths (harness-cli.mjs)
 * 3.5. Render/Crash Gate — SSR smoke test through StoryStage (harness-render.mjs)
 * 4. Static Preflight Compliance Check (preflight.mjs)
 * 5. Deterministic Spec Export (export-handoff.mjs --story)
 *
 * Usage:
 *   node tools/orchestrator.mjs --component <ComponentName> [--group <Group>] [--dry-run] [--json]
 */

import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// CLI Argument Parsing
const args = process.argv.slice(2)
const flags = {}
for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  if (arg.startsWith('--')) {
    const key = arg.slice(2)
    if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
      flags[key] = args[i + 1]
      i++
    } else {
      flags[key] = true
    }
  }
}

const component = flags.component || flags.c
const group = flags.group || flags.g || 'Components'
const isDryRun = !!flags['dry-run']
const isJson = !!flags.json

// Stage order used by both HARD_GATES iteration and --from-stage validation.
// Kept as a single source of truth so a stage can't be added to the pipeline
// below without also being addressable by --from-stage.
const STAGE_ORDER = ['intake', 'scaffold', 'sweep', 'render', 'preflight', 'handoff']
const fromStage = flags['from-stage']
if (fromStage && !STAGE_ORDER.includes(fromStage)) {
  console.error(`Error: --from-stage "${fromStage}" is not a known stage. Valid stages: ${STAGE_ORDER.join(', ')}`)
  process.exit(1)
}
// Every stage re-reads its inputs from disk — nothing carries in memory
// across stages — so skipping earlier ones is safe. Resuming past a HARD
// GATE means that gate's PASS is being trusted from a prior run, not
// re-proven; the caller (the retry loop) is responsible for a final full
// clean pass before declaring overall success. See harness-from-stage-resume.md.
const fromStageIndex = fromStage ? STAGE_ORDER.indexOf(fromStage) : 0

if (!component) {
  console.log(`
Usage:
  node tools/orchestrator.mjs --component <ComponentName> [--group <Group>] [--dry-run] [--json]

Options:
  --component, -c   Name of the component (e.g. SkuPromotionCard, SkuTag)
  --group, -g       Story group category (default: Components)
  --dry-run         Simulate pipeline without writing files
  --json            Output machine-readable pipeline scorecard
  --from-stage <id> Resume from this stage onward (${STAGE_ORDER.join('|')}),
                    marking earlier stages SKIPPED instead of re-running them
`.trim())
  process.exit(1)
}

const componentPath = path.join(ROOT, `src/components/${component}.vue`)
const storyPath = path.join(ROOT, `src/library/stories/${component}.stories.js`)

const scorecard = {
  component,
  group,
  timestamp: new Date().toISOString(),
  stages: {},
  passed: true,
}

// Stages whose failure must stop the pipeline — a broken intake/scaffold/
// sweep/render/preflight means what follows would run against a component
// that's missing, unresolvable, or already known to crash. 'handoff' isn't
// listed: it's the last stage, so there's nothing after it to protect.
const HARD_GATES = new Set(['intake', 'scaffold', 'sweep', 'render', 'preflight'])

let halted = false

/**
 * Shells out to a `--json` harness tool and returns its parsed stdout.
 *
 * The underlying tools (harness-cli.mjs, harness-render.mjs, preflight.mjs)
 * intentionally `process.exit(1)` on a FAIL result — correct for direct CLI
 * use. But that means execSync throws before we'd ever reach a normal
 * `JSON.parse(stdout)` on the failure path; the structured payload the tool
 * already printed lives on the thrown error's own `.stdout`, not on a
 * successful return. Recovering it here (instead of falling back to
 * execSync's generic "Command failed" message) is what makes a stage FAIL
 * carry the tool's real `failures`/`issues` array instead of losing it.
 */
function runJsonTool(cmd) {
  let stdout
  try {
    stdout = execSync(cmd, { cwd: ROOT, encoding: 'utf8' })
  } catch (err) {
    if (typeof err.stdout === 'string' && err.stdout.trim()) {
      stdout = err.stdout
    } else {
      throw err // a real crash (bad args, uncaught exception) — no JSON to recover
    }
  }
  return JSON.parse(stdout)
}

function runStage(name, description, fn) {
  if (fromStageIndex > STAGE_ORDER.indexOf(name)) {
    scorecard.stages[name] = { status: 'SKIPPED', reason: 'Resumed from a later stage (--from-stage).' }
    if (!isJson) {
      console.log(`\n▶ Stage: ${description}...`)
      console.log(`  ⊘ SKIPPED (resumed from --from-stage ${fromStage})`)
    }
    return true
  }

  if (halted) {
    scorecard.stages[name] = { status: 'SKIPPED', reason: 'Pipeline halted by an earlier stage failure.' }
    if (!isJson) {
      console.log(`\n▶ Stage: ${description}...`)
      console.log(`  ⊘ SKIPPED (pipeline already halted)`)
    }
    return false
  }

  if (!isJson) {
    console.log(`\n▶ Stage: ${description}...`)
  }
  const start = Date.now()
  try {
    const output = fn()
    const elapsed = Date.now() - start
    scorecard.stages[name] = { status: 'PASS', elapsedMs: elapsed, output }
    if (!isJson) {
      console.log(`  ✓ PASS (${elapsed}ms)`)
    }
    return true
  } catch (err) {
    const elapsed = Date.now() - start
    scorecard.stages[name] = { status: 'FAIL', elapsedMs: elapsed, error: err.message }
    if (err.failures) scorecard.stages[name].failures = err.failures
    scorecard.passed = false
    if (!isJson) {
      console.error(`  ✗ FAIL (${elapsed}ms): ${err.message}`)
    }
    if (HARD_GATES.has(name)) halted = true
    return false
  }
}

if (!isJson) {
  console.log(`=======================================================`)
  console.log(`  Design Harness Pipeline Orchestrator: ${component}`)
  console.log(`=======================================================`)
}

// Stage 1: Component & Interface Intake
runStage('intake', '1. Inspecting Component Contract & Dependencies', () => {
  if (!existsSync(componentPath)) {
    return `Component does not exist yet at src/components/${component}.vue (will be scaffolded).`
  }
  const cmd = `node "${path.join(__dirname, 'vue-slice.mjs')}" contract "${componentPath}"`
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim()
})

// Stage 2: Story Scaffolding
runStage('scaffold', '2. Story Scaffolding & Registration Check', () => {
  if (existsSync(storyPath)) {
    return `Existing story found at src/library/stories/${component}.stories.js`
  }
  const dryFlag = isDryRun ? ' --dry-run' : ''
  const cmd = `node "${path.join(__dirname, 'scaffold.mjs')}" story --name "${component}" --group "${group}"${dryFlag}`
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim()
})

// Stage 3: Headless Matrix Sweep (12 Themes × 3 Widths)
runStage('sweep', '3. Headless Sweep Across 12 Store Themes', () => {
  if (!existsSync(storyPath) && isDryRun) {
    return 'Dry-run: Skipped sweep for unwritten story.'
  }
  const cmd = `node "${path.join(__dirname, 'harness-cli.mjs')}" test "${component}" --json`
  const parsed = runJsonTool(cmd)
  if (!parsed.passed) {
    const err = new Error(`Matrix check failed with ${parsed.failuresCount} issues across store themes.`)
    // Each result is one story; flatten its own `failures[]` (already
    // { type, store, token, message }-shaped by harness-cli.mjs) with the
    // story name attached, so a caller can key/diff on { story, type, store,
    // token } across retry attempts instead of parsing prose.
    err.failures = parsed.results.flatMap((r) => r.failures.map((f) => ({ story: r.story, ...f })))
    throw err
  }
  return `Clean: Verified across all 12 store themes.`
})

// Stage 3.5: Render/Crash Gate — the sweep above is static token resolution
// only; this is the only stage that actually instantiates the component
// (via SSR through StoryStage), catching a runtime error in setup()/a
// computed that every static tool, including the sweep above, misses.
runStage('render', '3.5. Render/Crash Gate (SSR smoke test)', () => {
  if (!existsSync(storyPath)) {
    return 'Story does not exist yet; skipped render gate.'
  }
  const cmd = `node "${path.join(__dirname, 'harness-render.mjs')}" "${component}" --json`
  const parsed = runJsonTool(cmd)
  if (!parsed.passed) {
    const err = new Error(`Render gate failed with ${parsed.failuresCount} failure(s).`)
    // Already { story, variant, width, locale, status: 'FAIL', error }-shaped.
    err.failures = parsed.results.filter((r) => r.status === 'FAIL')
    throw err
  }
  return `Clean: all variants rendered without error.`
})

// Stage 4: Static Preflight Audit
runStage('preflight', '4. Static Preflight Linter (Tokens & Container Queries)', () => {
  if (!existsSync(componentPath)) {
    return 'Component not created yet; skipped static preflight.'
  }
  const cmd = `node "${path.join(__dirname, 'preflight.mjs')}" "${componentPath}" --json`
  const parsed = runJsonTool(cmd)
  // preflight.mjs's real JSON shape is { passed, count, issues } — this used
  // to check `parsed.hasFailures`/`parsed.totalIssues`, fields the tool never
  // emits, so this hard gate silently never failed regardless of how many
  // violations preflight actually found. Fixed as part of the structured-
  // failures ticket (plans/tickets/done/harness-structured-failures.md).
  if (!parsed.passed) {
    const err = new Error(`Preflight failed with ${parsed.count} rule violations.`)
    err.failures = parsed.issues // already { type, file, line?, message, snippet? }-shaped
    throw err
  }
  return `Clean: 0 container query or token violations.`
})

// Stage 5: Deterministic Spec Export
runStage('handoff', '5. Handoff Spec Generation (docs/Handoff/)', () => {
  if (isDryRun) {
    return 'Dry-run: Spec export skipped.'
  }
  if (!existsSync(storyPath)) {
    return 'Story does not exist; skipped spec export.'
  }
  const cmd = `node "${path.join(ROOT, 'scripts/export-handoff.mjs')}" --story "${component}"`
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim()
})

if (isJson) {
  console.log(JSON.stringify(scorecard, null, 2))
} else {
  console.log(`\n=======================================================`)
  console.log(`  Pipeline Result: ${scorecard.passed ? 'ALL GATES PASSED [READY FOR REVIEW]' : 'PIPELINE FAILED'}`)
  console.log(`=======================================================`)
}

process.exit(scorecard.passed ? 0 : 1)
