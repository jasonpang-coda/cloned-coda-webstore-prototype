/**
 * server/writers/git.mjs — the publish half of the store CMS (Part 4b of the
 * plan). Wraps plain `git` via child_process — no new dependency.
 *
 * Deliberately does NOT auto-create/switch to a `store/<key>` branch by
 * default: switching the repo's checked-out branch out from under whatever
 * else the user has open is disruptive, and if there are unrelated dirty
 * files in the tree it's easy to drag them along by accident. The default
 * commit path stages ONLY the files this store's generators wrote (via `git
 * add -- <paths>` and `git commit -- <paths>`, never `-a`) on whatever branch
 * is currently checked out — matching how this session's own commits were
 * made. Creating/switching to a dedicated `store/<key>` branch first is an
 * explicit opt-in (`newBranch: true`), never the default.
 *
 * Push is a SEPARATE step from commit — the caller (the dashboard's Publish
 * panel) always requires an explicit second click, since pushing is a
 * shared/hard-to-reverse action.
 */

import { execFile } from 'child_process'
import { promisify } from 'util'
import { resolve } from 'path'

const execFileAsync = promisify(execFile)

async function git (repoRoot, args) {
  try {
    const { stdout } = await execFileAsync('git', args, { cwd: repoRoot })
    return stdout
  } catch (err) {
    throw new Error(`git ${args.join(' ')} failed: ${err.stderr || err.message}`)
  }
}

/** The set of paths a store's generators can write — used to scope git ops so a
 * store's commit never picks up unrelated changes elsewhere in the tree. */
export function storeFilePatterns (key) {
  return [`src/stores/${key}`, `src/tokens/ds/themes/${key}.css`]
}

export async function currentBranch (repoRoot) {
  return (await git(repoRoot, ['rev-parse', '--abbrev-ref', 'HEAD'])).trim()
}

/**
 * "owner/repo" from `origin`'s remote URL — used by vercel.mjs's
 * createProject() to link the new Vercel project to this repo. Handles both
 * URL forms (`https://github.com/owner/repo.git` and
 * `git@github.com:owner/repo.git`). Returns null if origin isn't a GitHub
 * remote or doesn't exist (e.g. running with no local git access at all) —
 * callers should fall back to an explicit VERCEL_GIT_REPO env var.
 */
export async function getRemoteRepoSlug (repoRoot) {
  let url
  try {
    url = (await git(repoRoot, ['remote', 'get-url', 'origin'])).trim()
  } catch {
    return null
  }
  const m = /github\.com[:/]([^/]+\/[^/]+?)(\.git)?$/.exec(url)
  return m ? m[1] : null
}

/** git status --porcelain, filtered to just this store's files. */
export async function gitStatusForStore (repoRoot, key) {
  const patterns = storeFilePatterns(key)
  const out = await git(repoRoot, ['status', '--porcelain', '--', ...patterns])
  return out.split('\n').filter(Boolean).map(line => ({
    status: line.slice(0, 2).trim(),
    path: line.slice(3).replace(/^"|"$/g, ''),
  }))
}

/**
 * Stage + commit exactly this store's files.
 * @param {object} opts
 * @param {boolean} [opts.newBranch] - create/switch to `store/<key>` first.
 *   Off by default — see file header for why.
 * @returns {{ branch: string, committed: boolean, files: string[] }}
 */
export async function commitStore (repoRoot, key, message, { newBranch = false } = {}) {
  const patterns = storeFilePatterns(key)
  const status = await gitStatusForStore(repoRoot, key)
  if (!status.length) return { branch: await currentBranch(repoRoot), committed: false, files: [] }

  if (newBranch) {
    const branchName = `store/${key}`
    const branches = await git(repoRoot, ['branch', '--list', branchName])
    if (branches.trim()) await git(repoRoot, ['switch', branchName])
    else await git(repoRoot, ['switch', '-c', branchName])
  }

  await git(repoRoot, ['add', '--', ...patterns])
  await git(repoRoot, ['commit', '-m', message, '--', ...patterns])

  return { branch: await currentBranch(repoRoot), committed: true, files: status.map(s => s.path) }
}

/** Push the currently checked-out branch. A separate, explicit step from commit. */
export async function pushCurrentBranch (repoRoot) {
  const branch = await currentBranch(repoRoot)
  await git(repoRoot, ['push', '-u', 'origin', branch])
  return { branch }
}
