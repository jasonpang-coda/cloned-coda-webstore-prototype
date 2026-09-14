# Token reconciliation with prod — per-store change log

**Branch:** `refactor/token-reconcile-prod-x-prefix`
**Plan:** `~/.claude/plans/i-want-to-refactor-jaunty-dove.md`

## What changed, in brief

1. **`--x-` prefix.** Every DS-owned custom property — `--ref-*`, `--palette-*`, `--sys-*`,
   `--bg-*`, `--text-*`, `--border-*` (except `--border-weight-*`, kept bare to match prod),
   `--pad-*`, `--gap-*`, `--radius-*`, `--size-*`, `--motion-*`, `--blur-*`, `--hdr-*`, and the
   brand/extension tokens (`--fx-*`, `--shadow-*`, `--rarity-*`, `--konami-*`, `--ea-*`, etc.) —
   was renamed to `--x-…`, in both its definition and every consumer. ~5,470 occurrences across
   ~130 files (all of `src/tokens/ds/*`, all 11 `themes/*.css`, `src/tokens/motion*.css`,
   `effects.css`, `keyframes.css`, and every consuming `.vue`/`.js`). One dynamic template-literal
   reference (`Thumbnail.vue`'s `` `var(--size-img-${size})` ``) needed a manual fix since the
   static rename can't see through string interpolation.
2. **One rename:** `--text-text-on-brand` → `--x-text-on-brand` (drops the doubled `text-`,
   matches prod).
3. **New tokens added** (interactive-state, accent/shadow-colour roles, misc slots) — see the
   plan for the full list. All default to values appropriate for a **dark** surface (this repo's
   reference store, COD:M, is dark); light stores override in their own theme file.
4. **Runtime-set / component-local CSS vars left untouched** (not design tokens): `--px`, `--py`,
   `--bloom-progress` (JS-driven animation state, `TitleCard.vue`/`TitleGrid.vue`), `--flag-tile-w`,
   `--home-steps-icon-url`, `--toolbar-h`, `--navbar-h`, `--safe-top` (all layout/instance values
   set via `:style` bindings). Haptics (`src/tokens/haptics.js`) are JS data, not CSS custom
   properties, and were **not** given prod's parallel `--x-haptic-*` CSS tokens — this repo's
   haptic system is JS-driven end to end and those tokens would have no consumer.

## Per-store table

Legend: 🟢 no action needed · 🟡 pre-existing/cosmetic gap, flagged not fixed · 🔴 fixed in this branch

| Store | `data-theme` | Mode | Prefix rename | New-token fit | Status |
|---|---|---|---|---|---|
| **COD:M** | `codm` | dark (reference) | ✅ all tokens → `--x-` | System defaults *are* COD:M's values — no override needed by construction. | 🟢 |
| **Codashop** | `codashop` | **light** (white L1–L3 cards, dark-purple page; ink fully inverted) | ✅ all tokens → `--x-` | New `--bg-sku-card-hover/-pressed/-focused`, `--bg-input-disabled`, `--border-input-disabled` all resolved through `--sys-colour-neutral-subtle/-soft` (the *dark* end of the ramp — nothing repoints it for a light store) → would have rendered as a dark-purple smudge inside a white card. **Fixed**: added an explicit override block in `themes/codashop.css` repointing those five semantics to light `--palette-neutral-50/100/200` steps, matching the L1–L3 remap already in the file. `--border-popover`/`--border-player-card` (new) inherit `--border-divider`, which was **already** unrepointed for light before this change — pre-existing gap, not introduced here, left as-is (out of scope; would need its own pass since `--border-divider` has other consumers). `--border-action-hover/-focused/-pressed` (primary-400/300, light lavender) will read low-contrast on white cards — cosmetic, not broken. | 🔴 (sku-card/input fixed) 🟡 (border-popover/player-card, border-action-hover contrast) |
| **eFootball** | `efootball` | dark (deep-blue #000096 page) | ✅ all tokens → `--x-` | Neutral ramp is blue-tinted, so new sku-card hover/pressed/focused come out dark-blue — consistent with the page hue, no clash. **Flag**: eFootball's own SKU-card default fill is a translucent 60%-alpha L2 gradient; the new hover/pressed fall back to a flat opaque neutral-950/900, producing a visible glass→solid seam on interaction. Worth a design pass, not a functional break. `--border-action-hover/-pressed` (overridden primary-200/100, pale yellow) fine. | 🟡 (hover/pressed seam vs. glass SKU card) |
| **FCM** | `fcm` | dark (near-black page) | ✅ all tokens → `--x-`; `--text-text-on-brand`→`--x-text-on-brand` | FCM's heavy dual-layer L1–L3 gradient system doesn't touch neutral-subtle/-soft, so new sku-card hover/pressed/focused resolve to a flat solid dark grey instead of the composited gradient fill — a visible "flattening" next to FCM's otherwise crafted surfaces. `--border-action-hover/-pressed` (unmodified primary-400/300, FC-green) is on-brand and fine. | 🟡 (sku-card hover/pressed flattens FCM's gradient fill — most likely store to need a bespoke follow-up) |
| **MCOC** | `mcoc` | dark, near-true-grey neutral | ✅ all tokens → `--x-` | No L1/L2/L3 overrides exist at all, so every new token falls straight to system.css defaults with zero clash. `--border-action-hover/-pressed` (primary-400/300, acid-lime) reinforces MCOC's signature glow motif. | 🟢 |
| **MGSSE** | `mgsse` | dark, deliberately achromatic (C=0) neutral | ✅ all tokens → `--x-` | Full L1–L3 overrides give every surface a green hairline; new sku-card hover/pressed/focused fall through to the un-retinted achromatic neutral-950/900 — a plain grey box next to every other surface's green-tinted treatment. **Flag** for a designer retint (e.g. mix in `--ref-primary` faintly) to match the military-green brand motif. `--border-action-hover/-pressed` fine (field-green). | 🟡 (sku-card hover/pressed reads as plain grey, off-brand) |
| **PvZ3** | `pvz3` | dark **scaffold/placeholder** — not brand-verified; file's own TODO says the real brand may end up light/candy-colored | ✅ all tokens → `--x-` | No semantic overrides exist yet, so all new tokens fall through cleanly today — no active bug. **Forward flag**: if/when PvZ3 is retuned to a light surface, it will hit the exact same class of bug Codashop had (neutral-subtle/-soft not repointed) — address together with that future brand pass. | 🟢 (today) / 🟡 (future light retune) |
| **Rogue Trader** | `roguetrader` | dark, warm gold-tinted neutral, gilded L1–L3 | ✅ all tokens → `--x-` | New sku-card hover/pressed/focused fall through to the still-warm (un-retinted) neutral-950/900 — harmonious hue-wise with the gilded aesthetic, but reads as a flat fill next to the neighboring gradient/gilded borders (minor "flat vs ornate" seam, not a colour clash). `--border-action-hover/-pressed` fine. | 🟡 (minor flat-vs-ornate seam) |
| **TDR** | `tdr` | dark, cold gunmetal neutral (closest structural analog to COD:M) | ✅ all tokens → `--x-` | New sku-card hover/pressed/focused land on cold-gunmetal tones consistent with TDR's own L1–L3 overrides (built from the same palette-neutral-800/200 steps) — no clash. `--border-action-hover/-pressed` (primary-400/300, SHD-orange) correct against the near-black page. Lowest-risk of the non-reference dark stores. | 🟢 |
| **YGO Duel Links** | `ygodl` | dark, cold-navy neutral; L1→L3 fill scale is **inverted** vs. every other store (L1 darkest, L3 lightest) | ✅ all tokens → `--x-` | New sku-card hover(950)/pressed(soft/900) still land on cold-navy dark tones consistent with the page — no colour clash — but **double-check against the inverted L-convention during QA**, since it's the one place a "reverse" assumption could silently creep in for any future token that piggybacks on L-fills. `--border-action-hover/-pressed` (primary-400/300, electric-blue) read well. | 🟡 (verify against inverted L-convention during QA) |
| **YGO Master Duel** | `ygomd` | dark, violet-tinted near-black neutral (H≈279°, deliberate), flat L1–L3 fills + thin gold hairline | ✅ all tokens → `--x-` | New sku-card hover/pressed/focused fall through to the violet-tinted neutral-950/900 — consistent with the flat, violet-black container language already used throughout; no clash. `--border-action-hover/-pressed` (primary-400/300, pale Millennium-gold) reinforces the "arcane relic" motif well. | 🟢 |

## Follow-ups intentionally left open (not blockers for this branch)

- **Codashop** — `--border-popover`/`--border-player-card` (new) inherit a pre-existing gap in
  `--border-divider` (never repointed for the light store). Fix as part of a `--border-divider`
  pass, since it has other consumers beyond these two new tokens.
- **FCM** — new SKU-card hover/pressed/focused flatten what is otherwise a two-gradient composited
  fill; consider a bespoke override once there's design sign-off on the exact hover treatment.
- **eFootball** — same "flat vs. glass" seam as FCM, smaller in degree (its default fill is already
  a translucent gradient).
- **MGSSE** — sku-card hover/pressed/focused should probably pick up a faint green tint to match
  every other surface's hairline treatment.
- **Rogue Trader** — sku-card hover/pressed/focused could pick up the gilded gradient treatment
  used elsewhere in the theme, purely cosmetic.
- **PvZ3** — currently a scaffold; revisit interactive-state tokens together with its eventual
  real-brand (possibly light) pass.
- **YGO Duel Links** — no known bug, but its inverted L1↔L3 convention is the one place to
  double-check visually during QA.

## Verification performed

- `node_modules/.bin/vite build` — passes.
- Grep sweep for stray unprefixed token reads across `src/` — clean except the
  `--border-weight-*` exception (by design) and pre-existing debt unrelated to this refactor
  (documented in the review, not introduced by it — e.g. `NavBar.vue:657` already read a sys
  token directly before this change).
- Token-discipline grep gates (`web-store-tokens` §6) run against `src/components/` — no new
  violations introduced by this refactor.
- Full per-store audit (this table) — read every `themes/*.css` file and checked how each new
  token resolves given that store's existing neutral-ramp tinting and surface overrides.

## Still to do before merge

Browser preview was **not available in this sandbox** (`localhost` navigation was blocked by the
environment's policy check) — verification here was build + static-analysis only. Before merging:

- Run `npm run dev` locally and visually QA at least: `codm` (dark reference), `codashop` (light,
  the one active fix), and `fcm` (heaviest override block) — confirm action hover/pressed,
  sku-card hover/pressed/focused, input disabled, and the new accent/shadow-colour roles render
  with real colours, not fallbacks.
- Sweep `?theme=<key>` through all 11 stores to catch any remaining visual regression from the
  rename itself (not just the new tokens), and confirm the Codashop fix actually reads as a light
  hover/pressed/disabled state on a white SKU card (not just resolves without error).
