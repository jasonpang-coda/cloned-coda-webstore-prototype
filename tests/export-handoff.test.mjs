import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { runNode, ROOT } from './helpers.mjs'

// --verify used to be forced into story-mode no matter what (`isStoryMode =
// args.includes('--story') || isVerifyMode`), so bare `--verify` never
// touched flow-mode output (spec.md/spec.json under docs/Handoff/<slug>/,
// the shape docs/Handoff/pwa-web-push/ actually is) at all — it silently
// checked nothing for that entire class of output. These tests hand-corrupt
// a REAL flow spec (backed up and restored in `finally`, since this is the
// user's own in-progress file, not a disposable fixture) to prove verify can
// both pass on real content and actually fail on real drift.
const SPEC_JSON_PATH = path.join(ROOT, 'docs/Handoff/pwa-web-push/spec.json')

test('export-handoff --verify (flow mode, no --story) checks something and passes when in sync', () => {
  assert.ok(existsSync(SPEC_JSON_PATH), 'fixture prerequisite: docs/Handoff/pwa-web-push/spec.json must exist')
  const { code, stdout } = runNode('scripts/export-handoff.mjs', ['pwa-web-push', '--verify'])
  assert.equal(code, 0)
  assert.match(stdout, /PARITY.*spec\.md/)
  assert.match(stdout, /PARITY.*spec\.json/)
})

test('export-handoff --verify (flow mode) actually fails on real drift, not just existence', () => {
  const original = readFileSync(SPEC_JSON_PATH, 'utf8')
  try {
    writeFileSync(SPEC_JSON_PATH, original + '\n// hand-corrupted for a test\n')
    // [DRIFT]/[SPEC DRIFT] print via console.error, not console.log — assert
    // against stderr, not stdout.
    const { code, stderr } = runNode('scripts/export-handoff.mjs', ['pwa-web-push', '--verify'])
    assert.equal(code, 1)
    assert.match(stderr, /DRIFT.*spec\.json/)
  } finally {
    writeFileSync(SPEC_JSON_PATH, original)
  }
  // Confirm the restore actually took (finally ran the write, but verify
  // it produced byte-identical content, not just "a" write).
  assert.equal(readFileSync(SPEC_JSON_PATH, 'utf8'), original)
})

test('export-handoff --story --verify (story mode) is unaffected by the flow-mode fix', () => {
  const { code, stdout } = runNode('scripts/export-handoff.mjs', ['--story', '--verify'])
  assert.equal(code, 0)
  assert.match(stdout, /PARITY/)
})

// plans/tickets/in-progress/visual-capture-rig.md Phase 3b — spec.md embeds any real capture
// PNGs found under docs/Handoff/components/<id>/captures/ at export time.
const ZZZ_STORY_PATH = path.join(ROOT, 'src/library/stories/ZZZTestCaptureEmbed.stories.js')
const ZZZ_COMPONENT_PATH = path.join(ROOT, 'src/components/ZZZTestCaptureEmbed.vue')
const ZZZ_OUT_DIR = path.join(ROOT, 'docs/Handoff/components/zzz-test-capture-embed')
const ZZZ_CAPTURES_DIR = path.join(ZZZ_OUT_DIR, 'captures')

