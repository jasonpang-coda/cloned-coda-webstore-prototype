import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runNode } from './helpers.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('export-sandbox.mjs produces a complete single-store bundle', () => {
  const dest = mkdtempSync(path.join(tmpdir(), 'sandbox-export-test-'))
  rmSync(dest, { recursive: true, force: true }) // exporter requires an empty/non-existent dest
  try {
    const { code, stdout } = runNode('tools/sandbox/export-sandbox.mjs', [dest, '--store', 'codm'])
    assert.equal(code, 0, `expected exit 0, got stdout:\n${stdout}`)

    for (const rel of [
      'package.json', 'vite.config.js', 'index.html', 'AGENTS.md', 'catalog.json',
      'src/main.js', 'src/CanvasHost.vue', 'src/page.example.vue',
      'guardrail/preflight.mjs',
      'vendor/components/Button.vue', 'vendor/active-stores.js',
      'vendor/tokens/ds/themes/codm.css', 'vendor/stores/codm/store.js',
    ]) {
      assert.ok(existsSync(path.join(dest, rel)), `expected ${rel} to exist in the exported bundle`)
    }

    const catalog = JSON.parse(readFileSync(path.join(dest, 'catalog.json'), 'utf8'))
    assert.equal(catalog.store, 'codm')
    assert.deepEqual(catalog.stores, ['codm'])
    assert.ok(catalog.components.length > 10, 'expected a substantial curated component catalog')

    const activeStores = readFileSync(path.join(dest, 'vendor/active-stores.js'), 'utf8')
    assert.match(activeStores, /import s0 from '\.\/stores\/codm\/store\.js'/)
    assert.match(activeStores, /ACTIVE_STORES = \[s0\]/)
  } finally {
    rmSync(dest, { recursive: true, force: true })
  }
})

test('export-sandbox.mjs --store <a>,<b> vendors both stores and generates a 2-store active-stores.js', () => {
  const dest = mkdtempSync(path.join(tmpdir(), 'sandbox-export-multi-test-'))
  rmSync(dest, { recursive: true, force: true })
  try {
    const { code } = runNode('tools/sandbox/export-sandbox.mjs', [dest, '--store', 'codm,fcm'])
    assert.equal(code, 0)
    assert.ok(existsSync(path.join(dest, 'vendor/stores/codm/store.js')))
    assert.ok(existsSync(path.join(dest, 'vendor/stores/fcm/store.js')))
    assert.ok(existsSync(path.join(dest, 'vendor/tokens/ds/themes/codm.css')))
    assert.ok(existsSync(path.join(dest, 'vendor/tokens/ds/themes/fcm.css')))

    const activeStores = readFileSync(path.join(dest, 'vendor/active-stores.js'), 'utf8')
    assert.match(activeStores, /import s0 from '\.\/stores\/codm\/store\.js'/)
    assert.match(activeStores, /import s1 from '\.\/stores\/fcm\/store\.js'/)
    assert.match(activeStores, /ACTIVE_STORES = \[s0, s1\]/)
  } finally {
    rmSync(dest, { recursive: true, force: true })
  }
})

test('export-sandbox.mjs rejects an unknown store, writes nothing', () => {
  const dest = path.join(tmpdir(), `sandbox-export-unknown-${Date.now()}`)
  rmSync(dest, { recursive: true, force: true })
  try {
    const { code, stderr } = runNode('tools/sandbox/export-sandbox.mjs', [dest, '--store', 'not-a-real-store'])
    assert.equal(code, 1)
    assert.match(stderr, /Unknown store/)
    assert.equal(existsSync(dest), false, 'destination must not be created on an unknown-store error')
  } finally {
    rmSync(dest, { recursive: true, force: true })
  }
})

test('export-sandbox.mjs refuses a non-empty destination', () => {
  const dest = mkdtempSync(path.join(tmpdir(), 'sandbox-export-nonempty-'))
  try {
    // mkdtempSync itself leaves the dir non-empty enough for this check —
    // it's an existing, accessible directory the exporter must refuse.
    const { code, stderr } = runNode('tools/sandbox/export-sandbox.mjs', [ROOT]) // ROOT is definitely non-empty
    assert.equal(code, 1)
    assert.match(stderr, /not empty/)
  } finally {
    rmSync(dest, { recursive: true, force: true })
  }
})
