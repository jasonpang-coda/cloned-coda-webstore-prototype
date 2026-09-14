#!/usr/bin/env node
/**
 * scripts/cms.mjs — `npm run cms` starts BOTH Vite dev servers in one
 * process: the storefront (so the CMS's live-preview iframe has something to
 * point at) and the CMS dashboard itself. No new dependency — `vite`'s
 * `createServer` is already a devDependency of this repo.
 */

import { createServer } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')

async function start (label, configFile, fallbackPort) {
  // Don't pass `root` here — each config file (vite.config.js /
  // tools/cms/vite.config.js) sets its own root relative to itself; an
  // inline `root` would fight that.
  const server = await createServer({
    configFile: resolve(REPO_ROOT, configFile),
    server: { port: fallbackPort },
  })
  await server.listen()
  server.printUrls()
  console.log(`  ↑ ${label}\n`)
  return server
}

const storefront = await start('storefront (for the CMS preview iframe)', 'vite.config.js', 5173)

// The storefront's port is only known once it's actually listening (5173 is
// often already taken by another project, and Vite falls back to the next
// free port with strictPort:false) — read the real bound port off the http
// server, not the requested config value, and pass it to the CMS server via
// env var so PreviewPane.vue doesn't have to guess. See
// tools/cms/server/api.mjs's /api/preview-origin route.
const storefrontPort = storefront.httpServer.address().port
process.env.CMS_STOREFRONT_PORT = String(storefrontPort)

const cms = await start('store CMS dashboard', 'tools/cms/vite.config.js', 5199)

const shutdown = async () => {
  await Promise.all([storefront.close(), cms.close()])
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
