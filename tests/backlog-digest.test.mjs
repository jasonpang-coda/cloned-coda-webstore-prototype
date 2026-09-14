import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { runNode, ROOT } from './helpers.mjs'

const BACKLOG_DIR = path.join(ROOT, 'plans/tickets/backlog')
const DONE_DIR = path.join(ROOT, 'plans/tickets/done')

function fixture(dir, name, frontmatter) {
  mkdirSync(dir, { recursive: true })
  const filePath = path.join(dir, `${name}.md`)
  writeFileSync(filePath, `---\n${frontmatter}\n---\n\n# ${name}\n`)
  return filePath
}

test('backlog-digest: a ticket with all dependencies done is READY, ranked by size', () => {
  const a = fixture(BACKLOG_DIR, 'ZZZDigestReadyA', 'epic: test\nsize: L\nstatus: backlog\ncreated: 2026-09-13')
  const b = fixture(BACKLOG_DIR, 'ZZZDigestReadyB', 'epic: test\nsize: XS\nstatus: backlog\ncreated: 2026-09-13')
  try {
    const { stdout } = runNode('tools/backlog-digest.mjs', ['--json'])
    const digest = JSON.parse(stdout)
    const slugs = digest.ready.map((t) => t.slug)
    const idxA = slugs.indexOf('ZZZDigestReadyA')
    const idxB = slugs.indexOf('ZZZDigestReadyB')
    assert.ok(idxA !== -1 && idxB !== -1, 'both fixtures should be ready')
    assert.ok(idxB < idxA, 'XS should rank before L')
  } finally {
    rmSync(a, { force: true })
    rmSync(b, { force: true })
  }
})

test('backlog-digest: an unmet depends_on moves a ticket to blocked, not ready', () => {
  const notDone = fixture(BACKLOG_DIR, 'ZZZDigestDepNotDone', 'epic: test\nsize: S\nstatus: backlog\ncreated: 2026-09-13')
  const blocked = fixture(BACKLOG_DIR, 'ZZZDigestBlocked', 'epic: test\nsize: XS\nstatus: backlog\ncreated: 2026-09-13\ndepends_on: [ZZZDigestDepNotDone]')
  try {
    const { stdout } = runNode('tools/backlog-digest.mjs', ['--json'])
    const digest = JSON.parse(stdout)
    assert.ok(!digest.ready.some((t) => t.slug === 'ZZZDigestBlocked'), 'should not appear in ready')
    const blockedEntry = digest.blocked.find((t) => t.slug === 'ZZZDigestBlocked')
    assert.ok(blockedEntry, 'should appear in blocked')
    assert.deepEqual(blockedEntry.unmetDeps, ['ZZZDigestDepNotDone'])
  } finally {
    rmSync(notDone, { force: true })
    rmSync(blocked, { force: true })
  }
})

test('backlog-digest: a dependency that is already done unblocks the ticket', () => {
  const dep = fixture(DONE_DIR, 'ZZZDigestDepDone', 'epic: test\nsize: S\nstatus: done\ncreated: 2026-09-13')
  const dependent = fixture(BACKLOG_DIR, 'ZZZDigestUnblocked', 'epic: test\nsize: XS\nstatus: backlog\ncreated: 2026-09-13\ndepends_on: [ZZZDigestDepDone]')
  try {
    const { stdout } = runNode('tools/backlog-digest.mjs', ['--json'])
    const digest = JSON.parse(stdout)
    assert.ok(digest.ready.some((t) => t.slug === 'ZZZDigestUnblocked'))
    assert.ok(!digest.blocked.some((t) => t.slug === 'ZZZDigestUnblocked'))
  } finally {
    rmSync(dep, { force: true })
    rmSync(dependent, { force: true })
  }
})

test('backlog-digest: a folder/frontmatter status mismatch is flagged as a consistency issue', () => {
  const mismatched = fixture(DONE_DIR, 'ZZZDigestMismatch', 'epic: test\nsize: XS\nstatus: in-progress\ncreated: 2026-09-13')
  try {
    const { stdout } = runNode('tools/backlog-digest.mjs', ['--json'])
    const digest = JSON.parse(stdout)
    assert.ok(
      digest.consistencyIssues.some((msg) => msg.includes('ZZZDigestMismatch') && msg.includes('in-progress') && msg.includes('done')),
      `expected a consistency issue naming the mismatch, got: ${JSON.stringify(digest.consistencyIssues)}`
    )
  } finally {
    rmSync(mismatched, { force: true })
  }
})
