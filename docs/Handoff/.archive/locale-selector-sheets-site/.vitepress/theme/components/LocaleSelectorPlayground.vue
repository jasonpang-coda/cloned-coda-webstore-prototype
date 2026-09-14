<script setup>
/**
 * LocaleSelectorPlayground — a live, single-frame demo of BOTH
 * RegionSelectorSheet and LanguageSelectorSheet, styled with the REAL
 * vendored tokens/keyframes (the 11-file cascade from handoff.config.mjs).
 * This is a faithful demo stub, not the production .vue files — both real
 * sheets are composable-bound (useLocale, useBottomFade), so per the
 * interactive-handoff decision tree they're re-mocked here with a small
 * fixture dataset (8 markets / 8 languages incl. one RTL pair) while every
 * colour, radius, spacing, shadow, and scroll-fade gradient comes straight
 * from the prototype tokens.
 *
 * Controls map directly to README §2:
 *  - Sheet tabs + Open/Close reach `closed`/`open*` for both sheets.
 *  - isMobile toggle reaches `layout-mobile` / `layout-responsive` for both.
 *  - Typing in the region search reaches `open-empty-query` /
 *    `open-typing-with-matches` / `open-typing-no-matches` (§2.1.a).
 *  - "Simulate more languages" appends fixture rows so the language sheet's
 *    body actually overflows, reaching `list-scrollable` / `-scrolled-to-end`
 *    (§2.2.a) — the real component's list is usually too short to overflow.
 *  - "Force RTL active language (demo only)" is a demo-only stand-in — see
 *    the hint below and README §11 — for a state the real sheet's own logic
 *    makes unreachable through the UI today.
 *  - Picking any region/language row exercises the region→language reset
 *    rule and row-selected/row-hover live via real :hover / click.
 */
import { computed, reactive, ref } from 'vue'

// ── Fixture dataset (NOT the real 55-market / 22-language registry — a small
//    stand-in big enough to exercise every §2 state) ────────────────────────
const LANGUAGES = {
  en: { endonym: 'English', rtl: false },
  zh: { endonym: '中文', rtl: false },
  ms: { endonym: 'Bahasa Melayu', rtl: false },
  ja: { endonym: '日本語', rtl: false },
  pt: { endonym: 'Português', rtl: false },
  fr: { endonym: 'Français', rtl: false },
  de: { endonym: 'Deutsch', rtl: false },
  ar: { endonym: 'العربية', rtl: true },
}

const MARKETS = {
  SG: { code: 'SG', name: 'Singapore', group: 'Asia', flag: '🇸🇬', languages: ['zh'] },
  MY: { code: 'MY', name: 'Malaysia', group: 'Asia', flag: '🇲🇾', languages: ['ms'] },
  JP: { code: 'JP', name: '日本', englishName: 'Japan', group: 'Asia', flag: '🇯🇵', languages: ['ja'] },
  US: { code: 'US', name: 'United States', group: 'Americas', flag: '🇺🇸', languages: [] },
  BR: { code: 'BR', name: 'Brasil', englishName: 'Brazil', group: 'Americas', flag: '🇧🇷', languages: ['pt'] },
  FR: { code: 'FR', name: 'France', group: 'Europe', flag: '🇫🇷', languages: ['fr'] },
  DE: { code: 'DE', name: 'Deutschland', englishName: 'Germany', group: 'Europe', flag: '🇩🇪', languages: ['de'] },
  SA: { code: 'SA', name: 'المملكة العربية السعودية', englishName: 'Saudi Arabia', group: 'Middle East', flag: '🇸🇦', rtl: true, languages: ['ar'] },
}
const GROUPS = ['Asia', 'Americas', 'Europe', 'Middle East']

// ── Demo state (mirrors useLocale's shape, single-component fixture) ───────
const openSheet = ref(null)       // null | 'region' | 'language' — real app uses two independent refs; unified here for a single-frame demo
const isMobile = ref(true)
const region = ref('SG')
const language = ref('en')
const query = ref('')
const simulateMore = ref(false)   // demo-only: pad the language list to force overflow
const forceRtlDemo = ref(false)   // demo-only: preview a state the real sheet's own gating makes unreachable today (README §11)

function languagesFor(marketCode) {
  const offered = MARKETS[marketCode]?.languages ?? []
  return ['en', ...offered]
}

