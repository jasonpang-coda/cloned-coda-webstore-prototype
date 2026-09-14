/**
 * server/style-guides.mjs — Phase 5: ingest docs/style-guides/<title>/spec.json
 * (produced by the style-guide-designer skill) to prefill the new-store
 * wizard's seeds, typography, and voice/currency hints. Read-only — never
 * writes anything; the wizard still requires the user to review and submit.
 *
 * spec.json's `codashop.themePreset.presetStyle.seedColors` are hex, but the
 * theme generator's `seeds` input is oklch() strings (see generators/theme.mjs),
 * so every seed is converted through generators/color.mjs on the way out.
 */

import { readdirSync, readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { hexToOklchString } from '../generators/color.mjs'
import { SEED_ROLES } from '../schema/theme.js'

export function listStyleGuides (repoRoot) {
  const dir = resolve(repoRoot, 'docs/style-guides')
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(resolve(dir, d.name, 'spec.json')))
    .map(d => {
      const spec = JSON.parse(readFileSync(resolve(dir, d.name, 'spec.json'), 'utf8'))
      return { name: d.name, brand: spec.meta?.brand ?? d.name }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * "Heading Face (heading) / Body Face (body, ...)" → { heading, body }.
 * Falls back to positional (first = heading, second = body) when a segment
 * isn't explicitly labelled, and to a single shared family when the spec
 * only names one face for the whole brand (common for a simpler style guide).
 */
export function parseFontString (raw) {
  if (!raw) return null
  const parts = raw.split('/').map(s => s.trim()).filter(Boolean)
  const parsePart = s => {
    const m = /^(.*?)(?:\(([^)]*)\))?\s*$/.exec(s)
    return { name: (m?.[1] ?? s).trim(), label: (m?.[2] ?? '').toLowerCase() }
  }
  if (parts.length === 1) {
    const { name } = parsePart(parts[0])
    return { heading: name, body: name, raw }
  }
  const parsed = parts.map(parsePart)
  const heading = parsed.find(p => p.label.includes('heading'))?.name ?? parsed[0].name
  const body = parsed.find(p => p.label.includes('body'))?.name ?? parsed[1]?.name ?? parsed[0].name
  return { heading, body, raw }
}

/** @returns {object|null} a wizard-shaped prefill, or null if this style guide has no usable seed colours. */
export function getStyleGuidePrefill (repoRoot, name) {
  const path = resolve(repoRoot, 'docs/style-guides', name, 'spec.json')
  if (!existsSync(path)) return null
  const spec = JSON.parse(readFileSync(path, 'utf8'))

  const hexSeeds = spec.codashop?.themePreset?.presetStyle?.seedColors
  if (!hexSeeds) return null

  const seeds = {}
  for (const role of SEED_ROLES) {
    if (hexSeeds[role]) seeds[role] = hexToOklchString(hexSeeds[role])
  }
  const missing = SEED_ROLES.filter(role => !seeds[role])

  return {
    name,
    brand: spec.meta?.brand ?? name,
    seeds,
    missingSeeds: missing,
    font: parseFontString(spec.codashop?.themePreset?.presetStyle?.font),
    voice: {
      adjectives: spec.generic?.essence?.adjectives ?? [],
      summary: spec.generic?.voice?.summary ?? '',
    },
  }
}
