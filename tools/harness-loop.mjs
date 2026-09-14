#!/usr/bin/env node
/**
 * tools/harness-loop.mjs — Bounded-Autonomy Retry Loop (Level 3.5)
 *
 * `tools/orchestrator.mjs` is a pure, stateless verifier: it runs the
 * pipeline once and reports a scorecard. It deliberately knows nothing
 * about retries, subagents, or when to give up — that policy lives here
 * instead, so the orchestrator stays reusable without dragging agent
 * dispatch into a verification tool (see plans/tickets/done/harness-router-retry-loop.md).
 *
 * This script is the DECISION ENGINE for one iteration of that policy. It
 * cannot itself invoke a Claude subagent — only a live Claude session can do
 * that (via the Agent tool) — so the actual loop is driven by the caller:
 *
 *   1. Call this script. Read its decision.
 *   2. decision.action === 'dispatch' -> spawn decision.agent with
 *      decision.envelope as its brief, apply the patch, go to 1 (passing
 *      --from-stage decision.resumeFrom to skip stages already proven).
 *   3. decision.action === 'success'  -> done; if decision.compoundDraft is
 *      present, show it to the human for approval (never auto-apply).
 *   4. decision.action === 'escalate' -> stop; decision.escalation names
 *      why. An entry is already appended to audits/retro-ledger.json.
 *
 * State (attempt counts, last-seen failure signature per stage) persists
 * per component under .harness-loop-state/<Component>.json — machine-local,
 * gitignored, reset with --reset.
 *
 * Usage:
 *   node tools/harness-loop.mjs --component <Name> [--group <Group>] [--json] [--reset]
 *   node tools/harness-loop.mjs --component <Name> --force-escalate "<reason>"
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const STATE_DIR = path.join(ROOT, '.harness-loop-state')

// --- CLI parsing ---------------------------------------------------------
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
const isJson = !!flags.json
const isDryRun = !!flags['dry-run'] // skip real ledger writes — for tests and manual dry-runs of the loop itself
const forceEscalateReason = flags['force-escalate']

if (!component) {
  console.log(`
Usage:
  node tools/harness-loop.mjs --component <Name> [--group <Group>] [--json] [--reset]
  node tools/harness-loop.mjs --component <Name> --force-escalate "<reason>"

Options:
  --component, -c    Component name
  --group, -g        Story group category (default: Components)
  --json             Output the decision as machine-readable JSON
  --reset            Clear this component's retry state and start fresh
  --dry-run          Skip real ledger writes on escalation (retro.mjs --dry-run) — for tests/manual dry-runs
  --force-escalate   Skip straight to ESCALATE with the given human-readable reason
                     (e.g. a dispatched agent determined a new semantic token is
                     needed — this harness never auto-adds one; see web-store-tokens)
`.trim())
  process.exit(1)
}

const statePath = path.join(STATE_DIR, `${component}.json`)

if (flags.reset) {
  rmSync(statePath, { force: true })
  if (!isJson) console.log(`Cleared retry state for ${component}.`)
  if (!forceEscalateReason) process.exit(0)
}

function loadState() {
  if (!existsSync(statePath)) {
    return { component, attempts: {}, lastFailureSignature: {}, hadFailure: false }
  }
  try {
    return JSON.parse(readFileSync(statePath, 'utf8'))
  } catch {
    return { component, attempts: {}, lastFailureSignature: {}, hadFailure: false }
  }
}

function saveState(state) {
  mkdirSync(STATE_DIR, { recursive: true })
  writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8')
}

// --- Router map: failed stage -> subagent(s) ------------------------------
// Mirrors .claude/skills/design-harness/subagents.md's three profiles.
// sweep/render are two-step: qa-evaluator classifies (reads the structured
// failures, writes a remediation brief, no edits), component-builder patches.
const ROUTER = {
  intake: { agents: ['component-builder'], allowedPaths: ['src/components/*.vue'] },
  scaffold: { agents: ['story-architect'], allowedPaths: ['src/library/stories/*.stories.js'] },
  sweep: { agents: ['qa-evaluator', 'component-builder'], allowedPaths: ['src/components/*.vue', 'src/library/stories/*.stories.js', 'src/tokens/**'] },
  render: { agents: ['qa-evaluator', 'component-builder'], allowedPaths: ['src/components/*.vue', 'src/library/stories/*.stories.js'] },
  preflight: { agents: ['component-builder'], allowedPaths: ['src/components/*.vue'] },
  handoff: { agents: ['story-architect'], allowedPaths: ['src/library/stories/*.stories.js'] },
}

// Per-stage retry caps (suggested defaults from plans/tickets/done/harness-router-retry-loop.md
// — tune here, in one place, as real usage tells us more).
const RETRY_CAPS = {
  intake: 2,
  scaffold: 2,
  sweep: 3,
  render: 2,
  preflight: 2,
  handoff: 2,
}

/**
 * A stable signature for "is this the same failure as last time" — keyed on
 * structural fields, never on prose, so wording differences don't mask a
 * genuine repeat and don't manufacture a false one.
 */
