---
handoff: locale-selector-sheets
title: Language & Region Selector Sheets — Localisation Handoff
status: ready
prototype_version: v0.53.1
last_updated: 2026-08-06
stores: [codm]
reference_impl:
  orchestrator: src/composables/useLocale.js
  surfaces:
    - src/components/RegionSelectorSheet.vue
    - src/components/LanguageSelectorSheet.vue
  supporting:
    - src/composables/useBottomFade.js
    - src/locale/languages.js
    - src/locale/markets.js
    - src/locale/sets.js
    - src/locale/uiStrings.js
components: [RegionSelectorSheet, LanguageSelectorSheet]
states: 19
token_contract:
  colour: [--scrim, --bg-sheet, --bg-page, --border-sheet, --text-header-default, --text-header-strong, --text-body-default, --text-placeholder, --text-hyperlink-default, --border-input-default, --border-input-focused, --bg-input-default, --bg-card-default, --border-card-default, --bg-indicator-neutral-default, --gradient-scroll-fade-bottom]
  typography: [.text-style-heading-modal, .text-style-heading-card, .text-style-paragraph-regular, .text-style-utility-label-regular]
  spacing: [--pad-surface-l, --pad-surface-m, --pad-surface-s, --pad-surface-xl, --gap-content-default, --gap-content-narrow, --gap-content-loose, --gap-content-separation]
  radius: [--radius-container-s, --radius-input-m, --radius-control-full]
  size: [--size-icon-l, --size-icon-m, --size-icon-s, --size-img-xl, --border-weight-default]
  effects: [--shadow-sheet, --blur-container]
  motion: [--motion-modal-enter, --motion-modal-exit, --motion-sku-hover, --motion-hover, --motion-ripple, --motion-sys-duration-slow, --motion-sys-duration-exit, --motion-sys-duration-fast, --motion-sys-ease-decelerate, --motion-sys-ease-accelerate, --motion-sys-ease-standard]
demo_url:
blocking_questions: 0
---

# Language & Region Selector Sheets — Localisation Handoff

> Two sibling overlay sheets that let the user change the active store region
> (market) and display language: `RegionSelectorSheet.vue` (a searchable,
> continent-grouped market picker) and `LanguageSelectorSheet.vue` (a flat list
> of the languages available in the current region). Both are opened from three
> equivalent trigger points and read/write the same singleton state.
>
> **Scope:** the COD:M store's locale set (22 languages / 55 markets) and its
> theme values. The sheets themselves are store-agnostic — every other
> whitelabel store (FCM, TDR, Codashop-fallback) renders the identical
> components against its own `LOCALE_SETS` entry (see §2.3.c) and theme tokens;
> this doc resolves colour/typography values against the COD:M theme only.
> There is no sibling *interaction* flow to exclude — both sheets are fully
> covered here.
>
> **Last updated:** 2026-08-06 · tracks prototype v0.53.1.

---

## 0. Agent brief — read this first

**The prototype is a reference implementation, not a patch target.** The
production codebase is not 1:1 with it: different repo, different component
names, different design-system plumbing. Do not copy `.vue` files or assume
the prototype's architecture.

What you must reproduce, in your own stack:

1. **The state machine** — §2. Every state, every transition, every edge case.
2. **The token contract** — §3. Every value by *semantic role*, mapped to your
   system's equivalent token. Never a hardcoded literal.

**Read order:** load the relevant authoring skill → §2 (states) → §3 (tokens) →
your assigned task in §8 → verify with §10.

**Normative vs illustrative.** Tables in §2 and §3 are normative — build to
them. Quoted CSS and ASCII diagrams show *how the prototype did it* and are
illustrative only; an equivalent technique in your stack is correct.

**Stop conditions.** If a value is not in §2/§3, grep the cited reference
file. If it is still absent, it is an open question in §11 — **stop and ask a
human.** Do not infer a colour, duration, or behaviour that isn't specified.

---

## 1. The flow at a glance *(orientation — illustrative)*

Both sheets are driven by one singleton composable,
[`useLocale.js`](../../../src/composables/useLocale.js), which owns the
`region`/`language` selection, the two `*SelectorOpen` refs, and every derived
list the sheets render. Neither sheet owns state itself — each is a `v-if` on
its open ref, closed by picking a row, clicking the scrim, pressing Escape, or
tapping the close button.

```
Trigger (NavBar pill / NavDrawer footer row / Footer link)
   → openRegionSelector() or openLanguageSelector()   [useLocale.js]
   → regionSelectorOpen / languageSelectorOpen = true
   → <Transition name="sheet"> mounts the sheet          (350ms slide/scale-in)
        Region sheet: typing in the search box shows a floating
        typeahead card; the full grouped list beneath never filters.
   → user taps a row → setRegion(code) / setLanguage(code)  [useLocale.js]
        - setRegion: if the new region doesn't offer the current
          language, language resets to 'en'
        - both persist the selection to localStorage
   → close*Selector() → sheet unmounts                    (200ms slide/scale-out)
```

### 1.1 Choreography timeline (normative for timing)

| t (ms) | Event | Token | Reference |
|---|---|---|---|
| 0 | Trigger fires; `*SelectorOpen.value = true` | — | `useLocale.js:160,162` |
| 0 | Scrim fades in, panel slides up from `translateY(100%)` (mobile) or scales in from `0.96`/`opacity:0` (responsive ≥801px) | `--motion-modal-enter` (350ms, decelerate) | `RegionSelectorSheet.vue:391-397,432-445`; `LanguageSelectorSheet.vue:214-220,253-266` |
| 350 | Entrance complete; sheet fully interactive | — | — |
| — (any time while open) | Row tap → `setRegion`/`setLanguage`, then `close*Selector()` called synchronously in the same handler | — | `RegionSelectorSheet.vue:57-61`; `LanguageSelectorSheet.vue:24-27` |
| 0 (from close) | Scrim fades out, panel slides down / scales out | `--motion-modal-exit` (200ms, accelerate) | same CSS blocks as above, `.sheet-leave-*` rules |
| 200 | Sheet unmounted (`v-if` becomes false) | — | — |

