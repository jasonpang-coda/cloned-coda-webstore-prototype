# Localisation — store-content translation

How the prototype turns store copy into the visitor's selected language. This is the
**content** layer that sits on top of the region/language switcher (`useLocale` +
`src/locale/`, documented in `component-breakdown.md`).

## The model in one line

The English `strings` object in each store module is the **source of truth**; each store also
ships thin **per-language override files** that are **deep-merged** over English by the language
`useLocale` currently has selected. Any untranslated key falls through to English, key-by-key.

```
useLocale().language  ('ja' | 'ar' | 'en' …)
        │
        ▼
useStoreStrings()  ──►  deepMerge(store.strings /* en base */, store.translations[lang] /* partial */)
        │                         └─ memoised per `${storeKey}:${lang}`
        ▼
  merged strings.value  ──►  every component (unchanged — they already read this seam)
```

## Where the pieces live

| Piece | File | Role |
|---|---|---|
| English base | `src/stores/<store>/store.js` › `strings` | source of truth + fallback |
| Per-language overrides | `src/stores/<store>/strings/<lang>.js` | **partial** override, same nested shape |
| Wiring | `src/stores/<store>/store.js` › `translations` | `{ ja, pt, es, ar, … }` map keyed by language code |
| Merge seam | `src/composables/useStoreStrings.js` | language-aware deep-merge + `(store,lang)` memo |
| Merge helper | `src/utils/deepMerge.js` | recursive merge; **arrays replaced wholesale** |
| Language selection | `src/composables/useLocale.js` | already-built region/language state |

## Rules for a translation file

- `export default { … }` — a **partial** object mirroring the store's `strings` shape. Only
  include keys you actually translate; everything else falls back to English automatically.
- **Do not translate** proper nouns / brand names / currency (COD:M, CP, FC Points, Battle Pass,
  in-game item / operator / card names). Omit them so English shows through.
- **Arrays are replaced whole, never element-merged** (`page.tabs`, `nav.groups`, `nav.items`).
  If you translate one, supply the full array — translate the `label`s, keep `anchor` values.
- Keep inline HTML tags in values intact (e.g. `<strong>100%</strong>`).
- Register the file in the store module's `translations` map. `zh-Hant` isn't a valid JS
  identifier, so import it under a safe local name and quote the key:
  `translations: { ja, /* … */ 'zh-Hant': zhHant }`.

## Per-store language coverage (Phase 1)

Each store localises only `Phase-1 languages ∩ its own locale set` (`src/locale/sets.js`):

| Store | Set | Phase-1 languages shipped |
|---|---|---|
| COD:M | codm | ja, pt, es, ar |
| FCM | fcm | ja, pt, es, ar, zh-Hant, th, id |
| TDR | tdr | ja, pt, es, ar, zh-Hant, th, id, ko |
| eFootball / Rogue Trader / YGO:DL | codashop | ja, pt, es, ar, zh-Hant, th, id, ko |

Phase-1 markets → languages: JP→`ja`, BR→`pt`, MX→`es`, SA→`ar`, HK→`zh-Hant`, TH→`th`,
ID→`id`, KR→`ko`. COD:M's real locale set excludes ko/id/th/zh-Hant, so it ships only its four.

## Two copy layers — per-store vs shared chrome

Not all user-visible copy is store-specific. There are **two** copy sources:

| Layer | Source | Read via | Use for |
|---|---|---|---|
| Per-store copy | `src/stores/<store>/store.js` › `strings` (+ `strings/<lang>.js`) | `useStoreStrings()` | brand/store-specific copy — nav, currency, sign-in CTA, page headings |
| Shared chrome | `src/locale/commonStrings.js` | `useLocale().common` | generic app chrome identical across **all** stores |

`commonStrings.js` mirrors the `uiStrings.js` pattern (language-keyed dictionary) but with grouped
nested keys, deep-merged over its `en` base per key (same fallback rule). It covers the chrome that
used to be **hardcoded English literals** in shared components — so it now localises everywhere at
once instead of being duplicated into six stores:

- `common.checkout.*` — Order Summary, Item Info, Select Payment, Subtotal, Powered by, Card Payments
- `common.signIn.*` — sheet title, Or separator, guest CTA
- `common.account.*` — popover title, Sign out
- `common.nav.drawerTitle` — drawer "Menu"
- `common.carousel.*` — best-sellers heading, event-countdown prefix

**Which layer?** Copy that reads the same in every store → `commonStrings.js`. Copy that carries a
brand/currency/store term or a store could want to reword → per-store `strings`. Brand payment-
provider names (Google Pay, PayPal, Cash App) stay as literals in the component — not keyed.

Consuming components add `const { common } = useLocale()` and read `common.<group>.<key>` (in
`<script>`, `common.value.…`). `App.vue` passes `common.carousel.*` into the carousel/banner
components that take the heading/countdown label as props.

## Adding a language (or a store)

1. Create `src/stores/<store>/strings/<lang>.js` as a partial override.
2. Import it in `src/stores/<store>/store.js` and add it to the `translations` map.
3. Confirm `<lang>` is in that store's set in `src/locale/sets.js` (otherwise the selector never
   offers it, so the override is dead weight).
4. Add the `<lang>` block to `src/locale/commonStrings.js` (and `uiStrings.js`) so the shared
   chrome localises too — otherwise it falls back to English for that language.

No component changes are ever needed — `useStoreStrings` and `useLocale().common` are the seams.

## Phase 2 (not yet done) — RTL

Arabic (`ar`) copy ships in Phase 1 but renders **LTR**. Phase 2 adds reactive `<html dir/lang>`
from `LANGUAGES[lang].rtl`, a logical-property CSS pass on direction-sensitive components, and
condense-origin mirroring for right-aligned/price text.
