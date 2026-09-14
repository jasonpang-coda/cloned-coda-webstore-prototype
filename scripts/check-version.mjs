#!/usr/bin/env node
/**
 * scripts/check-version.mjs — version-collision preflight.
 *
 * Nothing previously checked a proposed release version against what
 * already exists anywhere — versioning was entirely manual via the
 * git-commit skill. Two branches (feat/ai-dev-tooling and
 * claude/token-usage-dashboard-d3fac8) both independently claimed v0.84.0
 * and both wrote release-notes/v0.84.0.md; the collision was only caught by
 * hand at merge time. Multiple agent worktrees each cutting releases off
 * their own last-seen `main` makes this collision class likely to recur
 * without a check.
 *
 * Checks two independent signals, since either alone can miss a collision
 * that happened on a branch you haven't looked at:
 *   1. release-notes/vX.Y.Z.md already exists in the CURRENT checkout.
 *   2. A "Release vX.Y.Z" commit subject exists ANYWHERE in git history
 *      (`git log --all`) — catches a version claimed on a branch whose
 *      release-notes file was never in your working tree until merge.
 *
 * Usage:
 *   node scripts/check-version.mjs                  # informational: report package.json's
 *                                                    # current version + the highest known
 *                                                    # version, never fails on its own match
 *   node scripts/check-version.mjs --version X.Y.Z   # the real gate: is X.Y.Z free to claim?
 *                                                    # run this with the PROPOSED next
 *                                                    # version, before bumping package.json
 *                                                    # or writing its release note
 */

import { readFileSync, readdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const args = process.argv.slice(2)
const versionArg = args.find((a) => a.startsWith('--version='))?.split('=')[1]
  ?? (args.includes('--version') ? args[args.indexOf('--version') + 1] : null)

const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
// Strip a leading v/V: notesVersions/subjectVersions below are already
// bare (no prefix) — `--version v1.2.0` against a stored '1.2.0' would
// otherwise never string-match, silently reporting a claimed version as
// free.
const version = (versionArg || pkg.version).replace(/^[vV]/, '')

function parseSemver (v) {
  const m = String(v).match(/^(\d+)\.(\d+)\.(\d+)$/)
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}

function cmpSemver (a, b) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i]
  return 0
}

// Signal 1: release-notes/ on disk, in the current checkout only.
const releaseNotesDir = path.join(ROOT, 'release-notes')
let notesFiles = []
try {
  notesFiles = readdirSync(releaseNotesDir).filter((f) => /^v\d+\.\d+\.\d+\.md$/.test(f))
} catch {
  notesFiles = []
}
const notesVersions = notesFiles.map((f) => f.replace(/^v|\.md$/g, ''))
const existsOnDisk = notesVersions.includes(version)

// Signal 2: any "Release vX.Y.Z" commit subject, across every ref this repo
// knows about (local branches, remote-tracking branches) — not just HEAD's
// own history, which is exactly what a purely-local check would miss.
let allSubjects = []
try {
  allSubjects = execSync('git log --all --format=%s', { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter((s) => s.startsWith('Release v'))
} catch {
  allSubjects = []
}
const subjectVersions = allSubjects
  .map((s) => s.match(/^Release v(\d+\.\d+\.\d+)/)?.[1])
  .filter(Boolean)
const existsInHistory = subjectVersions.includes(version)

// Highest version seen across both signals, for reporting.
const allKnownVersions = [...new Set([...notesVersions, ...subjectVersions])]
  .map(parseSemver)
  .filter(Boolean)
  .sort(cmpSemver)
const highest = allKnownVersions[allKnownVersions.length - 1]

console.log(`Checking version: v${version}`)
console.log(`Highest version known (release-notes/ + git log --all): ${highest ? 'v' + highest.join('.') : '(none found)'}`)
// git log --all only sees refs this checkout already knows about — a
// release commit made and pushed on another worktree's branch, but never
// fetched here, is invisible to signal 2. Say so every run rather than
// implying full multi-worktree coverage that a stale checkout doesn't have.
console.log(`Note: signal 2 (git log --all) only covers locally-known refs — run "git fetch --all" first if another worktree may have released more recently than this checkout has seen.`)

// Without --version this is informational only (package.json's CURRENT
// version naturally already has its own release note — that's not a
// collision, it's just today's already-shipped release). The real gate is
// checking a PROPOSED next version before writing anything for it.
if (!versionArg) {
  console.log(`(informational — package.json's current version; pass --version <next> to check a proposed release before writing it)`)
} else if (existsOnDisk || existsInHistory) {
  console.error(`\n[VERSION COLLISION] v${version} is already taken:`)
  if (existsOnDisk) console.error(`  - release-notes/v${version}.md already exists in this checkout.`)
  if (existsInHistory) console.error(`  - A "Release v${version}" commit already exists somewhere in git history (git log --all).`)
  console.error(`Pick a different version — see the highest known version above.`)
  process.exitCode = 1
} else {
  console.log(`v${version} is not yet claimed anywhere this check can see. OK to proceed.`)
}