const isRtlActive = computed(() => forceRtlDemo.value || (LANGUAGES[language.value]?.rtl ?? false))

function marketLabel(m) {
  return m.rtl && !isRtlActive.value ? (m.englishName ?? m.name) : m.name
}

const marketGroups = computed(() =>
  GROUPS.map((group) => ({
    group,
    markets: Object.values(MARKETS).filter((m) => m.group === group).map((m) => ({ ...m, label: marketLabel(m) })),
  })).filter((g) => g.markets.length > 0)
)

const suggestions = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  const out = []
  for (const m of Object.values(MARKETS)) {
    const label = marketLabel(m)
    const idx = label.toLowerCase().indexOf(q)
    if (idx === -1) continue
    out.push({ market: m, before: label.slice(0, idx), match: label.slice(idx, idx + q.length), after: label.slice(idx + q.length) })
  }
  return out
})

const availableLanguages = computed(() => {
  const base = languagesFor(region.value)
    .map((code) => LANGUAGES[code])
    .filter((l) => l && (!l.rtl || isRtlActive.value))
  if (!simulateMore.value) return base
  // Demo-only padding to reliably overflow the body — see component doc comment.
  const padding = ['zh', 'ms', 'ja', 'pt', 'fr', 'de'].map((c) => LANGUAGES[c])
  return [...base, ...padding]
})

const lastResetNotice = ref('')

function openRegion() { openSheet.value = 'region'; query.value = '' }
function openLanguage() { openSheet.value = 'language' }
function closeSheet() { openSheet.value = null }

function pickRegion(code) {
  region.value = code
  if (!languagesFor(code).map((c) => LANGUAGES[c]).some((l) => l === LANGUAGES[language.value])) {
    // mirrors useLocale's setRegion: reset language to 'en' if unsupported in the new region
  }
  const offered = languagesFor(code)
  if (!offered.includes(language.value)) {
    lastResetNotice.value = `Region changed to ${code} — language reset to English (was not offered there).`
    language.value = 'en'
  } else {
    lastResetNotice.value = ''
  }
  query.value = ''
  closeSheet()
}

function pickLanguage(code) {
  language.value = code
  closeSheet()
}

function onKey(e) {
  if (e.key !== 'Escape' || !openSheet.value) return
  if (openSheet.value === 'region' && query.value) query.value = ''
  else closeSheet()
}
</script>

