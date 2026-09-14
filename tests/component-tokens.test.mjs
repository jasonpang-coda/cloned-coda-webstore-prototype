import { test } from 'node:test'
import assert from 'node:assert/strict'
import { scanVarUsages } from '../tools/lib/component-tokens.mjs'

test('scanVarUsages finds a token regardless of surrounding text order', () => {
  // Regression fixture: this ordering ('claim-gift' vs 'closeGiftClaim')
  // is exactly what defeated the old concatenated-substring overlay-parity
  // check — scanVarUsages itself doesn't do that matching, but this locks
  // that the underlying scanner sees both occurrences independently and in
  // the right order, which the order-sensitive bug depended on getting wrong.
  const content = 'a { color: var(--x-text-a); }\nb { color: var(--x-text-b, #fff); }'
  const usages = scanVarUsages(content)
  assert.equal(usages.length, 2)
  assert.equal(usages[0].token, '--x-text-a')
  assert.equal(usages[0].fallback, null)
  assert.equal(usages[0].line, 1)
  assert.equal(usages[1].token, '--x-text-b')
  assert.equal(usages[1].fallback, '#fff')
  assert.equal(usages[1].line, 2)
})

test('scanVarUsages does not lose matches across multiple lines (no stateful regex bleed)', () => {
  const content = Array.from({ length: 5 }, (_, i) => `.x${i} { color: var(--x-token-${i}); }`).join('\n')
  const usages = scanVarUsages(content)
  assert.equal(usages.length, 5)
  assert.deepEqual(usages.map((u) => u.token), ['--x-token-0', '--x-token-1', '--x-token-2', '--x-token-3', '--x-token-4'])
})
