# SKU Cards — Engineering Handoff

> This is the implementation hand-over for the **entire SKU-card family** in the
> web-store prototype: the six card variants, the supporting pieces (`SkuTag`,
> `BundleItem`), the containers that lay them out (`SkuList`, `SkuImageList`,
> `GiftGrid`, `BundleGrid`) and the two carousels. It captures the three things
> the source alone doesn't surface — **choreography** (entrance cascade, price
> reveal, countdowns), **rationale** (why each card behaves the way it does) and
> **gotchas** — and cites every value to a real design token.
>
> **Governing principle:** every duration, easing, colour, radius and shadow is a
> design token. There are no per-component magic numbers except the few flagged
> explicitly in §8. If you reach for a literal, you're doing it wrong — chase the
> token in `src/tokens/`.
>
> **Scope:** the COD:M card behaviour. The cards are theme-agnostic (zero
> `theme === 'codm'` branches) — every whitelabel store (Rogue Trader, FCM,
> YGODL, TDR…) reskins them purely through token overrides. Per-store divergences
> are noted inline where they matter. The checkout/gift **sheets** these cards
> open are sibling flows, documented only at the boundary (§4).
>
> **Last updated:** 2026-06-28 · tracks prototype **v0.32.2**.

---

## 0. The card family at a glance

| Card | File | Role | Opens | Container(s) |
|---|---|---|---|---|
| **SkuCard** | [`SkuCard.vue`](../../../src/components/SkuCard.vue) | Currency/coin tile (CP amount + bonus + price). `default` (column) or `row` layout. | Checkout | `SkuList` |
| **SkuImageCard** | [`SkuImageCard.vue`](../../../src/components/SkuImageCard.vue) | Image-led SKU. `panel` (1:1 art on top) or `background` (oversized bottom-anchored art) variant. | Checkout | `SkuImageList` |
| **HeroSkuCard** | [`HeroSkuCard.vue`](../../../src/components/HeroSkuCard.vue) | Full-bleed landscape showcase for a **named** product (edition / collector pack). Animated dual-comet border + bloom. | Checkout | (page direct) |
| **BestSellerCard** | [`BestSellerCard.vue`](../../../src/components/BestSellerCard.vue) | HDR hero coin card. `compact` variant for the carousel. Conic HDR border + bloom + skeleton. | Checkout | `BestSellerCarousel` |
| **BundleSkuCard** | [`BundleSkuCard.vue`](../../../src/components/BundleSkuCard.vue) | Banner art + child-item breakdown row + price. Live countdown, claimed state. | Checkout (+ Item Summary on child tap) | `BundleGrid`, `FeaturedCarousel` |
| **GiftSkuCard** | [`GiftSkuCard.vue`](../../../src/components/GiftSkuCard.vue) | Free-gift offer. "FREE GIFT" tag, "CLAIM GIFT" CTA, countdown, claimed state. | Gift claim | `GiftGrid` |
| **BundleItem** | [`BundleItem.vue`](../../../src/components/BundleItem.vue) | One child tile inside a bundle breakdown (rarity bg, tag pill, qty badge). | — (emits `select`) | inside `BundleSkuCard` |
| **SkuTag** | [`SkuTag.vue`](../../../src/components/SkuTag.vue) | Shared pill badge (BEST VALUE / BONUS / FREE GIFT). | — | inside the cards above |

Containers: [`SkuList.vue`](../../../src/components/SkuList.vue) ·
[`SkuImageList.vue`](../../../src/components/SkuImageList.vue) ·
[`GiftGrid.vue`](../../../src/components/GiftGrid.vue) ·
[`BundleGrid.vue`](../../../src/components/BundleGrid.vue) ·
[`BestSellerCarousel.vue`](../../../src/components/BestSellerCarousel.vue) ·
[`FeaturedCarousel.vue`](../../../src/components/FeaturedCarousel.vue).

---

## 1. The flow at a glance

Every card is a **leaf**: it owns only its own press/hover/entrance state and a
stable `itemKey`. Selection state and timing live in two singleton composables —
the cards never emit-drill through their containers.

