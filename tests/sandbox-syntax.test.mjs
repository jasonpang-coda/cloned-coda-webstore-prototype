import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SANDBOX_DIR = path.join(ROOT, 'tools/sandbox')

function walkJs(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walkJs(full, out)
    else if (/\.m?js$/.test(entry)) out.push(full)
  }
  return out
}

test('every tools/sandbox/*.mjs and *.js file is syntactically valid (node --check)', () => {
  // Regression lock: a literal `*/` inside a multi-line `/** ... */` doc
  // comment (e.g. a path like `docs/Handoff/components/*/spec.md` used as
  // prose) closes the comment early and crashes the file at import/run time
  // with a SyntaxError — this exact bug shipped 3 separate times across
  // Milestone 1 and Milestone 2 of the PM Ideation Sandbox, each caught only
  // by a runtime crash during manual QA, never proactively. `node --check`
  // parses without executing and catches the whole bug class directly — no
  // custom regex needed, since this IS a syntax error, not a style issue.
  const files = walkJs(SANDBOX_DIR)
  assert.ok(files.length > 5, `expected to find several .mjs/.js files under tools/sandbox/, found ${files.length}`)

  const failures = []
  for (const file of files) {
    try {
      execFileSync('node', ['--check', file], { stdio: 'pipe' })
    } catch (err) {
      failures.push({ file: path.relative(ROOT, file), stderr: String(err.stderr ?? err.message) })
    }
  }

  assert.deepEqual(failures, [], `syntax errors found:\n${failures.map((f) => `  ${f.file}\n${f.stderr}`).join('\n')}`)
})
