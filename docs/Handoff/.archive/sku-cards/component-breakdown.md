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
    │   ├── Snackbar       ← z-5  (success toast; above all sheets; screen-bottom framed, viewport-bottom responsive)
    │   ├── CheckoutSheet  ← z-4  (ORDER SUMMARY; bottom sheet mobile, centered modal on M+ responsive)
    │   ├── ItemSummarySheet ← z-4  (ITEM SUMMARY; bundle breakdown; morphs into CheckoutSheet on Buy Now)
    │   ├── ClaimGiftSheet ← z-4  (CLAIM GIFT / GIFT CLAIMED; gift-claim confirm + success views)
    │   ├── SignInSheet    ← z-4  (SIGN IN sheet; no scrim; mutually exclusive with CheckoutSheet)
    │   ├── AccountPopover ← z-5  (YOUR ACCOUNT popover; no scrim; anchored below navbar)
    │   └── CommandConsole ← z-6  (dev `/` command palette; blurred scrim; floats above all overlays)
    └── NavBar             ← in-app top bar
    └── ResellerBanner     ← FCM only (v-if="isFilter") — compliance notice, full-bleed L3 surface
    └── <section id="cat-…"> × N, each: <Grid><Span size="…"> … </Span></Grid>
        1. StoryCarousel        (Span size="carousel")                       — no id (hero, not a category)
        1b. PlayerAccount       (Span size="content")        — signed-out only (v-if="!signedIn")
        2. BestSellerCard       (Span size="content")        id="cat-best-seller"
        3. BestSellerCarousel   (Span size="carousel" — header inset, list full-bleed)
        4. PromoBanner (countdown) + BundleSkuCard × 2        id="cat-bundle"
        5. GIFTS heading + GiftGrid → GiftSkuCard × 3         id="cat-gifts"
        6. PromoBanner + SkuList ("New Users Promo")         id="cat-new-users"
        7. SkuList ("CP", size="content")                    id="cat-cp"
        8. CategoryBanner + SkuImageList ("CP Deals" — new-user discount, image cards) id="cat-cp-img-newuser"
        9. SkuImageList ("Buy CP" — regular CP, image cards) id="cat-cp-img"
```

**Carousel sections use `size="carousel"`** — full **bleed** (edge-to-edge, no side padding) on XS/S phones, then centered 2/3 (8 of 12 cols) on M/L, same as `content`. Content sections (hero card, SKU lists, bundle) use `size="content"` (full width within the 12px gutters on XS/S, centered 2/3 on M/L). **BestSellerCarousel** is a hybrid: it sits in a `carousel` Span but pads its own header to the gutter (`.bs-carousel__header { padding-inline: var(--pad-m) }`, reset at ≥801px) so only the card list bleeds.

**Section ids** (`cat-best-seller`, `cat-bundle`, `cat-gifts`, `cat-new-users`, `cat-cp`, `cat-cp-img-newuser`, `cat-cp-img`) are the scroll-spy / scroll-to anchors consumed by `CategoryNav` (§7).

**Entrance cascade** — section `baseDelay` values:
`story 100 → account 180 → hero 250 → carousel 450 → bundle 550 → gifts 620 → promo 720 → cp 950 → cp-deals 1050 → buy-cp 1150` (ms). `CategoryNav` slides up last (~700 ms, `--motion-nav-enter`).

**Data** lives in `App.vue` (`stories`, `bestSeller`, `bestSellerCarousel`, `bundle`, `gifts`, `promoItems`, `cpItems`, `cpImageNewUser`, `cpImageRegular`, `categories`). Swap for API data in production. SKU items now carry an optional `rarity` (`mythic|legendary|epic|rare`) and `skuImage` (square product art, shown in the checkout thumb).

---

## 3. Design tokens

| File | Contents |
|---|---|
| `src/style.css` | Global resets, `@font-face` (Hitmarker), color/spacing tokens, font-condense block. Action yellow, input focus ring, and bonus text defined in **OKLCH** (`--text-hyperlink-inverse`, `--bg-action-primary`, `--border-input-focus`, `--text-web-bonus-codashop`, `--text-web-bonus-cp`) |
| `themes/codm.css` | `--text-bonus-amount: var(--palette-primary-400)` — bright warm yellow (step below the CTA's primary-500) for bonus breakdown amounts in SkuCard + BestSellerCard. Body-font evaluation overrides (`[data-body-font="barlow|inter"]`) — demo only, remove once a pairing is chosen. |
| `src/tokens/motion.css` | Base motion library (durations, easings, semantic composites incl. snackbar tokens) |
| `src/tokens/motion-sku.css` | Project motion tokens (`--motion-sku-*`, OKLCH `--hdr-*`), `@media (dynamic-range: high)` boost for action yellow |
| `src/tokens/keyframes.css` | `@keyframes` (sku-enter, loading-indeterminate, snackbar-drop, story-progress, bloom-pulse…) + `@property --angle` |
| `src/tokens/effects.css` | `.fx-*` utilities: `fx-shimmer`, `fx-shimmer--hover`, `fx-skeleton`, `fx-ripple` (+ `fx-ripple__wave`), `fx-glow-border--{hdr,dual,rotate,pulse,camo-breathe,hud,trace}`, `fx-bloom` |
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
| XS | < 641px | 8 | `--gap-grid-gutter` (8px) | `--gap-grid-margin` (12px) |
| S | 641–800px | 8 | `--gap-grid-gutter` (8px) | `--gap-grid-margin` (12px) |
| M | 801–1279px | 12 | 12px (Phase 3 — `--gap-grid-gutter-m` pending) | `--gap-grid-margin` (12px) |
| L | ≥ 1280px | 12 | 16px (Phase 3 — `--gap-grid-gutter-l` pending) | 16px (Phase 3 — `--gap-grid-margin-l` pending) |

**Token note (v0.29.0):** XS/S gap and XS/S/M pad-X now reference `--gap-grid-gutter` and `--gap-grid-margin` respectively. M/L gap + L pad-X remain hardcoded pending their own tokens (tagged Phase 3 in `Grid.vue`). ⚠️ The `carousel` Span's `-12px` bleed cancellation stays hardcoded — it must match Grid's XS/S `padding-left/right` literally.

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
| `src/components/DeviceToolbar.vue` | Segmented switcher (`v-model:device`) + store dropdown (`useTheme`) + DEMO body-font dropdown (`useBodyFont`, COD:M only) + version label (right-aligned, reads `version` from `package.json`). **(v0.29.0)** Library toggle button (`view_module` icon, `useLibrary().toggle()`) added to the dev-tools segment — hidden in store-locked builds. |
| `src/composables/useDeviceScale.js` | Scales the framed device to fit window height (`transform: scale`) |

**`#overlay` slot** (`.device__overlay`, `z-index:40`) — sibling of `.device__screen` for drawers/modals that must cover the screen without scrolling. Framed: `position:absolute`, inset by bezel, `overflow:hidden`, carries `--safe-top`. **Responsive:** `.device__overlay--responsive` uses `position:fixed; top:var(--toolbar-h,0px); right:0; bottom:0; left:0` — viewport-bounded, starting just below the DeviceToolbar. `App.vue` measures the toolbar height on mount (`toolbarRef.$el.offsetHeight`) and writes it to `--toolbar-h` on `:root`. No ancestor `transform` exists in responsive mode, so `fixed` resolves to the viewport (safe here; framed mode can't use `fixed` because `transform:scale()` is an ancestor). The overlay has **no `container-type`** (would trap fixed descendants). **Framed:** `position:absolute`, bounded to the screen box via bezel inset.

**Mobile detection proxy:** `device !== 'none'` — used by `SignInLoader` to switch between mobile app-loader and desktop QR variants.

---

## 6. State composables

### `src/composables/useAuth.js`
Singleton (module-level refs). Manages simulated sign-in flows for all stores.

| Export | Type | Description |
|---|---|---|
| `signedIn` | ref(Boolean) | User is authenticated |
| `signingIn` | ref(Boolean) | Loader is showing (5s countdown) |
| `snackbarVisible` | ref(Boolean) | Success snackbar is showing |
| `snackbarContent` | ref(Object) | `{ title, text }` data-driven toast copy (default: sign-in copy) |
| `showSnackbar(content?)` | fn | Fire the snackbar; optional `content` arg overrides the default sign-in copy |
| `signInSheetOpen` | ref(Boolean) | "Sign in" sheet is visible |
| `eaSignInOpen` | ref(Boolean) | EA Account sign-in overlay visible (FCM flow) |
| `konamiSignInOpen` | ref(Boolean) | KONAMI ID sign-in overlay visible (eFootball myKONAMI flow) |
| `accountMenuOpen` | ref(Boolean) | "Your account" popover is visible |
| `playerName` | ref(String) | Display name shown after sign-in |
| `startSignIn()` | fn | COD:M / eFootball in-app flow; guarded re-entry; starts 5s timer |
| `cancelSignIn()` | fn | Aborts in-flight sign-in |
| `startEaSignIn()` | fn | Opens EA Account overlay (FCM) |
| `completeEaSignIn(name)` | fn | Closes EA overlay + completes auth |
| `cancelEaSignIn()` | fn | Closes EA overlay without auth |
| `startKonamiSignIn()` | fn | Opens KONAMI ID overlay (eFootball myKONAMI) |
| `completeKonamiSignIn(name)` | fn | Closes KONAMI overlay + completes auth |
| `cancelKonamiSignIn()` | fn | Closes KONAMI overlay without auth |
| `dismissSnackbar()` | fn | Manually close snackbar |
| `signOut()` | fn | Reset to signed-out; also closes account popover |
| `openSignInSheet()` | fn | No-op if already signed in |
| `closeSignInSheet()` | fn | Closes the sign-in sheet |
| `openAccountMenu()` | fn | Opens the account popover |
| `closeAccountMenu()` | fn | Closes the account popover |

