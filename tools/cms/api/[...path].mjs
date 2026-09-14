/**
 * Vercel serverless function entrypoint for the hosted CMS (Part 4c). A
 * catch-all dynamic route (`[...path]`) under this project's own `api/`
 * directory — Vercel's standard Node.js Function file-system routing, same
 * convention Next.js popularized. Every /api/* request the CMS's frontend
 * makes lands here.
 *
 * Just re-exports the exact same route logic used locally by
 * server/api.mjs's Vite dev-server middleware (cmsApiPlugin) — handleApi
 * already normalizes the incoming path whether or not a mount prefix was
 * stripped, so no adapter code is needed between the two runtimes.
 *
 * Requires CMS_WRITER=github + GITHUB_TOKEN + GITHUB_REPO set as this
 * Vercel project's environment variables — the local fs writer has no
 * src/stores/ to read/write here, since Root Directory=tools/cms means this
 * function's deployment only contains files under tools/cms/ (see
 * generators/assets.mjs's header for why placeholder art is vendored
 * in-package rather than read from src/stores/pvz3/… for the same reason).
 */
export { handleApi as default } from '../server/api.mjs'
