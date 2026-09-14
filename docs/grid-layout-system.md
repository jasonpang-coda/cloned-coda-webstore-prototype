# COD:M Web Store — Grid & Layout System

## Architecture Overview

**Container-query-driven responsive system** using CSS custom properties. All responsive logic uses `@container` (against `.device__screen`) — never viewport `@media` queries.

---

## Core Grid Component (`src/components/Grid.vue`)

| Breakpoint | Container Width | Columns | Column Gap | Side Padding |
|---|---|---|---|---|
| **XS** | < 641px | 8 | 8px | 12px |
| **S** | 641–800px | 8 | 8px | 12px |
| **M** | 801–1279px | 12 | 12px | 12px |
| **L** | ≥ 1280px | 12 | 16px | 16px |

Uses `grid-template-columns: repeat(N, minmax(0, 1fr))`. Column gap tokens: `--gap-grid-gutter` (XS/S, 8px),
`--gap-grid-gutter-m` (M, 12px), `--gap-grid-gutter-l` (L, 16px). Side padding tokens: `--gap-grid-margin`
(XS/S/M, 12px), `--gap-grid-margin-l` (L, 16px) — all in `src/tokens/ds/space.css`, themeable per store
(Codashop overrides `--gap-grid-gutter-l` to 12px to land on its own derived 1280px/12-col grid). These
replace three values `Grid.vue` previously hardcoded inline ("Phase 3" TODOs) — a pure refactor, default
values unchanged for every existing store.

**Row gap (fixed v0.73.0):** `row-gap` was wired to `--gap-grid-gutter` (the *column* token, 8px at
XS/S) instead of `--gap-grid-row-default` (12px) — the row-gap tokens above existed but were never
actually consumed anywhere. Wrapped grid rows at XS/S read as cramped as a result. `Grid.vue`'s `.ce-grid`
now uses `--gap-grid-row-default` for `row-gap` at every breakpoint (12px, no per-breakpoint escalation
yet — nothing has asked for tighter/looser row spacing at a specific size).

---

## Span Component (`src/components/Span.vue`)

Three variants controlling how content spans the grid:

- **`size="fluid"` / `"full"`** — `grid-column: 1 / -1` at all breakpoints. Full bleed.
- **`size="content"`** — Full width on XS/S; centred 2/3 (cols 3–10 of 12, max 960px) on M/L.
- **`size="carousel"`** — Full-bleed on XS/S (cancels Grid margin with negative margin: −12px); same as content on M/L.
- **`size="col-lead"` / `"col-main"`** — the two-column split rails (see below): 4-of-12 (`grid-column: 1 / 5`) / 8-of-12 (`grid-column: 5 / 13`) at M/L, full width on XS/S.

---

## Two-Column Split Layout (`config.page.layout === 'split'`) — Codashop, FCM

The one store-level layout capability that changes the *page shape*, not just section content. `App.vue`
wraps the storefront section stack:

```html
<div class="storefront" :class="{ 'storefront--split': isSplitActive }">
  <div class="storefront__col storefront__col--lead">
    <section v-if="showIntentHero && showLeadCarousel"><StoryCarousel ... /></section>
    <section v-if="config.identity"><CompactHero ... /></section>
    <section v-if="showTrustBar" class="trust-bar-section"><TrustBar /></section>
  </div>
  <div class="storefront__col storefront__col--main"> <!-- every existing section, unchanged --> </div>
</div>
```

`TrustBar` (Codashop only, `config.trustBar`) mounts directly after `CompactHero` in the same
sticky lead column — the two scroll together at ≥801px rather than sitting in separate columns.
Its wrapping `.trust-bar-section` adds a 12px side inset (`--gap-grid-margin`) below 801px only,
since the split has collapsed there and nothing else supplies a side margin for it; the inset is
removed at ≥801px because the lead column already sits inside `.storefront--split`'s own grid
margin. This lives on the wrapper, not inside `TrustBar.vue` — the component takes no side-inset
prop of its own.

