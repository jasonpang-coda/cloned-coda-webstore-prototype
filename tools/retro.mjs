#!/usr/bin/env node
/**
 * tools/retro.mjs — Sprint Retro Ledger Utility (Level 5)
 *
 * The session-level twin of tools/compound.mjs. Where compound.mjs promotes
 * component-specific lessons into the harness, this promotes session-level
 * lessons — build quality and token usage — into a durable, cross-worktree
 * ledger. It is a dumb writer: Claude does the judgment (querying claude-mem
 * for the session summary/observations, reading the git diff since the last
 * release, drafting good/bad/improve, and grading), this script only
 * persists and lists what Claude decided. It has no LLM and no MCP access.
 *
 * Usage:
 *   node tools/retro.mjs --raw <file>                          # save a raw per-session dump (gitignored)
 *   node tools/retro.mjs --lesson "<Lesson>" --category <cat>  [--component <Name>] [--token-note "<...>"] [--actionable "<...>"] [--session <id>] [--dry-run]
 *   node tools/retro.mjs --update <ID> [--lesson ...] [...]     # merge a RECURRENCE into an existing entry instead of appending a duplicate
 *   node tools/retro.mjs --list                                 # print the whole ledger, newest first
 *   node tools/retro.mjs --check <category>                     # print lessons recorded for one category
 *   node tools/retro.mjs --since <ref>                          # resolve a git ref to diff the session against
 *
 * Valid --category values: token, quality, process
 *
 * Dedup, not just recency: this ledger is meant to be read before new work
 * (see the sprint-retro skill's step 0), so it must stay cheap to read as it
 * grows across many sessions. Truncating by recency would be wrong — an old
 * lesson is exactly as valid as a new one, and dropping it re-exposes the
 * exact mistake it exists to prevent. The actual bloat driver is appending a
 * near-duplicate row every time the SAME distinct lesson recurs, instead of
 * strengthening the one entry that already covers it — so `--lesson` warns
 * (via a mechanical word-overlap check, category+component scoped) when a
 * similar entry already exists, and `--update <ID>` merges a recurrence into
 * it (bumping its "seen Nx" count) rather than appending a new row. This
 * bounds the ledger by the number of DISTINCT lessons known, not by how many
 * times each was independently learned. Reading should also default to
 * `--check <category>` (optionally `--component`), not a blind `--list` —
 * scope by relevance to the task at hand, not by dumping everything.
 *
 * The ledger (audits/retro-ledger.json) is COMMITTED (see .gitignore's
 * exception for this one file, alongside audits/regressions-log.json)
 * specifically so it survives across worktrees and clones — the same reason
 * compound.mjs's ledger is committed. A raw per-session dump written via
 * --raw goes to session-logs/ instead, which stays gitignored: it is too
 * verbose and too machine-local to be worth compounding verbatim, only the
 * distilled --lesson entries are.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readLedger as readLedgerSafe, appendToLedger, updateLedgerRecord } from './lib/ledger.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const AUDITS_DIR = path.join(ROOT, 'audits')
const LEDGER_PATH = path.join(AUDITS_DIR, 'retro-ledger.json')
const SESSION_LOGS_DIR = path.join(ROOT, 'session-logs')

const VALID_CATEGORIES = ['token', 'quality', 'process']

// CLI Argument Parsing
const args = process.argv.slice(2)
const flags = {}
for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  if (arg.startsWith('--')) {
    const key = arg.slice(2)
    if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
      flags[key] = args[i + 1]
      i++
    } else {
      flags[key] = true
    }
  }
}

function readLedger () {
  return readLedgerSafe(LEDGER_PATH)
}

// A short stopword list + a min-length filter is enough for this — this
// isn't trying to be a real NLP similarity metric, just enough signal to
// flag "you're about to write a near-duplicate of an existing lesson"
// before the ledger grows one row per RECURRENCE of a mistake instead of
// one row per DISTINCT mistake.
const STOPWORDS = new Set([
  'that', 'this', 'with', 'from', 'when', 'then', 'than', 'have', 'been',
  'were', 'into', 'onto', 'over', 'under', 'about', 'before', 'after',
  'while', 'each', 'every', 'some', 'never', 'always', 'instead', 'rather',
  'only', 'just', 'also', 'even', 'more', 'most', 'here', 'there', 'their',
  'them', 'they', 'what', 'which', 'does', 'doesn', 'don', 'the', 'and',
  'for', 'not', 'but', 'was', 'are', 'its',
])

function significantWords (text) {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 4 && !STOPWORDS.has(w)),
  )
}

function jaccard (a, b) {
  if (!a.size || !b.size) return 0
  let intersection = 0
  for (const w of a) if (b.has(w)) intersection++
  const union = a.size + b.size - intersection
  return union === 0 ? 0 : intersection / union
}

const SIMILARITY_THRESHOLD = 0.28

/**
 * Find existing ledger entries (same category, and same component when one
 * is given) whose lesson text substantially overlaps the new one — a signal
 * this may be the SAME distinct lesson recurring rather than a new one, and
 * should be merged via --update <ID> instead of appended as a fresh row.
 */
