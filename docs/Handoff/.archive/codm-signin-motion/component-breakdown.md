# CODM SKU Card 3.0 — Component Breakdown (FE Dev Handover)

A reference for front-end engineers picking up or re-implementing this prototype.
Pairs with [`motion-tokens.md`](./motion-tokens.md) (motion system) and
[`README.md`](../../README.md).

---

## 1. Stack & conventions

| Aspect | Choice |
|---|---|
| Framework | Vue 3, `<script setup>` SFCs |
| Build | Vite 5 |
| Styling | Plain scoped CSS per component + global design tokens (CSS custom properties). **Tailwind 3 is installed but the components use hand-written CSS + tokens**, not utility classes. |
| Responsiveness | **CSS Container Queries**, NOT viewport media queries (see §4) |
| State | Singleton composables (`useAuth`, `useCheckout`) for cross-component flow state. `App.vue` holds demo data. No Vuex/Pinia. |
| Icons | `@material-symbols/svg-400` via `MaterialIcon.vue` (CSS mask + `currentColor`) |
| Colors | OKLCH for action yellow + bonus text + SKU card border + HDR tokens; sRGB hex for UI chrome |
| Directives | `v-ripple` (global, `src/directives/vRipple.js`) — click-point ripple on all interactive buttons and card divs |

**Conventions**
- BEM-ish class names scoped per component (`.sku-card__amount`, `.sheet__banner`).
- Motion uses **animation longhands** (`animation-name`/`-duration`/`-timing-function`), never the shorthand — a comma-containing easing token breaks shorthand parsing.
- Animate only `transform` / `opacity` (GPU). No animating `width`/`top`/`left` on hot paths.
- Token CSS is imported in `main.js` as **JS imports** (not `@import` in `style.css`).

---

## 2. Page composition (`App.vue`)

```
App.vue
├── DeviceToolbar          ← iPhone / Samsung / Responsive switcher (prototype chrome)
└── DeviceFrame            ← renders the chosen device shell; .device__screen scrolls
    ├── #overlay slot      ← non-scrolling overlay layer (z-index 40)
    │   ├── CategoryNav    ← z-0  (sticky bottom L3 nav; persistent — below the transient overlays)
    │   ├── NavDrawer      ← z-1
    │   ├── SignInLoader   ← z-2  (mobile: app loader; desktop: QR)
    │   ├── Snackbar       ← z-3  (success toast; screen-bottom framed, viewport-bottom responsive)
    │   ├── CheckoutSheet  ← z-4  (ORDER SUMMARY; bottom sheet mobile, centered modal on M+ responsive)
    │   ├── SignInSheet    ← z-4  (SIGN IN sheet; no scrim; mutually exclusive with CheckoutSheet)
    │   └── AccountPopover ← z-5  (YOUR ACCOUNT popover; no scrim; anchored below navbar)
    └── NavBar             ← in-app top bar
    └── <section id="cat-…"> × N, each: <Grid><Span size="…"> … </Span></Grid>
        1. StoryCarousel        (Span size="carousel")                       — no id (hero, not a category)
        1b. PlayerAccount       (Span size="content")        — signed-out only (v-if="!signedIn")
        2. BestSellerCard       (Span size="content")        id="cat-best-seller"
        3. BestSellerCarousel   (Span size="carousel" — header inset, list full-bleed)
        4. PromoBanner (countdown) + BundleSkuCard × 2        id="cat-bundle"
        5. PromoBanner + SkuList ("New Users Promo")         id="cat-new-users"
        6. SkuList ("CP", size="content")                    id="cat-cp"
        7. PromoBanner + SkuList ("New Users Promo", layout="columns") — no id (layout demo)
```

**Carousel sections use `size="carousel"`** — full **bleed** (edge-to-edge, no side padding) on XS/S phones, then centered 2/3 (8 of 12 cols) on M/L, same as `content`. Content sections (hero card, SKU lists, bundle) use `size="content"` (full width within the 12px gutters on XS/S, centered 2/3 on M/L). **BestSellerCarousel** is a hybrid: it sits in a `carousel` Span but pads its own header to the gutter (`.bs-carousel__header { padding-inline: var(--pad-m) }`, reset at ≥801px) so only the card list bleeds.

**Section ids** (`cat-best-seller`, `cat-bundle`, `cat-new-users`, `cat-cp`) are the scroll-spy / scroll-to anchors consumed by `CategoryNav` (§7).

**Entrance cascade** — section `baseDelay` values:
`story 100 → account 180 → hero 250 → carousel 450 → bundle 550 → promo 650 → cp 900 → stacked 1000` (ms). `CategoryNav` slides up last (~700 ms, `--motion-nav-enter`).

**Data** lives in `App.vue` (`stories`, `bestSeller`, `bestSellerCarousel`, `bundle`, `promoItems`, `cpItems`, `categories`). Swap for API data in production. SKU items now carry an optional `rarity` (`mythic|legendary|epic|rare`) and `skuImage` (square product art, shown in the checkout thumb).

