# Typography — Text Style Tokens & Type Scale

CODM SKU Card 3.0 · text system reference. Pairs with
[`motion-tokens.md`](./motion-tokens.md) and [`component-breakdown.md`](./component-breakdown.md).

This catalogs the **text-style design tokens** that exist, the **de-facto type
scale** the components actually use, and — importantly — the text styling that is
**not** tokenised today (raw `px`, raw weights, the inlined font-family).

---

## 1. The one typeface

| Property | Value |
|---|---|
| Family | `'Hitmarker Text VF'` (static cuts, not the variable font) |
| Fallback | `sans-serif` |
| Source | `src/fonts/HitmarkerNormal-{Light,Regular,Medium,Bold,Black}.woff2` (+ `.woff`) |
| `font-display` | `swap` (all weights) |
| Defined in | `src/style.css` `@font-face` ×5 (lines 12–51) |

**Weights loaded vs. used:**

| Weight | Cut | Loaded | Used in product |
|---|---|---|---|
| 300 | Light | ✅ | ❌ never referenced |
| 400 | Regular | ✅ | ✅ body / labels |
| 500 | Medium | ✅ | ❌ never referenced |
| 700 | Bold | ✅ | ✅ headings / amounts / prices |
| 900 | Black | ✅ | ❌ never referenced |

> The family name keeps the `VF` suffix for historical reasons even though it now
> loads **static** weights — the variable cut rendered ~2× too wide vs. the Figma
> design. Width is recovered with the condense system below.

**Global baseline** (`body`, `src/style.css`):
`font-family: 'Hitmarker Text VF', sans-serif` · `letter-spacing: 0.005em`
(+0.5% global tightening) · `-webkit-font-smoothing: antialiased`.

---

## 2. The condense system — `--hm-scale`

The static Hitmarker cut is normal-width; the design wants a condensed
(≈`wdth 40`) look. There is **one** token for this:

```css
--hm-scale: 0.82;   /* src/style.css — horizontal scale applied to display text */
```

**Body vs heading split (demo body-font toggle).** Body-family consumers read a
second token, `--hm-scale-body` / `--sys-font-condense-body`, which falls back
to the heading condense — identical on the stock theme. The DEMO body-font
toggle (DeviceToolbar → `useBodyFont` → `<html data-body-font>`) overrides it to
`1` in the `[data-theme="codm"][data-body-font="barlow|inter"]` blocks of
`themes/codm.css`, swapping the body family (Google Fonts, loaded in
`index.html`) and zeroing the global body tracking baseline
(`--sys-letter-spacing-body-base`) while headings stay condensed Hitmarker.
In `text-styles.css`, heading classes pin `scaleX(var(--sys-font-condense))`;
the base `[class*="text-style-"]` rule and the body-family selectors of the
global condense block use the body token. Remove all of this once a pairing is
chosen.

It is applied two ways:

### a) `transform: scaleX(var(--hm-scale))` — the default
Compresses the glyphs horizontally. `transform-origin` keeps the text anchored to
its alignment edge:

| Origin | Used by | Why |
|---|---|---|
| `left center` | section titles, headings, bonus labels, body copy | left-aligned text hugs the left edge |
| `right center` | prices, discount blocks | right-aligned numerals hug the right edge |
| `center center` | centered badges / tabs | symmetric labels |

A core set is centralised in the **global condense block** in `src/style.css`
(`.sku-card__bonus`, `.sku-list__title`, `.bestseller__*`, `.promo-banner__*`,
`.bs-carousel__title`, `.sku-card__current-price`, …). Components added later apply
the same `scaleX(var(--hm-scale))` **inline** in their scoped CSS — CheckoutSheet,
StoryCarousel, Snackbar, SignInLoader, NavBar/NavDrawer, **BundleSkuCard**,
**BundleItem** (via an inner `.bundle-item__condense` span so the badge box isn't
scaled), and **CategoryNav** (via `.cat-nav__label`).

> ⚠️ A badge/pill with a background must condense an **inner text span**, never the
> box — scaling the box squashes its padding and background. See
> `.bundle-item__condense` and `.cat-nav__label`.

### b) Negative `letter-spacing` — the layout-aware exception
Where the condensed width must affect **layout** (not just paint), `scaleX` is
replaced with negative tracking:

| Element | Tracking | Reason |
|---|---|---|
| `.sku-card__amount` | `-0.04em` | keeps a uniform 4px gap to the CP icon for every digit count (a `scaleX` box keeps its un-scaled width, drifting the gap) |
| `.sku-card__badge-text` | `-0.02em` | the badge runs a `pop` scale keyframe; a static `scaleX` would conflict, and it makes the chip hug its text |

---

## 3. Text colour tokens — the one fully-tokenised axis

Every text colour resolves to a token (most with a hex fallback for safety). All
defined in `src/style.css` `:root`.