function findSimilar (ledger, { category, component, lesson }) {
  const newWords = significantWords(lesson)
  return ledger
    .filter((r) => r.category === category && (!component || r.component === component))
    .map((r) => ({ record: r, score: jaccard(newWords, significantWords(r.lesson)) }))
    .filter(({ score }) => score >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.score - a.score)
}

function printRecord (r) {
  const seen = r.instances && r.instances > 1 ? `, seen ${r.instances}×` : ''
  console.log(`[${r.id}] ${r.timestamp} — ${r.category}${r.component ? ` (${r.component})` : ''}${seen}`)
  console.log(`  Lesson: ${r.lesson}`)
  if (r.tokenNote) console.log(`  Token note: ${r.tokenNote}`)
  if (r.actionable) console.log(`  Actionable: ${r.actionable}`)
  if (r.session) console.log(`  Session: ${r.session}`)
  console.log('')
}

if (flags.list) {
  const ledger = readLedger()
  if (!ledger.length) {
    console.log('Ledger is empty (audits/retro-ledger.json).')
    process.exit(0)
  }
  console.log(`=== Sprint Retro Ledger (${ledger.length} entr${ledger.length === 1 ? 'y' : 'ies'}, newest first) ===\n`)
  for (const r of [...ledger].reverse()) printRecord(r)
  process.exit(0)
}

if (flags.check) {
  const target = typeof flags.check === 'string' ? flags.check : null
  if (!target) {
    console.error(`Error: --check requires a category. Valid categories: ${VALID_CATEGORIES.join(', ')}`)
    process.exit(1)
  }
  if (!VALID_CATEGORIES.includes(target)) {
    console.error(`Error: unknown category "${target}". Valid categories: ${VALID_CATEGORIES.join(', ')}`)
    process.exit(1)
  }
  const ledger = readLedger().filter((r) => r.category === target)
  if (!ledger.length) {
    console.log(`No recorded lessons for category "${target}".`)
    process.exit(0)
  }
  console.log(`=== Recorded lessons for "${target}" (${ledger.length}) ===\n`)
  for (const r of [...ledger].reverse()) printRecord(r)
  process.exit(0)
}

if (flags.since) {
  const ref = typeof flags.since === 'string' ? flags.since : 'HEAD'
  try {
    const resolved = execFileSync('git', ['rev-parse', ref], { cwd: ROOT, encoding: 'utf8' }).trim()
    console.log(resolved)
    process.exit(0)
  } catch {
    console.error(`Error: "${ref}" does not resolve to a git ref in this repo.`)
    process.exit(1)
  }
}

