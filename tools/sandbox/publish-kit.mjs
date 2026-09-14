#!/usr/bin/env node
/**
 * tools/sandbox/publish-kit.mjs — packs @coda/sandbox-kit and stages it as a
 * commit in a SEPARATE git repo, mirroring this repo's own established
 * cross-repo pattern (@coda/comment-kit / @coda/track-kit — real separate
 * GitHub repos installed via `git+https`, not a registry package). This
 * script does NOT create that remote repo (create it once yourself, e.g.
 * `gh repo create coda-sandbox-kit --public`) and does NOT push — it stops
 * after committing locally and prints the exact push command, an explicit
 * confirm gate rather than an automatic push.
 *
 * Usage:
 *   node tools/sandbox/publish-kit.mjs <git-remote-url> [--branch main]
 *                                       [--store <keys>] [--version <x.y.z>]
 *
 * `--version` bumps tools/sandbox/kit-version.json to that value and skips
 * the interactive confirm (use this for scripted/non-interactive runs).
 * Omitted + a TTY: prompts to confirm the next patch version. Omitted +
 * no TTY: errors — pass --version explicitly for non-interactive use.
 *
 * See /Users/yiwei/.claude/plans/majestic-noodling-teapot.md (Milestone 2 §4).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KIT_VERSION_PATH = path.join(__dirname, 'kit-version.json')

const args = process.argv.slice(2)
const remoteUrl = args.find((a) => !a.startsWith('--'))
const branchIdx = args.indexOf('--branch')
const branch = branchIdx !== -1 ? args[branchIdx + 1] : 'main'
const storeIdx = args.indexOf('--store')
const storeArgs = storeIdx !== -1 ? ['--store', args[storeIdx + 1]] : []
const versionIdx = args.indexOf('--version')
const versionArg = versionIdx !== -1 ? args[versionIdx + 1] : null

if (!remoteUrl) {
  console.error('Usage: publish-kit.mjs <git-remote-url> [--branch main] [--store <keys>] [--version <x.y.z>]')
  process.exit(1)
}

function nextPatch(v) {
  const [maj, min, patch] = v.split('.').map(Number)
  return `${maj}.${min}.${patch + 1}`
}

async function resolveVersion() {
  const current = JSON.parse(readFileSync(KIT_VERSION_PATH, 'utf8')).version
  if (versionArg) return versionArg
  if (!process.stdin.isTTY) {
    console.error(`✗ Non-interactive session — pass --version explicitly (current: ${current}).`)
    process.exit(1)
  }
  const suggested = nextPatch(current)
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(`Current kit version is ${current}. Publish as ${suggested}? [Y/n/<other version>] `)
  rl.close()
  const trimmed = answer.trim()
  if (trimmed === '' || trimmed.toLowerCase() === 'y') return suggested
  if (trimmed.toLowerCase() === 'n') { console.log('Aborted.'); process.exit(0) }
  return trimmed
}

const version = await resolveVersion()
writeFileSync(KIT_VERSION_PATH, JSON.stringify({ version }, null, 2) + '\n', 'utf8')
console.log(`\nPublishing @coda/sandbox-kit v${version} → ${remoteUrl} (${branch})\n`)

// ─── 1. Clone the target remote ────────────────────────────────────────────

const workDir = mkdtempSync(path.join(os.tmpdir(), 'sandbox-kit-publish-'))
console.log(`Cloning ${remoteUrl} → ${workDir}`)
try {
  execFileSync('git', ['clone', '--branch', branch, '--single-branch', remoteUrl, workDir], { stdio: 'pipe' })
} catch (cloneErr) {
  // Branch may not exist yet on a brand-new empty repo — retry a plain clone.
  try {
    execFileSync('git', ['clone', remoteUrl, workDir], { stdio: 'pipe' })
    execFileSync('git', ['-C', workDir, 'checkout', '-B', branch], { stdio: 'pipe' })
  } catch (retryErr) {
    console.error(`✗ Could not clone ${remoteUrl}.`)
    console.error('  Create the remote repo first (e.g. `gh repo create <name> --public`), then re-run.')
    console.error(String(retryErr.stderr ?? retryErr.message))
    rmSync(workDir, { recursive: true, force: true })
    process.exit(1)
  }
}

// ─── 2. Wipe tracked content (keep .git), pack fresh content in ───────────

for (const entry of readdirSync(workDir)) {
  if (entry === '.git') continue
  rmSync(path.join(workDir, entry), { recursive: true, force: true })
}

console.log('Packing fresh kit content...')
execFileSync('node', [path.join(__dirname, 'pack-kit.mjs'), workDir, ...storeArgs], { stdio: 'inherit' })

// ─── 3. Commit (never push) ────────────────────────────────────────────────

execFileSync('git', ['-C', workDir, 'add', '-A'], { stdio: 'inherit' })
const status = execFileSync('git', ['-C', workDir, 'status', '--porcelain'], { encoding: 'utf8' })
if (!status.trim()) {
  console.log('\nNothing changed since the last publish — skipping commit.')
  rmSync(workDir, { recursive: true, force: true })
  process.exit(0)
}

console.log('\nChanges to publish:')
console.log(execFileSync('git', ['-C', workDir, 'status', '--short'], { encoding: 'utf8' }))

execFileSync('git', ['-C', workDir, 'commit', '-m', `Publish v${version}`], { stdio: 'inherit' })

console.log(`\n✓ Committed locally at ${workDir}\n`)
console.log('This script does NOT push — review the commit, then run:')
console.log(`  git -C ${workDir} push origin ${branch}\n`)
console.log(`(Or: cd ${workDir} && git push origin ${branch})`)
