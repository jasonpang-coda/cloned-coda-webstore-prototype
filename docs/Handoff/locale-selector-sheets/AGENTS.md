# Language & Region Selector Sheets — agent instructions

Two sibling overlay sheets (region picker + language picker) sharing one
state singleton. Full spec: [`README.md`](./README.md).

## The prototype is a reference, not a target

This spec came from a Vue 3 prototype that is **not 1:1** with this codebase. Do
not copy `.vue` files, composables, or file layout from it. Reproduce two things
in this stack:

1. **The state machine** — README §2. Every state, transition, and edge case.
2. **The token contract** — README §3. Every value by semantic role.

Tables in §2 and §3 are normative. Quoted CSS and ASCII diagrams are illustrative.

## Read order

1. This codebase's own UI/component authoring rules — how components,
   overlays, and design tokens work here. (Fill in this line once you know
   the target stack; the prototype side can't know it.)
2. README §0 (brief) → §2 (states) → §3 (tokens).
3. Your assigned task in README §8.
4. README §10 before reporting done.

## Hard rules

- Implement **every** state in §2.1 and §2.2 — a missing state is an incomplete task.
- Map every value to a semantic token in **this** repo via §3. Never hardcode a
  resolved literal.
- No token for a role? **Add one.** Never substitute a visually-close token.
- Type comes from a type style — never raw `font-size` / `font-weight` /
  `letter-spacing`. Condense in §3.2 is part of the spec (headings condense,
  body/utility text does not).
- Motion: `transform` / `opacity` only; longhand `transition-*` when the easing
  token contains commas; no timing constants inline in a component.
- Keep the region→language reset rule and the RTL-gating rules (README §5,
  §2.1.d, §2.2.d) — they are behaviour, easy to drop silently.
- Do not port prototype-only scaffolding (demo data, device frame, motion shims).

## When something is missing

If a value or behaviour is not in §2/§3: grep the reference file cited in that
section. Still absent → it is a README §11 open question. **Stop and ask a
human.** Never infer a colour, duration, or behaviour.

## Done means

- Every state in the task's `Covers states:` list is reachable and matches the
  reference (see README §10.2 — no interactive demo site exists for this
  feature yet).
- §10.3 token-mapping table filled in for every value touched.
- §10.4 behavioural, keyboard, and reduced-motion checks pass.
- Report results as the §10 checklist — not a prose summary.