**COD:M flow:** SIGN IN → `openSignInSheet()` → sheet → `startSignIn()` → loader 5s → `signedIn = true` → snackbar.  
**FCM flow:** sheet → `startEaSignIn()` → `EaSignInPage` overlay → `completeEaSignIn()`.  
**eFootball myKONAMI flow:** sheet/page-section → `startKonamiSignIn()` → `KonamiSignInPage` overlay → `completeKonamiSignIn()`.  
Avatar tap → `openAccountMenu()`.

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

`item` shape: `{ amount, label, subtitle, baseAmount, bonusAmount, bonusType, bonusLabel, currentPrice, skuImage, loyaltyPoints }`. `label` (human-readable product name, e.g. "Daily Booster D") takes precedence over `amount` in the banner title — if absent the sheet falls back to `amount + currencyLabel`. `skuImage` (square product art) renders in the sheet's banner thumbnail; falls back to the gloss placeholder when absent.

### `src/composables/useGiftClaim.js`
Singleton (module-level refs). Manages the gift-claim sheet — a sibling of `useCheckout`.

| Export | Type | Description |
|---|---|---|
| `claimSheetOpen` | ref(Boolean) | Sheet visibility |
| `selectedGift` | ref(Object\|null) | Gift being claimed `{ id, title, subtitle, image }` |
| `claimSuccess` | ref(Boolean) | `false` = confirm view, `true` = success view |
| `requiresAccount` | ref(Boolean) | Whether the inline gamer-ID form is shown (captured once at open time) |
| `openGiftClaim(gift)` | fn | Opens sheet; sets `requiresAccount = !signedIn` at open time; returns `true` |
| `confirmClaim()` | fn | Adds gift id to `claimedIds`, flips to success view (triggers sheet bg glow) |
| `closeGiftClaim()` | fn | Closes sheet |
| `isClaimed(id)` | fn | Returns `true` if `id` is in the confirmed `claimedIds` set |
| `pendingEaGift` | ref(Object\|null) | Gift stored before EA sign-in redirect; auto-confirmed when sign-in completes (v0.17.0) |

**`requiresAccount` is frozen at open time** (not a reactive computed). If it were derived from `!signedIn && !guestVerified`, verifying inline would flip it to `false`, unmounting `PlayerAccount`, whose `onBeforeUnmount` resets `guestVerified` → remount/flicker loop. Capturing it once prevents this.

**Sign-out reset (v0.17.0):** `watch(signedIn)` has a second branch — when `signedIn` goes `false`, `claimedIds.clear()` + `pendingEaGift.value = null`. This ensures a signed-out user sees unclaimed gift cards again.

**EA auto-confirm (v0.17.0):** when `signedIn` goes `true` and `pendingEaGift` is set, waits 200ms (overlay exit transition) then sets `selectedGift`, adds to `claimedIds`, flips `claimSuccess = true`, opens the sheet — landing the user directly on the success view.

**Success haptic (v0.17.1):** `confirmClaim()` and the EA auto-confirm path both call `triggerHaptic('success')` (`[10, 40, 20]`) after the claim is recorded. Uses `triggerHaptic` (bare export) rather than `useHaptics()` composable because the singleton runs outside component context.

### `src/composables/useCommandConsole.js`
Singleton (module-level refs). Holds the open/close state of the `/` command palette — shared between the global keydown listener in `App.vue` and the `CommandConsole` overlay without prop-drilling.

| Export | Type | Description |
|---|---|---|
| `open` | readonly ref(Boolean) | Palette is visible |
| `openConsole()` | fn | Show the palette |
| `closeConsole()` | fn | Hide the palette |
| `toggleConsole()` | fn | Toggle visibility |

---

### `src/composables/useSheetTransition.js`
Tiny module-level singleton (added v0.16.2). Carries the panel height from a closing sheet to the next opening sheet so the enter animation can start from the same height and resize, rather than sliding up from off-screen.

| Export | Type | Description |
|---|---|---|
| `handoffHeight` | ref(Number\|null) | Panel height (px) captured in the closing sheet's CTA handler; read and cleared by the entering sheet's `@before-enter` hook |

**Usage pattern:** closing sheet sets `handoffHeight.value = panelRef.offsetHeight` immediately before calling the open/close functions; entering sheet reads it in `@before-enter`, saves it to a local `_handoffH`, clears `handoffHeight.value = null`, then uses `_handoffH` in `@enter` to animate from that height to the natural content height.

---

### `src/composables/useFavicon.js`
Not a singleton — call once from `App.vue` `<script setup>`. Watches `useStoreAssets().brand.favicon` via `watchEffect` and upserts a `<link rel="icon" type="image/svg+xml">` in `<head>`. In the runtime multi-store build the favicon switches instantly when the store is changed from `DeviceToolbar`; in a store-locked build only that store's asset is bundled and the tag is written on mount. Each store module exposes `assets.brand.favicon` pointing at its logomark SVG — COD:M: `codm-logomark.svg`, FCM: `FCM Logomark.svg`, eFootball: `logomark.svg`.

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

### `ResellerBanner.vue`
FCM-only full-bleed compliance notice, placed between `NavBar` and `StoryCarousel` (`v-if="isFilter"` in App.vue). No Grid wrapper — applies grid-matching left/right padding directly via `@container`.

- **Surface:** `--bg-sheet` (L3), no border.
- **Padding:** 4px top/bottom (`--pad-surface-xs`) on the bar row; left/right matches grid — `--pad-surface-m` (12px) default, `--pad-surface-l` (16px) at `@container (min-width: 1280px)`.
- **Short message:** "THIS WEBSTORE IS OPERATED BY CODA." — `text-style-utility-label-uppercase`, `--text-body-default`.
- **Chevron toggle** (4px gap right of text): tapping expands the long message "CODA IS AN AUTHORIZED RESELLER OF ELECTRONIC ARTS' EA SPORTS FC™ MOBILE CONTENT.". Chevron rotates 180° on expand via `--motion-duration-exit / --motion-ease-standard`. Long panel shown/hidden via `.is-open` CSS class.
- **`isExpanded`** ref; accordion available at all screen sizes.

---

### `NavBar.vue`
In-app top bar. Hamburger + CODM wordmark left; auth control right. Reads `useAuth`.

- **Signed out** → SIGN IN button calls `openSignInSheet()`. Stores with `config.checkout.loyalty && assets.brand.loyaltyIconColour` also render a standalone loyalty icon to the left of the button. The gate is `config.checkout.loyalty` — not the asset alone — so a store with a pre-wired icon but no active programme (e.g. COD:M pre-launch) shows nothing.
- **Signed in** → player's in-game avatar image (`assets.content.avatar`, 30×30 circle); tap calls `openAccountMenu()`. Stores with `config.checkout.loyalty && config.profile.showLoyaltyPill && assets.brand.loyaltyIconColour` render a loyalty-points pill (icon + formatted balance) to the left of the avatar. Same `config.checkout.loyalty` gate applies.
- **`config.navbar.hideSignIn`** — when true, suppresses both the sign-in button **and** the avatar (used by eFootball, which surfaces auth via `PageSignInSection` instead).

Spring-pop `out-in` transition (`nav-auth`) on the auth control swap. Scroll-aware hide/show via `translateY(-110%)`. Emits `menu` (burger). Loyalty points formatted via `formatNumber`. Background uses `--bg-navbar` + `backdrop-filter: blur(var(--blur-container, 8px))`.

**v0.22.0:** Sign-in button label token corrected from `--text-body-default` → `--text-on-action-tertiary` (semantic re-labelling, same resolved near-white). Transition extended with `opacity var(--motion-btn-activate), transform var(--motion-btn-activate)`; `:disabled` rule added (`opacity 0.4; transform: scale(0.97)`).

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

**v0.22.0 activation transition:** `.sheet__checkout` transition extended to include `opacity var(--motion-btn-activate), transform var(--motion-btn-activate)`. New `:disabled` rule: `opacity 0.4; transform: scale(0.97)`. Pre-wires the global disabled→enabled animation pattern for future use.

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

**v0.15.0 token fixes:** `.sheet__bonus` now uses `--text-bonus-amount` (was `--text-body-default`). `.sheet__pc-card.is-selected` now uses `--bg-card-selected` (was `--bg-card-success`). `.sheet__checkout-label` gains `transform-origin: center center` so the Hitmarker condense scales from the button centre (matching `ClaimGiftSheet`).

**v0.17.1 success haptic:** The checkout CTA (`BUY NOW` / `config.checkout.actionLabel`) fires `triggerHaptic('success')` (`[10, 40, 20]`) on `@click`, after the `v-haptic:confirm` press buzz. Applies to all stores (COD:M, FCM, eFootball) since `CheckoutSheet` is shared.

