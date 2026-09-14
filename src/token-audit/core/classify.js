/**
 * classify.js — buckets every declared token into prod-contract /
 * prototype-only / dev-chrome, per decision #1 in the plan: "in prod" means
 * declared at :root in one of the four DS tier files
 * (system/semantics/space/text-styles.css) — see docs/token-reconcile.md.
 *
 * A token whose NAME matches the semantic-tier pattern (--x-bg-/-text-/
 * -border-/-pad-/-gap-/-radius-/-size-) but has no :root declaration at all
 * is still bucketed 'prod' — it's prod-intended by naming convention, just
 * missing its default (this is exactly drift rule D02's "no :root default"
 * finding; bucketing it 'prototype' would hide the gap instead of flagging
 * it).
 */
import { PROD_CONTRACT_FILES } from './cascade.js'
import { tierRank, tierName, tokenFamily } from './tier.js'

const PROTOTYPE_FILES = new Set([
  'ds/extensions.css', 'light.css', 'materials.css',
  'motion.css', 'motion-sku.css', 'motion-trust.css',
  'keyframes.css', 'effects.css', 'reduced-motion.css',
])

const DEV_CHROME_PATH_RE = /^src\/(token-audit|handoff|library)\/|^src\/components\/(DeviceToolbar|CommandConsole|DeviceFrame|MaterialIcon)\.vue$/

/** file-relative-to-repo-root check for dev chrome. */
export function isDevChromeFile (file) {
  return DEV_CHROME_PATH_RE.test(file)
}

/**
 * Bucket + tier for one token, given all of its declarations (across every
 * store — a flat list of cascade.js declaration records for that name).
 */
export function classifyToken (name, declarations) {
  const declaredInContractFile = declarations.some((d) => d.selectorKind === 'root' && PROD_CONTRACT_FILES.includes(d.file))
  const declaredInPrototypeFile = declarations.some((d) => PROTOTYPE_FILES.has(d.file))
  const rank = tierRank(name)

  let bucket
  if (declaredInContractFile || rank === 0) bucket = 'prod'
  else if (declaredInPrototypeFile) bucket = 'prototype'
  else if (declarations.length === 0) bucket = 'undeclared'
  else bucket = 'prototype' // declared only in theme files, non-semantic name — treat as prototype-scoped brand token

  return {
    tier: tierName(name),
    tierRank: rank,
    family: tokenFamily(name),
    bucket,
    hasContractDefault: declaredInContractFile,
  }
}
