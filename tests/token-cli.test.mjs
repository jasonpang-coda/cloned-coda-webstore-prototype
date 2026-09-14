import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runNode } from './helpers.mjs'

test('token-cli resolve: unknown token fails loud (exit 1), not a silent "unresolved" success', () => {
  const { code, stderr } = runNode('tools/token-cli.mjs', ['resolve', '--x-definitely-not-a-real-token'])
  assert.equal(code, 1)
  assert.match(stderr, /not declared in any token tier/)
})

test('token-cli resolve: a real token resolves cleanly', () => {
  const { code, stdout } = runNode('tools/token-cli.mjs', ['resolve', '--x-bg-page', '--store', 'codm', '--json'])
  assert.equal(code, 0)
  const result = JSON.parse(stdout)
  assert.equal(result.defined, true)
})

test('token-cli search: zero matches exits 0 — a documented exception, not a bug', () => {
  // .claude/skills/design-harness/SKILL.md explicitly carves this one out:
  // an empty search result is a legitimate answer, unlike every other
  // filter in this suite which must fail loud on a miss.
  const { code, stdout } = runNode('tools/token-cli.mjs', ['search', 'zzz-definitely-not-a-real-query-zzz'])
  assert.equal(code, 0)
  assert.match(stdout, /No tokens found/)
})

test('token-cli audit: uses the single shared scanner, not a reimplemented regex', () => {
  // Locks REG-RETRO02: a duplicate token-scanning regex in handleAudit used
  // to exist alongside tools/lib/component-tokens.mjs's scanVarUsages. This
  // exercises the real behavior that regex was supposed to provide — an
  // unknown token is still caught — via the single shared implementation.
  const { code, stdout } = runNode('tools/token-cli.mjs', ['audit', 'src/components/NavBar.vue', '--json'])
  assert.equal(code, 0)
  const result = JSON.parse(stdout)
  assert.equal(result.valid, true)
})
