---
handoff: bestseller-card-effects
title: Best Seller Card — Running Border, Shimmer & Entrance Effects Handoff
status: ready
prototype_version: v0.53.3
last_updated: 2026-08-06
stores: [codm]
reference_impl:                    # READ-ONLY reference. Never a patch target.
  orchestrator: src/composables/useCheckout.js
  surfaces:
    - src/components/BestSellerCard.vue
    - src/components/BestSellerCarousel.vue
    - src/tokens/effects.css
    - src/tokens/keyframes.css
components: [BestSellerCard]
states: 7                          # total rows across every §2.x.a table
token_contract:
  colour:     [--hdr-glow, --hdr-hot, --hdr-bloom, --border-warm, --bg-card-selected, --border-sku-card-selected, --gradient-bestseller-metallic-shine, --fx-bestseller-shimmer-opacity]
  typography: []                   # out of scope — see docs/Handoff/sku-cards for the full card's type contract
  spacing:    []                   # out of scope — ring/bloom geometry is covered under Size in §3.5
  radius:     [--radius-container-s]
  size:       [--border-weight-default, --border-weight-selected]
  effects:    [--shadow-bestseller]
  motion:     [--motion-border-spin, --motion-sku-bloom, --motion-sys-ease-linear, --motion-sys-ease-standard, --motion-sys-duration-slow, --motion-sys-ease-decelerate, --motion-sku-enter, --motion-sku-shimmer]
demo_url:
blocking_questions: 0
---

# Best Seller Card — Running Border, Shimmer & Entrance Effects Handoff

> This specs three motion treatments on COD:M's `BestSellerCard`: the **running
> border** (an animated OKLCH conic-gradient ring, hero variant only), the
> **shimmer** (a metallic gloss sweep across the coin photo, compact/carousel
> variant only), and the **mount entrance** (the one-shot staggered fade+rise
> every instance plays on load). It also covers the companion **bloom halo**,
> since it shares the ring's lifecycle and the same colour tokens.
>
> **Scope:** the motion/effects layer of `BestSellerCard` only — which
> pseudo-element or keyframe plays, on which variant, with which tokens. It does
> **not** cover the card's content model (title, price, bundle breakdown,
> countdown) or its hover/press transform feedback; those are documented in
> [`docs/Handoff/sku-cards/README.md`](../sku-cards/README.md), which this doc is a
> focused excerpt of. The sibling `HeroSkuCard` uses the same ring-effect
> mechanism with a different default (`'dual'`) — noted where relevant, not
> respecified here. The mount entrance here is scoped to `BestSellerCard`
> specifically — the *same* stagger mechanism also drives five other SKU-family
> card types (`SkuCard`, `SkuImageCard`, `BundleSkuCard`, `GiftSkuCard`,
> `HeroSkuCard`); that broader, cross-family model lives in
> [`docs/Handoff/sku-card-entrance-stagger/README.md`](../sku-card-entrance-stagger/README.md),
> which §2.2 below cross-references rather than duplicates.
>
> **Last updated:** 2026-08-06 · tracks prototype v0.53.3.

---

## 0. Agent brief — read this first

**The prototype is a reference implementation, not a patch target.** The production
codebase is not 1:1 with it: different repo, different component names, different
design-system plumbing. Do not copy `.vue` files or assume the prototype's
architecture.

What you must reproduce, in your own stack:

1. **The state machine** — §2. Every state, every transition, every edge case.
2. **The token contract** — §3. Every value by *semantic role*, mapped to your
   system's equivalent token. Never a hardcoded literal.

**Read order:** load the relevant authoring skill (`codm-web-store-fe` in this
repo) → §2 (states) → §3 (tokens) → your assigned task in §8 → verify with §10.

**Normative vs illustrative.** Tables in §2 and §3 are normative — build to them.
Quoted CSS and ASCII diagrams show *how the prototype did it* and are illustrative
only; an equivalent technique in your stack is correct.

**Stop conditions.** If a value is not in §2/§3, grep the cited reference file. If
it is still absent, it is an open question in §11 — **stop and ask a human.** Do not
infer a colour, duration, or behaviour that isn't specified.

**Corrected assumption, worth reading before anything else:** an earlier pass at
this research assumed COD:M's theme file was missing `--hdr-glow`/`--hdr-hot` and
that the running border therefore didn't render on COD:M. That was wrong — see
§3.1. Values are always chased to source in this doc; nothing here should be
re-guessed from that earlier assumption.

---

## 1. The flow at a glance *(orientation — illustrative)*

`BestSellerCard` renders in one of two structural modes, chosen by the `compact`
prop (parent-controlled — the hero section passes `compact={false}`, the carousel
passes `compact={true}`). Each mode wires a **different, mutually exclusive**
decorative effect:

```
compact = false (hero)                    compact = true (carousel)
┌─────────────────────────────┐           ┌─────────────────────────────┐
│ ::before  running conic ring │           │ (no ring, no bloom)         │
│ ::after   breathing bloom    │           │ .bestseller__image::after   │
│ card      static warm hairline│          │   metallic shimmer sweep   │
│           border (top+left)  │           │   (image layer only)        │
└─────────────────────────────┘           └─────────────────────────────┘
        ↑ isSelected=true swaps the ring to a
          static, non-spinning selection colour
          (bloom keeps breathing; shimmer, if
          present, keeps sweeping — see §2.1.d)
```

