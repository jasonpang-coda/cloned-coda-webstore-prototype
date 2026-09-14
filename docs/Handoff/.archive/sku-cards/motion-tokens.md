# Motion Tokens Documentation

CODM SKU Card 3.0 — Custom Motion Tokens & Effects

---

## Overview

This document catalogs the **project-specific motion tokens and keyframes** introduced for the CODM SKU Card 3.0 prototype. These are *in addition to* the base motion library (`src/tokens/motion.css`) and are designed to work seamlessly with the component system.

All tokens are defined in:
- **`src/tokens/motion-sku.css`** — SKU Card-scoped motion tokens
- **`src/tokens/keyframes.css`** — Custom keyframe animations
- **`src/tokens/effects.css`** — Visual effect utilities (glow, bloom, shimmer)

---

## Motion Tokens

### Entrance & Exit

#### `--motion-sku-enter`
- **Value:** `250ms var(--motion-sys-ease-decelerate)`
- **Purpose:** Card slides up 6px and fades in when the list mounts
- **Use case:** `SkuCard`, `BestSellerCard`, `PromoBanner`
- **Behavior:** Decelerate easing (ease-out) slows entry for visual predictability

```css
animation-name: sku-enter;
animation-duration: var(--motion-sys-duration-slow);     /* 350ms */
animation-timing-function: var(--motion-sys-ease-decelerate);
animation-fill-mode: both;
```

#### `--motion-sku-exit`
- **Value:** `200ms var(--motion-sys-ease-accelerate)`
- **Purpose:** Card fades out when removed from the list
- **Use case:** Future: conditional rendering of cards
- **Behavior:** Accelerate easing (ease-in) makes departure feel final

---

### Overlay / Sheet Transitions

#### `--motion-modal-enter`
- **Value:** `350ms var(--motion-sys-ease-decelerate)` (from base `motion.css`)
- **Purpose:** Large surface enters from its origin edge, decelerating to rest
- **Components:** `NavDrawer` (slide from left), `SignInLoader` (fade in), `CheckoutSheet` (slide up from bottom)
- **Behavior:** Ease-out matches the motion-design principle — "arrive fast, settle gently"

#### `--motion-modal-exit`
- **Value:** `200ms var(--motion-sys-ease-accelerate)` (from base `motion.css`)
- **Purpose:** Surface exits toward its origin edge, accelerating
- **Components:** Same as enter — decisive, shorter than entrance
- **Behavior:** Exit is always shorter; the user already knows where it came from

#### `--motion-snackbar-enter`
- **Value:** `350ms var(--motion-sys-ease-spring)` — `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Purpose:** Success snackbar bounces up from the screen bottom
- **Components:** `Snackbar.vue`
- **Behavior:** Spring overshoot (`>1` control point) — bounces slightly past rest and settles; a deliberate delight beat for the sign-in success moment. NOT used for utilitarian surfaces.

#### `--motion-snackbar-exit`
- **Value:** `250ms var(--motion-sys-ease-accelerate)`
- **Components:** `Snackbar.vue` → `snackbar-drop` keyframe
- **Behavior:** Small anticipation hop up (18% mark) then drops off the bottom. Playful but decisive.

---

### `sheet` (Vue Transition name)
**Defined in:** `CheckoutSheet.vue` scoped CSS

The **"SELECT PAYMENT"** bottom sheet — a utilitarian payment surface, NOT a delight moment. No spring/bounce.

```css
.sheet-enter-active .sheet__panel { transition: transform var(--motion-modal-enter); }
.sheet-enter-from   .sheet__panel { transform: translateY(100%); }
.sheet-enter-to     .sheet__panel { transform: translateY(0); }

