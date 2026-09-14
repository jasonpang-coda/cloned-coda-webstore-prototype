# Pointer to add to codapayments-codashop-client's root AGENTS.md

`figma-implement-design`'s own doc already anticipates this and it was never added for
either skill:

> Other tools: point rules or prompts at `skills/figma-implement-design/SKILL.md`, or add
> a one-line pointer from your product's config (e.g. `AGENTS.md`) to that path.

Suggested addition to `AGENTS.md` (e.g. under its Architecture & Framework section, next
to the existing framework guidance):

```markdown
## Skills

- `skills/figma-implement-design/SKILL.md` — implementing UI from a Figma frame.
- `skills/implement-handoff-spec/SKILL.md` — implementing a feature from a design-handoff
  bundle produced by the COD:M web store prototype repo (states, tokens, integration
  contract — see the bundle's own AGENTS.md for the specific feature).
```

Not applied automatically — this repo's own conventions (no auto-commit
`.cursor/rules/no-auto-git-commit-push.mdc`) mean this is proposed for a human to land,
not written directly.
