/**
 * server/writers/index.mjs — picks the active write/read backend.
 *
 * `CMS_WRITER=github` (+ GITHUB_TOKEN/GITHUB_REPO — see writers/github.mjs's
 * header) switches to the hosted GitHub-API writer; anything else (including
 * unset) uses the local fs writer, which is correct for `npm run cms` and
 * requires no configuration.
 */

import * as fsWriter from './fs.mjs'
import * as githubWriter from './github.mjs'

export function getWriter () {
  return process.env.CMS_WRITER === 'github' ? githubWriter : fsWriter
}

export function writerInfo () {
  const writer = getWriter()
  const mode = process.env.CMS_WRITER === 'github' ? 'github' : 'fs'
  return { mode, configured: mode === 'fs' ? true : writer.isConfigured() }
}
