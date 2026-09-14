import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { runNode, ROOT } from './helpers.mjs'

test('pack-kit.mjs computes package.json `files` from disk — includes utils/, excludes package.json and .git', () => {
  // Regression lock (two bugs found during Milestone 2 QA):
  //   1. A hand-maintained literal `files` array omitted `utils/`, which
  //      several vendored store modules import (e.g. stores/codm/
  //      milestone.js's `../../utils/formatNumber.js`) — npm's `files`
  //      allowlist silently dropped it from every real install even though
  //      it existed in the packed source folder.
  //   2. Packing directly into an existing git clone (as publish-kit.mjs
  //      does) leaked `.git` itself into that same computed list.
  // Fixed by computing `files` from readdirSync(destAbs) AFTER all vendoring
  // completes, excluding only package.json and .git — this test locks both
  // the fix and the exact failure mode that motivated it.
  const dest = mkdtempSync(path.join(tmpdir(), 'sandbox-pack-kit-test-'))
  rmSync(dest, { recursive: true, force: true })
  try {
    const { code, stdout } = runNode('tools/sandbox/pack-kit.mjs', [dest, '--store', 'codm'])
    assert.equal(code, 0, `expected exit 0, got stdout:\n${stdout}`)

    const pkg = JSON.parse(readFileSync(path.join(dest, 'package.json'), 'utf8'))
    assert.equal(pkg.name, '@coda/sandbox-kit')
    assert.ok(pkg.files.includes('utils'), `expected 'utils' in files, got: ${JSON.stringify(pkg.files)}`)
    assert.ok(!pkg.files.includes('.git'), `'.git' must never appear in files, got: ${JSON.stringify(pkg.files)}`)
    assert.ok(!pkg.files.includes('package.json'), `'package.json' must not list itself, got: ${JSON.stringify(pkg.files)}`)
    assert.deepEqual(pkg.exports, { './*': './*' })
    assert.deepEqual(pkg.peerDependencies, { vue: '^3.4.0' })

    // No canvas-app scaffold — a kit consumer supplies their own Vite project.
    for (const forbidden of ['vite.config.js', 'index.html', 'src']) {
      assert.ok(!existsSync(path.join(dest, forbidden)), `kit must not ship the canvas-app scaffold file/dir: ${forbidden}`)
    }

    // The actual regression: utils/formatNumber.js must exist on disk, not
    // just be listed in `files` (a store module imports it via a relative
    // path, not through the files allowlist, but both must agree).
    assert.ok(existsSync(path.join(dest, 'utils/formatNumber.js')))
  } finally {
    rmSync(dest, { recursive: true, force: true })
  }
})

test('pack-kit.mjs defaults to ALL discovered stores when --store is omitted', () => {
  const dest = mkdtempSync(path.join(tmpdir(), 'sandbox-pack-kit-allstores-'))
  rmSync(dest, { recursive: true, force: true })
  try {
    const { code } = runNode('tools/sandbox/pack-kit.mjs', [dest])
    assert.equal(code, 0)
    const storeDirs = readdirSync(path.join(dest, 'stores'))
    assert.ok(storeDirs.length > 5, `expected pack-kit.mjs's no-flag default to vendor every store, got only: ${storeDirs.join(', ')}`)
    assert.ok(storeDirs.includes('codm'))
    assert.ok(storeDirs.includes('fcm'))
  } finally {
    rmSync(dest, { recursive: true, force: true })
  }
})

test('pack-kit.mjs tolerates packing into a dir containing only a pre-existing .git (publish-kit.mjs\'s use case)', () => {
  const dest = mkdtempSync(path.join(tmpdir(), 'sandbox-pack-kit-gitclone-'))
  try {
    execFileSync('git', ['init', '--quiet', dest])
    const { code } = runNode('tools/sandbox/pack-kit.mjs', [dest, '--store', 'codm'])
    assert.equal(code, 0)
    const pkg = JSON.parse(readFileSync(path.join(dest, 'package.json'), 'utf8'))
    assert.ok(!pkg.files.includes('.git'))
  } finally {
    rmSync(dest, { recursive: true, force: true })
  }
})

test('pack-kit.mjs refuses a destination with real content beyond .git', () => {
  const dest = mkdtempSync(path.join(tmpdir(), 'sandbox-pack-kit-nonempty-'))
  try {
    const { code, stderr } = runNode('tools/sandbox/pack-kit.mjs', [ROOT])
    assert.equal(code, 1)
    assert.match(stderr, /not empty/)
  } finally {
    rmSync(dest, { recursive: true, force: true })
  }
})
