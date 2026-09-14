# Plans Index

One file per **large, multi-phase initiative** under `plans/`. Check here before starting new
harness/DS work, before drafting a new plan, and before resuming an old one (statuses go stale —
verify, don't trust blindly; each entry carries a `last-verified` date so you know how stale).

**Smaller, independent tasks don't need a full plan document.** See
[`plans/EPICS.md`](EPICS.md) for the epic/ticket layer — epics group small tickets
(`plans/tickets/<status>/<slug>.md`, filed by status — see EPICS.md) by theme, each ticket
carrying a T-shirt size estimate. Use a plan
(this file) for something with real phases and its own QA cases; use a ticket for something
small enough to just pick up and do.

Status legend (plans): `proposed` (drafted, not greenlit) · `authorized` (user said go) ·
`in-progress` (being executed) · `done` · `abandoned`.

| Plan | Status | Last verified | Summary |
|---|---|---|---|

No active plan documents right now. The 7 initiatives once listed here (DS Remediation, the
pixel-diff gate, the visual capture rig, design-quality gates, library viewer UX, remove-false-
confidence, and the Figma token sync tracker) were mostly-executed already, so they moved into
`plans/tickets/` on 2026-09-13 under the `harness-design-quality`, `ds-remediation`, and
`figma-token-sync` epics — see [`plans/EPICS.md`](EPICS.md) for current status and links. This
file stays the place to check before starting new large, multi-phase work.

## Where the harness-design-quality epic came from

Its 5 tickets came out of a product-design assessment of the harness on 2026-09-12. The headline:
the harness grades **A−** as a system-correctness harness (tokens, crash, drift, CI, the
compounding regression ledger) and **C−** as a design tool. Every existing gate answers "did it
resolve / did it render / did it drift"; none answers "does it look right, is it legible, does it
survive real copy". Those 5 tickets are the gap.

## Suggested order

Dependencies run left to right; everything else is independent. Ticket names below refer to files
under `plans/tickets/` (see [`plans/EPICS.md`](EPICS.md) for exact paths).

```
Library Viewer UX item 1 (deep-link   →  Visual Capture Rig  →  Pixel-Diff Gate (as the capture
stage state)                             (capture rig)          rig's phase 3a)
                                       →  Remove False Confidence item 2 (real Figma mapping URLs)
                                          — still open

Design-Quality Gates (contrast · locale · states)   done
Remove False Confidence items 1, 3                  done; item 4 closed won't-do; item 2 still open
DS Remediation phase 4                              2 of 2 scoped items done; a 3rd, out-of-scope
                                                     violation found and tracked, not fixed; phase 3
                                                     still needs re-verifying
```

Rationale for putting Design-Quality Gates early: contrast, locale and state coverage are static or
near-static checks that catch more design defects per unit of effort than pixel-diffing does, and
its Gate 1 also fixes a documented-but-nonexistent check (`tools/harness-cli.mjs:7` claims
"contrast sanity"), which is the exact false-confidence class this harness's own conventions warn
against.
