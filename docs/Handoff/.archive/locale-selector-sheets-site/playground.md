# Playground

Live demo of `RegionSelectorSheet` and `LanguageSelectorSheet`, wired to the
**real prototype tokens** (the full 11-file cascade — colour, space,
typography, shadow, and the scroll-fade gradient). This is a faithful demo
stub with a small 8-market / 8-language fixture, not the production `.vue`
files (both real sheets are bound to the `useLocale` composable) — but every
visual value is the genuine token.

<LocaleSelectorPlayground />

## Choreography timeline

Toggle between the entrance and exit phase to see why dismissal (200ms,
accelerate) is noticeably quicker than arrival (350ms, decelerate) — the §1.1
rule for every sheet in this app. Beat positions are read live from
`--motion-sys-duration-slow` / `--motion-sys-duration-exit`, so editing those
sliders above reshapes this timeline too.

<LocaleSelectorTimeline />

## Easing curves

Entrances decelerate, exits accelerate; hover and the scroll-fade opacity both
use the standard ease.

<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));">
  <EasingCurve token="--motion-sys-ease-decelerate" />
  <EasingCurve token="--motion-sys-ease-accelerate" />
  <EasingCurve token="--motion-sys-ease-standard" />
</div>

## Implement this

This page is the reference to build against — the production codebase is not
1:1 with the prototype, so match **behaviour and token roles**, not code.

- Agent entry point: [AGENTS.md](./AGENTS.md) — read it first.
- States to cover: [README §2](./README) (all 19 — 10 in §2.1, 9 in §2.2) ·
  Token contract: [README §3](./README).

**Implement one task**

```text
Read docs/Handoff/locale-selector-sheets/AGENTS.md, then README.md §0, §2, §3 and
task T2 of §8. Implement T2 only, in this codebase — do NOT copy RegionSelectorSheet.vue
or LanguageSelectorSheet.vue. Cover exactly the states T2 lists. Map every value
through §3 to a token in this repo's design system; if a semantic role has no token
here, add it and note it in §10.3. Then run the §10 checks for the states T2 covers
and report the results as a checklist. If any value you need is missing from §2/§3,
stop and ask instead of choosing one.
```

**Review an implementation against the spec**

```text
Read docs/Handoff/locale-selector-sheets/README.md §2 and §3. Audit <path to your
region/language selector component(s)> and report, as a table: (a) states in §2
that are missing or unreachable — pay particular attention to the region→language
reset rule and the RTL-gating rule, (b) values that are hardcoded literals instead
of mapped tokens, (c) transitions whose trigger or guard differs from §2.x.b. Do
not fix anything yet — report first.
```

See [README §12](./README) for the full set of ready-to-paste prompts, including
extending the feature with a new surface.
