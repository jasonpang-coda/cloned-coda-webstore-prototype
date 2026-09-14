---
epic: harness-design-quality
size: XL
status: in-progress
created: 2026-09-12
owner: unassigned
last-verified: 2026-09-13
---

# Remove False Confidence — dead fields, placeholder bridges, spec noise (Plan 6)

_From the 2026-09-12 product-design assessment of the harness — see
[`plans/INDEX.md`](../../INDEX.md). Items 1, 3 done and item 4 closed as "won't do" 2026-09-13 — item 2
is the only one still open._

## Context

The `design-harness` skill's governing principle is that a check which structurally cannot fail is
worse than no check, because it manufactures confidence. The same principle applies to a **schema
field nobody fills** and a **bridge that emits placeholders** — both read as coverage that does
not exist. Four instances, all small, all independent. None changes behaviour; each removes a lie
about coverage.

Related: the contrast claim in `tools/harness-cli.mjs:7` is the same class of problem but has a
real gate attached to it — tracked in
[`plans/tickets/done/design-quality-gates.md`](../done/design-quality-gates.md) Gate 1, not here.

---

## 1. `motionBeats` is a dead field — ✅ deleted 2026-09-13

- Declared in `defineStory`'s defaults (`src/library/story.js:66`).
- Authored in **0 of 86** stories.
- Consumed by **0** tools (the only hit in the entire repo is the default itself).

Meanwhile there is a full authoritative `web-store-motion` skill and a complete motion-token tier,
and the harness verifies only that motion *tokens resolve* — nothing about the motion itself.

**Decided (b): deleted the field.** Authoring real motion timelines for ~10 components (option a)
is a genuine content-authoring task, not a cleanup — out of proportion for "remove a dead field."
The field carried no JSDoc entry either (unlike every other field on `Story`), confirming it was
never actually documented/adopted, just declared. Nothing else referenced it, so removal was a
single-line change with no follow-on edits needed.

## 2. The Figma Code Connect bridge emits placeholders

`docs/figma-code-connect/mappings.json` has an entry per story, but:

- `figmaNodeId` is set in **0 of 86** stories, so every entry carries the synthetic fallback from
  `tools/figma-sync.mjs:54` — `figma://node/<slug>` — which resolves to nothing.
- Every entry carries `storyUrl: "http://localhost:5173/?library=<slug>"`, which does nothing:
  the real deep link is `#library` (`src/library/useLibrary.js:27`), and per-story addressing
  doesn't exist yet at all.

So the file reads as a working design↔code bridge and is decorative.

**Do:** populate real node ids for the components that actually have Figma counterparts and emit
correct URLs (depends on [`plans/tickets/done/library-viewer-ux.md`](../done/library-viewer-ux.md) item 1) — or stop
generating the file until there is something real to put in it.

## 3. Handoff spec token tables are mostly noise — ✅ done 2026-09-13

`docs/Handoff/components/<slug>/spec.md` renders a 12-column store table for every token. Most
rows are identical across all 12 (`--x-pad-surface-m` is `12px` twelve times). The signal a reader
actually wants — **which tokens differ per store** — is buried.

`tokenTable()` in `scripts/export-handoff.mjs` now splits into a "Same value at every store" flat
list and a "Diverges per store" section that keeps the full N-column table only for tokens that
actually differ. Shared by both flow-mode and story-mode specs (one implementation, not two), so
every spec under `docs/Handoff/` was regenerated, not just component ones. Verified on
`sku-card/spec.md`: 21 of 27 tokens collapsed to the flat list, only the genuinely divergent 6 kept
the full table. `--verify` passes clean in both modes; locking test in
`tests/export-handoff.test.mjs` grounds the split in two REAL tokens with known uniform/divergent
behavior (`--x-pad-surface-m`, `--x-radius-container-s`), not synthetic mock values.

## 4. The un-storied components are the ones with the most debt — ❌ decided against, 2026-09-13

5 of 71 components have no story:

- `CommandConsole`, `DeviceFrame`, `DeviceToolbar` — dev chrome, correctly out of scope.
- **`EaSignInPage`, `KonamiSignInPage`** — precisely the two files
  [`plans/tickets/in-progress/ds-remediation.md`](./ds-remediation.md) names as the worst token offenders (Phase 2c,
  and the whole of the 🔴 Phase 5 refactor).

**User call (2026-09-13): do not story `EaSignInPage`/`KonamiSignInPage`.** These two pages exist
only to complete the sign-in flow for stores whose real sign-in method the prototype doesn't
otherwise model (EA/Konami account linking) — they're placeholder/flow-completion pages, not real
production UI, so the harness's usual "every component should have a story" bar doesn't apply to
them. Scaffolding a story would have been busywork against something not meant to be inspected in
isolation. **This item is closed as "won't do," not merely deferred** — don't re-propose scaffolding
stories for these two without a reason the situation has actually changed.

Consequence for a sibling plan: [`plans/tickets/in-progress/ds-remediation.md`](./ds-remediation.md) Phase 5's gate
("visual QA: KONAMI page pixel-identical to pre-refactor") still has no story-driven mechanism
behind it and, per this decision, won't get one from the harness side — Phase 5 (if it's ever
picked up) needs its own before/after verification method, not "add a story first."

## Next step

Only item 2 (the Figma Code Connect bridge's placeholder node ids/URLs) remains open. It's
partially addressed already — `plans/tickets/in-progress/figma-token-sync.md`'s Grid batch populated a real
`figmaNodeId` and correct Code Connect mapping for one component — but the other ~85 stories still
carry the synthetic `figma://node/<slug>` fallback. Closing it out fully means repeating that
per-component trace for every component that actually has a Figma counterpart, which is a bigger,
ongoing effort (the `figma-token-trace` skill exists to make each one cheap, not to do all of them
in one sitting).