test('export-handoff --story: embeds a real capture PNG found on disk into spec.md, and --verify catches a capture added after the last export', () => {
  writeFileSync(ZZZ_COMPONENT_PATH, '<template><div class="zzz-test-capture-embed"></div></template>\n')
  writeFileSync(ZZZ_STORY_PATH, `
import ZZZTestCaptureEmbed from '@/components/ZZZTestCaptureEmbed.vue'
import { defineStory } from '../story.js'
export default defineStory({
  id: 'zzz-test-capture-embed',
  title: 'ZZZ Test Capture Embed',
  group: 'Components',
  component: ZZZTestCaptureEmbed,
  tokens: ['--x-text-header-default'],
  variants: [{ name: 'Default', props: () => ({}) }],
})
`)
  try {
    // No captures/ yet — spec.md must not claim a Reference Captures section
    // that doesn't exist.
    runNode('scripts/export-handoff.mjs', ['--story', 'ZZZTestCaptureEmbed'])
    const specPath = path.join(ZZZ_OUT_DIR, 'spec.md')
    let spec = readFileSync(specPath, 'utf8')
    assert.doesNotMatch(spec, /## Reference Captures/)

    // A capture arrives (a 1x1 PNG is enough — this only checks the markdown
    // wiring, not image content) — re-export and it should now appear.
    mkdirSync(ZZZ_CAPTURES_DIR, { recursive: true })
    const onePixelPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
    writeFileSync(path.join(ZZZ_CAPTURES_DIR, 'codm-iphone.png'), onePixelPng)

    // Not regenerated yet — --verify must catch the drift (a capture exists
    // on disk that the committed spec.md doesn't reflect), not silently pass.
    const { code: verifyCode, stderr } = runNode('scripts/export-handoff.mjs', ['--story', 'ZZZTestCaptureEmbed', '--verify'])
    assert.equal(verifyCode, 1)
    assert.match(stderr, /DRIFT.*zzz-test-capture-embed/)

    runNode('scripts/export-handoff.mjs', ['--story', 'ZZZTestCaptureEmbed'])
    spec = readFileSync(specPath, 'utf8')
    assert.match(spec, /## Reference Captures/)
    assert.match(spec, /!\[ZZZ Test Capture Embed — codm iphone\]\(captures\/codm-iphone\.png\)/)

    const { code: verifyCode2 } = runNode('scripts/export-handoff.mjs', ['--story', 'ZZZTestCaptureEmbed', '--verify'])
    assert.equal(verifyCode2, 0)
  } finally {
    rmSync(ZZZ_STORY_PATH, { force: true })
    rmSync(ZZZ_COMPONENT_PATH, { force: true })
    rmSync(ZZZ_OUT_DIR, { recursive: true, force: true })
  }
})

// plans/tickets/in-progress/harness-false-confidence.md item 3 — a token whose value is the same
// at every store collapses into a flat list; only genuinely-divergent tokens
// keep the full 12-column table. Grounded in two REAL tokens with known
// uniform/divergent behavior (confirmed via resolveTokensAcrossStores at the
// time this test was written), not synthetic values, so this locks the
// actual generator behavior against real token data, not a mocked shape.
const TOKEN_TABLE_STORY_PATH = path.join(ROOT, 'src/library/stories/ZZZTestTokenTable.stories.js')
const TOKEN_TABLE_COMPONENT_PATH = path.join(ROOT, 'src/components/ZZZTestTokenTable.vue')
const TOKEN_TABLE_OUT_DIR = path.join(ROOT, 'docs/Handoff/components/zzz-test-token-table')

test('export-handoff --story: token table collapses uniform-across-all-stores tokens, keeps a full table only for divergent ones', () => {
  writeFileSync(TOKEN_TABLE_COMPONENT_PATH, '<template><div class="zzz-test-token-table"></div></template>\n')
  writeFileSync(TOKEN_TABLE_STORY_PATH, `
import ZZZTestTokenTable from '@/components/ZZZTestTokenTable.vue'
import { defineStory } from '../story.js'
export default defineStory({
  id: 'zzz-test-token-table',
  title: 'ZZZ Test Token Table',
  group: 'Components',
  component: ZZZTestTokenTable,
  // --x-pad-surface-m: 12px at every store (uniform). --x-radius-container-s:
  // 8px at most stores but 0px at diabloimmortal/mgsse/roguetrader/ygomd
  // (divergent) — both confirmed real, not synthetic.
  tokens: ['--x-pad-surface-m', '--x-radius-container-s'],
  variants: [{ name: 'Default', props: () => ({}) }],
})
`)
  try {
    runNode('scripts/export-handoff.mjs', ['--story', 'ZZZTestTokenTable'])
    const spec = readFileSync(path.join(TOKEN_TABLE_OUT_DIR, 'spec.md'), 'utf8')
    assert.match(spec, /\*\*Same value at every store:\*\*/)
    assert.match(spec, /\| `--x-pad-surface-m` \| `12px` \|/)
    assert.match(spec, /\*\*Diverges per store:\*\*/)
    assert.match(spec, /\| Token \| CODASHOP \| CODM \|/) // full 12-column header present
    assert.match(spec, /\| `--x-radius-container-s` \| `8px` \| `8px` \| `0px` \|/) // real per-store values
    // The uniform token must NOT also appear in the 12-column divergent table.
    const divergentSection = spec.slice(spec.indexOf('**Diverges per store:**'))
    assert.doesNotMatch(divergentSection, /--x-pad-surface-m/)
  } finally {
    rmSync(TOKEN_TABLE_STORY_PATH, { force: true })
    rmSync(TOKEN_TABLE_COMPONENT_PATH, { force: true })
    rmSync(TOKEN_TABLE_OUT_DIR, { recursive: true, force: true })
  }
})