function signatureFor(stageName, stageResult) {
  if (Array.isArray(stageResult.failures)) {
    const keys = stageResult.failures.map((f) => {
      if (stageName === 'sweep') return `${f.story}|${f.type}|${f.store ?? ''}|${f.token ?? ''}`
      if (stageName === 'render') return `${f.story}|${f.variant}|${f.width}|${f.locale}`
      if (stageName === 'preflight') return `${f.type}|${f.file}|${f.line ?? ''}`
      return JSON.stringify(f)
    })
    return keys.sort().join(';')
  }
  // intake/scaffold/handoff have no structured failures (out of scope for
  // the structured-failures ticket) — fall back to the message itself.
  return stageResult.error || ''
}

function runOrchestrator(extraArgs) {
  const cmdArgs = ['tools/orchestrator.mjs', '--component', component, '--group', group, '--json', ...extraArgs]
  try {
    const stdout = execFileSync('node', cmdArgs, { cwd: ROOT, encoding: 'utf8' })
    return JSON.parse(stdout)
  } catch (err) {
    if (typeof err.stdout === 'string' && err.stdout.trim()) return JSON.parse(err.stdout)
    throw err // orchestrator itself crashed (bad args, uncaught exception) — not a normal FAIL
  }
}

function firstFailedStage(scorecard) {
  for (const [name, result] of Object.entries(scorecard.stages)) {
    if (result.status === 'FAIL') return name
  }
  return null
}

function appendEscalationEntry(reason, scorecard) {
  // Reuses tools/retro.mjs's own append pattern (audits/retro-ledger.json,
  // via the shared lock in tools/lib/ledger.mjs) rather than a new log file
  // — see plans/tickets/done/harness-human-escalation.md. category: 'process'
  // since this is a build-quality/workflow event, not a token lesson.
  try {
    execFileSync('node', [
      'tools/retro.mjs',
      '--lesson', reason,
      '--category', 'process',
      '--component', component,
      '--actionable', 'Escalated by tools/harness-loop.mjs — review the working tree and the scorecard before retrying manually.',
      ...(isDryRun ? ['--dry-run'] : []),
    ], { cwd: ROOT, encoding: 'utf8' })
  } catch (err) {
    // Never let a ledger-write failure hide the escalation itself.
    console.error(`[harness-loop] Warning: failed to append escalation to the retro ledger: ${err.message}`)
  }
}

function draftCompoundCommand(scorecard, state) {
  // A SUCCESS after at least one prior FAIL gets a --dry-run compound.mjs
  // preview — never auto-applied (the closed-set token rule + "human merge
  // is the trust boundary" both apply here; see web-store-tokens skill).
  const fixedStages = Object.keys(state.attempts).filter((s) => state.attempts[s] > 0)
  const rule = `${component} needed ${fixedStages.length} retry round(s) to pass (${fixedStages.join(', ')}) before this run.`
  let preview = null
  try {
    preview = execFileSync('node', [
      'tools/compound.mjs', '--component', component, '--rule', rule, '--dry-run',
    ], { cwd: ROOT, encoding: 'utf8' })
  } catch (err) {
    preview = `(could not generate a preview: ${err.message} — most likely no story exists yet to compound into)`
  }
  return { rule, preview }
}

// --- Main ------------------------------------------------------------------

if (forceEscalateReason) {
  const scorecard = runOrchestrator([])
  appendEscalationEntry(`Force-escalated: ${forceEscalateReason}`, scorecard)
  const decision = { action: 'escalate', escalation: { reason: forceEscalateReason, forced: true }, scorecard }
  console.log(isJson ? JSON.stringify(decision, null, 2) : `[ESCALATE] ${forceEscalateReason}`)
  process.exit(1)
}