> **Why exit is faster than enter.** This is the house rule for every sheet in
> the app (`CheckoutSheet`, `SignInSheet`, both selectors): entrances
> decelerate over 350ms so the surface reads as arriving deliberately; exits
> accelerate and are almost half the duration (200ms) because the user has
> already acted and the UI should get out of the way quickly. There is no
> extra pause between "pick a row" and "close" — selection and dismissal are
> the same user action, so the close animation starts immediately, with no
> intermediate "confirming" state.

---

## 2. State & behaviour matrix *(normative)*

### 2.1 RegionSelectorSheet

#### 2.1.a State inventory

| State | Entered when | Exits when | Observable change | Tokens (→ §3) |
|---|---|---|---|---|
| `closed` | initial mount; any close action | `regionSelectorOpen` set true | not rendered (`v-if` false) | — |
| `open-empty-query` | sheet opens (query is reset to `''` on every open) | user types a character | search input empty, placeholder visible, no typeahead card, full grouped list visible | `--text-placeholder` |
| `open-typing-with-matches` | `query` non-empty and ≥1 market label contains the normalized substring | query cleared, Escape, a match picked, or sheet closes | floating typeahead card renders above the (unchanged) grouped list; each match shows a flag + label with the matched substring bolded | `--bg-card-default`, `--border-card-default`, `--shadow-sheet` |
| `open-typing-no-matches` | `query` non-empty and 0 markets match | same as above | typeahead card does not render (`suggestions.length === 0`); grouped list still visible, no "no results" message | — |
| `row-hover` (pointer-fine only) | pointer over a market row or typeahead result | pointer leaves | row label text-colour shifts (list row) or result row background tints (typeahead row) | `--text-header-strong` (list row) / `--bg-indicator-neutral-default` (typeahead row) |
| `list-scrollable` | grouped list content overflows `.selector__body` | content no longer overflows (rare — market list is fixed per region) | bottom scroll-fade opacity 0→1 | `--gradient-scroll-fade-bottom`, `--motion-hover` |
| `list-scrolled-to-end` | user scrolls list to within 1px of its end | user scrolls back up | bottom scroll-fade opacity 1→0 | same as above |
| `search-permanent-scrim` | always, whenever the sheet is open | never (not gated on scroll) | a fixed gradient sits flush under the search box, fading into the list — always visible regardless of scroll position | `--gradient-scroll-fade-bottom` |
| `layout-mobile` | `isMobile` prop is `true` | prop flips to `false` | bottom sheet, 85% viewport height, `position: absolute` | — |
| `layout-responsive` | `isMobile` prop is `false` **and** viewport ≥ 801px | prop flips to `true`, or viewport narrows | centered modal, `max-width: 560px`, `max-height: 80vh`, `position: fixed` | — |

- **Mutually exclusive:** `open-empty-query`, `open-typing-with-matches`, `open-typing-no-matches` (exactly one applies whenever the sheet is open). `layout-mobile` and `layout-responsive` are mutually exclusive.
- **Combinable:** any query state combines freely with `list-scrollable`/`list-scrolled-to-end` and with either layout state. `row-hover` only applies while `pointer: fine` (no touch hover state — see §6).
- **Default on mount:** `closed`. When opened, always resets to `open-empty-query` regardless of the previous session's query (§2.1.d).

#### 2.1.b Transitions

| From → To | Trigger | Guard / gate | Animates | Duration · Easing |
|---|---|---|---|---|
| `closed → open-empty-query` | `openRegionSelector()` called by a trigger surface | none | scrim opacity, panel transform | `--motion-modal-enter` (350ms · decelerate) |
| `open-* → closed` (row pick) | tap a grouped-list row or a typeahead result | none | same as above, reverse | `--motion-modal-exit` (200ms · accelerate) |
| `open-* → closed` (scrim tap) | click on `.selector__scrim` | none | same | `--motion-modal-exit` |
| `open-* → closed` (close button) | tap `.selector__close` | none | same | `--motion-modal-exit` |
| `open-typing-* → open-empty-query` (Escape, 1st press) | `Escape` keydown, guarded to only fire while the sheet is open | `query` non-empty | search input clears; typeahead card unmounts | instant (no transition) |
| `open-empty-query → closed` (Escape, 2nd press / only press if query already empty) | `Escape` keydown | `query` is empty | same as scrim-tap close | `--motion-modal-exit` |
| `open-empty-query → open-typing-with-matches` / `open-typing-no-matches` | keystroke in the search input | none (any keystroke re-evaluates) | typeahead card mounts/updates | instant (no transition on the card's appearance itself) |
| any → `list-scrollable`/`list-scrolled-to-end` | scroll event or `ResizeObserver` fire on the body | — | scroll-fade `opacity` | `--motion-hover` (150ms) |

#### 2.1.c Props / variants contract

| Prop | Type | Default | Allowed values | Unlocks state |
|---|---|---|---|---|
| `isMobile` | `Boolean` | `true` | `true \| false` | `layout-mobile` vs `layout-responsive` |

No other props. All content (markets, groups, selected region, UI copy) comes
from `useLocale()` — the component takes no data props. Graceful-absent: if a
store's `LOCALE_SETS` entry lists only one region (not currently the case for
any store, but structurally possible), `marketGroups` would resolve to a
single group with a single row — the sheet still renders correctly, just with
one selectable option; there is no "hide the sheet if only one region" branch,
so the picker remains reachable even when trivial.

#### 2.1.d Edge cases & invariants

- **Empty data** — if `marketGroups` is empty (a store's `LOCALE_SETS.markets`
  resolves to zero valid `MARKETS` entries), the `.selector__list` renders no
  `<section>`s and no empty-state message; this is an unreached configuration
  in every current store and is not a designed state — flag any store hitting
  it as a data bug, not a UI gap.
- **Long copy / localisation** — market native names run through `dir="auto"`
  (`RegionSelectorSheet.vue:146`) so RTL names (e.g. Arabic market names) get
  correct per-string bidi direction inside the LTR shell; RTL market names are
  substituted with `englishName` entirely while the active UI language is LTR
  (`useLocale.js:105-106`) rather than rendered untranslated (see `isRtlActive`
  rule, §5). Continent group headers use `.selector__group` with
  `break-inside: avoid` in the two-column CSS layout so a group is never split
  across columns regardless of name length.