`isSplit = computed(() => config.value.page?.layout === 'split' && ...)`. `.storefront` and
`.storefront__col` are `display: contents` unconditionally — a complete no-op until `--split` is
active, so every non-split store renders exactly as before with zero extra boxes in the DOM's
visual formatting. At `≥801px`, `.storefront--split` becomes a 12-col grid
(`repeat(12, minmax(0,1fr))`, `--gap-grid-gutter-m`/`-l`, `--gap-grid-margin`/`-l`, capped at
1280px + centred at L); `--lead` gets `grid-column: 1 / 5` and `position: sticky`, `--main` gets
`5 / 13`. Below 801px both collapse back to `display: contents`, so the split always disappears at
XS/S regardless of the flag.

**Empty-lead-column fallback (`hasLeadContent` / `isSplitActive`).** FCM sets `config.page.layout:
'split'` store-wide (`heroColumn: 'lead'` moves its story carousel into the rail), but the lead
column only ever renders content while the Store intent is active (`showIntentHero`) — switching to
the Milestone Rewards or Events L1 tabs leaves it completely empty. Rendering `.storefront--split`
anyway would still reserve its 4-of-12 lead track and pin `--main` to columns `5 / 13`, offsetting
that content instead of centring it. `hasLeadContent = computed(() => (showIntentHero.value &&
showLeadCarousel.value) || !!config.value.identity || showTrustBar.value)` checks whether any of the
three things the lead column can ever hold (story carousel, Codashop's `CompactHero`, Codashop's
`TrustBar`) actually apply; `isSplitActive = computed(() => isSplit.value && hasLeadContent.value)`
is what actually drives the `--split` class and the `GRID_BARE_KEY` provide below. When it's false,
`--main`'s content falls back to the same centred single-column render every other non-split store
gets (also how FCM's `layoutRequiresProdCards` new-SKU-card preview already falls back to
`isSplit === false`, see `src/App.vue`).

**The nested-grid problem.** Every section inside `--main` still wraps its content in its own
`<Grid><Span size="content">` (unchanged markup). Inside a column that is *already* a grid cell, that would
lay out a second nested 12-col grid with doubled side padding and a re-centred `3/11` inset. Fixed via
provide/inject rather than a prop, so it also reaches `CategoryCatalog.vue`'s internally-owned `Grid`/`Span`:

```js
// App.vue
provide(GRID_BARE_KEY, isSplitActive)   // src/composables/gridBare.js

// Grid.vue / Span.vue
const bare = inject(GRID_BARE_KEY, false)
```

`.ce-grid--bare` / `.ce-span--bare` rules live *inside* `@container (min-width: 801px)` only — below that,
the split has already collapsed, so sections need their normal XS/S grid back.

