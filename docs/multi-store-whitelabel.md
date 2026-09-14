# Multi-Store Whitelabel Guide — Reskinning the Web Store

How one codebase serves multiple branded web stores (COD:M, FC Mobile, …) with **zero
component edits per store**. This is the canonical reference for the whitelabel architecture:
it documents every way **FC Mobile (FCM)** diverges from COD:M as the fully worked example,
gives a step-by-step **deploy-a-new-store playbook**, and codifies **how store variance is
handled**.

Pairs with [`component-breakdown.md`](./component-breakdown.md) (per-component internals),
[`design-tokens-codm.md`](./design-tokens-codm.md) (the full COD:M palette/ramps), and
[`prototype-sharing-guide.md`](./prototype-sharing-guide.md) (build + theme-switch + deploy).

> The write-time enforcement of the rules below lives in three agent skills —
> `web-store-tokens`, `web-store-whitelabel`, `web-store-components`. This doc is the
> human-facing counterpart.

---

## How the switch works

A store is selected at runtime by one attribute on the root element:

```js
document.documentElement.dataset.theme = 'fcm'   // or 'codm'
```

`src/composables/useTheme.js` owns this: `THEMES` is the registry of `{ value, label }` pairs,
`setTheme(value)` validates and writes `<html data-theme>`, and `current` is a reactive `ref`.
CSS custom properties re-resolve instantly when the attribute flips (all themes are bundled into
one CSS output), and `useStoreAssets` recomputes its image registry reactively — so a switch needs
**no reload and no network request**.

---

## 1. The four-layer model

Every difference between stores is one of four *kinds*, and each kind has exactly one home. Pick the
layer by what kind of difference it is — never spread one difference across two layers.

| Difference | Layer | Where the data lives | Read via |
|---|---|---|---|
| colour / type / surface / spacing | CSS token override | `src/tokens/ds/themes/<store>.css` | CSS cascade |
| imagery / fonts | asset registry | `src/stores/<store>/store.js` (`assets`) | `useStoreAssets` |
| structural capability (show/hide, layout, flow) | capability config | `src/stores/<store>/store.js` (`config`) | `useStoreConfig` |
| user-visible copy | copy layer | `src/stores/<store>/store.js` (`strings`) | `useStoreStrings` |

Each store is one **store module** — `src/stores/<store>/store.js` exports
`{ key, label, config, strings, assets, catalog, featured }` and side-effect-imports its theme CSS.
Store modules are pulled in via the **`@active-stores` virtual module** — a Vite plugin in
`vite.config.js` that discovers every `src/stores/<store>/store.js` on disk and emits the import list
at config time, keyed by the Vite mode:

- `npm run dev` / `npm run build` → every discovered store, runtime switcher live
- `npm run build:fcm` / `build:codm` (or `dev:<store>`, or any `--mode <store>` not in package.json)
  → store-locked to just that one; the other stores' assets, fonts, theme CSS, config, and copy are
  **excluded from the bundle**, and the toolbar's store dropdown hides itself

There is no manifest file to edit — adding a store is "create the folder", nothing to register.

The composables (`useStoreConfig` / `useStoreStrings` / `useStoreAssets` / `useStoreCatalog`) are thin
reactive lookups over `ACTIVE_STORES` — they hold no per-store data themselves.

**The golden rule.** No component may test `theme.value === '<store>'`. Store identity lives **only**
in the four layers above. Components read store-agnostic **capability flags**, **copy**, and **assets**
— they never know which store is active. This is what makes a reskin a data exercise, not a code
exercise: see §7 (deploy) and §8 (variance rules).

---

## 2. Layer 1 — Tokens (`src/tokens/ds/themes/fcm.css`)

The theme file carries every brand value: colour seeds, the 6 spectrum ramps, typography, container
surfaces, and the handful of semantic/effect overrides the pure alias graph can't express. Full ramp
values are documented per-store in [`design-tokens-codm.md`](./design-tokens-codm.md) — this section
covers the **semantic/effect overrides** that drive FCM's distinct look.

