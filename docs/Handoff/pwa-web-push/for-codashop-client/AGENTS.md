# PWA Install + Web Push — agent instructions

Install-to-home-screen (Android native prompt / iOS instruction sheet) and the post-install web-push opt-in, across 5 install surfaces and 4 general push surfaces (Gifts banner, story slide, Order Complete bar, nav drawer) — a task-gated 5th entry point (TaskGiftSheet) belongs to a separate reward-gift flow.

## The prototype is a reference, not a target

This spec came from a Vue 3 prototype that is **not 1:1** with this codebase. Do
not copy `.vue` files or file layout from it — every component this feature touches
already has a counterpart here (see `file-map.md`). Reproduce two things:

1. **The state machine** — `spec.md` §2/§3 (states, transitions) and, if present,
   §Integration contract (the platform behaviour the UI must react to).
2. **The token contract** — `tokens.md`. Every value by semantic role, already
   cross-referenced against this repo's real tokens.

## Read order

1. This repo's own conventions first: `AGENTS.md`, `.cursor/rules/*.mdc`,
   `.agents/skills/`, `skills/figma-implement-design/SKILL.md` — they take
   precedence over anything in this bundle.
2. `house-rules.md` in this folder — the subset of the above that specifically
   applies to this feature, cited to source.
3. `file-map.md` — which existing file to edit for each component.
4. `tokens.md` — the token crosswalk. Every `NEW_SEMANTIC` row is gated (see below).
5. `spec.md` — states, transitions, choreography, integration contract.

## Hard rules

- Modify the existing components named in `file-map.md`. Do not create new `.vue`
  files without explicit permission (`skills/figma-implement-design/SKILL.md`).
- Verify every token against `tokens.md` before writing styles — this repo's own
  convention, restated here because it matters most on a cross-codebase handoff.
- 3 token(s) in `tokens.md` are marked **NEW_SEMANTIC (gated)** —
  this repo's semantic token tiers are a closed set (matches this prototype's own
  `web-store-tokens` §2b rule). Do not add them unsupervised. Use the listed
  fallback until the design-system owner signs off.
- All user-facing copy goes through i18n — see `.agents/skills/add-translations`.
  `file-map.md` lists the i18n key prefix each surface should use.
- Gate any pilot behaviour with `isSiteFeatureOn()`, never a tenant-name check
  (`isEa*`/`isCodm*`) — this repo's `AGENTS.md` rule.
- Do not port prototype-only scaffolding (see `spec.md`'s "prototype-only" list) —
  it exists purely to make the feature demoable without a backend.

## When something is missing

If a value or behaviour is not in `spec.md` or `tokens.md`: check the open
questions listed in `spec.md` §7. Still unresolved → **stop and ask a human**.
Never infer a colour, duration, endpoint shape, or behaviour.
