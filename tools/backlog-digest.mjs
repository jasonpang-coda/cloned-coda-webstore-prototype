#!/usr/bin/env node
/**
 * tools/backlog-digest.mjs — Morning Backlog Digest
 *
 * Reads every ticket under plans/tickets/<status>/*.md (frontmatter is the
 * single source of truth — see plans/EPICS.md's "filed by status" rule) and
 * prints/returns three things, cheapest-signal first:
 *
 *   1. Consistency issues — a ticket whose folder disagrees with its own
 *      `status:` frontmatter (a bug in the tracking, per EPICS.md).
 *   2. Ready to pick up — backlog/ready tickets with every `depends_on`
 *      entry already `done`, ranked smallest size first (XS before XL) so
 *      a quick win surfaces before a multi-day one. Anything with an unmet
 *      dependency is listed separately as blocked, with the blocker named.
 *   3. Needs attention — `in-progress` tickets whose file hasn't been
 *      touched (git log, falling back to mtime for untracked files) in
 *      more than --stale-days (default 5) — the ones likely to have gone
 *      quiet without anyone noticing.
 *
 * Usage:
 *   node tools/backlog-digest.mjs [--json] [--stale-days 5]
 *
 * Deliberately does not read plans/INDEX.md's table — that table describes
 * plans/<name>.md-shaped initiatives; a plan tracked as a ticket (the
 * harness-design-quality / ds-remediation / figma-token-sync epics) already
 * carries the same status/size in its own frontmatter, so ticket
 * frontmatter alone is a complete, single source of truth for this digest.
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const TICKETS_DIR = path.join(ROOT, 'plans/tickets')

const SIZE_RANK = { XS: 0, S: 1, M: 2, L: 3, XL: 4 }

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
const isJson = !!flags.json
const staleDays = Number(flags['stale-days'] || 5)

/** Minimal frontmatter parser — this repo's tickets are flat key: value
 * pairs, plus one array field (`depends_on: [a, b]`). Not a full YAML
 * parser on purpose: matching what compound.mjs/retro.mjs already assume
 * elsewhere in this suite rather than adding a new dependency for one field. */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const fm = {}
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_-]+):\s*(.*)$/)
    if (!kv) continue
    const [, key, rawValue] = kv
    const value = rawValue.trim()
    if (value.startsWith('[') && value.endsWith(']')) {
      fm[key] = value.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean)
    } else {
      fm[key] = value
    }
  }
  return fm
}

function lastTouchedDaysAgo(filePath) {
  try {
    const ts = execFileSync('git', ['log', '-1', '--format=%ct', '--', filePath], { cwd: ROOT, encoding: 'utf8' }).trim()
    if (ts) return (Date.now() / 1000 - Number(ts)) / 86400
  } catch {
    // not tracked yet, or git unavailable — fall through to mtime
  }
  try {
    return (Date.now() - statSync(filePath).mtimeMs) / 86400000
  } catch {
    return null
  }
}

function loadTickets() {
  const tickets = []
  if (!existsSync(TICKETS_DIR)) return tickets
  for (const statusDir of readdirSync(TICKETS_DIR, { withFileTypes: true })) {
    if (!statusDir.isDirectory()) continue
    const folder = statusDir.name
    const dirPath = path.join(TICKETS_DIR, folder)
    for (const file of readdirSync(dirPath)) {
      if (!file.endsWith('.md')) continue
      const filePath = path.join(dirPath, file)
      const content = readFileSync(filePath, 'utf8')
      const fm = parseFrontmatter(content)
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const goalMatch = content.match(/^##\s+Goal\s*\n\n([\s\S]*?)(?=\n##|\n$)/m)
      tickets.push({
        slug: file.replace(/\.md$/, ''),
        path: path.relative(ROOT, filePath),
        folder,
        title: titleMatch ? titleMatch[1].trim() : file,
        goal: goalMatch ? goalMatch[1].trim().split('\n')[0] : null,
        epic: fm.epic || null,
        size: fm.size || null,
        status: fm.status || null,
        dependsOn: fm.depends_on || [],
      })
    }
  }
  return tickets
}

function buildDigest() {
  const tickets = loadTickets()
  const bySlug = new Map(tickets.map((t) => [t.slug, t]))

  const consistencyIssues = tickets
    .filter((t) => t.status && t.status !== t.folder)
    .map((t) => `${t.path}: frontmatter says status "${t.status}" but it's filed under "${t.folder}/"`)

  const readyCandidates = tickets.filter((t) => t.status === 'backlog' || t.status === 'ready')
  const ready = []
  const blocked = []
  for (const t of readyCandidates) {
    const unmetDeps = t.dependsOn.filter((dep) => bySlug.get(dep)?.status !== 'done')
    if (unmetDeps.length > 0) {
      blocked.push({ ...t, unmetDeps })
    } else {
      ready.push(t)
    }
  }
  ready.sort((a, b) => (SIZE_RANK[a.size] ?? 99) - (SIZE_RANK[b.size] ?? 99))

  const inProgress = tickets.filter((t) => t.status === 'in-progress')
  const stale = inProgress
    .map((t) => ({ ...t, daysSinceTouch: lastTouchedDaysAgo(path.join(ROOT, t.path)) }))
    .filter((t) => t.daysSinceTouch != null && t.daysSinceTouch > staleDays)
    .sort((a, b) => b.daysSinceTouch - a.daysSinceTouch)

  return {
    generatedAt: new Date().toISOString(),
    counts: {
      total: tickets.length,
      byStatus: Object.fromEntries(
        [...new Set(tickets.map((t) => t.status))].map((s) => [s, tickets.filter((t) => t.status === s).length])
      ),
    },
    consistencyIssues,
    ready,
    blocked,
    stale,
  }
}

function printHuman(digest) {
  console.log(`=== Backlog Digest — ${new Date(digest.generatedAt).toLocaleDateString()} ===\n`)

  if (digest.consistencyIssues.length > 0) {
    console.log(`⚠️  Consistency issues (${digest.consistencyIssues.length}):`)
    for (const issue of digest.consistencyIssues) console.log(`  - ${issue}`)
    console.log()
  }

  if (digest.stale.length > 0) {
    console.log(`🔴 Needs attention — in-progress, quiet for >${staleDays}d (${digest.stale.length}):`)
    for (const t of digest.stale) {
      console.log(`  - [${t.epic || 'no epic'}] ${t.title} (${Math.round(t.daysSinceTouch)}d quiet) — ${t.path}`)
    }
    console.log()
  }

  console.log(`🟢 Ready to pick up, smallest first (${digest.ready.length}):`)
  if (digest.ready.length === 0) console.log('  (nothing unblocked right now)')
  for (const t of digest.ready) {
    console.log(`  - [${t.size || '?'}] [${t.epic || 'no epic'}] ${t.title}${t.goal ? ` — ${t.goal}` : ''}`)
    console.log(`      ${t.path}`)
  }
  console.log()

  if (digest.blocked.length > 0) {
    console.log(`⛔ Blocked (${digest.blocked.length}):`)
    for (const t of digest.blocked) {
      console.log(`  - [${t.size || '?'}] ${t.title} — waiting on: ${t.unmetDeps.join(', ')}`)
    }
    console.log()
  }

  console.log(`Ticket counts by status: ${Object.entries(digest.counts.byStatus).map(([s, n]) => `${s}=${n}`).join(', ')}`)
}

const digest = buildDigest()
if (isJson) {
  console.log(JSON.stringify(digest, null, 2))
} else {
  printHuman(digest)
}