- **Rapid re-trigger** — `openRegionSelector()`/`closeRegionSelector()` are
  plain boolean sets with no debounce or in-flight guard; calling
  `openRegionSelector()` while already open is a no-op (ref already `true`).
  There is no re-entrancy hazard because no async work occurs between open and
  close.
- **Unmount mid-transition** — the `Escape` keydown listener is bound/unbound
  via a `watch` on `regionSelectorOpen` and also removed in `onBeforeUnmount`
  (`RegionSelectorSheet.vue:74-78`), so no listener leaks if the sheet is torn
  down (e.g. store switch) while a transition is in flight.
  `useBottomFade`'s `ResizeObserver`/scroll listener similarly unbind on
  `onBeforeUnmount` (`useBottomFade.js:41-49`).
- **Invariant** — the search query always resets to `''` the instant
  `regionSelectorOpen` flips to `true` (`RegionSelectorSheet.vue:64-66`), so
  reopening the sheet never shows a stale query from a previous session.
- **Invariant** — picking any row always both commits the selection *and*
  closes the sheet in the same handler (`pick()`,
  `RegionSelectorSheet.vue:57-61`) — there is no "confirm" step.

---

### 2.2 LanguageSelectorSheet

#### 2.2.a State inventory

| State | Entered when | Exits when | Observable change | Tokens (→ §3) |
|---|---|---|---|---|
| `closed` | initial mount; any close action | `languageSelectorOpen` set true | not rendered | — |
| `open` | `openLanguageSelector()` called | any close trigger | flat list of `availableLanguages` renders | — |
| `row-default` | any language row not currently selected | selected, hover, or press | plain row, no check icon | `--text-body-default` |
| `row-selected` | `l.code === language` (the active language) | a different row is picked | row text tinted `--text-hyperlink-default`, trailing `check_circle` icon (16px), `aria-pressed="true"` | `--text-hyperlink-default` |
| `row-hover` (pointer-fine only) | pointer over any row | pointer leaves | row background tints | `--bg-indicator-neutral-default` |
| `list-scrollable` | `availableLanguages` overflows `.selector__body` | no longer overflows | bottom scroll-fade opacity 0→1 | `--gradient-scroll-fade-bottom`, `--motion-hover` |
| `list-scrolled-to-end` | scrolled within 1px of the end | scrolled back up | scroll-fade opacity 1→0 | same |
| `layout-mobile` | `isMobile` is `true` | prop flips | bottom sheet, content-height up to 85%, `position: absolute` | — |
| `layout-responsive` | `isMobile` is `false` and viewport ≥ 801px | prop flips or viewport narrows | centered modal, `max-width: 420px`, `max-height: 80vh`, `position: fixed` | — |

- **Mutually exclusive:** `row-default`/`row-selected` per row (exactly one of the two, per row, at all times); `layout-mobile`/`layout-responsive`.
- **Combinable:** `row-selected` + `row-hover` render both treatments simultaneously (tint stacks with hover background). `list-scrollable` combines freely with any row state.
- **Default on mount:** `closed`.

#### 2.2.b Transitions

| From → To | Trigger | Guard / gate | Animates | Duration · Easing |
|---|---|---|---|---|
| `closed → open` | `openLanguageSelector()` | none | scrim opacity, panel transform | `--motion-modal-enter` (350ms · decelerate) |
| `open → closed` (row pick) | tap a language row | none | same, reverse | `--motion-modal-exit` (200ms · accelerate) |
| `open → closed` (scrim tap / close button / Escape) | respective trigger | none | same | `--motion-modal-exit` |
| `row-default → row-selected` | `setLanguage(code)` commits and `language` ref updates | picked code must be in `availableLanguages` (silently no-ops otherwise, see §2.3.d) | icon + colour swap on the newly- and previously-selected rows | instant (no transition on the check icon itself; colour uses `color var(--motion-sku-hover)`, 150ms) |
| any → `list-scrollable`/`list-scrolled-to-end` | scroll / resize on body | — | scroll-fade opacity | `--motion-hover` (150ms) |

#### 2.2.c Props / variants contract

| Prop | Type | Default | Allowed values | Unlocks state |
|---|---|---|---|---|
| `isMobile` | `Boolean` | `true` | `true \| false` | `layout-mobile` vs `layout-responsive` |

No other props — same pattern as `RegionSelectorSheet`. `availableLanguages`
is always non-empty in practice: `languagesFor()` (`useLocale.js:62-66`)
always prepends `'en'`, so even a region with zero store-supported local
languages still resolves to a one-item list (`['en']`). Graceful-absent: no
explicit empty-state branch exists because this floor makes the list
structurally un-emptiable; do not add an "empty" UI for this component.

#### 2.2.d Edge cases & invariants

- **Empty data** — cannot occur (see above); do not design for it.
- **Long copy / localisation** — endonyms render via `dir="auto"`
  (`LanguageSelectorSheet.vue:76`) for correct per-string bidi. RTL languages
  are filtered out of `availableLanguages` entirely while the active language
  is LTR (`useLocale.js:131-135`) — an RTL language never appears as a
  selectable row until the user has already switched to an RTL language,
  at which point RTL rows reappear.
- **Rapid re-trigger** — same as region sheet: no debounce, no async gap,
  reopening while open is a no-op.
- **Unmount mid-transition** — Escape listener bound/unbound via `watch` +
  `onBeforeUnmount` (`LanguageSelectorSheet.vue:33-37`); no leaks.
- **Invariant** — picking a language commits and closes synchronously
  (`pick()`, `LanguageSelectorSheet.vue:24-27`); no confirm step.
- **Invariant (cross-component)** — changing region via `RegionSelectorSheet`
  can silently change the active language (reset to `'en'`) if the previous
  language isn't offered in the new region (`useLocale.js:83-88`). This
  happens even though `LanguageSelectorSheet` is closed at the time — the
  language pill/label anywhere in the app must reflect this reset without the
  language sheet ever having been opened.

