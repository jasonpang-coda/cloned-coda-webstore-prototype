# Design Token Values — Codashop Web Store

Reference for the **Codashop** theme palette. All colours are authored in
**OKLCH** (perceptual, P3/wide-gamut headroom). sRGB hex equivalents are
provided for reference only — the live values are OKLCH.

Token source: `src/tokens/ds/themes/codashop.css`
System structure: `src/tokens/ds/` (see [`component-breakdown.md`](component-breakdown.md) for the full cascade)
Siblings: [`design-tokens-codm.md`](design-tokens-codm.md), [`design-tokens-fcm.md`](design-tokens-fcm.md)

> **Codashop is a pure-dark store as of the v0.73.0 reskin.** It used to be
> the repo's one LIGHT-card exception (white cards on a dark page) — that
> block is gone, not just retuned. Codashop now inherits `system.css`'s dark
> `:root` defaults directly (white-alpha L1/L2/L3 gradients, the standard
> dark-UI ink ramp) like every other store, so this file is **much shorter**
> than its pre-reskin version: most of what used to need an explicit
> `html[data-theme="codashop"]` override (named surfaces, L1/L2/L3 elevation,
> the ink ramp) needs none any more. What's left in the cascade-overrides
> table below is what's genuinely brand-specific, not light-vs-dark plumbing.
>
> Brand: **electric violet** primary CTA, **volt lime** secondary
> (hyperlinks + on-brand text), **orchid** tertiary (final-price accent). The
> neutral ramp is a quiet violet-black family (hue ~305°) — chosen to match
> the primary hue so shadows/ambient surfaces read as belonging to the same
> "room" as the brand colour, not a generic grey. See
> `.claude/skills/material-fx/codashop-mapping.md` for the physics audit
> this reskin was checked against (scene-light ambient tuning, SKU-card
> material classification).
>
> Font: **Inter** (400/600/700/800) for both heading and body — already linked
> in `index.html` for COD:M's body pairing, so this store needed no new
> `@font-face` or `<link>`. `--sys-font-condense: 1` (Inter is not a condensed
> face — no `scaleX` squeeze). Unchanged by the reskin.

---

## Seeds

| Token | OKLCH | sRGB equiv | Role |
|---|---|---|---|
| `--ref-primary` | `oklch(0.620 0.245 293)` | #8B5CFF | Electric violet — brand, primary CTA (seed at step 500) |
| `--ref-secondary` | `oklch(0.905 0.195 116)` | #D8F23E | Volt lime — hyperlinks, on-brand text (seed at 500) |
| `--ref-tertiary` | `oklch(0.700 0.215 340)` | #F45CC8 | Orchid — final-price accent (seed at 500) |
| `--ref-status-positive` | `oklch(0.750 0.190 152)` | #3ED47E | Mint green — success (seed at 500) |
| `--ref-status-caution` | `oklch(0.800 0.155 75)` | #FFBE45 | Amber — warnings (seed at 500) |
| `--ref-status-negative` | `oklch(0.640 0.220 25)` | #FF5540 | Signal red — errors (seed at **400**, not 500) |
| `--ref-neutral` | `oklch(0.180 0.035 305)` | #17091F | Violet-black — the **page** colour (`neutral-1000`) |

---

## Spectrum ramps

Each ramp runs 950 (darkest) → 50 (lightest); the neutral ramp runs 1000 → 0.
Full values are in `src/tokens/ds/themes/codashop.css` — this section covers
only the anchor points. Direction is now the same as every other store
(dark-first: high step numbers are dark, low are light) — no more light-store
special case to remember.

### Neutral — same direction as every other store now

| Step | OKLCH | sRGB equiv | Role |
|---|---|---|---|
| 1000 | `var(--ref-neutral)` | #17091F | **Page** background (darkest) |
| 950 | `oklch(0.311 0.029 305)` | #342D3D | Default `--sys-colour-surface-panel` (via `system.css`'s dark default — no Codashop override) |
| 0 | `oklch(1.000 0.000 305)` | #FFFFFF | Lightest step — `ink-inverse` use only |

Pre-reskin, Codashop's container sat at the *opposite end* of the ramp from
every other store (white cards). Post-reskin the ramp direction and its
semantic mapping are ordinary — nothing to special-case here any more.

### Other ramps — anchor steps

| Ramp | Seed anchor |
|---|---|
| primary (violet) | 500 |
| secondary (lime) | 500 |
| tertiary (orchid) | 500 |
| status-positive | 500 |
| status-caution | 500 |
| status-negative | **400** (not 500 — preserved from the original export convention, carried through the reskin) |

---

## Cascade overrides (`html[data-theme="codashop"]`)

