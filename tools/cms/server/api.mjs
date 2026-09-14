/**
 * tools/cms/server/api.mjs — the CMS dashboard's backend. Runs two ways from
 * the exact same route logic (handleApi, exported below):
 *   - locally, mounted as a Vite dev-server middleware by cmsApiPlugin()
 *     (`server.middlewares` is Vite's own Connect instance — no new dep)
 *   - hosted, as a Vercel serverless function via api/[...path].mjs, which
 *     just re-exports handleApi as its default handler
 *
 * Routes (all under /api):
 *   GET  /api/schema                — the config/strings/assets/cards schema (for building forms)
 *   GET  /api/writer-info           — which write backend is active (fs vs github) and whether it's configured
 *   GET  /api/stores                — every discovered store: { key, label, managed }
 *   GET  /api/stores/:key           — a managed store's full definition (store.config.json)
 *   POST /api/stores                — create a new store from a definition body
 *   PUT  /api/stores/:key           — regenerate an existing MANAGED store (guarded — see writeStore)
 *   POST /api/stores/:key/assets    — place an uploaded asset file, returns its relative path
 *   GET  /api/stores/:key/git       — git status scoped to this store's files (fs-writer mode only)
 *   POST /api/stores/:key/commit    — { message, newBranch? } — stage + commit just this store (fs-writer mode only)
 *   POST /api/stores/:key/push      — push the current branch (fs-writer mode only)
 *   GET  /api/stores/:key/deployments — Vercel deployment status (needs VERCEL_TOKEN, else reports unconfigured)
 *   POST /api/stores/:key/vercel-project — create a Vercel project for this store (needs VERCEL_TOKEN)
 *   GET  /api/style-guides            — style guides available to prefill the new-store wizard (Phase 5)
 *   GET  /api/style-guides/:name      — a style guide's prefill: seeds, font, voice
 *
 * The write/read layer (writers/fs.mjs locally, writers/github.mjs hosted) is
 * chosen by writers/index.mjs's getWriter() — this file never touches `fs`
 * for store data directly, so it doesn't care which backend is active. The
 * one thing that stays fs/git-specific is the Publish panel's git status/
 * commit/push routes, which only make sense against a local checkout — they
 * 400 cleanly in github-writer mode instead of attempting local git ops that
 * would fail anyway in a serverless runtime with no working tree.
 */

import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

import { CONFIG_SCHEMA } from '../schema/config.js'
import { STRINGS_SCHEMA } from '../schema/strings.js'
import { ASSETS_SCHEMA, SHARED_ASSETS } from '../schema/assets.js'
import { CARD_TYPES } from '../schema/cards.js'
import { generateThemeCss } from '../generators/theme.mjs'
import { generateStoreModule } from '../generators/store-module.mjs'
import { generateCatalogModule } from '../generators/catalog.mjs'
import { scaffoldPlaceholderAssets } from '../generators/assets.mjs'
import { getWriter, writerInfo } from './writers/index.mjs'
import { gitStatusForStore, commitStore, pushCurrentBranch, currentBranch } from './writers/git.mjs'
import { getDeployments, createProject, setEnvVars } from './vercel.mjs'
import { listStyleGuides, getStyleGuidePrefill } from './style-guides.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
// Only meaningful for the fs writer and for style-guide/git-status reads —
// the github writer ignores repoRoot entirely (see its header comment).
const REPO_ROOT = resolve(__dirname, '../../..')

function readBody (req) {
  return new Promise((res, rej) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => res(data))
    req.on('error', rej)
  })
}

