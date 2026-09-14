import { test } from 'node:test'
import assert from 'node:assert/strict'
import { writeFileSync, rmSync, existsSync } from 'node:fs'
import path from 'node:path'
import { runNode, ROOT } from './helpers.mjs'

const COMPONENT_PATH = path.join(ROOT, 'src/components/ZZZTestOrchBroken.vue')
const STORY_PATH = path.join(ROOT, 'src/library/stories/ZZZTestOrchBroken.stories.js')

test('orchestrator: a sweep failure halts the pipeline — render/preflight/handoff never run', () => {
  // A zero-token component fails the sweep stage (via the L2 NO_TOKENS_TESTED
  // fix), which is a hard gate. Locks that runStage()'s return value is
  // actually checked now — it used to be ignored, so every later stage ran
  // regardless, including exporting a handoff spec for a broken component.
  writeFileSync(COMPONENT_PATH, '<template><div class="zzz-orch-broken">no tokens</div></template>\n')
  try {
    const { code, stdout } = runNode('tools/orchestrator.mjs', ['--component', 'ZZZTestOrchBroken', '--json'])
    const scorecard = JSON.parse(stdout)
    assert.equal(code, 1)
    assert.equal(scorecard.passed, false)
    assert.equal(scorecard.stages.sweep.status, 'FAIL')
    assert.equal(scorecard.stages.render.status, 'SKIPPED')
    assert.equal(scorecard.stages.preflight.status, 'SKIPPED')
    assert.equal(scorecard.stages.handoff.status, 'SKIPPED')
  } finally {
    rmSync(COMPONENT_PATH, { force: true })
    rmSync(STORY_PATH, { force: true })
  }
})

const PREFLIGHT_COMPONENT_PATH = path.join(ROOT, 'src/components/ZZZTestOrchPreflightViolation.vue')
const PREFLIGHT_STORY_PATH = path.join(ROOT, 'src/library/stories/ZZZTestOrchPreflightViolation.stories.js')

test('orchestrator: a real preflight violation now fails the pipeline (locks the hasFailures/totalIssues field-name bug)', () => {
  // preflight.mjs's own --json shape is { passed, count, issues } — the
  // orchestrator's preflight stage used to check `parsed.hasFailures` /
  // `parsed.totalIssues`, fields preflight.mjs never emits, so this hard
  // gate silently PASSED regardless of real violations, and `handoff` ran
  // on a component preflight had actually rejected. This locks the fix:
  // a real HARDCODED_COLOR violation must halt before handoff, and the
  // structured `failures` array (not just a prose message) must be on
  // the scorecard so a future routing agent can act on it.
  writeFileSync(
    PREFLIGHT_COMPONENT_PATH,
    '<template><div class="zzz-orch-preflight">x</div></template>\n' +
    '<script setup></script>\n' +
    '<style scoped>\n.zzz-orch-preflight { color: var(--x-text-body-default); background: #123456; }\n</style>\n'
  )
  try {
    const { code, stdout } = runNode('tools/orchestrator.mjs', ['--component', 'ZZZTestOrchPreflightViolation', '--json'])
    const scorecard = JSON.parse(stdout)
    assert.equal(code, 1)
    assert.equal(scorecard.passed, false)
    assert.equal(scorecard.stages.preflight.status, 'FAIL')
    assert.ok(Array.isArray(scorecard.stages.preflight.failures), 'expected a structured failures array, not just a prose message')
    assert.ok(
      scorecard.stages.preflight.failures.some((f) => f.type === 'HARDCODED_COLOR'),
      `expected a HARDCODED_COLOR entry, got: ${JSON.stringify(scorecard.stages.preflight.failures)}`
    )
    assert.equal(scorecard.stages.handoff.status, 'SKIPPED')
  } finally {
    rmSync(PREFLIGHT_COMPONENT_PATH, { force: true })
    rmSync(PREFLIGHT_STORY_PATH, { force: true })
  }
})

test('orchestrator: a sweep FAIL carries a structured failures array, not just a prose message', () => {
  // Locks the other half of the same fix for the sweep stage: execSync
  // throws before the explicit `if (!parsed.passed) throw` line is ever
  // reached (harness-cli.mjs exits 1 on a real FAIL), so the enriched
  // message + failures array must come from recovering err.stdout, not
  // from that unreachable line.
  writeFileSync(COMPONENT_PATH, '<template><div class="zzz-orch-broken">no tokens</div></template>\n')
  try {
    const { stdout } = runNode('tools/orchestrator.mjs', ['--component', 'ZZZTestOrchBroken', '--json'])
    const scorecard = JSON.parse(stdout)
    assert.equal(scorecard.stages.sweep.status, 'FAIL')
    assert.ok(Array.isArray(scorecard.stages.sweep.failures), 'expected a structured failures array on the sweep stage')
    assert.ok(
      scorecard.stages.sweep.failures.some((f) => f.type === 'NO_TOKENS_TESTED'),
      `expected a NO_TOKENS_TESTED entry, got: ${JSON.stringify(scorecard.stages.sweep.failures)}`
    )
  } finally {
    rmSync(COMPONENT_PATH, { force: true })
    rmSync(STORY_PATH, { force: true })
  }
})

test('orchestrator: --from-stage skips earlier stages instead of re-running them', () => {
  writeFileSync(
    PREFLIGHT_COMPONENT_PATH,
    '<template><div class="zzz-orch-preflight">x</div></template>\n' +
    '<script setup></script>\n' +
    '<style scoped>\n.zzz-orch-preflight { color: var(--x-text-body-default); background: #123456; }\n</style>\n'
  )
  try {
    const { stdout } = runNode('tools/orchestrator.mjs', [
      '--component', 'ZZZTestOrchPreflightViolation', '--json', '--from-stage', 'preflight'
    ])
    const scorecard = JSON.parse(stdout)
    assert.equal(scorecard.stages.intake.status, 'SKIPPED')
    assert.equal(scorecard.stages.scaffold.status, 'SKIPPED')
    assert.equal(scorecard.stages.sweep.status, 'SKIPPED')
    assert.equal(scorecard.stages.render.status, 'SKIPPED')
    assert.equal(scorecard.stages.preflight.status, 'FAIL')
    // The story never got scaffolded (scaffold stage was skipped), so
    // nothing outside preflight's own component-file scan should exist.
    assert.equal(existsSync(PREFLIGHT_STORY_PATH), false)
  } finally {
    rmSync(PREFLIGHT_COMPONENT_PATH, { force: true })
    rmSync(PREFLIGHT_STORY_PATH, { force: true })
  }
})

test('orchestrator: an unknown --from-stage value errors clearly instead of running the full pipeline', () => {
  const { code, stdout, stderr } = runNode('tools/orchestrator.mjs', [
    '--component', 'ZZZTestOrchDoesNotExist', '--from-stage', 'not-a-real-stage'
  ])
  assert.equal(code, 1)
  const output = stdout + stderr
  assert.match(output, /not a known stage/)
})
