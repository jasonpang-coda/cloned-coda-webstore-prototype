# Best Seller Card Effects — agent instructions

The running-border ring, breathing bloom, metallic shimmer, and mount entrance on
COD:M's `BestSellerCard`. Full spec: [`README.md`](./README.md).

## The prototype is a reference, not a target

This spec came from a Vue 3 prototype that is **not 1:1** with this codebase. Do
not copy `.vue` files, composables, or file layout from it. Reproduce two things
in this stack:

1. **The state machine** — README §2. Seven states: `hero-default`,
   `hero-selected`, `compact-default`, `compact-selected` (§2.1), plus
   `mount-pending`, `entering`, `settled` (§2.2, the one-shot entrance).
2. **The token contract** — README §3. Every value by semantic role.

Tables in §2 and §3 are normative. Quoted CSS and ASCII diagrams are illustrative.

## Read order

1. `codm-web-store-fe` skill (or this repo's equivalent authoring rules) — how
   effects/tokens are built here.
2. README §0 (brief) → §2 (states) → §3 (tokens).
3. Your assigned task in README §8.
4. README §10 before reporting done.

## Hard rules

- Implement all seven §2 states (four in §2.1, three in §2.2) —
  `compact-selected`'s correct behaviour is showing **no ring artifact at all**;
  don't skip it or "fix" it into showing one.
- Map every colour to a token via §3.1 — never hardcode `--hdr-glow`/`--hdr-hot`;
  they're brand-overridable, aliased per store to `--palette-*`/`--ref-*`.
- HDR-boosted variants derive `from` that same source token via relative colour
  syntax, never `from` the effect token itself (a self-reference cycle) — §3.1.
- Ring and shimmer are mutually exclusive by construction — never render both on
  one card.
- Do not "correct" the ring's `1.5px` width without reading README §11 first —
  still open. (The shimmer's duration/easing/opacity are already tokenized.)
- The ring/bloom/shimmer never wait for the mount entrance to finish — they start
  their own infinite loops immediately on mount, unsynchronized with it.
- `SkuCard`/`SkuImageCard` get a secondary price-reveal delay elsewhere in the
  codebase; `BestSellerCard` does not — don't add one here.
- Motion: `transform`/`opacity` (or an animatable custom property for the ring's
  `--angle`) only; timing constants in one module, never inline.
- Do not port prototype-only scaffolding (demo data, device frame, motion shims).

## When something is missing

If a value or behaviour is not in §2/§3: grep the reference file cited in that
section. Still absent → it is a README §11 open question — none currently open
are blocking, so build against the documented current behaviour while resolved.

## Done means

- Every state in the task's `Covers states:` list is reachable and matches the
  reference (README §10.2 — the interactive `playground.md` demo, or the local prototype).
- §10.3 token-mapping table filled in for every value touched.
- §10.4 behavioural and reduced-motion checks pass.
- Report results as the §10 checklist — not a prose summary.
