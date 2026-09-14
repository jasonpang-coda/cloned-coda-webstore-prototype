import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { runNode } from './helpers.mjs'

test('figma-token-crosswalk: no --figma-file fails loud, not a silent no-op', () => {
  const { code, stderr } = runNode('tools/figma-token-crosswalk.mjs', [])
  assert.equal(code, 1)
  assert.match(stderr, /Usage: node tools\/figma-token-crosswalk\.mjs --figma-file/)
})

test('figma-token-crosswalk: --figma-file pointing nowhere fails loud', () => {
  const { code, stderr } = runNode('tools/figma-token-crosswalk.mjs', ['--figma-file', 'definitely/not/a/real/path.json'])
  assert.equal(code, 1)
  assert.match(stderr, /not found/)
})

test('figma-token-crosswalk: non-array JSON fails loud instead of silently returning nothing', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'figma-crosswalk-fixture-'))
  const fixturePath = path.join(dir, 'fixture.json')
  try {
    writeFileSync(fixturePath, JSON.stringify({ not: 'an array' }))
    const { code, stderr } = runNode('tools/figma-token-crosswalk.mjs', ['--figma-file', fixturePath])
    assert.equal(code, 1)
    assert.match(stderr, /must contain a JSON array/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('figma-token-crosswalk: a real repo value with a matching semantic alias resolves ✅ and ranks the right candidate first', () => {
  // Grounded in the ACTUAL repo definition (not a guessed value) — locks in
  // Batch 1 of plans/tickets/in-progress/figma-token-sync.md: --x-gap-content-loose aliases
  // --x-sys-space-main (12px), same as Figma's gap/content/loose -> sys/space/main.
  const dir = mkdtempSync(path.join(tmpdir(), 'figma-crosswalk-fixture-'))
  const fixturePath = path.join(dir, 'fixture.json')
  try {
    writeFileSync(fixturePath, JSON.stringify([
      {
        requestedId: 'VariableID:test/gap-content-loose',
        chain: [
          { variableName: 'gap/content/loose', collectionName: 'Spacing - Semantics', rawValue: { type: 'VARIABLE_ALIAS', id: 'VariableID:test/sys-space-main' } },
          { variableName: 'sys/space/main', collectionName: 'Spacing - System', rawValue: 12 },
        ],
      },
    ]))

    const { code, stdout } = runNode('tools/figma-token-crosswalk.mjs', ['--figma-file', fixturePath, '--json'])
    assert.equal(code, 0)
    const [result] = JSON.parse(stdout)
    assert.equal(result.status, '✅')
    assert.equal(result.value, 12)
    assert.ok(result.semanticMatches.length > 0)
    assert.equal(result.semanticMatches[0].name, '--x-gap-content-loose')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('figma-token-crosswalk: a value with no repo primitive at all is reported as 🆕, not silently skipped', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'figma-crosswalk-fixture-'))
  const fixturePath = path.join(dir, 'fixture.json')
  try {
    writeFileSync(fixturePath, JSON.stringify([
      {
        requestedId: 'VariableID:test/nonsense',
        chain: [
          { variableName: 'gap/content/absurd', collectionName: 'Spacing - Semantics', rawValue: 123456.789 },
        ],
      },
    ]))

    const { code, stdout } = runNode('tools/figma-token-crosswalk.mjs', ['--figma-file', fixturePath, '--json'])
    assert.equal(code, 0)
    const [result] = JSON.parse(stdout)
    assert.equal(result.status, '🆕')
    assert.equal(result.primitiveMatches.length, 0)
    assert.equal(result.semanticMatches.length, 0)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('figma-token-crosswalk: an untraceable chain (no terminal numeric value) is reported, not thrown', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'figma-crosswalk-fixture-'))
  const fixturePath = path.join(dir, 'fixture.json')
  try {
    writeFileSync(fixturePath, JSON.stringify([
      { requestedId: 'VariableID:test/broken', error: 'aliased variable missing/unresolvable', chain: [] },
    ]))

    const { code, stdout } = runNode('tools/figma-token-crosswalk.mjs', ['--figma-file', fixturePath, '--json'])
    assert.equal(code, 0)
    const [result] = JSON.parse(stdout)
    assert.equal(result.status, '❓')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
