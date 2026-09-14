/**
 * tools/lib/component-tokens.mjs — the single, shared "which DS tokens does
 * this .vue file consume" extractor.
 *
 * Before this module existed, the same regex-based extraction was
 * independently reimplemented in tools/harness-cli.mjs and tools/vue-slice.mjs
 * with subtly different behaviour (harness-cli filtered to --x-/--sys- and
 * captured fallbacks; vue-slice captured everything with no filter and no
 * fallback tracking). Two implementations of "what tokens does this
 * component use" is exactly how a story's hand-authored `tokens:` list can
 * drift from reality — see docs/... the --x-fx-* cross-store gap that only
 * surfaced once a story's tokens: array happened to be populated by hand.
 * This is now the one place that answers the question, imported by every
 * consumer (harness-cli's test sweep, vue-slice's contract command,
 * export-handoff's auto-derived spec token contract, scaffold's story
 * generator).
 */
import { readFileSync, existsSync } from 'node:fs'

// Source pattern for a single var(--token[, fallback]) occurrence. Kept as
// one literal string and re-instantiated per line in scanVarUsages (below)
// rather than shared as a single stateful RegExp, since a `g`-flagged
// RegExp's lastIndex persisting across calls is a classic source of
// skipped/duplicated matches.
const VAR_USAGE_SOURCE = 'var\\(\\s*(--[a-zA-Z0-9-]+)\\s*(?:,\\s*([^)]+))?\\)'

/**
 * The one place that scans source text for var(--...) usages. Every consumer
 * that needs per-occurrence detail (line numbers, unfiltered names, a fresh
 * snippet) should call this instead of writing its own regex loop — that's
 * exactly how the --x-/--sys- filtering and fallback-tracking drifted apart
 * across tools/harness-cli.mjs, tools/vue-slice.mjs, tools/token-cli.mjs and
 * tools/preflight.mjs before this module existed.
 *
 * @param {string} content raw file text (not a path — callers already have
 *   the content in hand in most cases, e.g. per-line lint output)
 * @returns {{ token: string, fallback: string|null, line: number, snippet: string }[]}
 *   every var(...) occurrence, unfiltered and undeduped, in source order.
 */
export function scanVarUsages (content) {
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
        snippet: lineText.trim()
      })
    }
  })
  return usages
}

/**
 * @param {string} absComponentPath absolute path to a .vue file
 * @returns {{ name: string, fallback: string|null }[]} every --x-/--sys-
 *   token referenced via var(...) in the file, deduped by name (a fallback
 *   found on any occurrence is kept; a no-fallback occurrence wins if seen).
 */
export function getComponentConsumedTokens (absComponentPath) {
  if (!existsSync(absComponentPath)) return []

  const content = readFileSync(absComponentPath, 'utf8')
  const tokens = new Map()
  for (const { token: name, fallback } of scanVarUsages(content)) {
    if (name.startsWith('--x-') || name.startsWith('--sys-')) {
      if (!tokens.has(name) || fallback === null) {
        tokens.set(name, fallback)
      }
    }
  }
  return [...tokens.entries()].map(([name, fallback]) => ({ name, fallback }))
}

/** Convenience: just the token names, no fallback metadata. */
export function getComponentConsumedTokenNames (absComponentPath) {
  return getComponentConsumedTokens(absComponentPath).map((t) => t.name)
}