```
        ┌─────────────────────────── leaf card ───────────────────────────┐
 tap →  │ onSelect()                                                       │
        │   └─ openCheckout(item, itemKey)  ← useCheckout.js (singleton)   │
        │         gate: signedIn || guestVerified ?  ── no ─→ return false │ (silent no-op)
        │                         │ yes                                    │
        │                         ▼                                        │
        │         sheetOpen=true ; selectedKey=itemKey ; return true       │
        │                         │                                        │
        │   if (opened) haptic('select')   ← only fires on a real open     │
        └─────────────────────────┼────────────────────────────────────────┘
                                   ▼
   CheckoutSheet (sibling flow) reads sheetOpen/selectedItem and slides up.
   Meanwhile every card recomputes isSelected = sheetOpen && selectedKey === itemKey
   → the originating card shows its --selected ring + tint.

 Gift path is identical but → useGiftClaim.js → ClaimGiftSheet, and the gate is
 INVERTED: the gift sheet ALWAYS opens (guest identifies the account inside it).
```

**`itemKey` is the selection contract.** Each card derives a stable key
(`SkuCard`: `` `${amount}|${currentPrice}` ``; `BundleSkuCard`/`HeroSkuCard`:
`` `${title}|${currentPrice}` ``; `GiftSkuCard`: `props.id`) and lights up its
selected state when `selectedKey`/`selectedGift.id` matches. This is how one
shared sheet highlights exactly one card with no parent wiring.

### Entrance choreography (page load)

Cards animate in on a **two-axis cascade**: a per-section `baseDelay` offset and a
per-card index stagger, summed into `animation-delay`.