const state = loadState()

// Resume from the first stage that hasn't already passed in this retry
// sequence, if we have one — avoids re-running stages a prior iteration of
// this same loop already proved clean. A fresh component (no state yet)
// runs the full pipeline.
const resumeFrom = state.lastFailedStage
const scorecard = runOrchestrator(resumeFrom ? ['--from-stage', resumeFrom] : [])

let decision

if (scorecard.passed) {
  if (state.hadFailure) {
    // The stages this run resumed past are trusted from a prior PASS, not
    // re-proven — run one full clean pass before declaring real success (a
    // sweep fix can re-break preflight; see the router-retry-loop ticket).
    const fullPass = resumeFrom ? runOrchestrator([]) : scorecard
    if (!fullPass.passed) {
      // The resumed run passed, but a full clean run didn't — treat this
      // exactly like any other FAIL on the newly-failed stage, not as a
      // false success.
      const stage = firstFailedStage(fullPass)
      decision = buildFailDecision(stage, fullPass, state)
    } else {
      decision = { action: 'success', scorecard: fullPass, compoundDraft: draftCompoundCommand(fullPass, state) }
      rmSync(statePath, { force: true }) // clear retry state — this component is clean again
    }
  } else {
    decision = { action: 'success', scorecard, compoundDraft: null }
  }
} else {
  const stage = firstFailedStage(scorecard)
  decision = buildFailDecision(stage, scorecard, state)
}

function buildFailDecision(stage, sc, st) {
  const stageResult = sc.stages[stage]
  const signature = signatureFor(stage, stageResult)
  const priorSignature = st.lastFailureSignature[stage]
  const priorAttempts = st.attempts[stage] || 0
  const repeated = priorSignature != null && priorSignature === signature

  st.attempts[stage] = priorAttempts + 1
  st.lastFailureSignature[stage] = signature
  st.lastFailedStage = stage
  st.hadFailure = true
  saveState(st)

  const cap = RETRY_CAPS[stage] ?? 2
  if (repeated || st.attempts[stage] > cap) {
    const reason = repeated
      ? `Identical failure on stage "${stage}" two attempts in a row (attempt ${st.attempts[stage]}).`
      : `Retry cap (${cap}) exceeded on stage "${stage}" (attempt ${st.attempts[stage]}).`
    appendEscalationEntry(`${reason} Last error: ${stageResult.error}`, sc)
    return { action: 'escalate', escalation: { stage, reason, attempts: st.attempts[stage], cap }, scorecard: sc }
  }

  const route = ROUTER[stage] || { agents: ['component-builder'], allowedPaths: ['src/components/*.vue'] }
  return {
    action: 'dispatch',
    resumeFrom: stage,
    retryAttempt: st.attempts[stage],
    envelope: {
      jobId: `${component}-${stage}-${st.attempts[stage]}`,
      component,
      mode: 'remediate',
      failedStage: stage,
      retryAttempt: st.attempts[stage],
      agents: route.agents,
      constraints: [
        'No new tokens without human approval (closed-set token rule — see web-store-tokens skill).',
        `Prefer edits confined to: ${route.allowedPaths.join(', ')}`,
        `Re-run only from stage "${stage}" after patching (node tools/orchestrator.mjs --from-stage ${stage}).`,
      ],
      stageResult,
    },
    scorecard: sc,
  }
}

if (isJson) {
  console.log(JSON.stringify(decision, null, 2))
} else {
  if (decision.action === 'success') {
    console.log(`[SUCCESS] ${component} passed all hard gates.`)
    if (decision.compoundDraft) {
      console.log(`\nSuggested compound.mjs rule (dry-run preview, not applied):`)
      console.log(decision.compoundDraft.preview)
    }
  } else if (decision.action === 'escalate') {
    console.log(`[ESCALATE] ${decision.escalation.reason}`)
  } else {
    console.log(`[DISPATCH] stage "${decision.resumeFrom}" -> ${decision.envelope.agents.join(' then ')} (attempt ${decision.retryAttempt})`)
  }
}

process.exit(decision.action === 'escalate' ? 1 : 0)
