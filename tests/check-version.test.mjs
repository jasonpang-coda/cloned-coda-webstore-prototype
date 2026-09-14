import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runNode } from './helpers.mjs'

test('check-version: an already-claimed version is rejected', () => {
  const { code, stderr } = runNode('scripts/check-version.mjs', ['--version', '0.87.0'])
  assert.equal(code, 1)
  assert.match(stderr, /VERSION COLLISION/)
})

test('check-version: the SAME claimed version with a "v" prefix is also rejected', () => {
  // Regression fixture: version was compared without stripping a leading
  // v/V, so `--version v0.87.0` (prefixed) could never string-match the
  // bare '0.87.0' stored in release-notes/git log, silently reporting a
  // taken version as free.
  const { code, stderr } = runNode('scripts/check-version.mjs', ['--version', 'v0.87.0'])
  assert.equal(code, 1)
  assert.match(stderr, /VERSION COLLISION/)
})

test('check-version: a genuinely unclaimed version passes', () => {
  const { code, stdout } = runNode('scripts/check-version.mjs', ['--version', '99.99.99'])
  assert.equal(code, 0)
  assert.match(stdout, /not yet claimed/)
})
