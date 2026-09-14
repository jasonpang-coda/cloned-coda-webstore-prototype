---
epic: harness-automation
size: S
status: done
created: 2026-09-13
owner: unassigned
---

# Structured failure payloads on orchestrator FAIL

## Context

`tools/orchestrator.mjs` stores only `err.message` on a stage FAIL
(`orchestrator.mjs:103`). The underlying tools (`harness-cli.mjs`,
`harness-render.mjs`, `preflight.mjs`) already emit a parsed
`failures[]` array with `--json`, but the orchestrator throws it away
before it reaches the scorecard. Any future routing agent (QA Evaluator,
or a script) has only prose to work from, and cannot tell if two failures
across retries are "the same failure" or a new one.

## Goal

Every stage FAIL in the scorecard carries the tool's structured failure
list, keyed consistently, so a caller can diff failures across retry
attempts and route by cause, not by parsing English.

## Suggested approach

1. In `runStage`'s catch block, if `fn()` threw after parsing tool JSON,
   attach the parsed `failures` array (not just `err.message`) to
   `scorecard.stages[name]`.
2. Give each failure entry a stable key: `{ store, token, reason }` for
   `sweep`, `{ variant, reason }` for `render`, `{ rule, file, line }`
   for `preflight`. Reuse whatever shape the tool already parses — do
   not invent new fields in the tool itself.
3. Keep `err.message` too, for the human-readable CLI output path
   (`isJson === false`).
4. No change to exit codes or PASS/FAIL semantics — this only enriches
   the FAIL payload.

## Acceptance criteria

- `node tools/orchestrator.mjs --component <X> --json` on a known-failing
  component includes `scorecard.stages.sweep.failures` (or `.render.failures`
  / `.preflight.failures`) as an array of structured objects, not just a
  string.
- Existing non-JSON console output is unchanged.
- No existing test in `tests/` regresses.

## Out of scope

- Any retry logic, routing, or agent dispatch — this ticket only makes
  the FAIL payload machine-readable. See [Add --from-stage resume flag](harness-from-stage-resume.md)
  and the router ticket for what consumes it.
