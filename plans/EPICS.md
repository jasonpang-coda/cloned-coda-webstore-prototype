# Epics Index

An epic groups several small, independent **tickets** (see `plans/tickets/`)
under one theme. This is the grouping layer a Kanban board would call
"epic" — it sits above tickets, and beside the existing `plans/*.md` files.

**Epic vs. plan vs. ticket — three different sizes of work:**

| | What it is | Where it lives | Has phases/QA? |
|---|---|---|---|
| **Plan** | One large, multi-phase initiative | `plans/<name>.md` | Yes — own status, phases, QA cases |
| **Epic** | A theme grouping several small tickets | Listed below, one row each | No — it's a label, not a document |
| **Ticket** | One small, independently workable task | `plans/tickets/<status>/<slug>.md` | No — just a description + size + status |

### Tickets are filed by status, not just tagged by it

A ticket's file lives under `plans/tickets/<status>/`, matching its
frontmatter `status:` field exactly — e.g. a `backlog` ticket is at
`plans/tickets/backlog/<slug>.md`. **The moment a ticket's status changes,
`git mv` it into the matching folder in the same edit that changes the
frontmatter.** A ticket whose folder and frontmatter disagree is a bug in
the tracking, not a style nit — fix it on sight. Valid folders match the
status legend below (`backlog`, `ready`, `in-progress`, `done`, `blocked`,
`abandoned`); a folder is only created once it holds a ticket, so don't
expect all six to exist at once. Update the ticket's link path in this
file's own epic tables in the same commit.

### Closing an epic

An epic closes the moment every one of its tickets reaches `done` or
`abandoned` — none left in `backlog`, `ready`, `in-progress`, or
`blocked`. Close it in the same edit that flips the last ticket, the same
discipline as the folder rule above: a closed epic still sitting under
`## Epics` is a bug in the tracking, not a style nit.

To close an epic:

1. Cut its whole `### <Name>` section — intro paragraph and ticket table,
   unchanged — from `## Epics`.
2. Paste it under `## Archived Epics` at the bottom of this file. Keep the
   ticket table as-is; it is the proof every row says `done`/`abandoned`,
   not a claim to take on faith.
3. Add `_Closed <date>._` under the heading.
4. Do not move the ticket files themselves — they already sit under
   `tickets/done/` or `tickets/abandoned/` from when their own status
   changed. Archiving the epic only moves its EPICS.md section.

If a new ticket for that theme shows up later, cut the section back under
`## Epics` and drop the closed note — an archived epic can reopen.

A large initiative is still a **plan** in shape (it needs phases and QA),
even where it now lives as a ticket for tracking. Do not start new
`XL`-sized work as a ticket — write a `plans/<name>.md` instead. The
`harness-design-quality`, `ds-remediation`, and `figma-token-sync` epics
below hold the one exception: these were already-drafted, mostly-executed
`plans/*.md` files, moved into `plans/tickets/` on 2026-09-13 so every
piece of tracked work sits in one place. Their `size: XL` frontmatter is
accurate, not a mis-file — read the linked file itself for phases and QA,
not this table. An epic is otherwise for the case where several *small*
tickets share a theme (e.g. everything about the PM Ideation Sandbox) and
you want to see them as one group without writing a full phased plan
document for each.

## Ticket status legend

`backlog` (raised, not started) · `ready` (scoped, unblocked) ·
`in-progress` · `done` · `blocked` · `abandoned`

## Ticket size legend

T-shirt sizes, rough effort, not a time commitment:

| Size | Meaning |
|---|---|
| XS | Under an hour — a small, well-understood fix |
| S | Under half a day — one file, one clear change |
| M | Half a day to a day — a few files, some design decisions |
| L | Multiple days — spans several files/areas, needs its own investigation |
| XL | Big enough it should probably become a `plans/<name>.md` instead |

## Epics

### Sandbox