| Token | COD:M (baseline) | FCM override | Why |
|---|---|---|---|
| `--bg-action-signin` | neutral black | EA red ≈ `#F04040` | EA Account sign-in button (`PageSignInSection`, `SignInSheet`) |
| `--bg-action-inverse` / `--border-action-inverse` | secondary (blue) | `--sys-colour-primary-main` (green) | FCM wants brand green on every primary action; default routes to blue |
| `--bg-tag-bonus` / `--text-tag-bonus` | yellow family | `--palette-primary-950` / `-50` (dark green / pale green) | bonus + best-value tags |
| `--bg-loyalty-banner` | — (unused) | `--palette-primary-950` (`#064220`) | "You will earn N points" strip in `CheckoutSheet` |
| `--border-card-default` | neutral-soft | `oklch(1 0 0 / 0.08)` (translucent white) | FCM's neutral is near-black → invisible on the dark page |
| `--text-text-on-brand` | — | `--sys-colour-ink-inverse` (dark) | dark text reads on the bright-green primary CTA |
| `--rarity-gradient-{mythic,legendary,epic,rare,neutral}` | per-rarity gradients | **all → `--sys-colour-surface-l1-fill`** | FCM has **no rarity system** — every bundle tile is a neutral frosted L1 surface |
| `--surface-l{1,2,3}-fill` | COD:M surfaces | two-layer composited tints (4% / 8% / 12% white over base) | the FCM L1→L3 container surface system |

**Typography.** FCM uses **Cruyff Sans** (`--sys-font-family-heading`/`-body`), with `--sys-font-condense: 1`
(no Hitmarker condense hack — Cruyff renders at true width). Only 400/500/700 cuts exist, so the weight
tokens remap 600/800 → 500 to avoid faux-bold synthesis.

### ⚠️ The `html[data-theme]` vs `[data-theme]` split (read before editing a theme)

`src/main.js` imports `@active-stores` first — each store module pulls in its **theme file** as a side
effect — then the `:root` structural tiers (`system` →
`semantics` → `space` → `text-styles` → `extensions`). `:root` and `[data-theme="fcm"]` have **equal
specificity (0,1,0)**, and the `<html>` element matches both — so at equal specificity the **later
import wins by source order**. A token a theme overrides that is *also* defined in a later `:root`
tier will therefore **lose** if declared in a plain `[data-theme]` block.

**Cautionary tale #1:** `--radius-control-full` was set in `[data-theme="codm"]` (2px) but `space.css`
re-declared it in `:root` (999px) and won — every COD:M button went fully-rounded.

**Cautionary tale #2 (v0.12.0):** `--checkout-loyalty-overlap` and `--shadow-checkout-footer` were
set in a plain `[data-theme="fcm"]` block (16px / dark shadow) but `extensions.css` declared the
same tokens in `:root` (0px / sheet shadow) and won by source order. The loyalty banner footer
appeared as a flat stack with zero overlap from v0.10.0 through v0.11.0 — the token value was
silently ignored the entire time.

The fix for both: declare such overrides in an **`html[data-theme="fcm"]`** block — specificity
**(0,1,1)** beats `:root` **(0,1,0)** regardless of source order. FCM keeps these in that block:

- `--radius-control-full: var(--sys-radius-full)` — pill-shaped controls (COD:M default stays 2px)
- `--border-signin-btn: var(--sys-colour-primary-main)` — green sign-in border (COD:M uses white)
- the `--text-hyperlink-*` family — brand green default, near-white inverse
- `--checkout-loyalty-overlap: 16px` — footer rise into the loyalty ribbon (default 0px in extensions.css)
- `--shadow-checkout-footer` — tight dark cast over the green ribbon (default: `--shadow-sheet`)

> Rule of thumb: setting an **upstream** token nothing else defines (seeds, spectrums, `--sys-*` type)
> → plain `[data-theme]` is fine. **Overriding** a semantic/spacing/extensions token a later `:root`
> tier also defines → you **must** use `html[data-theme]`.

An `@media (dynamic-range: high)` block pushes the brand seeds + hairline borders past the sRGB ceiling
on P3 panels (L > 1.0) so the green and the flat border genuinely glint.

**Cautionary tale #3 (v0.49.2) — a store-specific `@media` override with no `[data-theme]` scope at
all.** `motion-sku.css` had an `@media (dynamic-range: high)` block that boosted `--bg-action-primary`
and `--text-hyperlink-inverse` to a hardcoded superluminant gold at plain `:root` — written for COD:M's
own yellow `--ref-primary` (`#FFE700`), but with **no `[data-theme]` qualifier whatsoever**, not even
the unscoped-vs-`html`-scoped distinction the first two tales are about. Every store's semantic token
of the same name got silently overridden on any HDR-capable display, regardless of that store's actual
brand colour — Codashop's `--bg-action-primary` (purple) rendered as this same gold, and its Sign In
button's label (`--text-text-on-brand`, itself yellow) became invisible yellow-on-yellow text on a
yellow pill. The fix: scope the override to `html[data-theme="codm"]`, same specificity pattern as
tales #1/#2, leaving the *other* two tokens this block sets (`--hdr-glow`/`--hdr-hot`/`--hdr-bloom`)
unscoped, since those genuinely are a shared, per-theme-overridable system (see
`efootball.css`/`tdr.css`/`fcm.css`/`ygodl.css`, each of which already overrides them for its own
brand). **Rule of thumb, extended:** an unscoped `:root` override inside *any* at-rule (`@media`,
`@supports`, `@container`) is exactly as store-name-leaky as one outside it — the at-rule wrapping a
declaration doesn't scope it to a theme; only a `[data-theme]`/`html[data-theme]` selector does.

