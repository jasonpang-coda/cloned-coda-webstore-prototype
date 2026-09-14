/**
 * useColorScheme — manual light/dark override, source of truth for the
 * toolbar's light/dark toggle.
 *
 * Holds 'dark' | 'light' as a reactive ref and writes it through to
 * <html data-color-scheme>. Only a handful of themes ship a light-mode
 * token override (see SUPPORTED_THEMES) — zzz.css's
 * html[data-theme="zzz"][data-color-scheme="light"] block is the first.
 * A theme with no such block simply ignores the attribute, so setting it
 * globally here is harmless for every other store.
 *
 * Deliberately NOT driven by @media (prefers-color-scheme): the toggle is
 * meant to fully override whatever the OS is set to, not race it. Initial
 * value still seeds from the OS preference so a first-time visitor sees a
 * sensible default before ever touching the toggle.
 *
 * Same globalThis-symbol singleton pattern as useTheme.js — see that
 * file's comment for why a plain module-level ref isn't safe here (mixed
 * import specifiers can evaluate this module twice under Vite dev).
 */
import { ref, readonly } from 'vue'

// Themes that ship a light-mode token block. Scopes the toolbar toggle so
// it doesn't appear (and silently do nothing) on stores with no light
// variant defined yet.
export const SUPPORTED_THEMES = new Set(['zzz'])

function resolveInitialScheme () {
  const fromHtml = document.documentElement.dataset.colorScheme
  if (fromHtml === 'light' || fromHtml === 'dark') return fromHtml
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

const STATE = Symbol.for('webstore.useColorScheme.state')
const current = globalThis[STATE]
  ?? (globalThis[STATE] = ref(resolveInitialScheme()))
document.documentElement.dataset.colorScheme = current.value

function setColorScheme (scheme) {
  if (scheme !== 'light' && scheme !== 'dark') return
  current.value = scheme
  document.documentElement.dataset.colorScheme = scheme
}

function toggleColorScheme () {
  setColorScheme(current.value === 'light' ? 'dark' : 'light')
}

export function useColorScheme () {
  return { colorScheme: readonly(current), setColorScheme, toggleColorScheme }
}
