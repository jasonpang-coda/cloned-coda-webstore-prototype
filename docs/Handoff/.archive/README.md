# `docs/Handoff/.archive/` — retired handoff artifacts

This is where handoff content goes when it's **stale, superseded, or no
longer the channel anyone should be pointed at** — but still worth keeping
around for reference rather than deleting outright. Archiving, not deleting,
is the default for this kind of content: the cost of keeping a rotting
folder around is much lower than the cost of someone later needing exactly
the thing that got deleted.

## The harness already ignores this directory

Any directory under `docs/Handoff/` whose name starts with `.` — this one
included — is skipped by `scripts/stage-handoff.mjs`'s `stageFeatures()`
(see the `entry.name.startsWith('.')` check). That means anything archived
here:

- never appears in `public/handoff/index.json`'s feature manifest,
- is never fetchable under `/handoff/<slug>/...` on a deployed build,
- is invisible to an external scraper or agent reading `llms.txt` /
  `public/handoff/`.

`handoff:verify` (flow-mode) and the story-mode spec-drift check (both run
in CI, see `.github/workflows/design-harness.yml`) don't need any special
exclusion — they only ever read `src/handoff/flows/*.flow.js` and
`src/library/stories/*.stories.js` and write to specific known slugs, so
archived content is never in their scan path to begin with.

**If you add a new script that walks `docs/Handoff/` directly**, skip any
entry starting with `.` the same way `stage-handoff.mjs` does, or archived
content will leak back into whatever that script produces.

## What's here today (archived 2026-09-12)

Seven interactive VitePress handoff sites, retired because they'd gone
stale — most had drifted token names (`--ref-*` → `--x-ref-*`) that nobody
had caught, and the `_handoff-kit --update` mechanism that was supposed to
keep them current had no way to warn about local edits before overwriting
them (fixed in the same pass that led to this archive — see
`_handoff-kit/create-handoff.mjs`'s `--update` header comment for what
changed):

| Archived path | What it was | Superseded by |
|---|---|---|
| `bestseller-card-effects/` | Interactive demo: BestSellerCard ring/bloom/entrance | Nothing yet — no in-app flow exists for this feature. `docs/Handoff/.archive/bestseller-card-effects/` still has its README.md/component-breakdown.md/motion-tokens.md if you need the spec prose. |
| `carousel-story-interaction/` | Interactive demo: Story Carousel choreography | Same — no flow yet. |
| `codm-signin-motion/` | Interactive demo: sign-in flow motion | Same — no flow yet. Also predates `_handoff-kit`: has no `handoff.config.mjs`, so it can't be mechanically un-archived by rerunning `--update`; would need one authored from scratch. |
| `codm-sku-cards/` | Trimmed sibling of `sku-cards/` (components + playground only) | Same — no flow yet. |
| `gamer-id-instruction/` | Interactive demo: Gamer ID instruction step | Same — no flow yet. |
| `sku-cards/` | Full interactive demo: SKU card family (flow spec + motion/haptic/typography) | Same — no flow yet. |
| `_handoff-kit/` | Scaffold tool + template for building more of these sites (`create-handoff.mjs`) | The in-app `/handoff` app (`src/handoff/`) — write a `*.flow.js` manifest instead of scaffolding a new site. See `.claude/skills/web-store-interactive-handoff/SKILL.md`'s deprecation notice. |
| `locale-selector-sheets-site/` | Just the VitePress/npm apparatus split out of `docs/Handoff/locale-selector-sheets/` | The in-app `/handoff` app. **This feature's `spec.md`/`spec.json`/`AGENTS.md`/etc. were NOT archived** — they're flow-backed (`src/handoff/flows/locale-selector-sheets.flow.js`), CI-verified, and stay live at `docs/Handoff/locale-selector-sheets/`. Only the stale interactive site moved. |

If a feature listed above ever gets a real `*.flow.js` written for it, the
in-app `/handoff` app becomes its live channel and this archived folder can
just stay archived — no need to un-archive or reconcile the two.

## Convention for archiving something new

1. **Move, don't delete**, unless the content is genuinely worthless (e.g.
   a build artifact that was accidentally committed). Preserve full git
   history by moving the folder as-is rather than recreating it.
2. **Split hybrid folders.** If a folder mixes live, still-current content
   (a flow-backed `spec.md`, anything another script still reads) with
   stale content (an interactive site, hand-written docs nothing points at
   anymore), archive only the stale part. Suffix the archived remainder
   `<slug>-site/` (or similar) if the live `<slug>/` folder stays in place —
   see `locale-selector-sheets-site/` above for the pattern.
3. **Add a row to the table above** — one line on what it was, and what (if
   anything) superseded it. A folder with no explanation is exactly the
   kind of rot this archive exists to prevent.
4. **Update anything that described it as current** — `docs/README.md`'s
   per-file index, any `.claude/skills/*.md` whose playbook produces more of
   the retired pattern (mark deprecated, don't just leave it silently
   dangling), and any release note that linked to it (leave those alone —
   they're a historical record of what existed at the time, not a live
   index).
5. **Don't wire new tooling to read from here.** If something under
   `.archive/` needs to become live again, move it back out and treat that
   as a real decision, not a script quietly reaching into the attic.
