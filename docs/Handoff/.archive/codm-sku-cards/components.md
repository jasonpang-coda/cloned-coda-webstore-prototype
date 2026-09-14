# COD:M SKU Cards — Component Reference

> The implementation reference for the COD:M SKU-card family: what each card is,
> its props, and the non-obvious behaviours you must not break. Every colour,
> duration, radius and shadow is a design token from `src/tokens/` — if you
> reach for a literal value, chase the token instead. Play with everything live
> in the [Playground](./playground.md).
>
> This is the scoped hand-over. The full deep-dive (end-to-end flow spec, motion
> / haptic / typography catalogues) lives in the sibling site
> `docs/Handoff/sku-cards` (separate VitePress project, not part of this site).

---

## 1. The family at a glance

| Card | File | Role | Container(s) |
|---|---|---|---|
| **SkuCard** | <a href="https://github.com/yiweicoda/coda-webstore-prototype/blob/main/src/components/SkuCard.vue" target="_blank" rel="noopener"><code>SkuCard.vue</code></a> | Currency/coin tile (CP amount + bonus + price). `default` (column) or `row` layout. | `SkuList` |
| **SkuImageCard** | <a href="https://github.com/yiweicoda/coda-webstore-prototype/blob/main/src/components/SkuImageCard.vue" target="_blank" rel="noopener"><code>SkuImageCard.vue</code></a> | Image-led SKU. `panel` (1:1 art on top) or `background` (oversized bottom-anchored art). | `SkuImageList` |
| **HeroSkuCard** | <a href="https://github.com/yiweicoda/coda-webstore-prototype/blob/main/src/components/HeroSkuCard.vue" target="_blank" rel="noopener"><code>HeroSkuCard.vue</code></a> | Full-bleed landscape showcase for a named product (edition/collector pack). Animated ring + bloom. | (page direct) |
| **BestSellerCard** | <a href="https://github.com/yiweicoda/coda-webstore-prototype/blob/main/src/components/BestSellerCard.vue" target="_blank" rel="noopener"><code>BestSellerCard.vue</code></a> | HDR hero coin card. `compact` variant for the carousel. | `BestSellerCarousel` |
| **BundleSkuCard** | <a href="https://github.com/yiweicoda/coda-webstore-prototype/blob/main/src/components/BundleSkuCard.vue" target="_blank" rel="noopener"><code>BundleSkuCard.vue</code></a> | Banner art + child-item breakdown + price. Live countdown, claimed state. | `BundleGrid`, `FeaturedCarousel` |
| **GiftSkuCard** | <a href="https://github.com/yiweicoda/coda-webstore-prototype/blob/main/src/components/GiftSkuCard.vue" target="_blank" rel="noopener"><code>GiftSkuCard.vue</code></a> | Free-gift offer: FREE GIFT tag, CLAIM GIFT CTA, countdown, claimed state. | `GiftGrid` |

Supporting pieces:

| Piece | File | Role |
|---|---|---|
| **SkuTag** | <a href="https://github.com/yiweicoda/coda-webstore-prototype/blob/main/src/components/SkuTag.vue" target="_blank" rel="noopener"><code>SkuTag.vue</code></a> | Shared pill badge (BEST VALUE / BONUS / FREE GIFT). Variants `bonus` \| `value` \| `success`. |
| **BundleItem** | <a href="https://github.com/yiweicoda/coda-webstore-prototype/blob/main/src/components/BundleItem.vue" target="_blank" rel="noopener"><code>BundleItem.vue</code></a> | One child tile in a bundle breakdown (rarity bg, tag pill, qty badge). Emits `select`. |
| **BundleBreakdown** | <a href="https://github.com/yiweicoda/coda-webstore-prototype/blob/main/src/components/BundleBreakdown.vue" target="_blank" rel="noopener"><code>BundleBreakdown.vue</code></a> | The shared "what's inside" row of `BundleItem`s. Used by `BundleSkuCard`, `BestSellerCard` **and** `SkuImageCard` (any card can carry bundled items via an `items` prop). Renders nothing when `items` is empty. |

The cards are **theme-agnostic** — zero `theme === 'codm'` branches. Whitelabel
stores reskin them purely through token overrides and capability flags.

---

## 2. Shared anatomy (implement once, reuse six times)