---

## 3. Token contract *(normative)*

Values below are resolved against the **COD:M** theme
(`src/tokens/ds/themes/codm.css`) — the reference/default theme in this
prototype. Every other whitelabel store renders these same components against
its own theme file; re-resolve per store if porting to a multi-theme target.

### 3.0 The mapping rule

1. Map each row to the token in *your* system that carries the **same
   semantic role** (`--bg-*` → your background role, `--text-*` → your text
   role, and so on).
2. If your system has no token for that role, **add one**. Do not substitute
   a visually-close existing token — that is how design fidelity is lost.
3. Never hardcode the resolved literal in a component.
4. Never cross tiers: colour tokens for `background`, `color` and
   `border-color` are not interchangeable — the tier encodes contrast
   expectations for that role.
5. Typography only through a type style. Never raw `font-size` /
   `font-weight` / `letter-spacing` in a component.

### 3.1 Colour

| Token | Resolved | Applies to (element · state) |
|---|---|---|
| `--scrim` | `color-mix(in oklab, oklch(0.166 0.017 273.5) 60%, transparent)` | `.selector__scrim` · all states |
| `--bg-sheet` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `.selector__panel` background-image · all states |
| `--bg-page` | `oklch(0.166 0.017 273.5)` | `.selector__panel` background-color (sits under `--bg-sheet`) · all states |
| `--border-sheet` | `oklch(1 0 0 / 0.16)` | `.selector__panel` top border · all states |
| `--text-header-default` | `oklch(0.992 0.003 286.4)` | `.selector__title`, `.selector__close`, `.selector__group-title` · default |
| `--text-header-strong` | `oklch(1 0 0)` | `.selector__close:hover`, `.selector__row:hover` (region list) · `row-hover` |
| `--text-body-default` | `oklch(0.992 0.003 286.4)` | `.selector__input`, `.selector__row-label`, `.selector__result-label` · default |
| `--text-placeholder` | `oklch(0.584 0.008 277.1)` | `.selector__input::placeholder`, `.selector__input-icon` · `open-empty-query` |
| `--text-hyperlink-default` | `oklch(0.919 0.192 101.8)` | `.selector__row.is-selected` (language sheet) · `row-selected` |
| `--border-input-default` | `oklch(0.377 0.010 278.3)` | `.selector__input` border · default |
| `--border-input-focused` | `oklch(0.919 0.192 101.8)` | `.selector__input:focus` border · `focus-visible` |
| `--bg-input-default` | `oklch(0 0 0 / 0.10)` | `.selector__input` background · default |
| `--bg-card-default` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `.selector__results` (typeahead card) background-image · `open-typing-with-matches` |
| `--border-card-default` | `oklch(0.992 0.003 286 / 0.08)` (COD:M-specific override) | `.selector__results` border · `open-typing-with-matches` |
| `--bg-indicator-neutral-default` | `oklch(0.377 0.010 278.3)` | `.selector__result:hover`, `.selector__row:hover` (language sheet) · `row-hover` |
| `--gradient-scroll-fade-bottom` | `linear-gradient(to top, color-mix(in oklab, oklch(0.166 0.017 273.5) 80%, transparent) 0%, transparent 100%)` | `.selector__scroll-fade`, `.selector__search-fade` (flipped via `scaleY(-1)`) · `list-scrollable`, `search-permanent-scrim` |

### 3.2 Typography

| Type style | Size / weight / tracking / line-height / condense | Applies to |
|---|---|---|
| `.text-style-heading-modal` | 20px / 700 / 0.0105em / 1.2 / `scaleX(0.82)` (Hitmarker Text VF) | `.selector__title` |
| `.text-style-heading-card` | 18px / 700 / 0.0105em / 1.2 / `scaleX(0.82)` (Hitmarker Text VF) | `.selector__group-title` (region only) |
| `.text-style-paragraph-regular` | 14px / 400 / 0em / 1.5 / `scaleX(1)` — no condense (Inter, body-pairing override) | `.selector__row-label`, `.selector__result-label` |
| `.text-style-utility-label-regular` | 12px / 400 / 0em / 1 / `scaleX(1)` — no condense (Inter) | `.selector__input` |

> ⚠️ **Condense is part of the type spec.** COD:M's body-font pairing
> (`themes/codm.css:280-288`) repoints body/utility text to Inter and sets
> `--sys-font-condense-body: 1`, so paragraph and utility styles render
> **uncondensed** even though headings (`heading-modal`, `heading-card`) still
> condense at `0.82`. Do not apply the heading condense factor to row labels.

### 3.3 Spacing

| Token | Resolved | Applies to |
|---|---|---|
| `--pad-surface-l` | 16px | `.selector__panel` top padding |
| `--pad-surface-m` | 12px | `.selector__header`, `.selector__search`, `.selector__body` horizontal/inner padding |
| `--pad-surface-s` | 8px | `.selector__input` padding, `.selector__result`/`.selector__row` (language) padding |
| `--pad-surface-xl` | 24px | `.selector__body` bottom padding (scroll clearance) |
| `--gap-content-default` | 8px | `.selector__header` gap, `.selector__results` gap, `.selector__result` gap, `.selector__row` gap (language) |
| `--gap-content-narrow` | 4px | `.selector__results` offset below the input |
| `--gap-content-loose` | 12px | `.selector__group` internal gap (region) |
| `--gap-content-separation` | 16px | `.selector__group` bottom padding (region, fallback value) |

### 3.4 Radius

| Token | Resolved | Applies to (element · state) |
|---|---|---|
| `--radius-container-s` | 8px | `.selector__panel` top corners (mobile) / all corners (responsive), `.selector__result` |
| `--radius-input-m` | 8px | `.selector__input`, `.selector__results` (typeahead card) |
| `--radius-control-full` | 2px (COD:M; angular, not a pill — FCM overrides to 999px, not applicable here) | `.selector__close` |

### 3.5 Size & border weight

