/**
 * tier.js — token tier classification.
 *
 * Mirrors src/main.js's `tokenRules.tierRank` (the inspect-kit reverse-match
 * tiebreak) exactly, so the dashboard and the element inspector never
 * disagree about which tier a token belongs to. Kept as a standalone module
 * rather than importing main.js (which pulls in the whole app bootstrap and
 * every CSS side-effect import) — the two are duplicated on purpose, with
 * this comment as the tripwire: if main.js's tierRank changes, mirror the
 * change here too.
 */

const SEMANTIC_RE = /^--x-(bg|text|border|pad|gap|radius|size)-/
const BORDER_WEIGHT_RE = /^--border-weight-/
const MOTION_ALIAS_RE = /^--x-motion-(?!sys-)/

/** 0 = semantic (what components should consume), 1 = extension, 2 = sys, 3 = palette, 4 = ref. */
export function tierRank (name) {
  if (SEMANTIC_RE.test(name) || BORDER_WEIGHT_RE.test(name) || MOTION_ALIAS_RE.test(name)) return 0
  if (name.startsWith('--x-ref-')) return 4
  if (name.startsWith('--x-palette-')) return 3
  if (name.startsWith('--x-sys-')) return 2
  return 1
}

const TIER_NAMES = ['semantic', 'extension', 'sys', 'palette', 'ref']

/** Human-readable tier label. */
export function tierName (name) {
  if (name.startsWith('--x-motion-sys-')) return 'sys'
  if (/^--x-(font|light|material|shadow|fx|surface-ghost|rarity|toolbar|brand|hdr|mask)/.test(name)) return 'extension'
  return TIER_NAMES[tierRank(name)]
}

/** Family = the token's meaningful name segments (e.g. "bg-card", "sys-colour-primary"). */
export function tokenFamily (name) {
  const stripped = name.replace(/^--x?-?/, '')
  const parts = stripped.split('-')
  // Drop the trailing step/size suffix when it looks like a scale rung
  // (default/soft/main/strong/heavy/inverse/xs/s/m/l/xl/xxl/50-950/hover/pressed/…)
  const SUFFIX_RE = /^(default|soft|subtle|main|strong|heavy|inverse|xs|s|m|l|xl|xxl|xxxl|\d+|hover|pressed|focused|selected|disabled|active|highlighted|error|warning|success)$/
  while (parts.length > 2 && SUFFIX_RE.test(parts[parts.length - 1])) parts.pop()
  return parts.slice(0, 3).join('-')
}
