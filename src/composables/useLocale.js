/**
 * useLocale — region + language state for the switcher (drawer footer, navbar
 * pill, and the two selector sheets).
 *
 * Store-agnostic: which markets/languages a store serves comes from
 * config.locale (a set from src/locale/sets.js, wired per store in its store
 * module) — components never test the store name. Selection persists to
 * localStorage per store (`locale:<theme>`) and re-validates on theme switch.
 *
 * Rules:
 *  - English is available in EVERY region (markets.js never lists it; it is
 *    prepended here).
 *  - Changing region resets the language to 'en' when the current language is
 *    not offered in the new region.
 *  - RTL content (Arabic) is suppressed in both selectors while the active
 *    language is LTR — an RTL string mixed into an otherwise LTR sheet reads
 *    as a layout glitch, not a feature. Language rows for RTL languages are
 *    hidden; RTL market names fall back to `englishName`. Once the active
 *    language IS RTL, both show normally (see `isRtlActive`).
 *
 * Module-scope singleton pinned to globalThis (same rationale as useTheme —
 * mixed import specifiers must not fork the state).
 */
import { ref, computed, watch } from 'vue'
import { useTheme } from './useTheme.js'
import { useStoreConfig } from './useStoreConfig.js'
import { LANGUAGES } from '../locale/languages.js'
import { MARKETS, GROUPS } from '../locale/markets.js'
import { UI_STRINGS } from '../locale/uiStrings.js'
import { COMMON_STRINGS } from '../locale/commonStrings.js'
import { LOCALE_SETS } from '../locale/sets.js'
import { deepMerge } from '../utils/deepMerge.js'

const STATE = Symbol.for('webstore.useLocale.state')

function storageKey (theme) {
  return `locale:${theme}`
}

function readPersisted (theme) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(theme))) ?? {}
  } catch {
    return {}
  }
}

function initState () {
  const { theme } = useTheme()
  const config = useStoreConfig()

  // Stores without a declared locale set fall back to the Codashop standard.
  const set = computed(() => config.value.locale ?? LOCALE_SETS.codashop)

  const region = ref('SG')
  const language = ref('en')
  const regionSelectorOpen = ref(false)
  const languageSelectorOpen = ref(false)

  // Languages offered for a given market within the active store's set:
  // EN always, plus the market's own languages the store actually supports.
  function languagesFor (marketCode) {
    const market = MARKETS[marketCode]
    const offered = (market?.languages ?? []).filter(l => set.value.languages.includes(l))
    return ['en', ...offered]
  }

  // (Re)load the persisted selection for a store, validated against its set.
  function loadForStore () {
    const saved = readPersisted(theme.value)
    region.value = set.value.markets.includes(saved.region) ? saved.region : set.value.defaultMarket
    language.value = languagesFor(region.value).includes(saved.language) ? saved.language : 'en'
  }
  loadForStore()
  watch(theme, loadForStore)

  function persist () {
    try {
      localStorage.setItem(storageKey(theme.value), JSON.stringify({ region: region.value, language: language.value }))
    } catch { /* storage unavailable — selection lives for the session only */ }
  }

  function setRegion (code) {
    if (!set.value.markets.includes(code)) return
    region.value = code
    if (!languagesFor(code).includes(language.value)) language.value = 'en'
    persist()
  }

  function setLanguage (code) {
    if (!languagesFor(region.value).includes(code)) return
    language.value = code
    persist()
  }

  const currentMarket = computed(() => MARKETS[region.value])
  const currentLanguage = computed(() => LANGUAGES[language.value])

  // Is the active language itself RTL? Gates whether RTL content shows at all
  // (see the file-header note) — while false, RTL languages/market names hide.
  const isRtlActive = computed(() => currentLanguage.value?.rtl ?? false)

  // Resolved display label for a market — its native RTL name falls back to
  // englishName unless the active language is RTL too.
  function marketLabel (market) {
    return market.rtl && !isRtlActive.value ? (market.englishName ?? market.name) : market.name
  }
  const currentMarketName = computed(() => marketLabel(currentMarket.value))

  // The store's markets, grouped for the region selector's continent columns.
  const marketGroups = computed(() =>
    GROUPS
      .map(group => ({
        group,
        markets: set.value.markets
          .map(code => MARKETS[code])
          .filter(m => m && m.group === group)
          .map(m => ({ ...m, label: marketLabel(m) }))
          .sort((a, b) => a.label.localeCompare(b.label, 'en')),
      }))
      .filter(g => g.markets.length > 0)
  )

  // Flat market list for the search typeahead.
  const markets = computed(() =>
    set.value.markets.map(code => MARKETS[code]).filter(Boolean).map(m => ({ ...m, label: marketLabel(m) }))
  )

  // Languages offered in the current region, minus RTL ones while the active
  // language is LTR (see the file-header note).
  const availableLanguages = computed(() =>
    languagesFor(region.value)
      .map(code => LANGUAGES[code])
      .filter(l => l && (!l.rtl || isRtlActive.value))
  )

  // Switcher UI copy in the selected language, EN fallback per key.
  const ui = computed(() => ({ ...UI_STRINGS.en, ...(UI_STRINGS[language.value] ?? {}) }))

  // Shared, store-agnostic app chrome (checkout/sign-in/account/nav/carousel),
  // deep-merged over EN per key so any untranslated key falls back to English.
  const common = computed(() => deepMerge(COMMON_STRINGS.en, COMMON_STRINGS[language.value] ?? {}))

  return {
    region,
    language,
    currentMarket,
    currentMarketName,
    currentLanguage,
    isRtlActive,
    markets,
    marketGroups,
    availableLanguages,
    ui,
    common,
    setRegion,
    setLanguage,
    regionSelectorOpen,
    languageSelectorOpen,
    openRegionSelector: () => { regionSelectorOpen.value = true },
    closeRegionSelector: () => { regionSelectorOpen.value = false },
    openLanguageSelector: () => { languageSelectorOpen.value = true },
    closeLanguageSelector: () => { languageSelectorOpen.value = false },
  }
}

const state = globalThis[STATE] ?? (globalThis[STATE] = initState())

export function useLocale () {
  return state
}