| Token | Resolved | Applies to |
|---|---|---|
| `--size-icon-l` | 24px | `.selector__close` hit box |
| `--size-icon-m` | 20px | `.selector__input-icon` (search glyph) |
| `--size-icon-s` | 16px | `check_circle` selected-row icon (language sheet) — passed as a literal `:size="16"` prop on `<MaterialIcon>`, not consumed as a CSS var; map to this token's resolved value in the rebuild |
| `--size-img-xl` | 64px | `.selector__scroll-fade` / `.selector__search-fade` height |
| `--border-weight-default` | 1px | `.selector__panel` top border, `.selector__input` border, `.selector__results` border |

### 3.6 Effects

| Token | Resolved | Applies to |
|---|---|---|
| `--shadow-sheet` | `0 -8px 16px oklch(0.17 0.02 80 / 0.30)` | `.selector__panel`, `.selector__results` |
| `--blur-container` | **32px** (CSS fallback — COD:M defines no token for this role; consumed as `blur(var(--blur-container, 32px))`) | `.selector__panel` `backdrop-filter` |

### 3.7 Motion

| Token | Resolved | Used for |
|---|---|---|
| `--motion-modal-enter` | `350ms cubic-bezier(0, 0, 0.2, 1)` (= `--motion-sys-duration-slow` + `--motion-sys-ease-decelerate`) | Sheet/scrim entrance (both mobile slide and responsive scale+fade) |
| `--motion-modal-exit` | `200ms cubic-bezier(0.4, 0, 1, 1)` (= `--motion-sys-duration-exit` + `--motion-sys-ease-accelerate`) | Sheet/scrim exit |
| `--motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` (= `--motion-sys-duration-fast` + `--motion-sys-ease-standard`) | `.selector__close:hover`, `.selector__row:hover`, `.selector__input:focus` border colour |
| `--motion-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` (identical composition, defined independently) | `.selector__scroll-fade` opacity transition |
| `--motion-ripple` | see [`motion-tokens.md`](../../motion-tokens.md) | `v-ripple` tap-feedback wave on every row and the close button |

**Motion rules that travel with the values:**
- Entrances decelerate (ease-out); permanent exits accelerate (ease-in) and are shorter — see §1.1.
- No spring/overshoot is used anywhere in these two sheets.
- Animate only `transform` and `opacity` on the sheet/scrim hot path.
- ⚠️ Never use the `transition`/`animation` **shorthand** with an easing token
  whose value contains commas (`cubic-bezier(…)`) — the prototype avoids this
  by writing longhand `transition: transform var(--motion-modal-enter)` per
  property rather than a combined shorthand.
- `prefers-reduced-motion: reduce` collapses these durations to `0ms` at the
  token layer (`reduced-motion.css`), not per component.

### 3.8 Magic numbers (values with no token)

