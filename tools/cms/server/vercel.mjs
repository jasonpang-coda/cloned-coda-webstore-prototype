/**
 * server/vercel.mjs — deployment status (Part 4b) + project creation (Part
 * 4a) for the Publish panel.
 *
 * Every endpoint here was verified against Vercel's REST API reference
 * before writing this — the plan doc's own sketches turned out wrong twice:
 * deployment listing is `GET /v7/deployments` (not `/v9/projects/:id/deployments`
 * as first sketched), and project creation is `POST /v11/projects` (not
 * `/v10/projects` as first sketched). Env-var creation is confirmed correct
 * at `POST /v10/projects/:idOrName/env`.
 *
 * Reads VERCEL_TOKEN from process.env (server-side only — never a VITE_-
 * prefixed var, which would get inlined into the client bundle). Set it in
 * .env.local (see .env.example) and run the CMS with
 * `node --env-file-if-exists=.env.local scripts/cms.mjs` (wired into
 * `npm run cms`). No token → every route here reports "not configured"
 * instead of failing, so the rest of the dashboard works without it.
 */

import { getRemoteRepoSlug } from './writers/git.mjs'

const API = 'https://api.vercel.com'

// Matches the project-naming convention in docs/deploying-individual-stores.md
// (`sku-card-<store>`).
export function projectNameFor (key) {
  return `sku-card-${key}`
}

export function isConfigured () {
  return Boolean(process.env.VERCEL_TOKEN)
}

async function vercelFetch (path, { method = 'GET', body } = {}) {
  const token = process.env.VERCEL_TOKEN
  const teamQuery = process.env.VERCEL_TEAM_ID ? `&teamId=${encodeURIComponent(process.env.VERCEL_TEAM_ID)}` : ''
  const res = await fetch(`${API}${path}${path.includes('?') ? teamQuery : teamQuery.replace('&', '?')}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const responseBody = await res.json().catch(() => null)
  if (!res.ok) throw new Error(responseBody?.error?.message ?? `Vercel API ${res.status}`)
  return responseBody
}

/**
 * @param {string} key - store key
 * @param {number} [limit]
 * @returns {{configured:boolean, project:string, deployments?:Array<{uid,url,readyState,target,created}>, error?:string}}
 */
export async function getDeployments (key, limit = 5) {
  if (!isConfigured()) return { configured: false, project: projectNameFor(key) }
  const project = projectNameFor(key)
  try {
    const body = await vercelFetch(`/v7/deployments?projectId=${encodeURIComponent(project)}&limit=${limit}`)
    return {
      configured: true,
      project,
      deployments: (body.deployments ?? []).map(d => ({
        uid: d.uid, url: d.url, readyState: d.readyState, target: d.target, created: d.created,
      })),
    }
  } catch (err) {
    return { configured: true, project, error: err.message }
  }
}

/**
 * Creates a Vercel project for a store, wired to build a store-locked bundle
 * from this repo (Root Directory `./`, Build Command `npx vite build --mode
 * <key>` — works for any discovered store with no package.json edit, per the
 * Part 2 auto-discovery refactor) — see docs/deploying-individual-stores.md
 * for the manual-dashboard equivalent this automates.
 *
 * Real infrastructure: creates an actual Vercel project in whichever
 * account/team VERCEL_TOKEN belongs to. The dashboard requires its own
 * confirmation step before calling this (see PublishPanel.vue) — never call
 * it as a side effect of anything else.
 *
 * @param {string} repoRoot - used only to read the git remote for gitRepository.repo
 */
export async function createProject (repoRoot, key) {
  if (!isConfigured()) throw new Error('VERCEL_TOKEN is not set — see .env.example.')
  const repoSlug = process.env.VERCEL_GIT_REPO || await getRemoteRepoSlug(repoRoot)
  const name = projectNameFor(key)
  const project = await vercelFetch('/v11/projects', {
    method: 'POST',
    body: {
      name,
      framework: 'vite',
      buildCommand: `npx vite build --mode ${key}`,
      outputDirectory: 'dist',
      rootDirectory: null,
      ...(repoSlug ? { gitRepository: { type: 'github', repo: repoSlug } } : {}),
    },
  })
  return { id: project.id, name: project.name }
}

/**
 * Sets encrypted env vars on a project (production+preview+development) so a
 * newly-created store project has working comment-mode Supabase creds
 * without a manual dashboard step. `entries` is [[key, value], …].
 */
export async function setEnvVars (projectIdOrName, entries) {
  if (!entries.length) return { created: [] }
  const body = entries.map(([key, value]) => ({
    key, value, type: 'encrypted', target: ['production', 'preview', 'development'],
  }))
  return vercelFetch(`/v10/projects/${encodeURIComponent(projectIdOrName)}/env?upsert=true`, { method: 'POST', body })
}