| Token | Value | Used for |
|---|---|---|
| `--text-header-default` | `#fcfcfe` | headings, amounts |
| `--text-body-default` | `#fcfcfe` | body copy, quantities |
| `--text-body-soft` | `#a3a4a8` | tax / meta / PC labels |
| `--text-body-inverse` | `#f7edfa` | nav tab rest, code value |
| `--text-header-strong` | `#fff` | hover emphasis, banner bonus |
| `--text-header-dim` | `rgba(252,252,254,0.9)` | nav item rest state |
| `--text-hyperlink-inverse` | `oklch(0.91 0.191 97)` | **prices, active tab, CTAs** (HDR-boosted) |
| `--text-success-default` | `#79fb40` | discount %, snackbar icon |
| `--text-success-inverse` | `#f4ffed` | snackbar copy |
| `--text-error-inverse` | `oklch(0.96 0.02 32)` | Bonus/Loyalty pill text (≈`#ffede9`) |
| `--text-web-bonus-codashop` | `#b493ff` | purple bonus amount |
| `--text-web-bonus-cp` | `#77aaff` | blue bonus amount |
| `--text-icon-muted` | `rgba(255,255,255,0.4)` | CP/AP icon-label fallback |
| `--text-icon-faint` | `rgba(255,255,255,0.5)` | bestseller CP label |
| `--text-on-action` | `#09090e` | text on the yellow CTA |
| `--text-shadow-story-heading` | `0 2px 5px …, 0 8px 8px …` | story heading legibility shadow |
| `--toolbar-text-idle` | `rgba(252,252,254,0.6)` | dev toolbar (non-product) |

No rogue raw text colours exist — the only literals are `var(--token, #fallback)`
fallbacks, which are intentional.

---

## 4. The de-facto type scale

There are **no `--font-size`, `--font-weight`, `--line-height`, or
`--letter-spacing` tokens.** Every value below is hardcoded in component CSS. This
is the scale as it exists in practice (13 sizes, two weights):

| Size | Weight | Line-height | Role | Representative use |
|---:|---|---|---|---|
| 28px | 700 | 1.2 | display | SignInLoader QR code value |
| 24px | 700 | 1.2 | price / amount | SkuCard + BundleSkuCard current price |
| 22px | 700 | 1.2 | amount | BestSellerCard hero amount |
| 20px | 700 | 1.2 | heading / SKU CTA | Checkout header, Story heading, SignIn title; SKU card prices + CTAs (SkuCard, BundleSkuCard, BestSellerCard, GiftSkuCard, SkuImageCard) — all via `heading-sku-title` (H4) or `heading-modal` (H4) |
| 18px | 700 | 1.2 | section heading | NavDrawer L1, PromoBanner, ItemSummaryAccordion item name (`heading-subtitle`) |
| 16px | 700 | 1.2 | sub-heading | SkuList / Carousel titles, NavDrawer L2, Snackbar title, CTAs |
| 14px | 400 / 700 | 1.2–1.5 | UI text | Nav, account name, sign-in copy, snackbar body |
| 13px | 600 | — | **dev chrome** | DeviceToolbar (system font, not Hitmarker) |
| 12px | 400 / 700 | 1 / 1.5 | body / meta | bonus, discount, descriptions, qty badge |
| 11px | 400 | — | fine print | checkout "powered by" |
| 10px | 700 | 1 | micro label | Best Value badge, Bonus/Loyalty pill, PC label |
| 9px | 700 | — | tiny label | CP/AP icon fallback |
| 8px | 700 | — | tiny label | SkuCard `icon-label--sm` |

**Patterns that hold:** headings/amounts are **700 / line-height 1.2**; body and
descriptions are **400**, line-height **1.5** for multi-line copy (`PromoBanner`,
SignIn) or **1.2** for single lines; micro-labels run **line-height 1** and
uppercase. Letter-spacing is small-positive on most uppercase headings
(`0.08–0.12px`) and `0.005–0.01em` elsewhere — all inline.

---

## 5. Per-component reference

Colour column omitted where it is the default `--text-header-default`. All
font-family is `'Hitmarker Text VF'` unless noted.