---

## 3. Layer 2 — Assets (`src/stores/<store>/store.js` → `assets`, read via `useStoreAssets`)

Each store module's `assets` key holds Vite-bundled image imports under `brand` / `content`;
`useStoreAssets` merges in a `pc` (payment-channel) logo set chosen by `config.chrome.iconVariant` at
read time. Market-shared art (PC logos, Coda branding `coda.svg` / `rating.svg`) lives in `src/shared/`
so it ships in every store-locked build. **`null` means "store lacks this asset"** — consumers guard
on it and render nothing (see §8).

| `brand` key | COD:M | FCM | Notes |
|---|---|---|---|
| `wordmark` | COD:M wordmark | FC Mobile wordmark | navbar logo |
| `logomark` | COD:M logomark | EA logomark | sign-in button icon |
| `loyaltyIcon` | `null` | `fcmMpSimple` | loyalty banner mark (FCM only) |
| `loyaltyIconColour` | `null` | `fcmMpColour` | navbar MP icon / rewards pill (FCM only) |
| `navSignInIcon` | `codmLogomark` | `fcmMpColour` | icon inside the navbar SIGN IN button |
| `cpIcon` / `apIcon` | COD:M coin / AP | placeholder copies in `fcm/img/brand/` | ⚠️ swap when FCM currency icons arrive |
| `qrCode` / `qrPlaceholder` | COD:M QR | placeholder copies in `fcm/img/brand/` | ⚠️ swap when FCM QR arrives |
| `favicon` | `codm-logomark.svg` | `FCM Logomark.svg` | browser tab icon; updated reactively by `useFavicon` |
| `coda` / `rating` | `src/shared/brand/` | `src/shared/brand/` | market-shared, not per-store |

FCM placeholders are **copies** inside `src/stores/fcm/img/` (not imports from the codm folder) so a
store-locked FCM build stays free of COD:M files; `avatar` likewise. Swap the copies when FCM art
lands. None of this requires a component change.

---

## 4. Layer 3 — Config (`src/composables/useStoreConfig.js`)

`CONFIG[<store>]` is the capability matrix. Components read these store-agnostic flags; the values
below are the complete COD:M ↔ FCM diff.

| Key | COD:M | FCM | Controls |
|---|---|---|---|
| `skuList.layout` | `'columns'` | `'wrap'` | 4-up column grid vs a 2-up (mobile) / 4-up (≥641px) wrapping grid |
| `checkout.showPoweredByCoda` | `true` | `false` | "Powered by Coda" footer line |
| `checkout.showRating` | `true` | `false` | store rating badge under the CTA |
| `checkout.loyalty` | `null` | `{ label: 'You will earn' }` | loyalty-points banner (null = hidden) |
| `checkout.allowGuest` | `true` | `false` | "check out as a guest" + the guest Player-ID lookup section |
| `signIn.flow` | `'codm'` | `'ea-redirect'` | in-app loader + QR vs the EA Account page overlay |
| `profile.avatarStyle` | `'image'` | `'icon'` | in-game avatar image vs generic `account_circle` icon |
| `profile.playerCard` | `'full'` | `'nickname-only'` | which `PlayerCard` variant renders (see §6) |
| `profile.showLoyaltyPill` | `false` | `true` | MP points pill left of the signed-in navbar avatar |
| `chrome.iconVariant` | `'light'` | `'light'` | payment/social-logo polarity (light logos for a dark UI; a future light-theme store uses `'dark'`) |

The primary checkout CTA label (`'Buy Now'` vs `'Checkout'`) is **not config** — it's
`strings.checkout.actionLabel` (see §5).

**Flag-naming discipline.** Name config by **capability**, never by store — `showLoyaltyPill`,
`allowGuest`, `avatarStyle`, not `isFcm`. A flag named after a store leaks identity into a place a
component reads. When a new store needs behaviour no flag expresses, **add a capability flag** (and give
every store a value) rather than branching on the store name.

> The full config schema — every flag, type, default, and which file gates it — now lives at
> [`tools/cms/schema/config.js`](../tools/cms/schema/config.js), kept in sync by
> `node tools/cms/audit.mjs`. Treat the table above as illustrative (COD:M vs FCM only); treat the
> schema file as authoritative.

