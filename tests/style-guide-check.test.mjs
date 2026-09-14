import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { runNode, ROOT } from './helpers.mjs'
import { oklchToHex, colorsApproxEqual } from '../tools/lib/color.mjs'

test('colorsApproxEqual: absorbs 1/255 oklch round-trip rounding noise, still catches a real edit', () => {
  // Real case: #abff00 authored -> oklch(...) -> re-encodes to #abff01.
  assert.equal(colorsApproxEqual('#abff00', '#abff01'), true)
  // A genuinely different color must still fail.
  assert.equal(colorsApproxEqual('#abff00', '#ff00ff'), false)
})

test('style-guide-check: unknown slug fails loud with the known-guides list, not a silent no-op', () => {
  const { code, stderr } = runNode('tools/style-guide-check.mjs', ['not-a-real-store'])
  assert.equal(code, 1)
  assert.match(stderr, /no spec\.json found for "not-a-real-store"/)
  assert.match(stderr, /Known style guides:/)
})

test('style-guide-check: list finds every docs/style-guides/*/spec.json', () => {
  const { code, stdout } = runNode('tools/style-guide-check.mjs', ['list', '--json'])
  assert.equal(code, 0)
  const { guides } = JSON.parse(stdout)
  assert.ok(guides.includes('diablo-immortal'))
  assert.ok(guides.includes('mcoc'))
})

test('style-guide-check: a spec whose ref colours and font match the real theme passes clean', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'style-guide-fixture-'))
  const specPath = path.join(dir, 'spec.json')
  try {
    const resolveVar = (v) => JSON.parse(
      execFileSync('node', ['tools/token-cli.mjs', 'resolve', v, '--store', 'codm', '--json'], { cwd: ROOT, encoding: 'utf8' })
    ).resolvedValue

    const primaryHex = oklchToHex(resolveVar('--x-ref-primary'))
    const fontHeading = resolveVar('--x-sys-font-family-heading') // e.g. "'Hitmarker Text VF', sans-serif"
    const fontFirstFamily = fontHeading.split(',')[0].replace(/^['"]|['"]$/g, '')

    writeFileSync(specPath, JSON.stringify({
      codashop: {
        brandLocked: {
          ref: { primary: primaryHex },
          typePrimitives: { fontHeading: `${fontFirstFamily}, sans-serif` },
        },
      },
    }))

    const { code, stdout } = runNode('tools/style-guide-check.mjs', ['codm', '--spec', specPath, '--json'])
    assert.equal(code, 0, stdout)
    const result = JSON.parse(stdout)
    assert.equal(result.ok, true)
    assert.equal(result.mismatches.length, 0)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('style-guide-check: a deliberately wrong ref colour is caught as drift, not silently passed', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'style-guide-fixture-'))
  const specPath = path.join(dir, 'spec.json')
  try {
    writeFileSync(specPath, JSON.stringify({
      codashop: {
        brandLocked: {
          ref: { primary: '#ff00ff' }, // deliberately wrong for codm
        },
      },
    }))

    const { code, stdout } = runNode('tools/style-guide-check.mjs', ['codm', '--spec', specPath, '--json'])
    assert.equal(code, 1)
    const result = JSON.parse(stdout)
    assert.equal(result.ok, false)
    assert.equal(result.mismatches.length, 1)
    assert.equal(result.mismatches[0].token, '--x-ref-primary')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('style-guide-check: a spec missing brandLocked errors instead of reporting a false pass', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'style-guide-fixture-'))
  const specPath = path.join(dir, 'spec.json')
  try {
    writeFileSync(specPath, JSON.stringify({ codashop: {} }))
    const { code, stdout } = runNode('tools/style-guide-check.mjs', ['codm', '--spec', specPath, '--json'])
    assert.equal(code, 1)
    const result = JSON.parse(stdout)
    assert.equal(result.ok, false)
    assert.match(result.error, /no codashop\.brandLocked block/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