### 2a. Gradient ring — the `::before` mask-composite idiom

`border-image` can't combine with `border-radius`, so every card paints its 1px
gradient ring as a pseudo-element:

```css
.card::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: inherit;
  padding: var(--border-weight-default);       /* 1px ring thickness */
  background: var(--border-sku-card-default);   /* theme gradient */
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: destination-out;
  pointer-events: none;
}
```

Hover swaps the background to `--border-sku-card-hover`; selected swaps to
`--border-sku-card-selected` and thickens the padding to
`--border-weight-selected` (2px).

### 2b. States

| State | What happens | Tokens |
|---|---|---|
| Entrance | `sku-enter` keyframe (opacity 0→1, `translateY(6px→0)`), fill `both`, inline `animation-delay` | `--motion-sys-duration-slow` (350ms) · `--motion-sys-ease-decelerate` |
| Hover in | `translateY(-2px)` + `--shadow-card-hover` | `--motion-sku-hover-in` (220ms decelerate) |
| Hover out | return to rest | `--motion-sku-hover` (150ms standard) |
| Press | `scale(var(--motion-sku-press-scale))` (0.99) | `--motion-sku-press` (100ms standard) |
| Selected | bg → `--bg-card-selected`, ring → selected gradient + 2px | `--motion-sys-duration-base` (250ms) decelerate |

### 2c. Entrance choreography

