---
epic: harness-automation
size: S
status: done
created: 2026-09-13
owner: unassigned
depends_on: [harness-router-retry-loop]
---

# Human escalation path when the harness retry loop gives up

## Context

The retry loop in [Router + per-stage retry loop](harness-router-retry-loop.md)
caps retries per stage and must stop cleanly, not silently, when it hits
that cap. Human merge is the trust boundary for this harness — autonomy
stops at "branch ready for review," never at "merged to main."

## Goal

When the loop escalates (retry cap hit, repeated identical failure, or a
new-semantic-token case), the human gets one clear artifact to review:
what failed, what was tried, and why it stopped, without digging through
agent transcripts.

## Suggested approach

1. On escalation, write a short summary (component, failed stage, attempts
   made, last structured failure, which agent(s) ran) to a fixed location
   — reuse `audits/retro-ledger.json`'s append pattern
   (`tools/retro.mjs`) rather than inventing a new log file.
2. Leave the working tree as-is (last attempted patch), uncommitted — do
   not auto-commit on escalation.
3. Print/return a one-line human-readable escalation reason, suitable for
   surfacing in a PR description or terminal output.
4. On SUCCESS after at least one prior FAIL, draft a `compound --rule`
   candidate (do not auto-apply it) — following the existing
   `tools/compound.mjs` pattern of human-approved rule promotion.

## Acceptance criteria

- An escalated run leaves a retro-ledger entry a human can read without
  replaying the session.
- No commit, push, or PR happens automatically on escalation.
- A SUCCESS-after-FAIL run produces a draft rule the user can approve or
  discard, not one silently written to a skill file.

## Out of scope

- PR creation or CI trigger wiring — this ticket only covers the
  escalation artifact and the compound-rule draft, not automated PR
  workflows.