function sendJson (res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

async function generateFilesForDefinition (writer, definition) {
  const { key, label, theme, config, strings, translations = {}, catalog = null, featured = null, skus } = definition

  const assets = definition.assets === 'placeholder'
    ? await scaffoldPlaceholderAssets(writer, { repoRoot: REPO_ROOT, key })
    : definition.assets

  const themeCss = generateThemeCss({ key, ...theme })
  const splitCatalog = config?.catalog?.mode === 'filter' && catalog !== null
  const catalogModuleSrc = splitCatalog ? generateCatalogModule({ label, catalog, featured }) : null
  const storeModuleSrc = generateStoreModule({
    key, label, config, strings, translations, assets,
    catalog: splitCatalog ? null : catalog,
    featured: splitCatalog ? null : featured,
    skus,
  })

  return { storeModuleSrc, catalogModuleSrc, themeCss, definitionWithResolvedAssets: { ...definition, assets } }
}

export async function handleApi (req, res) {
  const url = new URL(req.url, 'http://localhost')
  // Connect (Vite's server.middlewares) strips the mounted prefix ('/api') from
  // req.url before calling this handler, but the plugin is also usable mounted
  // at root — so accept either '/schema' or '/api/schema' shaped paths.
  const raw = url.pathname.split('/').filter(Boolean)
  const parts = raw[0] === 'api' ? raw : ['api', ...raw]
  const segment = parts[1]

  try {
    // GET /api/schema
    if (req.method === 'GET' && segment === 'schema') {
      return sendJson(res, 200, { config: CONFIG_SCHEMA, strings: STRINGS_SCHEMA, assets: ASSETS_SCHEMA, sharedAssets: SHARED_ASSETS, cardTypes: Object.keys(CARD_TYPES) })
    }

    // GET /api/preview-origin — where the live-preview iframe should point.
    // Locally (npm run cms) this is the storefront dev server's actual bound
    // port — set by scripts/cms.mjs, since 5173 may already be taken; falls
    // back to the conventional default if the CMS was started standalone
    // (`vite --config tools/cms/vite.config.js`). Hosted (Part 4c) there's no
    // local dev server to point at — CMS_PREVIEW_ORIGIN should be set to the
    // deployed internal (all-stores) build's URL, e.g.
    // https://sku-card-internal.vercel.app. `live` reports whether this is a
    // real dev server (HMR-backed) or a static deployed build the panel
    // should treat as "preview after deploy", per Part 4c's tradeoff.
    if (req.method === 'GET' && segment === 'preview-origin') {
      if (process.env.CMS_PREVIEW_ORIGIN) {
        return sendJson(res, 200, { origin: process.env.CMS_PREVIEW_ORIGIN, live: false })
      }
      const port = process.env.CMS_STOREFRONT_PORT ?? '5173'
      return sendJson(res, 200, { origin: `http://localhost:${port}`, live: true })
    }

    // GET /api/writer-info
    if (req.method === 'GET' && segment === 'writer-info') {
      return sendJson(res, 200, writerInfo())
    }

    const writer = getWriter()

    // GET /api/stores
    if (req.method === 'GET' && segment === 'stores' && !parts[2]) {
      const keys = await writer.discoverStores({ repoRoot: REPO_ROOT })
      const stores = await Promise.all(keys.map(async key => {
        const def = await writer.readDefinition({ repoRoot: REPO_ROOT, key })
        return { key, label: def?.label ?? key, managed: def?.managed === true, hasDefinition: def !== null }
      }))
      return sendJson(res, 200, stores)
    }

    // GET /api/stores/:key
    if (req.method === 'GET' && segment === 'stores' && parts[2] && !parts[3]) {
      const def = await writer.readDefinition({ repoRoot: REPO_ROOT, key: parts[2] })
      if (!def) return sendJson(res, 404, { error: `No store.config.json for "${parts[2]}" — it's an unmanaged, hand-authored store.` })
      return sendJson(res, 200, def)
    }

    // POST /api/stores  — create a new store
    if (req.method === 'POST' && segment === 'stores' && !parts[2]) {
      const definition = JSON.parse(await readBody(req))
      if (!definition.key || !/^[a-z][a-z0-9-]*$/.test(definition.key)) {
        return sendJson(res, 400, { error: 'definition.key must be a lowercase identifier' })
      }
      definition.managed = true
      const { storeModuleSrc, catalogModuleSrc, themeCss, definitionWithResolvedAssets } = await generateFilesForDefinition(writer, definition)
      const result = await writer.writeStore({
        repoRoot: REPO_ROOT, key: definition.key, storeModuleSrc, catalogModuleSrc, themeCss,
        definition: definitionWithResolvedAssets, overwrite: false,
      })
      return sendJson(res, 201, result)
    }

    // PUT /api/stores/:key — regenerate an existing MANAGED store
    if (req.method === 'PUT' && segment === 'stores' && parts[2] && !parts[3]) {
      const key = parts[2]
      const existing = await writer.readDefinition({ repoRoot: REPO_ROOT, key })
      if (!existing || existing.managed !== true) {
        return sendJson(res, 403, { error: `"${key}" is not a managed store — the CMS never overwrites a hand-authored store.` })
      }
      const definition = { ...JSON.parse(await readBody(req)), key, managed: true }
      const { storeModuleSrc, catalogModuleSrc, themeCss, definitionWithResolvedAssets } = await generateFilesForDefinition(writer, definition)
      const result = await writer.writeStore({
        repoRoot: REPO_ROOT, key, storeModuleSrc, catalogModuleSrc, themeCss,
        definition: definitionWithResolvedAssets, overwrite: true,
      })
      return sendJson(res, 200, result)
    }

    // POST /api/stores/:key/assets — { slot: 'brand'|'content'|'fonts', name, dataBase64 }
    if (req.method === 'POST' && segment === 'stores' && parts[2] && parts[3] === 'assets') {
      const key = parts[2]
      const { slot, name, dataBase64 } = JSON.parse(await readBody(req))
      const result = await writer.writeAsset({ repoRoot: REPO_ROOT, key, slot, name, buffer: Buffer.from(dataBase64, 'base64') })
      return sendJson(res, 201, result)
    }

    // The Publish panel's git status/commit/push only make sense against a
    // local checkout — 400 cleanly in github-writer mode rather than
    // attempting local git ops with no working tree.
    if (segment === 'stores' && parts[2] && ['git', 'commit', 'push'].includes(parts[3])) {
      if (process.env.CMS_WRITER === 'github') {
        return sendJson(res, 400, { error: 'Git status/commit/push aren\'t applicable in github-writer mode — every write is already a commit (see writers/github.mjs).' })
      }

      // GET /api/stores/:key/git — status scoped to this store's files
      if (req.method === 'GET' && parts[3] === 'git' && !parts[4]) {
        const branch = await currentBranch(REPO_ROOT)
        const changes = await gitStatusForStore(REPO_ROOT, parts[2])
        return sendJson(res, 200, { branch, changes })
      }

      // POST /api/stores/:key/commit — { message, newBranch? }
      if (req.method === 'POST' && parts[3] === 'commit') {
        const { message, newBranch } = JSON.parse(await readBody(req))
        if (!message?.trim()) return sendJson(res, 400, { error: 'A commit message is required.' })
        const result = await commitStore(REPO_ROOT, parts[2], message, { newBranch: !!newBranch })
        return sendJson(res, 200, result)
      }

      // POST /api/stores/:key/push — push the current branch. Separate step
      // from commit on purpose (see writers/git.mjs header) — never called
      // implicitly by commit.
      if (req.method === 'POST' && parts[3] === 'push') {
        const result = await pushCurrentBranch(REPO_ROOT)
        return sendJson(res, 200, result)
      }
    }

    // GET /api/stores/:key/deployments — Vercel status, or { configured:false }
    if (req.method === 'GET' && segment === 'stores' && parts[2] && parts[3] === 'deployments') {
      const result = await getDeployments(parts[2])
      return sendJson(res, 200, result)
    }

    // POST /api/stores/:key/vercel-project — create a Vercel project for this
    // store. Explicit, separate from everything else — creates real
    // infrastructure in the configured Vercel account, so the dashboard
    // requires its own confirmation step before calling this (see PublishPanel.vue).
    if (req.method === 'POST' && segment === 'stores' && parts[2] && parts[3] === 'vercel-project') {
      const { linkEnvVars } = JSON.parse((await readBody(req)) || '{}')
      const result = await createProject(REPO_ROOT, parts[2])
      if (linkEnvVars) {
        result.envVars = await setEnvVars(result.name, [
          ['VITE_SUPABASE_URL', process.env.VITE_SUPABASE_URL],
          ['VITE_SUPABASE_ANON_KEY', process.env.VITE_SUPABASE_ANON_KEY],
        ].filter(([, value]) => value))
      }
      return sendJson(res, 201, result)
    }

    // GET /api/style-guides
    if (req.method === 'GET' && segment === 'style-guides' && !parts[2]) {
      return sendJson(res, 200, listStyleGuides(REPO_ROOT))
    }

    // GET /api/style-guides/:name
    if (req.method === 'GET' && segment === 'style-guides' && parts[2]) {
      const prefill = getStyleGuidePrefill(REPO_ROOT, parts[2])
      if (!prefill) return sendJson(res, 404, { error: `No usable spec.json for style guide "${parts[2]}".` })
      return sendJson(res, 200, prefill)
    }

    sendJson(res, 404, { error: 'Not found' })
  } catch (err) {
    sendJson(res, 500, { error: err.message })
  }
}

export function cmsApiPlugin () {
  return {
    name: 'cms-api',
    configureServer (server) {
      server.middlewares.use('/api', (req, res) => { handleApi(req, res) })
    },
  }
}
