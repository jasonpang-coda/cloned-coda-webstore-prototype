/**
 * tools/lib/ledger.mjs — safe read/append for the committed JSON-array
 * ledgers (audits/regressions-log.json, audits/retro-ledger.json).
 *
 * Both compound.mjs and retro.mjs used to do their own read -> push ->
 * writeFileSync with no coordination — the exact scenario their own ledgers
 * are meant to help with (multiple agents/worktrees compounding lessons
 * concurrently) is also the scenario that corrupts them: two processes both
 * read the same N-record array, each appends one record in memory, and
 * whichever writeFileSync lands second overwrites the first's record
 * entirely — a silent lost write, not a JSON parse error, so nothing would
 * even flag it happened. This is the single shared fix for both ledgers
 * rather than a second hand-rolled copy (that duplication is exactly what
 * REG-RETRO02 warns against).
 *
 * Fixed two ways:
 *   1. A mkdir-based lock (mkdir is atomic on POSIX: only one process can
 *      ever succeed in creating a given directory name) serializes the
 *      read-modify-write across processes.
 *   2. Write to a temp file, then rename() over the real path (rename is
 *      atomic on POSIX) — a process killed mid-write never leaves a torn or
 *      truncated ledger for the next reader to trip over.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmdirSync, renameSync } from 'node:fs'
import path from 'node:path'

function sleepSync(ms) {
  // A real blocking sleep (no native addon needed) — Atomics.wait works on
  // the main thread as long as it's given a SharedArrayBuffer-backed array.
  // Preferred over a busy-wait spin loop, which would burn CPU the entire
  // time another process holds the lock.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function acquireLock(lockDir, { retries = 100, delayMs = 20 } = {}) {
  for (let i = 0; i < retries; i++) {
    try {
      mkdirSync(lockDir)
      return
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
      sleepSync(delayMs)
    }
  }
  throw new Error(
    `Could not acquire ledger lock at ${lockDir} after ${retries} attempts (~${retries * delayMs}ms). ` +
    `Another process may be stuck holding it — if so, remove it manually: rm -rf ${lockDir}`
  )
}

function releaseLock(lockDir) {
  try {
    rmdirSync(lockDir)
  } catch {
    // Already gone, or never actually acquired — nothing to clean up.
  }
}

/** Read a ledger's current JSON array. Missing file or unparseable content -> []. */
export function readLedger(ledgerPath) {
  if (!existsSync(ledgerPath)) return []
  try {
    return JSON.parse(readFileSync(ledgerPath, 'utf8'))
  } catch {
    return []
  }
}

/**
 * Append `record` to the ledger at `ledgerPath` under a lock, re-reading the
 * ledger fresh AFTER acquiring the lock (not reusing a caller's earlier
 * read, which could already be stale by the time the lock is granted).
 * Returns the full ledger array after the append.
 */
export function appendToLedger(ledgerPath, record) {
  const lockDir = `${ledgerPath}.lock`
  acquireLock(lockDir)
  try {
    mkdirSync(path.dirname(ledgerPath), { recursive: true })
    const ledger = readLedger(ledgerPath)
    ledger.push(record)
    const tmpPath = `${ledgerPath}.${process.pid}.${Date.now()}.tmp`
    writeFileSync(tmpPath, JSON.stringify(ledger, null, 2), 'utf8')
    renameSync(tmpPath, ledgerPath)
    return ledger
  } finally {
    releaseLock(lockDir)
  }
}

/**
 * Update an existing ledger record in place (by `id`) under the same lock +
 * atomic-rename discipline as appendToLedger — used to merge a recurrence of
 * an already-known lesson into its existing entry instead of appending a
 * near-duplicate row (a ledger that only ever grows by append bloats with
 * "learned this N times" rows instead of staying bounded by the number of
 * DISTINCT lessons actually known).
 *
 * `mutate(record)` receives the existing record and must return the patched
 * record (or mutate it in place and return it) — the caller decides exactly
 * which fields change. Throws if no record with `id` exists.
 */
export function updateLedgerRecord(ledgerPath, id, mutate) {
  const lockDir = `${ledgerPath}.lock`
  acquireLock(lockDir)
  try {
    const ledger = readLedger(ledgerPath)
    const idx = ledger.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error(`No ledger record found with id "${id}"`)
    ledger[idx] = mutate(ledger[idx]) || ledger[idx]
    const tmpPath = `${ledgerPath}.${process.pid}.${Date.now()}.tmp`
    writeFileSync(tmpPath, JSON.stringify(ledger, null, 2), 'utf8')
    renameSync(tmpPath, ledgerPath)
    return ledger[idx]
  } finally {
    releaseLock(lockDir)
  }
}