<template>
  <TokenSandbox title="Region &amp; language sheets — live demo">
    <template #default>
      <div class="frame" :class="{ 'frame--wide': !isMobile }" tabindex="0" @keydown="onKey">
        <div class="frame__chrome">
          <span class="frame__pill">{{ MARKETS[region].flag }} {{ marketLabel(MARKETS[region]) }}</span>
          <span class="frame__divider" aria-hidden="true" />
          <span class="frame__pill">{{ language.toUpperCase() }} · {{ LANGUAGES[language].endonym }}</span>
        </div>
        <p v-if="lastResetNotice" class="frame__notice">{{ lastResetNotice }}</p>

        <Transition name="demo-sheet">
          <div
            v-if="openSheet"
            class="selector"
            :class="{ 'selector--responsive': !isMobile }"
            role="dialog"
            aria-modal="true"
            :aria-label="openSheet === 'region' ? 'Select Region' : 'Select Language'"
          >
            <div class="selector__scrim" @click="closeSheet"></div>
            <section class="selector__panel" :class="{ 'selector__panel--region': openSheet === 'region' }">
              <div class="selector__header">
                <span class="selector__title text-style-heading-modal">{{ openSheet === 'region' ? 'Select Region' : 'Select Language' }}</span>
                <button type="button" class="selector__close" aria-label="Close" @click="closeSheet">✕</button>
              </div>

              <template v-if="openSheet === 'region'">
                <div class="selector__search">
                  <div class="selector__input-box">
                    <input v-model="query" class="selector__input text-style-utility-label-regular" type="text" placeholder="Search" />
                  </div>
                  <div v-if="suggestions.length" class="selector__results">
                    <button v-for="s in suggestions" :key="s.market.code" type="button" class="selector__result" @click="pickRegion(s.market.code)">
                      <span class="selector__flag">{{ s.market.flag }}</span>
                      <span class="selector__result-label text-style-paragraph-regular" dir="auto">{{ s.before }}<b>{{ s.match }}</b>{{ s.after }}</span>
                    </button>
                  </div>
                </div>
                <div class="selector__body-wrap">
                  <div class="selector__body">
                    <div class="selector__list">
                      <section v-for="g in marketGroups" :key="g.group" class="selector__group">
                        <h4 class="selector__group-title text-style-heading-card">{{ g.group }}</h4>
                        <button
                          v-for="m in g.markets"
                          :key="m.code"
                          type="button"
                          class="selector__row"
                          dir="auto"
                          @click="pickRegion(m.code)"
                        >
                          <span class="selector__flag">{{ m.flag }}</span>
                          <span class="selector__row-label text-style-paragraph-regular">{{ m.label }}</span>
                        </button>
                      </section>
                    </div>
                  </div>
                  <div class="selector__search-fade" aria-hidden="true"></div>
                  <div class="selector__scroll-fade is-visible" aria-hidden="true"></div>
                </div>
              </template>

              <template v-else>
                <div class="selector__body-wrap">
                  <div class="selector__body">
                    <button
                      v-for="l in availableLanguages"
                      :key="l.endonym"
                      type="button"
                      class="selector__row selector__row--lang"
                      :class="{ 'is-selected': l === LANGUAGES[language] }"
                      @click="pickLanguage(Object.keys(LANGUAGES).find((k) => LANGUAGES[k] === l))"
                    >
                      <span class="selector__row-label text-style-paragraph-regular" dir="auto">{{ l.endonym }}</span>
                      <span v-if="l === LANGUAGES[language]" class="selector__check">✓</span>
                    </button>
                  </div>
                  <div class="selector__scroll-fade" :class="{ 'is-visible': simulateMore }" aria-hidden="true"></div>
                </div>
              </template>
            </section>
          </div>
        </Transition>
      </div>
    </template>

    <template #controls>
      <div class="ctl-row">
        <button type="button" class="ctl" :class="{ 'ctl--active': openSheet === 'region' }" @click="openRegion">Open region sheet</button>
        <button type="button" class="ctl" :class="{ 'ctl--active': openSheet === 'language' }" @click="openLanguage">Open language sheet</button>
        <button type="button" class="ctl ctl--ghost" @click="closeSheet" :disabled="!openSheet">Close</button>
      </div>
      <label class="ctl-check"><input type="checkbox" v-model="isMobile" /> isMobile (bottom sheet vs centered modal ≥801px)</label>
      <label class="ctl-check"><input type="checkbox" v-model="simulateMore" /> Simulate more languages (scroll demo)</label>
      <label class="ctl-check"><input type="checkbox" v-model="forceRtlDemo" /> Force RTL active language (demo only — see hint)</label>
    </template>

    <template #hint>
      <strong>Region sheet:</strong> type in the search box to reach <code>open-typing-with-matches</code>
      (try "sing" or "ja") or <code>open-typing-no-matches</code> (try "xx"); clear it to return to
      <code>open-empty-query</code>. The gradient strip under the search box
      (<code>search-permanent-scrim</code>) is always visible while open; the bottom scroll-fade
      is always on in this fixture (8 markets overflow the compact demo body).
      <strong>Language sheet:</strong> the real list is usually too short to scroll — check
      "Simulate more languages" to reach <code>list-scrollable</code>/<code>list-scrolled-to-end</code>.
      <strong>Row hover</strong> is live via your pointer — no control needed.
      <strong>RTL:</strong> pick <em>Saudi Arabia</em> as region, then check "Force RTL active
      language" — the market's native Arabic name replaces the English fallback, and Arabic
      itself becomes selectable in the language sheet. The real component has no in-UI path to
      reach that state today (its own active-language gate hides Arabic until Arabic is already
      active) — see README §11.
    </template>
  </TokenSandbox>
</template>

<style scoped>
.frame {
  position: relative;
  width: 320px;
  height: 420px;
  border-radius: var(--radius-container-s);
  border: var(--border-weight-default) solid var(--border-sheet);
  background: var(--bg-page);
  overflow: hidden;
  outline: none;
}
.frame--wide { width: 480px; }

