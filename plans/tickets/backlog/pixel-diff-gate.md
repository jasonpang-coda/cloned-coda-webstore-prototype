---
epic: harness-design-quality
size: XL
status: backlog
created: 2026-09-12
owner: unassigned
last-verified: 2026-09-12
---

# Pixel-Diff Visual Correctness Gate (Plan 2)

_Not yet authorized. Recorded here so it isn't only living in chat history — see
[`plans/INDEX.md`](../../INDEX.md) for how this fits alongside the rest of the harness's CI gates._

> **Rescoped 2026-09-12 — read [`plans/tickets/in-progress/visual-capture-rig.md`](../in-progress/visual-capture-rig.md) first.**
> The "shape of the plan" below scopes this as an infrastructure project (774 baselines, a storage
> decision, a flake question), which is why it has never left `proposed`. Plan 3 subsumes phase 1
> as a shared capture rig serving three consumers (pixel-diff, handoff spec images, Figma capture)
> against a curated ~60-shot subset, which sidesteps the storage question rather than answering it.
> This file remains the detail spec for the diff/CI half — Plan 3 phase 3a — and should be closed
> out when that lands.

## Context

The `design-harness` skill's existing gates catch **crash/render** regressions
(`harness:render` — 774 renders across all components/variants/widths, all pass as of v0.113.0)
and **token drift** (`handoff:verify`, `export-handoff.mjs --story --verify`). None of them catch a
component that renders without crashing but looks wrong — a layout shift, an overlap, a broken
gradient, a misaligned icon. That gap was already flagged once as a real miss: "Automated Build
Gates Miss Visual Layering/Overlap Defects — Requires Live Browser Verification" (session note,
2026-09-06), which is exactly the class of regression a pixel-diff gate exists to catch.

## Shape of the plan (sketch — needs scoping before it's "authorized")

1. **Baseline capture** — for each of the 86 component stories (all variants × all store themes ×
   all widths, same matrix `harness:render` already walks), screenshot and commit as the golden
   baseline. Volume: 774 renders today, so this needs a storage-cost decision (git-lfs? external
   bucket? a subset instead of the full matrix?) before phase 1 can start.
2. **Diff on demand** — a script re-renders the current tree, diffs against baseline (pixelmatch or
   similar), and reports which stories moved beyond a tolerance threshold. Needs a call on
   threshold (anti-aliasing noise vs. a real regression) and on what "acceptable diff" looks like
   for a deliberate visual change (baseline needs a re-bless step).
3. **CI wiring** — add as a 3rd gate alongside the render and spec-drift gates in
   `.github/workflows/design-harness.yml`, but only once local iteration on 1–2 has proven the
   false-positive rate is low enough not to make every visual PR fight the gate.

## Open questions (why this is still `proposed`, not `authorized`)

- Full 774-shot baseline vs. a curated subset — cost/signal tradeoff not yet decided.
- Where baselines live (repo, LFS, external artifact store) — affects repo size and CI runtime.
- Re-bless workflow: who approves a new baseline when a change is intentional, and how (a CLI
  flag? a PR label?).
- Whether headless-render pixel output is stable enough across CI runners (font rendering,
  GPU/software rasterization differences) to avoid a flood of environmental false positives.

## Next step

Scope phase 1 concretely (exact matrix, storage choice) and bring it back for authorization before
any implementation starts.
