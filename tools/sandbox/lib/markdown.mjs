/**
 * tools/sandbox/lib/markdown.mjs — shared markdown-section extraction.
 *
 * Originally written inline in export-sandbox.mjs to parse each component's
 * docs/Handoff/components/<slug>/spec.md (there is no spec.json sibling in
 * this repo — spec.md is the only generated artifact, produced by
 * scripts/export-handoff.mjs in story mode). Extracted here in Milestone 2
 * because generate-ruleset.mjs needs the exact same `## Heading` extraction
 * over a different kind of markdown file (this repo's skill SKILL.md files) —
 * both are heading-delimited in the same shape, so one implementation serves
 * both call sites instead of drifting apart.
 */
import { toKebab } from './naming.mjs'

/** Extract a `## Heading` section's raw body (up to the next `## `). */
export function section(content, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`## ${escaped}\\n([\\s\\S]*?)(?=\\n## |$)`)
  const m = content.match(re)
  return m ? m[1].trim() : ''
}

/**
 * Truncates a section body right before a NESTED subheading (### or ####) it
 * contains — for the rare case where a named `##` section's own trailing
 * subsection covers different ground than the heading promises (e.g.
 * web-store-tokens' "2b" section body ends with a "### Authoring
 * discipline" subsection that's about DEFINING tokens, not the "stop and
 * ask" consuming-tokens rule 2b's own heading is about). `heading` is the
 * subheading's exact text (any `#` level, 3+).
 */
export function truncateBeforeHeading(body, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`\\n#{3,}\\s+${escaped}\\s*$`, 'm')
  const m = body.match(re)
  return m ? body.slice(0, m.index).trim() : body
}

/** Split a markdown table row into its cells, dropping the outer empty pipes. */
export function tableCells(line) {
  return line.trim().split('|').slice(1, -1).map((c) => c.trim())
}

/**
 * Parse a docs/Handoff/components/<slug>/spec.md into the shape catalog.json
 * needs: group, usage rules, supported states, variant names, and the
 * resolved token contract for one store column.
 */
export function parseSpecMd(content, storeKeyUpper) {
  const fm = {}
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (fmMatch) {
    for (const line of fmMatch[1].split('\n')) {
      const m = line.match(/^(\w[\w-]*):\s*(.*)$/)
      if (m) fm[m[1]] = m[2].trim()
    }
  }

  const rules = section(content, 'Usage Rules')
    .split('\n')
    .map((l) => l.replace(/^- /, '').trim())
    .filter(Boolean)

  const variantsSection = section(content, 'Variants & Interaction States')
  const statesMatch = variantsSection.match(/\*\*Supported Interaction States\*\*:\s*(.+)/)
  const states = statesMatch
    ? statesMatch[1].split(',').map((s) => s.trim().replace(/`/g, ''))
    : []
  const variantRows = variantsSection.split('\n')
    .filter((l) => l.trim().startsWith('|'))
    .map(tableCells)
    .filter((cells) => cells.length === 2 && cells[0] !== 'Variant Name' && !/^-+$/.test(cells[0]))
  const variants = variantRows.map((cells) => cells[0])

  const tokenSection = section(content, 'Token Contract (Resolved per Store)')
  const tokenRows = tokenSection.split('\n')
    .filter((l) => l.trim().startsWith('|'))
    .map(tableCells)
    .filter((cells) => !cells.every((c) => /^-+$/.test(c)))
  const tokens = []
  if (tokenRows.length > 1) {
    const storeColIdx = tokenRows[0].indexOf(storeKeyUpper)
    for (const cells of tokenRows.slice(1)) {
      const name = cells[0]?.replace(/`/g, '')
      const value = storeColIdx !== -1 ? cells[storeColIdx]?.replace(/`/g, '') : null
      if (name) tokens.push({ name, value })
    }
  }

  return { group: fm.group ?? null, rules, states, variants, tokens }
}

export { toKebab }
