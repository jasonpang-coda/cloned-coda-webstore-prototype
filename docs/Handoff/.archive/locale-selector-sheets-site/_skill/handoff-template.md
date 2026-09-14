---
handoff: <feature-slug>
title: <Feature> — <Domain> Handoff
status: draft                      # draft | ready — `ready` requires blocking_questions: 0
prototype_version: v<X.Y.Z>
last_updated: <YYYY-MM-DD>
stores: [<codm>]                   # themes this spec governs
reference_impl:                    # READ-ONLY reference. Never a patch target.
  orchestrator: src/composables/<useThing>.js
  surfaces:
    - src/components/<File>.vue
components: [<ComponentName>]       # what the target codebase must produce
states: <n>                        # total rows across every §2.x.a table
token_contract:
  colour:     [--bg-<…>, --text-<…>, --border-<…>]
  typography: [.text-style-<…>]
  spacing:    [--pad-<…>, --gap-<…>]
  radius:     [--radius-<…>]
  size:       [--size-<…>, --border-weight-<…>]
  effects:    [--shadow-<…>]
  motion:     [--motion-sys-duration-<…>, --motion-sys-ease-<…>, --motion-sys-distance-<…>]
demo_url:                          # interactive handoff site, once deployed
blocking_questions: 0
---

# <Feature> — <Domain> Handoff

> One paragraph: what this feature is and what this doc specs.
>
> **Scope:** what this covers (e.g. the COD:M path). Name the *sibling* path it does
> NOT cover and how it's selected, so the boundary is unambiguous.
>
> **Last updated:** <YYYY-MM-DD> · tracks prototype v<X.Y.Z>.

---

## 0. Agent brief — read this first

**The prototype is a reference implementation, not a patch target.** The production
codebase is not 1:1 with it: different repo, different component names, different
design-system plumbing. Do not copy `.vue` files or assume the prototype's
architecture.

What you must reproduce, in your own stack:

1. **The state machine** — §2. Every state, every transition, every edge case.
2. **The token contract** — §3. Every value by *semantic role*, mapped to your
   system's equivalent token. Never a hardcoded literal.

**Read order:** load the relevant authoring skill → §2 (states) → §3 (tokens) →
your assigned task in §8 → verify with §10.

**Normative vs illustrative.** Tables in §2 and §3 are normative — build to them.
Quoted CSS and ASCII diagrams show *how the prototype did it* and are illustrative
only; an equivalent technique in your stack is correct.

**Stop conditions.** If a value is not in §2/§3, grep the cited reference file. If
it is still absent, it is an open question in §11 — **stop and ask a human.** Do not
infer a colour, duration, or behaviour that isn't specified.

---

## 1. The flow at a glance *(orientation — illustrative)*

One sentence on how the feature is orchestrated (which singleton owns state/timing).

```
<ASCII flow diagram — trigger → surface → surface → end state.
 Show the state ref that flips and the function that fires at each step.>
```

### 1.1 Choreography timeline (normative for timing)

| t (ms) | Event | Token | Reference |
|---|---|---|---|
| 0 | … | `--motion-<…>` | `<File.method>` |
| … | … | … | `<orchestrator constant>` |

> **Why <the deliberate beat> matters.** Explain the intent that is invisible in the
> code — the sequencing decision, the pause, the order of operations. Carry this
> intent into the rebuild; it is not an accident of the prototype.

---

## 2. State & behaviour matrix *(normative)*

The payload of this handoff. Every state below must exist in the built component.
One `### 2.x` block per component or surface.

### 2.1 <ComponentName>

#### 2.1.a State inventory

Exhaustive. Include the interaction states (`default`, `hover`, `press`,
`focus-visible`, `disabled`), the async states (`loading`, `error`, `empty`), and
every domain state (`selected`, `claimed`, `expired`, `sold-out`, `verified`,
`guest`, …). If a state does not apply, say so explicitly rather than omitting it.

| State | Entered when | Exits when | Observable change | Tokens (→ §3) |
|---|---|---|---|---|
| `default` | initial mount | any below | baseline | `--bg-card-default`, `--border-soft-2`, `--text-primary` |
| `hover` | pointer over, pointer-fine only | pointer leaves | … | … |
| `press` | pointerdown | pointerup / cancel | … | … |
| `focus-visible` | keyboard focus | blur | visible focus ring — never removed | `--border-<…>` |
| `disabled` | `<prop/condition>` | … | non-interactive, no hover/press | … |
| `loading` | `<trigger>` | resolve or error | … | `--motion-<…>` |
| `error` | `<trigger>` | retry / input change | … | `--bg-input-error`, `--text-<…>` |
| `empty` | data array length 0 | data arrives | … | … |
| `<domain-state>` | … | … | … | … |