---

## 5. Layer 4 — Strings (`src/composables/useStoreStrings.js`)

`STRINGS[<store>]` is all user-visible copy, grouped. Components read it (often as a `computed` so a live
theme switch re-renders). Selected COD:M ↔ FCM differences:

| Group · key | COD:M | FCM |
|---|---|---|
| `currency.name` / `.abbr` | `CP` / `CP` | `FC Points` / `FC` |
| `sku.bonusLabel` | `WEB BONUS` | `FC Points Bonus` |
| `nav.groups` | `[{ label: 'Store', children: ['Gifts', 'CP'] }]` | `[{ label: 'Store', children: ['Daily Supplies', 'Limited Offers', 'Top Ups'] }]` |
| `nav.items` | `['Code Redemption']` | `[]` |
| `signIn.cta` | `Sign in with COD:M` | `Sign In` |
| `signIn.openingApp` | `Opening COD:M app…` | `Opening EA Sports FC<sup>TM</sup> Mobile…` (via `v-html`) |
| `account.heading` | `YOUR COD:M ACCOUNT` | `YOUR FC MOBILE ACCOUNT` |
| `account.playerIdLabel` | `Your COD:M Player ID` | `Your FC Mobile Player ID` |
| `account.instructionsPrefix` | `In the COD:M App go to` | `In the FC Mobile App go to` |
| `account.playerCardLabel` | `null` | `Player Profile` (labels the nickname-only card) |
| `page.tabs` | `['Best Sellers','2x CP','New Users','CP']` | `['Best Sellers','2x FC Points','New Users','FC Points']` |
| `page.promoTitle` | `WEB EXCLUSIVE: GET 100% BONUS CP + A FREE GIFT` | `WEB EXCLUSIVE: GET BONUS FC POINTS + A FREE GIFT` |

Structural ones worth noting: an **empty `nav.groups` array** is a valid state that yields a flat nav
(no expandable group) — `nav.items` is the one that's empty for FCM (it uses a `groups` entry instead;
see `NavDrawer.vue` below); `account.playerCardLabel` is `null` in COD:M because the `full` card has
no label row; copy containing `<sup>TM</sup>` is rendered via `v-html` where the component opts in.

---

## 6. Component variant catalogue

Each component below renders differently per store **only** by reading a flag / string / asset — never a
store name. Mechanism → expression → effect.

### `PlayerCard.vue` — the two profile variants

The single source of truth for any player-identity card (account popover, page sign-in section, guest
lookup, future checkout confirmations). The `variant` prop (default `'full'`) selects the layout; the
store picks it via `config.profile.playerCard`.

| Variant | Props used | Markup | CSS |
|---|---|---|---|
| `full` (COD:M) | `name`, `idMasked`, `level`, `rank`, `avatarSrc` | 48×48 avatar + info column: row 1 `name` + `(ID: …)`; row 2 `Level: N` / `MP Rank: …` | `.player-card__row`, `.player-card__meta`, `.player-card__stat` |
| `nickname-only` (FCM) | `name`, `label` (optional) | column: optional `label` line + large display `name`; **avatar hidden** | `.player-card--nickname-only` (tighter `--gap-content-tight`), `.player-card__label`, `.player-card__display-name` |

Avatar guard: `v-if="avatarSrc && variant !== 'nickname-only'"`. The label is `strings.account.playerCardLabel`
("Player Profile" in FCM, `null` in COD:M → no label line).

### `NavBar.vue`

| Mechanism | Expression | COD:M vs FCM |
|---|---|---|
| standalone MP icon (signed-out) | `v-if="!signedIn && assets.brand.loyaltyIconColour"` | hidden (null) vs MP icon left of sign-in |
| MP rewards pill (signed-in) | `v-if="signedIn && config.profile.showLoyaltyPill && assets.brand.loyaltyIconColour"` | hidden vs points pill left of avatar |
| avatar style | `config.profile.avatarStyle === 'image'` → `<img>` else `<MaterialIcon name="account_circle">` | image vs icon |
| sign-in routing | `config.value.signIn.flow === 'ea-redirect'` → `startEaSignIn()` else `openSignInSheet()` | loader vs EA overlay |
| chrome icon/text tone | `config.navbar.chromeTone === 'inverse'` → `.navbar--chrome-inverse` (hamburger + locale buttons use `--text-header-inverse` instead of `--text-header-default`) | default (unset) everywhere vs Codashop only — see below |
| Sign In button style | `config.navbar.signInStyle === 'filled'` → `.navbar__signin--filled` (solid `--bg-action-primary` pill, `--text-text-on-brand` label, no border) | default transparent-outline everywhere vs Codashop's filled pill |
| Sign In button icon | `config.navbar.signInShowIcon !== false` → leading `assets.brand.logomark` | shown everywhere vs hidden (text-only CTA) for Codashop |
| locale language button | `config.navbar.localeShowLanguage !== false` → the language-code button next to the region flag | shown everywhere vs hidden (flag-only) for Codashop |

