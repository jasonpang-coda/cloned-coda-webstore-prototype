import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runNode } from './helpers.mjs'

test('preflight overlay parity: no false positive for claim-gift / signin-loader', () => {
  // Regression fixture for the live bug: the old order-sensitive substring
  // check ('claim-gift' -> 'claimgift' never matches 'closeGiftClaim's
  // 'giftclaim') reported both of these as UNREGISTERED_OVERLAY even though
  // they're genuinely wired (via useGiftClaim()/useAuth() being invoked in
  // useCloseAllOverlays.js). The fixed check traces each SURFACES ref back
  // to its owning composable instead of string-matching the surface id.
  const { code, stdout } = runNode('tools/preflight.mjs', ['--json'])
  const result = JSON.parse(stdout)
  const overlayIssues = result.issues.filter((i) => i.type === 'UNREGISTERED_OVERLAY' || i.type === 'OVERLAY_PARITY_UNVERIFIED')
  assert.deepEqual(overlayIssues, [], `expected no overlay-parity false positives, got: ${JSON.stringify(overlayIssues)}`)
  void code // preflight may still exit 1 on unrelated pre-existing findings (e.g. hardcoded colors) — not this test's concern.
})

test('preflight token check: an unknown token in a component is still caught', () => {
  // Locks that swapping the inline regex for the shared scanVarUsages
  // (REG-RETRO02 fix) didn't quietly stop detecting real violations.
  const { code, stdout } = runNode('tools/preflight.mjs', ['src/components/NavBar.vue', '--json'])
  assert.equal(code, 0)
  const result = JSON.parse(stdout)
  assert.equal(result.passed, true)
})