- **Mutually exclusive:** `<list any states that can never co-occur>`.
- **Combinable:** `<e.g. selected + hover renders both treatments>`.
- **Default on mount:** `<which state, and whether a prop can override it>`.

#### 2.1.b Transitions

Every state change: what triggers it, what gates it, what animates, which token
sets the timing. A transition with no token is instant — state that explicitly.

| From → To | Trigger | Guard / gate | Animates | Duration · Easing |
|---|---|---|---|---|
| `default → active` | chip tap | none | `background` | `--motion-sys-duration-base` · `--motion-sys-ease-standard` |
| `collapsed → expanded` | any chip active | — | height | `--motion-sys-duration-base` · `--motion-sys-ease-standard` |
| `<state> → <state>` | … | `<e.g. signedIn \|\| guestVerified, else silent no-op>` | instant (no transition) | — |

#### 2.1.c Props / variants contract

| Prop | Type | Default | Allowed values | Unlocks state |
|---|---|---|---|---|
| `<name>` | `<Boolean>` | `<false>` | — | `<disabled>` |
| `<variant>` | `<String>` | `<'default'>` | `<'default' \| 'row'>` | — |
| `<nullable>` | `<String \| null>` | `null` | — | when absent, `<what renders instead — never a broken slot>` |

State the graceful-absent behaviour for every nullable input: the component must
render correctly with the value missing, not merely not crash.

#### 2.1.d Edge cases & invariants

Write each as an assertion the implementer can test.

- **Empty data** — `<what renders>`.
- **Long copy / localisation** — `<how it truncates, wraps, or condenses; the
  longest supported locale>`.
- **Rapid re-trigger** — `<re-entrancy behaviour: guarded, queued, or last-wins>`.
- **Unmount mid-transition** — `<timers cleared, no hanging state>`.
- **Invariant** — `<something that must always hold, e.g. exactly one chip active
  whenever the panel is expanded>`.

*(repeat §2.x per component/surface — always keep the `.a`/`.b`/`.c`/`.d` subheadings,
even when a block is short. They're what makes states countable and citable; skipping
them for a "simple" surface is how state counts silently drift from the frontmatter.)*

---

## 3. Token contract *(normative)*

Every value the feature consumes, by tier. **The `Resolved` column exists to verify
your mapping — never to paste.**

### 3.0 The mapping rule

1. Map each row to the token in *your* system that carries the **same semantic
   role** (`--bg-*` → your background role, `--text-*` → your text role, and so on).
2. If your system has no token for that role, **add one**. Do not substitute a
   visually-close existing token — that is how design fidelity is lost.
3. Never hardcode the resolved literal in a component.
4. Never cross tiers: colour tokens for `background`, `color` and `border-color` are
   not interchangeable — the tier encodes contrast expectations for that role.
5. Typography only through a type style. Never raw `font-size` / `font-weight` /
   `letter-spacing` in a component.

### 3.1 Colour

| Token | Resolved | Applies to (element · state) |
|---|---|---|
| `--bg-<…>` | `<oklch(…)>` | `<element>` · `<state>` |
| `--text-<…>` | `<oklch(…)>` | `<element>` · `<state>` |
| `--border-<…>` | `<oklch(…)>` | `<element>` · `<state>` |

### 3.2 Typography

| Type style | Size / weight / tracking / line-height / condense | Applies to |
|---|---|---|
| `.text-style-<…>` | `<12px / 500 / 0.02em / 16px / 87.5%>` | `<element>` |

> ⚠️ **Condense is part of the type spec.** If the type is horizontally condensed
> (`transform: scaleX()` or a variable-font width axis), the value is in the table
> above and omitting it makes the type wrong. Do not drop it.

### 3.3 Spacing

| Token | Resolved | Applies to |
|---|---|---|
| `--pad-<…>` | `<8px>` | `<element>` padding |
| `--gap-<…>` | `<4px>` | `<element>` gap |

### 3.4 Radius

| Token | Resolved | Applies to (element · state) |
|---|---|---|
| `--radius-<…>` | `<4px>` | `<element>` · `<state>` |

### 3.5 Size & border weight

| Token | Resolved | Applies to |
|---|---|---|
| `--size-<…>` | `<20px>` | `<element>` |
| `--border-weight-<…>` | `<1px>` | `<element>` |

### 3.6 Effects

| Token | Resolved | Applies to |
|---|---|---|
| `--shadow-<…>` | `<…>` | `<element>` |

### 3.7 Motion

| Token | Resolved | Used for |
|---|---|---|
| `--motion-sys-duration-<…>` | `<250ms>` | `<what>` |
| `--motion-sys-ease-<…>` | `<cubic-bezier(…)>` | `<what>` |
| `--motion-sys-distance-<…>` | `<16px>` | `<what>` |

