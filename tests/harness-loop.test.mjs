import { test } from 'node:test'
import assert from 'node:assert/strict'
import { writeFileSync, rmSync, existsSync } from 'node:fs'
import path from 'node:path'
import { runNode, ROOT } from './helpers.mjs'
import { toKebabCase } from '../tools/lib/naming.mjs'

// All fixtures use --dry-run so a real escalation never writes into the
// committed audits/retro-ledger.json — see plans/tickets/done/harness-human-escalation.md.

function cleanup(component) {
  rmSync(path.join(ROOT, `.harness-loop-state/${component}.json`), { force: true })
  rmSync(path.join(ROOT, `src/components/${component}.vue`), { force: true })
  rmSync(path.join(ROOT, `src/library/stories/${component}.stories.js`), { force: true })
  // A run that reaches the `handoff` stage (any SUCCESS decision) exports a
  // real spec under docs/Handoff/components/<kebab-id>/ — left behind unless
  // cleaned up here too (a prior run's stray zzz-test-loop-* dirs made it
  // into a real commit before this line existed).
  rmSync(path.join(ROOT, `docs/Handoff/components/${toKebabCase(component)}`), { force: true, recursive: true })
}

test('harness-loop: a fresh zero-token component gets a DISPATCH decision routed to qa-evaluator + component-builder', () => {
  const component = 'ZZZTestLoopDispatch'
  cleanup(component)
  writeFileSync(
    path.join(ROOT, `src/components/${component}.vue`),
    '<template><div class="zzz-loop-dispatch">no tokens</div></template>\n<script setup></script>\n'
  )
  try {
    const { stdout } = runNode('tools/harness-loop.mjs', ['--component', component, '--json', '--dry-run'])
    const decision = JSON.parse(stdout)
    assert.equal(decision.action, 'dispatch')
    assert.equal(decision.resumeFrom, 'sweep')
    assert.equal(decision.retryAttempt, 1)
    assert.deepEqual(decision.envelope.agents, ['qa-evaluator', 'component-builder'])
    assert.ok(Array.isArray(decision.envelope.stageResult.failures) && decision.envelope.stageResult.failures.length > 0)
  } finally {
    cleanup(component)
  }
})

test('harness-loop: the same unfixed failure on a second call escalates instead of retrying a 3rd time', () => {
  const component = 'ZZZTestLoopRepeat'
  cleanup(component)
  writeFileSync(
    path.join(ROOT, `src/components/${component}.vue`),
    '<template><div class="zzz-loop-repeat">no tokens</div></template>\n<script setup></script>\n'
  )
  try {
    const first = JSON.parse(runNode('tools/harness-loop.mjs', ['--component', component, '--json', '--dry-run']).stdout)
    assert.equal(first.action, 'dispatch')

    const second = JSON.parse(runNode('tools/harness-loop.mjs', ['--component', component, '--json', '--dry-run']).stdout)
    assert.equal(second.action, 'escalate')
    assert.equal(second.escalation.stage, 'sweep')
    assert.match(second.escalation.reason, /Identical failure/)
  } finally {
    cleanup(component)
  }
})

test('harness-loop: retry cap is enforced per stage even when the failure signature keeps changing', () => {
  const component = 'ZZZTestLoopCap'
  cleanup(component)
  // sweep's cap is 3 — feed it a DIFFERENT unresolved token each attempt so
  // the "identical signature" escape hatch never fires, and only the raw
  // attempt-count cap can be what stops the loop.
  const write = (token) => writeFileSync(
    path.join(ROOT, `src/components/${component}.vue`),
    `<template><div class="zzz-loop-cap">x</div></template>\n<script setup></script>\n<style scoped>\n.zzz-loop-cap { color: var(--x-not-a-real-token-${token}); }\n</style>\n`
  )
  try {
    write('a')
    const r1 = JSON.parse(runNode('tools/harness-loop.mjs', ['--component', component, '--json', '--dry-run']).stdout)
    assert.equal(r1.action, 'dispatch')
    assert.equal(r1.retryAttempt, 1)

    write('b')
    const r2 = JSON.parse(runNode('tools/harness-loop.mjs', ['--component', component, '--json', '--dry-run']).stdout)
    assert.equal(r2.action, 'dispatch')
    assert.equal(r2.retryAttempt, 2)

    write('c')
    const r3 = JSON.parse(runNode('tools/harness-loop.mjs', ['--component', component, '--json', '--dry-run']).stdout)
    assert.equal(r3.action, 'dispatch')
    assert.equal(r3.retryAttempt, 3)

    write('d')
    const r4 = JSON.parse(runNode('tools/harness-loop.mjs', ['--component', component, '--json', '--dry-run']).stdout)
    assert.equal(r4.action, 'escalate')
    assert.match(r4.escalation.reason, /Retry cap \(3\) exceeded/)
  } finally {
    cleanup(component)
  }
})

test('harness-loop: fixing the failure resumes from the failed stage, runs one full clean pass, and clears retry state', () => {
  const component = 'ZZZTestLoopSuccess'
  cleanup(component)
  writeFileSync(
    path.join(ROOT, `src/components/${component}.vue`),
    '<template><div class="zzz-loop-success">no tokens</div></template>\n<script setup></script>\n'
  )
  try {
    const first = JSON.parse(runNode('tools/harness-loop.mjs', ['--component', component, '--json', '--dry-run']).stdout)
    assert.equal(first.action, 'dispatch')

    // Simulate the dispatched component-builder's patch: a real, resolvable token.
    writeFileSync(
      path.join(ROOT, `src/components/${component}.vue`),
      `<template><div class="zzz-loop-success">fixed</div></template>\n<script setup></script>\n<style scoped>\n.zzz-loop-success { color: var(--x-text-body-default); }\n</style>\n`
    )

    const second = JSON.parse(runNode('tools/harness-loop.mjs', ['--component', component, '--json', '--dry-run']).stdout)
    assert.equal(second.action, 'success')
    assert.ok(second.compoundDraft, 'expected a compound-rule draft since this run had a prior failure')
    for (const stage of Object.keys(second.scorecard.stages)) {
      assert.equal(second.scorecard.stages[stage].status, 'PASS', `expected a full clean PASS on "${stage}", the final verification run must not skip stages`)
    }
    assert.equal(existsSync(path.join(ROOT, `.harness-loop-state/${component}.json`)), false, 'retry state should be cleared once the component is clean again')
  } finally {
    cleanup(component)
  }
})

test('harness-loop: --force-escalate short-circuits straight to ESCALATE with the given reason', () => {
  const component = 'ZZZTestLoopForced'
  cleanup(component)
  writeFileSync(
    path.join(ROOT, `src/components/${component}.vue`),
    `<template><div class="zzz-loop-forced">x</div></template>\n<script setup></script>\n<style scoped>\n.zzz-loop-forced { color: var(--x-text-body-default); }\n</style>\n`
  )
  try {
    const { code, stdout } = runNode('tools/harness-loop.mjs', [
      '--component', component, '--json', '--dry-run', '--force-escalate', 'a new semantic token is needed here',
    ])
    assert.equal(code, 1)
    const decision = JSON.parse(stdout)
    assert.equal(decision.action, 'escalate')
    assert.equal(decision.escalation.forced, true)
    assert.match(decision.escalation.reason, /a new semantic token is needed here/)
  } finally {
    cleanup(component)
  }
})