if (flags.raw) {
  const target = typeof flags.raw === 'string' ? flags.raw : null
  if (!target) {
    console.error('Error: --raw requires a source file path to copy from stdin/body. Example: node tools/retro.mjs --raw ./draft.md')
    process.exit(1)
  }
  if (!existsSync(target)) {
    console.error(`Error: source file not found at ${target}`)
    process.exit(1)
  }
  const body = readFileSync(target, 'utf8')
  mkdirSync(SESSION_LOGS_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outPath = path.join(SESSION_LOGS_DIR, `${stamp}.md`)
  writeFileSync(outPath, body, 'utf8')
  console.log(`✓ Raw session log saved: session-logs/${path.basename(outPath)} (gitignored — not versioned)`)
  process.exit(0)
}

if (flags.update) {
  const id = typeof flags.update === 'string' ? flags.update : null
  if (!id) {
    console.error('Error: --update requires a ledger record ID (e.g. RETRO-ABC123) — find it via --list or --check <category>.')
    process.exit(1)
  }
  const patchCategory = flags.category || flags.c || null
  if (patchCategory && !VALID_CATEGORIES.includes(patchCategory)) {
    console.error(`Error: unknown category "${patchCategory}". Valid categories: ${VALID_CATEGORIES.join(', ')}`)
    process.exit(1)
  }
  const patchLesson = flags.lesson || flags.l || null
  const patchComponent = flags.component ?? null
  const patchTokenNote = flags['token-note'] ?? null
  const patchActionable = flags.actionable ?? null
  const patchSession = flags.session ?? null
  const isDryRunUpdate = !!flags['dry-run']

  const existing = readLedger().find((r) => r.id === id)
  if (!existing) {
    console.error(`Error: no ledger record found with id "${id}". Run --list or --check <category> to find the right ID.`)
    process.exit(1)
  }

  console.log('=== Merging recurrence into existing Sprint Retro lesson ===\n')
  const priorCount = existing.instances || 1
  console.log(`Existing [${existing.id}] (seen ${priorCount}× so far):`)
  console.log(`  ${existing.lesson}\n`)

  const patch = (record) => ({
    ...record,
    lesson: patchLesson || record.lesson,
    category: patchCategory || record.category,
    component: patchComponent !== null ? patchComponent : record.component,
    tokenNote: patchTokenNote !== null ? patchTokenNote : record.tokenNote,
    actionable: patchActionable !== null ? patchActionable : record.actionable,
    session: patchSession !== null ? patchSession : record.session,
    instances: priorCount + 1,
    timestamp: new Date().toISOString(),
  })

  if (isDryRunUpdate) {
    console.log('[Dry Run] Merged record (not written):')
    console.log(JSON.stringify(patch(existing), null, 2))
    process.exit(0)
  }

  const updated = updateLedgerRecord(LEDGER_PATH, id, patch)
  console.log(`✓ Merged into existing entry: audits/retro-ledger.json (${updated.id}, now seen ${updated.instances}×)`)
  console.log(`  Lesson: ${updated.lesson}`)
  process.exit(0)
}

const lesson = flags.lesson || flags.l
const category = flags.category || flags.c
const component = flags.component || null
const tokenNote = flags['token-note'] || null
const actionable = flags.actionable || null
const session = flags.session || null
const isDryRun = !!flags['dry-run']

if (!lesson || !category) {
  console.log(`
Usage:
  node tools/retro.mjs --raw <file>
  node tools/retro.mjs --lesson "<Lesson>" --category <token|quality|process> [--component <Name>] [--token-note "<...>"] [--actionable "<...>"] [--session <id>] [--dry-run]
  node tools/retro.mjs --update <ID> [--lesson "<...>"] [--category <cat>] [--component <Name>] [--token-note "<...>"] [--actionable "<...>"] [--session <id>] [--dry-run]
  node tools/retro.mjs --list
  node tools/retro.mjs --check <category>
  node tools/retro.mjs --since <ref>

Options:
  --lesson, -l      The distilled, durable lesson to record
  --category, -c    One of: ${VALID_CATEGORIES.join(', ')}
  --component       Optional component name this lesson relates to (also compound.mjs it there)
  --token-note      Optional note on token-usage impact (e.g. "re-read a 2000-line file 3x needlessly")
  --actionable      Optional concrete follow-up step this lesson implies (e.g. "add X guard to tools/foo.mjs") — distinct from the lesson itself: the lesson is what to remember, the actionable is what to DO about it
  --session         Optional claude-mem memory_session_id this lesson came from
  --dry-run         Show the record without writing to disk
  --update <ID>     Merge a RECURRENCE of an existing lesson into that entry (bumps its "seen Nx" count, refreshes its timestamp) instead of appending a near-duplicate row — use this when --lesson would otherwise warn that a similar entry already exists
  --list            Print the whole ledger, newest first
  --check <cat>     Print recorded lessons for one category
  --raw <file>      Save a raw per-session dump to session-logs/ (gitignored)
  --since <ref>     Resolve a git ref (e.g. a release tag) to diff the session against

Before recording a brand-new --lesson, prefer --check <category> (and
--component, if this is component-specific) over --list — reading only the
lessons relevant to the current task, not the entire ledger, is what keeps
retros cheap as the ledger grows. --lesson itself will also warn if a
similar entry already exists in that category, so it can be merged via
--update instead of appended as a new row.
`.trim())
  process.exit(1)
}

if (!VALID_CATEGORIES.includes(category)) {
  console.error(`Error: unknown category "${category}". Valid categories: ${VALID_CATEGORIES.join(', ')}`)
  process.exit(1)
}

console.log('=== Compounding Sprint Retro Lesson ===\n')
console.log(`Category: ${category}`)
console.log(`Lesson: "${lesson}"`)
if (component) console.log(`Component: ${component}`)
if (tokenNote) console.log(`Token note: "${tokenNote}"`)
if (actionable) console.log(`Actionable: "${actionable}"`)

// Advisory only — this is a mechanical word-overlap heuristic, not a
// judgment call, so it warns loudly but never blocks the write. Whether
// this genuinely is the same distinct lesson recurring (→ re-run with
// --update <ID> instead) or a real new one that happens to share vocabulary
// is a call only the caller (Claude, per this ledger's whole design) can
// make.
const similar = findSimilar(readLedger(), { category, component, lesson })
if (similar.length) {
  console.log(`\n⚠ ${similar.length} existing ${category} lesson${similar.length === 1 ? '' : 's'} look similar to this one:`)
  for (const { record, score } of similar) {
    console.log(`  [${record.id}] (${Math.round(score * 100)}% word overlap, seen ${record.instances || 1}×): ${record.lesson}`)
  }
  console.log(`  If this is the SAME lesson recurring, re-run with --update <ID> instead of appending a new entry.`)
}

// Under a cross-process lock (tools/lib/ledger.mjs) — two concurrent
// sessions/worktrees recording a retro lesson at once must not clobber one
// another's entry, same reasoning as compound.mjs's ledger.
const record = {
  id: `RETRO-${Date.now().toString(36).toUpperCase()}`,
  timestamp: new Date().toISOString(),
  category,
  lesson,
  component: component || null,
  tokenNote: tokenNote || null,
  actionable: actionable || null,
  session: session || null,
  instances: 1,
}

if (isDryRun) {
  console.log('\n[Dry Run] Ledger entry to append to audits/retro-ledger.json:')
  console.log(JSON.stringify(record, null, 2))
} else {
  appendToLedger(LEDGER_PATH, record)
  console.log(`\n✓ Recorded in retro ledger: audits/retro-ledger.json (${record.id})`)
  if (component) {
    console.log(`  Tip: if this is a component-specific regression, also run:`)
    console.log(`  node tools/compound.mjs --component ${component} --rule "${lesson}"`)
  }
}

console.log('\n[Knowledge Compounded] This lesson is now part of the permanent sprint-retro ledger.')