| Value | Where | Why it isn't a token | Action for the rebuild |
|---|---|---|---|
| `enter: 350, leave: 200` on `<Transition :duration>` | `RegionSelectorSheet.vue:82`, `LanguageSelectorSheet.vue:41` | Vue's `<Transition>` needs a JS-side duration hint for `v-if`-driven exits; hand-copied from `--motion-modal-enter`/`-exit` rather than read from the token at runtime | Keep the JS duration hint in sync with whatever token you map `--motion-modal-enter`/`-exit` to — this is a duplicated value, not a design decision; do not let it drift from §3.7 |
| `240px` typeahead card `max-height` | `RegionSelectorSheet.vue:282` | Fixed pixel cap on the floating suggestions dropdown, not expressed as a size token | Carry as-is, or map to your nearest container-height token if one exists at this scale |
| `560px` / `420px` responsive modal `max-width` | `RegionSelectorSheet.vue:425`; `LanguageSelectorSheet.vue:248` | Per-surface content-width caps, not tokenised (mirrors `CheckoutSheet`'s own untokenised `420px`) | Carry as-is per surface |

---

## 4. Surface-by-surface reference *(illustrative)*

### 4.1 RegionSelectorSheet — "bottom sheet / centered modal, search + grouped list"
**Reference:** [`RegionSelectorSheet.vue`](../../../src/components/RegionSelectorSheet.vue) ·
**transition name:** `sheet` · **z-index:** `4`

Scrim has no blur (matches `CheckoutSheet`); the panel itself is frosted
(`backdrop-filter`). The search input never filters the visible list — it
opens a separate floating "typeahead" card so the user can still scan the
full grouped list while searching.

<!-- source: src/components/RegionSelectorSheet.vue:390-405 (reference only) -->
```css
.sheet-enter-active .selector__panel { transition: transform var(--motion-modal-enter); }
.sheet-enter-from .selector__panel { transform: translateY(100%); }
.sheet-enter-to   .selector__panel { transform: translateY(0); }

.sheet-enter-active .selector__scrim { transition: opacity var(--motion-modal-enter); }
.sheet-enter-from .selector__scrim { opacity: 0; }
.sheet-enter-to   .selector__scrim { opacity: 1; }

.sheet-leave-active .selector__panel { transition: transform var(--motion-modal-exit); }
.sheet-leave-from .selector__panel { transform: translateY(0); }
.sheet-leave-to   .selector__panel { transform: translateY(100%); }

.sheet-leave-active .selector__scrim { transition: opacity var(--motion-modal-exit); }
.sheet-leave-from .selector__scrim { opacity: 1; }
.sheet-leave-to   .selector__scrim { opacity: 0; }
```
- Mobile: pure vertical slide, no fade on the panel itself (only the scrim fades) — orientation matches every other bottom sheet in the app.
- Responsive (≥801px, `.selector--responsive`): switches to `position: fixed`, centers via flex, and the panel transitions `transform`+`opacity` together (scale 0.96→1, fade in) instead of sliding — a centered card has no edge to slide from.
- The grouped market list uses CSS `columns: 2` with `break-inside: avoid` per group — a layout choice, not a state; a rebuild is free to use any two-column technique that keeps a continent's markets together.

> ⚠️ **Gotcha:** the typeahead dropdown (`.selector__results`) is
> `position: absolute` anchored under the search box, which sits in its own
> `position: relative` `.selector__search` wrapper *outside* the scrolling
> body — it always floats over the (non-scrolling) top of the list, never
> scrolls away, and its `z-index: 1` only needs to beat the list below, not
> the whole sheet.

### 4.2 LanguageSelectorSheet — "bottom sheet / centered modal, flat list"
**Reference:** [`LanguageSelectorSheet.vue`](../../../src/components/LanguageSelectorSheet.vue) ·
**transition name:** `sheet` · **z-index:** `4`

Identical chrome and transition scheme to `RegionSelectorSheet` (§4.1) —
same `sheet` transition name, same scrim, same responsive breakpoint — but the
panel is `max-height: 85%` (content-hugging) rather than a fixed `85%`,
because the language list is always short (§2.2.c: floor of 1 entry, `'en'`).

<!-- source: src/components/LanguageSelectorSheet.vue:107-126 (reference only) -->
```css
.selector__panel {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  max-height: 85%;              /* vs RegionSelectorSheet's fixed height: 85% */
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
```
- No search — the list is always short enough that search would be over-engineering (a deliberate omission, not a missing feature).
- Selected-row check icon (`check_circle`, 16px) and tint (`--text-hyperlink-default`) are the *only* selection indicator — there is no border ring or background fill on the selected row, unlike e.g. `CheckoutSheet`'s payment-channel selection.

> ⚠️ **Gotcha:** both sheets share the identical `sheet-enter-*`/`sheet-leave-*`
> class names because both use `<Transition name="sheet">`. This is safe only
> because Vue scopes the generated classes to each `<style scoped>` block —
> if you port this to a system without per-component style scoping, rename one
> of the two transitions to avoid a global collision.

---

## 5. State & timing constants

Owned by [`useLocale.js`](../../../src/composables/useLocale.js) — the single
place region/language selection state, persistence, and the RTL-gating rules
live. There are no *timing* constants in the orchestrator itself (no
`setTimeout`/delay for this feature); all timing is CSS-token-driven motion
declared directly in the two sheet components (§3.7).

| Constant / rule | Value | Meaning |
|---|---|---|
| `region` (ref) | default `'SG'`, then persisted | active market code |
| `language` (ref) | default `'en'`, then persisted | active language code |
| `storageKey(theme)` | `` `locale:${theme}` `` | localStorage key, namespaced per store theme |
| `isRtlActive` | `currentLanguage.rtl ?? false` | gates whether RTL languages/market-native-names are shown at all (§2.1.d, §2.2.d) |
| region→language reset rule | `setRegion` resets `language` to `'en'` if the new region doesn't offer the current language | `useLocale.js:83-88` |
| language floor | `languagesFor()` always includes `'en'` first | `useLocale.js:62-66` |

No re-entrancy guard is needed: every state change here is a synchronous ref
assignment with no async gap, so there is no "aborted mid-flight" case to
clean up.

---

## 6. Accessibility & performance

- `prefers-reduced-motion` is handled at the token layer (`reduced-motion.css`
  collapses all `--motion-*` durations), not per component — do not add a
  component-level media query.
- The state change itself is never the only signal: picking a region/language
  also changes visible text (flag, market name, language endonym) everywhere
  it's displayed in the app chrome — motion alone never carries the meaning.
- Both sheets set `role="dialog"` `aria-modal="true"` and a localised
  `aria-label` (`ui.selectRegion` / `ui.selectLanguage`) on the root.
- Language rows carry `aria-pressed` reflecting `row-selected` (§2.2.a).
  Region rows and typeahead results have no `aria-pressed` equivalent — they
  are one-shot navigation actions, not toggles.
- Focus is **not** programmatically trapped or moved into the sheet on open in
  the prototype, and the search input does not auto-focus — this is a gap
  relative to typical modal-dialog a11y practice; flag it as an assumption to
  fix, not a spec to preserve (see §11, A1).
- Escape closes the sheet (region sheet: clears the search query first, then
  closes on a second Escape) — see §2.1.b transitions.
- Hit targets: `.selector__close` is 24×24px visually but sits inside
  `--size-icon-l` bounds with no extra padding — verify this still clears a
  44×44 minimum touch target in the target design system; the prototype does
  not enforce one explicitly here.
- Only `transform`/`opacity` animate on the sheet/scrim hot path; no
  `will-change` is set (durations are short enough that it isn't needed at
  this scale).

---

## 7. Layout & stacking context

Both sheets mount in `App.vue`'s overlay layer, always present in the DOM
(gated by their own internal `v-if`, not a parent conditional):

```
NavDrawer (z-1) < SignInLoader (z-2) < Snackbar (z-3)
   < RegionSelectorSheet / LanguageSelectorSheet / CheckoutSheet (z-4, shared layer)
```

- **Framed devices / `isMobile: true`:** `.selector` is `position: absolute`,
  bounded to `.device__screen` — the same containing block every other
  device-framed overlay uses.
- **Responsive / `isMobile: false`, ≥801px:** `.selector--responsive` switches
  to `position: fixed`, pinning to the true viewport rather than the
  scrolling page — this is safe specifically because `.device--none` (the
  responsive/no-frame mode) has no transformed ancestor that would otherwise
  trap `fixed` positioning. Below 801px in responsive mode the modal falls
  back to the same absolute bottom-sheet geometry as framed mode.

---

## 8. Build order

### T1 — Static structure, default state, and the two layout modes
**Depends on:** — · **Covers states:** §2.1 `closed`, `open-empty-query`, `layout-mobile`, `layout-responsive`; §2.2 `closed`, `open`, `layout-mobile`, `layout-responsive`
**Tokens:** §3.1 `--scrim, --bg-sheet, --bg-page, --border-sheet, --text-header-default, --text-body-default, --text-placeholder` · §3.2 all four styles · §3.3 all rows · §3.4 all rows · §3.5 all rows · §3.6 all rows
**Behaviour:** Build both sheets' static chrome — scrim, panel, header (title + close), and each sheet's body list (region: two-column grouped list; language: flat list) — for both the mobile bottom-sheet geometry and the ≥801px centered-modal geometry. No motion, no search, no selection state yet; both open instantly on their trigger for now.
**Acceptance:**
- [ ] Renders correctly at both layout breakpoints (§7) with no overflow.
- [ ] Every colour, spacing, radius and size value comes from a mapped token — grep the new code for literals: none.
- [ ] Type matches §3.2 including condense (headings condensed, body/utility not).
- [ ] Region sheet's continent columns never split a group across columns.

### T2 — Selection, hover/press, and the region/language reset rule
**Depends on:** T1 · **Covers states:** §2.1 `row-hover`; §2.2 `row-default`, `row-selected`, `row-hover`
**Tokens:** §3.1 `--text-header-strong, --text-hyperlink-default, --bg-indicator-neutral-default` · §3.7 `--motion-sku-hover` · §3.7 `--motion-ripple`
**Behaviour:** Wire row selection: tapping a region/language row commits the pick and closes the sheet in one action (no confirm step). Implement the cross-sheet reset rule from §5 (picking a region that doesn't offer the current language falls back to `en`). Add hover/press feedback matching the tokens above.
**Acceptance:**
- [ ] Picking any row both commits and closes, with no intermediate confirm.
- [ ] Selected language row shows the check indicator and tint per §2.2.a; no other row does.
- [ ] Switching to a region that lacks the current language silently resets language to `en` — verify by observing whatever displays the active language elsewhere in the app.
- [ ] Hover states only apply on pointer-fine input (no stuck hover state on touch).

### T3 — Region search & typeahead
**Depends on:** T1, T2 · **Covers states:** §2.1 `open-typing-with-matches`, `open-typing-no-matches`
**Tokens:** §3.1 `--bg-card-default, --border-card-default` · §3.6 `--shadow-sheet` · §3.3 `--gap-content-narrow`
**Behaviour:** Build the region search input and its floating typeahead card. The card shows substring matches with the matched portion visually emphasized; the underlying full grouped list is never filtered — it stays visible and unchanged the whole time the user types. Query resets to empty every time the sheet (re)opens (§2.1.d invariant).
**Acceptance:**
- [ ] Typing shows the typeahead card only when ≥1 match exists; 0 matches shows no card and no "no results" message (§2.1.a `open-typing-no-matches`).
- [ ] Matched substring is visually distinguished (e.g. bold) with correct offsets for accented/diacritic characters.
- [ ] Reopening the sheet after a previous search always starts with an empty query.
- [ ] Escape clears the query first (if non-empty), then closes the sheet on a second press.

### T4 — Scroll scrims, entrance/exit motion, and RTL handling
**Depends on:** T1, T2, T3 · **Covers states:** §2.1 `list-scrollable`, `list-scrolled-to-end`, `search-permanent-scrim`; §2.2 `list-scrollable`, `list-scrolled-to-end`; the §1.1 choreography
**Tokens:** §3.7 all rows · §3.1 `--gradient-scroll-fade-bottom`
**Behaviour:** Add the bottom scroll-fade (visible only while the list body has more content below the fold — track scroll position + content height, not a static assumption) and, for the region sheet only, the always-visible search-permanent-scrim beneath the search box. Wire the entrance/exit transitions per §1.1 and §4. Implement the RTL rules from §2.1.d/§2.2.d: RTL languages/native market names are hidden or substituted with an English fallback while the active UI language is itself LTR, and reappear once the active language is RTL.
**Acceptance:**
- [ ] Bottom scroll-fade appears only when the list actually overflows, and disappears once scrolled to the end.
- [ ] Region sheet's search-permanent-scrim is visible at all times the sheet is open, unaffected by scroll position.
- [ ] Entrance is 350ms decelerate, exit is 200ms accelerate, matching §1.1.
- [ ] With an LTR active language: RTL languages don't appear in the language list; RTL market native names fall back to English.
- [ ] Switching the active language to an RTL one reveals RTL languages/native names correctly, using `dir="auto"`-equivalent per-string bidi handling.
- [ ] `prefers-reduced-motion: reduce` collapses all motion above with the open/close flow still completing.

---

## 9. Constraints & prohibitions

**MUST**
- Implement every state in §2.1 and §2.2. A missing state is an incomplete task.
- Map every value through §3 to a semantic token in the target system.
- Keep the region/language reset rule (§5) and the RTL gating rules (§2.1.d, §2.2.d) — they are behaviour, not styling, and are easy to drop silently.
- Preserve the intent captured in the §1.1 callout and the §4 gotchas.
- Reset the region sheet's search query to empty every time it opens.

**NEVER**
- Copy prototype `.vue` files, or mirror its architecture, composables, or file layout.
- Port prototype-only scaffolding: demo data, the device-frame overlay, or handoff shims such as `forceReduceMotion`.
- Hardcode a resolved literal that §3 gives a token for.
- Substitute a visually-similar token for a missing semantic role — add the role.
- Use the `transition`/`animation` shorthand with a comma-bearing easing token.
- Animate layout properties (only `transform`/`opacity`) on the sheet/scrim hot path.
- Add a confirm step between picking a row and closing the sheet — the prototype has none.
- Add a "no results" message to the region search — the prototype deliberately has none; the full list staying visible IS the fallback.
- Invent a value, duration, or behaviour not specified here — see §11.

---

## 10. Verification

The target repo is not assumed runnable from this doc, so verification is
**state coverage + visual parity against the reference.**

### 10.1 State coverage

| # | State | Reachable | Matches reference | Notes |
|---|---|---|---|---|
| 1 | RegionSelectorSheet: `closed` | ☐ | ☐ | |
| 2 | RegionSelectorSheet: `open-empty-query` | ☐ | ☐ | |
| 3 | RegionSelectorSheet: `open-typing-with-matches` | ☐ | ☐ | |
| 4 | RegionSelectorSheet: `open-typing-no-matches` | ☐ | ☐ | |
| 5 | RegionSelectorSheet: `row-hover` | ☐ | ☐ | pointer-fine only |
| 6 | RegionSelectorSheet: `list-scrollable` | ☐ | ☐ | |
| 7 | RegionSelectorSheet: `list-scrolled-to-end` | ☐ | ☐ | |
| 8 | RegionSelectorSheet: `search-permanent-scrim` | ☐ | ☐ | |
| 9 | RegionSelectorSheet: `layout-mobile` | ☐ | ☐ | |
| 10 | RegionSelectorSheet: `layout-responsive` | ☐ | ☐ | |
| 11 | LanguageSelectorSheet: `closed` | ☐ | ☐ | |
| 12 | LanguageSelectorSheet: `open` | ☐ | ☐ | |
| 13 | LanguageSelectorSheet: `row-default` | ☐ | ☐ | |
| 14 | LanguageSelectorSheet: `row-selected` | ☐ | ☐ | |
| 15 | LanguageSelectorSheet: `row-hover` | ☐ | ☐ | pointer-fine only |
| 16 | LanguageSelectorSheet: `list-scrollable` | ☐ | ☐ | |
| 17 | LanguageSelectorSheet: `list-scrolled-to-end` | ☐ | ☐ | |
| 18 | LanguageSelectorSheet: `layout-mobile` | ☐ | ☐ | |
| 19 | LanguageSelectorSheet: `layout-responsive` | ☐ | ☐ | |

Total states to cover: **19** (matches frontmatter `states:`).

### 10.2 Visual parity

Compare each state against the prototype (no interactive demo site exists for
this feature yet — `demo_url` is unset). Check fill, border, radius, type
(size/weight/tracking/condense), spacing, and motion duration against §3.

### 10.3 Token mapping record

Fill this in as you implement. It is the design-fidelity review artifact.

| §3 row (role) | Target token used | New token added? |
|---|---|---|
| `--scrim` | | ☐ |
| `--bg-sheet` | | ☐ |
| `--text-hyperlink-default` | | ☐ |
| `--gradient-scroll-fade-bottom` | | ☐ |
| `--motion-modal-enter` | | ☐ |
| `--motion-modal-exit` | | ☐ |

*(add a row per token actually consumed in the rebuild)*

### 10.4 Behavioural checks

- [ ] Every transition in §2.1.b and §2.2.b fires on its trigger and respects its guard.
- [ ] Every edge case in §2.1.d and §2.2.d holds, including the cross-sheet region→language reset.
- [ ] Keyboard-only pass: all interactive rows reachable, focus always visible, Escape behaves per §2.1.b/§2.2.b.
- [ ] `prefers-reduced-motion: reduce` pass: no motion, flow still completes.

---

## 11. Open questions & assumptions

**Blocking** — none.

No open questions. No assumptions beyond the ones recorded below.

**Assumptions** — recorded decisions that were not specified by design. Flag
rather than bury; each is a thing a reviewer can overturn.

| # | Assumption | Basis |
|---|---|---|
| A1 | Focus is not programmatically moved into the sheet nor trapped within it on open, and the search input does not auto-focus. This is carried forward as *current prototype behaviour*, not as a recommendation — a production a11y review may reasonably require a focus trap and auto-focus that the prototype doesn't implement. | Direct read of `RegionSelectorSheet.vue` / `LanguageSelectorSheet.vue` — no focus-management code exists in either file. |
| A2 | The `560px` / `420px` responsive modal max-widths and the `240px` typeahead max-height (§3.8) are carried as literal values rather than tokenised, matching how `CheckoutSheet` and other sheets in this app already treat their own per-surface max-widths. | Pattern match against `CheckoutSheet.vue`'s identical untokenised `420px` (`docs/component-breakdown.md:409`). |
| A3 | In the running prototype, an RTL language can never actually be *selected* through `LanguageSelectorSheet` — `availableLanguages` hides every RTL language while `isRtlActive` is false, and `isRtlActive` derives from the *currently active* language, which starts (and stays, absent some other entry point) at `'en'`. This looks like a genuine bootstrap gap rather than an intentional design, consistent with `component-breakdown.md`'s own note that "Arabic ships translated but renders LTR; RTL layout is a later phase." The rebuild should preserve the gating logic exactly as specified (§2.1.d, §2.2.d) — do not silently "fix" the bootstrap gap by pre-selecting an RTL default or exposing a bypass; if RTL needs to become reachable, that is a design decision for a human, not an inferred fix. | Traced directly in `useLocale.js:99-135`: `isRtlActive` reads `currentLanguage.value?.rtl`, and `availableLanguages`'s filter is the only gate on which rows `LanguageSelectorSheet` renders — no other code path sets `language` to an RTL code. |

---

## 12. Ready-to-paste prompts

Self-contained — each block works pasted cold into Cursor Composer, Claude
Code, or any agent with repo access. No reliance on prior conversation.

**Implement one task**

```text
Read docs/Handoff/locale-selector-sheets/AGENTS.md, then README.md §0, §2, §3 and
task T2 of §8. Implement T2 only, in this codebase — do NOT copy the prototype's
.vue files. Cover exactly the states T2 lists. Map every value through §3 to a
token in this repo's design system; if a semantic role has no token here, add it
and note it in §10.3. Then run the §10 checks for the states T2 covers and report
the results as a checklist. If any value you need is missing from §2/§3, stop and
ask instead of choosing one.
```

**Review an implementation against the spec**

```text
Read docs/Handoff/locale-selector-sheets/README.md §2 and §3. Audit <path to
region/language selector component(s)> and report, as a table: (a) states in §2
that are missing or unreachable, (b) values that are hardcoded literals instead of
mapped tokens, (c) transitions whose trigger or guard differs from §2.x.b. Do not
fix anything yet — report first.
```

**Extend the feature with a new surface**

```text
Read docs/Handoff/locale-selector-sheets/README.md §2, §3, §7 and §9. Add <new
surface, e.g. a combined region+language single sheet> following the same state
model and token roles. List the new states in §2 table format and the tokens in
§3 format before writing any code.
```

---

**Related docs:** [`motion-tokens.md`](./motion-tokens.md), [`haptic-tokens.md`](./haptic-tokens.md),
[`component-breakdown.md`](./component-breakdown.md), [`typography.md`](./typography.md).

Generated using the [web-store-spec-handoff](./_skill/SKILL.md) skill —
bundled as a frozen snapshot; the live skill may have since evolved.