**Why `chromeTone` exists:** `--text-header-default` resolves light (white) on every existing store because their whole UI — chrome and cards alike — is dark, so "default heading ink" and "text that reads on dark chrome" happen to be the same value. Codashop is the first light-card store: `--text-header-default` now correctly means *dark* (for headings on its white cards), but its navbar is deliberately kept dark to match the Figma reference, so text/icons sitting directly on that chrome need the *inverse* ink token instead. Rather than override `--text-header-default` itself (which would break every white-card heading), `chromeTone` scopes the swap to just the navbar's own chrome elements. `--border-navbar` and `--text-text-on-brand` follow the same "give Codashop its own override, change nothing else" pattern — see `themes/codashop.css`.

### `NavDrawer.vue`

`groups`/`items` are `computed(() => strings.value.nav.groups / .items)`. COD:M renders an expandable
"Store" group + a flat `Code Redemption` item; FCM instead puts `Daily Supplies / Limited Offers /
Top Ups` inside its own expandable "Store" `groups` entry and leaves `items` empty. Same template —
whichever array is empty simply renders nothing for that section.

### `CheckoutSheet.vue`

| Mechanism | Expression | Effect |
|---|---|---|
| loyalty banner | `v-if="config.checkout.loyalty && selectedItem?.loyaltyPoints != null"` | FCM-only "You will earn N points" strip |
| banner icon | `v-if="assets.brand.loyaltyIcon"` else Material `paid` | FCM MP mark vs fallback icon |
| CTA label | `{{ strings.checkout.actionLabel }}` (a **string**, not config) | Buy Now vs Checkout |
| Coda footer | `v-if="config.checkout.showPoweredByCoda"` | shown vs hidden |
| rating badge | `v-if="config.checkout.showRating"` | shown vs hidden |

### `SignInSheet.vue`

Guest option `v-if="config.checkout.allowGuest"` (COD:M only); routing via `config.signIn.flow`
(`startEaSignIn` vs `startSignIn`); button icon `assets.brand.logomark`.

### `PageSignInSection.vue`

Signed-in → `<PlayerCard :variant="config.profile.playerCard" :label="strings.account.playerCardLabel">`.
Signed-out → CTA with `{{ strings.signIn.cta }}`, `assets.brand.logomark`, and
`background: var(--bg-action-signin)` (EA red in FCM). Routing via `config.signIn.flow`.

### `EaSignInPage.vue` · `SignInLoader.vue`

`EaSignInPage` is reachable only when `signIn.flow === 'ea-redirect'` (FCM); shows `assets.brand.logomark`.
`SignInLoader` (the COD:M flow) renders `assets.brand.wordmark`, `v-html` of `strings.signIn.openingApp`
and `strings.signIn.qrInstruction`, and `assets.brand.qrCode`.

### `PlayerAccount.vue`

Guest Player-ID lookup (COD:M). Heading `{{ strings.account.heading }}`, input placeholder
`strings.account.playerIdLabel`, instruction prefix `strings.account.instructionsPrefix`. Gated out in
FCM by `checkout.allowGuest === false` (replaced by `PageSignInSection`).

### `SkuList.vue` · `SkuCard.vue` · `BestSellerCard.vue` · `BundleItem.vue` · `CategoryNav.vue`

- **`SkuList`** — `layout` prop from `config.skuList.layout`: `columns` (COD:M) → fixed column grid;
  `wrap` (FCM) → 2-up (mobile) / 4-up (≥641px) wrapping grid, optionally overridden via
  `config.skuList.columns`; `stack` → `.sku-list__grid--stack` full-width row cards.
- **`SkuCard`** — currency `alt="{{ strings.currency.name }}"`; bonus `{{ bonusLabel }}`
  (`strings.sku.bonusLabel`).
- **`BestSellerCard`** — `bonusLabel`/`loyaltyPoints` passed from `App.vue` computed data.
- **`BundleItem`** — `RARITY_GRADIENTS[rarity] || 'var(--rarity-gradient-neutral)'`; FCM flattens all
  rarity tokens to `--sys-colour-surface-l1-fill` (§2), so tiles are uniformly neutral with **no component change**.