**Motion rules that travel with the values:**
- Entrances decelerate (ease-out); permanent exits accelerate (ease-in) and are shorter.
- Spring / overshoot is reserved for delight — name the one place it's used.
- Animate only `transform` and `opacity` on hot paths.
- ⚠️ Never use the `transition` / `animation` **shorthand** with an easing token whose
  value contains commas (`cubic-bezier(…)`) — the commas parse as multiple properties.
  Use `transition-duration` / `transition-timing-function` longhands.
- `prefers-reduced-motion: reduce` must collapse these durations to `0ms` at the
  token layer, not per component.

### 3.8 Magic numbers (values with no token)

| Value | Where | Why it isn't a token | Action for the rebuild |
|---|---|---|---|
| `<90ms>` | `<what uses it>` | `<flagged in the prototype>` | `<tokenise it / carry it as-is>` |

If this table is empty, say **"None — every value resolves to a token."**

---

## 4. Surface-by-surface reference *(illustrative)*

How the prototype implements each surface. Read for intent; do not port structure.

### 4.1 <Surface> — "<label>"
**Reference:** [`<File>.vue`](../../../src/components/<File>.vue) ·
**transition name:** `<name>` · **z-index:** `<n>`

One sentence on the key behavioural choice (scrim vs scrim-less, fade vs slide,
blocking vs non-blocking) and *why*.

<!-- source: src/components/<File>.vue:<NN> (reference only) -->
```css
<the real scoped-CSS transition / keyframe block, copied from the file>
```
- <bullet per meaningful property, and *why* — orientation, easing choice, origin.>

> ⚠️ **Gotcha:** <the non-obvious trap for this surface, if any.>

*(repeat 4.x per surface)*

---

## 5. State & timing constants

Owned by [`<orchestrator>.js`](../../../src/composables/<orchestrator>.js) in the
prototype. In the rebuild, keep them in **one** place — never inline a `setTimeout`
in a component.

| Constant | Value | Meaning |
|---|---|---|
| `<NAME>` | `<value>` | … |

Note re-entrancy guards and timer cleanup so an aborted flow leaves no hanging state.

---

## 6. Accessibility & performance

- `prefers-reduced-motion` handling (token layer, not per component).
- Motion is never the only signal of a state change — name what else changes
  (colour, content, icon).
- Focus order and visible focus for every interactive state in §2.
- ARIA role / label / `aria-expanded` / `aria-live` per surface.
- Only `transform` / `opacity` on hot paths; where `will-change` is set and why.
- Hit target minimum for every tappable element.

---

## 7. Layout & stacking context

Where these surfaces mount, how they position (framed vs responsive), and the
stacking order:

```
<lowest z> < … < <highest z>
```

Note any layout container that changes positioning semantics (e.g. a
`container-type` ancestor traps `position: fixed`).

---

## 8. Build order

Portable tasks. Each is one coherent behaviour cluster, sized for a single agent
prompt, and independently verifiable. Tasks name states, not files.

### T1 — <Static structure & default state>
**Depends on:** — · **Covers states:** §2.1 `default`, `empty`
**Tokens:** §3.1 `<rows>` · §3.2 `<rows>` · §3.3 `<rows>`
**Behaviour:** <what to build, in behavioural terms.>
**Acceptance:**
- [ ] Renders at every breakpoint in §7 with no overflow.
- [ ] Every colour, spacing and radius value comes from a mapped token — grep the
      new code for literals: none.
- [ ] Type matches §3.2 including condense.
- [ ] `empty` state renders the specified fallback, not a broken slot.

### T2 — <Interaction states>
**Depends on:** T1 · **Covers states:** §2.1 `hover`, `press`, `focus-visible`, `disabled`
**Tokens:** §3.1 `<rows>` · §3.7 `<rows>`
**Behaviour:** <…>
**Acceptance:**
- [ ] All four states reachable and visually distinct.
- [ ] `focus-visible` ring present via keyboard; not suppressed.
- [ ] `disabled` blocks hover and press entirely.
- [ ] Durations/easings from mapped motion tokens; longhands where the easing has commas.

### T3 — <Async / domain states>
**Depends on:** T1 · **Covers states:** §2.1 `loading`, `error`, `<domain>`
**Tokens:** §3.7 `<rows>` · §3.1 `<rows>`
**Behaviour:** <…>
**Acceptance:**
- [ ] Each state reachable in isolation (add a temporary control if needed).
- [ ] Transitions fire on the triggers in §2.1.b, gated by the stated guards.
- [ ] Edge cases in §2.1.d hold — rapid re-trigger and mid-transition unmount included.

