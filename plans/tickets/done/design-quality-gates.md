---
epic: harness-design-quality
size: XL
status: done
created: 2026-09-12
owner: unassigned
last-verified: 2026-09-12
---

# Design-Quality Gates — contrast, locale, state taxonomy (Plan 4)

_Not yet authorized. From the 2026-09-12 product-design assessment of the harness — see
[`plans/INDEX.md`](../../INDEX.md)._

## Context

Every existing gate answers a **system-correctness** question: did the token resolve
(`harness test`), did it render without crashing (`harness:render`), did the spec drift
(`--verify`). None answers a **design-correctness** question: is it legible, does it survive real
copy, does it have the states a real interface needs.

These three gates are cheap (all static or near-static, all sub-second to low-seconds) and catch
more design defects per unit of effort than the pixel-diff gate does. Do them in parallel with —
or before — [`plans/tickets/in-progress/visual-capture-rig.md`](../in-progress/visual-capture-rig.md).

---

## Gate 1 — Contrast (do this first; it is partly a correctness bug) — ✅ implemented 2026-09-12

Implemented in `tools/harness-cli.mjs` (`shouldPair`, `alphaOf`, `hexToRgbString` + the new
step 3 of `testStory`). Reuses `contrastInfo` from `@coda/inspect-kit` (imported directly into the
Node CLI — it's DOM-free) and `normalizeColor`/`oklchToHex` from `tools/lib/color.mjs`, per the
one-extractor rule; no new color math was written. A pair failing even the large-text threshold
(ratio < 3) is a hard `CONTRAST_FAIL`; 3–4.5 is a non-blocking `contrastWarnings` entry. A story can
suppress a specific pair via `contrastWaivers: ['--x-text-a:--x-bg-b']`. This runs inside the
existing `harness test all` step already in CI — no new CI wiring needed.

**Calibration history — read before touching `shouldPair`/`KNOWN_MODIFIERS` again.** The first,
literal implementation (every consumed text token × every consumed bg token — the plan's original
"open question" resolved the naive way) produced **1,292 failures** across the real 86-story suite.
Inspection showed the noise was systematic, not random, which made it fixable rather than a reason
to abandon the gate:

1. **`-inverse`/state-toned text paired against unrelated plain surfaces** (e.g.
   `--x-text-header-inverse` on `--x-bg-navbar`, ratio ~1:1, in every store) — fixed by only
   pairing tokens whose trailing state/tone modifier matches (`shouldPair`), reducing this to 145.
2. **`--x-bg-indicator-*` treated as a text-bearing surface** — it's a small decorative dot/pip fill
   in this design system (`BundleItem.vue`, `NavBar.vue`, `MilestoneRewardsRail.vue` — never a
   surface body/header/status text renders on) — excluding it dropped this to 13.
3. **Translucent backgrounds treated as opaque** — 12 of the remaining 13 were
   `--x-text-on-action-tertiary` on `--x-bg-action-tertiary`, a deliberate 10%-opacity "frost"
   ghost-button fill (`src/tokens/ds/semantics.css:63`); flattening its alpha to opaque near-white
   against near-white text manufactured a guaranteed ~1:1 false "fail" in every store. Added
   `alphaOf()` to skip any bg token with meaningful transparency (alpha < 0.9) from the check
   entirely, rather than scoring it wrong — this is the same documented approximation
   `inspect-kit`'s own `effectiveBackground` already accepts for the same reason.

**Result: 86/86 stories now pass clean with zero false positives** — verified by diffing against
`main` (`npm test`'s 2 pre-existing unrelated failures are identical on both branches).

**Known real gap, found while verifying this**: the live `InfoTag`-on-COD:M illegibility that
motivated this whole gate (see the 2026-09-12 assessment) is a translucent-over-dark-backdrop
composition (`--x-bg-tag-neutral` is also a 10%-opacity black fill) — i.e. it's excluded by the
same alpha guard that was needed to kill the ghost-button false positive. **A static token sweep
cannot resolve this class of bug**, translucency defeats it regardless of pairing precision; it
needs the actual rendered DOM (the live inspector already computes it correctly via
`effectiveBackground`, or the render-based check in
[`plans/tickets/in-progress/visual-capture-rig.md`](../in-progress/visual-capture-rig.md)). So Gate 1 is real, working
infrastructure for opaque-token contrast bugs and a legitimate uplift over the false "contrast
sanity" claim that used to sit in `tools/harness-cli.mjs`'s header doc — but it is not a substitute
for a render-based check, and shouldn't be described as one.

**Follow-up, not done here**: `shouldPair`'s modifier-matching is still a name-based heuristic, not
true DOM knowledge — expect an occasional new false positive as the token vocabulary grows; add a
`contrastWaivers` entry to the affected story rather than loosening `KNOWN_MODIFIERS`/`shouldPair`
without re-running the full suite to check the blast radius (the same discipline that took this
from 1,292 → 0 above).

**The claim already exists and is false.** `tools/harness-cli.mjs:7` documents the sweep as
verifying "container query discipline, pseudo-states, and **contrast sanity**". There is no
contrast code in that file. This is precisely the false-confidence class the `design-harness`
skill itself warns about ("a verify step that structurally can't fail manufactures false
confidence") — so either implement it or delete the claim; leaving it is the worst option.

Observed symptom: `InfoTag` on COD:M renders as near-illegible dark-on-dark on the library stage
and no gate notices.

- The math already exists — `contrastInfo(textColor, bgColor)` in
  `packages/inspect-kit/src/core/inspect.js:421`, returning `{ ratio, aa, aaLarge, aaa }`.
- Today it is only reachable as a **manual, one-element-at-a-time** readout in the live inspector.
- **Do:** pair text tokens with their plausible background tokens, resolve both per store via
  `scripts/resolve-css.mjs`, and run `contrastInfo` across the 12 themes inside `harness test`.
  Fail on AA misses; allow an explicit per-pair waiver in the story (decorative text, disabled
  states) so the gate is overridable but the waiver is visible.
- Don't reimplement the ratio math — import the one in `inspect-kit`, per the skill's
  one-extractor rule.

**Open question:** how to derive the text↔background pairing without hand-authoring it per
component. Options: derive from the component's own CSS (which selector sets `color` and which
ancestor sets `background`), or pair by token naming convention (`--x-text-*` on `--x-bg-*`).
Prefer deriving from the component, consistent with how `tokens:` is already auto-derived by
`tools/lib/component-tokens.mjs`.

---

## Gate 2 — Locale stress dimension (highest yield) — ✅ implemented 2026-09-12

Implemented as an opt-in `--locales <csv|stress>` flag on `tools/harness-render.mjs` (default
unchanged: `en` only, so the existing CI render step's cost doesn't silently change).
`--locales stress` is shorthand for `ar,ja`.

**Rescoped from the original sketch, based on what's actually in the repo**: the plan above assumed
synthetic `de`/`th`/`ar` strings. COD:M already has **real translated content**
(`src/stores/codm/store.js`'s `translations: { ja, pt, es, ar }`) — real data beats fabricated
filler, so the two stress locales are `ar` (RTL-script text) and `ja` (CJK, no natural word-wrap
points) rather than a synthetic `de`/`th`. `useStoreStrings.js`'s merge function (`stringsFor`) was
exported so `harness-render.mjs` reuses the exact same base←translation merge the live app uses,
instead of a second hand-rolled deep-merge.

**Verified working, not just wired**: confirmed the swapped-in strings are real translated content,
not a no-op fallback (`signIn.cta`: `"Sign in"` → `"تسجيل الدخول"` (ar) → `"サインイン"` (ja)). Ran
the full 86-story suite with `--locales stress`: **2,322 renders, 0 failures.**

**Honest limitation, found while verifying**: 0 failures is expected, not a clean bill of health.
This is an SSR string-render gate — it can only catch a hard crash (e.g. a component that assumes
Latin-script length and does something like a fixed `.slice()` that throws), not a visual overflow,
clipped badge, or broken line-wrap, which requires actual layout/paint. Swapping in longer/differently
-shaped strings without a crash proves the render didn't blow up; it does **not** prove the layout
survives. The real visual check needs a rendered screenshot — this is exactly why
[`plans/tickets/in-progress/visual-capture-rig.md`](../in-progress/visual-capture-rig.md) pairs with this gate (a `de`/`ar` capture
is the kind of break a human spots instantly and this crash-only gate structurally cannot). Also:
this only swaps string CONTENT, not `dir="rtl"` mirroring — that's an app-shell concern
(`useLocale.js`'s `isRtlActive`) that StoryStage's isolated render never reaches, so an `ar` render
here proves "renders with RTL-script text," not "mirrors correctly as RTL."

**Not wired into CI** — deliberately left as an opt-in flag rather than added to
`.github/workflows/design-harness.yml`'s existing render step, since that would ~3x that step's
runtime; that's a CI-cost decision for the user to make, not one to fold in silently.

Locking tests: `tests/harness-render.test.mjs` (7 tests, including that unset `--locales` produces
byte-identical output to before this gate existed, and that a locale-stress render still catches a
real crash).

---

## Gate 3 — Widen the state taxonomy — ✅ implemented 2026-09-12

`src/library/story.js` documented `states` as a subset of
`['default','hover','pressed','disabled']`. Original reality across 86 stories:

| states | count |
|---|---|
| `['default']` only | 43 |
| `['default','hover','pressed']` | 33 |
| `['default','hover']` | 7 |
| other (collapsed/expanded, checked/unchecked) | 3 |

**Rescoped from the original sketch**: `focus` was added to the real `states` taxonomy (a
generically-simulated pseudo-state, same mechanism as hover/pressed/disabled). `loading` / `empty`
/ `error` / `long-copy` were deliberately **not** added to `states` — unlike a pseudo-state, they
need real component-specific data (an empty array, a `loading` prop, an overflowing string), so
they can't be simulated as a generic DOM/CSS toggle. `story.js` now documents this explicitly:
author those as ordinary named `variants` instead ("Empty", "Long copy", …) when a component has
one worth showing.

**Focus, mechanically**: `buildHoverOverride(el, 'focus')` already existed in `@coda/inspect-kit`
(the `pseudo === 'focus'` branch was written but never called from anywhere) — wired it up in
`LibraryViewer.vue`'s `applyState`. Added real `focus` coverage to `FilterDropdown` and
`PlayerAccount` (both have a genuine `:focus-visible` rule) as the concrete demonstration.

**Found and fixed a real, more consequential bug while verifying this** — not a focus-specific
issue: `src/library/StoryStage.vue` (a thin adapter wrapping `@coda/harness-kit/vue`'s real
`StoryStage`, injecting live store context) never called `defineExpose`. A `<script setup>`
component is closed by default, so `LibraryViewer.vue`'s `stageRef.value.componentEl` was
`undefined` — every `applyState` call for **hover, pressed, AND disabled, not just focus**, threw
`componentEl is not a function`, uncaught, the instant it ran. Because `activeState.value = s` is
set *before* that line, the clicked state tab visibly highlighted with no visible error — the
entire state-simulation feature in the Component Library viewer has been **silently cosmetic**
this whole time; nobody would notice from the UI alone. Fixed by forwarding `componentEl` through
the adapter (`defineExpose({ componentEl: () => innerStage.value?.componentEl() })`). Verified live
for all four states (focus, hover, pressed — disabled follows the same code path) on
`FilterDropdown`: real DOM class + injected stylesheet + correct computed background
(`oklch(0.992 0.003 286 / 0.1)`, the frost-hover token) for focus/hover, and the real BEM
`--pressed` modifier class for pressed.

Also fixed the underlying `buildHoverOverride` targeting bug this surfaced: it always added its
marker class to the component's OWN root (`componentEl()`), but in this codebase the interactive
element is very often a NESTED child (`.filter-dropdown__trigger` inside root `.filter-dropdown`,
`.player-account__input` inside root `.player-account`) — the norm, not the exception. A rule like
`.filter-dropdown__trigger:hover` only ever matches that inner element, so marking the root
silently no-op'd for most real components even once the StoryStage exposure bug above was fixed.
`buildHoverOverride` now marks whichever element the selector's own base part actually matches —
`el` itself if it matches, otherwise the first matching descendant — handling comma-separated
selector lists and `:hover .child` descendant rules the same way as before.

**State-coverage warning**: `harness test` now emits a non-blocking `SINGLE_STATE_COVERAGE`
warning for any story left at `states: ['default']` without `presentational: true` (mirrors
`tokenFree`'s opt-out pattern). Triaged the 4 clearest cases from the original 43 — `MaterialIcon`,
`Media`, `Grid`, `Span` — as `presentational: true`, based on direct confirmation already in their
own story docs (pure glyph/media render, layout-primitive-with-no-content-props) rather than a
grep-based guess. **Left the remaining 39 as open warnings, deliberately** — a full triage of every
story risked exactly the false-confidence failure mode this whole gate exists to prevent (rubber-
stamping a real interactive component as exempt just to shrink the warning count). `harness test
all` output now tallies this count every run so it stays a visible, checkable backlog.

Locking tests: `tests/harness-cli.test.mjs` (+3: warning fires, `presentational: true` suppresses
it, multi-state stories get none). The `StoryStage.vue`/`buildHoverOverride` fix has **no automated
regression test** — it's DOM-manipulation code with no jsdom infra in this repo's plain
`node --test` setup; verified live in-browser only (documented here as a real, disclosed gap, not
silently skipped).

## Next step

Gate 1 is the one with an existing false claim attached, so it should be scoped and authorized
first. Gates 2 and 3 are independent of it and of each other.
