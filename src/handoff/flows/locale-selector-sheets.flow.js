/**
 * locale-selector-sheets — proof-of-concept migration of
 * docs/Handoff/locale-selector-sheets/README.md into the in-app handoff
 * framework. Structure (states, transitions, choreography, token NAMES) is
 * transcoded from that spec's §1.1/§2/§3; every resolved VALUE below is read
 * live via resolve.js instead — this file intentionally contains none.
 *
 * Components read their open/visible state from the useLocale() singleton
 * rather than a prop, so each entry's onStage()/offStage() prime that state
 * for the ComponentStage demo (mirrors src/library/story.js's setup/teardown).
 */
import { defineFlow } from '../flow.js'
import RegionSelectorSheet from '../../components/RegionSelectorSheet.vue'
import LanguageSelectorSheet from '../../components/LanguageSelectorSheet.vue'
import { useLocale } from '../../composables/useLocale.js'

export default defineFlow({
  slug: 'locale-selector-sheets',
  title: 'Locale Selector Sheets',
  summary: 'Region & language picker sheets — searchable market list + flat language list.',

  components: [
    {
      id: 'RegionSelectorSheet',
      component: RegionSelectorSheet,
      props: { isMobile: true },
      source: 'src/components/RegionSelectorSheet.vue',
      notes: 'Searchable, continent-grouped market picker. Search never filters the visible list — it opens a separate floating typeahead card.',
      tokens: [
        '--x-scrim', '--x-bg-sheet', '--x-bg-page', '--x-border-sheet',
        '--x-text-header-default', '--x-text-header-strong', '--x-text-body-default', '--x-text-placeholder',
        '--x-border-input-default', '--x-border-input-focused', '--x-bg-input-default',
        '--x-bg-card-default', '--x-border-card-default', '--x-bg-indicator-neutral-default',
        '--x-gradient-scroll-fade-bottom',
        '--x-pad-surface-l', '--x-pad-surface-m', '--x-pad-surface-s', '--x-pad-surface-xl',
        '--x-gap-content-default', '--x-gap-content-narrow', '--x-gap-content-loose', '--x-gap-content-separation',
        '--x-radius-container-s', '--x-radius-input-m', '--x-radius-control-full',
        '--x-size-icon-l', '--x-size-icon-m', '--x-size-img-xl', '--border-weight-default',
        '--x-shadow-sheet', '--x-blur-container',
        '--x-motion-modal-enter', '--x-motion-modal-exit', '--x-motion-sku-hover', '--x-motion-hover', '--x-motion-ripple',
      ],
      onStage: () => { useLocale().openRegionSelector() },
      offStage: () => { useLocale().closeRegionSelector() },
    },
    {
      id: 'LanguageSelectorSheet',
      component: LanguageSelectorSheet,
      props: { isMobile: true },
      source: 'src/components/LanguageSelectorSheet.vue',
      notes: 'Flat list of languages available in the current region. Selected row shows a check icon + hyperlink tint — no border ring or fill.',
      tokens: [
        '--x-scrim', '--x-bg-sheet', '--x-bg-page', '--x-border-sheet',
        '--x-text-header-default', '--x-text-body-default', '--x-text-hyperlink-default',
        '--x-bg-indicator-neutral-default', '--x-gradient-scroll-fade-bottom',
        '--x-pad-surface-l', '--x-pad-surface-m', '--x-pad-surface-s',
        '--x-gap-content-default',
        '--x-radius-container-s', '--x-radius-control-full',
        '--x-size-icon-l', '--x-size-icon-s', '--x-size-img-xl', '--border-weight-default',
        '--x-shadow-sheet', '--x-blur-container',
        '--x-motion-modal-enter', '--x-motion-modal-exit', '--x-motion-sku-hover', '--x-motion-hover', '--x-motion-ripple',
      ],
      onStage: () => { useLocale().openLanguageSelector() },
      offStage: () => { useLocale().closeLanguageSelector() },
    },
  ],

  // §2.1.a + §2.2.a state inventories. Ids are mermaid-safe (underscore, no
  // colon — mermaid's edge-label syntax uses ':' as a delimiter, and
  // stateChart below must reference these SAME ids so a diagram-node click
  // and a state-card click select the identical state) but otherwise track
  // the spec's own state names 1:1 for review.
  states: [
    { id: 'region_closed', desc: 'Not rendered.', entry: 'initial mount / any close action', exit: 'regionSelectorOpen set true' },
    { id: 'region_open_empty_query', desc: 'Search empty, placeholder visible, full grouped list visible, no typeahead card.', entry: 'sheet opens (query resets to \'\')', exit: 'user types a character' },
    { id: 'region_open_typing_with_matches', desc: 'Floating typeahead card renders above the unchanged grouped list; matched substring bolded.', entry: 'query non-empty and ≥1 market matches', exit: 'query cleared / Escape / a match picked / sheet closes' },
    { id: 'region_open_typing_no_matches', desc: 'Typeahead card does not render; grouped list still visible; no "no results" message.', entry: 'query non-empty and 0 markets match', exit: 'same as above' },
    { id: 'region_row_hover', desc: 'Row label text-colour shifts (list) or result row background tints (typeahead). Pointer-fine only.', entry: 'pointer over a row/result', exit: 'pointer leaves' },
    { id: 'region_list_scrollable', desc: 'Bottom scroll-fade opacity 0→1.', entry: 'grouped list content overflows the body', exit: 'content no longer overflows' },
    { id: 'region_list_scrolled_to_end', desc: 'Bottom scroll-fade opacity 1→0.', entry: 'scrolled within 1px of the end', exit: 'scrolled back up' },
    { id: 'region_search_permanent_scrim', desc: 'Fixed gradient always visible under the search box, regardless of scroll.', entry: 'always, while sheet is open', exit: 'never (not scroll-gated)' },
    { id: 'region_layout_mobile', desc: 'Bottom sheet, 85% viewport height, position: absolute.', entry: 'isMobile === true', exit: 'prop flips to false' },
    { id: 'region_layout_responsive', desc: 'Centered modal, max-width 560px, max-height 80vh, position: fixed.', entry: 'isMobile === false and viewport ≥ 801px', exit: 'prop flips or viewport narrows' },

    { id: 'language_closed', desc: 'Not rendered.', entry: 'initial mount / any close action', exit: 'languageSelectorOpen set true' },
    { id: 'language_open', desc: 'Flat list of availableLanguages renders.', entry: 'openLanguageSelector()', exit: 'any close trigger' },
    { id: 'language_row_default', desc: 'Plain row, no check icon.', entry: 'row not currently selected', exit: 'selected, hover, or press' },
    { id: 'language_row_selected', desc: 'Row tinted --x-text-hyperlink-default, trailing check_circle icon (16px), aria-pressed="true".', entry: 'l.code === language', exit: 'a different row is picked' },
    { id: 'language_row_hover', desc: 'Row background tints. Pointer-fine only.', entry: 'pointer over any row', exit: 'pointer leaves' },
    { id: 'language_list_scrollable', desc: 'Bottom scroll-fade opacity 0→1.', entry: 'availableLanguages overflows the body', exit: 'no longer overflows' },
    { id: 'language_list_scrolled_to_end', desc: 'Bottom scroll-fade opacity 1→0.', entry: 'scrolled within 1px of the end', exit: 'scrolled back up' },
    { id: 'language_layout_mobile', desc: 'Bottom sheet, content-height up to 85%, position: absolute.', entry: 'isMobile === true', exit: 'prop flips' },
    { id: 'language_layout_responsive', desc: 'Centered modal, max-width 420px, max-height 80vh, position: fixed.', entry: 'isMobile === false and viewport ≥ 801px', exit: 'prop flips or viewport narrows' },
  ],

  // §2.1.b + §2.2.b transitions, condensed to the state-diff-relevant ones.
  transitions: [
    { from: 'region_closed', to: 'region_open_empty_query', trigger: 'openRegionSelector() called by a trigger surface', motion: ['--x-motion-modal-enter'] },
    { from: 'region_open_empty_query', to: 'region_closed', trigger: 'row pick / scrim tap / close button', motion: ['--x-motion-modal-exit'] },
    { from: 'region_open_typing_with_matches', to: 'region_open_empty_query', trigger: 'Escape (1st press, query non-empty)' },
    { from: 'region_open_empty_query', to: 'region_closed', trigger: 'Escape (2nd press, query already empty)', motion: ['--x-motion-modal-exit'] },
    { from: 'region_open_empty_query', to: 'region_open_typing_with_matches', trigger: 'keystroke with ≥1 match' },
    { from: 'region_open_empty_query', to: 'region_open_typing_no_matches', trigger: 'keystroke with 0 matches' },
    { from: 'region_list_scrollable', to: 'region_list_scrolled_to_end', trigger: 'scroll to within 1px of end', motion: ['--x-motion-hover'] },

    { from: 'language_closed', to: 'language_open', trigger: 'openLanguageSelector()', motion: ['--x-motion-modal-enter'] },
    { from: 'language_open', to: 'language_closed', trigger: 'row pick / scrim tap / close button / Escape', motion: ['--x-motion-modal-exit'] },
    { from: 'language_row_default', to: 'language_row_selected', trigger: 'setLanguage(code) commits', motion: ['--x-motion-sku-hover'] },
    { from: 'language_list_scrollable', to: 'language_list_scrolled_to_end', trigger: 'scroll to within 1px of end', motion: ['--x-motion-hover'] },
  ],

  // §1.1 choreography timeline.
  choreography: [
    { beat: 'Trigger fires; *SelectorOpen.value = true', delayMs: 0, duration: '--x-motion-sys-duration-instant', easing: '--x-motion-sys-ease-standard', target: 'singleton state' },
    { beat: 'Scrim fades in, panel slides/scales in', delayMs: 0, duration: '--x-motion-sys-duration-slow', easing: '--x-motion-sys-ease-decelerate', target: 'scrim + panel' },
    { beat: 'Entrance complete; sheet fully interactive', delayMs: 350, duration: '--x-motion-sys-duration-instant', easing: '--x-motion-sys-ease-standard', target: 'sheet' },
    { beat: 'Scrim fades out, panel slides/scales out (on close)', delayMs: 0, duration: '--x-motion-sys-duration-exit', easing: '--x-motion-sys-ease-accelerate', target: 'scrim + panel' },
    { beat: 'Sheet unmounted', delayMs: 200, duration: '--x-motion-sys-duration-instant', easing: '--x-motion-sys-ease-standard', target: 'v-if false' },
  ],

  flowChart: `flowchart LR
    trigger["NavBar pill / NavDrawer footer / Footer link"] --> open["openRegionSelector() / openLanguageSelector()"]
    open --> sheet["Sheet mounts (350ms enter)"]
    sheet --> pick["User taps a row"]
    pick --> commit["setRegion()/setLanguage() — commits + closes synchronously"]
    commit --> exit["Sheet unmounts (200ms exit)"]`,

  stateChart: `stateDiagram-v2
    [*] --> region_closed
    region_closed --> region_open_empty_query: openRegionSelector
    region_open_empty_query --> region_open_typing_with_matches: keystroke, has matches
    region_open_empty_query --> region_open_typing_no_matches: keystroke, no matches
    region_open_typing_with_matches --> region_open_empty_query: Escape, clear query
    region_open_typing_no_matches --> region_open_empty_query: Escape, clear query
    region_open_empty_query --> region_closed: row pick, scrim tap, or close button
    region_open_typing_with_matches --> region_closed: row pick
    region_open_typing_no_matches --> region_closed: scrim tap or close button`,

  notes: {
    rationale: 'Both sheets share one singleton (useLocale.js) and one transition scheme (name="sheet", 350ms decelerate enter, 200ms accelerate exit) — the house rule for every sheet in the app. Migrated here to validate the in-app handoff framework against the most complete existing hand-written spec.',
    gotchas: [
      'The region search input never filters the visible list — it opens a separate floating typeahead card, so "0 matches" and "no results message" are deliberately different states.',
      'Picking any row both commits the selection AND closes the sheet in the same handler — there is no confirm step.',
      'Picking a region that doesn’t offer the current language silently resets language to ‘en’, even though LanguageSelectorSheet is closed at the time.',
      'RTL market native names substitute to englishName while the active UI language is itself LTR (useLocale.js) — do not treat this as a rendering bug.',
    ],
    openQuestions: [],
    buildOrder: [
      'T1 — static structure + both layout modes (no motion, no search, no selection).',
      'T2 — selection, hover/press, and the region→language reset rule.',
      'T3 — region search & typeahead.',
      'T4 — scroll scrims, entrance/exit motion, RTL handling.',
    ],
    prohibitions: [
      'Never hardcode a resolved literal that has a token above — this framework exists precisely so resolved values are read live, never transcribed.',
      'Never add a confirm step between picking a row and closing — the reference has none.',
      'Never add a "no results" message to the region search — the full list staying visible IS the fallback.',
    ],
  },
})