Per `docs/multi-store-whitelabel.md` §2: any token also declared by a later
`:root` tier must be set from `html[data-theme="codashop"]` (specificity 0,1,1)
to beat that `:root` declaration (0,1,0) regardless of file import order. Every
override below exists for that reason. Post-reskin this table is **much
shorter** — no more named-surfaces / L1-L2-L3 / ink-ramp rows, since Codashop
inherits the standard dark defaults directly now.

| Group | What changes | Why |
|---|---|---|
| Navbar chrome | `--bg-navbar: palette-neutral-1000`, `--border-navbar: sys-colour-neutral-strong` | Navbar stays a fixed dark panel regardless of card colour (matches the Figma reference's dark top bar); overridden directly rather than through `--sys-colour-surface-inverse`, which other components need resolving to a *light* surface on this dark theme |
| Hyperlink family | `--sys-colour-hyperlink-{main,strong,heavy}` repointed to the secondary (lime) ramp; `-inverse` repointed to primary (violet) | `system.css`'s default direction (hyperlink = primary) is backwards for Codashop, which uses primary as the CTA colour and secondary as the link colour — repoints the *sys alias-role*, not the semantic, per `web-store-tokens` §2 |
| `--text-on-brand` | `sys-colour-secondary-main` (lime) | Lime label on the violet CTA pill reads clean; the repo default (near-white `ink-inverse`) has weak contrast against a mid-lightness violet fill |
| `--hdr-glow`/`-hot`/`-bloom` | Aliased to the primary (violet) ramp | Previously **undefined** here — every consumer (selected/hover SKU-card glow, bestseller comet border/bloom) fell through to the store-agnostic amber default, producing a yellow glow against Codashop's violet border. Fixed in v0.73.0, same pattern every other store already had. |
| Radius scale | `--sys-radius-{l,xl,xxl}` raised to 16/24/32px; `--radius-control-full` set to `var(--sys-radius-full)` | Repo default clamps `{m,l,xl,xxl}` all to 12px and aliases `--radius-control-full` to a non-round 2px (the same trap FCM fixed) — Codashop's controls are pill-shaped |
| Grid gutters (L) | `--gap-grid-gutter-l: 12px`, `--gap-grid-margin-l: 16px` | Codashop's own derived 1280px/12-col grid (12px gutter, 16px margin) differs from the repo's default L profile (16px/16px) |
| Effect colours | `--sys-effect-glow-*` / `--sys-effect-shadow-*` per ramp | Standard per-theme effect retune — formulas unchanged by the reskin, resolve to the new palette automatically |
| Light scene (`light.css`, not this file) | `--x-light-ambient-color: oklch(0.30 0.05 305)` | Codashop is the first store to use the per-store scene-light override `light.css`'s header always invited — violet ambient matching the new neutral hue, per `physics.md` §6 (radiosity) |
| SKU card material tokens (`--x-fx-{metal,plastic,carbon}-*`) | New, v0.73.0 | See "SKU card material pilot" below |

---

## Typography

| Token | Value |
|---|---|
| `--sys-font-family-heading` / `-body` | `'Inter', system-ui, sans-serif` (both) |
| `--sys-weight-{extra-bold,bold,semibold,regular}` | 800 / 700 / 600 / 400 |
| `--sys-size-h1…h7` | 28 / 24 / 22 / 20 / 18 / 16 / 14px |
| `--sys-size-body-{l,main,s,xs}` | 16 / 14 / 12 / 10px |
| `--sys-letter-spacing-main` | `0.005em` (source export: headings at 0.5%) |
| `--sys-letter-spacing-loose`/`-wide` | `0.01em` (source export: utility uppercase at 1%) |
| `--sys-line-height-main` | `1.2` (source export: headings at 120%) |
| `--sys-line-height-wide` | `1.5` (source export: paragraphs at 150%) |
| `--sys-font-condense` | `1` (no squeeze) |

The source Figma export used inconsistent units per token family (`px` on
weights — a Figma export artefact, not real pixel weights; `%` on letter-spacing
and line-height). All three were converted to the repo's unitless/`em`
contract during porting; see the theme file's header comment for the full
conversion table.

---

## Aggregator homepage tokens (v0.60.0)

Codashop's storefront is now a title-listing homepage (`config.home`), not just
the MLBB product page below — see `docs/component-breakdown.md`'s changelog
for the full feature. Four gradient/glow tokens live in `themes/codashop.css`
(Codashop-only, so they don't belong in the theme-agnostic `extensions.css`),
each composed from palette steps rather than a raw literal — components only
ever reference the token by name:

| Token | Composition | Used by |
|---|---|---|
| `--gradient-home-ribbon` | `secondary-500 → tertiary-500`, 135deg | `TitleCard.vue`'s HOT/NEW badge |
| `--gradient-home-tile-scrim` | `neutral-1000` fade, bottom-anchored | `TitleCard.vue`'s title-overlay legibility scrim |
| `--gradient-home-payments` | `tertiary-500 → tertiary-800`, 135deg | `HomePayments.vue`'s fixed coral→magenta panel |
| `--glow-home-payments` | radial `tertiary-500` → transparent | `HomePayments.vue`'s `.fx-bloom` halo override |

**v0.60.1 addition** — `HomeSteps.vue`'s three cards get a background hue
progression (acid-green → coral → indigo) instead of a one-off accent shape:

| Token | Composition | Used by |
|---|---|---|
| `--home-step-ink-1/2/3` | `secondary-500` / `tertiary-500` / `primary-500` | `HomeSteps.vue`'s per-step icon colour |
| `--tint-home-fold-1/2/3` | each ink `color-mix`ed 45% toward transparent | intermediate — feeds the wash tokens below |
| `--wash-home-step-1/2/3` | flat-colour `linear-gradient` of the matching tint | `HomeSteps.vue`'s per-step card background, layered over `--home-surface-bg` |

The Visual layout's frosted-glass card look (stats/FAQ/reviews/payments/
categories/steps) is a `--home-surface-*` custom-property indirection set at
`.home-visual`'s root (`--surface-ghost-4` + `--border-soft-2` + inverse text +
`blur(64px) saturate(1.6)`) — Standard falls through to the plain semantic
tokens (`--bg-card-default` etc.) via each consumer's own `var(--home-surface-bg,
var(--bg-card-default))` fallback, so the same leaf components render
correctly in both layouts with zero `if (layout === …)` branching.

## Placeholder catalog

Codashop's store module (`src/stores/codashop/store.js`) ships a **placeholder
Mobile Legends: Bang Bang Diamond catalog** — no real MLBB assets are shipped
(see `src/stores/codashop/img/README.md`). Denominations, bonus amounts, and
tag (`POPULAR` on the 11600 tier) mirror the Figma reference
(`LBnhQZYmtplAs0Rc9s5D3b`, node `2189-2729`). SKU data flows through
`storeSkus.value?.promo` / `.cp` overrides in `App.vue`'s `promoItems`/`cpItems`
computed — the same pattern `cpImageRegular` already used for TDR. This remains
the "title detail" page every homepage title card routes to (only MLBB has a
full product page in this prototype).

## SKU card material pilot (v0.73.0)

`SkuCard.vue` can render three alternate surface finishes behind the
`skuCardMaterial` dev flag (`useFeatureFlags.js`), gated on
`config.skuCard.materialExploration` — **Codashop only**; every other store
ignores the flag entirely and always renders the default `glass` look. Values
live as `--x-fx-{metal,plastic,carbon}-*` tokens in this theme file.

These are deliberately **restrained "suggested material" finishes**, not
literal `.claude/skills/material-fx` physics simulations — a first pass
followed the recipes closely (a full chrome-mirror gradient for metal, a
literal woven ±45° twill for carbon fibre) and read as too busy for a real
product grid, so all three were reworked to one dominant cue each: a
full-surface fill (a narrow lightness band near the theme's own dark violet
card) + a thin edge + one highlight. Only **plastic** keeps a travelling
sweep (the one material here with a real, if weak, travelling highlight);
metal and carbon fibre get a **static** highlight baked into the fill — a
satin/composite surface has no discrete specular lobe to animate. Full
rationale, including why carbon fibre knowingly drops the physically-
mandated weave pattern, is in `.claude/skills/material-fx/codashop-mapping.md`.

## Category nav — embedded in the SKU card (v0.73.0)

Codashop's product page renders its category tabs (`CategoryNav`) **inside**
the boxed `catalog-card` panel (`config.page.topNav: true` +
`config.page.catalogBoxed: true`), not the repo's default sticky-bottom bar
(`config.catalog.hideNav: true` suppresses that). This reuses the same
`config.page.topNav` capability ZZZ already had, generalized in `App.vue` so
it wraps whichever `config.page.sections` a store actually enables instead of
two hardcoded section names — Codashop's boxed layout mounts the nav as a
plain in-flow row at the top of the card rather than ZZZ's sticky
in-document-flow bar, since the two stores' catalog shapes differ (one boxed
panel vs. several flat sections).

## Known gaps

- **`pc/dark` payment icons** — Codashop sets `config.chrome.iconVariant: 'dark'`,
  but `src/shared/pc/dark/` is currently an empty stub reserved for "a future
  light-theme store." `useStoreAssets()` falls back to `PC.light` via `??`, so
  the store renders with light-polarity payment logos until real dark-on-light
  SVGs are added. **Worth re-checking post-reskin** — this flag predates the
  v0.73.0 dark reskin and was presumably set for the old light-card era; now
  that Codashop's cards are dark like every other store, `'dark'` icons may no
  longer be the right choice. Not changed in this pass — flagging only.
- **SEO block / yellow footer band** — the Figma reference's full-bleed SEO
  section and the acid-yellow highlighted footer treatment are not built in
  this pass; see `docs/multi-store-whitelabel.md`'s Codashop changelog entry.
