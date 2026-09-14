# AGENTS.md scaffold

Write this to `docs/Handoff/<feature>/AGENTS.md`. **Hard cap: 60 lines.** It is
auto-loaded into every agent turn in this directory (Cursor, Claude Code, Codex),
so every line costs context on every request. Detail belongs in `README.md`; this
file only routes and constrains.

Copy everything below the rule, replacing the placeholders.

---

# <Feature> — agent instructions

<One sentence: what this feature is.> Full spec: [`README.md`](./README.md).

## The prototype is a reference, not a target

This spec came from a Vue 3 prototype that is **not 1:1** with this codebase. Do
not copy `.vue` files, composables, or file layout from it. Reproduce two things
in this stack:

1. **The state machine** — README §2. Every state, transition, and edge case.
2. **The token contract** — README §3. Every value by semantic role.

Tables in §2 and §3 are normative. Quoted CSS and ASCII diagrams are illustrative.

## Read order

1. `<the authoring skill/rules for this codebase>` — how components are built here.
   (Fill this in once when adopting this handoff — the prototype side can't know it.)
2. README §0 (brief) → §2 (states) → §3 (tokens).
3. Your assigned task in README §8.
4. README §10 before reporting done.

## Hard rules

- Implement **every** state in §2 — a missing state is an incomplete task.
- Map every value to a semantic token in **this** repo via §3. Never hardcode a
  resolved literal.
- No token for a role? **Add one.** Never substitute a visually-close token.
- Type comes from a type style — never raw `font-size` / `font-weight` /
  `letter-spacing`. Condense in §3.2 is part of the spec.
- Motion: `transform` / `opacity` only; longhand `transition-*` when the easing
  token contains commas; timing constants in one module, never inline.
- Do not port prototype-only scaffolding (demo data, device frame, motion shims).

## When something is missing

If a value or behaviour is not in §2/§3: grep the reference file cited in that
section. Still absent → it is a README §11 open question. **Stop and ask a human.**
Never infer a colour, duration, or behaviour.

## Done means

- Every state in the task's `Covers states:` list is reachable and matches the
  reference (demo: `<demo_url or "see README §10.2">`).
- §10.3 token-mapping table filled in for every value touched.
- §10.4 behavioural, keyboard, and reduced-motion checks pass.
- Report results as the §10 checklist — not a prose summary.