.sheet-leave-active .sheet__panel { transition: transform var(--motion-modal-exit); }
.sheet-leave-from   .sheet__panel { transform: translateY(0); }
.sheet-leave-to     .sheet__panel { transform: translateY(100%); }
/* scrim opacity fades on the same enter/exit tokens */
```

- **Orientation:** enters/exits from the bottom edge it lives on — spatially coherent
- **Enter:** `--motion-modal-enter` (350ms decelerate) — large surface, needs time
- **Exit:** `--motion-modal-exit` (200ms accelerate) — departure is final
- **Scrim:** fades alongside (no blur — per design spec, unlike sign-in loader / drawer)
- **Dismiss:** scrim click, close button (`×`), or `Escape`
- **Z-index:** 4 (above drawer 1, loader 2, snackbar 3)

**Responsive modal variant (M+, ≥801px):** instead of sliding up from the bottom, the sheet enters as a centred modal — `transform: scale(0.96); opacity: 0;` → rest, using `--motion-modal-enter`. The scale origin is centred so it expands out of the trigger point.

---

### `sheet` (Vue Transition name) — Sign-in sheet
**Defined in:** `SignInSheet.vue` scoped CSS

The **"SIGN IN TO PURCHASE"** bottom sheet — same enter/exit pattern as `CheckoutSheet`.

```css
.sheet-enter-active .signin-sheet__panel { transition: transform var(--motion-modal-enter); }
.sheet-enter-from   .signin-sheet__panel { transform: translateY(100%); }
.sheet-leave-active .signin-sheet__panel { transition: transform var(--motion-modal-exit); }
.sheet-leave-to     .signin-sheet__panel { transform: translateY(100%); }
```

- No scrim (scrim-less per design spec — attaches to the bottom of the device without a full-screen overlay)
- **Responsive modal variant (M+):** same scale-in pattern as `CheckoutSheet` — `scale(0.96); opacity: 0;` → rest

---

### `ea-page` (Vue Transition name) — EA sign-in overlay
**Defined in:** `EaSignInPage.vue` scoped CSS

Full-screen EA Sports FC Mobile sign-in page that overlays the store (FCM only). Enters with a fade + small upward slide from `24px` below rest position.

```css
.ea-page-enter-active { transition: transform var(--motion-modal-enter), opacity var(--motion-modal-enter); }
.ea-page-leave-active { transition: transform var(--motion-modal-exit),  opacity var(--motion-modal-exit); }
.ea-page-enter-from,
.ea-page-leave-to     { transform: translateY(24px); opacity: 0; }
```

- **Enter:** `--motion-modal-enter` (350ms decelerate) — full-screen surface
- **Exit:** `--motion-modal-exit` (200ms accelerate)
- **Direction:** rises from 24px below rest (`--motion-sys-distance-xl`) — conveys "this content was below" without a full off-screen slide. Not edge-anchored (no persistent off-screen position), so a full `translateY(100%)` would read as spatially incorrect.
- Hover transitions within the page use `--motion-sku-hover` (back button, social sign-in buttons, input border-color, CTAs)

---

### `popover` (Vue Transition name) — Account popover
**Defined in:** `AccountPopover.vue` scoped CSS

The **"YOUR ACCOUNT"** popover anchored to the avatar button in the top-right corner. Combines opacity fade with a small scale + downward nudge, origin pinned to the top-right corner it grows from.

```css
.popover-enter-active,
.popover-leave-active {
  transition: opacity var(--motion-modal-enter), transform var(--motion-modal-enter);
}
.popover-enter-from .account-popover__panel,
.popover-leave-to   .account-popover__panel {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

/* anchor to the avatar corner */
.account-popover__panel { transform-origin: top right; }
```

- **Effect:** drops down 4px and scales from 0.98 → 1.0, growing from the avatar corner. The scale is deliberately small — enough to hint at origin without distracting.
- Uses `--motion-modal-enter` for both enter and leave — the popover may reopen quickly so the exit doesn't need to be aggressively short
- **Z-index:** 5 — topmost overlay (above all sheets and the drawer)

---

### Interaction Feedback

#### `--motion-sku-hover-in`
- **Value:** `220ms var(--motion-sys-ease-decelerate)`
- **Purpose:** Hover-**enter** transition — card rises with ease-out so the lift decelerates naturally
- **Components:** `SkuCard:hover`, `BundleSkuCard:hover` (overrides the base transition on `:hover`)
- **Pair with:** `--motion-sku-hover` on the base element (controls hover-out / return to rest)

#### `--motion-sku-hover`
- **Value:** `150ms var(--motion-sys-ease-standard)`
- **Purpose:** Hover-**out** / resting transition — snappier return to rest after lift
- **Components:** `SkuCard`, `NavBar` buttons, `CheckoutSheet` channel cards

#### `--motion-sku-press`
- **Value:** `100ms var(--motion-sys-ease-standard)`
- **Purpose:** Quick scale-down tap feedback
- **Components:** Any interactive card element
- **Behavior:** Micro-interaction confirms press without blocking further interaction

#### `--motion-sku-press-scale`
- **Value:** `0.99`
- **Purpose:** Single source of truth for the press scale amount across all SKU card types
- **Components:** `SkuCard`, `BundleSkuCard`, `SkuImageCard`, `GiftSkuCard`
- **Usage:** `transform: scale(var(--motion-sku-press-scale))` in each card's `--pressed` modifier — change once, all cards update

#### `--motion-btn-activate` (v0.22.0)
- **Value:** `250ms var(--motion-sys-ease-decelerate)`
- **Purpose:** Disabled → enabled button unlock — opacity lifts and scale settles (ease-out entrance)
- **Disabled state:** `opacity: 0.4; transform: scale(0.97)` on the button element
- **Enabled state:** `opacity: 1; transform: scale(1)` (implicit default)
- **Components:** `ClaimGiftSheet`, `CheckoutSheet`, `SignInSheet`, `PageSignInSection`, `NavBar` (primary/secondary/tertiary action buttons), `FeaturedCarousel` + `BestSellerCarousel` chevrons
- **`prefers-reduced-motion`:** handled globally by `reduced-motion.css` (collapses all transitions to 0.01ms) — no per-component override needed

#### `--motion-ripple`
- **Value:** `var(--motion-sys-duration-slow)` — **350ms**
- **Purpose:** Click-point ripple expand-and-fade on all interactive buttons and card surfaces
- **Components:** Every button via the global `v-ripple` directive (`NavBar`, `NavDrawer`, `CategoryNav`, `CheckoutSheet`, `PlayerAccount`, `SkuCard`, `BundleSkuCard`)
- **Implementation:** `vRipple.js` directive spawns a `.fx-ripple__wave` span on `pointerdown`, centred on the tap/click coordinate, animated by `@keyframes ripple` (scale 0→2.5, opacity 0.4→0). Teardown reads `getComputedStyle(wave).animationDuration` so it stays in sync with this token.
- **Color:** `--fx-ripple-color: rgba(255,255,255,0.14)` set on `:root` (dark-UI default). The yellow CHECK OUT CTA overrides with `rgba(0,0,0,0.15)`.

```css
/* effects.css */
.fx-ripple .fx-ripple__wave {
  animation: ripple var(--motion-ripple) var(--motion-sys-ease-decelerate) forwards;
}

/* keyframes.css */
@keyframes ripple {
  from { opacity: 0.4; transform: scale(0); }
  to   { opacity: 0;   transform: scale(2.5); }
}
```

> **Flex container gotcha:** the wave `<span>` receives `position: absolute; pointer-events: none` as **inline styles** in the directive before append, not solely via the CSS rule — prevents a one-frame flash where the unstyled span participates as a flex item (repro: PC channel cards in CheckoutSheet grew tall on click before this fix).

#### `--motion-sku-select`
- **Value:** `250ms var(--motion-sys-ease-standard)`
- **Purpose:** Smooth border color transition when card is selected
- **Components:** Best-value badge highlight; payment channel card selection (`is-selected`)

---

### Component-Specific

#### `--motion-sku-badge`
- **Value:** `350ms var(--motion-sys-ease-spring)`
- **Purpose:** "Best Value" badge springs in with overshoot pop
- **Components:** `SkuCard` badge slot
- **Effect:** Spring easing gives the badge personality; feels rewarding

#### `--motion-sku-price-reveal`
- **Value:** `350ms var(--motion-sys-ease-decelerate)`
- **Purpose:** Price area fades + slides in after the card has entered
- **Components:** `SkuCard` price slot
- **Timing:** Applied with a stagger delay (card delay + 350ms)

---

### Stagger & Loop

#### `--motion-sku-stagger`
- **Value:** `var(--motion-sys-stagger-sm)` — **90ms per card** (overridden from library default 50ms)
- **Purpose:** Delay between each card in a list entrance
- **Formula:** `index * 90ms`
- **Components:** `SkuList` passes `animDelay` to each card
- **Effect:** Creates a cascading waterfall entrance, slower for deliberate feel

#### `--motion-sku-shimmer`
- **Value:** `3000ms` base sweep (base library default)
- **Carousel card override:** `4500ms` — 50% slower so the gloss reads as gentle ambient sheen
- **Purpose:** Perpetual gloss sweep over the image portion of compact best-seller carousel cards
- **Components:** `BestSellerCard` (compact variant) → `.bestseller__card--compact .bestseller__image::after`
- **Animation:** `@keyframes shimmer-loop`
- **Color override:** warm champagne `rgba(255, 220, 140, 0.28)` — matches the orange card palette

#### `--motion-sku-bloom`
- **Value:** `3500ms`
- **Purpose:** Breathing halo period for the best-seller hero card
- **Components:** `BestSellerCard` → `.fx-bloom::after`
- **Animation:** `@keyframes bloom-pulse` oscillates opacity + scale

#### `--motion-sku-story`
- **Value:** `5000ms`
- **Purpose:** Per-slide auto-advance interval for the story slideshow
- **Components:** `StoryCarousel` → `.story__seg-fill--active` (supplied inline from `interval` prop)

#### `--motion-sku-story-fade`
- **Value:** `350ms`
- **Purpose:** Gentle crossfade duration when swapping story slides
- **Components:** `StoryCarousel` → `story-fade` Vue `<Transition>`
- **Easing:** paired with `--motion-sys-ease-standard`

#### `--motion-sku-skeleton`
- **Value:** `1400ms`
- **Purpose:** Sweep period for the `.fx-skeleton` placeholder sheen (image loading state)
- **Components:** `BestSellerCard` → `.bestseller__skeleton`

#### `--motion-spinner`
- **Value:** `700ms`
- **Purpose:** Rotation period for the donut/status loader (faster than the 3200ms `--motion-border-spin`)
- **Components:** `PlayerAccount` → `.player-account__spinner` (guest Player ID lookup)
- **Animation:** `@keyframes spin`, paired with `--motion-sys-ease-linear` (continuous loop)

---

## HDR & Color Tokens

### Action / Primary Yellow (OKLCH)

The primary action color is defined in OKLCH for perceptual accuracy and HDR headroom. All components reference `--text-hyperlink-inverse` and `--bg-action-primary`.

#### `--text-hyperlink-inverse` / `--bg-action-primary`
- **SDR Value:** `oklch(0.91 0.191 97)` — visually equivalent to `#ffe700`, L lifted ~2%
- **HDR Value:** `oklch(1.03 0.25 97)` — **L > 1.0**, beyond the sRGB white ceiling; renders as superluminant gold on P3/HDR panels
- **Defined in:** `src/style.css`
- **HDR override in:** `src/tokens/motion-sku.css` → `@media (dynamic-range: high)`

```css
/* style.css — SDR baseline */
--text-hyperlink-inverse: oklch(0.91 0.191 97);
--bg-action-primary:      oklch(0.91 0.191 97);

/* motion-sku.css — HDR boost */
@media (dynamic-range: high) {
  --text-hyperlink-inverse: oklch(1.03 0.25 97);
  --bg-action-primary:      oklch(1.03 0.25 97);
}
```

### Bonus text (OKLCH, SKU card web-bonus labels)

Both bonus colour tokens are OKLCH with a **+0.04 L luminance boost** over their sRGB baselines so they read clearly against dark card surfaces. HDR variants are added to the `@media (dynamic-range: high)` block.

| Token | SDR | HDR | sRGB reference |
|---|---|---|---|
| `--text-web-bonus-codashop` | `oklch(0.78 0.155 297)` | `oklch(0.85 0.17 297)` | `#b493ff` ≈ `oklch(0.74 …)` |
| `--text-web-bonus-cp`       | `oklch(0.78 0.135 260)` | `oklch(0.85 0.15 260)` | `#77aaff` ≈ `oklch(0.74 …)` |

Hue 297 = purple-violet (Codashop branding); hue 260 = blue (COD Points). Both use the same L/C template so they feel balanced against each other and against the primary yellow.

---

### Glow / Bloom (Best Seller card)

All OKLCH (perceptually-uniform, wide-gamut safe):

#### `--hdr-glow`
- **SDR:** `oklch(0.82 0.20 75)` / **HDR:** `oklch(0.92 0.26 75)` — warm gold

#### `--hdr-hot`
- **SDR:** `oklch(0.97 0.16 95)` / **HDR:** `oklch(1 0.18 95)` — near-white highlight

#### `--hdr-bloom`
- **SDR:** `oklch(0.72 0.23 55)` / **HDR:** `oklch(0.82 0.29 55)` — orange flare

**Dynamic Range Detection:**
```css
@media (dynamic-range: high) {
  :root {
    --hdr-glow:  oklch(0.92 0.26 75);
    --hdr-hot:   oklch(1 0.18 95);
    --hdr-bloom: oklch(0.82 0.29 55);
    --text-hyperlink-inverse: oklch(1.03 0.25 97);
    --bg-action-primary:      oklch(1.03 0.25 97);
  }
}
```

---

## Component Motion Patterns

### `CategoryCatalog` — category crossfade + section stagger

**Defined in:** `CategoryCatalog.vue` scoped CSS

The FCM category content area swaps between categories with a fade-in/fade-out crossfade wrapped in a `cat-catalog` Vue Transition (`mode="out-in"`). Each incoming category fades up from `--motion-sys-distance-md` (8px); the outgoing category fades out flat.

```css
.cat-catalog-enter-active {
  animation-name: cat-fade-in;
  animation-duration: var(--motion-sys-duration-base);        /* 250ms */
  animation-timing-function: var(--motion-sys-ease-decelerate);
  animation-fill-mode: both;
}
.cat-catalog-leave-active {
  animation-name: cat-fade-out;
  animation-duration: var(--motion-sys-duration-exit);        /* 200ms */
  animation-timing-function: var(--motion-sys-ease-accelerate);
  animation-fill-mode: both;
}

@keyframes cat-fade-in  {
  from { opacity: 0; transform: translateY(var(--motion-sys-distance-md)); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cat-fade-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}
```

- Enter: 250ms decelerate — incoming content rises into view
- Leave: 200ms accelerate — outgoing content dissolves without competing with the incoming reveal
- `mode="out-in"` ensures the old content is fully gone before the new content enters — prevents two overlapping layers of SKU cards

**Section + item stagger formula:**
```
delay = baseDelay + (sectionIndex × 80ms) + (itemIndex × 120ms)
```
Sections cascade 80ms apart; items within each section cascade 120ms apart. This is a slower, more deliberate stagger than the SKU list formula (`index × 90ms`) — the catalog sections are taller, so each beat needs more visual separation.

---

### `SkuImageCard` — image-led SKU card type

**Defined in:** `SkuImageCard.vue` scoped CSS

A new card variant used in FCM Top Ups and Daily Supplies categories. Two layout variants controlled by the `variant` prop: `'background'` (oversized bottom-anchored art) and `'panel'` (1:1 square frame at top). Shares the same entrance/hover/press motion system as `SkuCard`.

**Entrance:**
```css
.sku-image-card {
  animation-name: sku-enter;                              /* shared global keyframe */
  animation-duration: var(--motion-sys-duration-slow);        /* 350ms */
  animation-timing-function: var(--motion-sys-ease-decelerate);
  animation-fill-mode: both;
  animation-delay: /* baseDelay + animDelay, supplied inline */;
}
```

**Price reveal** (staggered after card entrance):
```css
.sku-image-card__price {
  animation-name: fade-in;
  animation-duration: var(--motion-sys-duration-slow);        /* 350ms */
  animation-timing-function: var(--motion-sys-ease-decelerate);
  animation-fill-mode: both;
  animation-delay: /* baseDelay + animDelay + 350ms */;
}
```

**Hover / press transitions:**
```css
/* base (hover-out / resting state) */
.sku-image-card {
  transition: transform var(--motion-sku-hover),
              border-color var(--motion-sku-hover),
              box-shadow var(--motion-sku-hover);
}
/* hover-in override (decelerate lift) */
.sku-image-card:hover {
  transition: transform var(--motion-sku-hover-in),
              border-color var(--motion-sku-hover-in),
              box-shadow var(--motion-sku-hover-in);
  transform: translateY(calc(-1 * var(--motion-sys-distance-sm)));  /* -4px */
}
/* press */
.sku-image-card--pressed {
  transition: transform var(--motion-sku-press), border-color var(--motion-sku-press);
  transform: translateY(0) !important;
}
```

**Background image fade-in:**
```css
.sku-image-card__bg-img,
.sku-image-card__panel-img {
  transition: opacity var(--motion-sys-duration-base) var(--motion-sys-ease-decelerate);
}
```
Images fade in once decoded (`v-show` toggles from opacity 0), preventing a flash of the background color.

---

### `FeaturedCarousel` — FCM best-sellers horizontal scroll

**Defined in:** `FeaturedCarousel.vue` scoped CSS

Chevron navigation buttons use hover transitions matching the rest of the interactive surface system:

```css
.featured-carousel__chevron {
  transition: color var(--motion-sku-hover), transform var(--motion-sku-hover);
}
```

No entrance animation — the carousel is always visible (not stagger-revealed like SKU lists). The `v-haptic` directive fires on chevron tap.

---

## Keyframe Animations

### `@keyframes sku-enter`
```css
@keyframes sku-enter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```
Fade-forward card entrance (opacity leads, translate gives direction). 350ms decelerate.

### `@keyframes loading-indeterminate`
```css
@keyframes loading-indeterminate {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(250%); }
}
```
- **Purpose:** Sign-in loader indeterminate progress bar sweep
- **Duration:** `1.4s linear infinite` (status motion = steady rate)
- **Components:** `SignInLoader.vue` → `.loader__bar-fill`

### `@keyframes snackbar-drop`
```css
@keyframes snackbar-drop {
  0%   { transform: translateX(-50%) translateY(0);    opacity: 1; }
  18%  { transform: translateX(-50%) translateY(-12%); opacity: 1; }
  100% { transform: translateX(-50%) translateY(120%); opacity: 0; }
}
```
- **Purpose:** Snackbar exit — small anticipation hop, then drop off screen
- **Note:** `translateX(-50%)` must be preserved in every step (snackbar is centered via `left:50%; transform:translateX(-50%)` — a keyframe overwrites the entire `transform` property)
- **Duration:** `--motion-snackbar-exit` (250ms accelerate)

### `@keyframes story-progress`
```css
@keyframes story-progress {
  from { width: 0; }
  to   { width: 100%; }
}
```
Animates the active progress bar segment. Linear — fills at a constant rate to read as a timer. Auto-advance fires on `@animationend`.

### `@keyframes bloom-pulse`
```css
@keyframes bloom-pulse {
  0%, 100% { opacity: 0.28; transform: scale(1); }
  50%      { opacity: 0.48; transform: scale(1.02); }
}
```
3500ms ambient breathing halo behind the best-seller hero card.

### `@keyframes cat-fade-in` / `@keyframes cat-fade-out`
**Defined in:** `CategoryCatalog.vue` scoped CSS

```css
@keyframes cat-fade-in {
  from { opacity: 0; transform: translateY(var(--motion-sys-distance-md)); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cat-fade-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}
```

Category crossfade (FCM filter mode). Enter rises 8px from below (same spatial logic as `sku-enter` at a smaller travel distance — the whole category replaces in place, not entering from off-screen). Exit fades flat — no outgoing translate, so the disappearing content doesn't fight the incoming content's upward motion.

### `@keyframes nav-enter-top` / `@keyframes nav-leave-top`
**Defined in:** `CategoryNav.vue` scoped CSS

```css
@keyframes nav-enter-top {
  from { opacity: 0; transform: translateY(-100%); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes nav-leave-top {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-100%); }
}
```

Top subcategory nav slide (FCM). Mirrors `nav-enter` / `nav-leave` but from the top edge — the element lives at the top of the screen so it enters/exits toward that edge (spatial coherence). Used by the `subcat-nav` Vue `<Transition>` that appears when the user scrolls into the catalog.

---

## Effect Utilities

### `.fx-skeleton`
Loading placeholder with sweeping sheen. Used while hero images decode.

### `.fx-ripple`
**Defined in:** `src/tokens/effects.css` · **Directive:** `src/directives/vRipple.js`

Click-point ink ripple on all interactive buttons and card divs. Add `v-ripple` to any element — the directive adds the class and owns the JS lifecycle. CSS supplies the animation; the directive owns the DOM lifecycle.

```css
.fx-ripple { position: relative; overflow: hidden; isolation: isolate; }
.fx-ripple .fx-ripple__wave {
  position: absolute; border-radius: 50%; pointer-events: none;
  background: var(--fx-ripple-color, rgba(255,255,255,0.5));
  transform: scale(0); opacity: 0.4;
  animation: ripple var(--motion-ripple) var(--motion-sys-ease-decelerate) forwards;
}
```

Project-wide default: `--fx-ripple-color: rgba(255,255,255,0.14)` (set on `:root` in `style.css`). Override per-element for light surfaces: `--fx-ripple-color: rgba(0,0,0,0.15)` on the yellow CHECK OUT button.

**Requirements:** the host element needs `overflow: hidden` to clip the wave; the directive adds it automatically via `fx-ripple`. Conflicts with `overflow: visible` components (e.g. `BestSellerCard` in non-compact mode with its `fx-glow-border--hdr` ring) — don't add `v-ripple` to those.

---

### `.fx-shimmer`
**Defined in:** `src/tokens/effects.css`

Perpetual gloss sweep — a diagonal light beam looping across the surface. Used on:
- Compact best-seller carousel cards (image `::after`, warm champagne 4.5s)
- **CheckoutSheet "CHECK OUT" CTA button** — primary CTA pattern per the effects spec

```css
/* CheckoutSheet CTA — bright OKLCH gloss (scoped CSS, not inline) */
.sheet__checkout { --fx-shimmer-color: oklch(1 0 0 / 0.7); }
@media (dynamic-range: high) {
  .sheet__checkout { --fx-shimmer-color: oklch(1.3 0 0 / 0.8); }
}
```

The gloss color is **OKLCH white at full luminance** (`oklch(1 0 0 / 0.7)`) so the sweep reads brightly over the yellow (`--text-hyperlink-inverse`) button — the earlier `rgba(255,255,255,0.45)` was too faint. On HDR displays it pushes to `oklch(1.3 …)` (past the sRGB white ceiling) for a genuine glint.

**Requirements:** `overflow: hidden` + `isolation: isolate` — both applied automatically by the class.

**Variant:** `.fx-shimmer--hover` — one-shot gloss on `:hover` only (CTAs, nav buttons).

### SKU card gradient border (OKLCH, `::before` mask-composite)
**Defined in:** `SkuCard.vue` scoped CSS

A static gradient border ring on all regular SKU cards. `border-image` can't combine with `border-radius`, so the mask-composite `::before` pattern is used. Gradient runs 160° from near-transparent top-left to bright bottom-right, mimicking a "no top border" appearance through transparency. HDR pushes L > 1.0 for a genuine glint.

```css
.sku-card::before {
  /* 1px gradient ring — SDR */
  background: linear-gradient(160deg,
    oklch(0.99 0.004 247 / 0.04),
    oklch(0.99 0.004 247 / 0.22) 45%,
    oklch(0.99 0.004 247 / 0.58));
}
@media (dynamic-range: high) {
  /* Genuine glint — L > 1 on wide-gamut panels */
  .sku-card::before { background: linear-gradient(160deg,
    oklch(1.0 0.006 247 / 0.06),
    oklch(1.1 0.008 247 / 0.30) 45%,
    oklch(1.2 0.010 247 / 0.65)); }
}
```

Hue 247 = very slightly cool near-white (neutral silver). Hover brightens all stops.

---

### `.fx-glow-border--hdr`
Animated OKLCH conic running border — hero `BestSellerCard` only (not compact variant).

### `.fx-bloom`
Soft breathing halo behind the hero card (`::after`, `z-index: -1`, `blur(36px)`).

---

## Sign-In Flow Transitions

### `loader` (Transition name) — full-screen sign-in overlay
**Defined in:** `SignInLoader.vue` scoped CSS

```css
.loader-enter-active { transition: opacity var(--motion-modal-enter); }
.loader-leave-active { transition: opacity var(--motion-modal-exit); }
.loader-enter-from,
.loader-leave-to { opacity: 0; }
```

Two variants (selected via `:is-mobile` prop, driven by device frame):
- **Mobile (framed):** "Opening COD:M app…" — CODM lockup, indeterminate bar, Cancel link
- **Desktop (responsive):** QR-code sign-in — SIGN IN heading, scan instruction, QR, user code box

### `snackbar` (Transition name) — success toast
**Defined in:** `Snackbar.vue` scoped CSS

Enter: spring bounce (`--motion-snackbar-enter`, 350ms). Exit: `snackbar-drop` keyframe (250ms accelerate). The only spring in the flow — a deliberate delight moment after sign-in.

**Position:** `left: 50%; bottom: 32px; transform: translateX(-50%)` — centered, max-width 400px on wide viewports.

---

## Navbar Transitions

### `nav-auth` (Transition name)
Swap between Sign-in button ↔ avatar. Exit: scale + accelerate (200ms). Enter: scale + spring pop (250ms). `mode="out-in"`.

### Scroll-Aware Show/Hide
`translateY(-110%)` on scroll-down, restored on scroll-up. 250ms standard easing.

---

### `drawer` (Transition name) — nav menu
Left slide-in (`translateX(-100%)` → `0`). Enter 350ms decelerate, exit 200ms accelerate. Scrim fades alongside. Accordion sub-lists: `grid-template-rows: 0fr → 1fr`.

**Two-stage navigate sequence:** when a nav item with an anchor is tapped, `emit('close')` fires immediately so the drawer begins its 200ms exit. Navigation (scroll for COD:M, category filter switch for FCM) is deferred until after the exit completes — the delay is read live from `--motion-sys-duration-exit` via `getComputedStyle` so it stays in sync with the token without a hardcoded magic number.

```js
// NavDrawer.vue — onItemClick
emit('close')
const ms = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue('--motion-sys-duration-exit'), 10
) || 200
setTimeout(() => emit('navigate', anchor), ms)
```

- **Staging principle:** one thing moves at a time — drawer exits fully before the page responds. Firing both simultaneously creates competing motion (panel sliding while the viewport scrolls).
- **`prefers-reduced-motion`:** the `setTimeout` is skipped entirely; `emit('navigate')` fires synchronously so no invisible timer hangs.

---

### Mouse-drag inertia — `useDragScroll` composable
**Defined in:** `src/composables/useDragScroll.js` · Used by `BestSellerCarousel` + `CategoryNav`

Not CSS — JS physics via rAF. Document-level `pointermove`/`pointerup` listeners (no `setPointerCapture`) so child `click` events always fire. Velocity = EMA (weight 0.35). Momentum on release: `FRICTION 0.96`, frame-rate-independent. >6px threshold suppresses trailing click (capture phase). `dragstart` suppressed to prevent native OS image-drag. Ignores `pointerType: 'touch'`.

---

### `--motion-nav-enter` + `nav-enter` keyframe
**Token:** `src/tokens/motion.css` · **Keyframe:** `CategoryNav.vue`

```css
--motion-nav-enter: var(--motion-sys-duration-slow) var(--motion-sys-ease-decelerate); /* 350ms ease-out */

@keyframes nav-enter {
  from { opacity: 0; transform: translateY(100%); }
  to   { opacity: 1; transform: translateY(0); }
}
```

The sticky **bottom** category nav slides up from the bottom edge it lives on. Ease-out (decelerate), **no spring** — utilitarian persistent nav, not a delight moment. `animation-delay: 700ms` — lands after the section cascade.

**Subcategory top nav — `nav-enter-top` / `nav-leave-top` keyframes (added v0.9.0)**

The FCM **top** subcategory nav (a second `CategoryNav` with `variant="top"`) uses companion keyframes that slide from the opposite edge — entering from above, exiting upward. Wrapped in a `subcat-nav` Vue `<Transition>` that is conditionally rendered once the user scrolls past the catalog anchor.

```css
@keyframes nav-enter-top {
  from { opacity: 0; transform: translateY(-100%); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes nav-leave-top {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-100%); }
}
```

```css
/* subcat-nav Vue Transition classes */
.subcat-nav-enter-active {
  animation-name: nav-enter-top;
  animation-duration: var(--motion-sys-duration-base);    /* 250ms */
  animation-timing-function: var(--motion-sys-ease-decelerate);
}
.subcat-nav-leave-active {
  animation-name: nav-leave-top;
  animation-duration: var(--motion-sys-duration-exit);    /* 200ms */
  animation-timing-function: var(--motion-sys-ease-accelerate);
}
```

- Enter: `--motion-sys-duration-base` (250ms, decelerate) — slightly shorter than the bottom nav (no cascade delay needed, triggered by scroll)
- Exit: `--motion-sys-duration-exit` (200ms, accelerate) — decisive departure when scrolling back up

---

### `bundle-enter` keyframe
**Defined in:** `BundleSkuCard.vue` scoped CSS

```css
@keyframes bundle-enter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; }
  /* No transform in `to` — animation-fill-mode:both would otherwise retain
     translateY(0) on .bundle, creating a Chromium compositor layer that prevents
     child backdrop-filter from sampling the banner image within the card. */
}
```

Matches `sku-enter` character (fade-forward). 12px rise vs 6px — the bundle card is taller. 350ms decelerate; `animation-delay: 550ms` (cascade slot between carousel and promo).

### `slide-down` keyframe
**Defined in:** `src/tokens/keyframes.css`

```css
@keyframes slide-down {
  from { opacity: 0; transform: translateY(calc(-1 * var(--motion-sys-distance-lg))); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Used by `PromoBanner` and `PlayerAccount` for their downward-entrance pattern (element enters from above). 250ms decelerate.

---

## Accessibility

All animations respect `prefers-reduced-motion` (global collapse in `reduced-motion.css`). Motion is never the only signal of a state change.

---

## Performance Notes

- Only `transform` and `opacity` are animated on hot paths
- GPU compositing via `will-change: transform` on key animated elements
- Section entrance cascade: story 100ms → account 180ms → hero 250ms → carousel 450ms → bundle 550ms → promo 650ms → cp 900ms
- Cards staggered 90ms within each section

---

## Integration Checklist

When adding new components or sections:

- [ ] Use `--motion-modal-enter/exit` for overlay/sheet transitions
- [ ] Slide from the edge the element lives on (orientation)
- [ ] Spring/bounce only for delight moments — never for utilitarian surfaces (payment, forms)
- [ ] Scrim: no blur for bottom sheets; blur acceptable for full-screen overlays
- [ ] Apply `fx-shimmer` to primary CTA buttons; use `fx-shimmer--hover` for secondary
- [ ] Use `--motion-sku-enter` for list/grid entrances
- [ ] Apply per-card stagger via `animDelay` prop (formula: `index * 90`)
- [ ] Honor `prefers-reduced-motion` (extend the `@media` block in `effects.css`)
- [ ] Animate only `transform` and `opacity` for performance
- [ ] OKLCH for any color with HDR intent — pair SDR baseline with `@media (dynamic-range: high)` boost

---

## Haptic feedback tokens

Tactile counterpart to motion — a short `navigator.vibrate()` on tap. Because the
Vibration API takes numbers (ms) and arrays (patterns like `[10,40,20]`) that CSS
custom properties cannot represent, haptic tokens are authored in **JS**, not CSS
— the same pragmatic exception already made for gradients (which are CSS-authored
because they can't be Figma variables). The file mirrors the motion primitive →
semantic tiering.

**Source of truth:** `src/tokens/haptics.js`

| Tier | Token | Value | Use |
|---|---|---|---|
| primitive | `light` | `10` ms | buttons, chips, tabs |
| primitive | `medium` | `20` ms | committing action |
| primitive | `heavy` | `35` ms | weighty confirmation |
| semantic | `press` | light | generic button / icon / close |
| semantic | `chip` | light | chip / tab selection |
| semantic | `select` | medium | SKU / bundle / best-seller card select |
| semantic | `confirm` | heavy | checkout CTA |
| semantic | `success` | `[10,40,20]` | sign-in success snackbar (pattern) |
| semantic | `error` | `[20,30,20]` | failed lookup / destructive (pattern) |

**Consuming them — two ways:**

- **`v-haptic` directive** (`src/directives/vHaptic.js`) — fires on `pointerdown`,
  mirrors `v-ripple`. The arg picks the semantic token: `v-haptic` (→ `press`),
  `v-haptic:chip`, `v-haptic:confirm`. Use for simple buttons/chips.
- **`useHaptics()` composable** (`src/composables/useHaptics.js`) — call
  `haptic('select')` in a handler for gated / outcome-dependent feedback (e.g. SKU
  cards fire `select` only when checkout actually opens; `useAuth` fires `success`
  on the sign-in snackbar and `error` on sign-out).

**Gating:** the composable suppresses haptics under `prefers-reduced-motion`
(vibration is motion) and no-ops silently where unsupported — notably **iOS Safari
does not implement the Vibration API**, so haptics simply do nothing on iPhone.
That is expected, not a bug. The `<input type="checkbox" switch>` / `label.click()`
Taptic Engine workaround was evaluated and deliberately rejected: Apple patched
programmatic triggering in iOS 26.5, and it provides no intensity or pattern
control (one fixed tick regardless of token tier).

### Haptic checklist

- [ ] Simple button/chip → add `v-haptic` (or `:chip`/`:confirm`) beside `v-ripple`
- [ ] Gated/outcome feedback → `useHaptics().haptic(...)` in the handler, never the directive
- [ ] New patterns/intensities go in `haptics.js` — never a raw `navigator.vibrate(n)` in a component

---

## References

- **Base motion library:** `src/tokens/motion.css`
- **SKU tokens:** `src/tokens/motion-sku.css`
- **Haptic tokens:** `src/tokens/haptics.js`
- **Figma design:** CODM SKU Card 3.0

---

**Last updated:** June 2026 · v0.24.0 — all primitive tokens renamed to `--motion-sys-*` namespace
**Version:** v0.9.1 — NavDrawer two-stage exit-then-navigate sequence; FCM nav hierarchy updated to Store group (Daily Supplies / Limited Offers / Top Ups); nav item anchors wired for both stores
**Version:** v0.9.0 — `CategoryCatalog` (`cat-catalog` transition, `cat-fade-in/out` keyframes, section+item stagger formula); `SkuImageCard` (image-led card type, entrance/hover/press/bg-fade); `EaSignInPage` (`ea-page` transition); `AccountPopover` (`popover` transition, scale origin top-right); `SignInSheet` (bottom sheet transition, responsive modal scale); `FeaturedCarousel` (chevron hover); `CategoryNav` top subcategory nav (`nav-enter-top`/`nav-leave-top` keyframes, `subcat-nav` transition); `CheckoutSheet` responsive modal scale variant documented
**Version:** v0.7.0 — haptic feedback tokens (`src/tokens/haptics.js`), `useHaptics` composable + `v-haptic` directive documented
**Version:** v0.6.0 — `--motion-ripple` / `v-ripple` directive documented, `.fx-ripple` effect utility added, bonus text OKLCH tokens (`--text-web-bonus-codashop/cp`) with HDR overrides
