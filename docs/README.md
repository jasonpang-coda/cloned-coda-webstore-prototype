# Documentation

Design and engineering reference for the CODM web store prototype.

## Files

### [`design-tokens-codm.md`](design-tokens-codm.md)

**Complete palette reference for the COD:M theme.**

Covers all 7 seeds (OKLCH + sRGB equiv), all 6 × 11-step spectrum ramps (neutral, primary, secondary, tertiary, positive, caution, negative), COD:M semantic pixel-parity overrides, HDR overrides, and the typography token values including the Hitmarker tracking compensation.

**Read this to:** Understand what the colour values are, re-derive a ramp step, or compare against Figma variables.

---

### [`design-tokens-fcm.md`](design-tokens-fcm.md)

**Complete palette reference for the FC Mobile (FCM) theme.**

Mirrors the COD:M token doc for the EA SPORTS FC™ Mobile store: all 7 seeds (OKLCH + sRGB equiv) with their off-500 anchor steps, the full spectrum ramps, the L1/L2/L3 composited container surfaces, the brand/semantic/effect overrides (EA-red sign-in, green primary actions, loyalty banner, rarity collapse), the HDR boost, and the Cruyff Sans typography tokens (no condense hack, three-cut weight remap).

**Read this to:** Look up an FCM colour value, understand how FCM differs structurally from COD:M, or compare against the EA Figma export.

---

### [`design-tokens-codashop.md`](design-tokens-codashop.md)

**Complete palette reference for the Codashop theme — the first LIGHT store.**

Covers the 7 seeds, spectrum ramps, and the full set of `html[data-theme="codashop"]` overrides needed to invert the ink ramp and L1/L2/L3 elevation surfaces for a light (white-card) UI, plus the Inter typography tokens, the two-column split layout, the inline checkout, and the placeholder MLBB catalog.

**Read this to:** Look up a Codashop colour value, understand what a future light-theme store needs to invert, or trace the split-layout/inline-checkout capability flags.

---

### [`fcm-components.md`](fcm-components.md)

**The components and behaviours specific to the FC Mobile store variant.**

Covers the new filter-mode components (`CategoryCatalog`, `FeaturedCarousel`, `SkuImageCard`, `BundleGrid`, `PageSignInSection`, `EaSignInPage`, `PlayerCard`) with props tables, and the existing components made FCM-aware (catalog mode switch in `App.vue`, `SkuList` layouts, CheckoutSheet loyalty banner, NavBar MP pill + sign-in routing, AccountPopover variant). Maps every divergence back to its `useStoreConfig` / `useStoreStrings` / `useStoreAssets` flag, plus the `useStoreCatalog` data layer.

**Read this to:** Work on an FCM-only component, understand the filter page model, or trace which config flag drives an FCM branch.

---

### [`command-console.md`](command-console.md)

**The `/` command palette — keyboard shortcuts, all command groups, and how to extend it.**

Covers the trigger key and field-safe guard, every command group (Store / Device / Auth / Navigation / Appearance) with conditions and what each command calls, the fuzzy-filter algorithm, the blurred backdrop, font isolation, and the implementation files. Includes the `z-index` table for the full overlay stack and a one-step guide for adding a new command.

**Read this to:** Understand what the command console does, use it during a prototype demo, or add a new command.

---

### [`token-dashboard.md`](token-dashboard.md)

**The `/tokens` dashboard — coverage, drift, custom tokens, per-store overrides, generated live from source.**

Covers what "in prod" means, the four independent usage signals, the drift rule catalogue (dead theme overrides, missing `:root` defaults, unreachable tokens, tier violations, component-minted pseudo-tokens, namespace collisions, scale-ladder gaps, orphan themes), and how it replaces the hand-maintained token-atlas/drift-audit docs.

**Read this to:** Find unused or drifted tokens, audit a store's overrides, or check whether a token change is safe.

---

### [`comment-mode.md`](comment-mode.md)

**Collaborator comment mode — Figma/Vercel-style pins for prototype feedback.**

