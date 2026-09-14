import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { updateLedgerRecord } from '../tools/lib/ledger.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const LEDGER_LIB = path.join(ROOT, 'tools/lib/ledger.mjs')

test('appendToLedger survives N concurrent writers without losing an entry', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ledger-test-'))
  const ledgerPath = path.join(dir, 'test-ledger.json')
  const N = 10

  const child = (i) => new Promise((resolve, reject) => {
    // A real OS process per writer — the failure mode this locks (a lost
    // write from a naive read-modify-write) only shows up under actual
    // process-level concurrency, not same-process async interleaving.
    try {
      execFileSync('node', ['-e', `
        import('${pathToFileUrl(LEDGER_LIB)}').then(({ appendToLedger }) => {
          appendToLedger('${ledgerPath.replace(/\\/g, '\\\\')}', { id: 'TEST-${i}' })
        })
      `], { encoding: 'utf8' })
      resolve()
    } catch (err) {
      reject(err)
    }
  })

  function pathToFileUrl (p) {
    return 'file://' + p.split(path.sep).map(encodeURIComponent).join('/')
  }

  try {
    await Promise.all(Array.from({ length: N }, (_, i) => child(i)))
    const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'))
    assert.equal(ledger.length, N, `expected all ${N} concurrent appends to survive, got ${ledger.length}`)
    const ids = new Set(ledger.map((r) => r.id))
    assert.equal(ids.size, N, 'expected no duplicate/overwritten ids')

    // No lock directory should survive a clean run.
    assert.equal(existsSync(`${ledgerPath}.lock`), false, 'lock directory should be released after every append')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('updateLedgerRecord merges a patch into the matching record only', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ledger-test-'))
  const ledgerPath = path.join(dir, 'test-ledger.json')
  try {
    writeFileSync(ledgerPath, JSON.stringify([
      { id: 'A', lesson: 'first', instances: 1 },
      { id: 'B', lesson: 'second', instances: 1 },
    ]))
    const updated = updateLedgerRecord(ledgerPath, 'B', (r) => ({ ...r, lesson: 'second, revised', instances: r.instances + 1 }))
    assert.equal(updated.lesson, 'second, revised')
    assert.equal(updated.instances, 2)

    const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'))
    assert.equal(ledger.length, 2, 'update must not add or remove rows')
    assert.deepEqual(ledger.find((r) => r.id === 'A'), { id: 'A', lesson: 'first', instances: 1 }, 'the non-matching record must be untouched')
    assert.equal(ledger.find((r) => r.id === 'B').lesson, 'second, revised')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('updateLedgerRecord throws for an unknown id instead of silently no-op-ing', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ledger-test-'))
  const ledgerPath = path.join(dir, 'test-ledger.json')
  try {
    writeFileSync(ledgerPath, JSON.stringify([{ id: 'A', lesson: 'first' }]))
    assert.throws(() => updateLedgerRecord(ledgerPath, 'NOPE', (r) => r), /No ledger record found with id "NOPE"/)
    // And the file must be left exactly as it was — no lock left behind, no rewrite.
    const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'))
    assert.equal(ledger.length, 1)
    assert.equal(existsSync(`${ledgerPath}.lock`), false)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('updateLedgerRecord survives N concurrent writers updating DIFFERENT records without losing an update', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ledger-test-'))
  const ledgerPath = path.join(dir, 'test-ledger.json')
  const N = 10
  writeFileSync(ledgerPath, JSON.stringify(
    Array.from({ length: N }, (_, i) => ({ id: `REC-${i}`, hits: 0 })),
  ))

  function pathToFileUrl (p) {
    return 'file://' + p.split(path.sep).map(encodeURIComponent).join('/')
  }

  const child = (i) => new Promise((resolve, reject) => {
    // A real OS process per writer, same reasoning as the append test above
    // — the lost-write failure mode only shows up under actual process-level
    // concurrency.
    try {
      execFileSync('node', ['-e', `
        import('${pathToFileUrl(LEDGER_LIB)}').then(({ updateLedgerRecord }) => {
          updateLedgerRecord('${ledgerPath.replace(/\\/g, '\\\\')}', 'REC-${i}', (r) => ({ ...r, hits: r.hits + 1 }))
        })
      `], { encoding: 'utf8' })
      resolve()
    } catch (err) {
      reject(err)
    }
  })

  try {
    await Promise.all(Array.from({ length: N }, (_, i) => child(i)))
    const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'))
    assert.equal(ledger.length, N, 'no records should be added or dropped')
    for (const r of ledger) assert.equal(r.hits, 1, `${r.id} should have been updated exactly once, got hits=${r.hits}`)
    assert.equal(existsSync(`${ledgerPath}.lock`), false, 'lock directory should be released after every update')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