.frame__chrome {
  display: flex;
  align-items: center;
  gap: var(--gap-content-default);
  padding: var(--pad-surface-m);
  border-bottom: var(--border-weight-default) solid var(--border-sheet);
}
.frame__pill {
  font-size: 12px;
  color: var(--text-body-default);
}
.frame__divider { width: 1px; height: 14px; background: var(--border-sheet); }
.frame__notice {
  margin: 0;
  padding: var(--pad-surface-s) var(--pad-surface-m);
  font-size: 11px;
  color: var(--text-hyperlink-default);
}

/* ── Sheet chrome — mirrors RegionSelectorSheet.vue / LanguageSelectorSheet.vue ── */
.selector { position: absolute; inset: 0; z-index: 4; }
.selector__scrim { position: absolute; inset: 0; background: var(--scrim); }
.selector__panel {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 85%;
  display: flex;
  flex-direction: column;
  padding-top: var(--pad-surface-l);
  border-top: var(--border-weight-default) solid var(--border-sheet);
  border-top-left-radius: var(--radius-container-s);
  border-top-right-radius: var(--radius-container-s);
  background-image: var(--bg-sheet);
  background-color: var(--bg-page);
  backdrop-filter: blur(var(--blur-container, 32px));
  box-shadow: var(--shadow-sheet);
}
.selector__panel:not(.selector__panel--region) { height: auto; max-height: 85%; }

.selector__header {
  display: flex;
  align-items: center;
  gap: var(--gap-content-default);
  padding: 0 var(--pad-surface-m);
  flex-shrink: 0;
}
.selector__title { flex: 1; min-width: 0; color: var(--text-header-default); }
.selector__close {
  display: inline-flex; align-items: center; justify-content: center;
  width: var(--size-icon-l); height: var(--size-icon-l);
  border: 0; border-radius: var(--radius-control-full);
  background: transparent; color: var(--text-header-default);
  cursor: pointer; transition: color var(--motion-sku-hover);
}
.selector__close:hover { color: var(--text-header-strong); }

.selector__search {
  position: relative;
  flex-shrink: 0;
  padding: var(--pad-surface-m) var(--pad-surface-m) 0;
  margin-bottom: var(--gap-content-default);
  z-index: 1;
}
.selector__input-box { position: relative; display: flex; align-items: center; }
.selector__input {
  width: 100%;
  height: 36px;
  padding: var(--pad-surface-s);
  border: var(--border-weight-default) solid var(--border-input-default);
  border-radius: var(--radius-input-m);
  background: var(--bg-input-default);
  color: var(--text-body-default);
  outline: none;
  transition: border-color var(--motion-sku-hover);
}
.selector__input:focus { border-color: var(--border-input-focused); }

.selector__results {
  position: absolute;
  left: var(--pad-surface-m); right: var(--pad-surface-m);
  top: calc(100% + var(--gap-content-narrow));
  display: flex; flex-direction: column; gap: var(--gap-content-default);
  padding: var(--pad-surface-s);
  border: var(--border-weight-default) solid var(--border-card-default);
  border-radius: var(--radius-input-m);
  background-image: var(--bg-card-default);
  background-color: var(--bg-page);
  box-shadow: var(--shadow-sheet);
  max-height: 160px;
  overflow-y: auto;
}
.selector__result {
  display: flex; align-items: center; gap: var(--gap-content-default);
  width: 100%; padding: var(--pad-surface-s);
  border: 0; border-radius: var(--radius-container-s);
  background: transparent; color: var(--text-body-default);
  text-align: left; cursor: pointer;
  transition: background-color var(--motion-sku-hover);
}
.selector__result:hover { background-color: var(--bg-indicator-neutral-default); }