| Component | Element | Size / Weight | Condense |
|---|---|---|---|
| **NavBar** | sign-in label | 14 / 400 | scaleX (inline) |
| **NavDrawer** | MENU header | 14 / 700 | — |
| | L1 item (STORE) | 18 / 700 | — |
| | L2 item (Gifts/CP) | 16 / 700 | — |
| | sign-out | 16 / 400 | — |
| **SkuCard** | amount | 24 / 700 | letter-spacing −0.04em |
| | bonus | 12 / 400·700 | scaleX (global) |
| | badge BEST VALUE | 10 / 700 | letter-spacing −0.02em |
| | current price | 18 / 700 | scaleX (global) |
| | original / discount | 12 / 400 | scaleX (global) |
| | icon label | 9 / 8 / 700 | scaleX (global) |
| **BundleSkuCard** | title | 18 / 700 | scaleX (inline) ✓ fixed |
| | current price | 24 / 700 | scaleX (inline) ✓ fixed |
| | original / discount % | 12 / 400·700 | scaleX (inline) ✓ fixed |
| **BundleItem** | tag (BONUS/Loyalty) | 10 / 700 | scaleX on inner span ✓ fixed |
| | quantity | 12 / 400 | scaleX on inner span ✓ fixed |
| **CategoryNav** | tab (rest/active) | 12 / 400·700 | scaleX on `.cat-nav__label`; `0.08em` tracking |
| **CheckoutSheet** | header | 20 / 700 | scaleX (inline) |
| | subtotal eyebrow | 12 / 400 | scaleX (inline) — label/regular |
| | price | 24 / 700 | scaleX (inline) — H2 |
| | account / banner / labels | 10–16 | scaleX (inline) |
| | powered-by | 11 / 400 | scaleX on inner span |
| **BestSellerCard** | heading | 16 / 700 | scaleX (global) |
| | amount | 22 / 700 | scaleX (global) |
| | bonus / discount | 12 / 400 | scaleX (global) |
| | current price | 20 / 700 | scaleX (global) |
| **BestSellerCarousel** | title | 16 / 700 | scaleX (global) |
| **StoryCarousel** | heading | 20 / 700 | scaleX (inline) + text-shadow |
| | CTA label | 16 / 400 | scaleX (inline) |
| **PromoBanner** | title | 18 / 700 | scaleX (global) |
| | description / subtext | 12 / 400 | scaleX (global), line-height 1.5 |
| **SkuList** | section title | 16 / 700 | scaleX (global) |
| **Snackbar** | title / body | 16·14 | scaleX (inline) |
| **SignInLoader** | title / code / copy | 20·28·14 | scaleX (inline) |
| **DeviceToolbar** | button | 13 / 600 | **system font** (see §6) |

---

## 6. Text NOT using design tokens

The colour axis is fully tokenised; **everything else about text is raw.**

### 6.1 Font size — 0% tokenised
All **13 distinct sizes** (8/9/10/11/12/13/14/16/18/20/22/24/28 px) are hardcoded
`px` in component CSS. There is no `--font-size-*` / `--size-*` scale. A single edit
to the type ramp currently means touching dozens of rules across 15 files.

### 6.2 Font weight — 0% tokenised
Weights are raw numbers: **400** and **700** in product UI (≈50 and ≈80 occurrences
respectively), plus **600** once in the dev toolbar. No `--font-weight-*` tokens.
Loaded-but-unused: **300, 500, 900** (dead font payload — candidates to drop).

### 6.3 Line-height & letter-spacing — 0% tokenised
`line-height` is raw (`1`, `1.2`, `1.5`); `letter-spacing` is raw inline
(`0.005em`, `0.01em`, `0.08–0.12px`, and the two negative condense values). No
tokens for either.

### 6.4 Font-family — repeated literal, not tokenised
`font-family: 'Hitmarker Text VF', sans-serif` is **inlined ~41 times across 14
components** rather than referenced from a token or inherited. (The `body` sets it
globally, so most of these inline repeats are redundant.) Occurrences:

`NavBar`×1, `NavDrawer`×4, `SkuCard`×6, `BundleSkuCard`×3, `BundleItem`×2,
`BestSellerCard`×2, `BestSellerCarousel`×1, `CategoryNav`×1, `CheckoutSheet`×8,
`PromoBanner`×3, `SkuList`×1, `StoryCarousel`×2, `Snackbar`×2, `SignInLoader`×3.

### 6.5 Non-Hitmarker text (intentional)
`DeviceToolbar.vue` uses a system stack
`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` (13px / 600).
This is the **prototype's dev chrome** (the device switcher), deliberately *not*
product UI — acceptable variance, not a bug.

---

## 7. Recommendations (if hardening into a system)

1. **Add a size ramp** — e.g. `--font-size-2xs: 10px` … `--font-size-3xl: 28px`
   mapped to the 13 existing sizes. Then a type-scale edit is one file.
2. **Add weight + line-height tokens** — `--font-weight-regular: 400` /
   `--font-weight-bold: 700`; `--line-height-tight: 1.2` / `--line-height-body: 1.5`.
3. **Tokenise the family** — `--font-display: 'Hitmarker Text VF', sans-serif` and
   reference it (or simply rely on `body` inheritance and delete the 41 repeats).
4. **Drop unused weights** — 300 / 500 / 900 are loaded but never used (3 fewer
   `woff2`+`woff` pairs to ship).
5. **Codify text-style composites** — optional: `.type-h5`, `.type-body`, etc.
   bundling size + weight + line-height + condense, so new components inherit the
   condense correctly instead of re-deriving it (the recurring "text too wide" bug
   when a new component forgets `scaleX(var(--hm-scale))`).

---

**Last updated:** June 2026 · prototype v0.12.1 (body-font evaluation toggle)
