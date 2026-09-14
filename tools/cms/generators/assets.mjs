/**
 * generators/assets.mjs — places uploaded/sourced binary files into a store's
 * img/{brand,content}/ or fonts/ folders via a swappable writer (fs locally,
 * GitHub Contents API when hosted — see server/writers/), and returns the
 * relative import path the other generators (store-module.mjs, catalog.mjs)
 * expect.
 *
 * Placeholder art is vendored into tools/cms/assets/ (not read from
 * src/stores/pvz3/img/…) so this module works unchanged when the CMS is
 * deployed to Vercel with Root Directory = tools/cms — Vercel's build only
 * includes files under the Root Directory, so a source path outside it would
 * silently 404 in hosted mode (see docs/deploying-individual-stores.md's
 * note on why the VitePress handoff sites vendor their tokens the same way).
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = resolve(__dirname, '../assets')

/**
 * @param {object} writer - a writers/{fs,github}.mjs module (must export writeAsset)
 * @param {object} ctx - passed through to writer.writeAsset verbatim (e.g. { repoRoot, key })
 * @param {'brand'|'content'|'fonts'} slot
 * @param {Buffer} buffer - file contents
 * @param {string} name - destination filename
 * @returns {Promise<string>} the relative import path, e.g. './img/brand/wordmark.svg'
 */
export async function placeAsset (writer, ctx, slot, buffer, name) {
  const { path } = await writer.writeAsset({ ...ctx, slot, name, buffer })
  return path
}

/**
 * Places the CMS's own generic placeholder art (one square, one wide SVG —
 * the pattern setup-checklist.md Phase 2 recommends for a buildable scaffold
 * before real assets arrive) via the given writer, and returns a
 * definition-ready assets object with every slot pointed at one of the two
 * (or null, for slots a fresh store shouldn't force art into — see
 * tools/cms/schema/assets.js's `required` flag).
 */
export async function scaffoldPlaceholderAssets (writer, ctx) {
  const square = readFileSync(resolve(ASSETS_DIR, 'placeholder-square.svg'))
  const wide = readFileSync(resolve(ASSETS_DIR, 'placeholder-wide.svg'))

  const wordmark = await placeAsset(writer, ctx, 'brand', wide, 'wordmark-placeholder.svg')
  const logomark = await placeAsset(writer, ctx, 'brand', square, 'logomark-placeholder.svg')
  const squarePath = await placeAsset(writer, ctx, 'content', square, 'placeholder-square.svg')
  const widePath = await placeAsset(writer, ctx, 'content', wide, 'placeholder-wide.svg')

  return {
    brand: {
      wordmark, logomark,
      favicon: logomark,
      navSignInIcon: logomark,
      qrCode: null, qrPlaceholder: null,
      cpIcon: squarePath, apIcon: null,
      loyaltyIcon: null, loyaltyIconColour: null,
      bg: null,
    },
    content: {
      storyHero: widePath,
      bestSellerImage: squarePath,
      avatar: squarePath,
    },
  }
}