---

## 3. Design tokens

| File | Contents |
|---|---|
| `src/style.css` | Global resets, `@font-face` (Hitmarker), color/spacing tokens, font-condense block. Action yellow, input focus ring, and bonus text defined in **OKLCH** (`--text-hyperlink-inverse`, `--bg-action-primary`, `--border-input-focus`, `--text-web-bonus-codashop`, `--text-web-bonus-cp`) |
| `src/tokens/motion.css` | Base motion library (durations, easings, semantic composites incl. snackbar tokens) |
| `src/tokens/motion-sku.css` | Project motion tokens (`--motion-sku-*`, OKLCH `--hdr-*`), `@media (dynamic-range: high)` boost for action yellow |
| `src/tokens/keyframes.css` | `@keyframes` (sku-enter, loading-indeterminate, snackbar-drop, story-progress, bloom-pulse…) + `@property --angle` |
| `src/tokens/effects.css` | `.fx-*` utilities: `fx-shimmer`, `fx-shimmer--hover`, `fx-skeleton`, `fx-ripple` (+ `fx-ripple__wave`), `fx-glow-border--hdr`, `fx-bloom` |
| `src/directives/vRipple.js` | `v-ripple` global Vue directive — attaches `pointerdown` handler, spawns wave, self-cleans |
| `src/tokens/reduced-motion.css` | Global `prefers-reduced-motion` collapse |

For the **per-store theme layer** — how `themes/<store>.css` overrides cascade, the `html[data-theme]`
specificity rule, and how tokens combine with the asset/config/string layers to reskin the store — see
[`multi-store-whitelabel.md`](../../multi-store-whitelabel.md). For the **FC Mobile (FCM) store** specifically —
its palette/typography token values, the filter-mode components (`CategoryCatalog`, `FeaturedCarousel`,
`SkuImageCard`, `PageSignInSection`, `EaSignInPage`, …), and the config flags that drive each divergence —
see [`design-tokens-fcm.md`](../../design-tokens-fcm.md) and [`fcm-components.md`](../../fcm-components.md).

---

## 4. Responsive system (`Grid.vue` + `Span.vue`)

Container-query driven. `.device__screen` sets `container-type: inline-size`.

**Grid breakpoints:**

| BP | Container width | Columns | Gap | Pad-X |
|---|---|---|---|---|
| XS | < 641px | 8 | 8px | 12px |
| S | 641–800px | 8 | 8px | 12px |
| M | 801–1279px | 12 | 12px | 12px |
| L | ≥ 1280px | 12 | 16px | 16px |

**`Span` sizes:**
- `fluid` / `full` — `grid-column: 1 / -1` at ALL breakpoints (full width within the grid gutters). Used by NavBar.
- `content` — full width XS/S (inside 12px gutters); centered 8/12 cols (`grid-column: 3/11`, `max-width: 960px`) on M/L — **2/3**. Used by hero card, SKU lists, promo.
- `carousel` — **full bleed** on XS/S: `grid-column: 1/-1` + `margin: 0 -12px` cancels the Grid's side padding so the image reaches the screen edges end-to-end (width stays `auto`, so the negative margins expand it). On M/L (≥801px) it matches `content` exactly (centered 2/3, margins reset to 0). Used by **StoryCarousel** + **BestSellerCarousel**. ⚠️ the `-12px` is coupled to Grid.vue's XS/S/M `padding`.

---

## 5. Device frame system

| File | Role |
|---|---|
| `src/devices/index.js` | Registry — `screenW/H`, `bezel`, `radius`, `safeTop`, frame gradient, hardware buttons/cutouts |
| `src/components/DeviceFrame.vue` | Renders shell; exposes `--safe-top`; `.device__screen` is the scroll + container-query host |
| `src/components/DeviceToolbar.vue` | Segmented switcher (`v-model:device`) |
| `src/composables/useDeviceScale.js` | Scales the framed device to fit window height (`transform: scale`) |

