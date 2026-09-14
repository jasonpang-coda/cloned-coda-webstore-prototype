/**
 * useStoreStrings — the fourth whitelabel layer: per-store user-visible copy.
 *
 * Layer decision rule:
 *   colour / type / surface   → CSS token override  (themes/<store>.css)
 *   imagery                   → useStoreAssets
 *   structural capability     → useStoreConfig
 *   user-visible copy         → useStoreStrings  ← this file
 *
 * The copy itself lives in src/stores/<store>/store.js (strings key) and is
 * assembled here from the @active-stores manifest.
 *
 * Language-aware: the English `strings` object is the source of truth and the
 * fallback. A store may also declare a `translations` map keyed by language code
 * (`{ ja: {…}, es: {…} }`, each a PARTIAL override of the same nested shape).
 * useStoreStrings deep-merges the override for the language selected in useLocale
 * over the English base, so any untranslated key falls through to English.
 *
 * Usage:
 *   const strings = useStoreStrings()
 *   strings.value.currency.name   // 'CP' | 'FC Points'
 *   strings.value.signIn.cta      // 'Sign in with COD:M' | 'Sign In'
 */
import { computed } from 'vue'
import { useTheme } from './useTheme.js'
import { useLocale } from './useLocale.js'
import { ACTIVE_STORES } from '@active-stores'
import { deepMerge } from '../utils/deepMerge.js'

const STORES = Object.fromEntries(ACTIVE_STORES.map(s => [s.key, s]))
const DEFAULT = ACTIVE_STORES[0]

// Merged (base ← translation) results are static, so memoise per `${key}:${lang}`.
const cache = new Map()

// Exported (not just used internally) so a non-Vue caller — currently
// tools/harness-render.mjs's locale-stress render pass — can get the exact
// same base←translation merge the live app uses, instead of a second
// hand-rolled deep-merge that could drift from this one.
export function stringsFor (key, lang) {
  const store = STORES[key] ?? DEFAULT
  if (!lang || lang === 'en') return store.strings
  const override = store.translations?.[lang]
  if (!override) return store.strings
  const cacheKey = `${store.key}:${lang}`
  if (!cache.has(cacheKey)) cache.set(cacheKey, deepMerge(store.strings, override))
  return cache.get(cacheKey)
}

export function useStoreStrings () {
  const { theme } = useTheme()
  const { language } = useLocale()
  return computed(() => stringsFor(theme.value, language.value))
}