- **`CategoryNav`** — `tabs` prop from `strings.value.page.tabs`.

### `App.vue`

The composition root wires the reactive data: `skuLayout = computed(() => config.value.skuList.layout)`,
`categories` from `strings.value.page.tabs`, promo/section copy from `strings.value.page.*`, and demo
item arrays read `strings.value.sku.bonusLabel` so they stay reactive on a theme switch. The guest
`PlayerAccount` vs `PageSignInSection` choice follows `checkout.allowGuest`.

### Two-column split layout (`config.page.layout === 'split'`) — Codashop

The first store to break the single-column assumption. `isSplit = computed(() => config.value.page?.layout
=== 'split')` wraps the storefront section stack in `.storefront > .storefront__col--lead /
.storefront__col--main`; both wrapper levels are `display: contents` unless `--split` is active, so this
is a complete no-op for every other store. At `≥801px` the shell becomes a 12-col grid (4-of-12 lead /
8-of-12 main — see `Span.vue`'s `col-lead`/`col-main` sizes); below that it collapses to the normal single
column. `App.vue` `provide(GRID_BARE_KEY, isSplit)`; `Grid.vue`/`Span.vue` `inject` it so the sections'
*own* `<Grid><Span size="content">` collapse to a bare block at M/L instead of nesting a second 12-col
grid inside an already-gridded column (`src/composables/gridBare.js`). See `docs/grid-layout-system.md`
for the full breakpoint table and the anonymous-container-query caveat this introduces.

`config.identity` (image + title, `strings.identity.deliveryLabel`) renders `CompactHero.vue` in the lead
column — absent for every store but Codashop, so the component never mounts elsewhere.

### Inline checkout (`config.checkout.mode === 'inline'`) — Codashop

Codashop's purchase flow is page cards in the right rail, not the overlay `CheckoutSheet`. `useCheckout.js`
branches on `config.checkout.mode`: `openCheckout()` skips the signed-in/guest-verified gate and never sets
`sheetOpen` in inline mode (Gamer ID entry is itself step 1 of the page); `isItemSelected(key)` replaces the
old `sheetOpen.value && selectedKey.value === key` check in `SkuCard.vue` so a tapped SKU still shows its
selected state with no sheet involved. `App.vue` renders `<CheckoutSheet v-if="config.checkout.mode !==
'inline'">` and, when inline, stacks `StepGamerId` / `StepPayment` / `StepZipCode` / `StepDetails` (see
`src/components/checkout/`) around the existing sections — same `<Grid><Span size="content">` wrapper as
every other section, so they participate in the split/bare mechanism above for free.

### SKU grid density (`config.skuList.columns`)

`SkuList.vue`'s optional `columns` prop (`config.skuList.columns`, `null` for every store but Codashop)
sets `--sku-columns` inline, overriding the default 4-up grid at `≥641px` — Codashop passes `5` to match
its Figma reference.

---

## 7. Deploy a new store — playbook

To launch `store-c`, create one store module. **No component edits, no registration.**

1. **Theme tokens.** `cp src/tokens/ds/themes/codm.css src/tokens/ds/themes/store-c.css`; change the
   selector to `[data-theme="store-c"]`. Retune the ~7 seeds (`--ref-*`), regenerate the 6 colour
   spectrum ramps (`--palette-*`, 50–950 with the 500 step aliasing the seed), set typography
   (`@font-face` + `--sys-font-family-*` / `--sys-font-condense` / `--sys-letter-spacing-*`), and override
   brand semantics/gradients. **Any token also defined in a later `:root` tier → override from
   `html[data-theme="store-c"]`** (see §2).
2. **Store module.** Create `src/stores/store-c/store.js` exporting
   `{ key: 'store-c', label: '…', config, strings, assets, catalog, featured }`, with
   `import '@/tokens/ds/themes/store-c.css'` at the top. Assets live in
   `src/stores/store-c/img/{brand,content}/`; use `null` for any brand asset the store lacks —
   consumers guard on it. **Every** capability flag gets a value; all user-visible copy goes in
   `strings`. A 'filter'-model store also gets a `catalog.js` (mirror `src/stores/fcm/catalog.js`).
3. **Nothing to register.** The `@active-stores` virtual module (`vite.config.js`) discovers
   `src/stores/store-c/store.js` on disk the next time Vite starts — no manifest file, no `STORES`
   array, no `package.json` script required. `npx vite build --mode store-c` already works.
4. *(Optional, for a memorable command)* add `dev:store-c` / `build:store-c` scripts to
   `package.json` that just call `vite [build] --mode store-c` — purely a convenience alias.
5. **Deploy (optional).** Create a Vercel project on the same repo with Build Command
   `npx vite build --mode store-c` — see `docs/prototype-sharing-guide.md`.

Then flip `data-theme="store-c"` (or run `npm run dev:store-c`) and the whole store reskins live.
**If a launch forces you to edit a `.vue` component, a layer or a flag is missing** — add the
flag/string/asset, don't branch in the component.

---

## 8. How to handle variance — rules & anti-patterns

**The decision procedure.** For any new per-store difference, ask *what kind* it is and route it to the
one matching layer (§1 table). Don't mix layers — e.g. don't gate copy with a config flag; put the copy
in `useStoreStrings` and let it differ per store.

**Absent is a valid state.** Design so "this store doesn't have X" renders cleanly with no branch:
- a `null` asset → guard with `v-if="assets.brand.x"` (COD:M `loyaltyIcon`/`loyaltyIconColour`)
- an empty array → the `v-for` renders nothing (FCM `nav.groups: []` → flat nav)
- a `null` string → the element is skipped (`account.playerCardLabel`)

**Single source of truth.** One component per identity concept, reused everywhere (the `PlayerCard`
rule). Never inline-duplicate a card's markup — divergent copies are the exact inconsistency this
prevents. Need the same visual elsewhere? Import the component and pass props.

**Anti-patterns (reject in review):**
- `theme.value === 'fcm'` (or any store name) anywhere in a component
- hardcoded copy / currency / labels — must come from `useStoreStrings`
- a prop or flag whose **name encodes a store** (`isCodm`, `fcmMode`)
- duplicated component markup instead of reusing the canonical component
- assuming a strings array is non-empty, or an asset is non-null

**Verification.**
```bash
grep -rnE "theme\.value ===|=== '(fcm|codm)'" src/components/   # must be empty
node_modules/.bin/vite build                                     # catches broken var()/imports
```
Then toggle every store live and confirm copy, assets, layout, and brand colour all swap with **no
reload** and **no component diff** in the changeset.

---

**Last updated:** August 2026 · v0.69.0 — Zenless Zone Zero (ZZZ) store added: guest-only, page model
(`catalog.hideNav: true` — its sticky guided-checkout bar already occupies the bottom dock a
`CategoryNav` would otherwise use), OKLCH near-black + neon yellow-green palette, licensed "en
impact"/"en inpin" fonts proxied by Anton/Noto Sans. New generic `config.page.topNav` capability: a
top-docked `CategoryNav` (`variant="row"`, plain `position: sticky`, mirroring `CatalogNavStack.vue`'s
own pattern) mounted in normal document flow right after the guest-ID card, wrapping the sections it
should dock over so it releases automatically once its wrapper ends — no IntersectionObserver
bookkeeping. Also fixed a real cross-store bug this surfaced: `DeviceFrame.vue`'s `.device--none
.device__screen` carried `overflow-y: auto` even though responsive mode already lets it grow
unbounded (`height: auto`) and never actually scrolls internally — CSS still treated it as the
nearest scroll container for any `position: sticky` descendant, so a sticky element inside it (this
new top nav, and potentially `CatalogNavStack` on any future `device.default: 'none'` store) rode off-
screen with the box instead of sticking to the real viewport. Fixed by setting that rule's `overflow`
to `visible`; framed (device-simulator) mode is untouched. New `SkuImageList` capabilities: a `wide`
prop (1 col mobile / 2 col desktop, same ratio as `BundleGrid`) independent of the art-rendering
`variant`, for a featured row that wants more visual weight per card; `SkuImageCard`'s `panel`/default
variant now also honours the `title` prop for named non-numeric SKUs (subscriptions, memberships) —
previously only the `prod` variant did, so a card with `amount: null` and a `title` set silently fell
back to rendering just the bare `currencyLabel`. Unrelated: `material-fx` skill gained physical
coverage for three more materials (gloss/matte plastic, unglazed brick, unglazed clay/terracotta),
each with their own material→FX validity rows and a `physics.md` §4 clarifying the metal-vs-plastic
highlight tell (hue-shifted highlight = metal; neutral/white highlight over a pigment = plastic).

*Previously:* July 2026 · v0.49.2 — Fixed an unscoped `@media (dynamic-range: high)` override in
`motion-sku.css` that silently overrode every store's `--bg-action-primary`/`--text-hyperlink-inverse`
to a hardcoded COD:M gold on HDR-capable displays — see Cautionary tale #3 above. Also: Codashop's
`strings.signIn.cta` corrected to `Sign in` (was `Sign In`) to match the Figma spec, and a new
responsive 12px (S and smaller) / 24px (M and up) rhythm between Codashop's inline-checkout steps
(`.section--tight-top`/`-bottom` in `App.vue`, using `--gap-section-default`/`-separation`).

*Previously:* July 2026 · v0.49.0 — `TrustBar.vue` (Codashop only, `config.trustBar`): a four-card
trust-signal section mounted directly under `CompactHero` in the same sticky lead rail, at every
breakpoint — publisher-logo crossfade rotator, two count-up stats (new `useCountUp.js`), and a static
payment-icons row. Its layout states (single-card carousel / 2×2 / 4-up) are driven by a **self-scoped**
`@container trust-bar` query rather than this repo's usual anonymous binding to `.device__screen` — the
one deliberate exception to that convention, since the lead rail is reliably narrower than the screen (see
`docs/grid-layout-system.md`'s Container Query System section and `docs/Handoff/trust-bar/README.md` §4.4/§7
for the full reasoning). A 12px side inset below 801px comes from the host wrapper
(`App.vue`'s `.trust-bar-section`), not the component. Also added: `config.page.catalogBoxed` — bounds the
New Users Promo banner + CP SKU grid in a single bordered/rounded `.catalog-card` panel instead of two
separate dividered sections (Codashop only; every other store keeps the unboxed rendering); `InfoTag.vue`'s
new `success` variant (used by `TrustBar`'s delivery badge, alongside its existing `neutral` variant).

*Previously:* July 2026 · Codashop store added (feature branch `feature/codashop-store`): the first
LIGHT theme (white cards on a deep-purple page — full inversion of the ink ramp and the L1/L2/L3 elevation
surfaces, both from `html[data-theme="codashop"]` per the §2 cascade rule) and the first store to use a
two-column split layout at M/L (`config.page.layout: 'split'`, 4-of-12 lead / 8-of-12 main — see §6) and an
inline page-step checkout (`config.checkout.mode: 'inline'` — see §6) instead of the overlay `CheckoutSheet`.
Also added: `CompactHero.vue` (left-rail card, gated on `config.identity`, composing new `Thumbnail.vue` + `InfoTag.vue` sub-components), `SkuList`'s `columns` prop
(`config.skuList.columns`), and the M/L grid-gutter tokens `--gap-grid-gutter-m/-l` + `--gap-grid-margin-l`
(`src/tokens/ds/space.css`) replacing `Grid.vue`'s three previously-hardcoded "Phase 3" values — a pure
refactor for every existing store. Placeholder MLBB (Mobile Legends: Bang Bang) Diamond catalog only — no
real MLBB assets are shipped (`src/stores/codashop/img/README.md`). Payment/social icon polarity
(`chrome.iconVariant: 'dark'`) falls back to the existing light-polarity marks via `useStoreAssets`'s `??`
until `src/shared/pc/dark/` — currently an empty stub — gets real dark-on-light SVGs.

*Previously:* July 2026 · v0.40.0 — YGOMD store added (Yu-Gi-Oh! MASTER DUEL): KONAMI-ID-required (no guest checkout), page model with a single flat Gem-Pack list (`skus.regular`, the same shape YGO:DL's Crystal Packs use) instead of a category-tree catalogue, OKLCH near-black + Millennium-gold + ribbon-red + arcane-violet palette with a genuinely *mixed* radius profile (pill controls/badges, sharp cards/thumbnails — not one value store-wide), licensed Yu Gothic body/heading font (Light/Medium/Bold local woff2 cuts, overriding the style guide's own Google-Fonts proxy recommendation per explicit instruction), `catalog.hideNav: true` for its single-category store (joining TDR). Also: `App.vue`'s story-carousel hero slide gained a `config.page.storyHeroLogo: false` capability flag to suppress the brand-mark overlay on stores whose key art already reads as branded — the second new page-level flag pattern after `heroRingEffect`. PvZ3 (Plants vs. Zombies 3: Evolved) was also registered as an eighth build mode, but remains scaffold/placeholder-only (see its own store.js header) — not yet a real store addition.

*Previously:* July 2026 · v0.39.0 — MGSSE store added (METAL GEAR SOLID Δ: SNAKE EATER): guest-only, page model, no virtual currency, OKLCH void-black + field-green + pale-lime palette (fully sharp corners, no pill exception), licensed URW DIN Semi-Condensed heading font (2 local woff2 cuts), responsive/no-device-frame default (`device.default: 'none'`, second store after Rogue Trader). Also: `HeroSkuCard`/`BestSellerCard`'s ring effect became a shared `config.sku.heroRingEffect` capability flag (was hardcoded per component) — the pattern any future store follows to opt into a different `fx-glow-border-*` variant.
