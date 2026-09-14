/**
 * useTheme — active store/theme source of truth
 *
 * Holds the current [data-theme] as a reactive ref and writes it through to
 * <html data-theme>. Pure CSS tokens (colour / typography) re-resolve instantly
 * when the attribute flips; making it a ref also lets useStoreAssets recompute
 * its image registry reactively on a theme switch.
 *
 * The store registry comes from the @active-stores virtual module (a Vite
 * plugin in vite.config.js that discovers src/stores/<store>/store.js on
 * disk): the default build registers every store and the DeviceToolbar
 * switcher is live; a store-locked build (`vite build --mode <store>`)
 * registers exactly one store and the switcher hides itself
 * (themes.length === 1).
 *
 * Adding a store: create src/stores/<store>/store.js (theme CSS import +
 * config/strings/assets/catalog) — nothing else to register.
 *
 * Initial theme resolution order: a `?theme=<key>` query param (used by the
 * store-CMS live preview iframe to force a specific store regardless of
 * <html data-theme>), then the `data-theme` attribute index.html shipped
 * with, then the registered default store (see resolveInitialTheme below).
 */
import { ref, readonly } from 'vue'
import { ACTIVE_STORES } from '@active-stores'

// Sorted by label for the toolbar dropdown — store order in @active-stores is
// filesystem/registration order (codm first, the rest alphabetical by key),
// which has no relationship to how they should list in a switcher.
export const THEMES = ACTIVE_STORES
  .map(s => ({ value: s.key, label: s.label }))
  .sort((a, b) => a.label.localeCompare(b.label))

const VALID = new Set(THEMES.map(t => t.value))

// Fallback store when neither the query param nor <html data-theme> resolves
// to a valid key. Read off @active-stores directly (its first entry is always
// the registered default — see vite.config.js's DEFAULT_STORE) rather than
// THEMES[0], since THEMES is sorted by label for display and coincidentally
// matching would be an accident, not a guarantee.
const DEFAULT_THEME = ACTIVE_STORES[0].key

function resolveInitialTheme () {
  const fromQuery = new URLSearchParams(window.location.search).get('theme')
  if (fromQuery && VALID.has(fromQuery)) return fromQuery
  const fromHtml = document.documentElement.dataset.theme
  if (VALID.has(fromHtml)) return fromHtml
  return DEFAULT_THEME
}

// Single source of truth for the active theme — pinned to a global symbol.
//
// Importers reference this module through mixed specifiers (`@/composables/
// useTheme` vs `./useTheme`); Vite's dev server can resolve the alias and the
// relative path to *different* module records, evaluating this file more than
// once. Each copy would otherwise own its own `current` ref: the toolbar's
// setTheme would update one copy (and flip <html data-theme>, so colours
// change) while the content composables read another that's stuck on the
// initial store — exactly the "colours switch but content stays COD:M" bug.
// Storing the ref on globalThis under a registered symbol guarantees every
// module instance shares one ref, so theme + content always move together.
const STATE = Symbol.for('webstore.useTheme.state')
const current = globalThis[STATE]
  ?? (globalThis[STATE] = ref(resolveInitialTheme()))
document.documentElement.dataset.theme = current.value

function setTheme (theme) {
  if (!VALID.has(theme)) return
  current.value = theme
  document.documentElement.dataset.theme = theme
}

export function useTheme () {
  return { theme: readonly(current), themes: THEMES, setTheme }
}