### T4 — <Choreography / orchestration>
**Depends on:** T2, T3 · **Covers states:** the §1.1 sequence
**Tokens:** §3.7 `<rows>`
**Behaviour:** <…>
**Acceptance:**
- [ ] Beat order and offsets match §1.1 within one frame.
- [ ] Timing constants live in one module, not inline in components.
- [ ] `prefers-reduced-motion: reduce` collapses motion with the flow still completing.

*(add/remove tasks to fit the feature — never drop the Covers-states or Acceptance lines)*

---

## 9. Constraints & prohibitions

**MUST**
- Implement every state in §2. A missing state is an incomplete task, not a detail.
- Map every value through §3 to a semantic token in the target system.
- Keep timing constants in one module.
- Preserve the intent captured in the §1.1 callouts and §4 gotchas.

**NEVER**
- Copy prototype `.vue` files, or mirror its architecture, composables, or file layout.
- Port prototype-only scaffolding: demo data, the device-frame overlay, or handoff
  shims such as `forceReduceMotion`.
- Hardcode a resolved literal that §3 gives a token for.
- Substitute a visually-similar token for a missing semantic role — add the role.
- Use the `transition` / `animation` shorthand with a comma-bearing easing token.
- Animate layout properties on a hot path.
- Invent a value, duration, or behaviour not specified here — see §11.

---

## 10. Verification

The target repo is not assumed runnable from this doc, so verification is
**state coverage + visual parity against the reference.**

### 10.1 State coverage

Every row in every §2.x.a table, exercised and screenshotted:

| State | Reachable | Matches reference | Notes |
|---|---|---|---|
| `<state>` | ☐ | ☐ | |

Total states to cover: **<n>** (must equal frontmatter `states:`).

### 10.2 Visual parity

Compare each state against the live reference — the interactive demo at `demo_url`
if one exists, otherwise the prototype. Check fill, border, radius, type
(size/weight/tracking/condense), spacing, and motion duration.

### 10.3 Token mapping record

Fill this in as you implement. It is the design-fidelity review artifact.

| §3 row (role) | Target token used | New token added? |
|---|---|---|
| `--bg-<…>` | `<your.token>` | ☐ |

### 10.4 Behavioural checks

- [ ] Every transition in §2.x.b fires on its trigger and respects its guard.
- [ ] Every edge case in §2.x.d holds.
- [ ] Keyboard-only pass: all interactive states reachable, focus always visible.
- [ ] `prefers-reduced-motion: reduce` pass: no motion, flow still completes.

---

## 11. Open questions & assumptions

**Blocking** — an implementer (human or agent) **must not** resolve these alone.

| # | Question | Owner | Blocks |
|---|---|---|---|
| Q1 | `<…>` | `<design/PM>` | `<T3>` |

**Assumptions** — recorded decisions that were not specified by design. Flag rather
than bury; each is a thing a reviewer can overturn.

| # | Assumption | Basis |
|---|---|---|
| A1 | `<…>` | `<matched sibling component X>` |

If there are none: **"No open questions. No assumptions."** and set
`blocking_questions: 0`.

---

## 12. Ready-to-paste prompts

Self-contained — each block works pasted cold into Cursor Composer, Claude Code, or
any agent with repo access. No reliance on prior conversation.

**Implement one task**

```text
Read docs/Handoff/<feature-slug>/AGENTS.md, then README.md §0, §2, §3 and task T2 of §8.
Implement T2 only, in this codebase — do NOT copy the prototype's .vue files.
Cover exactly the states T2 lists. Map every value through §3 to a token in this
repo's design system; if a semantic role has no token here, add it and note it in
§10.3. Then run the §10 checks for the states T2 covers and report the results as a
checklist. If any value you need is missing from §2/§3, stop and ask instead of
choosing one.
```

**Review an implementation against the spec**

```text
Read docs/Handoff/<feature-slug>/README.md §2 and §3. Audit <path to component> and
report, as a table: (a) states in §2 that are missing or unreachable, (b) values that
are hardcoded literals instead of mapped tokens, (c) transitions whose trigger or
guard differs from §2.x.b. Do not fix anything yet — report first.
```

**Extend the feature with a new surface**

```text
Read docs/Handoff/<feature-slug>/README.md §2, §3, §7 and §9. Add <new surface>
following the same state model and token roles. List the new states in §2 table
format and the tokens in §3 format before writing any code.
```

---

**Related docs:** [`motion-tokens.md`](./motion-tokens.md), [`haptic-tokens.md`](./haptic-tokens.md),
[`component-breakdown.md`](./component-breakdown.md), [`typography.md`](./typography.md).
