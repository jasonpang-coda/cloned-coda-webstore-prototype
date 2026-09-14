---
epic: harness-automation
size: M
status: done
created: 2026-09-13
owner: unassigned
depends_on: [harness-structured-failures, harness-from-stage-resume]
---

# Router + per-stage retry loop for the design-harness skill

## Context

`orchestrator.mjs` verifies; it must stay a pure, stateless verifier. The
retry loop, the failed-stage → agent map, and the retry counter belong in
the caller (the `design-harness` skill or a wrapper script), not in the
tool. This keeps the orchestrator reusable and testable without dragging
agent-dispatch policy into it.

`.claude/skills/design-harness/subagents.md` already defines three profiles
(`story-architect`, `component-builder`, `qa-evaluator`) but no executable
dispatch exists yet — this ticket builds that dispatch layer for the first
time, on top of those profiles.

## Goal

A caller that, on a stage FAIL, picks the right subagent, hands it the
structured failure payload, waits for a patch, and re-runs only the failed
stage — capped by a per-stage retry counter — before escalating to a
human.

## Suggested approach

1. Router map, failed stage → agent(s):
   - `intake`, `preflight` → `component-builder`
   - `scaffold`, `handoff` → `story-architect`
   - `sweep`, `render` → `qa-evaluator` (classifies) → `component-builder`
     (patches), or `story-architect` if the QA brief says the story's
     props are wrong.
2. Retry counter keyed per stage, not global — a `sweep` fix must not
   consume `render`'s retry budget.
3. Suggested caps (tune during implementation): 3 for token/ref issues, 2
   for render crashes and preflight rule violations, 2 for
   scaffold/story schema issues. 0 for "needs a new semantic token" —
   that always escalates immediately, per the closed-set token rule in
   the `web-store-tokens` skill.
4. Escalate when: the retry cap is hit, or the same structured failure key
   (from [Structured failure payloads](harness-structured-failures.md))
   repeats across two consecutive attempts on that stage.
5. After a re-run of a stage past the first one, run one full clean pass
   (`--from-stage intake`, no skip) before declaring SUCCESS — a `sweep`
   fix can re-break `preflight`, so the last gate before human review must
   be a real full pass, not a resumed one.
6. Use `--from-stage` from [that ticket](harness-from-stage-resume.md) to
   avoid re-running passed stages during the retry loop itself.

## Acceptance criteria

- Given a component that fails `sweep` with a missing-token error, the
  loop dispatches `qa-evaluator` then `component-builder`, re-runs only
  `sweep`, and on PASS runs one full clean pipeline before reporting
  SUCCESS.
- A failure that repeats identically twice on the same stage escalates
  instead of retrying a third time.
- Retry counts are visible per stage in whatever log/output the loop
  produces (does not need to be the orchestrator's own scorecard).

## Out of scope

- Auto-drafting `compound --rule` entries on SUCCESS-after-FAIL — see
  the escalation/compounding ticket.
- Changing `orchestrator.mjs` itself beyond what the two dependency
  tickets already add.