**v0.16.2 handoff enter:** When opened via the upsell CTA in `ClaimGiftSheet`'s success view, `CheckoutSheet` enters via a height-resize rather than the normal `translateY(100%)` slide. `useSheetTransition.handoffHeight` carries the gift-sheet panel height; `@before-enter` reads it, adds `.sheet--handoff-enter` (suppresses the translateY, fades instead), locks the panel at that height, and `@enter` / `@after-enter` animate it to the natural checkout height via `.sheet__panel--resizing`. Normal opens (tapping a SKU card) use the standard slide-up unaffected.

**v0.19.0 footer surface:** Footer `background-image` changed from `var(--bg-sheet)` → `var(--bg-sheet-footer)`, allowing stores to assign a distinct surface level to the footer without changing the sheet body.

---

### `ClaimGiftSheet.vue`
Gift-claim sheet (sibling of `CheckoutSheet`). Reads `useGiftClaim`. Two views behind the same header — confirm and success — with animated `mode="out-in"` transitions on the body, title, and CTA. Mounted in `#overlay` slot alongside `CheckoutSheet`.

**Confirm view:** label ("You are about to claim \<title\>") + SKU banner (gift art + title + subtitle). When `requiresAccount` is true and the store is NOT an EA-flow store, `<PlayerAccount :base-delay="0" />` appears below the banner for inline gamer-ID entry. "Claim Gift" CTA is disabled (`.sheet__cta--disabled`, opacity 0.4, `transform: scale(0.97)` v0.22.0) until `signedIn || guestVerified`.

**v0.22.0 activation transition:** `.sheet__cta` transition extended to include `opacity var(--motion-btn-activate), transform var(--motion-btn-activate)`; `.sheet__cta--disabled` gains `transform: scale(0.97)`. When the account is identified the CTA animates from 40% opacity / 97% scale to full presence over 250ms ease-out.

**EA sign-in variant (v0.17.0):** FCM uses `config.signIn.flow === 'ea-redirect'`. When `showEaSignIn` is true (requiresAccount + isEaFlow + !signedIn), the footer renders an EA button (`.sheet__cta--ea`, `--bg-action-signin` red) instead of the disabled Claim CTA. Tapping stores the pending gift in `useGiftClaim.pendingEaGift`, closes the sheet, and calls `startEaSignIn()`. `useGiftClaim`'s `watch(signedIn)` detects the completed sign-in, waits 200ms for the overlay exit transition, then re-opens the sheet directly in `claimSuccess = true` state.

**Success view:** "\<title\> has been sent to your COD:M inbox." + optional upsell banner (`:upsell-item` prop, best-seller). Upsell CTA shows `upsellItem.currentPrice`; tapping calls `openCheckout(upsellItem)` then `closeGiftClaim()`. `upsellItem` is `isFilter ? fcmBestSeller : bestSeller` (App.vue) — FCM upsells Daily Booster D, COD:M upsells its own best seller.

**Transitions:**
- **`claim-body` (`mode="out-in"`) — v0.16.2 resize:** confirm fades out (opacity only, no translateY); `@before-leave` locks the panel height inline; `@enter` measures the success view's natural height and animates the panel via `.sheet__panel--resizing` (`transition: height`); `@after-enter` clears inline styles. The panel appears to organically resize rather than stacking layers.
- `claim-title` + `claim-footer`: crossfade only.
- **Success bg glow (v0.16.1):** `.sheet__success-overlay` — an absolutely-positioned div, last child of the panel, `background: var(--bg-indicator-success-default)`. Class `--active` added when `claimSuccess` is true; triggers `success-bg-glow` keyframe: `opacity 0 → 0.25 → 0` over `--motion-duration-slowest` (1800ms), delayed by `calc(--motion-duration-exit + --motion-duration-slow)` (550ms) so it fires after the body out-in transition settles. GPU-safe (`opacity` only).
- **Sheet handoff exit (v0.16.2):** When handing off to `CheckoutSheet` (upsell CTA), `@before-leave` pins the panel's `transform: none; transition: none` inline (bypassing the slide-down CSS); `@leave` sets `transition: opacity` and `opacity: 0` for a fade-only exit. Uses `el.querySelector('.sheet__panel')` instead of the template ref because Vue may clear refs before the leave hook fires.

**v0.19.0 KONAMI sign-in flow:** `isKonamiFlow` computed checks `config.signIn.mobile/desktop.includes('mykonami')`. When true and signed out, `PlayerAccount` is hidden and a KONAMI ID Sign In button (`.sheet__cta--mykonami`, `--bg-action-mykonami`, `text-style-utility-action-bold`, natural casing, no icon) renders in the footer. `onKonamiSignIn()` stores the pending gift in `pendingEaGift`, closes the sheet, calls `startKonamiSignIn()` — the existing `watch(signedIn)` watcher in `useGiftClaim` fires after sign-in completes. Footer surface: `var(--bg-sheet-footer)`.

Props: `isMobile` (Boolean), `upsellItem` (Object). Z-index 4.

---

### `SignInSheet.vue`
"SIGN IN" bottom sheet (Figma 4863:14324). No dimming scrim — page behind stays interactive. Reads `useAuth`.

**Structure:**
- No scrim; panel only (`pointer-events:auto`); `z-index:4` (shares layer with CheckoutSheet — mutually exclusive)
- Header: "Sign in" + `×`
- Body: one CTA button **per active flow** (computed from `config.signIn`; see below) + **"⸺ Or ⸺"** separator + **"Check out as a guest"** yellow underline link → closes sheet + scrolls to `#player-account`
- Dismisses on Esc, tap-outside (deferred `pointerdown` listener), or `×`
- Same L3 frosted surface + `sheet` slide-up transition as CheckoutSheet; responsive M+ centered-modal variant included

**Multi-flow routing (`activeFlows`):** the sheet computes which flows to render from `config.signIn`. Legacy stores (`codm`, `fcm`) set `config.signIn.flow` (string) → one button. Multi-flow stores (eFootball) set `config.signIn.desktop` + `.mobile` (arrays) → one button per flow, device-split. Each button dispatches to the appropriate `useAuth` handler: `ea-redirect` → `startEaSignIn()`, `mykonami` → `startKonamiSignIn()`, everything else → `startSignIn()`. CTA label per flow comes from `strings.signIn[flow].cta` (multi-flow) or `strings.signIn.cta` (legacy). The logomark icon is hidden for `mykonami` flow; eFootball flows use `assets.brand.signinLogomark`.

**v0.22.0 activation transition:** `.signin-sheet__codm` transition extended with `opacity var(--motion-btn-activate), transform var(--motion-btn-activate)`; `:disabled` rule added (`opacity 0.4; transform: scale(0.97)`).

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

### `CommandConsole.vue`
Dev-only `/` command palette. **Hidden entirely in store-locked builds** (`__STORE_LOCKED__` flag from `vite.config.js` — no keyboard listener registered, component not mounted). Press `/` anywhere outside a text field to open; type to fuzzy-filter; `↑`/`↓` to navigate; `Enter` to run; `Esc` or scrim-click to close.

**Overlay:** mounted in the `#overlay` slot at `z-index: 6` (above Snackbar). Full-bleed backdrop (`--scrim` + `backdrop-filter: blur(64px)`), centred panel (`min(92%, 420px)` wide, max 70% tall). Fade + 8px lift enter/exit via `--motion-modal-enter/exit`. System font throughout (`--sys-font-family-*` overridden on the panel root so `.text-style-*` classes don't inherit the active store's typeface).

**Command registry** (reactive `computed` — auto-updates on store/auth/font change):
- **Store** — one entry per registered `themes`, active store omitted. In a store-locked build `themes.length === 1`, so no store commands appear (same gate as the DeviceToolbar dropdown).
- **Device** — iPhone / Android / Responsive; active one omitted.
- **Auth** — "Sign in" (routes to `config.signIn.flow` — EA-redirect or sheet) / "Sign out"; toggles on `signedIn`.
- **Navigation** — "Open menu drawer", "Scroll to top", one entry per `categories` section tab.
- **Appearance** — Body font options (`bodyFonts`); only visible where the store ships >1 option (COD:M).
- **Tools** — **(v0.29.0)** "Open component library" (toggles `useLibrary`; navigates to the `#library` page) + "Inspect elements" (toggles `useInspector`; label flips to "Exit inspection mode" when active) + "Take screenshot"; all absent in store-locked builds (`__STORE_LOCKED__` compile-time flag from `vite.config.js`).

**State:** `useCommandConsole` singleton (open/close). Global `/` keydown in `App.vue` `onMounted`; guard: `isTypingTarget(e.target)` skips INPUT/TEXTAREA/SELECT/contenteditable elements.

---

### `InspectorOverlay.vue` + `InspectorPanel.vue`

Handoff inspector — prototype-only dev tool, hidden in store-locked builds (`v-if="!isStoreLocked"` in `App.vue`). Activated from the toolbar (`highlight_alt` button) or `/` command console ("Inspect elements"). Press Esc to exit.

**`InspectorOverlay.vue`** — mounted at the App root (`position:fixed; z-index:9000; pointer-events:none`). Intercepts demo interaction via document **capture-phase** listeners (`click`, `mousedown`, `pointerdown`, `pointermove`) — swallows events before Vue handlers fire, so the demo is non-interactive while CSS animations (bloom, border-spin, shimmer, entrance) keep playing. Hover + selection highlights are `position:fixed` boxes positioned via `translate(rect.left, rect.top)` updated on scroll/resize. Hosts `InspectorPanel`. Receives `:device` from `App.vue` and forwards it to `InspectorPanel` for the Responsive section.