Two-axis cascade: a per-section `baseDelay` plus a per-card `index * 90` ms
stagger, summed into `animation-delay`. Each card's **price block** then runs
`fade-in` a further **+350ms** after the card's own delay — one
`--motion-sys-duration-slow`, i.e. the price resolves only after the card has
finished arriving (the deliberate two-beat reveal). If you change the entrance
duration, change the +350 offset to match. Scrub this on the
[Playground timeline](./playground.md#choreography-timeline).

### 2d. Selection contract — `itemKey`

Selection state lives in the `useCheckout.js` singleton, never in parents. Each
card derives a stable key (`SkuCard`: `` `${amount}|${currentPrice}` ``;
`BundleSkuCard`/`HeroSkuCard`: `` `${title}|${currentPrice}` ``; `GiftSkuCard`:
`props.id`) and computes `isSelected = sheetOpen && selectedKey === itemKey`.
Tap → `openCheckout(item, itemKey)`; it returns `false` (silent no-op) unless
signed-in/guest-verified, and the card fires its `select` haptic **only on a
`true` return**. Gifts use `useGiftClaim.openGiftClaim(gift)` instead, which
**always** opens (guests identify inside the sheet).

### 2e. Countdown pattern (Gift / Bundle / BestSeller)

From an `endsAt` (ms epoch) prop: 1s `setInterval` started in `onMounted`,
cleared in `onBeforeUnmount`. Format drops the day segment at `0d` (`14h 48m`).
Urgency drives colour via `[data-urgency]`: **≥72h** default · **24–72h**
warning · **<24h** error. The logic is currently duplicated in all three cards —
touch one, update all three.

---

## 3. Per-card reference

### 3.1 SkuCard — currency tile

Vertical column by default (badge → info → price pinned to bottom);
`layout="row"` flips to horizontal (info left, price right) — `SkuList` sets
this for its `columns`/`stack` layouts.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `amount` | Number | **required** | large currency figure |
| `baseAmount` / `bonusAmount` | Number | `null` | renders the `400 + 60 BONUS` line when both set |
| `bonusType` | String | `'codashop'` | `'codashop'` purple · `'cp'` blue |
| `bonusLabel` | String | `''` | from `strings.sku.bonusLabel` |
| `currentPrice` | String | **required** | displayed price |
| `originalPrice` / `discountPercent` | String | `null` | strikethrough price + `-49%` |
| `isBestValue` | Boolean | `false` | BEST VALUE badge |
| `tagLabel` | String | `null` | overrides the badge label |
| `cpIcon` / `skuImage` | String | `null` | currency glyph / checkout thumb |
| `loyaltyPoints` | Number | `null` | feeds checkout loyalty banner |
| `subtitle` | String | `null` | supporting line |
| `animDelay` / `baseDelay` | Number | `0` | stagger + section offset |
| `layout` | String | `'default'` | `'default'` \| `'row'` |

- The **badge slot reserves a constant 16px height even when empty**, so
  amounts align across a mixed row of best-value / plain cards. In `row`
  layout the empty slot is `display:none` instead.
- The title style carries a Hitmarker `scaleX` condense with
  `transform-origin: left`; prices override to `right center` so the right
  edge stays put as text condenses.

### 3.2 SkuImageCard — image-led SKU

- `variant="panel"`: art in a 1:1 frame (capped 160×160) on top, text below.
- `variant="background"`: art becomes an oversized (132%) bottom-anchored
  background cropped by the card (`aspect-ratio: 3/4`) under a
  `--gradient-sku-image-card-fade` legibility overlay.
- The variant is chosen by the **data layer, never by store identity**.

Beyond the shared prop set: `currencyLabel` (appended to amount — also
prefixes the `itemKey` so two SKUs with the same amount/price stay unique),
`loyaltyIcon` (CSS-masked, inherits `currentColor`), `backgroundImage`
(full-bleed bg under the L1 scrim), `items` (bundled child SKUs → renders a
`BundleBreakdown`). `amount` is **nullable** for non-numeric SKUs (e.g. Daily
Boosters). Price block is **center-aligned** (vs right-aligned in SkuCard).

### 3.3 HeroSkuCard — named-product showcase

Full-bleed key art + bottom-up `--gradient-hero-scrim`; text left, price right.
Leads with `eyebrow` + `title` + an `includes` chip list. Passes
`amount: title` into checkout so the product **name** shows in the summary.

- Root classes: `.fx-bloom` + a ring effect chosen by the
  **`config.sku.heroRingEffect` capability flag** (default `'dual'` — two
  comets orbiting 180° apart; e.g. MGSSE overrides to `'camo-breathe'`). Never
  branch on store name for this.
- When selected, the spinning ring is replaced by a static thicker
  `--border-sku-card-selected` ring (`animation: none`).

### 3.4 BestSellerCard — HDR hero coin

Hero (full) variant gets `.fx-bloom` + a conic ring from the same
`config.sku.heroRingEffect` flag (default `'hdr'` here). `compact`
(carousel) drops both and runs a metallic shimmer sweep over the image
instead. Also accepts `items` (bundled child SKUs → `BundleBreakdown`).

- The coin art (`skuImage`, 128×128) is **in-flow** (`position: relative`), so
  it drives the image-box height — don't absolutely position it.
- Heavy hero `.webp` shows an `.fx-skeleton` sheen until `@load` fires.
- The hero info bar uses `backdrop-filter: blur(64px)`; the compact variant
  **deliberately omits it** — a separate filter layer creates a visible seam at
  the image/info boundary. Don't re-add it.

### 3.5 BundleSkuCard — banner + breakdown

Banner art (2.6:1, image **or** video via `Media`) masked to fade into the card
surface, with a `--gradient-bundle-banner` scrim. Optional `skuOnBanner`
composites a 1:1 hero (160×160) centred on the banner. The child-item row is a
`BundleBreakdown` overlapping the banner bottom by −20px; it renders nothing
when `items` is empty (editions/digital keys) so there's no gap.
`breakdownScrollable` makes the row a horizontal drag-scroller.

- Child-tile tap → Item Summary sheet (config opt-in `bundle.itemSummary`,
  COD:M has it); `stopPropagation` keeps the card-level checkout from also
  firing. Stores without the opt-in let the click bubble to checkout.
- Entrance uses `bundle-enter` (12px rise) — see gotcha §5.2 about its `to`
  frame.

### 3.6 GiftSkuCard — free-gift claim

`FREE GIFT` SkuTag overlaid top-left on the art; centred `CLAIM GIFT` CTA that
flips to `CLAIMED` (art dims to 30% opacity) once `useGiftClaim.isClaimed(id)`
is true. Countdown prefix flips `Ends:` → `Refreshes:` when `refreshesOnClaim`.
`id` is **required** — it is both the claim identity and the selection key.
Localised prefixes via `endsLabel` / `refreshesLabel`.

---

## 4. Containers

| Container | Grid behaviour |
|---|---|
| <a href="https://github.com/yiweicoda/coda-webstore-prototype/blob/main/src/components/SkuList.vue" target="_blank" rel="noopener"><code>SkuList</code></a> | `wrap` (default): 2-col → 4-col @641px. `columns`: 1-col → 2-col @801px (row cards). `stack`: always 1-col row cards. |
| <a href="https://github.com/yiweicoda/coda-webstore-prototype/blob/main/src/components/SkuImageList.vue" target="_blank" rel="noopener"><code>SkuImageList</code></a> | 2-col → 4-col @641px. |
| <a href="https://github.com/yiweicoda/coda-webstore-prototype/blob/main/src/components/GiftGrid.vue" target="_blank" rel="noopener"><code>GiftGrid</code></a> | 2-up at every width; `count < 4` collapses to a single row @641px. |
| <a href="https://github.com/yiweicoda/coda-webstore-prototype/blob/main/src/components/BundleGrid.vue" target="_blank" rel="noopener"><code>BundleGrid</code></a> | 1-col → 2-col @801px. |
| <a href="https://github.com/yiweicoda/coda-webstore-prototype/blob/main/src/components/BestSellerCarousel.vue" target="_blank" rel="noopener"><code>BestSellerCarousel</code></a> | Drag-scroll row of `compact` BestSellerCards. XS/S ~62.5% card width; M/L 3-up, 207px floor. Chevrons only on overflow. |
| <a href="https://github.com/yiweicoda/coda-webstore-prototype/blob/main/src/components/FeaturedCarousel.vue" target="_blank" rel="noopener"><code>FeaturedCarousel</code></a> | Same mechanics, items are `BundleSkuCard`. |

> All breakpoints are **container queries** (`@container`), not media queries —
> they resolve against `.device__screen` (`container-type: inline-size`), so
> "641px" is the device-frame width, not the viewport.

---

## 5. Gotchas — do not break these

1. **No `overflow:hidden` on Hero/BestSeller roots.** The bloom halo and
   selected ring bleed past the card edge; corner clipping is delegated to
   child elements. Adding it to the root silently kills the bloom.
2. **`bundle-enter`/`gift-enter` omit `transform` in their `to` frame on
   purpose.** With `fill-mode: both`, a retained `translateY(0)` creates a
   Chromium compositor layer that stops child `backdrop-filter` (on
   `BundleItem`) from sampling the banner. Never add `transform: translateY(0)`
   to these `to` frames.
3. **The conic-gradient ring must be written inline in `background`, never
   wrapped in a token.** Chrome doesn't re-evaluate a `var(--angle)` nested
   inside another custom property per frame — the spin freezes.
4. **Stagger is `index * 90` inline, but `--motion-sku-stagger` is `50ms`.**
   The 90 is what ships; the token is the system default the lists override.
   Change both or neither.
5. **`itemKey` must stay stable and unique.** Two cards with the same
   `amount|price` would both light up selected — `SkuImageCard` prefixes with
   `currencyLabel` for exactly this reason.
6. **Countdown logic is triplicated** (Gift/Bundle/BestSeller). A format or
   threshold change must land in all three.
7. **Animate only `transform` and `opacity`.** And when an easing token
   contains a comma (any cubic-bezier), the `animation`/`transition`
   **shorthand is banned** — use longhands.
8. **Reduced motion is global** (`reduced-motion.css` collapses all durations;
   `effects.css` kills the `.fx-*` loops). No per-card handling — and motion is
   never the only signal (selected = colour + ring; claimed = label + dim).

---

## 6. Adding a new card variant

- **A new card** → copy the §2 skeleton: `::before` gradient ring, `sku-enter`
  entrance (slow/decelerate/both, inline delay), hover/press/selected blocks,
  stable `itemKey`. Wire tap → `openCheckout(item, itemKey)`; fire
  `haptic('select')` only on the `true` return.
- **A premium/hero card** → add `.fx-bloom` + a ring class driven by
  `config.sku.heroRingEffect`; keep `overflow:hidden` off the root.
- **A timed offer** → `endsAt` prop + the §2e countdown block verbatim.
- **A free/claimable card** → `useGiftClaim` instead of `useCheckout`;
  `isClaimed(id)` drives the claimed state; `id` is the selection key.
- **Timing** → never hardcode a `setTimeout` in a component; the only timers
  cards own are the 1s countdown ticks.