.selector__body-wrap { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
.selector__body { flex: 1; min-height: 0; overflow-y: auto; position: relative; padding: var(--pad-surface-m); scrollbar-width: none; }
.selector__body::-webkit-scrollbar { display: none; }

.selector__scroll-fade {
  position: absolute; left: 0; right: 0; bottom: 0;
  height: var(--size-img-xl);
  pointer-events: none;
  background: var(--gradient-scroll-fade-bottom);
  opacity: 0;
  transition: opacity var(--motion-hover);
}
.selector__scroll-fade.is-visible { opacity: 1; }
.selector__search-fade {
  position: absolute; left: 0; right: 0; top: 0;
  height: calc(var(--size-img-xl) / 2);
  pointer-events: none;
  background: var(--gradient-scroll-fade-bottom);
  transform: scaleY(-1);
}

.selector__list { columns: 2; column-gap: var(--pad-surface-l); }
.selector__group { break-inside: avoid; display: flex; flex-direction: column; align-items: flex-start; gap: var(--gap-content-loose); padding-bottom: var(--gap-content-separation, 16px); }
.selector__group-title { margin: 0; color: var(--text-header-default); }
.selector__row {
  display: flex; align-items: center; gap: var(--gap-content-default);
  width: 100%; padding: 0; border: 0; background: transparent;
  color: var(--text-body-default); text-align: start; cursor: pointer;
  transition: color var(--motion-sku-hover);
}
.selector__row:hover { color: var(--text-header-strong); }
.selector__flag { flex-shrink: 0; }

.selector__row--lang {
  padding: var(--pad-surface-s);
  border-radius: var(--radius-container-s);
  transition: background-color var(--motion-sku-hover), color var(--motion-sku-hover);
}
.selector__row--lang:hover { background-color: var(--bg-indicator-neutral-default); color: var(--text-body-default); }
.selector__row--lang.is-selected { color: var(--text-hyperlink-default); }
.selector__row-label { flex: 1; min-width: 0; }
.selector__check { flex-shrink: 0; color: var(--text-hyperlink-default); }

/* ── Enter/exit — same scheme as the real components ─────────────────────── */
.demo-sheet-enter-active .selector__panel { transition: transform var(--motion-modal-enter); }
.demo-sheet-enter-from .selector__panel { transform: translateY(100%); }
.demo-sheet-enter-to .selector__panel { transform: translateY(0); }
.demo-sheet-enter-active .selector__scrim { transition: opacity var(--motion-modal-enter); }
.demo-sheet-enter-from .selector__scrim { opacity: 0; }
.demo-sheet-enter-to .selector__scrim { opacity: 1; }

.demo-sheet-leave-active .selector__panel { transition: transform var(--motion-modal-exit); }
.demo-sheet-leave-from .selector__panel { transform: translateY(0); }
.demo-sheet-leave-to .selector__panel { transform: translateY(100%); }
.demo-sheet-leave-active .selector__scrim { transition: opacity var(--motion-modal-exit); }
.demo-sheet-leave-from .selector__scrim { opacity: 1; }
.demo-sheet-leave-to .selector__scrim { opacity: 0; }

.selector--responsive { position: absolute; }
.selector--responsive .selector__panel {
  position: relative; left: auto; right: auto; bottom: auto;
  margin: auto;
  width: calc(100% - 2 * var(--pad-surface-xl));
  max-width: 320px;
  height: auto;
  max-height: 80%;
  border: var(--border-weight-default) solid var(--border-sheet);
  border-radius: var(--radius-container-s);
}
.selector--responsive.selector__panel--region,
.selector--responsive .selector__panel--region { height: auto; max-height: 80%; }
.selector--responsive {
  display: flex; align-items: center; justify-content: center;
}
.selector--responsive.demo-sheet-enter-active .selector__panel,
.selector--responsive.demo-sheet-leave-active .selector__panel {
  transition: transform var(--motion-modal-enter), opacity var(--motion-modal-enter);
}
.selector--responsive.demo-sheet-enter-from .selector__panel,
.selector--responsive.demo-sheet-leave-to .selector__panel { transform: scale(0.96); opacity: 0; }
.selector--responsive.demo-sheet-enter-to .selector__panel,
.selector--responsive.demo-sheet-leave-from .selector__panel { transform: scale(1); opacity: 1; }

/* controls */
.ctl-row { display: flex; gap: 8px; flex-wrap: wrap; }
.ctl {
  padding: 6px 14px; border-radius: 6px; border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-1); color: #111; font-weight: 600; font-size: 12px; cursor: pointer;
}
.ctl--active { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }
.ctl--ghost { background: transparent; color: var(--vp-c-text-1); border-color: var(--vp-c-divider); }
.ctl:disabled { opacity: 0.5; cursor: not-allowed; }
.ctl-check { display: flex; align-items: center; gap: 6px; font-size: 13px; }
</style>