**Known limitation — anonymous container queries.** Every `@container` rule in this repo (all ~24 of them,
including the ones this feature adds) is unnamed, so each binds to the *nearest* container ancestor — today
that is always `.device__screen` (`container-type: inline-size`, `DeviceFrame.vue`). This feature
deliberately does **not** add a nested named container on either split column. Consequence: a component like
`SkuList` sitting in the ~828px-wide `--main` column at L (1280px total) still reads the full 1280px screen
width and resolves its own breakpoints as if it had that much room — it does not "shrink" to its column's
actual width. That's why Codashop drives its SKU grid density with an explicit prop
(`config.skuList.columns` → `SkuList`'s `--sku-columns`, see below) instead of relying on the column's
container width. The alternative — naming the screen container (`container: screen / inline-size`) and
migrating all ~24 rules to `@container screen (...)` — is mechanical but touches every file with a
`@container` rule for no Codashop-visible benefit; deferred as a follow-up.

**`TrustBar.vue` is the one component that opts out of this trap instead of working around it.**
Unlike `SkuList`, TrustBar's own layout states (single-card carousel / 2×2 grid / 4-up grid) need
to react to *its own* rendered width, not the screen's — and since it lives in the ~4/12-column
lead rail (~400px at a 1280px frame), the screen-width numbers would be actively wrong for it (an
anonymous rule would fire its 2×2/4-up states off *screen* width even though the rail is a third
that size). So `TrustBar.vue` names itself as a query container
(`container-type: inline-size; container-name: trust-bar`) and its own internal rules query
`@container trust-bar (min-width: ...)` instead of relying on `.device__screen`. This is scoped to
just this one component — it does not migrate any other `@container` rule and is not the
"name the screen container" migration described above. See `docs/Handoff/trust-bar/README.md` §4.4
and §7 for the full reasoning. One practical consequence: because the lead rail never reaches
801px, TrustBar's 2×2/4-up states exist in its CSS but are not reachable in the shipped page today
— resizing the browser window will not trigger them, since they now respond to TrustBar's own box,
not the window.

---

## SKU Grid Density (`config.skuList.columns`)

`SkuList.vue`'s `columns` prop (nullable, default `null`) sets `--sku-columns` inline via `:style`, which
the `@container (min-width: 641px)` rule reads as `repeat(var(--sku-columns, 4), 1fr)` — falling back to
today's fixed 4-up grid when unset. Codashop passes `5` (`config.skuList.columns: 5`) to match its Figma
reference's 5-up "Select Recharge" grid. Ignored when `layout` is `'columns'` or `'stack'`, which have their
own fixed arrangements.

---

## Container Query System

Container context is established on `.device__screen` only:

```css
.device__screen { container-type: inline-size; }
```

The overlay (`.device__overlay`) deliberately has **no** `container-type` to avoid trapping `position: fixed` descendants.

**Breakpoints to use in components:**

```css
/* Default: XS mobile */
@container (min-width: 641px) { /* S: tablet portrait */ }
@container (min-width: 801px) { /* M: tablet landscape / desktop */ }
@container (min-width: 1280px) { /* L: wide desktop (rare) */ }
```

---

## Device Frame (`src/components/DeviceFrame.vue`)

| Device | Screen Width | Screen Height | Safe Top | Bezel |
|---|---|---|---|---|
| iPhone | 440px | 956px | 62px | 14px |
| Android (Samsung) | 384px | 854px | 40px | 12px |

`device="none"` = responsive mode (no frame, full viewport).

**Z-index overlay stack:** CategoryNav 0 → Drawer 1 → Loader 2 → Snackbar 3 → Checkout 4.

---

## SKU / Content Grid Patterns

| Component | Mobile | ≥ 641px | ≥ 801px |
|---|---|---|---|
| SkuList (wrap/grid) | 2 cols | 4 cols | 4 cols |
| SkuImageList | 2 cols | 4 cols | 4 cols |
| BundleGrid | 1 col | 1 col | 2 cols |
| GiftGrid | 2 cols | variable | variable |
| StoryCarousel aspect | 1/1 | 1/1 | 2.6/1 |

All use `display: grid; gap: var(--gap-content-default)` (8px).

---

## Spacing Tokens (`src/tokens/ds/space.css`)

### Primitive Scale

```
--sys-space-0:    0px
--sys-space-xxxs: 1px
--sys-space-xxs:  2px
--sys-space-xs:   4px
--sys-space-s:    8px        ← base unit
--sys-space-main: 12px       ← second base unit
--sys-space-l:    16px
--sys-space-xl:   24px
--sys-space-xxl:  32px
--sys-space-xxxl: 48px
```

### Semantic Gaps (what components consume)

```
--gap-content-tight:       2px
--gap-content-narrow:      4px
--gap-content-default:     8px   ← most common gap
--gap-content-loose:       12px
--gap-content-separation:  16px

--gap-grid-gutter:         8px   ← column gap
--gap-grid-margin:         12px  ← side padding
--gap-grid-row-default:    12px
--gap-grid-row-loose:      24px
--gap-grid-row-separation: 32px

--gap-section-default:     12px
--gap-section-loose:       16px
--gap-section-separation:  24px

--gap-nav-narrow:          4px
--gap-nav-default:         8px
--gap-nav-loose:           12px

--gap-control-xs:          2px
--gap-control-s:           4px
--gap-control-m:           8px
--gap-control-l:           12px
--gap-control-xl:          16px

--gap-form-label:          4px
--gap-form-row:            8px
--gap-form-col:            8px
--gap-form-group:          16px
```

### Semantic Padding

```
--pad-surface-xxs: 2px
--pad-surface-xs:  4px
--pad-surface-s:   8px
--pad-surface-m:   12px
--pad-surface-l:   16px
--pad-surface-xl:  24px
--pad-inset-s:     8px
--pad-inset-m:     12px
--pad-inset-l:     16px
```

---

## Radius Tokens

```
--radius-control-xs:   2px
--radius-control-s:    4px
--radius-control-full: 2px   (FCM theme: 999px)
--radius-input-s:      4px
--radius-input-m:      8px
--radius-container-xs: 4px
--radius-container-s:  8px
--radius-container-m:  12px
--radius-container-l:  12px
--radius-thumbnail-xs: 4px
--radius-thumbnail-s:  8px
--radius-thumbnail-m:  12px
--radius-badge-s:      4px
--radius-badge-full:   999px
--radius-md:           10px  (extension)
--radius-control:      7px   (extension)
--radius-circle:       50%   (extension)
```

---

## Size Tokens

### Control Sizes

```
--sys-size-control-xxxs: 16px
--sys-size-control-xxs:  24px
--sys-size-control-xs:   32px
--sys-size-control-s:    40px
--sys-size-control-m:    48px
--sys-size-control-l:    56px
--sys-size-control-xl:   64px
--sys-size-control-xxl:  72px
```

### Generic Sizes

```
--sys-size-xxxxs: 8px
--sys-size-xxxs:  12px
--sys-size-xxs:   16px
--sys-size-xs:    20px
--sys-size-s:     24px
--sys-size-m:     32px
--sys-size-l:     48px
--sys-size-xl:    64px
--sys-size-xxl:   96px
--sys-size-xxxl:  128px
```

### Semantic Size Aliases

```
--size-icon-xxs: 8px    --size-icon-xs: 12px
--size-icon-s:   16px   --size-icon-m:  20px
--size-icon-l:   24px   --size-icon-xl: 32px

--size-img-xs:   20px   --size-img-s:   24px
--size-img-m:    32px   --size-img-l:   48px
--size-img-xl:   64px   --size-img-xxl: 96px

--size-control-xxs: 16px
--size-control-xs:  24px
--size-control-s:   32px
--size-control-m:   40px
--size-chip-height: 16px
--size-input-m:     40px
```

---

## Token Tier Discipline (Critical Rule)

**4-tier hierarchy** — components must only consume the bottom two tiers:

| Tier | Token Prefix | Who Consumes It |
|---|---|---|
| Seeds / Refs | `--ref-*` | Theme file only |
| Spectrum / Palette | `--palette-*` | System tier only |
| System | `--sys-*` | Semantic/space tier only |
| **Semantic** | `--bg-*`, `--text-*`, `--border-*` | **Components** ✓ |
| **Spacing/Size** | `--pad-*`, `--gap-*`, `--radius-*`, `--size-*` | **Components** ✓ |

**Never** use `--sys-*`, `--palette-*`, or `--ref-*` directly in component CSS.

---

## Typography Text Style Classes

### Headings (use `--sys-font-condense`, always condensed)

```
.text-style-heading-display-hero   → h1
.text-style-heading-page-title     → h2
.text-style-heading-section        → h3
.text-style-heading-modal          → h4
.text-style-heading-card           → h5
.text-style-heading-banner         → h6
.text-style-heading-final-price    → h6
.text-style-heading-sku-title      → h4
.text-style-heading-subtitle       → h7
```

### Body / Utility

```
.text-style-paragraph-lead
.text-style-paragraph-regular
.text-style-paragraph-small
.text-style-paragraph-strikethrough

.text-style-utility-action-*    (button labels)
.text-style-utility-default-*   (body text)
.text-style-utility-label-*     (small labels)
.text-style-utility-micro-*     (badges, micro labels)
```

---

## Typography Condense (Critical Pattern)

All `.text-style-*` classes apply `transform: scaleX(var(--sys-font-condense))`. CODM value is `0.82` (Hitmarker renders ~18% too wide).

| Context | `transform-origin` |
|---|---|
| Default (left-aligned) | `left center` |
| Right-aligned (prices) | `right center` |
| Centred (badges, labels) | `center center` |
| Animated badges | Use negative `letter-spacing` instead of scaleX |

---

## Elevation & Shadow Tokens

### Blur Scale

```
--sys-elevation-flat:             0px
--sys-elevation-level-1-main:     2px
--sys-elevation-level-2-main:     4px
--sys-elevation-level-3-main:     8px
--sys-blur:                       16px
```

### Composed Shadows (extensions.css)

```
--shadow-card:       0 2px 4px oklch(0 0 0 / 0.25)
--shadow-card-hover: 0 6px 12px oklch(0 0 0 / 0.30)
--shadow-bestseller: 0 8px 24px oklch(0 0 0 / 0.35)
--shadow-sheet:      0 -8px 16px oklch(0.17 0.02 80 / 0.30)
```

---

## Motion Tokens

### Duration

```
--motion-sys-duration-instant:  0ms
--motion-sys-duration-snappy:   100ms
--motion-sys-duration-quick:    150ms
--motion-sys-duration-standard: 200ms
--motion-sys-duration-slow:     350ms
--motion-sys-duration-slower:   500ms
```

### Easing

```
--motion-sys-ease-decelerate: cubic-bezier(0, 0.7, 0.6, 1)
--motion-sys-ease-standard:   cubic-bezier(0.2, 0, 0.8, 1)
--motion-sys-ease-accelerate: cubic-bezier(0.3, 0, 1, 0.3)
```

### SKU-Specific

```
--motion-sku-enter:      var(--motion-sys-duration-slow) var(--motion-sys-ease-decelerate)
--motion-sku-hover:      var(--motion-sys-duration-quick) var(--motion-sys-ease-standard)
--motion-sku-story-fade: 350ms
```

---

## Brand Extensions (extensions.css)

### Scrims & Surfaces

```
--scrim:               color-mix(in oklab, var(--palette-neutral-1000) 60%, transparent)
--scrim-strong:        color-mix(in oklab, var(--palette-neutral-1000) 72%, transparent)
--scrim-banner:        color-mix(in oklab, var(--palette-neutral-1000) 80%, transparent)
--surface-ghost:       oklch(1 0 0 / 0.06)
--surface-ghost-2:     oklch(1 0 0 / 0.08)
--surface-frost:       oklch(0.992 0.003 286 / 0.04)
--surface-frost-hover: oklch(0.992 0.003 286 / 0.10)
--field-dark:          oklch(0.15 0 0 / 0.6)
```

### Gradients

```
--gradient-bestseller-hero        (radial, gold to warm-black)
--gradient-bestseller-gloss       (linear shimmer)
--gradient-story-vignette         (top-clear fade to dark bottom)
--gradient-bundle-banner          (angled dark scrim)
--gradient-sku-image-card-fade    (top+bottom fade for art reveal)
--mask-sku-card-bg-fade           (black→transparent image mask)
```

### Rarity Fills (COD:M domain)

```
--rarity-gradient-mythic:    orange→dark
--rarity-gradient-legendary: gold→olive
--rarity-gradient-epic:      purple→dark
--rarity-gradient-rare:      blue→dark
--rarity-gradient-neutral:   radial frost
```

---

## Multi-Store / Whitelabel Theme System

Theme applied via `data-theme` attribute on `<html>`. Available themes:

| Theme | File | Notes |
|---|---|---|
| `codm` | `themes/codm.css` | Hitmarker font, 0.82 condense |
| `fcm` | `themes/fcm.css` | Filter mode, loyalty ribbon |
| `efootball` | `themes/efootball.css` | |
| `tdr` | `themes/tdr.css` | |
| `ygodl` | `themes/ygodl.css` | |

Each theme block sets: `@font-face`, seed refs (`--ref-*`), spectrum ramps (`--palette-*-50` through `--palette-*-950`), typography (`--sys-font-family-*`, `--sys-font-condense`, `--sys-size-h*`), surface levels (`--sys-colour-surface-l1/l2/l3-fill/border`), and brand effect overrides.

Runtime switch: `document.documentElement.setAttribute('data-theme', theme)`

---

## Token Import Order (`main.js`)

```javascript
// 1. Active store theme (@font-face + seed/palette)
import '@active-stores'

// 2. DS system tier (role ramps alias spectrums)
import './tokens/ds/system.css'

// 3. Semantic tier (aliases system)
import './tokens/ds/semantics.css'

// 4. Space/size/radius scale
import './tokens/ds/space.css'

// 5. Typography classes
import './tokens/ds/text-styles.css'

// 6. Brand extensions (gradients, shadows, etc.)
import './tokens/ds/extensions.css'

// 7. Motion tokens
import './tokens/motion.css'
import './tokens/motion-sku.css'
import './tokens/keyframes.css'
import './tokens/effects.css'
import './tokens/reduced-motion.css'
```

**Cascade rule:** `[data-theme="codm"]` (higher specificity) overrides `:root` defaults.

---

## Standard Component Composition Pattern

```vue
<template>
  <Grid>
    <Span size="content">
      <section>
        <h2 class="text-style-heading-banner">Title</h2>
        <div class="section__grid">
          <!-- items -->
        </div>
      </section>
    </Span>
  </Grid>
</template>

<style scoped>
.section__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);  /* XS default */
  gap: var(--gap-content-default);
}

@container (min-width: 641px) {
  .section__grid { grid-template-columns: repeat(4, 1fr); }
}

@container (min-width: 801px) {
  .section__grid { /* wider layout */ }
}
</style>
```

---

## Key Constraints & Gotchas

1. **No viewport media queries.** All responsive logic uses `@container` against `.device__screen`.

2. **Container-type placement.** Only `.device__screen` has `container-type: inline-size`. The overlay does NOT — it would trap `position: fixed` descendants.

3. **Token tier discipline.** Components consume only semantic (`--bg-*`, `--text-*`, `--border-*`) and spacing/size tokens (`--pad-*`, `--gap-*`, `--radius-*`, `--size-*`). Never `--sys-*`, `--palette-*`, or `--ref-*`.

4. **Condense compensation.** Every `.text-style-*` applies `scaleX(var(--sys-font-condense))` with `left center` origin. Right-aligned or centred text must override the origin. Animated text uses negative `letter-spacing` instead.

5. **HDR colours.** All colours are OKLCH. High dynamic range variants live in `@media (dynamic-range: high)` blocks.

6. **Span max-width.** Content span caps at 960px on M/L to prevent SKU rows exceeding ~5 cards.

7. **Device frame scale.** `transform: scale()` on the frame establishes a containing block for `position: fixed` children. Responsive mode uses `position: fixed` directly to the viewport.

8. **Phase 3 pending.** M/L column gaps and margins currently use hardcoded `12px`/`16px` rather than tokenised `--gap-grid-gutter-m`/`--gap-grid-margin-l`.

---

## Complete Grid Dimensions Reference

| Aspect | XS (< 641px) | S (641–800px) | M (801–1279px) | L (≥ 1280px) |
|---|---|---|---|---|
| Grid columns | 8 | 8 | 12 | 12 |
| Column gap | 8px | 8px | 12px | 16px |
| Side padding | 12px | 12px | 12px | 16px |
| Span "content" | Full width | Full width | Cols 3–10, max 960px | Cols 3–10, max 960px |
| Row gap | 8px | 8px | 8px | 8px |
| SKU card columns | 2 | 4 | 4 | 4 |
| Bundle grid | 1 | 1 | 2 | 2 |
| Story aspect ratio | 1/1 | 1/1 | 2.6/1 | 2.6/1 |