The PM Ideation Sandbox — the throwaway, guardrailed bundle PMs/designers
use to prototype page ideas with real components, without touching `src/`.
Milestones 1–2 (exporter, guardrail, multi-store, ruleset auto-gen,
git-installable kit) are already built and QA'd — see
`~/.claude/plans/majestic-noodling-teapot.md` for that history (outside this
repo's `plans/`, predates this epic structure). This epic tracks
**incremental improvements** on top of that foundation, plus the
`/ideate*` skill layer (`.claude/skills/ideate*/SKILL.md`).

| Ticket | Size | Status |
|---|---|---|
| [Add device frames support](tickets/backlog/sandbox-device-frames.md) | M | backlog |

### Harness Design Quality

The 2026-09-12 product-design assessment of the harness (Plans 2–6, see
[`plans/INDEX.md`](INDEX.md)) — turning the harness from a
system-correctness checker (did it resolve, did it render, did it drift)
into a design-quality one (is it legible, does it survive real copy, does
it have the right states, does it look right). Gates 1–3 (contrast,
locale, states) and the library-viewer UX work are done; the pixel-diff
gate and 2 of the false-confidence items are still open.

| Ticket | Size | Status |
|---|---|---|
| [Design-Quality Gates — contrast, locale, state taxonomy](tickets/done/design-quality-gates.md) | XL | done |
| [Library Viewer UX](tickets/done/library-viewer-ux.md) | XL | done |
| [Visual Capture Rig](tickets/in-progress/visual-capture-rig.md) | XL | in-progress |
| [Remove False Confidence — dead fields, placeholder bridges, spec noise](tickets/in-progress/harness-false-confidence.md) | XL | in-progress |
| [Pixel-Diff Visual Correctness Gate](tickets/backlog/pixel-diff-gate.md) | XL | backlog |

### DS Remediation

Phased token/branching cleanup from the design-system usage audit
(`audits/ds-usage-audit.md`) — de-branching whitelabel conditionals,
re-aliasing tokens that bypass the semantic layer, and a visual-QA gate
for the pages touched. Phases 1–2 and 4 done; phase 3 needs
re-verification, phase 5 not started.

| Ticket | Size | Status |
|---|---|---|
| [DS Remediation](tickets/in-progress/ds-remediation.md) | XL | in-progress |

### Figma Token Sync

Living crosswalk tracing Figma-bound variables against repo design tokens,
by component batch, via the `figma-token-trace` skill +
`tools/figma-token-crosswalk.mjs`. Batch 1 (Grid) is done and re-aliased
where it bypassed the semantic chain; further component batches are still
open.

| Ticket | Size | Status |
|---|---|---|
| [Figma Token Sync Tracker](tickets/in-progress/figma-token-sync.md) | XL | in-progress |

<!-- Add new epics as new "### <Name>" sections + a table, same shape. -->

## Archived Epics

### Harness Automation

_Closed 2026-09-13._

Bounded-autonomy retry loop on top of `tools/orchestrator.mjs`: on a stage
FAIL, route to the right subagent (`story-architect` / `component-builder`
/ `qa-evaluator`, per `.claude/skills/design-harness/subagents.md`), patch,
re-run only the failed stage, and escalate to a human at a per-stage retry
cap. `orchestrator.mjs` stays a pure stateless verifier — retry counts,
routing, and dispatch policy live in the caller. Ticket order matches the
dependency chain: structured failures and `--from-stage` first, then the
router/retry loop, then escalation.

| Ticket | Size | Status |
|---|---|---|
| [Structured failure payloads on orchestrator FAIL](tickets/done/harness-structured-failures.md) | S | done |
| [Add --from-stage resume flag to orchestrator](tickets/done/harness-from-stage-resume.md) | S | done |
| [Router + per-stage retry loop for the design-harness skill](tickets/done/harness-router-retry-loop.md) | M | done |
| [Human escalation path when the harness retry loop gives up](tickets/done/harness-human-escalation.md) | S | done |

<!-- Add newly-closed epics as new "### <Name>" sections here, same shape, with a "_Closed <date>._" line. -->
