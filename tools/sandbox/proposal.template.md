<!--
  tools/sandbox/proposal.template.md — template for a PM Ideation Sandbox
  proposal doc. Written into a fresh bundle's root as PROPOSAL.md by the
  `/ideate` skill (.claude/skills/ideate/SKILL.md) — not by the tested
  exporter (export-sandbox.mjs), so this file is never copied automatically.
  Read .claude/skills/ideate/SKILL.md, ideate-review, and ideate-handoff for
  the full lifecycle this doc's `status` field drives.

  {{PLACEHOLDER}} tokens are filled in by the /ideate skill at creation time.
-->
---
idea: {{IDEA_NAME}}
store: {{STORE}}
status: draft
created: {{CREATED_DATE}}
created_by: {{CREATED_BY}}
bundle_path: {{BUNDLE_PATH}}
signed_off_by:
signed_off_date:
---

# {{IDEA_NAME}}

## Status

`draft` — this is a work in progress. Nothing here is final. Nothing here
reaches the real repo unless a designer signs off (see the bottom of this
file) and an engineer implements it for real in `src/`.

## Goal

<!-- One or two sentences: what idea are you testing, and why? -->

## What is in this bundle

- Store targeted: `{{STORE}}`
- Pages: <!-- list src/page.*.vue files you added or edited -->
- Components used: <!-- list the curated components you composed with -->

## Screenshots

<!-- /ideate-review adds screenshots here. Leave empty until then. -->

## Notes for the reviewer

<!-- Anything a designer should know before signing off: open questions,
     things you are unsure about, alternatives you tried and rejected. -->

## Sign-off

**Only a human designer may fill in this section.** The PM's agent must
never set `status: signed-off` — see `.claude/skills/ideate-review/SKILL.md`
and `.claude/skills/ideate-handoff/SKILL.md`.

- Decision: <!-- approved / rejected / parked -->
- Signed off by: <!-- name -->
- Date: <!-- date -->
- Comments: <!-- optional -->