| t (ms) | Event | Source |
|---|---|---|
| `baseDelay + i·90` | Card `i` runs `sku-enter` (opacity 0→1, `translateY(6px→0)`), `350ms`, decelerate | [`SkuCard.vue:77`](../../../src/components/SkuCard.vue#L77), [`SkuList.vue:46`](../../../src/components/SkuList.vue#L46) |
| `baseDelay + i·90 + 350` | That card's **price block** runs `fade-in`, `350ms`, decelerate | [`SkuCard.vue:79`](../../../src/components/SkuCard.vue#L79) |
| (on tap, if best-value) | Badge runs `pop` (scale 1→1.15→1), `350ms`, **spring** | [`SkuCard.vue:270-275`](../../../src/components/SkuCard.vue#L270) |

> **Why the +350 ms price reveal matters.** The price uses `animationDelay =
> baseDelay + animDelay + 350`. The 350 is exactly one `--motion-sys-duration-slow`
> — i.e. the card's own entrance length. So the price fades in *after* the card has
> finished arriving, giving a deliberate two-beat reveal (card lands → price
> resolves) instead of everything appearing at once. Keep them coupled: if you
> change the card entrance duration, change this offset to match.

> **Stagger is `index * 90`, not the token.** `--motion-sku-stagger` resolves to
> `50ms` ([`motion-sku.css:42`](../../../src/tokens/motion-sku.css#L42)) but the
> lists pass `:anim-delay="index * 90"` inline ([`SkuList.vue:46`](../../../src/components/SkuList.vue#L46),
> [`SkuImageList.vue:42`](../../../src/components/SkuImageList.vue#L42),
> carousels at `i * 90`). The 90 ms is the value actually shipped; the token is the
> system default the lists currently override. Flagged in §8 — don't "fix" one
> without the other.

---

## 2. Shared card anatomy (the patterns every card reuses)

Implement these once and reuse — six cards share the same skeleton.

### 2a. Gradient border ring (`::before` mask-composite)

`border-image` can't combine with `border-radius`, so every card paints its 1px
gradient ring as a pseudo-element clipped to a ring by mask-composite:

```css
.card::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: inherit;
  padding: var(--border-weight-default);          /* 1px ring thickness */
  background: var(--border-sku-card-default);      /* theme gradient */
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: destination-out;
  pointer-events: none;
}
```

The gradient itself (`--border-sku-card-default` → `--surface-l1-border`) is a
theme token and auto-upgrades for wide-gamut panels. On `:hover` it swaps to
`--border-sku-card-hover`; when `--selected` it swaps to
`--border-sku-card-selected` (`--sys-colour-primary-main`) and thickens to
`--border-weight-selected` (2px). `HeroSkuCard` and `BestSellerCard` replace this
static ring with an **animated conic** ring (§2e).

### 2b. Entrance + press + hover

| State | What happens | Tokens |
|---|---|---|
| Entrance | `sku-enter` keyframe, fill `both`, delay inline | `--motion-sys-duration-slow` `--motion-sys-ease-decelerate` |
| Hover in | `translateY(-2px)` + `--shadow-card-hover` | `--motion-sku-hover-in` (220ms decelerate) |
| Hover out | returns to rest | `--motion-sku-hover` (150ms standard) |
| Press | `scale(--motion-sku-press-scale)` `!important` | `--motion-sku-press` (100ms standard) |

> `--motion-sku-press-scale` is `0.99` in the token, but `SkuCard`/`GiftSkuCard`
> use it via the token while `HeroSkuCard`/`BestSellerCard` hardcode `scale(0.98)`
> for a slightly deeper press on the big cards. Minor inconsistency — see §8.

### 2c. Selected state

Driven entirely by the singleton (`isSelected = sheetOpen && selectedKey === itemKey`).
On select: background → `--bg-card-selected` (`--sys-colour-primary-subtle`),
border → `--border-sku-card-selected`, ring thickens to 2px. The background swap
transitions over `--motion-sys-duration-base` (250ms) decelerate.

### 2d. Live countdown (Gift / Bundle / BestSeller)

Three cards render a countdown from an `endsAt` (ms epoch) prop. The logic is
**identical and currently duplicated** in each:

- Ticks via `setInterval(… , 1000)` started in `onMounted` (only if `endsAt != null`), cleared in `onBeforeUnmount`.
- Format drops the day segment at `0d`: `14h 48m`, not `0d 14h 48m`.
- Urgency tiers drive colour: **≥72h** `default` (body), **24–72h** `warning`, **<24h** `error`, via a `[data-urgency]` attribute.

### 2e. Decorative effects (`HeroSkuCard`, `BestSellerCard`)

Applied as global classes from [`effects.css`](../../../src/tokens/effects.css):

- `.fx-glow-border--dual` — **two** comets orbiting 180° apart (HeroSkuCard).
- `.fx-glow-border--hdr` — single OKLCH comet (BestSellerCard, non-compact only).
- `.fx-bloom` — soft breathing halo behind the card (`bloom-pulse`, opacity 0.12↔0.22).
- `.fx-skeleton` — sheen placeholder while a heavy `.webp` decodes (BestSeller, SkuImageCard).

> **The conic-gradient must be written inline in `background`, never wrapped in a
> token.** Chrome does not re-evaluate a `var(--angle)` nested inside another
> custom property per animation frame — the conic freezes. `effects.css` writes
> `conic-gradient(from var(--angle), …)` directly so `--angle` (an `@property`
> registered `<angle>`) is read live each frame as `border-spin` runs it 0→360°.

---

## 3. Surface-by-surface specs

Each card below: file · what it is · the props that matter · the behaviour that's
non-obvious. Full prop tables in §3.x; common props (`baseDelay`, `animDelay`,
`skuImage`, `loyaltyPoints`, price trio) behave identically everywhere.

### 3.1 SkuCard — currency tile
**File:** [`SkuCard.vue`](../../../src/components/SkuCard.vue) · entrance `sku-enter` · ring static.

Vertical column by default (`badge → info → price pinned to bottom`); `layout="row"`
flips to a horizontal card (left: info, right: price) — `SkuList` sets this for its
`columns`/`stack` layouts.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `amount` | Number | **required** | large currency figure |
| `baseAmount` / `bonusAmount` | Number | `null` | render the `400 + 60 BONUS` line when both set |
| `bonusType` | String | `'codashop'` | `'codashop'` purple · `'cp'` blue |
| `bonusLabel` | String | `''` | from `strings.sku.bonusLabel` |
| `currentPrice` | String | **required** | displayed price |
| `originalPrice` / `discountPercent` | String | `null` | crossed-out price + `-49%` |
| `isBestValue` | Boolean | `false` | shows BEST VALUE badge |
| `tagLabel` | String | `null` | overrides `isBestValue` label |
| `cpIcon` / `skuImage` | String | `null` | currency glyph / checkout thumb |
| `loyaltyPoints` | Number | `null` | feeds checkout loyalty banner |
| `subtitle` | String | `null` | supporting line |
| `animDelay` / `baseDelay` | Number | `0` | stagger + section offset |
| `layout` | String | `'default'` | `'default'` \| `'row'` |

- The **badge slot reserves a constant 16px height** even when empty, so amounts align across a row of mixed best-value / non-best-value cards (matches Figma's opacity-0 placeholder tags). In `row` layout the empty slot is `display:none` instead.
- `.text-style-heading-sku-title` carries a Hitmarker `scaleX` condense with `transform-origin: left`; prices override to `right center` so the right edge stays put as the text condenses.

### 3.2 SkuImageCard — image-led SKU
**File:** [`SkuImageCard.vue`](../../../src/components/SkuImageCard.vue) · two variants, store-agnostic.

`variant="panel"` houses the art in a 1:1 frame (capped 160×160) at the top, text
below. `variant="background"` makes the art an oversized (132%) bottom-anchored
full-bleed background cropped by the card, with a `--gradient-sku-image-card-fade`
overlay for legibility; the card takes `aspect-ratio: 3/4`. The variant is chosen
by the **data layer, never by store identity**.

Notable props beyond the shared set: `currencyLabel` (appended to amount, e.g.
"FC Points"), `loyaltyIcon` (CSS-masked so it inherits `currentColor`),
`backgroundImage` (full-bleed card bg under the L1 scrim), `amount` is **nullable**
(non-numeric SKUs like Daily Boosters). Price block is **center-aligned** here
(vs right-aligned in SkuCard).

### 3.3 HeroSkuCard — named-product showcase
**File:** [`HeroSkuCard.vue`](../../../src/components/HeroSkuCard.vue) · `.fx-bloom .fx-glow-border--dual` on the root.

Full-bleed key art + bottom-up `--gradient-hero-scrim`; content row is text-left /
price-right (mirrors BundleSkuCard). Leads with `eyebrow` + `title` + an `includes`
chip list — the shape an edition/collector pack needs. Passes `amount: title` into
checkout so the product **name** surfaces in the summary.

```css
.hero-sku {
  /* NO overflow:hidden here — it would clip the bloom ::after halo and the
     selected ::before ring. Corner clipping is delegated to __media. */
  animation-name: sku-enter; /* slow / decelerate / both */
}
.hero-sku::after { inset: -8%; filter: blur(48px) brightness(1.05) saturate(1.1); } /* bigger bloom than default -2% */
.hero-sku--selected::before { /* static, non-spinning thicker ring overrides the dual-comet */
  inset: calc(-1 * var(--border-weight-selected));
  padding: var(--border-weight-selected);
  background: var(--border-sku-card-selected);
  animation: none;
}
```

> ⚠️ **No `overflow:hidden` on the root.** The bloom halo and selected ring both
> bleed beyond the card edge; clipping is handled by `overflow:hidden` on
> `.hero-sku__media` instead. If you add `overflow:hidden` to the root to "fix"
> something, you'll silently kill the bloom.

### 3.4 BestSellerCard — HDR hero coin
**File:** [`BestSellerCard.vue`](../../../src/components/BestSellerCard.vue) · `compact` toggles carousel mode.

Hero (full) gets `.fx-glow-border--hdr .fx-bloom`; `compact` (carousel) drops both
and instead runs a **metallic shimmer** sweep over the image
(`shimmer-loop`, `2954ms`, linear) on a continuous radial background. The coin art
(`skuImage`, 128×128) is **in-flow** (`position:relative`) so it drives the image
box height rather than being absolutely positioned. Heavy hero `.webp` shows an
`.fx-skeleton` until `@load`/cached-complete fires (`is-loaded` fades it in).

```css
.bestseller__card {                 /* hero */
  border-top: 1px solid var(--border-warm);   /* warm hairline UNDER the running border */
  border-left: 1px solid var(--border-warm);
  background: var(--gradient-bestseller-hero);
  /* no overflow:hidden — would clip the ::before conic ring; children clip themselves */
}
.bestseller__card--compact { background: var(--gradient-bestseller-hero-hover); } /* one continuous radial, info bar in the dark tail */
```

> ⚠️ The hero info bar uses `backdrop-filter: blur(64px)` over the radial; the
> compact variant **removes** the backdrop-filter on its info bar because a
> separate filter layer creates a visible seam at the image/info boundary. Don't
> re-add it to compact.

### 3.5 BundleSkuCard — banner + breakdown
**File:** [`BundleSkuCard.vue`](../../../src/components/BundleSkuCard.vue) · entrance `bundle-enter`.

Banner art (2.6:1, image **or** video via `Media`) with a bottom-edge mask fade
into the card surface + `--gradient-bundle-banner` scrim. Optional `skuOnBanner`
composites a 1:1 hero (160×160) centred on the banner. The breakdown row of
`BundleItem` tiles overlaps the banner bottom by **-20px**; it's **omitted entirely
when `items` is empty** (editions / digital keys) so there's no empty gap.
`breakdownScrollable` makes that row a horizontal drag-scroller (`useDragScroll`).

Child-tile tap → Item Summary sheet (config opt-in `bundle.itemSummary`, COD:M
only); `stopPropagation` prevents the card-level checkout from also firing. Stores
without the opt-in let the click bubble to the card's checkout.

```css
@keyframes bundle-enter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; }   /* NO transform in `to` — see gotcha */
}
```

> ⚠️ **`to` deliberately omits `transform`.** With `animation-fill-mode: both`, a
> `translateY(0)` in `to` would be retained and create a Chromium compositor layer
> that stops the child `backdrop-filter` (on `BundleItem`) from sampling the banner
> image. Leaving `transform` out of `to` lets it reset cleanly. Same trick in
> `gift-enter`. **Do not add `transform: translateY(0)` to these `to` frames.**

### 3.6 GiftSkuCard — free-gift claim
**File:** [`GiftSkuCard.vue`](../../../src/components/GiftSkuCard.vue) · entrance `gift-enter`.

`FREE GIFT` `SkuTag` overlaid top-left on the art; centred `CLAIM GIFT` CTA that
flips to `CLAIMED` (and dims the art to 30% opacity) once
`useGiftClaim.isClaimed(id)` is true. Countdown prefix flips `Ends:` → `Refreshes:`
when `refreshesOnClaim`. `id` is **required** — it's the claim identity and the
selection key. Localised prefixes via `endsLabel` / `refreshesLabel`.

### 3.7 BundleItem — child tile
**File:** [`BundleItem.vue`](../../../src/components/BundleItem.vue)

Square SKU image on a rarity-graded background (`--rarity-gradient-*`, neutral
fallback), optional top `SkuTag` pill (`tag: { label, variant }`), bottom-right
quantity badge. `tileBg` accepts a CSS gradient/colour **or** an image URL (detected
by regex, wrapped `center / cover`). Emits `select` (parent decides what to do).

> ⚠️ `will-change: backdrop-filter` is set deliberately — it promotes the tile to
> its own compositor layer, working around the Safari bug where `backdrop-filter`
> stops working inside `overflow:hidden` parents (the bundle card clips its corners).

### 3.8 SkuTag — shared pill
**File:** [`SkuTag.vue`](../../../src/components/SkuTag.vue) · variants `bonus` \| `value` \| `success`.

`bonus` and `value` are visually identical (`--bg-tag-bonus` / `--text-tag-bonus`);
`success` is the legacy green (`--bg-tag-success`). The consumer positions it
(absolute on BundleItem/Gift, in-flow on SkuCard). `transform-origin: center` on the
text so the Hitmarker condense hugs symmetrically.

### 3.9 Containers

| Container | Grid behaviour |
|---|---|
| [`SkuList`](../../../src/components/SkuList.vue) | `wrap` (default): 2-col → **4-col @641px**. `columns`: 1-col → 2-col @801px (row cards). `stack`: always 1-col row cards. |
| [`SkuImageList`](../../../src/components/SkuImageList.vue) | 2-col → 4-col @641px (matches SkuList `wrap`). |
| [`GiftGrid`](../../../src/components/GiftGrid.vue) | 2-up at **every** width incl. mobile; `count < 4` collapses to a single row @641px (`--gift-count`). |
| [`BundleGrid`](../../../src/components/BundleGrid.vue) | 1-col → 2-col @801px. |
| [`BestSellerCarousel`](../../../src/components/BestSellerCarousel.vue) | Drag-scroll row of `compact` BestSellerCards. XS/S ~62.5% card width (always scrolls); M/L 3-up, 207px floor. Chevrons appear only on overflow. |
| [`FeaturedCarousel`](../../../src/components/FeaturedCarousel.vue) | Same carousel mechanics, items are `BundleSkuCard`. |

> All breakpoints are **container queries** (`@container`), not media queries —
> they resolve against `.device__screen` (`container-type: inline-size`), so
> "641px" is the device-frame width, not the viewport. This is what makes the
> iPhone/Samsung/responsive device frames lay out correctly.

---

## 4. State & timing constants (single source of truth)

Cards hold **no timing constants of their own** — they read singletons. Change
behaviour there, not in components.

[`useCheckout.js`](../../../src/composables/useCheckout.js) — module-level refs = singleton:

| Symbol | Meaning |
|---|---|
| `sheetOpen` / `selectedItem` / `selectedKey` | Drives every card's `isSelected`. |
| `guestVerified` / `guestPlayerName` | Guest path: PlayerAccount flips these once a Player ID is "found". |
| `openCheckout(item, key)` | **Gate:** returns `false` (silent no-op) unless `signedIn || guestVerified`; else sets state, returns `true`. The `true` is the signal the card may fire its `select` haptic. |

[`useGiftClaim.js`](../../../src/composables/useGiftClaim.js) — sibling singleton:

| Symbol | Meaning |
|---|---|
| `claimSheetOpen` / `selectedGift` / `claimSuccess` | Sheet state; `claimSuccess` toggles confirm → success view. |
| `claimedIds` (reactive `Set`) | Confirmed claims keyed by `gift.id` → drives each card's `CLAIMED`. |
| `requiresAccount` | Captured **once** at open time (not reactive) — see gotcha below. |
| `openGiftClaim(gift)` | **Always** returns `true` — gift sheet opens for signed-out guests too (they identify inside it). |
| `confirmClaim()` | Adds to `claimedIds`, flips to success, fires `success` haptic. |
| `pendingEaGift` + `watch(signedIn)` | EA-redirect flow: after sign-in completes, waits **200ms** (sign-in overlay leave) then opens the sheet directly in success state. |

> ⚠️ `requiresAccount` is frozen at open time on purpose. If it were derived
> reactively it would flip to `false` the instant `guestVerified` turns true, the
> embedded form's `v-if` would unmount, `PlayerAccount.onBeforeUnmount` would reset
> `guestVerified`, and you'd get a remount/flicker loop.

---

## 5. Token reference (everything the cards consume)

### Motion — base ([`motion.css`](../../../src/tokens/motion.css)) + SKU composites ([`motion-sku.css`](../../../src/tokens/motion-sku.css))

| Token | Value | Used by |
|---|---|---|
| `--motion-sys-duration-fast` | `150ms` | hover-out, ripple |
| `--motion-sys-duration-base` | `250ms` | bg/select transition, entrance primitive |
| `--motion-sys-duration-slow` | `350ms` | **card entrance**, price reveal, badge pop |
| `--motion-sys-duration-exit` | `200ms` | card exit |
| `--motion-sys-ease-decelerate` | `cubic-bezier(0,0,0.2,1)` | all entrances (ease-out) |
| `--motion-sys-ease-standard` | `cubic-bezier(0.4,0,0.2,1)` | hover-out, press, on-screen moves |
| `--motion-sys-ease-accelerate` | `cubic-bezier(0.4,0,1,1)` | exits (ease-in) |
| `--motion-sys-ease-spring` | `cubic-bezier(0.34,1.56,0.64,1)` | **badge pop only** (delight) |
| `--motion-sys-ease-linear` | `linear` | conic border, shimmer, skeleton loops |
| `--motion-sku-enter` | base + decelerate | (composite; entrance uses slow inline) |
| `--motion-sku-hover-in` | `220ms` decelerate | hover lift |
| `--motion-sku-hover` | `150ms` standard | hover return |
| `--motion-sku-press` | `100ms` standard | press |
| `--motion-sku-press-scale` | `0.99` | press scale |
| `--motion-sku-badge` | slow + spring | badge pop |
| `--motion-sku-stagger` | `50ms` | *system default — lists override to 90ms inline (§8)* |
| `--motion-shimmer-sweep` | `3000ms` | `.fx-shimmer` |
| `--motion-sku-skeleton` | `1400ms` | `.fx-skeleton` |
| `--motion-sku-bloom` | `3500ms` | `.fx-bloom` breathe |
| `--motion-border-spin` | `3200ms` | conic running border |
| `--hdr-glow` / `--hdr-hot` / `--hdr-bloom` | OKLCH `0.82/0.20/75`, `0.97/0.16/95`, `0.72/0.23/55` (brighter `@media (dynamic-range: high)`) | HDR border + bloom |

### Colour ([`semantics.css`](../../../src/tokens/ds/semantics.css))

| Token | Resolves to | Role |
|---|---|---|
| `--bg-sku-card-default` | `--surface-l1-fill` | card surface |
| `--bg-card-selected` | `--sys-colour-primary-subtle` | selected surface tint |
| `--border-sku-card-default` | `--surface-l1-border` | ring (gradient) |
| `--border-sku-card-hover` | `--surface-l1-border-hover` | ring on hover |
| `--border-sku-card-selected` | `--sys-colour-primary-main` | ring on select |
| `--bg-tag-bonus` / `--text-tag-bonus` | `--sys-colour-bonus-subtle` / `--sys-colour-bonus-inverse` | SkuTag (bonus/value) |
| `--text-header-default` / `--text-body-default` / `--text-hyperlink-default` | ink ramp | amount · body · price |
| `--text-success-default` / `--text-warning-default` / `--text-error-default` | status ramp | discount · countdown urgency |
| `--text-bonus-amount` | bonus ramp | the `+N` bonus figure |

### Space / radius / stroke ([`space.css`](../../../src/tokens/ds/space.css))

`--pad-surface-xxs/xs/s/m/l/xl` = `2/4/8/12/16/24px` · `--gap-content-tight/narrow/default/loose`
= `2/4/8/12px` · `--radius-container-s` = `8px` · `--radius-container-xs` = `4px`
· `--radius-badge-full` = `999px` · `--border-weight-default` = `1px` ·
`--border-weight-selected` = `2px`.

### Shadow + gradients ([`extensions.css`](../../../src/tokens/ds/extensions.css))

`--shadow-card` `0 2px 4px oklch(0 0 0/.25)` · `--shadow-card-hover` `0 6px 12px oklch(0 0 0/.30)`
· `--shadow-bestseller` `0 …/24px oklch(0 0 0/.35)` · `--gradient-hero-scrim` ·
`--gradient-bundle-banner` · `--gradient-bestseller-hero[-hover]` ·
`--gradient-bestseller-vignette` · `--gradient-bestseller-metallic-shine` ·
`--gradient-sku-image-card-fade` · `--mask-sku-card-bg-fade` · `--rarity-gradient-*`.

**The governing motion rules** (restate when adding a card):
- Entrances **decelerate** (ease-out); permanent exits **accelerate** (ease-in, shorter).
- **Spring is reserved for delight** — the only place it's used here is the badge `pop`.
- Animate only `transform` and `opacity` (every keyframe in `keyframes.css` obeys this).
- The `animation`/`transition` **shorthand is banned when the easing token contains a comma** (cubic-bezier). Use longhands (`animation-name`/`-duration`/`-timing-function`, or `transition-duration`/`-timing-function`) — the cards all do.

### Keyframes ([`keyframes.css`](../../../src/tokens/keyframes.css))

`sku-enter` (opacity + `translateY(6px→0)`) · `fade-in` · `pop` (scale 1→1.15@40%→1)
· `bundle-enter` / `gift-enter` (translateY 12px, no transform in `to`) · `bloom-pulse`
· `shimmer-loop` · `shimmer` (skeleton) · `ripple` · `border-spin` (`@property --angle` 0→360deg).

---

## 6. Accessibility & performance

- **Reduced motion is global.** [`reduced-motion.css`](../../../src/tokens/reduced-motion.css)
  collapses all `animation-duration`/`transition-duration` to `0.01ms !important`
  under `prefers-reduced-motion: reduce`; [`effects.css`](../../../src/tokens/effects.css#L206)
  additionally sets `animation: none` on `.fx-glow-border*` / `.fx-bloom` / `.fx-shimmer`.
  **No per-card handling needed** — cards consume the same token variables.
- Motion is never the only signal: selected = colour + ring + tint; claimed = label
  text + 30% art dim; countdown urgency = colour, and the time text itself.
- Only `transform`/`opacity` on hot paths. Carousels write `scrollLeft` once per
  rAF frame (no layout thrash) and cache `clientWidth`/`scrollWidth` (re-measured
  only on `ResizeObserver`, never on scroll).
- **Haptics gate themselves** ([`useHaptics.js`](../../../src/composables/useHaptics.js)):
  no-op under reduced-motion, on iOS Safari (no Vibration API), and on desktop. A
  gated/no-op tap stays silent because the card only fires `haptic('select')` when
  `openCheckout`/`openGiftClaim` returned `true`.
- Countdown `setInterval` is cleared in `onBeforeUnmount` — no leaked timers.

---

## 7. Overlay & z-index model

The cards live in the normal page flow; the **sheets** they open mount in the
`#overlay` slot above the device frame. Within a card the internal stack is:

```
card bg (0) < ripple wave (1) < content/info (1–2) < gradient/conic ring ::before (2–3) < SkuTag/badge (2–3)
```

`BundleItem`'s tag pill sits at `z-index:3` (straddles the tile top edge at
`top:-8px`); the bundle breakdown row is `z-index:1` so it overlaps the banner.

---

## 8. Gotchas & known inconsistencies (highest-value section)

1. **Stagger 90 vs token 50.** Lists pass `index * 90` inline; `--motion-sku-stagger`
   is `50ms`. The 90 is shipped. Change both or neither.
2. **Press scale 0.99 vs 0.98.** Small cards use the `--motion-sku-press-scale`
   token (`0.99`); Hero/BestSeller hardcode `scale(0.98)`. Intentional (deeper press
   on big cards) but not tokenised.
3. **`bundle-enter`/`gift-enter` omit `transform` in `to`** to avoid a Chromium
   compositor layer that breaks child `backdrop-filter`. Never add `translateY(0)`.
4. **Conic border must be inline `background`**, not a token — Chrome freezes a
   nested `var(--angle)`.
5. **No `overflow:hidden` on Hero/BestSeller roots** — it clips the bloom + ring.
   Clipping is per-child.
6. **Countdown logic is duplicated** across three cards (Gift/Bundle/BestSeller).
   If you touch the format or urgency thresholds, update all three (or extract a
   `useCountdown` composable — out of scope here).
7. **`requiresAccount` is frozen at open time** in `useGiftClaim` — reactive
   derivation causes a remount/flicker loop (§4).
8. **`itemKey` must stay stable & unique.** Two cards with the same `amount|price`
   would both light up selected. SkuImageCard prefixes with `currencyLabel` for
   exactly this reason.

---

## 9. Quick reference — adding a new card variant

- **A new card** → copy the §2 skeleton: root with `::before` gradient ring,
  `sku-enter` entrance (slow/decelerate/both, inline delay), hover/press/selected
  blocks, and a stable `itemKey`. Wire tap → `openCheckout(item, itemKey)` and fire
  `haptic('select')` only on the `true` return.
- **A premium/hero card** → add `.fx-bloom` + a `.fx-glow-border--*` class, drop
  `overflow:hidden` from the root, set `--fx-bloom-image` to the card's gradient.
- **A timed offer** → add an `endsAt` prop and reuse the §2d countdown block
  verbatim (1s tick, drop-day format, `[data-urgency]` tiers).
- **A free/claimable card** → open `useGiftClaim` instead of `useCheckout`; read
  `isClaimed(id)` for the claimed state; `id` is the selection key.
- **Timing/choreography** → never hardcode a `setTimeout` in a component; the only
  timers cards own are the 1s countdown ticks. Selection/sheet timing lives in the
  singletons.

---

**Related docs (bundled in this folder):**
[`motion-tokens.md`](./motion-tokens.md) ·
[`component-breakdown.md`](./component-breakdown.md) ·
[`haptic-tokens.md`](./haptic-tokens.md) ·
[`typography.md`](./typography.md). · See also the interactive **[Playground](./playground.md)**.
