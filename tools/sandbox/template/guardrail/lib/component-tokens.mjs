/**
 * guardrail/lib/component-tokens.mjs — ported verbatim from this sandbox's
 * source repo (tools/lib/component-tokens.mjs). Zero dependencies. The one
 * shared "which var(--token) usages does this file contain" scanner — see
 * the source file's own header for the full rationale.
 *
 * Known limitation carried forward: this regex-based scanner cannot see
 * through a dynamically-constructed `var(--x-...${expr})` template-literal
 * token name — such a token is invisible to this check. Never build a token
 * name via string interpolation in a page you author here; use a literal
 * lookup object instead (see ruleset/tokens.md).
 */
import { readFileSync, existsSync } from 'node:fs'

const VAR_USAGE_SOURCE = 'var\\(\\s*(--[a-zA-Z0-9-]+)\\s*(?:,\\s*([^)]+))?\\)'

export function scanVarUsages(content) {
  const usages = []
  const lines = content.split('\n')
  lines.forEach((lineText, idx) => {
    const lineRegex = new RegExp(VAR_USAGE_SOURCE, 'g')
    let m
    while ((m = lineRegex.exec(lineText)) !== null) {
      usages.push({
        token: m[1],
        fallback: m[2] ? m[2].trim() : null,
        line: idx + 1,
        snippet: lineText.trim(),
      })
    }
  })
  return usages
}

export function getComponentConsumedTokens(absComponentPath) {
  if (!existsSync(absComponentPath)) return []
  const content = readFileSync(absComponentPath, 'utf8')
  const tokens = new Map()
  for (const { token: name, fallback } of scanVarUsages(content)) {
    if (name.startsWith('--x-') || name.startsWith('--sys-')) {
      if (!tokens.has(name) || fallback === null) tokens.set(name, fallback)
    }
  }
  return [...tokens.entries()].map(([name, fallback]) => ({ name, fallback }))
}

export function getComponentConsumedTokenNames(absComponentPath) {
  return getComponentConsumedTokens(absComponentPath).map((t) => t.name)
}