Selection state (`isSelected`, from `useCheckout()`'s `sheetOpen` + `selectedKey`)
is orthogonal to the `compact` mode and can apply to either.

### 1.1 Choreography timeline (normative for timing)

The running border, bloom, and shimmer are **perpetual infinite loops**, with no
mount sequencing of their own. The mount entrance (§2.2) is the one exception —
a one-shot cascade that plays once, then holds. Both timelines, independently:

**Perpetual loops (start once mounted, never stop, no delay of their own):**

| t (ms) | Event | Token | Reference |
|---|---|---|---|
| 0 → 3200 → loop | Running border ring sweeps 360° (`--angle: 0deg → 360deg`) | `--motion-border-spin` | `fx-glow-border--hdr::before` (`effects.css`) |
| 0 → 3500 → loop | Bloom halo breathes opacity 0.12 → 0.22 → 0.12, scale 1 → 1.015 → 1 | `--motion-sku-bloom` | `.bestseller__card::after` / `bloom-pulse` keyframe |
| 0 → 3000 → loop | Shimmer sweeps left-to-right across the coin photo, holds, restarts | `--motion-sku-shimmer` | `.bestseller__card--compact .bestseller__image::after` |

> ✅ **Fixed — the shimmer now consumes the shimmer token.** Previously hardcoded
> `2954ms linear` directly on the component instead of reading
> `--motion-sku-shimmer` (aliases `--motion-shimmer-sweep`, `3000ms`) — the
> semantic token that already existed for exactly this role, also used by the
> generic `.fx-shimmer` button utility. Switched to `animation-duration:
> var(--motion-sku-shimmer)` and `animation-timing-function:
> var(--motion-sys-ease-linear)`; the sweep is now **1.5% longer** (3000ms vs.
> the old 2954ms) — a deliberate, accepted change, not a silent side effect.
> The shimmer's `opacity: 0.25` was also a bare literal; it's now
> `--fx-bestseller-shimmer-opacity` (`src/tokens/ds/extensions.css`, still
> `0.25` — no visual change there). See §11 for the retired Q1.

**Mount entrance (one-shot, then holds — see §2.2 for the full state model):**

| t (ms) | Event | Token | Reference |
|---|---|---|---|
| `baseDelay` | Card plays `sku-enter`: `opacity 0→1`, `transform: translateY(6px)→0` | `--motion-sys-duration-slow` · `--motion-sys-ease-decelerate` | `BestSellerCard.vue:78, 295-298` |

`baseDelay` itself is a section/index offset owned by the calling parent
(`App.vue`'s `DELAY_BESTSELLER`/`DELAY_BS_CAROUSEL` constants, or
`BestSellerCarousel.vue`'s `baseDelay + i * 90` per-item stagger) — the full
cross-family delay-composition model, including why it's `90ms` here specifically
and how five other card types compose the same formula differently, is specced in
[`sku-card-entrance-stagger`](../sku-card-entrance-stagger/README.md) rather than
repeated here.

---

## 2. State & behaviour matrix *(normative)*

### 2.1 BestSellerCard (effects layer)

#### 2.1.a State inventory

| State | Entered when | Exits when | Observable change | Tokens (→ §3) |
|---|---|---|---|---|
| `hero-default` | `compact === false` and not selected | `compact` becomes `true`, or card becomes selected | Running conic ring spins on the card edge; bloom halo breathes behind it; a static 1px warm hairline sits on the top+left edges under the ring | `--hdr-glow`, `--hdr-hot`, `--border-warm`, `--border-weight-default`, `--radius-container-s`, `--motion-border-spin`, `--motion-sku-bloom` |
| `hero-selected` | `compact === false` and `isSelected` (checkout sheet open with this item's key selected) | selection clears (sheet closes, or another item is opened) | Ring **stops spinning** and switches instantly to a static, non-animated single-colour ring; card background swaps; bloom keeps breathing uninterrupted | `--border-sku-card-selected`, `--border-weight-selected`, `--bg-card-selected`, `--motion-sku-bloom` |
| `compact-default` | `compact === true` and not selected | `compact` becomes `false`, or card becomes selected (no visible change — see `compact-selected`) | Metallic shimmer sweeps once across the coin photo, holds at the right edge, restarts from the left; no ring, no bloom | `--gradient-bestseller-metallic-shine` |
| `compact-selected` | `compact === true` and `isSelected` | selection clears | **No visible ring change** — the selection-ring CSS rule targets a `::before` pseudo-element that is never generated in compact mode (see §2.1.d). Shimmer keeps sweeping uninterrupted. Card background still swaps (`--bg-card-selected`) | `--bg-card-selected` |

- **Mutually exclusive:** `hero-*` and `compact-*` never co-occur on one card instance — the `compact` prop is fixed per mounted instance (hero section vs. carousel each mount their own `BestSellerCard`). Running border + bloom vs. shimmer are therefore also structurally mutually exclusive, never layered.
- **Combinable:** `hero-selected` = selection ring **+** bloom still breathing (bloom is not gated by selection). `compact-selected` = background swap only, no ring artifact.
- **Default on mount:** `hero-default` or `compact-default` depending on the `compact` prop, which has no reactive default of its own here — it's always explicitly passed by the parent section.
- **Reduced motion** is not a separate state row — it is a global modifier that applies to whichever of the four states above is active. See §2.1.d and §6.

#### 2.1.b Transitions

| From → To | Trigger | Guard / gate | Animates | Duration · Easing |
|---|---|---|---|---|
| `hero-default → hero-selected` | Card tap → `onSelect()` → `openCheckout()` sets `selectedKey`/`sheetOpen` | `isSelected = sheetOpen && selectedKey === itemKey` | Ring background + `animation` property both change in one style recalc — **not animated**, an instant CSS-rule swap (higher-specificity `.bestseller__card--selected::before` rule wins) | — (instant) |
| `hero-selected → hero-default` | Selection clears (sheet closes / different item selected) | inverse of the guard above | Ring resumes; `--angle` restarts from its `@property` initial value (`0deg`), **not** from wherever it was paused | `--motion-border-spin` · `--motion-sys-ease-linear` |
| `compact-default → compact-selected` | Same `onSelect()` mechanism | same guard | Background colour transitions; shimmer unaffected (its `::after` is on `.bestseller__image`, a different element than the one gaining `--selected`) | `--motion-sku-select` *(background only — not part of this handoff's scope, see sibling doc)* |
| any state → itself, reduced motion | `prefers-reduced-motion: reduce` media query | — | All three effect animations set to `animation: none` | — (instant; see §2.1.d for the resulting frozen appearance) |

#### 2.1.c Props / variants contract

| Prop / config | Type | Default | Allowed values | Unlocks state |
|---|---|---|---|---|
| `compact` | `Boolean` (component prop) | `false` | — | `hero-*` (false) vs `compact-*` (true) |
| `config.sku.heroRingEffect` | `String` (store config, read via `useStoreConfig()`, **not** a component prop) | `'hdr'` | `'hdr' \| 'dual' \| 'rotate' \| 'pulse' \| 'camo-breathe' \| 'hud' \| 'trace'` (any `fx-glow-border--*` family member in `effects.css`) | Which ring variant renders in `hero-*` states. Only applies when `!compact`. COD:M does not set this in `src/stores/codm/store.js`, so it resolves to the default `'hdr'`. |

Graceful-absent behaviour: `config.sku.heroRingEffect` absent → falls back to `'hdr'` via `?? 'hdr'` in the computed class — every store that predates this flag renders identically to before it existed. There is no nullable prop specific to the shimmer effect; it activates purely off `compact`.

> **Worked example — the `--dual` (two-comet) variant, fully resolved: Warhammer
> 40,000: Rogue Trader.** No store currently sets `heroRingEffect` to `'dual'` for
> `BestSellerCard` (`ygomd`'s override, and Rogue Trader's own trail-colour tokens
> below, are both consumed by `HeroSkuCard` instead — see the gotcha after this
> box) — but Rogue Trader's theme file already defines a complete, live set of
> resolved colours for it, making it the clearest concrete reference for anyone
> wiring `'dual'` onto a card:
>
> | Token | Resolved (SDR) | Resolved (HDR, `@media (dynamic-range: high)`) |
> |---|---|---|
> | `--fx-border-glow` (comet 1) | `var(--palette-secondary-500)` → `var(--ref-secondary)` → `oklch(0.759 0.084 73.8)` — "imperial gold" | *(no boost — secondary isn't in the theme's HDR block)* |
> | `--fx-border-hot` (comet 1 core) | `var(--palette-secondary-200)` → `oklch(0.903 0.05 73.8)` | *(no boost)* |
> | `--fx-border-trail-glow` (comet 2) | `var(--palette-tertiary-500)` → `var(--ref-tertiary)` → `oklch(0.859 0.178 133.1)` — "warp-green VFX" | `oklch(0.9 0.21 133.1)` — pushed past the sRGB ceiling |
> | `--fx-border-trail-hot` (comet 2 core) | `var(--palette-tertiary-200)` → `oklch(0.936 0.107 133.1)` | *(no boost)* |
>
> Source: [`src/tokens/ds/themes/roguetrader.css:224-227,44-45,304`](../../../src/tokens/ds/themes/roguetrader.css).
> Rogue Trader is the only theme in the repo that overrides `--fx-border-*` **directly**
> rather than through the `--hdr-glow`/`--hdr-hot` alias every other theme uses (see
> the `extensions.css:137-140` comment: "roguetrader overrides directly") — a
> deliberate choice, since `--dual`/`--rotate` are the only family members that read
> the `-trail-*` pair at all, and the plain `--hdr-glow`/`--hdr-hot` alias has no
> trail equivalent to override.
>
> ⚠️ **Gotcha — this is not evidence that `BestSellerCard` uses `--dual` anywhere,
> Rogue Trader included.** Rogue Trader's `store.js` does not set
> `sku.heroRingEffect` at all, so its `BestSellerCard` resolves to the same default
> as every other store: `'hdr'` (single comet), consuming `--hdr-glow`/`--hdr-hot`
> (which Rogue Trader does *not* override — it only overrides the `--fx-border-*`
> tier). The two-comet gold/warp-green treatment above is real and live in this
> store today, but on **`HeroSkuCard`** (Rogue Trader's flagship "Voidfarer
> Edition" card, `cardType: 'hero'` — confirmed via `src/stores/roguetrader/store.js`'s
> own comment), whose *default* is `'dual'` (unlike `BestSellerCard`'s `'hdr'`
> default — see the intro's scope note). If a rebuild wants Rogue Trader's
> `BestSellerCard` to *also* show the two-comet ring, that's a one-line
> `sku: { heroRingEffect: 'dual' }` addition to its store config — nothing in the
> ring implementation itself needs to change, since it already reads the same
> `--fx-border-*` tokens documented above.

#### 2.1.d Edge cases & invariants

- **`compact-selected` produces no ring artifact.** `.bestseller__card--selected::before` sets `inset`, `padding`, `background`, `animation: none` — but declares no `content` property. A `::before` pseudo-element that has never had `content` set by any other matching rule (only `fx-glow-border--hdr::before` sets `content: ""`, and that class is never applied when `compact`) is not generated at all. **Assertion:** selecting a compact/carousel Best Seller card must show a background swap only — never a border flash or ring artifact.
- **Selection is an instant swap, not a cross-fade.** The two `::before` rules (`fx-glow-border--hdr::before` and `.bestseller__card--selected::before`) differ only in CSS specificity (the selected rule wins via the scoped `--selected` class), so the browser recomputes the pseudo-element's style in one paint — there is no transition token to preserve because none exists today. **Assertion:** do not add a cross-fade between the running ring and the selected ring unless design asks for one; the reference behaves as an instant cut.
- **Ring restarts from `0deg`, never resumes.** `border-spin` drives a registered `@property --angle` (`initial-value: 0deg`); toggling the animation off and back on (e.g. leaving and re-entering `hero-default`) always restarts the sweep at `0deg`, not from the angle it was at when it stopped. **Assertion:** do not add JS to preserve rotation continuity — the reference doesn't.
- **Reduced motion freezes, doesn't hide, the ring** — but **parks, effectively hiding, the shimmer.** `fx-glow-border--hdr::before` keeps its conic-gradient `background` (which reads `--angle`, frozen at its initial `0deg`) when `animation: none` applies — so the ring still renders as a static partial arc, just not spinning. The compact shimmer's `::after`, however, has its `transform: translateX(-150%) skewX(-20deg)` declared as a **static property**, independent of the animation shorthand — with the animation off, that static transform still applies, parking the gloss sweep fully off the left edge of the image, i.e. invisible. **Assertion:** under `prefers-reduced-motion: reduce`, the hero ring is visible-but-static; the compact shimmer is fully hidden. Do not "fix" the shimmer to show a centered static sheen — that is not what the reference does.
- **Reduced motion may show the bloom halo brighter than intended.** `.fx-bloom::after` has no static `opacity` declaration outside its `bloom-pulse` animation (whose range is `0.12`–`0.22`). With `animation: none`, `opacity` falls back to its CSS initial value, `1` — i.e. the halo renders at full opacity (still heavily blurred at `46px`/`blur(44px)`, so not a hard-edged shape, but visually more prominent than the intended "barely-there" breathing halo). This is a directly observable consequence of the current CSS, not a guess — flagged as A1 in §11 rather than silently "corrected," since it's unconfirmed whether this is a known/accepted tradeoff or an oversight.
- **Ring geometry ≠ card's declared radius token, but resolves to it.** `fx-glow-border--hdr` declares its own `border-radius: var(--radius-xs, 4px)` fallback, but the scoped `.bestseller__card { border-radius: var(--radius-container-s); }` (8px) wins on specificity (both are single-class selectors, but Vue's scoped-CSS data-attribute makes the card's own rule more specific). The ring's `::before` uses `border-radius: inherit`, which resolves against the *computed* radius of `.bestseller__card` — i.e. **8px**, not the utility class's own 4px fallback. **Assertion:** the ring's corner radius must visually match the card's actual corner radius (8px), not the bare utility default.
- **Only one ring variant can render at a time.** `bestSellerEffectClass` computes a single `fx-glow-border--<name>` string; because a given element can only match one such class, switching `heroRingEffect` is a full replacement, never additive — confirmed from the template's single computed class binding (`BestSellerCard.vue:73-75, 152`).

### 2.2 BestSellerCard mount entrance (loading stagger)

Orthogonal to §2.1 — this is what plays *before* a card settles into any of the
four §2.1 states, and it plays exactly once per mount, not per state change. It is
the same mechanism documented in full, across six card families, in
[`sku-card-entrance-stagger`](../sku-card-entrance-stagger/README.md) §2.1; this
section states only what applies to `BestSellerCard`/`BestSellerCarousel`
specifically, without re-deriving the general model.

#### 2.2.a State inventory

| State | Entered when | Exits when | Observable change | Tokens (→ §3) |
|---|---|---|---|---|
| `mount-pending` | Component mounts | `animation-delay` (`baseDelay`) elapses | Card fully transparent, offset `translateY(6px)` — held by `animation-fill-mode: both` reading `sku-enter`'s `from` step | — |
| `entering` | Delay elapses | `--motion-sys-duration-slow` (350ms) completes | Card fades in and rises to rest | `--motion-sys-duration-slow`, `--motion-sys-ease-decelerate` |
| `settled` | Entrance completes | Component unmounts/remounts | Fully opaque, at rest; holds indefinitely via `fill-mode: both`. This is the state every §2.1 row implicitly assumes as its starting point. | — |

- **Mutually exclusive:** `mount-pending`/`entering`/`settled` are sequential, exclusive, and orthogonal to every §2.1 state — a card can be `mount-pending` *and* would-be `hero-default` simultaneously (invisible, but already carrying the ring/bloom animations underneath, since those start on mount too — see the gotcha below).
- **Combinable:** once `settled`, a card is free to move through any §2.1 transition normally.
- **Default on mount:** `mount-pending`, always, regardless of `compact`/`hero` mode.

#### 2.2.b Transitions

| From → To | Trigger | Guard / gate | Animates | Duration · Easing |
|---|---|---|---|---|
| `mount-pending → entering` | `animation-delay` elapses (browser-timed) | none | `opacity`, `transform` | `--motion-sys-duration-slow` · `--motion-sys-ease-decelerate` |
| `entering → settled` | animation duration completes | none | — (rest state, held by `fill-mode: both`) | — |

#### 2.2.c Props / variants contract

| Prop | Type | Default | Allowed values | Unlocks state |
|---|---|---|---|---|
| `baseDelay` | `Number` | `0` | any non-negative ms | Offset before `mount-pending` exits. `BestSellerCard` has **no** `animDelay` prop of its own — `BestSellerCarousel.vue:132` pre-sums the per-item stagger directly into the `baseDelay` it passes (`baseDelay + i * 90`), the same pattern `BundleSkuCard`/`GiftSkuCard`/`HeroSkuCard` use (see the sibling doc §4.2-4.3). |

#### 2.2.d Edge cases & invariants

- **The running border, bloom, and shimmer do not wait for the entrance to settle.** `fx-glow-border--hdr`, `fx-bloom`, and the shimmer's `::after` all start their own `infinite` loops immediately on mount — there is no gating on the card root's `sku-enter` finishing. During `mount-pending`, these are technically already animating underneath the `opacity: 0` card; the moment `entering` begins fading the card in, the ring/bloom/shimmer are already mid-cycle, not starting fresh in sync with the fade. **Assertion:** do not add logic to delay the perpetual effects until the entrance settles — the reference never synchronizes them.
- **No secondary price-reveal delay.** Unlike `SkuCard`/`SkuImageCard` (which fade their price block in on its own `+350ms` clock — see the sibling doc §2.1.a `price-reveal`), `BestSellerCard`'s price is part of the single `sku-enter` animation on the card root; there is no separate price element with its own delay. **Assertion:** do not add one when rebuilding.
- **Scrolling the carousel does not replay the entrance.** `BestSellerCarousel.vue:124` keys each item by its static array index (`:key="i"`), and scrolling/dragging the carousel doesn't mutate the `items` array or its order — so Vue never unmounts/remounts a card as the user scrolls, and every card's `sku-enter` plays exactly once, on the section's initial mount. This differs from `HeroSkuCard`/`BundleSkuCard` inside `CategoryCatalog`, whose entire subtree *does* remount (and replay) on a category switch (sibling doc `category-replay` state) — there is no equivalent replay trigger for the Best Seller carousel.

---

## 3. Token contract *(normative)*

### 3.0 The mapping rule

1. Map each row to the token in *your* system that carries the **same semantic
   role** (`--bg-*` → your background role, `--text-*` → your text role, and so on).
2. If your system has no token for that role, **add one**. Do not substitute a
   visually-close existing token — that is how design fidelity is lost.
3. Never hardcode the resolved literal in a component.
4. Never cross tiers.
5. Typography is out of scope for this handoff (see the Scope note above).

### 3.1 Colour

| Token | Resolved | Applies to (element · state) |
|---|---|---|
| `--hdr-glow` | `var(--palette-primary-500)` = `oklch(0.919 0.192 101.8)` SDR; boosted ≈ `oklch(0.947 0.230 101.8)` under `@media (dynamic-range: high)` (relative-colour derivation, see callout below) | Running border ring, two of its three lit conic stops (`24deg`/`52deg`) · `hero-default` |
| `--hdr-hot` | `var(--palette-primary-200)` = `oklch(0.962 0.089 101.0)` SDR; boosted ≈ `oklch(0.972 0.116 101.0)` under HDR | Running border ring, hottest conic stop (`38deg`, the comet core) · `hero-default` |
| `--hdr-bloom` | `var(--palette-primary-600)` = `oklch(0.763 0.156 101.5)` SDR; boosted ≈ `oklch(0.801 0.187 101.5)` under HDR | Fallback for `--fx-bloom-image` on any `.fx-bloom` element that doesn't set its own — **not actually used here**, since `BestSellerCard` overrides `--fx-bloom-image` directly with a radial built from `--hdr-hot`/`--hdr-glow` instead (see gotcha below) |
| `--border-warm` | `oklch(0.93 0.03 80 / 0.16)` | Static under-border hairline, top + left edges only · `hero-default` and `hero-selected` (unaffected by selection) |
| `--bg-card-selected` | `var(--sys-colour-primary-subtle)` | Card background · `hero-selected` and `compact-selected` |
| `--border-sku-card-selected` | `var(--sys-colour-primary-main)` | Static replacement ring colour · `hero-selected` only (never generated in `compact-selected`, see §2.1.d) |
| `--gradient-bestseller-metallic-shine` | `linear-gradient(100deg, oklch(1 0 0 / 0) 15%, oklch(1 0 0 / 0.61) 50%, oklch(1 0 0 / 0) 85%)` | Shimmer sweep gradient, rendered at `opacity: var(--fx-bestseller-shimmer-opacity)` (`0.25`) on the pseudo-element — a separate property, not baked into the gradient stops, both compound · `compact-default` and `compact-selected` |
| `--fx-bestseller-shimmer-opacity` | `0.25` | Shimmer opacity multiplier — see the row above · `compact-default` and `compact-selected` |

> ✅ **Fixed — COD:M now explicitly aliases `--hdr-glow`/`--hdr-hot`/`--hdr-bloom`
> to its own brand ramp, closing a real scalability gap.** Previously COD:M had
> no override at all and fell through to an arbitrary unscoped global default in
> [`src/tokens/motion-sku.css`](../../../src/tokens/motion-sku.css) (warm gold,
> unrelated to COD:M's own yellow seed) — and even the four stores that *did*
> override (`efootball`, `fcm`, `tdr`, `ygodl`) mixed real aliases with hardcoded
> `oklch()` literals that merely *happened* to match `--ref-primary`/
> `--ref-secondary`, a duplicated source of truth that would silently drift if a
> brand colour were ever retuned. `src/tokens/ds/themes/codm.css` now defines:
> ```css
> --hdr-glow:  var(--palette-primary-500);  /* = --ref-primary, #FFE700 */
> --hdr-hot:   var(--palette-primary-200);  /* lighter core */
> --hdr-bloom: var(--palette-primary-600);  /* deeper glow behind the card */
> ```
> The HDR-boosted variant can't just be another alias — HDR is specifically about
> pushing *past* the SDR value — so it's derived via **CSS relative colour
> syntax** from the same source token, inside COD:M's existing
> `@media (dynamic-range: high) { html[data-theme="codm"] { … } }` block:
> ```css
> --hdr-glow: oklch(from var(--palette-primary-500) calc(l * 1.03) calc(c * 1.2) h);
> ```
> Critically, this derives `from` the **palette token**, never `from var(--hdr-glow)`
> itself — self-referencing the same custom property being defined is an invalid
> cycle in CSS and resolves to nothing. COD:M's multipliers (`l×1.03`, `c×1.2`,
> etc.) are a first-pass default, not a measured design target — there was no
> prior boosted value to preserve, since COD:M never had an `--hdr-*` override
> before this fix. Flag for a design pass if the punch needs tuning. See §11 for
> the corresponding open question, and the token-chain table just below for how
> this compares across stores.

> ⚠️ **`--fx-bloom-image` is overridden per-component here, bypassing `--hdr-bloom`.**
> `BestSellerCard.vue` sets its own `--fx-bloom-image` (a radial gradient built
> directly from `--hdr-hot`/`--hdr-glow`, not `--hdr-bloom`) on `.bestseller__card`,
> which `.fx-bloom::after`'s `background: var(--fx-bloom-image, …)` then picks up.
> `--hdr-bloom` exists as the *generic* `.fx-bloom` fallback for elements that don't
> set `--fx-bloom-image` themselves — it is not consumed by this component.

#### Token chain: seed → palette → effect

The same alias-plus-relative-colour pattern applies across every store that
overrides these tokens — but which step needs the relative-colour derivation
differs, and it's worth knowing why before touching any of them. **When an
effect token aliases a *seed* (`--ref-*`) that a theme already re-boosts inside
its own `@media (dynamic-range: high)` block, the boost cascades through for
free** — no derivation needed, since `var()` references re-resolve live against
whatever wins the cascade at compute time. **Only effect tokens aliasing a
mid-ramp palette step (not a boosted seed) need the relative-colour
derivation**, because nothing else is already boosting that intermediate token
for them to inherit from.

| Store | Effect token | SDR source (alias) | SDR resolved | HDR-boosted | Boosted resolved |
|---|---|---|---|---|---|
| `codm` | `--hdr-glow` | `--palette-primary-500` (= `--ref-primary`) | `oklch(0.919 0.192 101.8)` | derived: `oklch(from var(--palette-primary-500) calc(l*1.03) calc(c*1.2) h)` | ≈ `oklch(0.947 0.230 101.8)` |
| `codm` | `--hdr-hot` | `--palette-primary-200` | `oklch(0.962 0.089 101.0)` | derived: `oklch(from var(--palette-primary-200) calc(l*1.01) calc(c*1.3) h)` | ≈ `oklch(0.972 0.116 101.0)` |
| `codm` | `--hdr-bloom` | `--palette-primary-600` | `oklch(0.763 0.156 101.5)` | derived: `oklch(from var(--palette-primary-600) calc(l*1.05) calc(c*1.2) h)` | ≈ `oklch(0.801 0.187 101.5)` |
| `fcm` | `--hdr-glow` | `--ref-primary` | `oklch(0.803 0.225 149.2)` | **free** — `--ref-primary` itself is re-boosted in the same `@media` block | `oklch(0.820 0.270 149.2)` |
| `fcm` | `--hdr-hot` | `--ref-secondary` | `oklch(0.948 0.220 117)` | **free**, same mechanism | `oklch(0.960 0.260 117)` |
| `fcm` | `--hdr-bloom` | `--palette-primary-700` | `oklch(0.651 0.178 149.8)` | derived: `oklch(from var(--palette-primary-700) calc(l*1.075) calc(c*1.46) h)` | `oklch(0.700 0.260 149.8)` |
| `efootball` | `--hdr-glow` | `--ref-primary` | `oklch(0.968 0.211 109.8)` | **free**, same mechanism | `oklch(0.970 0.230 109.8)` |
| `efootball` | `--hdr-hot` | `--palette-primary-500` | `oklch(0.865 0.177 90.4)` | derived: `oklch(from var(--palette-primary-500) calc(l*1.04) calc(c*1.24) h)` | ≈ `oklch(0.900 0.220 90.4)` |
| `efootball` | `--hdr-bloom` | `--palette-primary-800` | `oklch(0.620 0.156 53.5)` | derived: `oklch(from var(--palette-primary-800) calc(l*0.935) calc(c*1.28) h)` | ≈ `oklch(0.580 0.200 53.5)` |

For `fcm`/`efootball`, the "derived" multipliers weren't invented — they were
reverse-engineered from each store's *previous* hardcoded boosted literal
against the new SDR alias, specifically so the rendered colour is byte-for-byte
unchanged from before this fix; only *how* it's computed changed (a real alias
instead of a copy-pasted duplicate). Only `codm`'s multipliers are new values
with no prior target to match — see the callout above and §11.

> ⚠️ **Hard CSS constraint, not a style preference:** a custom property can
> never derive its own boosted value `from` itself. `--hdr-glow: oklch(from
> var(--hdr-glow) …)` is a self-reference cycle and resolves to nothing at
> compute time. Every derivation above reads the underlying **source** token
> (`--palette-*`/`--ref-*`), never the effect token being defined.

### 3.2 Typography

Out of scope. See [`docs/Handoff/sku-cards/README.md`](../sku-cards/README.md) §3.2
for the full card's title/price/label type contract.

### 3.3 Spacing

Out of scope for this effects-only handoff — no `--pad-*`/`--gap-*` token governs
either effect. Ring and bloom geometry (inset/padding) are tabled under §3.5 (Size)
since they function as border/halo widths, not layout spacing.

### 3.4 Radius

| Token | Resolved | Applies to (element · state) |
|---|---|---|
| `--radius-container-s` | `var(--sys-radius-s)` = `8px` | `.bestseller__card` corner radius — wins over `fx-glow-border--hdr`'s own `4px` fallback via scoped-CSS specificity; the ring's `::before` inherits this resolved `8px` (see §2.1.d gotcha) · all states |

### 3.5 Size & border/ring weight

| Token / value | Resolved | Applies to |
|---|---|---|
| `--border-weight-default` | `var(--sys-stroke-thin)` = `1px` | Static warm-hairline under-border (top + left) · `hero-default`/`hero-selected` |
| `--border-weight-selected` | `var(--sys-stroke-medium)` = `2px` | Selected-state static ring inset/padding · `hero-selected` |
| `1.5px` *(magic — see §3.8)* | `1.5px` | `fx-glow-border--hdr::before` ring inset/padding (the running border's own width) · `hero-default` |
| `-10%` *(magic — see §3.8)* | `-10%` | Bloom halo `::after` inset override on `.bestseller__card` (overrides `.fx-bloom`'s own `-2%` default) · `hero-default`/`hero-selected` |

### 3.6 Effects

| Token | Resolved | Applies to |
|---|---|---|
| `--shadow-bestseller` | `0 8px 24px oklch(0 0 0 / 0.35)` (`8px` from `--sys-elevation-level-3-main`) | Card hover lift shadow — **adjacent to this handoff's scope** (hover feedback, not the ring/shimmer/bloom trio), included for orientation only; not a state row above |

### 3.7 Motion

| Token | Resolved | Used for |
|---|---|---|
| `--motion-border-spin` | `3200ms` | Running conic border rotation period · `hero-default` |
| `--motion-sku-bloom` | `3500ms` | Bloom halo breathe period · `hero-default`/`hero-selected` |
| `--motion-sys-ease-linear` | `linear` | Easing for both the ring spin and the shimmer sweep |
| `--motion-sys-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Bloom breathe easing |
| `--motion-sys-duration-slow` | `350ms` | Mount entrance duration (`sku-enter`) · `mount-pending`/`entering` (§2.2) |
| `--motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Mount entrance easing (`sku-enter`) · `mount-pending`/`entering` (§2.2) |
| `--motion-sku-shimmer` | `3000ms` (aliases `--motion-shimmer-sweep`) | Shimmer sweep+hold period · `compact-default`/`compact-selected` |

**Motion rules that travel with these values:**
- The ring and bloom are perpetual ambient loops (`animation-iteration-count: infinite`), not entrances/exits — the decelerate/accelerate asymmetry rule doesn't apply to them. The mount entrance (§2.2) *is* a true one-shot entrance, so it correctly uses decelerate easing.
- `prefers-reduced-motion: reduce` collapses the ring/bloom/shimmer trio to `animation: none` at the effect-utility layer (`effects.css`), not per component — see §2.1.d for the resulting (non-uniform) frozen appearance of each. **The mount entrance has no reduced-motion handling at all** — `sku-enter` is not wrapped in any `prefers-reduced-motion` block anywhere in the reference. This is a genuine gap, not something to silently "fix" — see §11 A3.
- The ring's `conic-gradient(from var(--angle), …)` is written **inline in `background`**, never wrapped in an intermediate custom property — Chrome does not re-evaluate a nested `var(--angle)` inside another custom property every animation frame, which would freeze the spin. Preserve this if your target stack also uses CSS custom-property-driven rotation.

> ✅ **Resolved — the higher-level entrance token was fixed at the source.**
> [`src/tokens/motion-sku.css:17`](../../../src/tokens/motion-sku.css) previously
> defined `--motion-sku-enter: var(--motion-sys-duration-base) var(--motion-sys-ease-decelerate)`
> (**250ms**) despite every actual card entrance (`BestSellerCard.vue:296` included)
> hardcoding `var(--motion-sys-duration-slow)` (**350ms**). Verified that nothing in
> `src/` consumes `--motion-sku-enter` via `var()` — only doc prose referenced it —
> so correcting its alias to `--motion-sys-duration-slow` (now **350ms**, matching
> every component) was a zero-risk fix, not a behavioural change. It's applied:
> `--motion-sku-enter` now correctly resolves to `350ms` decelerate.
>
> Components still don't consume `--motion-sku-enter` directly (they use the
> longhand `animation-duration`/`animation-timing-function` pair instead) — **that
> remains correct, not a follow-up gap.** Wiring it up via `animation: sku-enter
> var(--motion-sku-enter) both` would violate the shorthand/comma-easing rule
> (`--motion-sys-ease-decelerate` is a `cubic-bezier(...)` value), which is exactly
> why every component's own source comment says "animation LONGHANDS (shorthand +
> comma-easing var is invalid)." Formerly tracked as open question Q3 — now closed;
> see §11.

### 3.8 Magic numbers (values with no token)

| Value | Where | Why it isn't a token | Action for the rebuild |
|---|---|---|---|
| `1.5px` | `fx-glow-border--hdr::before` inset/padding | Every sibling ring variant (`--dual`, `--rotate`, `--pulse`, `--camo-breathe`) uses the tokenized `--border-weight-default`; only `--hdr` hardcodes its own width | Carry `1.5px` as the `hdr`-variant's distinct ring width, or align it to `--border-weight-default` (`1px`) if a reviewer confirms the difference wasn't deliberate — see §11 Q2. |
| `-10%` | `.bestseller__card::after` (bloom inset override) | No token backs either this or `.fx-bloom`'s own `-2%` default | Carry as-is; this is a per-component visual tune, not a system value. |
| `24deg` / `38deg` / `52deg` / `110deg` | `fx-glow-border--hdr::before` conic-gradient stops | Baked into the effect's shape definition, shared system-wide across every `hdr`-family use, not a per-store token | Carry as-is — this defines the "comet" shape itself, not a themeable value. |
| `-150%` / `150%` / `skewX(-20deg)` | `shimmer-loop` keyframe (`keyframes.css`) | Shared keyframe geometry, reused by `.fx-shimmer` and the compact shimmer alike | Carry as-is — reproducing the keyframe's translate/skew values is what makes it look like a gloss sweep. |

---

## 4. Surface-by-surface reference *(illustrative)*

### 4.1 Running border — "hero comet ring"
**Reference:** [`effects.css`](../../../src/tokens/effects.css) `.fx-glow-border--hdr` (~L121-147),
applied via [`BestSellerCard.vue`](../../../src/components/BestSellerCard.vue) (~L67-75, 152) ·
**z-index:** `2`

A single OKLCH "comet" (three-stop conic gradient, `transparent → glow → hot → glow → transparent`)
sweeps 360° continuously around the card edge, masked to a thin ring via
`mask-composite: exclude`. Chosen over the sibling `--dual`/`--rotate` variants as
the *default* "flagship SKU pops" treatment; a store can opt into a calmer sibling
via `config.sku.heroRingEffect` (see §2.1.c) — COD:M does not.

<!-- source: src/tokens/effects.css:127-147 (reference only) -->
```css
.fx-glow-border--hdr::before {
  content: "";
  position: absolute;
  inset: -1.5px;
  border-radius: inherit;
  padding: 1.5px;
  background: conic-gradient(
    from var(--angle),
    transparent 0deg,
    var(--hdr-glow) 24deg,
    var(--hdr-hot) 38deg,
    var(--hdr-glow) 52deg,
    transparent 110deg
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  animation: border-spin var(--motion-border-spin) var(--motion-sys-ease-linear) infinite;
  pointer-events: none;
  z-index: 2;
}
```
- `inset: -1.5px` + `padding: 1.5px` is the ring's own width — see §3.8 (not tokenized, unlike sibling variants).
- `mask-composite: exclude` (with the `-webkit-mask-composite: xor` fallback) is what turns a filled conic disc into a thin ring — the two mask layers (`content-box` vs. full box) cancel out everything except the border band.
- Requires **no `overflow: hidden`** on `.bestseller__card` itself — that would clip the ring. Compact mode sets `overflow: hidden` on the card precisely *because* it never applies this ring class (see `BestSellerCard.vue:337-338`'s own comment: "safe — no `::before` conic border to clip").

> ⚠️ **Gotcha:** the selected-state override (`.bestseller__card--selected::before`)
> shares this same `::before` box but supplies no `content` — so in `compact`
> mode, where the `hdr` class (and therefore its `content: ""`) is never applied,
> selecting the card produces **no visible ring at all**, not a mis-rendered one.
> See §2.1.d.

### 4.2 Bloom — "breathing halo"
**Reference:** [`effects.css`](../../../src/tokens/effects.css) `.fx-bloom` (~L367-382) +
[`keyframes.css`](../../../src/tokens/keyframes.css) `bloom-pulse` (~L125-128), with
per-component override in [`BestSellerCard.vue`](../../../src/components/BestSellerCard.vue) (~L258-273) ·
**z-index:** `-1` (painted behind the card)

A heavily blurred (`blur(44px)`), low-opacity radial gradient breathes behind the
card — the "light bleed" that reads as the hero card glowing. `BestSellerCard`
supplies its own `--fx-bloom-image` (built from `--hdr-hot`/`--hdr-glow` to match
the ring's palette) rather than using `.fx-bloom`'s own `--hdr-bloom` fallback.

<!-- source: src/components/BestSellerCard.vue:258-273 (reference only) -->
```css
.bestseller__card {
  --fx-bloom-image: radial-gradient(
    ellipse at 50% 55%,
    var(--hdr-hot) 0%,
    var(--hdr-hot) 22%,
    var(--hdr-glow) 55%,
    transparent 72%
  );
}
.bestseller__card::after {
  inset: -10%;
  filter: blur(44px) brightness(1.1) saturate(1.1);
}
```
- The `-10%` inset and `brightness(1.1) saturate(1.1)` here **override** `.fx-bloom`'s own defaults (`-2%`, `brightness(1) saturate(1)`) — the component intentionally makes its bloom larger and punchier than the generic utility default.
- `z-index: -1` requires `.fx-bloom` (and therefore `.bestseller__card`) to establish its own stacking context (`isolation: isolate`, set by `.fx-bloom` itself) — otherwise `-1` could paint behind unrelated ancestors.

> ⚠️ **Gotcha:** see §2.1.d — under `prefers-reduced-motion: reduce`, this halo
> renders at full opacity (CSS initial value), not its intended `0.12`–`0.22`
> breathing range, because no static `opacity` is declared outside the animation.

### 4.3 Shimmer — "metallic gloss sweep"
**Reference:** [`BestSellerCard.vue`](../../../src/components/BestSellerCard.vue) (~L358-375),
keyframe shared with [`keyframes.css`](../../../src/tokens/keyframes.css) `shimmer-loop` (~L118-122) ·
**z-index:** `1` (above the `<img>`, below the skeleton overlay)

A single diagonal gloss band sweeps left-to-right across the coin photo, holds
briefly at the right edge, then restarts — compact/carousel cards only. Lives on
the image element itself, never the info bar beneath it.

<!-- source: src/components/BestSellerCard.vue:362-375 (reference only) -->
```css
.bestseller__card--compact .bestseller__image::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: var(--gradient-bestseller-metallic-shine);
  transform: translateX(-150%) skewX(-20deg);
  pointer-events: none;
  opacity: var(--fx-bestseller-shimmer-opacity);
  animation-name: shimmer-loop;
  animation-duration: var(--motion-sku-shimmer);
  animation-timing-function: var(--motion-sys-ease-linear);
  animation-iteration-count: infinite;
}
```
```css
/* keyframes.css:118-122 — shared with the generic .fx-shimmer button utility */
@keyframes shimmer-loop {
  0%   { transform: translateX(-150%) skewX(-20deg); }
  45%  { transform: translateX(150%) skewX(-20deg); }
  100% { transform: translateX(150%) skewX(-20deg); }
}
```
- The `45% → 100%` hold at full-right creates the "sweep, then pause" rhythm — a plain `0%→100%` linear sweep across the whole duration would look like a continuous scan rather than a discrete gloss pass.
- `.bestseller__image` already has `position: relative` + `overflow: hidden`, so this `::after` is naturally clipped to the photo without any extra wrapper.
- `opacity: var(--fx-bestseller-shimmer-opacity)` on the pseudo-element is separate from the gradient's own internal alpha (`oklch(1 0 0 / 0.61)` at the gradient's peak stop) — both compound.

> ✅ **Fixed** — the duration/easing now read `--motion-sku-shimmer`/
> `--motion-sys-ease-linear` instead of the hardcoded `2954ms linear`, and the
> opacity now reads `--fx-bestseller-shimmer-opacity` (`src/tokens/ds/extensions.css`)
> instead of a bare `0.25`. The sweep is now `3000ms` (was `2954ms`) — see §11
> for the retired Q1.

---

## 5. State & timing constants

Selection state (which drives `hero-selected`/`compact-selected`) is owned by
[`useCheckout.js`](../../../src/composables/useCheckout.js) — specifically the
module-level `sheetOpen`/`selectedKey` refs and the `isSelected` guard logic
(`selectedKey.value !== key` early-return, `isInlineMode() || sheetOpen.value`).
This is a shared singleton across every SKU/hero card in the store, not specific
to `BestSellerCard`.

The three effect *durations* themselves are not owned by any composable — they are
CSS-only (`animation-duration` in `effects.css`/`BestSellerCard.vue`'s scoped
style). All three are now named tokens (the shimmer's former magic number, §3.8,
is fixed). In the rebuild, keep all three as named tokens in one motion module,
not inline literals scattered per component.

| Constant | Value | Meaning |
|---|---|---|
| `--motion-border-spin` | `3200ms` | Ring full-rotation period |
| `--motion-sku-bloom` | `3500ms` | Bloom breathe period |
| `--motion-sku-shimmer` | `3000ms` | Shimmer sweep+hold period (compact only) |
| `--motion-sys-duration-slow` | `350ms` | Mount entrance duration (§2.2) — the section/index `baseDelay` *before* this duration starts is owned by the calling parent (`App.vue`, `BestSellerCarousel.vue`), not by `BestSellerCard` itself; see the sibling stagger doc §5 for the full constant list across all six card families. |

No re-entrancy guard or timer cleanup applies here — all four are CSS animations
(three `infinite`, one one-shot with `fill-mode: both`) with no JS-owned timer to
leak.

---

## 6. Accessibility & performance

- `prefers-reduced-motion: reduce` is handled at the effect-utility layer
  (`effects.css`'s single media-query block, not per component) — see §2.1.d for
  the non-uniform result (ring freezes visible-static, shimmer parks hidden, bloom
  falls back to full opacity).
- None of the three effects is the sole signal of a state change — `hero-selected`
  and `compact-selected` both also swap `--bg-card-selected`, so a
  reduced-motion or effect-disabled user still perceives the selection.
- All three effects animate only `transform`/`opacity` (shimmer, bloom) or a
  registered custom property read into a `background` (`--angle` for the ring) —
  no layout properties are animated.
- These are decorative, non-interactive pseudo-elements — no ARIA role, focus, or
  hit-target considerations apply to the effects themselves. (The card's own tap
  target and focus behaviour are out of this handoff's scope — see the sku-cards doc.)
- **The mount entrance (§2.2) has no `prefers-reduced-motion` handling at all** —
  a real, verified gap distinct from the ring/bloom/shimmer trio's (partial,
  non-uniform) handling above. The card is present in the DOM and accessible
  before its entrance completes, so this doesn't block interaction — but a
  reduced-motion user sees the full fade+rise regardless of their preference.
  See §11 A3 before deciding whether to add handling in the rebuild.

---

## 7. Layout & stacking context

Within a single `BestSellerCard` instance:

```
bloom (::after, z: -1)  <  card content  <  shimmer (::after, z: 1, compact only)  <  skeleton (z: 2, compact only, transient)  <  ring (::before, z: 2, hero only)
```

- Bloom's `z-index: -1` requires `.bestseller__card` to be its own stacking context
  (established by `.fx-bloom`'s `isolation: isolate`) so `-1` doesn't escape behind
  unrelated page content.
- The ring (`z-index: 2`, hero only) and the shimmer (`z-index: 1`, compact only)
  never coexist on the same card instance, so they never actually compete for a
  stacking slot in practice — the shared numbering is coincidental, not a
  deliberate layering decision.
- No `container-type` ancestor changes positioning semantics for these
  pseudo-elements — all three are `position: absolute` against their own
  `position: relative` host, which is standard containing-block behaviour.

---

## 8. Build order

### T1 — Static structure & default states
**Depends on:** — · **Covers states:** §2.1 `hero-default`, `compact-default`
**Tokens:** §3.1 `--hdr-glow`, `--hdr-hot`, `--border-warm` · §3.4 `--radius-container-s` · §3.5 `1.5px`, `--border-weight-default`
**Behaviour:** Build the running-border ring (hero) and the shimmer sweep
(compact) as two independent, mutually-exclusive effect layers gated by whichever
prop/flag your rebuild uses in place of `compact`. Do not build them as a single
toggleable effect with two "modes" — the reference treats them as structurally
separate pseudo-elements on separate elements (ring on the card root, shimmer on
the image).
**Acceptance:**
- [ ] Hero instance shows a spinning ring at the resolved 8px card radius, matching §4.1's conic stop angles/colours.
- [ ] Compact instance shows the shimmer sweeping only across the photo, never the info bar beneath it.
- [ ] No literal colour values in the new code — every colour traces to a mapped §3.1 token.
- [ ] Ring width and shimmer opacity match the magic-number values in §3.8 (carried as literals or newly-named tokens, per your team's convention).

### T2 — Bloom halo
**Depends on:** T1 (hero) · **Covers states:** §2.1 `hero-default`, `hero-selected` (bloom persists through selection)
**Tokens:** §3.1 `--hdr-hot`, `--hdr-glow` · §3.7 `--motion-sku-bloom`
**Behaviour:** Add the breathing halo behind the hero card only, using the same
two colour tokens as the ring (not `--hdr-bloom` — see the §3.1 callout on why this
component bypasses it).
**Acceptance:**
- [ ] Halo breathes continuously at the resolved `3500ms` period, independent of ring/selection state.
- [ ] Halo persists (still breathing) when the card enters `hero-selected`.
- [ ] Under `prefers-reduced-motion: reduce`, halo stops breathing — confirm your rebuild's resting opacity choice against §2.1.d's flagged quirk (A1 in §11) rather than copying it blindly.

### T3 — Selection override
**Depends on:** T1 · **Covers states:** §2.1 `hero-selected`, `compact-selected`
**Tokens:** §3.1 `--bg-card-selected`, `--border-sku-card-selected` · §3.5 `--border-weight-selected`
**Behaviour:** On selection, swap the hero ring to a static single-colour ring and
stop its animation; swap the card background on both variants. Do **not** generate
any ring artifact on the compact/carousel variant when selected.
**Acceptance:**
- [ ] `hero-selected`: ring is static (no rotation), uses `--border-sku-card-selected`, background swaps.
- [ ] `compact-selected`: background swaps; zero border/ring visual change.
- [ ] Swap is instant (no cross-fade) per §2.1.d's stated assertion.
- [ ] Deselecting restarts the ring's rotation from its beginning, not from a paused angle.

### T4 — Mount entrance
**Depends on:** — · **Covers states:** §2.2 `mount-pending`, `entering`, `settled`
**Tokens:** §3.7 `--motion-sys-duration-slow`, `--motion-sys-ease-decelerate`
**Behaviour:** Build the one-shot fade+rise entrance (`6px` translateY, `350ms`,
decelerate, `fill-mode: both`), delayed by a `baseDelay` value your rebuild
receives from its own section/index-stagger composition (full model:
[`sku-card-entrance-stagger`](../sku-card-entrance-stagger/README.md)). Do **not**
gate the ring/bloom/shimmer's own start on this entrance completing — they run
independently from mount, per §2.2.d.
**Acceptance:**
- [ ] Card is invisible + offset during its delay window, then fades/rises over 350ms, then holds at rest.
- [ ] Ring, bloom, and shimmer (whichever apply per §2.1) are already animating during the entrance, not waiting for it to finish.
- [ ] No secondary price-reveal delay is added — the whole card enters as one unit.
- [ ] Entrance duration/easing trace to the tokens above; `--motion-sku-enter` (now fixed, §3.7) is an acceptable equivalent source if your rebuild's shorthand rules allow consuming it, but never via `animation:` shorthand in a stack with the same comma-easing constraint.

*(No T5 — beyond T1-T4 there is no further cross-effect choreography to sequence;
the four effects (ring, bloom, shimmer, entrance) run on independent clocks.)*

---

## 9. Constraints & prohibitions

**MUST**
- Implement all four states in §2.1.a and all three states in §2.2.a —
  `compact-selected`'s "no visible ring change" is itself a state to implement
  (i.e., verify your rebuild doesn't accidentally add a ring flash there), not a
  state to skip.
- Map every colour value through §3.1, and the entrance duration/easing through
  §3.7, to a semantic token in the target system.
- Keep the ring's rotation driven by a registered/animatable property equivalent to
  `@property --angle` (or your framework's animation-value equivalent) so the
  conic gradient recomputes every frame — see the §3.7 Chrome caveat.
- Preserve the intent in §4's gotchas, especially the `compact-selected` no-ring
  behaviour, the reduced-motion asymmetry across the three perpetual effects, and
  the fact that the perpetual effects never wait for the entrance to settle (§2.2.d).

**NEVER**
- Copy `BestSellerCard.vue`/`BestSellerCarousel.vue` or mirror their
  architecture/composables/file layout.
- Port prototype-only scaffolding: demo data, the device-frame overlay, or any
  `forceReduceMotion` handoff shim.
- Hardcode a resolved literal that §3 gives a token for (`--hdr-glow`/`--hdr-hot`
  especially — these are shared, brand-overridable tokens, not COD:M-specific
  literals).
- "Fix" the reduced-motion bloom opacity or the `1.5px` ring width without first
  resolving the corresponding §11 question — these are documented as-observed,
  not as design intent to preserve or bugs to squash. (The shimmer duration and
  `--motion-sku-enter`, formerly in this category, are both fixed at the token
  source — see the §3.7/§4.3 callouts.)
- Layer the ring and shimmer on one element — the reference never does this; they
  are mutually exclusive by construction (`compact` branch).
- Add a secondary price-reveal delay to the entrance — that pattern belongs to
  `SkuCard`/`SkuImageCard` only (sibling doc), not `BestSellerCard`.
- Animate any layout property for any of the four effects.

---

## 10. Verification

The target repo is not assumed runnable from this doc, so verification is
**state coverage + visual parity against the reference.**

### 10.1 State coverage

| State | Reachable | Matches reference | Notes |
|---|---|---|---|
| `hero-default` | ☐ | ☐ | |
| `hero-selected` | ☐ | ☐ | |
| `compact-default` | ☐ | ☐ | |
| `compact-selected` | ☐ | ☐ | Confirm **no** ring artifact appears — this is the one state where "matches reference" means "shows nothing extra." |
| `mount-pending` | ☐ | ☐ | §2.2 |
| `entering` | ☐ | ☐ | §2.2 — confirm the ring/bloom/shimmer are already mid-loop underneath, not synchronized to this |
| `settled` | ☐ | ☐ | §2.2 — the implicit starting point for every §2.1 row above |

Total states to cover: **7** (must equal frontmatter `states:`).

### 10.2 Visual parity

Compare each state against the live prototype (no `demo_url` published yet for
this handoff — run the prototype locally: `npm run dev`, navigate to the COD:M
storefront, and view the Best Seller section in both hero and carousel
placements). Check ring colour/width/rotation speed, bloom size/opacity/breathe
speed, and shimmer angle/opacity/sweep timing.

### 10.3 Token mapping record

Fill this in as you implement. It is the design-fidelity review artifact.

| §3 row (role) | Target token used | New token added? |
|---|---|---|
| `--hdr-glow` | | ☐ |
| `--hdr-hot` | | ☐ |
| `--border-warm` | | ☐ |
| `--bg-card-selected` | | ☐ |
| `--border-sku-card-selected` | | ☐ |
| `--gradient-bestseller-metallic-shine` | | ☐ |
| `--fx-bestseller-shimmer-opacity` | | ☐ |
| `--radius-container-s` | | ☐ |
| `--border-weight-default` | | ☐ |
| `--border-weight-selected` | | ☐ |
| `--motion-border-spin` | | ☐ |
| `--motion-sku-bloom` | | ☐ |
| `--motion-sys-duration-slow` (entrance) | | ☐ |
| `--motion-sys-ease-decelerate` (entrance) | | ☐ |
| `--motion-sku-shimmer` | | ☐ |

### 10.4 Behavioural checks

- [ ] Every transition in §2.1.b and §2.2.b fires on its stated trigger and respects its guard.
- [ ] Every edge case in §2.1.d and §2.2.d holds, including the `compact-selected` no-ring assertion and the perpetual-effects-don't-wait-for-entrance assertion.
- [ ] `prefers-reduced-motion: reduce` pass: ring freezes static-visible, shimmer disappears, bloom's resting opacity matches whatever your team decided for §11 A1 — and the entrance itself still plays at full motion regardless (§11 A3, since it has no reduced-motion handling in the reference).

---

## 11. Open questions & assumptions

**Blocking** — none. Every question below is a non-blocking clarification; the
current, verified-from-source behaviour is fully specified in §2/§3 and can be
built as-is while these are resolved.

| # | Question | Owner | Blocks |
|---|---|---|---|
| Q2 | Is the running border's `1.5px` ring width (hardcoded, `hdr` variant only) intentionally distinct from every sibling variant's tokenized `--border-weight-default` (`1px`), or an oversight? | Design/FE | None currently — carry `1.5px` as specified in §3.5/§3.8 |
| Q4 | COD:M's HDR-boost multipliers (`--hdr-glow`/`-hot`/`-bloom`: `l×1.03`–`1.05`, `c×1.2`–`1.3`) are a first-pass default with no prior boosted value to match — unlike `fcm`/`efootball`'s multipliers, which were reverse-engineered to preserve an existing look exactly. Does the punch need a design pass? | Design/FE | None currently — carry the multipliers as specified in the §3.1 token-chain table |

**Resolved**

| # | Was | Resolution |
|---|---|---|
| ~~Q1~~ | Compact shimmer hardcoded `2954ms linear` and a bare `opacity: 0.25` instead of consuming `--motion-sku-shimmer`/`--motion-sys-ease-linear` and a real opacity token — `docs/motion-tokens.md` also separately claimed a stale `4500ms` + champagne colour for this same effect, matching neither the old nor new value. | Fixed: `BestSellerCard.vue` now reads `var(--motion-sku-shimmer)` (`3000ms`), `var(--motion-sys-ease-linear)`, and a new `--fx-bestseller-shimmer-opacity` token (`src/tokens/ds/extensions.css`, still `0.25`). Sweep duration changed from `2954ms` to `3000ms` (+1.5%) — a deliberate, accepted change. `docs/motion-tokens.md`'s stale entry also corrected. See §1.1, §3.7/§3.8, §4.3. |
| ~~Q3~~ | `--motion-sku-enter` resolved to `250ms` (`--motion-sys-duration-base`) while every actual entrance hardcoded `350ms` (`--motion-sys-duration-slow`). | Fixed at the source: confirmed zero components consume `--motion-sku-enter` via `var()` (repo-wide grep), so correcting its alias to `--motion-sys-duration-slow` was a zero-risk, non-behavioural change. `src/tokens/motion-sku.css:17` now reads `--motion-sku-enter: var(--motion-sys-duration-slow) var(--motion-sys-ease-decelerate)`. See the §3.7 callout. |
| ~~A2~~ | COD:M's `--hdr-glow`/`-hot`/`-bloom` had no per-theme override at all and fell through to an unscoped global default in `motion-sku.css` with no relation to COD:M's own brand seed — previously documented here as "intentional, not a gap." | Fixed: `src/tokens/ds/themes/codm.css` now explicitly aliases all three to `--palette-primary-{500,200,600}`, with an HDR-boosted variant derived via relative colour syntax in COD:M's existing `@media (dynamic-range: high)` block. Also fixed the same underlying pattern's other symptom in `fcm`/`efootball`, whose `--hdr-*` overrides mixed real aliases with hardcoded literals that only *happened* to match `--ref-primary`/`--ref-secondary`. See the §3.1 callout and token-chain table. |

**Assumptions** — recorded decisions that were not specified by design. Flag rather
than bury; each is a thing a reviewer can overturn.

| # | Assumption | Basis |
|---|---|---|
| A1 | The bloom halo rendering at full opacity (not its `0.12`–`0.22` breathing range) under `prefers-reduced-motion: reduce` is documented as-observed, not corrected, because it is unconfirmed whether this is accepted (a heavily-blurred halo at full opacity is still soft, not a hard shape) or an oversight (no static `opacity` fallback was ever added to `.fx-bloom::after`). | Direct CSS read of `effects.css` §385-399 — no static `opacity` declaration exists outside `bloom-pulse`'s keyframes. |
| A3 | The mount entrance's total absence of `prefers-reduced-motion` handling (§2.2, §6) is documented as a real gap, not corrected here, since adding it (instant appearance? opacity-only fade with no rise? something else?) is a product decision for a reviewer, not something to infer. | Grep of `effects.css`'s reduced-motion block confirms it covers only `fx-*` utility classes; `sku-enter` is defined in `keyframes.css` and referenced directly by component `animation-name`, entirely outside that block. |

---

## 12. Ready-to-paste prompts

**Implement one task**

```text
Read docs/Handoff/bestseller-card-effects/AGENTS.md, then README.md §0, §2, §3 and
task T1 of §8. Implement T1 only, in this codebase — do NOT copy BestSellerCard.vue
or any prototype file. Cover exactly the states T1 lists (hero-default,
compact-default). Map every colour value through §3.1 to a token in this repo's
design system; if a semantic role has no token here, add it and note it in §10.3.
Then run the §10 checks for the states T1 covers and report the results as a
checklist. If any value you need is missing from §2/§3, stop and ask instead of
choosing one.
```

**Review an implementation against the spec**

```text
Read docs/Handoff/bestseller-card-effects/README.md §2 and §3. Audit <path to your
Best Seller card component> and report, as a table: (a) states in §2.1.a that are
missing or unreachable — pay particular attention to compact-selected, whose
"correct" behaviour is showing NO ring artifact, (b) values that are hardcoded
literals instead of mapped tokens, (c) transitions whose trigger or guard differs
from §2.1.b. Do not fix anything yet — report first.
```

**Extend the feature with a new ring variant**

```text
Read docs/Handoff/bestseller-card-effects/README.md §2, §3, §4.1 and §9. The
prototype supports swapping the running-border's visual family via a config flag
(fx-glow-border--dual / --rotate / --pulse / --camo-breathe / --hud / --trace —
see src/tokens/effects.css for the full set). Add support for selecting an
equivalent alternate ring treatment in this codebase, following the same
single-pseudo-element, single-active-variant model in §2.1.d ("only one ring
variant can render at a time"). List the new state/variant in §2 table format and
any new tokens in §3 format before writing any code.
```

---

**Related docs:** [`sku-cards`](../sku-cards/README.md) (the full `BestSellerCard`
content model, hover/press feedback, and the sibling `HeroSkuCard`'s `--dual`
default), [`sku-card-entrance-stagger`](../sku-card-entrance-stagger/README.md)
(the mount/loading cascade `BestSellerCard` also plays — orthogonal to the ring/
shimmer/bloom effects specced here), [`motion-tokens.md`](../../motion-tokens.md)
(system-wide motion token catalogue — see §11 Q1 for the stale shimmer entry
there), [`component-breakdown.md`](../../component-breakdown.md) (the state/mode
table this handoff cross-checked against).

Generated using the [web-store-spec-handoff](./_skill/SKILL.md) skill — bundled
as a frozen snapshot; the live skill may have since evolved.
