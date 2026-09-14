/**
 * server/writers/github.mjs — the hosted write/read layer (Part 4c of the
 * plan): same exports as writers/fs.mjs (writeStore, writeAsset,
 * discoverStores, readDefinition), implemented against the GitHub Contents +
 * Git Data REST API instead of the local filesystem, for when the CMS itself
 * runs as a deployed Vercel project with no local git checkout to write to.
 *
 * Selected via CMS_WRITER=github (see writers/index.mjs) and configured
 * entirely from env — GITHUB_TOKEN (a fine-grained PAT, Contents:
 * read/write + Metadata: read on the target repo), GITHUB_REPO ("owner/repo"),
 * GITHUB_BASE_BRANCH (default "main", the branch new store branches fork
 * from). Every write goes to a dedicated `store/<key>` branch — created if it
 * doesn't exist — never the base branch directly, since there's no "current
 * branch" concept here the way there is in writers/git.mjs's local-checkout
 * model (no working tree to already be on a branch).
 *
 * Each field (store.js, catalog.js, theme.css, store.config.json, each asset)
 * is its own Contents API commit rather than one atomic multi-file commit —
 * the Contents API only supports single-file PUTs; a true atomic commit
 * needs the lower-level Git Data API (blobs → tree → commit → ref update),
 * which is meaningfully more code for a benefit (atomicity) this CMS doesn't
 * strictly need, since a mid-write failure just leaves a partial commit
 * sequence on a throwaway `store/<key>` branch to retry, not a broken main.
 */

const API = 'https://api.github.com'

function config () {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO
  const baseBranch = process.env.GITHUB_BASE_BRANCH || 'main'
  return { token, repo, baseBranch }
}

export function isConfigured () {
  const { token, repo } = config()
  return Boolean(token && repo)
}

async function gh (path, opts = {}) {
  const { token } = config()
  if (!token) throw new Error('GITHUB_TOKEN is not set — see .env.example.')
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...opts.headers,
    },
  })
  const body = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    const err = new Error(body?.message ? `GitHub API: ${body.message}` : `GitHub API ${res.status}`)
    err.status = res.status
    throw err
  }
  return body
}

async function ensureBranch (branch) {
  const { repo, baseBranch } = config()
  try {
    await gh(`/repos/${repo}/git/ref/heads/${branch}`)
    return // already exists
  } catch (err) {
    if (err.status !== 404) throw err
  }
  const base = await gh(`/repos/${repo}/git/ref/heads/${baseBranch}`)
  try {
    await gh(`/repos/${repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: base.object.sha }),
    })
  } catch (err) {
    // 409/422 — branch was created concurrently between the check and here; fine.
    if (err.status !== 409 && err.status !== 422) throw err
  }
}

async function getFileSha (path, branch) {
  const { repo } = config()
  try {
    const file = await gh(`/repos/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`)
    return file.sha
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

async function putFile (path, contentBuffer, message, branch) {
  const { repo } = config()
  const sha = await getFileSha(path, branch)
  await gh(`/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message, branch,
      content: Buffer.from(contentBuffer).toString('base64'),
      ...(sha ? { sha } : {}),
    }),
  })
}

async function getFileContent (path, branch) {
  const { repo } = config()
  try {
    const file = await gh(`/repos/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`)
    return Buffer.from(file.content, 'base64').toString('utf8')
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

/**
 * Best-effort store discovery: lists src/stores/ entries on the base branch
 * and treats every directory as a candidate store (unlike writers/fs.mjs,
 * which confirms store.js exists — that would cost one extra API call per
 * entry here; a directory without a real store.js just resolves to
 * readDefinition() returning null downstream, same as an unmanaged store).
 */
export async function discoverStores () {
  const { repo, baseBranch } = config()
  const entries = await gh(`/repos/${repo}/contents/src/stores?ref=${encodeURIComponent(baseBranch)}`)
  return entries.filter(e => e.type === 'dir').map(e => e.name).sort()
}

export async function readDefinition ({ key }) {
  const { baseBranch } = config()
  const raw = await getFileContent(`src/stores/${key}/store.config.json`, baseBranch)
  return raw ? JSON.parse(raw) : null
}

export async function writeStore ({ key, storeModuleSrc, catalogModuleSrc, themeCss, definition, overwrite = false }) {
  const branch = `store/${key}`
  await ensureBranch(branch)

  const storeJsPath = `src/stores/${key}/store.js`
  const existingSha = await getFileSha(storeJsPath, branch)
  if (!overwrite && existingSha) {
    throw new Error(
      `${storeJsPath} already exists on branch "${branch}". Existing stores stay hand-authored ` +
      `unless explicitly opted in — pass overwrite: true only for a store definition whose ` +
      `store.config.json has "managed": true.`
    )
  }

  const files = [storeJsPath]
  await putFile(storeJsPath, storeModuleSrc, `CMS: write ${key}/store.js`, branch)

  const themePath = `src/tokens/ds/themes/${key}.css`
  await putFile(themePath, themeCss, `CMS: write ${key}.css`, branch)
  files.push(themePath)

  if (catalogModuleSrc) {
    const catalogPath = `src/stores/${key}/catalog.js`
    await putFile(catalogPath, catalogModuleSrc, `CMS: write ${key}/catalog.js`, branch)
    files.push(catalogPath)
  }

  const definitionPath = `src/stores/${key}/store.config.json`
  await putFile(definitionPath, JSON.stringify(definition, null, 2) + '\n', `CMS: write ${key}/store.config.json`, branch)
  files.push(definitionPath)

  return { storeDir: `src/stores/${key}`, files, branch }
}

export async function writeAsset ({ key, slot, name, buffer }) {
  const branch = `store/${key}`
  await ensureBranch(branch)
  const subdir = slot === 'fonts' ? 'fonts' : `img/${slot}`
  const path = `src/stores/${key}/${subdir}/${name}`
  await putFile(path, buffer, `CMS: add ${key} asset ${subdir}/${name}`, branch)
  return { path: `./${subdir}/${name}` }
}
