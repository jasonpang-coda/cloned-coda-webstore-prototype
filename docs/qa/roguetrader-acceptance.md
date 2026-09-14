# QA — Warhammer 40K: Rogue Trader store (import acceptance)

Date: 2026-06-26 · Build version at time of QA: v0.29.1 (unreleased changes)

## Scope
Acceptance check for the new whitelabel store `roguetrader`, imported from the
style guide at `docs/style-guides/roguetrader/`. Verifies it drops in with **zero
component edits** and the grimdark gold-on-void theme resolves on screen.

## Result: PASS

| Check | Result |
|---|---|
| `vite build` (multi-store) | ✅ built, no broken `var()` chains |
| `vite build --mode roguetrader` (store-locked) | ✅ built; bundles RT theme + assets only |
| Dev server boots into theme (`--mode roguetrader`) | ✅ `<html data-theme="roguetrader">` |
| Google-Fonts proxies loaded (Oswald/Open Sans/Cinzel) | ✅ `<link>` served |
| Store module compiles via Vite | ✅ |
| No store-name branching in components | ✅ grep gate empty |
| No component files in changeset | ✅ only token/store/registry/docs files |
| Theme renders (hero art, navbar wordmark, PROFIT FACTOR section, gilded SKU cards, void theme, no sign-in) | ✅ see `roguetrader-home.png` |

Screenshot: [`roguetrader-home.png`](roguetrader-home.png) — iPhone frame, home view.

## Notes / limitations
- The Claude preview MCP and Claude-in-Chrome MCP were unavailable in this
  environment (sandbox EPERM / not connected). Visual proof was captured with
  **headless system Chrome** against the running dev server (`localhost:5176`)
  instead. Full multi-frame (Samsung / responsive) + computed-style sweep via the
  `codm-web-store-qa` playbook should be re-run interactively (`npm run dev`,
  switch to "Warhammer 40K: Rogue Trader") when a browser is available.
- Status `positive` (#8fd14f) is intentionally close to the green `primary`
  (#72a846); it MUST always pair with an icon/label (never colour alone) — noted
  in the style guide accessibility section.
- Fonts are Google-Fonts proxies for the licensed faces (Oswald ← TT Supermolot
  Neue, Cinzel ← Stevens Titling Pro). Swap to the licensed `.woff2` in
  `src/stores/roguetrader/fonts/` + `@font-face` for production fidelity.

## How to view
```
npm run dev:roguetrader     # boots straight into the store
# or: npm run dev → toolbar → "Warhammer 40K: Rogue Trader"
```

---

# Phase 7 — Games & DLC catalogue + HeroSkuCard (branch `experiment/rt-editions-catalog`)

Date: 2026-06-26 · Disposable experiment branch (NOT on `main`).

## Scope
The store pivots from selling Profit Factor currency to selling **game editions + DLC keys**
(scraped from the Steam page). Moved to a **two-category `filter` catalogue** ("Games & Editions",
"DLC") and added a brand-new wide **`HeroSkuCard`** used for the flagship **Voidfarer Edition**.
All other editions + DLC reuse `BundleSkuCard` (empty `items[]`). Discount pricing throughout.

## Result: PASS

| Check | Result |
|---|---|
| `vite build --mode roguetrader` (store-locked) | ✅ built; TT Supermolot + edition/dlc banners bundled |
| `vite build` (multi-store) | ✅ built; HeroSkuCard.stories.js compiled via eager glob |
| Store-name branching in components | ✅ no NEW hits (3 pre-existing are capability/dev-tool checks; HeroSkuCard/CategoryCatalog clean) |
| Token gates on HeroSkuCard (no raw hex/px/`--sys-*`/gradients) | ✅ only sanctioned mask idioms + a `-2px` lift matching BestSellerCard |
| Games tab: Voidfarer **HeroSkuCard** renders | ✅ key art + scrim, ULTIMATE EDITION eyebrow, gold title, includes chips, `$113.75 → $44.50 -61%`, ACQUIRE CTA → `roguetrader-editions-hero.png` |
| Games tab: Base/Deluxe **BundleSkuCard** (gilded edition banner) | ✅ `EDITIONS` heading, `$59.00 → $23.60 -60%`, no empty-breakdown gap → `roguetrader-editions-hero.png` |
| DLC tab: Story Expansions & Passes | ✅ Season Pass 2 `$34.99`, Season Pass `$34.99 → $14.00 -60%` → `roguetrader-dlc-tab.png` |
| DLC tab: Packs & Extras (incl. Free + cross-publisher bundle) | ✅ Appearance Pack `$4.99`, **Shovel DLC `Free`** (weapon banner), **Darkest Grimdark Bundle `$61.99 → $24.54 -67%`** → `roguetrader-dlc-packs.png` |
| Two category tabs in bottom nav (derived from catalogue labels) | ✅ "GAMES & EDITIONS" / "DLC" |
| `BundleSkuCard` empty-breakdown guard (`v-if="items.length"`) | ✅ titles sit clean, no −20px gap |

Screenshots (headless Chrome via CDP against `localhost:5176`, iPhone frame):
[`roguetrader-editions-hero.png`](roguetrader-editions-hero.png) ·
[`roguetrader-dlc-tab.png`](roguetrader-dlc-tab.png) ·
[`roguetrader-dlc-packs.png`](roguetrader-dlc-packs.png).

## Notes / limitations
- **Component library story** (`HeroSkuCard.stories.js`) is verified by build compilation only.
  The library viewer is intentionally tree-shaken from store-locked builds, so it can't be opened
  under `npm run dev:roguetrader` — open it via the multi-store `npm run dev` → `#library` →
  "Hero SKU Card" to see the 3 interactive variants.
- **Checkout sheet** product-name display is verified by code: `HeroSkuCard` passes `amount: title`
  to `openCheckout` (same convention `BundleSkuCard.vue` uses). A live tap requires the guest-verify
  gate first, so it wasn't screenshotted headless.
- New shared capability added: `config.catalog.featuredHero` gates App.vue's filter-mode standalone
  best-seller hero (FCM `true`, Rogue Trader `false`). New extensions token `--gradient-hero-scrim`.
- Edition/DLC art reuses store assets + two new on-brand SVG banners (`edition-banner.svg`,
  `dlc-banner.svg`); `relics.png` for weapon DLC. Per-tier bespoke art is a future polish item.