**(v0.26.0)** Bounding-box colour is now a hardcoded Figma-style blue (`#1c6feb`, store-agnostic). An element-name label chip (`describeNode()` output) is anchored to the top-left corner of the selection box and flips inside when the element is near the viewport top. Box-model overlay renders orange (margin) and teal (padding) `position:fixed` strips when enabled.

Mounted at App root (not the `#overlay` slot) — the `#overlay` slot's `overflow:hidden` and the device-frame transform would clip the panel and trap its `position:fixed` descendants.

**(v0.29.0)** `isChrome()` exclusion list extended with library chrome selectors (`.lib__sidebar`, `.lib__topbar`, `.lib__controls`, `.lib__docs`) so the inspector's pointer capture doesn't swallow clicks on those controls. The stage itself (`.lib__stage`) is intentionally excluded so the staged component is fully inspectable.

**`InspectorPanel.vue`** — slide-in side panel (`position:absolute; right:0; width:min(92vw,340px); backdrop-filter:blur(64px)`). Click an element to populate. Sections: Component (name + `.vue` file, component-ancestry chain, DOM breadcrumb for ancestor navigation), Layout, Colour, Typography, Effects, Motion, Responsive. Each field: label · raw value (click to copy) · semantic token chip (click to copy `var(--token)`). Motion section lists keyframe animations + CSS transitions, each matched to `--motion-sys-*` / `--motion-sku-*` tokens with a **Replay** button. Footer: "Copy all as spec" → formatted markdown for a handoff ticket. Monospace font (`ui-monospace` stack). All panel accent colours are hardcoded blue shades (`#6aa3f8` / `rgba(28,111,235,…)`, store-agnostic).

**(v0.26.0 P1)** State picker (Default / Hover / Pressed / Disabled) simulates CSS states on the live element and re-reads computed styles (`buildHoverOverride` / `applyPressedState` / `applyDisabledState` from `inspect.js`). Fields with a tokenisable `kind` but no token match show a `⚠ no token` warning badge (design-system lint). Responsive section shows the nearest container-query ancestor, its type, current inline-size, and the active device frame. Layout section header has a **box model** toggle. Warning count in the footer summarises untokenised values.

**(v0.27.0 P2)** URL-hash deep-link: `InspectorOverlay` writes `#inspect=<selector>` on every selection change (`history.replaceState`); on inspector open it restores the prior selection from the hash (`requestAnimationFrame` defer). Footer secondary row: **Copy as JSON** (full spec as `formatSpecJson` output) + **Copy link** (current `window.location.href`).

**(v0.27.0 P3)** Four new panel sections added:
- **Props** — lists the owning component's declared prop schema (type, required flag) alongside live values; click any value to copy. Default-valued props rendered dimmed.
- **Accessibility** — WCAG 2.1 contrast ratio of the element's text against its effective background (first opaque ancestor), with AA/AA-large/AAA pass badges; `role` and `aria-label` when present.
- **Assets** — scans `<img>` sources + CSS `background-image` URLs in the subtree; thumbnail + filename + per-asset **Download** button.
- **Usage snippet** — paste-ready `<ComponentTag :prop="…" />` invocation built from live props (required always; non-default included; defaults omitted). Copy button in the group title.

Footer additions (v0.27.0): **Copy source** + **Download .vue** rows — fetch the real `.vue` text via Vite's `/@fs<file>?raw` endpoint; hidden when the selected element has no resolved component file.

**(v0.29.0) "View in library" deep-link:** a blue chip button appears below the DOM breadcrumb when the selected component has a matching story in `src/library/registry.js`. Clicking it calls `useLibrary().open(storyId)` — navigates to the `#library` page focused on that story. `registry.js` is imported lazily (dynamic `import()`) so the stories tree stays out of isolated builds even when the inspector is used.

**Singleton:** `src/composables/useInspector.js` — `active`, `selected`, `showBoxModel`, `activeState`, `styleVersion`, `toggle()`, `select(el)`, `close()`, `toggleBoxModel()`, `setState(s)`, `bumpStyleVersion()`. Shared between toolbar, command console, overlay, and panel without prop-drilling.

**Token engine:** `src/composables/useTokenMap.js` — enumerates all `--*` custom properties from `:root`, classifies by kind (colour / length / duration / easing / motion-pair), resolves colour tokens to concrete `rgb()` via probe element. Reverse-matches computed values to the most semantic token (semantic tier wins over `--sys-*` / `--palette-*`). Invalidated + rebuilt on theme switch. Exports `matchToken(value, kind)` and `matchMotionPair(duration, easing)`.

**Helpers:** `src/utils/inspect.js` — `resolveComponent(el)`, `collectStyles` (+ `a11y`, `props`, `assets` in return), `collectAnimations`, `replayAnimation`, `formatSpecMarkdown`, `formatSpecJson`, `elementSelector(el)`, `describeNode`, `containerContext(el)`, `buildHoverOverride(el)`, `applyPressedState(el)`, `applyDisabledState(el)`, `contrastInfo(textColor, bgColor)`, `collectProps(instance)`, `componentUsageSnippet(instance)`, `fetchComponentSource(file)`, `collectAssets(el)`, `assetName(url)`. Each state applicator returns a cleanup fn.

---

### `LibraryViewer.vue` + `StoryStage.vue` (v0.29.0)

Component library viewer — prototype-only dev tool, hidden in store-locked builds. Activated via the `view_module` toolbar button, the `/` command palette ("Open component library"), or by navigating directly to `/#library`. Press the button again or the browser Back button to return to the store.

**Page-swap architecture:** `App.vue` wraps the store shell (DeviceToolbar + `.app__stage`) in `<template v-if="!libraryActive">`. When the library is active the entire store is unmounted — no overlay stacking, no z-index conflicts. `InspectorOverlay` + `LibraryViewer` stay mounted as root siblings (the Specs tab drives the inspector overlay). The `/` global key handler is also gated (`!libraryActive`) so it can't phantom-open the unmounted CommandConsole.

**URL hash routing (no vue-router):** `useLibrary` owns the `#library` hash. `open()` sets `location.hash = 'library'`; `close()` clears it with `history.replaceState`. A `hashchange` listener handles the Back button. Direct load at `/#library` restores the page on mount. The inspector uses only `#inspect=` fragments via `replaceState` (fires no `hashchange`), so the two hash namespaces coexist cleanly.

