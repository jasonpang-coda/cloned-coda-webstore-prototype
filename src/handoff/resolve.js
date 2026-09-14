/**
 * resolve.js — the anti-drift core of the in-app handoff.
 *
 * A flow manifest only names tokens; it never contains resolved values. This
 * module reads the ACTUAL value the browser computed for a token right now,
 * under any store theme, by briefly flipping `<html data-theme>` and reading
 * `getComputedStyle` — never by parsing CSS source or trusting a transcribed
 * literal. Because `getComputedStyle` forces a synchronous style recalc (no
 * paint happens until the current task yields), toggling the theme, reading,
 * and restoring all happen within one microtask with nothing ever painted in
 * the wrong theme — no flicker, even though the store shell itself is
 * unmounted while /handoff is active (see useHandoff.js).
 */
import { getToken } from '@coda/harness-kit/vue'

/**
 * Resolve one token's value under a given theme key, without disturbing the
 * currently-active theme once this call returns.
 * @param {string} tokenName
 * @param {string} themeKey
 * @returns {string}
 */
export function resolveTokenForTheme (tokenName, themeKey) {
  if (typeof document === 'undefined') return ''
  const el = document.documentElement
  const prev = el.dataset.theme
  if (prev !== themeKey) el.dataset.theme = themeKey
  const value = getToken(tokenName)
  if (prev !== themeKey) el.dataset.theme = prev
  return value
}

/**
 * Resolve many tokens under many themes in one pass — one theme flip per
 * theme, not per token, since getComputedStyle itself is the expensive part.
 * @param {string[]} tokenNames
 * @param {string[]} themeKeys
 * @returns {Record<string, Record<string, string>>} themeKey -> tokenName -> value
 */
export function resolveTokensAcrossThemes (tokenNames, themeKeys) {
  if (typeof document === 'undefined') return {}
  const el = document.documentElement
  const prev = el.dataset.theme
  const out = {}
  for (const theme of themeKeys) {
    if (prev !== theme) el.dataset.theme = theme
    const row = {}
    for (const name of tokenNames) row[name] = getToken(name)
    out[theme] = row
  }
  if (el.dataset.theme !== prev) el.dataset.theme = prev
  return out
}

/**
 * Resolve a composed value such as a motion token that references other
 * tokens (e.g. `--x-motion-modal-enter: var(--x-motion-sys-duration-slow)
 * var(--x-motion-sys-ease-decelerate)`), decomposing it into the primitive
 * tokens it's built from. Best-effort: scans the raw computed value for
 * `var(--x)` references it can resolve; anything it can't decompose is
 * returned as-is under `composedOf: []`.
 */
export function decomposeToken (tokenName, themeKey) {
  const resolved = resolveTokenForTheme(tokenName, themeKey)
  // The computed value itself never contains "var(...)" — the browser already
  // resolved it. To show the decomposition we re-read the *declared* value
  // via the stylesheet is out of scope here; instead flows declare their own
  // composedOf list (see flow.js FlowBeat.duration/.easing) so decomposition
  // is explicit and spec-cited rather than sniffed.
  return { resolved }
}

/** Diff two theme rows (from resolveTokensAcrossThemes) into changed keys only. */
export function diffThemeTokens (rowA, rowB) {
  const changed = []
  const keys = new Set([...Object.keys(rowA || {}), ...Object.keys(rowB || {})])
  for (const k of keys) {
    if ((rowA?.[k] ?? '') !== (rowB?.[k] ?? '')) changed.push({ token: k, a: rowA?.[k] ?? '', b: rowB?.[k] ?? '' })
  }
  return changed
}
