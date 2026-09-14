---
epic: ds-remediation
size: XL
status: in-progress
created: 2026-09-05 (approx, migrated 2026-09-12)
owner: unassigned
last-verified: 2026-09-13
---

> **Note 2026-09-13** — Phase 4 is now fully done (all 3 de-branching items, including the one found
> mid-phase). Phase 3 has been re-verified against current source: 3b (Grid gutters) turned out to
> already be tokenised; 3a and 3c are still open, at corrected file:line locations (`CheckoutSheet.vue`
> no longer exists — it split into `components/checkout/*` and `components/steps/*`). Neither Phase 3
> nor Phase 5 has been executed. Phase 5's gate ("visual QA: KONAMI page pixel-identical to
> pre-refactor") still has no mechanism behind it — `KonamiSignInPage` and `EaSignInPage` are two of
> only five components with no story, so no harness gate covers them at all. See
> [`plans/tickets/in-progress/harness-false-confidence.md`](./harness-false-confidence.md) item 4 and
> [`plans/tickets/in-progress/visual-capture-rig.md`](./visual-capture-rig.md).

# DS Remediation Plan — Phased Fixes

_Companion to [`ds-usage-audit.md`](../../../audits/ds-usage-audit.md) — note that audit file is
gitignored (local-only per `audits/*`), so the link resolves only on a machine that has already
run the DS audit; this plan file itself is committed._

_Migrated 2026-09-12 from the (gitignored) `audits/ds-remediation-plan.md` into the committed
`plans/` workflow — see [`plans/INDEX.md`](../../INDEX.md). Phase statuses below were inferred from a
quick grep against current source at migration time, not a full re-audit — verify before resuming
a phase marked done._

## How this is ordered

Phases ascend in **risk** and **dependency**, not severity. Each phase is **independently shippable**
and ends with a verification gate. Earlier phases are pure mechanical swaps (zero visual change);
later phases author new tokens or restructure.

| Phase | Theme | Risk | Visual change | New tokens? | Status |
|---|---|---|---|---|---|
| **1** | Mechanical token swaps | 🟢 none | none | no | ✅ done (verified: `SkuCard.vue` no longer has raw `font-size: 24px`) |
| **2** | Brand-token relocation | 🟢 low | none (if verbatim) | no | ✅ done (verified: no `--konami-`/`--ea-` left in `extensions.css`) |
| **3** | Off-scale values → new tokens | 🟡 med | none | yes | 🟡 re-verified 2026-09-13 — 3b turned out already done; 3a/3c still open at corrected locations (see phase notes) |
| **4** | Whitelabel de-branching | 🟡 med | none | no | ✅ all 3 items done 2026-09-13 (2 originally scoped + the `SignInSheet.vue:60` violation found while re-verifying) |
| **5** | eFootball semantic adoption (optional) | 🔴 high | risk of regression | yes | ❌ not started |

