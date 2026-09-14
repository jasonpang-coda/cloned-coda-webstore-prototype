# Playground

Live demo of `BestSellerCard`'s effects layer, wired to the **real prototype
tokens** (the full 11-file cascade — colour, space, typography, shadow,
keyframes and the `.fx-glow-border-*`/`.fx-bloom` effect classes). This is a
faithful demo stub, not the production `.vue` file (the real card is
composable-bound) — but every visual value is the genuine token.

<BestSellerFxPlayground />

## Choreography timeline

Scrub or play the §2.2 **mount entrance** — the one true sequential
choreography here (the ring, bloom, and shimmer are independent perpetual
loops, not a beat sequence; their live periods are the token chips above).
Beat positions are read live from `--motion-sys-duration-slow`, so editing that
slider reshapes the timeline.

<BestSellerFxTimeline />

## Easing curves

The ring and shimmer spin at **linear** (continuous loops don't ease); the
bloom breathes on **standard**; the mount entrance **decelerates**.

<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));">
  <EasingCurve token="--motion-sys-ease-linear" />
  <EasingCurve token="--motion-sys-ease-standard" />
  <EasingCurve token="--motion-sys-ease-decelerate" />
</div>

## Implement this

This page is the reference to build against — the production codebase is not
1:1 with the prototype, so match **behaviour and token roles**, not code.

- Agent entry point: [AGENTS.md](./AGENTS.md) — read it first.
- States to cover: [README §2](./README) (all 7 — 4 in §2.1, 3 in §2.2) ·
  Token contract: [README §3](./README).

**Implement one task**

```text
Read docs/Handoff/bestseller-card-effects/AGENTS.md, then README.md §0, §2, §3 and
task T1 of §8. Implement T1 only, in this codebase — do NOT copy BestSellerCard.vue
or any prototype file. Cover exactly the states T1 lists (hero-default,
compact-default). Map every colour value through §3.1 to a token in this repo's
design system; if a semantic role has no token here, add it and note it in §10.3.
Then run the §10 checks for the states T1 covers and report the results as a
checklist. If any value you need is missing from §2/§3, stop and ask instead of
choosing one.
```

**Review an implementation against the spec**

```text
Read docs/Handoff/bestseller-card-effects/README.md §2 and §3. Audit <path to your
Best Seller card component> and report, as a table: (a) states in §2.1.a that are
missing or unreachable — pay particular attention to compact-selected, whose
"correct" behaviour is showing NO ring artifact, (b) values that are hardcoded
literals instead of mapped tokens, (c) transitions whose trigger or guard differs
from §2.1.b. Do not fix anything yet — report first.
```

See [README §12](./README) for the full set of ready-to-paste prompts, including
extending the ring with a new variant.
