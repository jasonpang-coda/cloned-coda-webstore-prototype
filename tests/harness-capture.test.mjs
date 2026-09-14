import { test } from 'node:test'
import assert from 'node:assert/strict'
import { writeFileSync, rmSync, mkdtempSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { runNode, ROOT } from './helpers.mjs'

// A real 1x1 PNG (base64), so decode tests exercise real base64->bytes->file
// round-tripping rather than an arbitrary string.
const ONE_PIXEL_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

test('harness-capture: importing harness-cli.mjs does not print its own CLI usage banner as a side effect', () => {
  // Locks the isMainModule guard — without it, importing loadAllStories()
  // from harness-cli.mjs also ran ITS OWN bottom-of-file switch(command)
  // against harness-capture.mjs's argv, printing harness-cli's usage text
  // before harness-capture's own output.
  const { stdout } = runNode('tools/harness-capture.mjs', ['manifest', 'SkuCard'])
  assert.doesNotMatch(stdout, /node tools\/harness-cli\.mjs test/)
})

test('harness-capture: manifest is 3 stores × 3 widths per story, addressed by the #library= deep-link scheme', () => {
  const { code, stdout } = runNode('tools/harness-capture.mjs', ['manifest', 'SkuCard', '--json'])
  assert.equal(code, 0)
  const manifest = JSON.parse(stdout)
  assert.equal(manifest.length, 9)
  const stores = new Set(manifest.map((t) => t.store))
  assert.deepEqual([...stores].sort(), ['codashop', 'codm', 'fcm'])
  const widths = new Set(manifest.map((t) => t.width))
  assert.deepEqual([...widths].sort(), ['iphone', 'responsive', 'samsung'])
  for (const t of manifest) {
    assert.match(t.url, /^\?theme=\w+&capture=1#library=sku-card/)
    assert.match(t.outFile, /^docs\/Handoff\/components\/sku-card\/captures\/\w+-\w+\.png$/)
  }
})

test('harness-capture: default width (iphone) omits &w= from the URL, matching useLibrary.js\'s own convention', () => {
  const { stdout } = runNode('tools/harness-capture.mjs', ['manifest', 'SkuCard', '--json'])
  const manifest = JSON.parse(stdout)
  const iphoneTargets = manifest.filter((t) => t.width === 'iphone')
  assert.ok(iphoneTargets.length > 0)
  for (const t of iphoneTargets) assert.doesNotMatch(t.url, /[&?]w=/)
  const samsungTargets = manifest.filter((t) => t.width === 'samsung')
  for (const t of samsungTargets) assert.match(t.url, /[&?]w=samsung/)
})

test('harness-capture: no matching story fails loud, not a silent empty manifest', () => {
  const { code, stderr } = runNode('tools/harness-capture.mjs', ['manifest', 'nonexistent-story-name-zzz'])
  assert.equal(code, 1)
  assert.match(stderr, /No matching story found/)
})

test('harness-capture: --curated targets exactly the 7-story representative set (63 shots), not all 86 stories', () => {
  const { code, stdout } = runNode('tools/harness-capture.mjs', ['manifest', '--curated', '--json'])
  assert.equal(code, 0)
  const manifest = JSON.parse(stdout)
  assert.equal(manifest.length, 63, '7 stories × 3 stores × 3 widths')
  const stories = new Set(manifest.map((t) => t.story))
  assert.equal(stories.size, 7)
})

test('harness-capture: --curated together with an explicit story id is refused, not silently ignored', () => {
  const { code, stderr } = runNode('tools/harness-capture.mjs', ['manifest', 'SkuCard', '--curated'])
  assert.equal(code, 1)
  assert.match(stderr, /not both/)
})

test('harness-capture: no story id and no --curated covers all stories but warns loudly first (not silently 774 shots)', () => {
  const { code, stdout } = runNode('tools/harness-capture.mjs', ['manifest'])
  assert.equal(code, 0)
  assert.match(stdout, /Warning: no story id and no --curated — this manifest covers ALL \d+ stories/)
  assert.match(stdout, /Capture manifest:/)
})

const STORY_PATH = path.join(ROOT, 'src/library/stories/ZZZTestCaptureVariant.stories.js')
const COMPONENT_PATH = path.join(ROOT, 'src/components/ZZZTestCaptureVariant.vue')

test('harness-capture: an explicit captureVariant (by name) overrides the last-variant default', () => {
  writeFileSync(COMPONENT_PATH, '<template><div class="zzz-test-capture-variant"></div></template>\n')
  writeFileSync(STORY_PATH, `
import ZZZTestCaptureVariant from '@/components/ZZZTestCaptureVariant.vue'
import { defineStory } from '../story.js'
export default defineStory({
  id: 'zzz-test-capture-variant',
  title: 'ZZZ Test Capture Variant',
  group: 'Components',
  component: ZZZTestCaptureVariant,
  tokens: ['--x-text-header-default'],
  captureVariant: 'Middle',
  variants: [
    { name: 'First', props: () => ({}) },
    { name: 'Middle', props: () => ({}) },
    { name: 'Last', props: () => ({}) },
  ],
})
`)
  try {
    const { code, stdout } = runNode('tools/harness-capture.mjs', ['manifest', 'ZZZTestCaptureVariant', '--json'])
    assert.equal(code, 0)
    const manifest = JSON.parse(stdout)
    assert.ok(manifest.length > 0)
    assert.ok(manifest.every((t) => t.variantIndex === 1), `expected every target to pick variant index 1 ("Middle"), got: ${JSON.stringify(manifest.map((t) => t.variantIndex))}`)
  } finally {
    rmSync(STORY_PATH, { force: true })
    rmSync(COMPONENT_PATH, { force: true })
  }
})

// `save` — the Node-side decode/write half, pairing with
// src/dev/captureHelper.js's browser-side captureCurrentStage().
test('harness-capture save: extracts a base64 payload from the Browser pane\'s auto-saved [{type,text}] shape and writes real bytes', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'harness-capture-save-'))
  try {
    // Mirrors the REAL shape observed from a browser_batch call: one entry
    // per action, the actual capture payload quoted and trailed by tool-log
    // "Tab Context" noise appended after the return value.
    const fromPath = path.join(dir, 'raw-result.json')
    writeFileSync(fromPath, JSON.stringify([
      { type: 'text', text: '[navigate] navigated to http://localhost:5174\n\n\nTab Context:\n- Executed on tabId: seed' },
      { type: 'text', text: '[computer:wait] waited 2s\n\n\nTab Context:\n- Executed on tabId: seed' },
      { type: 'text', text: `[javascript_tool:javascript_exec] "${ONE_PIXEL_PNG_BASE64}"\n\n\nTab Context:\n- Executed on tabId: seed\n- Available tabs:\n  • tabId seed: "COD:M prototype"` },
    ]))
    const toPath = path.join(dir, 'out.png')

    const { code, stdout } = runNode('tools/harness-capture.mjs', ['save', '--from', fromPath, '--to', toPath])
    assert.equal(code, 0)
    assert.match(stdout, /bytes ->/)
    assert.ok(existsSync(toPath))
    const written = readFileSync(toPath)
    assert.deepEqual(written, Buffer.from(ONE_PIXEL_PNG_BASE64, 'base64'))
    // A real PNG signature, not just "some bytes".
    assert.deepEqual(written.subarray(0, 8), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('harness-capture save: --raw treats --from as the bare base64 string, no [{type,text}] unwrapping', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'harness-capture-save-'))
  try {
    const fromPath = path.join(dir, 'raw.b64')
    writeFileSync(fromPath, ONE_PIXEL_PNG_BASE64)
    const toPath = path.join(dir, 'out.png')

    const { code } = runNode('tools/harness-capture.mjs', ['save', '--from', fromPath, '--to', toPath, '--raw'])
    assert.equal(code, 0)
    assert.deepEqual(readFileSync(toPath), Buffer.from(ONE_PIXEL_PNG_BASE64, 'base64'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('harness-capture save: creates the output directory if it does not exist yet', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'harness-capture-save-'))
  try {
    const fromPath = path.join(dir, 'raw.b64')
    writeFileSync(fromPath, ONE_PIXEL_PNG_BASE64)
    const toPath = path.join(dir, 'nested', 'captures', 'out.png')

    const { code } = runNode('tools/harness-capture.mjs', ['save', '--from', fromPath, '--to', toPath, '--raw'])
    assert.equal(code, 0)
    assert.ok(existsSync(toPath))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('harness-capture save: missing --from/--to fails loud, not a silent no-op', () => {
  const { code, stderr } = runNode('tools/harness-capture.mjs', ['save', '--to', '/tmp/whatever.png'])
  assert.equal(code, 1)
  assert.match(stderr, /Usage: node tools\/harness-capture\.mjs save/)
})

test('harness-capture save: a --from file that is not the expected shape (and no --raw) fails loud with actionable guidance', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'harness-capture-save-'))
  try {
    const fromPath = path.join(dir, 'not-json.txt')
    writeFileSync(fromPath, 'this is neither JSON nor base64-shaped')
    const { code, stderr } = runNode('tools/harness-capture.mjs', ['save', '--from', fromPath, '--to', path.join(dir, 'out.png')])
    assert.equal(code, 1)
    assert.match(stderr, /--raw/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
