#!/usr/bin/env node
/**
 * scripts/backlog-digest-notify.mjs — launchd entry point for the morning
 * backlog digest (see plans/EPICS.md's Harness Automation work and
 * tools/backlog-digest.mjs).
 *
 * Runs the digest, writes the human-readable output to a dated log file
 * outside the repo (so it never shows up in `git status`), and fires a
 * macOS notification with the headline counts. Meant to be invoked by a
 * launchd job, not run interactively — `npm run backlog` directly in a
 * terminal is the interactive equivalent of this script's first half.
 *
 * Log location: ~/Library/Logs/CodaWebstoreBacklog/<YYYY-MM-DD>.log
 * (standard macOS convention for a background job's own logs).
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const LOG_DIR = path.join(os.homedir(), 'Library/Logs/CodaWebstoreBacklog')

function runDigest(extraArgs) {
  // launchd runs this script with no PATH at all, so a bare 'node' fails
  // with ENOENT even though the outer script itself is running under node —
  // process.execPath is that same interpreter's own absolute path, always
  // resolvable regardless of the caller's environment.
  return execFileSync(process.execPath, ['tools/backlog-digest.mjs', ...extraArgs], { cwd: ROOT, encoding: 'utf8' })
}

const humanText = runDigest([])
const digest = JSON.parse(runDigest(['--json']))

mkdirSync(LOG_DIR, { recursive: true })
const dateStamp = new Date().toISOString().slice(0, 10)
const logPath = path.join(LOG_DIR, `${dateStamp}.log`)
writeFileSync(logPath, humanText, 'utf8')

const readyCount = digest.ready.length
const blockedCount = digest.blocked.length
const staleCount = digest.stale.length
const issueCount = digest.consistencyIssues.length

const parts = [`${readyCount} ready`]
if (blockedCount > 0) parts.push(`${blockedCount} blocked`)
if (staleCount > 0) parts.push(`${staleCount} stale`)
if (issueCount > 0) parts.push(`${issueCount} tracking issue${issueCount === 1 ? '' : 's'}`)

const subtitle = parts.join(' · ')
const firstReady = digest.ready[0]
const body = firstReady
  ? `Next up: [${firstReady.size}] ${firstReady.title}`
  : 'Nothing unblocked right now — check the log for blocked/stale items.'

// AppleScript string literals: escape backslashes first, then double quotes.
const escape = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
const script = `display notification "${escape(body)}" with title "Backlog Digest" subtitle "${escape(subtitle)}"`

try {
  // Absolute path for the same reason as process.execPath above — launchd's
  // PATH can't be relied on to find even standard macOS binaries.
  execFileSync('/usr/bin/osascript', ['-e', script], { encoding: 'utf8' })
} catch (err) {
  // Never let a notification failure hide the fact that the digest itself
  // ran fine and is sitting in the log file.
  console.error(`[backlog-digest-notify] Notification failed (digest still written to ${logPath}): ${err.message}`)
}

console.log(`Digest written to ${logPath}`)
