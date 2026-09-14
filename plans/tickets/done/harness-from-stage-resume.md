---
epic: harness-automation
size: S
status: done
created: 2026-09-13
owner: unassigned
---

# Add --from-stage resume flag to orchestrator

## Context

`tools/orchestrator.mjs` always runs `intake → scaffold → sweep → render →
preflight → handoff` from the start. Every stage re-reads state from disk
(no in-memory state carries across stages), so resuming partway through is
safe: re-running `intake`/`scaffold` after a `sweep` fix is pure waste, not
a correctness risk.

## Goal

Let a caller re-run only the stages from a named stage onward, after an
agent has patched a fix for an earlier FAIL, without repeating stages that
already passed.

## Suggested approach

1. Add a `--from-stage <id>` CLI flag, one of
   `intake|scaffold|sweep|render|preflight|handoff`.
2. Stages before the named one are marked
   `{ status: 'SKIPPED', reason: 'Resumed from a later stage.' }` in the
   scorecard, not re-run.
3. Validate the flag value against the known stage IDs; reject with a
   clear error otherwise.
4. Document in the file header comment (`orchestrator.mjs:14` area) and in
   the `--help`/usage text.

## Acceptance criteria

- `node tools/orchestrator.mjs --component <X> --from-stage sweep --json`
  skips `intake` and `scaffold`, runs `sweep` onward.
- Default behavior (no flag) is unchanged — full pipeline from `intake`.
- An invalid stage name errors clearly instead of silently running the
  full pipeline or crashing with a stack trace.

## Out of scope

- A full clean re-run safeguard before declaring final SUCCESS (a
  `sweep` fix can re-break `preflight`) — that policy belongs to the
  caller/router ticket, not this flag. Note it there.