The feature lives in its own repo, **[`yiweicoda/comment-kit`](https://github.com/yiweicoda/comment-kit)** (`@coda/comment-kit`, installed via `npm install github:yiweicoda/comment-kit`) — installable in any org Vue 3 + Vite prototype. Extracted from this repo's `packages/comment-kit` once stable (see [comment-mode.md](comment-mode.md) for the history, including migrating off the old `#comment-kit` branch install). This doc covers the webstore-specific wiring: turning it on (Vercel/PROD + local opt-in, independent of `__STORE_LOCKED__`), the `C` key / toolbar / `/` console entry points, the kit config in `src/main.js` (scope/containers/isolation), the light-DOM pin architecture, semantic element tagging, flow-state surface capture, and per-store isolation.

**Read this to:** Use comment mode during a review, reuse the kit in another prototype (→ package README), or understand how a pin stays glued to its element across scroll/scale/overlay state.

### [`comments-backend.md`](comments-backend.md) · [`comments-schema.md`](comments-schema.md)

**Supabase backend setup + the `comments` table/jsonb schema reference.**

`comments-backend.md` covers project setup, the table + RLS SQL, realtime, and env vars. `comments-schema.md` documents every column and the full `anchor`/`context` jsonb shapes with worked examples.

**Read this to:** Wire up a Supabase project for comment mode, or look up an anchor/context field.

### [`session-tracking.md`](session-tracking.md)

**Session click/scroll tracking for moderated & unmoderated user testing — Hotjar-style, built the same way as comment mode.**

The feature lives in its own repo, **[`yiweicoda/site-tracker`](https://github.com/yiweicoda/site-tracker)** (`@coda/track-kit`, installed via `npm install github:yiweicoda/site-tracker`) — a framework-agnostic capture core + Lit viewer (heatmap/replay/scroll-depth) with a Vue adapter, reusing comment-kit's Supabase project/env and container list. Extracted from this repo's `packages/track-kit` once stable (see [session-tracking.md](session-tracking.md) for the history). This doc covers the webstore-specific wiring: turning it on (off by default on localhost, on for any deployed context), the console/toolbar entry points, retention (latest 30 sessions), and per-store isolation.

**Read this to:** Record and review a usability test, reuse the kit in another prototype (→ package README), or understand why the heatmap/scroll-depth overlay scrolls natively with the page instead of staying fixed.

---

### [`prototype-sharing-guide.md`](prototype-sharing-guide.md)

**How to build and publish the prototype for external stakeholders.**

Covers the two build modes (internal all-stores vs store-locked), how the `[data-theme]` runtime store switcher works, three deployment options (Netlify Drop, Cloudflare Pages, Docker + nginx), and access control for confidential reviews.

**Read this to:** Share the prototype externally, demo multiple store themes, or containerise the build.

---

### [`deploying-individual-stores.md`](deploying-individual-stores.md)

**Deep-dive on publishing each store as its own standalone site.**

Covers the two build modes (`npm run build:fcm` / `build:codm` vs the default), why a store-locked build is truly isolated (the other store's assets/fonts/CSS are absent), local build-and-preview, the one-Vercel-project-per-store model (Dashboard + CLI) reusing the root `vercel.json`, Netlify/Cloudflare/Docker alternatives, `dist/` isolation-verification greps, and how to add a new store to the deploy lineup.

**Read this to:** Ship a single store (e.g. FC Mobile) to stakeholders on its own URL.

---

### [`motion-tokens.md`](motion-tokens.md)

**Complete catalog of project-specific motion tokens, keyframes, and effect utilities.**

Covers:
- **Motion tokens** — SKU Card entrance/exit, interaction feedback, stagger, loops
- **HDR color tokens** — OKLCH glow, bloom, and dynamic-range-aware fallbacks
- **Keyframe animations** — `sku-enter`, `bloom-pulse`
- **Effect utilities** — `.fx-glow-border--hdr` (animated conic border), `.fx-bloom` (breathing halo)
- **Navbar transitions** — auth toggle swap, scroll-aware show/hide
- **Accessibility** — `prefers-reduced-motion`, fallbacks
- **Performance notes** — GPU compositing, token caching, cascade timing
- **Integration checklist** — for adding new components

**Read this to:** Understand the motion system, add animations to new sections, debug timing/easing issues.

### [`component-breakdown.md`](component-breakdown.md)

**FE dev handover — every component, its props, structure, styling, and gotchas.**

Covers:
- **Stack & conventions** — Vue 3 SFCs, scoped CSS + 4-tier token system, container queries
- **Token architecture** — `src/tokens/ds/` structure, theming model, what components consume
- **Page composition** — `App.vue` section order + entrance cascade
- **Responsive system** — `Grid`/`Span`, breakpoints, container-query mechanism
- **Device frame system** — registry-driven `DeviceFrame`, scaling
- **Component reference** — props tables for all components
- **Assets, accessibility, and a "don't regress" gotchas list**

**Read this to:** Onboard to the codebase, extend a component, or re-implement a section.

### [`multi-store-whitelabel.md`](multi-store-whitelabel.md)

**The canonical multi-store / whitelabel reference — how one codebase serves many branded stores.**

Covers the four-layer model (CSS tokens · assets · config · strings), every way FC Mobile diverges from COD:M (component-by-component variant catalogue, including the two `PlayerCard` variants), the `html[data-theme]` specificity gotcha, a step-by-step deploy-a-new-store playbook, and the rules for handling store variance.

**Read this to:** Launch a new store theme, understand FCM's differences, or decide where a per-store difference belongs.

### [`typography.md`](typography.md)

**The type system — `--sys-*` tokens, `.text-style-*` classes, and the condense + tracking model.**

Covers:
- The themed `--sys-*` token values (size, weight, tracking, line-height, condense)
- The 31 `.text-style-*` classes and which component elements they map to
- The Hitmarker condense system (`scaleX` vs negative letter-spacing)
- The +5% tracking compensation baked into the Hitmarker theme tokens

**Read this to:** Apply typography to a new component, understand the condense mechanics, or onboard a non-Hitmarker store's type system.

---

## Quick reference

### Design token tiers

| File | Selector | What it holds |
|---|---|---|
| `src/tokens/ds/themes/codm.css` | `[data-theme="codm"]` | COD:M seeds, spectrum ramps, typography, brand overrides |
| `src/tokens/ds/themes/fcm.css` | `[data-theme="fcm"]` | FCM seeds/ramps, Cruyff Sans type, composited surfaces, brand overrides |
| `src/tokens/ds/system.css` | `:root` | `--sys-colour-*` role ramps |
| `src/tokens/ds/semantics.css` | `:root` | `--bg-*` `--text-*` `--border-*` — what components use |
| `src/tokens/ds/space.css` | `:root` | `--pad-*` `--gap-*` `--radius-*` `--border-weight-*` |
| `src/tokens/ds/text-styles.css` | `:root` | `.text-style-*` classes |
| `src/tokens/ds/extensions.css` | `:root` | Shadows, scrims, gradients, rarity, dev chrome |

### Most-used motion tokens

| Token | Duration | Purpose |
|---|---|---|
| `--motion-sku-enter` | 350ms | Card fade + 6px slide entrance |
| `--motion-sku-hover` | 150ms | Subtle lift on hover |
| `--motion-sku-stagger` | 90ms | Per-card stagger delay |
| `--motion-sku-bloom` | 3500ms | Best-seller breathing halo loop |

### Easing patterns

- **Entrance:** `--motion-ease-decelerate` (ease-out)
- **Exit:** `--motion-ease-accelerate` (ease-in)
- **On-screen:** `--motion-ease-standard`
- **Spring:** `--motion-ease-spring` (reward moments only)

---

## Files to read first

1. **Onboarding / new component:** [`component-breakdown.md`](component-breakdown.md)
2. **Token values / palette:** [`design-tokens-codm.md`](design-tokens-codm.md) · [`design-tokens-fcm.md`](design-tokens-fcm.md)
3. **Typography / text styles:** [`typography.md`](typography.md)
4. **Motion:** [`motion-tokens.md`](motion-tokens.md)
5. **Multi-store / FCM:** [`multi-store-whitelabel.md`](multi-store-whitelabel.md) · [`fcm-components.md`](fcm-components.md)
6. **Sharing externally:** [`prototype-sharing-guide.md`](prototype-sharing-guide.md) · [`deploying-individual-stores.md`](deploying-individual-stores.md)
7. **Dev tooling:** [`command-console.md`](command-console.md) · [`comment-mode.md`](comment-mode.md) · [`session-tracking.md`](session-tracking.md) · [`token-dashboard.md`](token-dashboard.md)

---

## Related

- **Token source:** `src/tokens/ds/` (design system) + `src/tokens/` (motion)
- **Figma design:** COD:M v3 Tokens + SKU Card 3.0 (node 4957:8735)

---

### [`Handoff/.archive/`](Handoff/.archive/)

**Retired handoff artifacts — 7 interactive VitePress sites + the `_handoff-kit` scaffold tool that built them (archived 2026-09-12).**

These sites (`carousel-story-interaction`, `codm-sku-cards`, `bestseller-card-effects`, `sku-cards`, `codm-signin-motion`, `gamer-id-instruction`, plus the interactive-site half of `locale-selector-sheets`) had gone stale — most had drifted token names nobody caught, and the update mechanism that was supposed to keep them current had no way to warn about local edits before overwriting them. Rather than delete them, they're archived: the harness's own build tooling (`stage-handoff.mjs`) skips any dot-directory under `docs/Handoff/`, so nothing in here reaches a deployed build, an external scraper, or `llms.txt`. The channel for external handoff is now the in-app `/handoff` app (`src/handoff/`) — write a `*.flow.js` manifest per feature instead of scaffolding a new site.

**Read this to:** Recover an old demo's implementation for reference, or understand why these sites don't exist as a live channel anymore.

**Read `Handoff/.archive/README.md` first** — it has the full per-item breakdown, what (if anything) superseded each one, and the convention for archiving something new.

---

### [`Handoff/locale-selector-sheets/`](Handoff/locale-selector-sheets/)

**Spec for `RegionSelectorSheet` and `LanguageSelectorSheet` (both driven by `useLocale`) — flow-backed, live in the in-app `/handoff` app.**

Covers all 19 §2 states across the two sheets: the region sheet's search/typeahead behaviour, the always-visible search scrim, and both sheets' scroll-fade, plus the region→language reset rule and the RTL-visibility gate. `spec.md`/`spec.json` are generated from `src/handoff/flows/locale-selector-sheets.flow.js` (never hand-edit them — see `scripts/export-handoff.mjs`) and are drift-checked in CI. The interactive VitePress site this folder used to also contain has been retired to [`Handoff/.archive/locale-selector-sheets-site/`](.archive/locale-selector-sheets-site/); its RTL-active demo toggle and fixture dataset are only preserved there for reference now.

**Read this to:** Hand off the region/language switcher to a FE dev without repo access; verify a rebuild's state coverage and token mapping against the in-app `/handoff/locale-selector-sheets` oracle.

---

### [`v0.12.0`](../release-notes/v0.12.0.md)

**What changed in v0.12.0.**

Fixes three issues in the FCM checkout sheet: (1) the loyalty banner footer overlap was silently 0px since v0.10.0 due to a CSS specificity bug (`--checkout-loyalty-overlap` / `--shadow-checkout-footer` were in a plain `[data-theme]` block that lost to the later `extensions.css :root` by source order — moved to `html[data-theme]`); (2) `BestSellerCard` was passing only the numeric `amount` to `openCheckout`, so product names like "Daily Booster D" showed as "499" in the Order Summary; (3) checkout banner subtitle colour corrected to `--text-body-default`.

**Read this to:** Understand what's new in the latest release or catch up after a gap.

---

### [`v0.11.0`](../release-notes/v0.11.0.md)

**What changed in v0.11.0.**

Covers the Story Carousel interactive handoff site (live component demo, token sandbox, choreography timeline, easing viewer), the Handoff Kit (`_handoff-kit/` template + scaffold script + `TokenSandbox`/`BeatTimeline` primitives), migration of the carousel site onto the kit generics, and the new `web-store-interactive-handoff` AI skill.

---

### [`v0.10.0`](../release-notes/v0.10.0.md)

**What changed in v0.10.0.**

Covers the full FC Mobile whitelabel implementation: FCM theme tokens, six new FCM components (CategoryCatalog, FeaturedCarousel, SkuImageCard, BundleGrid, EaSignInPage, PageSignInSection), the four-composable multi-store architecture (useTheme, useStoreConfig, useStoreStrings, useStoreCatalog), the haptics system, DeviceToolbar store switcher, and payment channel asset reorganisation.

**Read this to:** Catch up on the v0.10.0 multi-store release.

---

Last updated: September 2026 · v0.116.0
