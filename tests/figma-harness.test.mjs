import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { runNode, ROOT } from './helpers.mjs'

test('figma-harness diff-tokens: no --figma-file fails loud (not the old exit-0 aspirational text)', () => {
  const { code, stderr } = runNode('tools/figma-harness.mjs', ['diff-tokens', '--store', 'codm'])
  assert.equal(code, 1)
  assert.match(stderr, /--figma-file <path> is required/)
})

test('figma-harness diff-tokens: no longer ReferenceErrors (getAllTokens was never imported)', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'figma-fixture-'))
  const fixturePath = path.join(dir, 'fixture.json')
  try {
    // Resolve the REAL value for --x-bg-page in codm first, so this fixture
    // is grounded in truth rather than an arbitrary guess.
    const resolveOut = execFileSync('node', ['tools/token-cli.mjs', 'resolve', '--x-bg-page', '--store', 'codm', '--json'], { cwd: ROOT, encoding: 'utf8' })
    const resolved = JSON.parse(resolveOut).resolvedValue // an oklch(...) string

    writeFileSync(fixturePath, JSON.stringify([
      {
        name: 'Colours - Test',
        tokens: [
          // Matching entry — the hex equivalent of the real resolved OKLCH.
          { name: 'Surface/Page', cssVar: '--x-bg-page', value: hexFromOklch(resolved), type: 'COLOR' },
          // Mismatching entry — deliberately wrong.
          { name: 'Text/Header/Wrong', cssVar: '--x-text-header-default', value: '#ff00ff', type: 'COLOR' },
          // Unmapped entry — no cssVar, must be reported, not silently dropped.
          { name: 'Unmapped/NoJoinKey', value: '#123456', type: 'COLOR' },
        ],
      },
    ]))

    const { code, stdout } = runNode('tools/figma-harness.mjs', ['diff-tokens', '--figma-file', fixturePath, '--store', 'codm', '--json'])
    assert.equal(code, 1, 'one deliberate mismatch should fail the audit')
    // --json output should now be a single clean JSON blob, no interleaved
    // prose before or after it.
    const result = JSON.parse(stdout)
    assert.equal(result.matched, 1)
    assert.equal(result.mismatches.length, 1)
    assert.equal(result.mismatches[0].cssVar, '--x-text-header-default')
    assert.equal(result.unmapped, 1)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

// Standard CSS Color 4 / Ottosson OKLab oklch->hex, mirroring
// tools/figma-harness.mjs's own implementation, to build a fixture whose
// "Figma" value is a real, correct hex encoding of the prototype's actual
// resolved color (rather than an unrelated guess that happens to differ).
function hexFromOklch (str) {
  const m = String(str).match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/i)
  const L = Number(m[1]); const C = Number(m[2]); const Hdeg = Number(m[3])
  const H = (Hdeg * Math.PI) / 180
  const a = C * Math.cos(H); const b = C * Math.sin(H)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3; const mm = m_ ** 3; const s = s_ ** 3
  const rLin = 4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s
  const gLin = -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s
  const bLin = -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s
  const ge = (c) => { const cl = Math.min(1, Math.max(0, c)); return cl <= 0.0031308 ? 12.92 * cl : 1.055 * cl ** (1 / 2.4) - 0.055 }
  const hx = (c) => Math.round(ge(c) * 255).toString(16).padStart(2, '0')
  return `#${hx(rLin)}${hx(gLin)}${hx(bLin)}`
}