**`#overlay` slot** (`.device__overlay`, `z-index:40`) — sibling of `.device__screen` for drawers/modals that must cover the screen without scrolling. Framed: `position:absolute`, inset by bezel, `overflow:hidden`, carries `--safe-top`. **Responsive:** `.device__overlay--responsive` uses `position:fixed; top:var(--toolbar-h,0px); right:0; bottom:0; left:0` — viewport-bounded, starting just below the DeviceToolbar. `App.vue` measures the toolbar height on mount (`toolbarRef.$el.offsetHeight`) and writes it to `--toolbar-h` on `:root`. No ancestor `transform` exists in responsive mode, so `fixed` resolves to the viewport (safe here; framed mode can't use `fixed` because `transform:scale()` is an ancestor). The overlay has **no `container-type`** (would trap fixed descendants). **Framed:** `position:absolute`, bounded to the screen box via bezel inset.

<ChoreographyTimeline />

**Mobile detection proxy:** `device !== 'none'` — used by `SignInLoader` to switch between mobile app-loader and desktop QR variants.

---

## 6. State composables

### `src/composables/useAuth.js`
Singleton (module-level refs). Manages the simulated COD:M sign-in flow.

| Export | Type | Description |
|---|---|---|
| `signedIn` | ref(Boolean) | User is authenticated |
| `signingIn` | ref(Boolean) | Loader is showing (5s countdown) |
| `snackbarVisible` | ref(Boolean) | Success snackbar is showing |
| `signInSheetOpen` | ref(Boolean) | "Sign in" sheet is visible |
| `accountMenuOpen` | ref(Boolean) | "Your account" popover is visible |
| `startSignIn()` | fn | Guarded re-entry; starts 5s timer |
| `cancelSignIn()` | fn | Aborts in-flight sign-in |
| `dismissSnackbar()` | fn | Manually close snackbar |
| `signOut()` | fn | Reset to signed-out; also closes account popover |
| `openSignInSheet()` | fn | No-op if already signed in |
| `closeSignInSheet()` | fn | Closes the sign-in sheet |
| `openAccountMenu()` | fn | Opens the account popover |
| `closeAccountMenu()` | fn | Closes the account popover |

Flow: navbar SIGN IN → `openSignInSheet()` → sheet "Sign in with COD:M" → `startSignIn()` → loader 5s → `signedIn = true` → snackbar 5s auto-dismiss. Avatar tap → `openAccountMenu()`.

### `src/composables/useCheckout.js`
Singleton. Manages the post-sign-in "SELECT PAYMENT" sheet.

| Export | Type | Description |
|---|---|---|
| `sheetOpen` | ref(Boolean) | Sheet visibility |
| `selectedItem` | ref(Object\|null) | The tapped SKU's data |
| `guestVerified` | ref(Boolean) | Guest has entered a valid Player ID (set by `PlayerAccount`) |
| `guestPlayerName` | ref(String) | Nickname typed by the guest; shown in the checkout sheet account row |
| `setGuestVerified(v)` | fn | Toggle the guest-verified flag; clearing also resets `guestPlayerName` |
| `setGuestPlayerName(name)` | fn | Store the guest's entered nickname |
| `openCheckout(item)` | fn | **No-op unless signed in *or* guest-verified.** Sets item + opens sheet |
| `closeCheckout()` | fn | Closes sheet |

`item` shape: `{ amount, baseAmount, bonusAmount, bonusType, bonusLabel, currentPrice, skuImage }`. `skuImage` (square product art) renders in the sheet's banner thumbnail; falls back to the gloss placeholder when absent.

### `src/composables/useDragScroll.js`
Click-and-drag horizontal scrolling for a scroll container, tuned for mouse. **Not a singleton** — call once per scroller, passing its element ref. Used by `BestSellerCarousel` and `CategoryNav`.

| Signature | `useDragScroll(elRef, { momentum=true, threshold=6, onScroll })` |
|---|---|
| Returns | `{ isDragging: Ref<boolean>, stop(): void }` |

Pointer Events + `setPointerCapture` (the drag never "drops" when the cursor leaves the element); `preventDefault` on `pointermove`/`dragstart` kills native text-selection and image drag (the old mousedown approach let grabbing a card image start an OS image-drag — that was the "hard to drag" bug). rAF-batched `scrollLeft`, EMA velocity, frame-rate-independent momentum coast, and a >`threshold`px move suppresses the trailing click (so a drag never opens a card / fires a tab). Ignores `pointerType: 'touch'` (native pan-x). Pair with `cursor: grab` + an `.is-dragging` class (`cursor: grabbing; user-select: none`).

---

## 7. Component reference

### `MaterialIcon.vue`
CSS-mask icon from `@material-symbols/svg-400`. Props: `name`, `variant` (default `round`), `size` (default `24`).

Bundled icons: `account_circle`, `check_circle`, `chevron_left`, `chevron_right`, `close`, `expand_more`, `expand_less`, `logout`, `open_in_new`.

**To add:** import `<name>.svg?url` + add `ICONS['round/<name>']` entry.

---

### `NavBar.vue`
In-app top bar. Hamburger + CODM wordmark left; auth control right. Reads `useAuth`.

- **Signed out** → SIGN IN button calls `openSignInSheet()`
- **Signed in** → player's in-game avatar image (`assets.content.avatar`, 30×30 circle); tap calls `openAccountMenu()`

Spring-pop `out-in` transition (`nav-auth`) on the auth control swap. Scroll-aware hide/show via `translateY(-110%)`. Emits `menu` (burger).

---

### `NavDrawer.vue`
Left slide-in navigation menu. Contains STORE accordion (Gifts / CP) + CODE REDEMPTION flat item. No sign-in/sign-out footer — auth is handled by `SignInSheet` and `AccountPopover`. Accordion animates via `grid-template-rows: 0fr → 1fr`. Open/close: `drawer` transition (slide from left). Mounted in `#overlay` slot.

---

### `SignInLoader.vue`
Full-screen sign-in overlay. Reads `useAuth` (`signingIn`). Receives `:is-mobile` prop from `App.vue` (proxy: `device !== 'none'`).

| Variant | Trigger | Content |
|---|---|---|
| Mobile | `isMobile = true` | CODM wordmark + indeterminate bar + "Opening COD:M app…" copy |
| Desktop | `isMobile = false` | QR code (`src/img/QR_Code.webp`) + "User Code" + `NLVF-FYBF` |

Both share: blurred scrim (`backdrop-filter: blur(32px)`), and the **"Cancel sign in"** underline link → `cancelSignIn()`. Fade transition (`--motion-modal-enter/exit`).

**Layout:** the content block (loader/QR + copy + cancel) is vertically centered (`.loader__body { justify-content: center }`); the cancel link flows directly after the content (no bottom-pin, no divider — matches Figma 4990:12116 / 5031:15622). **Height:** framed mode is `position: absolute` (bounded to the device screen box); desktop/responsive adds `.loader--desktop { position: fixed }` so the overlay is **viewport-height (100vh)** rather than stretching to the full scrolling-page height — keeps the cancel link on-screen. Fixed is safe in responsive mode only because `.device--none` has no transformed ancestor.

---

### `Snackbar.vue`
Success toast. Reads `useAuth` (`snackbarVisible`); receives `:is-mobile`. Auto-dismisses after 5s. Max-width 400px, centered via `left:50%; transform:translateX(-50%)`, `bottom:32px`. Spring-bounce entrance, anticipation-hop exit (`snackbar-drop` keyframe). Close button → `dismissSnackbar()`. **Positioning:** framed = `position:absolute` (device screen bottom); responsive (`.snackbar--responsive`) = `position:fixed` so it pins to the **viewport** bottom, not the bottom of the tall scrolling page.

**Note on transform:** the `snackbar-drop` keyframe carries `translateX(-50%)` in every step — required because keyframes overwrite the full `transform` property.

---

### `CheckoutSheet.vue`
"ORDER SUMMARY" bottom sheet (header renamed from "Select Payment" in v0.9.0). Reads `useCheckout`.

**Structure:**
- Scrim: `rgba(12,14,22,0.6)` **no blur** (design spec) — click closes
- Sheet: bottom-anchored, `height: 85%`, frosted (`backdrop-blur(32px)` + gradient surface), top-corners 8px radius; body is `flex:1; overflow-y:auto` — scrolls when channels overflow
- Header: "Order Summary" + `×`
- Account row: `account_circle` icon + `{{ guestPlayerName || 'codayw' }}`
- **SKU Banner**: 80px tall, 64×64 thumb tile. Bound to `selectedItem`: amount, `{base} + {bonus} WEB BONUS`
- **"Select Payment"** micro-uppercase label (10px bold, `--text-body-soft`) above the channel grid
- **Payment grid**: 2×2 flex-wrap cards. Selected channel: yellow (`--text-hyperlink-default`) 2px border ring
- Footer: **"Subtotal"** + yellow price + Coda logo + **BUY NOW** yellow shimmer button + rating badge

**Responsive (`:is-mobile`):** framed = bottom sheet (`position:absolute`, slide-up). Responsive (`.sheet--responsive`) = `position:fixed`; at M+ becomes a centered modal (`max-width:420px`, `max-height:85vh`, fade+scale entrance). Z-index 4.

---

### `SignInSheet.vue`
"SIGN IN" bottom sheet (Figma 4863:14324). No dimming scrim — page behind stays interactive. Reads `useAuth` (`signInSheetOpen`, `closeSignInSheet`, `startSignIn`).

**Structure:**
- No scrim; panel only (`pointer-events:auto`); `z-index:4` (shares layer with CheckoutSheet — mutually exclusive)
- Header: "Sign in" + `×`
- Body: **"Sign in with COD:M"** black-fill button (`--bg-action-signin`, logomark + label + `open_in_new` icon) → `closeSignInSheet(); startSignIn()`; **"⸺ Or ⸺"** separator; **"Check out as a guest"** yellow underline link → closes sheet + scrolls to `#player-account`
- Dismisses on Esc, tap-outside (deferred `pointerdown` listener), or `×`
- Same L3 frosted surface + `sheet` slide-up transition as CheckoutSheet; responsive M+ centered-modal variant included

---

### `AccountPopover.vue`
"YOUR ACCOUNT" popover (Figma 5199:12187). No dimming scrim. Reads `useAuth` (`accountMenuOpen`, `closeAccountMenu`, `signOut`).

**Positioning:** `position:absolute` in the overlay coordinate space, anchored `top: calc(--safe-top + navbar-pad + 32px + navbar-pad + --pad-surface-s)` (8px below navbar bottom), `right: --pad-surface-m` (Grid gutter, right-aligns with avatar). Responsive: `position:fixed` with additional `--toolbar-h` offset. `z-index:5` (above all).

**Structure:**
- L3 frosted surface, border on b/l/r only (no top border), all corners `--radius-container-s`, `transform-origin: top right` (scale-in from avatar)
- Header: "YOUR ACCOUNT" + `×`
- `PlayerCard` with `avatarSrc` supplied
- Sign-out row: top divider, "Sign out" 14px sentence-case label + 20px `logout` icon, yellow (`--text-hyperlink-default`)
- Dismisses on Esc, tap-outside, or scroll

---

### `PlayerCard.vue`
Shared player identity card. Props: `name` (required), `idMasked` (default `**** 9859`), `level` (default `80`), `rank` (default `Rookie 1`), `avatarSrc` (optional).

- When `avatarSrc` is supplied: 48×48 circular avatar (`--size-img-l`, `--radius-badge-full`) left of the info block, gap `--gap-content-default`
- Info block: bold 12px name + soft 12px masked ID; bold 10px level + rank
- Ghost surface + `--border-soft` hairline; `--radius-container-xs`

**Used by:** `AccountPopover` (with avatar), `PlayerAccount` found state (with avatar). **Do not duplicate this markup inline** — use `<PlayerCard>` everywhere a player identity appears.

---

### `SkuCard.vue`
Single SKU tile. Tapping calls `openCheckout(item)` via `useCheckout` — **no-op until signed in or guest-verified**. Visual press: `scale(0.97)` (`--motion-sku-press`). Entrance: `sku-enter` keyframe + `baseDelay + animDelay`. Click-point ripple via `v-ripple` (wave z-index 1, `--fx-ripple-color: rgba(255,255,255,0.10)`).

Key props: `amount` (req), `baseAmount`, `bonusAmount`, `bonusType` (`codashop`→purple / `cp`→blue), `currentPrice` (req), `isBestValue`, `cpIcon`, `apIcon`, `animDelay`, `baseDelay`, `layout` (`'default'` vertical column / `'row'` horizontal).

**`layout='row'`** — horizontal orientation used by `SkuList` in `columns` mode. A `.sku-card__left` wrapper uses `display: contents` in default mode (transparent, zero layout impact) and becomes `flex: 1; flex-direction: column` in row mode. The price block drops `margin-top: auto` and right-aligns. Empty badge slots hide via `.sku-card--row .sku-card__badge-slot:empty { display: none }`.

Amount: 24px bold (H2), letter-spacing `−0.04em` for layout-aware condense (uniform 4px gap to CP icon). Current price: 18px bold (H5). Inner gap 4px. **Best Value badge** condenses via negative `letter-spacing` (not `scaleX`) so the tag box hugs the text. `2px 4px` padding, 2px radius.

**Gradient border (OKLCH):** a `::before` mask-composite pseudo-element creates a 1px gradient ring (`border-image` can't combine with `border-radius`, hence this approach). Gradient runs 160° from `oklch(0.99 0.004 247 / 0.04)` at the top-left to `oklch(0.99 0.004 247 / 0.58)` at the bottom-right — transparent top, bright lower corners. Under `@media (dynamic-range: high)` L exceeds 1.0 (`oklch(1.2 … 247 / 0.65)`) for a genuine glint on wide-gamut panels. Hover brightens the gradient values. The `::before` uses `z-index: 2` and `pointer-events: none`.

---

### `SkuList.vue`
Titled section wrapping a grid of `SkuCard`s. Stagger: `animDelay = index * 90`. Forwards a shared `skuImage` (+ `cpIcon`/`apIcon`) down to every card.

**Base grid** (all `SkuList`s): `display: grid; grid-template-columns: repeat(2, 1fr)` → `repeat(4, 1fr)` at `@container (min-width: 641px)`. Caps at 4 cards per row on wider screens; 2 per row on mobile.

**`layout` prop:** `'wrap'` (default — base grid applies, max 4 columns) or `'columns'` (layout demo — overrides to 1 column on mobile, 2 columns at `@container (min-width: 801px)`). The `--columns` modifier is defined after the base grid rules in source order so cascade always gives it priority. When `layout === 'columns'`, cards receive `layout="row"` (horizontal card orientation).

---

### `SkuImageCard.vue`
Image-led SKU card with two layouts, **store-agnostic** — the variant is chosen by the data layer (`useStoreCatalog`'s `SKU_CARD_VARIANTS`), never by store identity. Used by `CategoryCatalog` for FCM Top Ups. Mirrors `SkuCard`'s motion + haptics exactly: `sku-enter` entrance + `baseDelay + animDelay`, price `fade-in` at `+350ms`, hover lift (`translateY(-2px)`), press `scale(0.97)`, `v-ripple`, and a gated `haptic('select')` on a real `openCheckout()`. **Title is a bare amount — no currency icon** (currency differs per store).

Key props: `amount` (req), `currentPrice` (req), `skuImage`, `originalPrice`, `discountPercent`, `baseAmount`, `bonusAmount`, `bonusLabel`, `loyaltyPoints`, `loyaltyIcon`, `variant` (`'background'` / `'panel'`), `animDelay`, `baseDelay`. The bonus, discount, and inline loyalty (MP) rows render only when their data is present (Top Ups currently ship amount + placeholder price → those rows stay hidden).

**`variant='background'`** (Figma 2563:3197) — the SKU art is an oversized (`132%`), bottom-anchored full-bleed background (`object-position: center bottom`), cropped by the card's `overflow:hidden`; a `--scrim` overlay (`+ blur(0.5px)`) sits above it for legibility; content sits above the overlay (`z-index`). Card has a `min-height` and pins the price to the bottom. Used for **2x FC Points**.

**`variant='panel'`** (Figma 2655:14676) — the SKU art sits in a 1:1 square frame (`aspect-ratio:1/1`, `overflow:hidden`) at the top, oversized + centred (`124%`); text below. Used for **FC Points** and **Silver**.

Both variants reuse the `::before` mask-composite gradient ring and the `fx-skeleton` + `is-loaded` fade (heavy webps) from `SkuCard`/`BestSellerCard`. Amount uses `.text-style-heading-page-title` (H2); price `.text-style-heading-card` (H5, right-origin condense, `--text-hyperlink-default` → brand green in FCM).

---

### `BundleSkuCard.vue`
A bundled SKU (Figma 4843:10166): wide banner art + a breakdown row of child item tiles + title + price. Tapping calls `openCheckout()`. The surrounding event banner is **not** part of this card (it's the same component as the New User promo banner). Tokenised gradient border (`--gradient-border-sku`) + neutral radial fill (`--rarity-gradient-neutral`). Entrance: `bundle-enter` keyframe (fade + 12px rise — `to` carries **no** transform, so no compositor layer is retained that would kill child `backdrop-filter`).

Key props: `bannerImage` (req), `title` (req), `currentPrice` (req), `originalPrice`, `discountPercent`, `items[]`, `skuImage`, `skuOnBanner`, `baseDelay`. Each `items[]` entry is a `BundleItem` prop set.

**Banner composition:** `bannerImage` (2.6:1) renders via `Media` (image **or** video). When `skuOnBanner` is true, the 1:1 `skuImage` is composited as a right-anchored, full-height `object-fit:contain` hero (`.bundle__banner-sku`) above the legibility scrim — used by bundle 2 (plain backdrop + separate hero), while bundle 1 keeps its baked-in banner (`skuOnBanner` false).

All display text condenses via `scaleX(var(--hm-scale))` (title left-origin; price block right-origin) — matches the rest of the type system.

### `Media.vue`
Tiny presentational wrapper that renders a `<video>` (autoplay/loop/muted/playsinline) for `.mp4/.webm/.mov` sources and an `<img loading="lazy">` otherwise (animated webp/gif/apng "just work" in the `<img>` branch). `inheritAttrs` is on, so the consumer's `class` lands on the rendered element — and because it's the component **root**, the parent's scoped-CSS data attribute applies, so a parent rule like `.bundle__banner-img` styles the img/video directly. Props: `src` (req), `alt`, `poster`. Used by `BundleSkuCard` (banner + SKU overlay) and the optional `App.vue` category backdrop.

### `BundleItem.vue`
One child tile in a bundle breakdown. Square SKU image on a **rarity-graded** background (`rarity` → `--rarity-gradient-{mythic|legendary|epic|rare}`, default `--rarity-gradient-neutral`), tokenised gradient border, an optional **tag pill** (Bonus / Loyalty — `--bg-indicator-prominent-subtle` bg, `--text-error-inverse` text) and a **quantity badge** (`--bg-indicator-neutral-default`).

Props: `image` (req), `rarity`, `tag` (`{ label }`), `quantity`. Tag/qty text condenses via an inner `.bundle-item__condense` span so the pill box itself isn't scaled.

### `CategoryNav.vue`
Sticky-bottom L3 category nav (Figma 5100:19182). Mounted in the `#overlay` slot; `position: absolute` framed / `fixed` responsive (the `isMobile` pattern). Frosted bar (`--gradient-sheet-panel` + blur), top hairline, `--shadow-nav`. Slides up on load (`--motion-nav-enter`, ~700 ms delay).

Props: `tabs: [{ id, label }]`, `isMobile`. Behaviour:
- **Scroll-spy** — `IntersectionObserver` over each `document.getElementById(tab.id)`; root = `.device__screen` (framed) or `null`/viewport (responsive); the most-visible section sets `activeId`. Rebuilds on device switch.
- **Scroll-to** — tapping a tab `scrollIntoView`s its section (reduced-motion → instant).
- **Follow** — when `activeId` changes (spy or tap), the nav scrolls horizontally to centre that tab (`centerActiveTab`).
- **Drag + fades** — horizontal drag via `useDragScroll`; edge fades (`--gradient-scroll-fade-left/right`) appear per side when tabs are hidden that way.

Active tab: 2px yellow top border (`--border-weight-action`) + `--text-hyperlink-inverse`. Tab labels condense via `.cat-nav__label`.

---

### `BestSellerCard.vue`
HDR hero card (and compact carousel tile). Tapping calls `openCheckout()` via `useCheckout`.

| Mode | Class | Image height | Effects |
|---|---|---|---|
| Hero | — | 128px | `fx-glow-border--hdr` (conic OKLCH border) + `fx-bloom` (breathing halo) |
| Compact | `bestseller__card--compact` | 104px | image shimmer (`::after`, 4.5s champagne), `overflow:hidden`, no border/bloom |

Hover: `translateY(-2px)`; press: `scale(0.98)`.

---

### `BestSellerCarousel.vue`
Horizontal compact-card row. Heading prop default: `'BEST SELLERS'` (plural). Taps fall through to `BestSellerCard` → `useCheckout`. **Header is inset** to the gutter while the **card list bleeds** to the screen edges (see §2).

**Mouse drag** is delegated to `useDragScroll` (§6) — pointer-capture, momentum, and >6px click-suppression so a drag-scroll never opens the checkout sheet. Chevron clicks call `stop()` first. Touch uses native pan-x.

**Card width:** XS/S `62.5%` of container (always scrolls); M/L `(100% - 16px) / 3` + `min-width: 207px`. Chevrons appear only on overflow (`hasOverflow`), disabled state tracks `canLeft`/`canRight`.

---

### `StoryCarousel.vue`
Instagram-story slideshow. **Full bleed** on XS/S, centered 2/3 on M/L (`Span size="carousel"`).

| Prop | Default | Notes |
|---|---|---|
| `slides` | `[]` | `{ portrait, landscape, heading, ctaLabel, ctaTarget }` |
| `loop` | `true` | |
| `autoplay` | `true` | |
| `interval` | `5000` | ms per slide |

CTA: `v-if="slide.ctaLabel"` — conditional, per-slide. No fallback. The Boys slide ships with `ctaLabel: null`. When a slide sets `ctaTarget` (a section id), the button smooth-scrolls to `document.getElementById(ctaTarget)` via the `onCta` handler (logic lives in `<script setup>`, not the template — `document` isn't in template scope). The first slide targets `cat-cp`.

Progress bars: animation-driven (no JS timer) — `@animationend` on the fill fires `next()`. Tap zones: left/right halves fall through the pointer-events-none content layer.

---

### `PromoBanner.vue`
Image banner with optional icon + optional title (HTML) + subtext + 0.72 overlay scrim. Icon block renders only when `icon` is set (no placeholder); title only when `title` is set — so it doubles as a description-only banner.

**Countdown tag:** when `endsAt` (ms epoch) is supplied, a frosted chip (`schedule` MaterialIcon + `{countdownLabel} {Dd HHh MMm}`) renders above the description, ticking once a second (informational → runs regardless of reduced-motion; interval cleared on unmount). Chip text condenses via an inner `.promo-banner__countdown-text` span (box keeps its padding). Used by the Bundle category banner.

### `PlayerAccount.vue`
Signed-out "YOUR COD:M ACCOUNT" guest Player ID entry (Figma 5041:16027). Rendered in App.vue right after StoryCarousel, `id="player-account"`, gated `v-if="!signedIn"`. Entrance: `slide-down` + `baseDelay=180`.

- **Player ID input** — text field; blur or Enter starts a ~1.1s simulated lookup (`status`: `idle → loading → found`). Donut spinner overlays the input while loading.
- **Instruction chips** (Find UID / Find Player ID / Find Nickname) — always visible; clicking a chip expands the instruction panel below it (`grid-template-rows: 0fr → 1fr` accordion). Clicking the active chip again collapses it. Panel is hidden by default.
- **Found state** — `<PlayerCard :name="playerId" :avatar-src="assets.content.avatar" …>` replaces the chips. Reaching `found` calls `setGuestVerified(true)` + `setGuestPlayerName(playerId)` on `useCheckout`, unlocking guest checkout. Editing re-locks both.

---

## 8. Assets (`src/img/`)

Assets now live under `src/stores/codm/img/` and are registered in `useStoreAssets.js`.

| Key (`assets.*`) | File | Use |
|---|---|---|
| `brand.wordmark` | `brand/codm-wordmark.svg` | NavBar + SignInLoader |
| `brand.logomark` | `brand/codm-logomark.svg` | SignInSheet button + QR overlay center |
| `brand.cpIcon` / `brand.apIcon` | `brand/cp-icon.svg` / `ap-icon.svg` | Currency coins |
| `brand.qrCode` | `brand/qr-code.webp` | Desktop sign-in QR |
| `brand.coda` | `brand/coda.svg` | Checkout footer |
| `brand.rating` | `brand/rating.svg` | Checkout footer, below Buy Now |
| `content.avatar` | `content/Avatar.webp` | NavBar avatar + PlayerCard |
| `content.slide*` | `content/slide-*.jpg` | StoryCarousel portrait/landscape pairs |
| `pc.*` | `pc/*.svg` | Payment channel logos |

Figma asset URLs (BestSeller image, promo banner, hall icon) are in `App.vue` and expire after 7 days — replace with local/CDN assets for production.

---

## 9. Typography

- Family: `'Hitmarker Text VF'` backed by static `HitmarkerNormal-{weight}.woff2`
- **Condense:** `transform: scaleX(var(--hm-scale, 0.82))` on display text. Left-aligned: `transform-origin: left center`; right-aligned prices: `right center`; centered headings: `center center`.
- Amount text uses **negative `letter-spacing: −0.04em`** instead of `scaleX` — letter-spacing affects layout width, giving a uniform 4px gap to the CP icon across all digit counts (88–58000).

---

## 10. Motion & accessibility

Full motion catalog: [`motion-tokens.md`](./motion-tokens.md). Key rules:
- All animations collapse under `prefers-reduced-motion` (global rule)
- Motion is never the only signal of a state change
- Spring only for delight (snackbar); decelerate/accelerate for orientation (sheets, drawer)
- OKLCH action color with `@media (dynamic-range: high)` boost — superluminant gold on P3/HDR

---

## 11. Gotchas (don't regress)

1. **`@import` after `@tailwind` is dropped** → token CSS is imported in `main.js`.
2. **No comma-easing in animation/transition shorthand** → use longhands.
3. **Running border needs `overflow: visible`**; compact card uses `overflow: hidden` — keep mutually exclusive.
4. **`animation-fill-mode: both` + a static `transform` conflict** — the badge runs a `pop` (scale) keyframe on the outer element, so its text must NOT carry a static `scaleX`. The badge text now condenses via negative `letter-spacing` (also fixes the tag being too wide). Generally: don't put a static transform on an element that has a transform keyframe with `fill-mode: both`.
5. **Container queries require `container-type` ancestor** — that's `.device__screen`. Silently no-ops outside it.
6. **`snackbar-drop` keyframe** must include `translateX(-50%)` in every step or the snackbar jumps right on exit.
7. **`position:fixed` in overlay** — breaks when any ancestor has `transform`. The responsive overlay uses `position:absolute` instead; the NavDrawer panel still fills the viewport because the `device--none` wrapper is `min-height:100dvh`.
8. **Drag-scroll click-suppression** — `useDragScroll` swallows the trailing click after a >6px drag (capture-phase) so a drag-scroll never opens a card / fires a tab. If you add a new click handler inside a draggable scroller, test with a slow drag to confirm it doesn't fire. New horizontal scrollers should use `useDragScroll`, not a hand-rolled drag.
9. **`useCheckout.openCheckout()`** — no-op unless `signedIn` **or** `guestVerified` (a guest who entered a valid Player ID via `PlayerAccount`). SKU cards are intentionally inert until the account is identified.
10. **`container-type` traps `position:fixed`** — `container-type: size/inline-size` establishes a containing block for fixed descendants (same as `transform`). The `.device__overlay` deliberately has none so the desktop loader/checkout-modal/snackbar can pin to the viewport. Don't re-add it unless an overlay component needs `@container` (none do today).
11. **New display text must condense** — any Hitmarker text needs `transform: scaleX(var(--hm-scale))` (left/right/center origin per alignment), or it renders ~18% too wide. For a pill/badge **with a background**, condense an inner text span — never the box (scaling the box squashes its padding). Recurring regression: Bundle + CategoryNav both shipped too-wide before this was added. See [`typography.md`](../../typography.md).
12. **`v-ripple` on flex/grid containers** — the wave `<span>` receives `position:absolute; pointer-events:none` as **inline styles** in the directive, not relying on the CSS rule alone. This prevents a one-frame flash where the unstyled span participates as a flex item before CSS applies (repro: PC channel cards grew tall on click). Always set structural properties inline when injecting DOM nodes into flex/grid parents.
13. **`v-ripple` requires `overflow:hidden`** — the directive adds `fx-ripple` (which sets `overflow:hidden`) automatically. Do NOT add `v-ripple` to components that need `overflow:visible` for a border effect (e.g. `BestSellerCard` with `fx-glow-border--hdr` — the `::before` ring extends 1.5px outside the box and would be clipped).

---

**Last updated:** June 2026 · prototype v0.9.1