**`LibraryViewer.vue`** — full-page chrome (`z-index: 8000`, below inspector's `9000`):
- **Sidebar (248px)** — grouped story list (`registry.js` GROUPS), search (fuzzy title filter), per-group expand/collapse.
- **Topbar** — library brand mark (`view_module` icon), close button.
- **Control bar** — Variant segmented control (story's `variants` array), State picker (pass-through to inspector `setState`), Theme segmented control (all 5 stores), Width picker (iPhone 390 / Samsung 384 / Responsive).
- **Stage** — hosts `StoryStage` at the selected width; scrollable; fills remaining height.
- **Docs tabs** — Notes (story `notes` + `rules` prose) and Specs ("Inspect this component" button → `useInspector().open()` + `select(stageRootEl)`).
- **YGODL safe:** `.lib` background is hardcoded `#0c0e16` (never `var(--bg-page)` which YGODL sets to `transparent`).

**`StoryStage.vue`** — the render host for one story variant:
- Sets `container-type: inline-size` on `.stage-host__screen` at the chosen device width, so `@container` queries resolve exactly as in the real `.device__screen`. Same `container-type` also traps `position:fixed` overlay descendants inside the stage (CheckoutSheet stays in the stage).
- **Faithful page backdrop:** `background-color: #0c0e16` (opaque base) + `background-image: var(--page-bg-image, none), linear-gradient(var(--bg-page), var(--bg-page))` — stores with a fixed page art (YGODL, efootball) render it faithfully; solid-colour stores show their real `--bg-page`; a `transparent` `--bg-page` (YGODL) reveals the opaque base rather than the chrome behind it.
- `renderKey` computed (`story.id + variantIndex + theme`) forces remount on change so entrance animations re-fire.
- `setup()/teardown()` hooks per variant prime + reset singleton state (e.g. `useCheckout` for CheckoutSheet story).

**`registry.js`** — uses `import.meta.glob('./stories/*.stories.js', { eager: true })` to discover all story files automatically. New stories appear with zero viewer changes. Exports `GROUPS` (grouped by `story.group`), `getStory(id)`, `findStory({ component, name })` (used by InspectorPanel deep-link).

**`story.js`** — `defineStory(def)` identity/validation helper. Story shape: `{ id, title, group, component, notes?, rules?, variants[{ name, props, setup?, teardown? }], states?, overlay? }`. `overlay: true` flags a taller stage for sheets/drawers.

**Stories shipped (Phase 1):** SkuCard, BundleSkuCard, GiftSkuCard, SkuImageCard, BestSellerCard, SkuTag, NavBar, CheckoutSheet (8 files in `src/library/stories/`). Additional stories are added by dropping `*.stories.js` files in that directory.

**`useLibrary.js`** — module-level singleton composable. API: `{ active, selectedId, variantIndex, open(id?), close(), toggle(), select(id), setVariant(i) }`. `active` is `readonly` outside the composable. Imported by DeviceToolbar, CommandConsole, InspectorPanel, App.vue, and LibraryViewer itself — no prop-drilling.

**Isolation:** `App.vue` uses `defineAsyncComponent(() => import('./library/LibraryViewer.vue'))` only when `!isStoreLocked`. The entire `src/library/` tree (viewer + registry + stories) is code-split into separate lazy chunks and entirely absent from store-locked bundles (`build:codm` produces zero library/registry/stories chunks).

---

### `PlayerCard.vue`
Shared player identity card. Props: `name` (required), `idMasked` (default `**** 9859`), `level` (default `80`), `rank` (default `Rookie 1`), `avatarSrc` (optional), `showRank` (Boolean, default `true`).

- When `avatarSrc` is supplied: 48×48 circular avatar (`--size-img-l`, `--radius-badge-full`) left of the info block, gap `--gap-content-default`
- Info block: bold 12px name + soft 12px masked ID; bold 10px level + rank
- Ghost surface + `--border-soft` hairline; `--radius-container-xs`

**`showRank` prop (v0.19.0):** when `false`, the `MP Rank: …` stat span is hidden. Consumed via `config.profile.showPlayerRank !== false` in `AccountPopover` and `PlayerAccount`. TDR and YGODL set `showPlayerRank: false`.

**Used by:** `AccountPopover` (with avatar), `PlayerAccount` found state (with avatar). **Do not duplicate this markup inline** — use `<PlayerCard>` everywhere a player identity appears.

---

### `SkuCard.vue`
Single SKU tile. Tapping calls `openCheckout(item)` via `useCheckout` — **no-op until signed in or guest-verified**. Visual press: `scale(0.97)` (`--motion-sku-press`). Entrance: `sku-enter` keyframe + `baseDelay + animDelay`. Click-point ripple via `v-ripple` (wave z-index 1, `--fx-ripple-color: rgba(255,255,255,0.10)`).

Key props: `amount` (req), `baseAmount`, `bonusAmount`, `bonusType` (`codashop`→purple / `cp`→blue), `currentPrice` (req), `isBestValue`, `tagLabel` (v0.19.0 — custom badge label, overrides `isBestValue`), `cpIcon`, `apIcon`, `subtitle`, `animDelay`, `baseDelay`, `layout` (`'default'` vertical column / `'row'` horizontal).

**`tagLabel` prop (v0.19.0):** when set, renders a `SkuTag` (variant `value`) with the given label. Takes precedence over `isBestValue`.

**`layout='row'`** — horizontal orientation used by `SkuList` in `columns` mode. A `.sku-card__left` wrapper uses `display: contents` in default mode (transparent, zero layout impact) and becomes `flex: 1; flex-direction: column` in row mode. The price block drops `margin-top: auto` and right-aligns. Empty badge slots hide via `.sku-card--row .sku-card__badge-slot:empty { display: none }`.

**CP icon position:** the CP icon (or text fallback) renders **left** of the denomination number in the title row — image first, then amount span.

**`subtitle` prop:** optional body text rendered below the amount/bonus row in `--text-body-default`.

**Bonus amount colour:** `--text-bonus-amount` (bright yellow, `--palette-primary-400`) applied to `.sku-card__bonus-amount` — subordinate to the CTA yellow (primary-500) to keep the price as the visual priority.

Amount: 24px bold (H2), condensed via standard `scaleX(var(--sys-font-condense))` with `transform-origin: left center` (left visual edge stays flush with the icon gap; dead space sits on the right). Current price: `text-style-heading-sku-title` (H7 — 18px on all stores except YGODL where `--sys-size-h7: 14px`), `transform-origin: right center`. Discount row (`originalPrice` + `discountPercent`) right-anchors both spans (`transform-origin: right center`) so condensed text visually aligns with the price CTA below. Info-column gap `--gap-content-narrow` (4px). **Best Value badge** condenses via negative `letter-spacing` (not `scaleX`) so the tag box hugs the text. `2px 4px` padding, 2px radius.

**Gradient border (OKLCH):** a `::before` mask-composite pseudo-element creates a 1px gradient ring (`border-image` can't combine with `border-radius`, hence this approach). Gradient runs 160° from `oklch(0.99 0.004 247 / 0.04)` at the top-left to `oklch(0.99 0.004 247 / 0.58)` at the bottom-right — transparent top, bright lower corners. Under `@media (dynamic-range: high)` L exceeds 1.0 (`oklch(1.2 … 247 / 0.65)`) for a genuine glint on wide-gamut panels. Hover brightens the gradient values. The `::before` uses `z-index: 2` and `pointer-events: none`.

**CTA spacing (v0.13.3):** `.sku-card__price` gains `padding-top: var(--pad-surface-s)` (8px) so there is a guaranteed minimum floor of breathing room above the price block regardless of card height.

**Selected state (v0.15.0):** `.sku-card--selected` applies `--bg-card-selected` to `.sku-card__bg` + `--border-sku-card-selected` ring on `::before`. Uses `selectedKey` / `sheetOpen` from `useCheckout`; `openCheckout` now receives `itemKey` as second arg.

---

### `SkuList.vue`
Titled section wrapping a grid of `SkuCard`s. Stagger: `animDelay = index * 90`. Forwards a shared `skuImage` (+ `cpIcon`/`apIcon`) down to every card.

**Base grid** (all `SkuList`s): `display: grid; grid-template-columns: repeat(2, 1fr)` → `repeat(4, 1fr)` at `@container (min-width: 641px)`. Caps at 4 cards per row on wider screens; 2 per row on mobile.

**`layout` prop:** `'wrap'` (default — base grid applies, max 4 columns) or `'columns'` (layout demo — overrides to 1 column on mobile, 2 columns at `@container (min-width: 801px)`). The `--columns` modifier is defined after the base grid rules in source order so cascade always gives it priority. When `layout === 'columns'`, cards receive `layout="row"` (horizontal card orientation).

---

### `SkuImageList.vue`
Sibling of `SkuList` that wraps a grid of **`SkuImageCard`**s instead of `SkuCard`s (the two cards take different prop sets — `currencyLabel`/`variant`/`loyaltyIcon` vs `cpIcon`/row layout — so a separate wrapper is cleaner than overloading `SkuList`). Same titled-section shape, `animDelay = index * 90` stagger, and base grid (2-up → 4-up @641px). Props: `title`, `description` (v0.18.1 — optional subtitle below the title, `--text-body-soft`), `items` (req), `currencyLabel`, `loyaltyIcon`, `variant` (default `'panel'`), `baseDelay` — `currencyLabel`/`loyaltyIcon`/`variant` are forwarded to every card; per-item fields ride in via `v-bind="item"`. Used by COD:M's two image-led CP sections — **CP Deals** (`#cat-cp-img-newuser`, new-user discount with `originalPrice`/`discountPercent`) and **Buy CP** (`#cat-cp-img`, regular CP with the web-bonus line) — so the tiered coin art (`cpCoins`) renders on the card face, unlike the text-only `SkuList` CP sections. TDR passes `strings.page.cpImageSectionDesc` as the description prop.

---

### `SkuImageCard.vue`
Image-led SKU card with two layouts, **store-agnostic** — the variant is chosen by the data layer (`useStoreCatalog`'s `SKU_CARD_VARIANTS`), never by store identity. Used by `CategoryCatalog` for FCM Top Ups and by `SkuImageList` for YGODL Regular items. Mirrors `SkuCard`'s motion + haptics exactly: `sku-enter` entrance + `baseDelay + animDelay`, price `fade-in` at `+350ms`, hover lift (`translateY(-2px)`), press `scale(0.97)`, `v-ripple`, and a gated `haptic('select')` on a real `openCheckout()`. **Title is a bare amount — no currency icon** (currency differs per store).

**`tagLabel` prop (v0.19.0):** String, default `null`. When set, renders a `SkuTag` (variant `value`) positioned absolute top-left (`.sku-image-card__badge`, `top/left: --pad-surface-xs`, `z-index: 3`). Used for WEB STORE EXCLUSIVE badges on YGODL Regular items.

**`isBestValue` prop (v0.21.2):** Boolean, default `false`. Shorthand that shows the BEST VALUE badge without passing a custom `tagLabel` string — mirrors the identical prop on `SkuCard`. `tagLabel` takes precedence when both are set. COD:M uses this on the 5400 CP (new-user section) and 160 CP (regular CP section) image cards.

Key props: `amount` (req), `currentPrice` (req), `skuImage`, `originalPrice`, `discountPercent`, `baseAmount`, `bonusAmount`, `bonusLabel`, `loyaltyPoints`, `loyaltyIcon`, `variant` (`'background'` / `'panel'`), `animDelay`, `baseDelay`. The bonus, discount, and inline loyalty (MP) rows render only when their data is present. **Gap between the panel image and the info row:** `--gap-content-loose` (12px). **Info-column row order:** title → bonus → subtitle → loyalty. Info-column gap `--gap-content-narrow` (4px). Discount row (`originalPrice` + `discountPercent`) uses `transform-origin: right center` on both spans so condensed text right-aligns with the price CTA below.

**`variant='background'`** (Figma 2563:3197) — the SKU art is an oversized (`132%`), bottom-anchored full-bleed background (`object-position: center bottom`), cropped by the card's `overflow:hidden`; a `--scrim` overlay (`+ blur(0.5px)`) sits above it for legibility; content sits above the overlay (`z-index`). Card has a `min-height` and pins the price to the bottom. Used for **2x FC Points**.

**`variant='panel'`** (Figma 2655:14676) — the SKU art sits in a 1:1 square frame (`aspect-ratio:1/1`, `overflow:hidden`) at the top, oversized + centred (`124%`); text below. Used for **FC Points** and **Silver**.

Both variants reuse the `::before` mask-composite gradient ring and the `fx-skeleton` + `is-loaded` fade (heavy webps) from `SkuCard`/`BestSellerCard`. Amount uses `.text-style-heading-page-title` (H2); price `.text-style-heading-sku-title` (H4 — 20px on all stores except YGODL 14px; center-origin condense, `--text-hyperlink-default` → brand green in FCM). **Price block is center-aligned (v0.26.1):** `.sku-image-card__price` uses `align-items: center`; discount row `align-self: center`; all price spans use `transform-origin: center center`.

**Selected state (v0.15.0):** `.sku-image-card--selected .sku-image-card__bg` now uses `--bg-card-selected` (was `--bg-sku-card-success`). `::before` ring token corrected to `--border-sku-card-selected`.

---

### `HeroSkuCard.vue`
Full-bleed flagship product card for named editions, collector's packs, or game keys. Full-bleed `image` (absolute, `object-fit: cover`) + `--gradient-hero-scrim` bottom-up legibility scrim. Row layout: `.hero-sku__text` (flex 1 — eyebrow + title + includes-chips + description) left, `.hero-sku__price` (flex-shrink 0, right-aligned) right. Whole card is tappable; no separate CTA button.

Key props: `eyebrow`, `title` (req), `description`, `includes[]` (chip list), `image` (req), `skuImage`, `currentPrice` (req), `originalPrice`, `discountPercent`, `loyaltyPoints`, `baseDelay`. Checkout: `amount: title` convention (product name shown in checkout summary). `itemKey = title|currentPrice`.

Used by `CategoryCatalog` for subcategories with `cardType: 'hero'`. Theme-agnostic — any store can wire it via the catalog data layer without component edits.

**Ring effect is a capability flag, shared with `BestSellerCard`:** `heroRingClass` computes `` `fx-glow-border--${config.value.sku?.heroRingEffect ?? 'dual'}` `` from `useStoreConfig()`, applied via `:class="[heroRingClass, {...}]"` alongside the static `fx-bloom` class on the root. Every store before this flag existed gets `'dual'` via the fallback — zero behaviour change. `config.sku.heroRingEffect` is the *same* flag `BestSellerCard` reads (default `'hdr'` there) — both cards play the "flagship hero SKU" role depending on `catalog.mode`/`cardType`, so one config line covers whichever actually renders for a given store (see MGSSE, which sets it to `'camo-breathe'` because its flagship item uses `cardType:'hero'` → `HeroSkuCard`, not `BestSellerCard`).

**Animated dual-comet conic border (v0.32.0; refactored to a reusable class in v0.32.1; made store-selectable in a later pass):** the default ring is the global **`.fx-glow-border--dual`** class ([effects.css](../../../src/tokens/effects.css)). The class's `::before` paints a `conic-gradient(from var(--angle), …)` mask-composite ring (`inset: 0`, `padding: var(--border-weight-default)`, `linear-gradient(#fff 0 0)` mask with `-webkit-mask-composite: destination-out`). The gradient is written **inline in the class** (not wrapped in a CSS custom property) — this is critical: Chrome does not re-evaluate `var(--angle)` inside a nested custom property per animation frame, so the conic must reference `--angle` directly. Animation: `border-spin var(--motion-border-spin) linear infinite` (`@keyframes border-spin` + `@property --angle` registered in `src/tokens/keyframes.css`); the class is covered by the `prefers-reduced-motion` guard. Color stops come from four tokens — `--fx-border-glow`, `--fx-border-hot` (lead comet, shared with the single `.fx-glow-border`), `--fx-border-trail-glow`, `--fx-border-trail-hot` (trail comet, 180° behind) — defaulting to `--hdr-glow / --hdr-hot` (warm gold). Two comets 180° apart: comet 1 spans 30–88°, comet 2 spans 210–268°. Rogue Trader overrides these to imperial gold (secondary ramp) + warp-green (tertiary ramp); MGSSE overrides the same four tokens to field-green/pale-lime AND switches the variant itself to `'camo-breathe'`. The scoped `.hero-sku--selected::before` still overrides the ring (thicker, static, selection colour) via higher scoped specificity — this holds regardless of which `fx-glow-border-*` variant `heroRingClass` resolves to, since the specificity relationship (0,2,1) vs. any single-class variant's `::before` (0,1,1) is unaffected by the variant name. **(The earlier `--border-hero-card-*` token names from v0.32.0 are superseded by `--fx-border-*`.)**

**Bloom halo (v0.32.0):** root element carries `fx-bloom` class — the global `.fx-bloom::after` paints an ambient glow behind the card via `background: var(--fx-bloom-image)`. `overflow: hidden` is removed from `.hero-sku` so the bloom bleeds outside the card edge (corner clipping moved to `.hero-sku__media`). The component overrides the `::after` inset to `-8%` (vs `.fx-bloom`'s `-2%`) and increases the blur/brightness for a more prominent hero presence. Rogue Trader overrides `--fx-bloom-image` to a gold-to-warp-green radial gradient in `html[data-theme="roguetrader"]`.

### `BundleSkuCard.vue`
A bundled SKU (Figma 4843:10166): wide banner art + a breakdown row of child item tiles + title + price. Tapping calls `openCheckout()`. The surrounding event banner is **not** part of this card (it's the same component as the New User promo banner). Tokenised gradient border + L1 surface fill. Entrance: `bundle-enter` keyframe (fade + 12px rise — `to` carries **no** transform, so no compositor layer is retained that would kill child `backdrop-filter`).

Key props: `bannerImage` (req), `title` (req), `currentPrice` (req), `originalPrice`, `discountPercent`, `items[]`, `skuImage`, `skuOnBanner`, `subtitle`, `limitLabel`, `endsAt`, `claimed`, `refreshesOnClaim`, `breakdownScrollable`, `baseDelay`. Each `items[]` entry is a `BundleItem` prop set.

**v0.19.0 surface treatment:** background changed from `--rarity-gradient-neutral` to `var(--bg-sku-card-default)` + `backdrop-filter: blur(var(--blur-container, 32px))`.

**`breakdownScrollable` prop (v0.19.0):** Boolean, default `false`. When true, the breakdown row scrolls horizontally with `overflow-x: auto; scrollbar-width: none`. `useDragScroll(breakdownRef)` enables pointer-drag on desktop; `.is-dragging` adds `user-select: none` while dragging.

**Event countdown (`endsAt`):** when `endsAt` (ms epoch) is set, a live countdown row renders below the subtitle — a `schedule` `MaterialIcon` (14px) + `"Ends: Xd XXh XXm"` (days segment drops when 0). Urgency colours: ≥72h → `--text-body-default`; 24–72h → `--text-warning-default`; <24h → `--text-error-default`. Ticks every second via `setInterval`; cleared in `onBeforeUnmount`.

**Countdown spacing (v0.13.3):** `.bundle__countdown` gains `padding-top: var(--pad-surface-s)` (8px) to visually separate the timer from the title/subtitle content above it within `.bundle__title-group`.

**Selected state (v0.15.0):** `.bundle--selected` now uses `--bg-card-selected` (was `--bg-sku-card-success`) + `--border-sku-card-selected` ring on `::before`.

**Claimed state (v0.17.0):** `claimed` prop adds `.bundle--claimed` — sets `cursor: default` and fades `.bundle__banner` to `opacity: 0.3` (transition: `--motion-duration-base`). `limitLabel` prop renders a muted line below the subtitle. `refreshesOnClaim` + `claimed` flips the countdown prefix from `"Ends:"` → `"Refreshes:"` via `countdownPrefix` computed. FCM gifts use these props from `App.vue`'s `fcmGiftItems` enrichment; card click is intercepted at the wrapper level with an `isClaimed` guard in `onFcmGiftTap`.

**Banner composition:** `bannerImage` (2.6:1) renders via `Media` (image **or** video). When `skuOnBanner` is true, the 1:1 `skuImage` is composited as a centered hero (`.bundle__banner-sku`) above the legibility scrim.

All display text condenses via `scaleX(var(--hm-scale))` (title left-origin; price block right-origin) — matches the rest of the type system.

### `Media.vue`
Tiny presentational wrapper that renders a `<video>` (autoplay/loop/muted/playsinline) for `.mp4/.webm/.mov` sources and an `<img loading="lazy">` otherwise (animated webp/gif/apng "just work" in the `<img>` branch). `inheritAttrs` is on, so the consumer's `class` lands on the rendered element — and because it's the component **root**, the parent's scoped-CSS data attribute applies, so a parent rule like `.bundle__banner-img` styles the img/video directly. Props: `src` (req), `alt`, `poster`. Used by `BundleSkuCard` (banner + SKU overlay) and the optional `App.vue` category backdrop.

### `BundleItem.vue`
One child tile in a bundle breakdown. Square SKU image on a **rarity-graded** background (`rarity` → `--rarity-gradient-{mythic|legendary|epic|rare}`, default `--rarity-gradient-neutral`), tokenised gradient border, an optional **tag pill** (Bonus / Loyalty — `--bg-indicator-prominent-subtle` bg, `--text-error-inverse` text) and a **quantity badge** (`--bg-indicator-neutral-default`).

Props: `image` (req), `rarity`, `tag` (`{ label }`), `quantity`. Tag/qty text condenses via an inner `.bundle-item__condense` span so the pill box itself isn't scaled.

### `GiftSkuCard.vue`
A free-gift offer card for the COD:M **Gifts** / YGODL **Free Rewards** category (Figma 5357:10819). Square gift art on a **rarity-graded glow** (`rarity` → `--rarity-gradient-*`), a top-left tag (`--bg-tag-bonus` / `--text-tag-bonus`), title + optional subtitle + a purchase-limit line, a bold uppercase **CLAIM GIFT** CTA (`--text-hyperlink-default`, centred), and a **live countdown** with `schedule` clock icon (urgency colours match `BundleSkuCard`). Tokenised gradient border ring + `gift-enter` entrance (fade + 12px rise). CTA and countdown are **bottom-aligned** (`.gift__action { margin-top: auto }`). 12px gap between the image area and the info block (`--gap-content-loose`).

**v0.19.0 surface treatment:** `.gift` gains `background: var(--bg-sku-card-default)` + `backdrop-filter: blur(var(--blur-container, 32px))`. Previously transparent.

Props: `id` (String, req), `image` (req), `rarity` (default `mythic`), `tagLabel` (default `FREE GIFT`), `title` (req), `subtitle`, `limitLabel`, `ctaLabel` (default `CLAIM GIFT`), `endsAt` (ms epoch → countdown), `baseDelay`, `refreshesOnClaim` (Boolean, default `false`), `endsLabel` (default `'Ends:'`), `refreshesLabel` (default `'Refreshes:'`).

**Claim flow (v0.15.0):** tapping calls `openGiftClaim({ id, title, subtitle, image })` via `useGiftClaim`; `haptic('select')` fires only on a real open. `claimed` is now a computed derived from `isClaimed(props.id)` (shared confirmed set), not a local `ref` toggle. The card shows a **selected ring** (`.gift--selected`: `--bg-card-selected` fill + `--border-sku-card-selected` ring) while the sheet is open for this gift.

**Claimed-state:** image opacity → 30% (CSS transition), CTA text → `'CLAIMED'` (uppercase), CTA colour → `--text-body-soft`. When `refreshesOnClaim: true`, the countdown prefix switches from `endsLabel` → `refreshesLabel`. `endsLabel` / `refreshesLabel` are fully localisable props. **CTA type (v0.26.1):** uses `.text-style-heading-sku-title` (H4 — 20px), aligned with all other SKU card CTAs.

**Media container (v0.13.2):** `.gift__media` no longer forces `aspect-ratio: 1/1`. Height is now driven by the image itself + `padding: var(--pad-surface-s) 0` (top/bottom only — horizontal padding removed). Previously the square aspect-ratio was clipping tall assets.

**CTA/countdown spacing (v0.13.3):** `.gift__action` gains `padding-top: var(--pad-surface-s)` (8px) for a guaranteed floor above the CTA. The internal gap between CTA text and countdown ticks up from `--gap-content-tight` (2px) → `--gap-content-narrow` (4px).

**Claimed countdown fix (v0.26.0):** when `claimed` is true, `data-urgency` is cleared (no longer passes `countdownUrgency` through) and a `gift__countdown--claimed` class applies `--text-body-subtle` instead. The countdown icon is now absolutely positioned to the left of the text so only the text width drives the row's centring under the CTA above.

### `GiftGrid.vue`
Layout wrapper for the Gifts section — a **2-up grid at every width** (incl. 360px mobile), unlike `BundleGrid` (1→2-col@801px) and `SkuList`'s base grid (→4-col@641px).

**`count` prop (v0.13.2):** pass `gifts.length` from `App.vue`. At M/L (`@container min-width: 641px`), when `count < 4` the grid switches to `repeat(var(--gift-count), 1fr)` — a single row of equal columns — instead of forcing 2 columns. The `--gift-count` CSS custom property is injected as an inline style only when the `gift-grid--few` class is active.

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
HDR hero card (and compact carousel tile). Tapping calls `openCheckout()` via `useCheckout`. Passes `label` and `subtitle` props to `openCheckout` so the checkout banner title shows the human-readable product name (e.g. "Daily Booster D") rather than the raw numeric `amount`.

| Mode | Class | Image height | Effects |
|---|---|---|---|
| Hero | — | auto (driven by coin) | `fx-glow-border--{config.sku.heroRingEffect ?? 'hdr'}` (conic OKLCH border by default) + `fx-bloom` (breathing halo) |
| Compact | `bestseller__card--compact` | auto (driven by coin) | image shimmer (`::after`, metallic white), `overflow:hidden`, no border/bloom |

**Ring effect is a capability flag, not a hardcoded class (added alongside `fx-glow-border--camo-breathe`):** `bestSellerEffectClass` computes `` `fx-glow-border--${config.value.sku?.heroRingEffect ?? 'hdr'}` `` from `useStoreConfig()` — the *same* flag `HeroSkuCard` reads (default `'dual'` there; see that section above). Every store before this flag existed gets `'hdr'` via the fallback — zero behaviour change. A store opts into a different `fx-glow-border-*` family member via `config.sku.heroRingEffect` in its `store.js` (see [web-store-whitelabel](../../../.claude/skills) golden rule — this reads a capability flag, never `theme.value`). Only one `fx-glow-border--*::before` can render per element (two rules can't layer on one pseudo-element), so this is a genuine either/or selection, not an additive one.

**`fx-glow-border--camo-breathe`** ([effects.css](../../../src/tokens/effects.css)) — added for MGSSE's "calm and stealthy" brand: a static ring (no rotation, unlike `--hdr`/`--dual`/`--rotate`) whose opacity breathes from a near-invisible rest state to a clearly-lit peak (`breathe-dim` keyframe, `0.1→0.95`) over a slow period (`--motion-border-camo`, default `5500ms` in `extensions.css`; MGSSE stretches it to `6500ms` and slows `--motion-sku-bloom` to `6000ms`, both in `html[data-theme="mgsse"]`), with a moderate glow bleed (`drop-shadow(0 0 10px var(--fx-border-glow))`) and a thicker ring (`--fx-camo-border-width`, default `3px`) so the slow breathe stays legible without a spin to catch the eye — "calm" comes from the pacing and the dim rest state, not from being hard to see. Covered by the same `prefers-reduced-motion` guard as every other `fx-glow-border-*` variant.

Hover: `translateY(-2px)`; press: `scale(0.98)`.

**CP icon:** not shown in the title row — only the formatted amount span renders (no currency glyph).

**SKU overlay (`skuImage`) (v0.13.2):** coin art is now **in-flow** (`position: relative; display: block; margin: 0 auto; width/height: 128px`) rather than absolutely centred. The `.bestseller__image` container uses `height: auto` with `padding: var(--pad-surface-s) 0` so the coin drives the card height. Previously the image area was a fixed-height box (`128px` hero / `104px` compact) with the coin overlaid at `top:50%; left:50%; transform:translate(-50%,-50%)` at `160×160px`.

**Info-column row order:** title → bonus → subtitle → loyalty → countdown. `.bestseller__title-col` gap `--gap-content-narrow` (4px).

**Event countdown (`endsAt`):** same pattern as `BundleSkuCard` — `schedule` icon + `"Ends: Xd XXh XXm"` with three-tier urgency colours. Uses `bsNow` / `bsTimer` names (avoids collision with any future `now` refs). Countdown renders last in the title column — after loyalty — so the price-sensitive rows (amount, bonus, subtitle) are visually grouped at the top.

**Subtitle/countdown spacing (v0.13.3):** `.bestseller__subtitle` gains `padding-bottom: var(--pad-surface-xxs)` (2px). Combined with the existing `--gap-content-narrow` (4px) column gap, total visual clearance between subtitle and countdown is 6px.

**CTA type (v0.26.1):** price CTA uses `.text-style-heading-sku-title` (H4 — 20px), replacing the previous `heading-modal`. Aligns with all other SKU card CTAs.

**Discount alignment:** `.bestseller__discount` uses `align-self: flex-end`; both `.bestseller__original` and `.bestseller__pct` use `transform-origin: right center` so condensed text visually right-aligns with the `.bestseller__current` price below.

**Bonus amount colour:** `.bestseller__bonus-amount { color: var(--text-bonus-amount) }` — bright yellow (primary-400), subordinate to the CTA.

**Section description (v0.14.1):** new `description` prop. When `showHeading` is true and `description` is set, a `<p class="bestseller__section-desc text-style-paragraph-regular">` renders between the heading and the card. Colour `--text-body-default`. Hidden in compact carousel items (`showHeading` is false there).

**Selected state (v0.15.0):** `.bestseller__card--selected` applies `--bg-card-selected` fill + `--border-sku-card-selected` ring while the checkout sheet is open for this item. Uses `selectedKey` / `sheetOpen` from `useCheckout`; `itemKey` is `${amount}|${currentPrice}`. `openCheckout` now receives `itemKey` as a second arg.

---

### `BestSellerCarousel.vue`
Horizontal compact-card row. Heading prop default: `'BEST SELLERS'` (plural). Taps fall through to `BestSellerCard` → `useCheckout`. **Header is inset** to the gutter while the **card list bleeds** to the screen edges (see §2).

**Mouse drag** is delegated to `useDragScroll` (§6) — pointer-capture, momentum, and >6px click-suppression so a drag-scroll never opens the checkout sheet. Chevron clicks call `stop()` first. Touch uses native pan-x.

**Card width:** XS/S `62.5%` of container (always scrolls); M/L `(100% - 16px) / 3` + `min-width: 207px`. Chevrons appear only on overflow (`hasOverflow`), disabled state tracks `canLeft`/`canRight`.

**Section description (v0.14.1):** new `description` prop. `.bs-carousel__header` is now a column flex; `.bs-carousel__header-row` (new) holds the title + chevrons as a space-between flex row. `<p class="bs-carousel__desc text-style-paragraph-regular">` renders below the header row when `description` is set. Colour `--text-body-default`. Inherits the same `padding-inline` inset rules as the header row.

**v0.22.0 chevron activation:** `.bs-carousel__chevron` transition gains `opacity var(--motion-btn-activate)`; `.is-disabled` gains `transform: scale(0.97)` alongside the existing `opacity: 0.3`. Same pattern applied to `FeaturedCarousel.vue` chevrons.

---

### `StoryCarousel.vue`
Instagram-story slideshow. **Full bleed** on XS/S, centered 2/3 on M/L (`Span size="carousel"`).

| Prop | Default | Notes |
|---|---|---|
| `slides` | `[]` | `{ portrait, landscape, logo, heading, ctaLabel, ctaTarget }` |
| `loop` | `true` | |
| `autoplay` | `true` | |
| `interval` | `5000` | ms per slide |
| `aspectRatio` | `null` | CSS `aspect-ratio` string (e.g. `'16 / 9'`); overrides the responsive default (1:1 portrait / 2.6:1 landscape) at all breakpoints |

CTA: `v-if="slide.ctaLabel"` — conditional, per-slide. No fallback. When a slide sets `ctaTarget` (a section id), the button smooth-scrolls to `document.getElementById(ctaTarget)` via the `onCta` handler. The first slide targets `cat-cp`.

**Logo overlay (v0.31.0):** when a slide supplies a `logo` URL, `<img class="story__logo">` renders centered above the heading/CTA (`max-height: 64px`, `filter: var(--shadow-logo)`). App.vue passes `brand.wordmark` for single-hero slides (`content.storyHero` stores).

**Single-slide mode (`isSingle`):** when `slides.length <= 1`, the progress bar and its scrim are hidden, auto-advance and tap-zones are disabled. The frame presents the single hero image without any navigation chrome. Use for stores that supply one full-width hero (e.g. eFootball).

**Press-to-pause:** holding anywhere on the frame (`pointerdown` → `pointerup`/`cancel` document listeners) freezes the active segment's CSS animation (`animationPlayState: 'paused'`). Releasing resumes from the current position.

Progress bars: animation-driven (no JS timer) — `@animationend` on the fill fires `next()`. Tap zones: left/right halves fall through the pointer-events-none content layer.

---

### `PromoBanner.vue`
Image banner with optional icon + optional title (HTML) + subtext + 0.72 overlay scrim. Icon block renders only when `icon` is set (no placeholder); title only when `title` is set — so it doubles as a description-only banner.

**Countdown tag:** when `endsAt` (ms epoch) is supplied, a frosted chip (`schedule` MaterialIcon + `{countdownLabel} {Dd HHh MMm}`) renders above the description, ticking once a second (informational → runs regardless of reduced-motion; interval cleared on unmount). Chip text condenses via an inner `.promo-banner__countdown-text` span (box keeps its padding). Used by the Bundle category banner.

### `PlayerAccount.vue`
Signed-out "YOUR COD:M ACCOUNT" guest Player ID entry (Figma 5041:16027). Rendered in App.vue right after StoryCarousel, `id="player-account"`, gated `v-if="!signedIn"`. Entrance: `slide-down` + `baseDelay=180`.

- **Player ID input** — text field; blur or Enter starts a ~1.1s simulated lookup (`status`: `idle → loading → found`). Donut spinner overlays the input while loading.
- **Disclosure toggle** (v0.28.0) — a tappable **"How to find your COD:M account"** label + rotating chevron (`MaterialIcon expand_more`) gates the chip row. Hidden by default; `instructionsOpen` ref + `toggleInstructions()` control visibility. Opening auto-selects the first chip (`Find UID`) so the instruction panel shows immediately; subsequent reopens preserve the prior chip selection. The chips+panel block transitions in/out via `<Transition name="instructions">`: 200ms ease-out entrance, 150ms ease-in exit; `opacity` + `translateY(-4px)` only.
- **Instruction chips** (Find UID / Find Player ID / Find Nickname) — visible after the disclosure is opened; clicking a chip expands the instruction panel below it (`grid-template-rows: 0fr → 1fr` accordion). Clicking the active chip again collapses it.
- **Found state** — `<PlayerCard :name="playerId" :avatar-src="assets.content.avatar" …>` replaces the chips. Reaching `found` calls `setGuestVerified(true)` + `setGuestPlayerName(playerId)` on `useCheckout`, unlocking guest checkout. Editing re-locks both.

**v0.15.0 — State persistence + bidirectional sync:** the component now initialises from shared state (`playerId = guestPlayerName.value`, `status = 'found'` if already verified). A `watch([guestVerified, guestPlayerName])` mirrors updates from the other instance (main page ↔ sheet) so both always show the same account. `onBeforeUnmount` no longer calls `setGuestVerified(false)` — the verified state survives sheet close/reopen; only `onEdit()` resets it intentionally.

**v0.18.0 — `showAccountInstructions` config flag:** instruction chips are now gated on `config.profile?.showAccountInstructions !== false` (default-true `!== false` pattern). Stores that set `profile.showAccountInstructions: false` in their store module suppress the three chips without any component change. TDR uses this to present a clean ID-entry field with no instructions.

**v0.31.0 — `showPlayerAccount` config flag:** the entire PlayerAccount section is now gated on `config.profile?.showPlayerAccount !== false`. Stores that sell product keys rather than in-game currency (e.g. Rogue Trader) set `profile.showPlayerAccount: false` to remove the guest ID form entirely — there is no player account to associate with a Steam key purchase.

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
| `content.giftSecretCache` / `giftEmote` / `giftGun` | `content/Gifts/*.webp` | Gifts category card art (GiftSkuCard) |
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
11. **New display text must condense** — any Hitmarker text needs `transform: scaleX(var(--hm-scale))` (left/right/center origin per alignment), or it renders ~18% too wide. For a pill/badge **with a background**, condense an inner text span — never the box (scaling the box squashes its padding). Recurring regression: Bundle + CategoryNav both shipped too-wide before this was added. See [`typography.md`](./typography.md).
12. **`v-ripple` on flex/grid containers** — the wave `<span>` receives `position:absolute; pointer-events:none` as **inline styles** in the directive, not relying on the CSS rule alone. This prevents a one-frame flash where the unstyled span participates as a flex item before CSS applies (repro: PC channel cards grew tall on click). Always set structural properties inline when injecting DOM nodes into flex/grid parents.
13. **`v-ripple` requires `overflow:hidden`** — the directive adds `fx-ripple` (which sets `overflow:hidden`) automatically. Do NOT add `v-ripple` to components that need `overflow:visible` for a border effect (e.g. `BestSellerCard` with `fx-glow-border--hdr` — the `::before` ring extends 1.5px outside the box and would be clipped).
14. **Module-singleton composables need ONE import specifier** — `useTheme` (and any composable that holds module-level reactive state) must be imported the same way everywhere. Mixing the `@/composables/useTheme` alias with relative `./useTheme` makes Vite's dev server resolve two module records, each with its own `current` ref: the toolbar's `setTheme` updates one copy (and writes `<html data-theme>`, so colours flip) while the content composables read another stuck on the initial store — "colours switch but content stays COD:M". `useTheme` now pins its state to a `Symbol.for(...)` on `globalThis` as a backstop; still prefer consistent relative imports.
15. **Screenshot capture strips frosted effects** — `useScreenshot` (modern-screenshot / foreignObject) cannot composite `backdrop-filter` (renders grey) or `mask-composite` (the gradient-ring `::before` floods the card with `--surface-l1-border`). The composable removes both during capture and paints a concrete `--bg-page` backing, so exports trade the live 1px gradient border + frost for solid dark cards. Don't expect pixel-perfect glass in the `.webp`.
16. **Inspector capture-phase gating** — `InspectorOverlay` blocks demo interaction via document `addEventListener(..., true)` (capture phase), not `pointer-events:none`. This lets the overlay intercept clicks before Vue's event delegation while leaving wheel/touch scroll intact and the toolbar/panel fully clickable. The demo elements themselves never get `pointer-events:none`, so CSS animations keep running. If you add new document-level capture listeners elsewhere, be aware the inspector's `swallow()` handler fires first when inspection mode is on.
17. **Dev chrome must never depend on a transparent store token** — `themes/ygodl.css` sets `--bg-page: transparent` (YGODL paints a fixed background-attachment art layer instead). Any dev-chrome surface using `var(--bg-page, #0c0e16)` goes see-through because the fallback is dead when the token is defined. Always use hardcoded literal colours (`#0c0e16`) for dev chrome backgrounds, and layer the store's page art on top if needed (see `StoryStage.vue`).
18. **Store-specific tokens belong in their theme file, not extensions.css** — `--ea-*` tokens (EA brand colours) live in `[data-theme="fcm"]` in `themes/fcm.css`; `--konami-*` tokens live in `[data-theme="efootball"]` in `themes/efootball.css`. `extensions.css` is for prototype-wide constants (platform brand colours, toolbar, haptic) that apply across all stores. Do not add store-specific tokens to `extensions.css`.

---

**Last updated:** June 2026 · v0.32.2 — Trail-comet tokens renamed `--fx-border-*-2` → `--fx-border-trail-glow/hot`