> **Core goal already met after Phase 2.** Phases 1–2 satisfy the stated requirement ("brand tokens
> live in the individual webstores; no raw literals where a token exists"). Phases 3–5 are quality
> hardening; Phase 5 is the optional full-tier refactor.

---

## Phase 1 — Mechanical token swaps (🟢 zero visual change)

Pure 1:1 replacements where a token with the **exact** value already exists. No decisions, no new
tokens. Safe to batch into one PR.

### 1a · Typography → `.text-style-*` classes
| File:line | From | To |
|---|---|---|
| `SkuCard.vue:294` | `font-size: 24px` | `.text-style-heading-sku-title` (verify FCM `html[data-theme]` override still lands on the token) |
| `CheckoutSheet.vue:441` | `font-weight: 700` | `.text-style-utility-default-bold` |
| `ClaimGiftSheet.vue:453` | `font-weight: 700` | `.text-style-utility-default-bold` |
| `PlayerAccount.vue:316` | `font-weight: 700` | `.text-style-utility-label-bold` |
| `CategoryBanner.vue:185` | `font-weight: 700` on `:deep(strong)` | **leave as-is**; add comment `/* DS has no standalone weight token — rich-text bold bump */` |

### 1b · Grid foundation — unambiguous values only
`Grid.vue` — the XS/S gutters and 12px margins map exactly. (M/L responsive gutters deferred to Phase 3.)
| File:line | From | To |
|---|---|---|
| `Grid.vue:29-30` | `column-gap: 8px; row-gap: 8px` | `--gap-grid-gutter` / `--gap-grid-row-default` |
| `Grid.vue:39` | `column-gap: 8px` | `--gap-grid-gutter` |
| `Grid.vue:31-32, 40-41, 49-50` | `padding-left/right: 12px` | `--gap-grid-margin` |

### 1c · Icon / control sizing → `--size-*`
Apply the full **icon/control sizing** table from the audit (all 🟠 rows): `24×24 → --size-icon-l`,
`20×20 → --size-icon-m`, `16 → --size-icon-s`, `12 → --size-icon-xs`, `32×32 → --size-control-s`,
`40 → --size-input-m`, `96×96 → --size-img-xxl`, `64×64 → --size-img-xl`, chip `height:24 → --size-chip-height`.
Files: `NavBar`, `CheckoutSheet`, `SignInSheet`, `AccountPopover`, `NavDrawer`, `FeaturedCarousel`, `CategoryBanner`.
(Skip the ⚪ off-scale rows — those go to Phase 3.)

### 1d · Stray spacing
| File:line | From | To |
|---|---|---|
| `SignInLoader.vue:205` | `padding: 4px` | `--pad-surface-xs` |

**Gate:** `vite build` passes · visual QA (`codm-web-store-qa`) shows **no pixel diff** on all frames ·
re-run sizing/spacing greps — Phase-1 rows gone.

---

## Phase 2 — Brand-token relocation (🟢 visually neutral)

Move store-specific palettes out of the shared `extensions.css` into their theme files. **Verbatim
move** — same token names, same values, just a different file. Components are untouched, so there is
no visual change. This is the minimal fix that satisfies "brand tokens live in the store theme."

### 2a · FCM
- Cut the `--ea-*` block (12 tokens) from `extensions.css` → paste into `themes/fcm.css`.
- Per skill §3: if any `--ea-*` token name collides with a `:root` structural token (it doesn't —
  they're a private namespace), use `html[data-theme="fcm"]`; otherwise a plain `[data-theme="fcm"]`
  block is fine since these are the only declarations.

### 2b · eFootball
- Cut the `--konami-*` block (17 tokens) from `extensions.css` → paste into `themes/efootball.css`.
- Same selector rule as 2a.

### 2c · EA Apple button literal
| File:line | From | To |
|---|---|---|
| `EaSignInPage.vue:247` | `background: #1c1c1e` | `var(--brand-apple)` (token already exists) |

**Gate:** `grep -rnE "^\s*--(konami|ea)-" src/tokens/ds/extensions.css` → **empty** · `vite build` passes ·
visual QA: KONAMI + EA sign-in pages render identically · theme-switch still reskins every store.

---

## Phase 3 — Off-scale values → new tokens (🟡 needs authoring + Figma check)

> **Re-verified against current source 2026-09-13** (this phase had sat at "❓ unverified" since the
> 2026-09-12 migration). File:line references below are corrected — several moved since this plan
> was written, and one file this phase names no longer exists at all. **No tokens were authored in
> this pass** — this is a status correction only, so the decision to actually author Phase 3's
> tokens remains a separate, deliberate step.

### 3a · Carousel scroll-clip buffer (decided) — still open, unchanged
- Add to `extensions.css` (no DS slot — it's overflow-clip clearance for the running-border/lift):
  `--motion-scroll-clip-buffer: 6px;`
- Swap `FeaturedCarousel.vue:151` and `BestSellerCarousel.vue:228` `padding-block: 6px` → the token.
- Confirmed: both lines are unchanged, values and locations still exactly as written.

### 3b · Grid responsive gutters — ✅ already done, not just unverified
`Grid.vue` no longer has ANY raw px column-gap/padding at any breakpoint — XS/S use
`--x-gap-grid-gutter`/`--x-gap-grid-margin`, M uses `--x-gap-grid-gutter-m` (space.css:134), and the
L tier (`--x-gap-grid-gutter-l`/`--x-gap-grid-margin-l`, space.css:134-135, with a real Codashop
override at `themes/codashop.css:264-265`) is fully tokenised. This phase's mechanical swap already
happened at some point after this plan was written — Option B (dedicated `--gap-grid-*` tokens, the
plan's own recommendation) is exactly what shipped.

**New finding, not a Phase-3 item — a docs/implementation mismatch, not a token gap:**
`Grid.vue`'s own docblock (line 14) claims an L breakpoint (`≥1280px`) that `Grid.vue` itself does
not implement — its `<style>` only has XS/S (line 54) and M (line 63) `@container` rules, nothing at
1280px. The L-tier tokens ARE real and consumed, just not by `Grid.vue`: `App.vue:2481-2489`'s
`.storefront--split` (the split-layout shell, not the `Grid` component) is the only consumer of
`--x-gap-grid-gutter-l`/`--x-gap-grid-margin-l`. So a plain (non-split) `Grid` never breaks past its
M-tier column count/gutter above 801px — possibly intentional (M might be meant to scale
indefinitely), possibly a real gap depending on what the M tier was supposed to cap at. Flagging
for a decision, not fixing here — out of scope for a status re-verification.

### 3c · Off-scale sizing triage (Figma check) — still open; `CheckoutSheet.vue` no longer exists
The plan's file references predate a restructuring: `CheckoutSheet.vue` was split into
`components/checkout/*.vue` and `components/steps/*.vue` sometime after this plan was written.
Corrected locations, all still raw (none tokenised yet):
- `SkuImageCard.vue:753-754` (14px) — was `:456-457`
- `NavBar.vue:739-740` (30px avatar) — was `:274-275`
- `components/steps/PaymentStepBody.vue:424` (44px, `.promo-modal__close` height) — was
  `CheckoutSheet.vue:646`
- `components/checkout/PcCard.vue:86` (72px, `.pc-card__logo` width) — was `CheckoutSheet.vue:517-518`
- `components/steps/CheckoutStepBody.vue:212` (80px, `.sheet__banner` height, has a load-bearing
  flex-shrink comment attached — read that comment before touching this one) — was
  `CheckoutSheet.vue:385`
- `components/steps/CheckoutStepBody.vue:368` (72px) — already carries an inline
  `/* Phase 3 — off-scale, pending Figma check */` comment, so this one specific value survived the
  file split with its Phase-3 provenance intact; the others did not get an equivalent comment
- `GiftSkuCard.vue:262-263` (160px), `BundleSkuCard.vue:343-344` (160px), `BundleSkuCard.vue:316`
  (184px) — was `BundleSkuCard.vue:274`
- `KonamiSignInPage.vue:168` (56px back-btn clearance) — was `:169`, one line off

**Gate:** `vite build` · visual QA no diff · grep: remaining raw px are only documented off-scale one-offs.

---

## Phase 4 — Whitelabel de-branching (🟡 logic change) — ✅ the 2 planned fixes done 2026-09-13

Remove `theme/flow === '<store>'` branches; key off capability/asset presence instead (whitelabel
golden rule: no component tests the store name).

| File:line | From | To |
|---|---|---|
| `SignInSheet.vue:122` | `:src="flow === 'efootball' ? (assets.brand.signinLogomark ?? assets.brand.logomark) : assets.brand.logomark"` | `:src="assets.brand.signinLogomark ?? assets.brand.logomark"` — the `??` already yields `logomark` when no signin variant exists, so the branch is redundant |
| `PageSignInSection.vue:43` | `if (flow === 'efootball') return assets.value.brand.signinLogomark ?? …` | drop the `flow` test; return `assets.value.brand.signinLogomark ?? assets.value.brand.logomark` unconditionally |

**Gate:** `grep -rnE "(theme\|flow)\s*===\s*['\"](codm\|fcm\|efootball\|tdr\|ygodl)" src/components/` →
only the excluded dev-chrome hit (`DeviceToolbar.vue:96`) remains · visual QA: eFootball sign-in
logomark unchanged; other stores unaffected (they have no `signinLogomark`, fall through to `logomark`).

**Both applied — verified, not just asserted.** Before applying, re-checked the safety premise
against CURRENT source rather than trusting the plan's own wording (which had gone stale — see the
migration-note caveat at the top of this file): 7 more stores now define `signinLogomark`
(`diabloimmortal`, `roguetrader`, `mgsse`, `ygomd`, `ygodl`, `zzz`, `tdr`) than when this plan was
written, not just eFootball as the table's prose claims. Checked each one's actual value —
every one of them is `signinLogomark: logomark` (a literal alias to the same asset), so the "??"
fallback still resolves identically for all of them; the fix is still zero-visual-change, just not
for the stale reason originally written. `vite build --mode codm` passes;
`harness test SignInSheet` passes (0 failures, 12/12 themes).

**Gate re-run surfaced two things the original scoping didn't know**:
1. `DeviceToolbar.vue:96`'s excluded hit is **gone** — that component no longer branches on
   `theme`/`flow` at all (refactored since this plan was written). One fewer violation than
   expected, not a problem.
2. A **new, previously undocumented violation, now fixed — 2026-09-13**: `SignInSheet.vue:60`'s
   `labelStyleForFlow()` — `flow === 'codm' ? 'text-style-utility-default-uppercase' :
   'text-style-utility-default-regular'` — read like a COD:M-specific label-casing choice hardcoded
   by store name. Traced before fixing: 6 *other* stores (`mgsse`, `roguetrader`, `diabloimmortal`,
   `codashop`, `zzz`, `tdr`) also set `signIn.flow: 'codm'` as an unused placeholder value (every
   one of them hides this button entirely via `navbar.hideSignIn`), so the check only ever actually
   fired for the real COD:M store — a disguised store-identity branch, not a real per-flow
   distinction. Fixed with the `config.chrome.*`-style capability flag this note called for:
   `signIn.ctaCasing: 'uppercase'` added to `codm/store.js` only; `SignInSheet.vue` now reads
   `config.value.signIn.ctaCasing` (defaulting to regular) instead of branching on `flow`, and the
   `labelStyleForFlow(flow)` function was replaced with a plain `ctaLabelStyle` computed since the
   casing was never really per-flow to begin with. Verified zero visual change: `harness test
   SignInSheet` (12/12 themes) and `harness:render SignInSheet` (6/6 renders) both pass, and live in
   the browser COD:M's CTA is still uppercase, FCM's EA-redirect flow is unaffected.

---

## Phase 5 — eFootball semantic adoption (🔴 optional, the full-tier refactor)

Highest effort, highest regression risk. Makes `KonamiSignInPage` consume the **semantic** tier
instead of the `--konami-*` namespace, so it reskins like every other component. Do only after 1–4
are shipped and stable. Scope this to its own PR with careful before/after QA.

1. **Scoped semantic overrides** (resolves the audit's open decision): wrap the page in `.konami-page`
   and repoint the generic semantics for that subtree only — so the light KONAMI surface does **not**
   flip the dark eFootball store. Define in `themes/efootball.css` under `html[data-theme="efootball"] .konami-page { … }`.
2. **Brand chain for red + link-blue**: seed `--ref-…` → spectrum `--palette-…` → `--sys-colour-…` →
   semantic, all in `themes/efootball.css`.
3. **Swap component** to semantic tokens per the audit's KONAMI mapping table (`--bg-page`,
   `--bg-card-default`, `--bg-input-default`, `--border-divider`, `--text-header-default`,
   `--text-body-subtle`, `--bg-action-primary`, `--bg-action-inverse`, `--text-hyperlink-default`, …).
4. **Inline literals** `KonamiSignInPage.vue:160,272,307` → tokens (ghost-hover + `--text-…-inverse`).
5. **Raw type**: add `.text-style-brand-wordmark` to `text-styles.css` for the logo wordmark
   (`:173-180`); drop the heading's raw type (`:218-225`) and let `.text-style-heading-modal` win.
6. **Retire `--konami-*`** once nothing references it.

> Optional sibling: the equivalent EA refactor for `EaSignInPage` (currently an accepted exception).

**Gate:** all six component grep gates clean (excluding dev chrome) · `grep "--konami-" src/` empty ·
`vite build` · visual QA: KONAMI page pixel-identical to pre-refactor; theme-switch reskins; the rest
of eFootball stays dark.

---

## Parked — accepted exceptions (no action)

- `CategoryBanner.vue:185` rich-text `:deep(strong)` weight (commented in Phase 1a).
- `EaSignInPage.vue` consuming `--ea-*` directly + SVG logo fills — accepted (Phase 5 optional).
- Dev/handoff chrome: `InspectorPanel`, `InspectorOverlay`, `DeviceFrame`, `DeviceToolbar` (incl. its
  `theme === 'codm'` branch) — prototype instrumentation, out of scope.
- Layout `max-width` / breakpoint constraints (`Span`, `NavDrawer`, `AccountPopover`, sheets) — no
  size-token equivalent by design.

---

## Suggested sequencing

```
PR 1  → Phase 1   (mechanical swaps; merge-and-forget)
PR 2  → Phase 2   (relocation; verbatim move)
PR 3  → Phase 3   (new tokens; 1 Figma sync for 3b/3c)
PR 4  → Phase 4   (de-branching)
PR 5  → Phase 5   (optional; schedule separately)
```
