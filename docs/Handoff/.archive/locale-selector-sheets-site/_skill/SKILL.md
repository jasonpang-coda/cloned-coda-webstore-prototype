---
name: web-store-spec-handoff
description: >-
  Playbook for writing a comprehensive, agent-executable spec handoff for a
  front-end engineer — or their AI — picking up a feature from the multi-store web
  store prototype (COD:M, FCM, or any whitelabel store — Vue 3 + Vite, 4-tier
  design tokens, motion-token system, device-frame overlay model). Assumes the
  production codebase is NOT 1:1 with the prototype, so the deliverable transfers
  two things portably: the component's full STATE & BEHAVIOUR model and its
  complete TOKEN CONTRACT (colour, typography, spacing, radius, size, effects,
  motion) with resolved values. This is the DOCUMENTATION counterpart to
  codm-web-store-fe (authoring) and codm-web-store-qa (verification): it does NOT
  write component code — it TRACES an existing feature and produces a token-cited,
  source-linked handoff plus an AGENTS.md agent entry point under
  docs/Handoff/<feature>/. USE whenever the user asks to write a handoff, spec doc,
  motion spec, design-to-dev handoff, an "agent-ready" or "AI-readable" spec, a
  handoff for Cursor/Composer/Claude, a spec for a different codebase or team,
  "document this flow/feature for a FE dev", produce an engineering hand-over, or
  bundle a feature's docs into a shareable self-contained folder. It encodes the
  trace-the-orchestrator → enumerate-every-state → resolve-every-token-tier →
  timeline → portable-build-order → capture-rationale-and-gotchas →
  self-contained-and-link-verified strategy.
---

# Web Store — FE Spec Handoff Playbook

> **Sibling skill:** `web-store-interactive-handoff` — turns the finished spec docs
> produced by this skill into a live VitePress demo site (token sandbox,
> choreography timeline, easing viewer, real component mounted). Run it after this
> skill: with no shared codebase, that site is the **behaviour oracle** the
> implementer verifies against.


> **This skill DOCUMENTS an existing feature; it does not author or change it.**
> Do not edit `.vue`, token, or theme files. The only things you write are the
> handoff doc(s) and `AGENTS.md` under `docs/Handoff/<feature>/`. Every value you
> state must trace to the real code — if you can't point to the file and token,
> don't write it. For *what correct looks like* and the system vocabulary, defer to
> `codm-web-store-fe` and `docs/`.

## Who reads this handoff

Two audiences, one document.

- **A human reviewer** reads the prose, rationale, and diagrams to sign off that the
  spec matches design intent.
- **An AI agent** (Cursor Composer, Claude, GPT) *executes* it — increasingly it,
  not the dev, writes the component. It needs enumerated states, resolved values,
  atomic tasks, acceptance criteria, and explicit stop conditions.

**The production codebase is NOT 1:1 with the prototype.** Different repo,
component names, and design-system plumbing. So the prototype is a *reference
implementation, never a patch target*, and only two things must survive the
crossing intact:

1. **Behaviour** — every state, variant, transition, trigger, guard, and edge case.
2. **The token contract** — every colour, type, spacing, radius, size, effect and
   motion value, named by semantic role **with its resolved value**, so a component
   rebuilt elsewhere is still true to the design spec.

A handoff that documents animations but not states, or token names but not resolved
values, fails at the boundary. Those two gaps are this skill's whole reason to exist.

Bundled references — **copy them, don't restate them**:
- [`handoff-template.md`](./handoff-template.md) — the doc scaffold. Start every handoff from this.
- [`agents-template.md`](./agents-template.md) — the `AGENTS.md` agent entry point.

Read for ground truth (don't paraphrase into the handoff — link to them):
- [`codm-web-store-fe/SKILL.md`](../codm-web-store-fe/SKILL.md) — the authoring rules & system vocabulary (tokens, condense, overlays, motion).
- [`motion-tokens.md`](./motion-tokens.md) · [`haptic-tokens.md`](./haptic-tokens.md) · [`component-breakdown.md`](./component-breakdown.md) · [`typography.md`](./typography.md) — the canonical system docs.

---

## Phase 1 — Trace the feature through code (never guess)

The quality of the handoff is set here. Read first, write second.

1. **Load the FE skill.** Invoke `codm-web-store-fe` before reading any UI file so
   you describe the feature in the system's own terms (token names, the overlay
   model, the condense system). A handoff that invents vocabulary is worse than none.

2. **Find the orchestrator — the single source of truth.** Most flows are driven by
   one singleton composable (`useAuth`, `useCheckout`, …) that owns the **state refs
   and the timing constants**. Find it first. Everything else (the UI surfaces) is a
   `v-if` on a ref it controls. The orchestrator is where the choreography lives —
   `SIGN_IN_DELAY`, the `setTimeout(showSnackbar, 500)` pause, the re-entrancy guards.

3. **Enumerate states BEFORE animations.** This is the step most handoffs skip, and
   the one that most damages a rebuild — an agent given only an animation catalogue
   ships the happy path. Harvest the state inventory mechanically from the source:
   - every `v-if` / `v-else` / `v-show` branch in the template,
   - every conditional class and `:class` binding (`--active`, `.is-open`, `--selected`,
     `--claimed`, `--disabled`),
   - every `props` entry with its type and default, and every variant string it accepts,
   - every ref the component reads from a composable,
   - every `:hover` / `:active` / `:focus-visible` / `:disabled` rule in the scoped CSS,
   - every async branch (pending / resolved / rejected / empty-array).

   That union **is** the state list. Then, for each state, record how it's entered,
   how it's exited, what changes observably, and which tokens change. Any state you
   can't reach in the running prototype is still a state — document it and say so.

4. **Walk every surface the feature touches.** For the sign-in flow that was the
   navbar trigger → sheet → loader → navbar swap → snackbar → popover. For each,
   open the `.vue` and pull the **actual** scoped CSS — the `<Transition>` classes,
   `@keyframes`, durations, easings, `transform-origin`, z-index. Quote real code;
   never paraphrase a transition you didn't read.

5. **Resolve every tier to a value, not just motion.** A bare token name is useless
   across a codebase boundary — the reader has no `semantics.css` to look it up in.
   For **each** of colour, typography, spacing, radius, size, border weight, effects
   and motion, chase the token through `src/tokens/ds/*` (semantics → system →
   theme) to its **resolved value** and record both. Typography means the full
   spec — size, weight, tracking, line-height **and condense**; type without
   condense is wrong type.

6. **Read the canonical doc for that domain first** (e.g. `motion-tokens.md` for a
   motion spec). It tells you the conventions to match, the vocabulary to reuse, and
   what's *already* documented so your handoff links to it instead of duplicating it.

7. **Record, never resolve, an unknown.** A raw `350ms` in a component is almost
   always `var(--motion-modal-enter)` underneath — chase it to `motion.css` /
   `motion-sku.css` and cite the token, not the literal. If you find a genuine magic
   number, flag it in the magic-numbers table. If a behaviour or value is genuinely
   unspecified, it becomes a §11 open question — **never** a plausible guess. Every
   guess you bury here becomes an agent's confident invention downstream.

---

## Phase 2 — Write the handoff (structure)

Copy `handoff-template.md` → `docs/Handoff/<feature>/README.md` and fill each
section. The template is ordered deliberately; keep the order and the numbering —
`AGENTS.md`, the §8 tasks, and the paste-prompts all cite sections by number.

### The load-bearing sections

- **Frontmatter.** The machine header: slug, status, prototype version, reference
  impl paths, components to produce, state count, the full `token_contract` by tier,
  `demo_url`, `blocking_questions`. Everything here must agree with the body.
- **§0 Agent brief.** The prototype-is-reference rule, read order, normative-vs-
  illustrative, and the stop conditions. Twelve lines, no more.
- **§1 Flow at a glance + choreography timeline.** One ASCII diagram for orientation,
  then a `t (ms) | event | token | reference` table. State the scope boundary
  explicitly — what this covers and what the *sibling* path is (e.g. "COD:M path;
  the FCM EA-redirect is a sibling flow, noted where they diverge"). Add a callout
  for each *deliberate beat* explaining the **why** (the 500ms pause exists so the
  loader exit + navbar swap settle before the snackbar bounces — that intent is
  invisible in the code, and a rebuild will drop it unless you say so).
- **§2 State & behaviour matrix — the payload.** Per component: the state inventory
  (§2.x.a), the transition table with trigger *and* guard *and* timing token
  (§2.x.b), the props/variants contract including graceful-absent behaviour for
  every nullable input (§2.x.c), and edge cases written as testable assertions
  (§2.x.d). Say explicitly when a state does not apply rather than omitting it —
  silence reads as "not specified" and invites invention.
- **§3 Token contract — the other payload.** One table per tier, always three
  normative columns: token · **resolved value** · applies-to (element + state).
  Restate the mapping rule (map by semantic role; add a token when the role is
  missing; never paste the literal; never cross tiers) and the motion rules
  (entrances decelerate, exits accelerate and shorten, spring for delight only,
  `transform`/`opacity` only, shorthand banned when the easing has a comma). List
  genuine magic numbers in §3.8, or state that there are none.
- **§4 Surface-by-surface reference.** Marked *illustrative*: file link, transition
  name, z-index, the real CSS block, and *why this surface behaves this way* (scrim
  vs scrim-less, fade vs slide, spring vs not).
- **§5 Constants.** Point to the orchestrator as the one place timing lives — "keep
  the beat in one module, never inline in a component."
- **§6/§7 Accessibility, performance, layout & stacking.** Focus behaviour for every
  interactive state in §2, reduced-motion at the token layer, hit targets, ARIA per
  surface, and any container that changes positioning semantics.
- **§8 Build order.** Portable tasks framed by *behaviour*, not by file patch. Each
  carries `Depends on:`, `Covers states:` (citing §2 rows), `Tokens:` (citing §3
  rows), and an `Acceptance:` checklist of observable assertions. One task = one
  coherent behaviour cluster = one agent prompt. Never write "edit
  `src/components/X.vue`" — that file does not exist in the target repo.
- **§9 Constraints & prohibitions.** Imperative MUST/NEVER. Feature-specific, plus
  the portability rules: don't copy `.vue` files or mirror the architecture, don't
  port prototype-only scaffolding (demo data, device-frame overlay,
  `forceReduceMotion` shims), don't substitute a close-enough token for a missing role.
- **§10 Verification.** State-coverage table (one row per §2 state), visual parity
  against `demo_url` or the prototype, the token-mapping record the implementer
  fills in, and behavioural/keyboard/reduced-motion checks.
- **§11 Open questions & assumptions.** Blocking questions with an owner, and every
  assumption you made, with its basis. An agent must not resolve a blocking question.
- **§12 Ready-to-paste prompts.** Two or three blocks that work pasted cold —
  implement-one-task, review-against-spec, extend-the-feature.
- **Gotchas** stay where they are most useful: inline in §4 per surface, and as
  invariants in §2.x.d. The traps that aren't visible from a clean read
  (`translateX(-50%)` must repeat in every keyframe step; `container-type` traps
  `position: fixed`; spring is reserved for delight) are the highest-value lines in
  the doc — but a trap about *how the prototype is built* belongs in §4, while a trap
  about *how the feature must behave* belongs in §2.

### Authoring rules that make it machine-readable

- **One fact, one place**, with a declared normative source per fact type: states →
  §2; values → §3; timing → §1.1; quoted CSS and ASCII → illustrative only. When two
  places disagree an agent picks arbitrarily, so never state a value twice.
- **Tables over prose** for anything the implementer must transfer. Prose is for
  rationale — the *why* that a table can't hold.
- **Label every code block** with its provenance:
  `<!-- source: src/components/Foo.vue:120 (reference only) -->`.
- **Stable numbered headings.** `AGENTS.md` and the §12 prompts cite `§2.1.b`; if you
  renumber, fix the citations.
- **Absolute imperatives. No hedging.** "Probably", "should be fine", "roughly",
  "something like" — hedged language is exactly where an agent starts improvising.
  If you're unsure, it's a §11 question, not a soft sentence.
- **Cite-don't-restate.** Link to source with clickable relative paths
  (`[`SignInSheet.vue`](../../../src/components/SignInSheet.vue)`) and to sibling
  docs; don't copy the system docs' content into the handoff.
- **A shipped `<placeholder>` is a bug, not a TODO.** The template's angle-bracket
  placeholders must all be gone before you report done.

---

## Phase 3 — Author the agent layer

1. **Write `AGENTS.md`** from [`agents-template.md`](./agents-template.md) into
   `docs/Handoff/<feature>/`. Cursor, Claude Code, and Codex all auto-load it, so it
   is the one file guaranteed to reach the agent — and it costs context on every
   turn. **Hard cap 60 lines.** It routes and constrains; it never duplicates §2/§3.

2. **Reconcile the frontmatter with the body** — these are the checks that keep the
   machine header honest:
   - `token_contract` lists exactly the tokens appearing in the §3 tables, per tier.
   - `states:` equals the total row count across every §2.x.a table, and matches the
     total in §10.1.
   - `reference_impl` paths all resolve, and are described as reference everywhere.
   - `blocking_questions` equals the number of blocking rows in §11 — and must be `0`
     before `status: ready`.

3. **Audit §8 task shape.** Every `### T<n>` has `Depends on:`, `Covers states:`,
   `Tokens:`, and `Acceptance:`. Every state in §2 is covered by at least one task —
   an uncovered state is a hole an agent will not notice.

4. **Audit the §12 prompts** by reading them as a stranger: does each name the doc,
   the sections, the single task, and the verification step, with zero reliance on
   conversation? If not, it isn't paste-ready.

---

## Phase 4 — Make it self-contained & verify links

A handoff usually lives in its own folder (`docs/Handoff/<feature>/README.md`) and
often needs to be shareable on its own (zipped, sent to a contractor or another
team). To bundle it self-contained:

1. **The README's own doc links ARE the bundle list — don't guess it.** Extract them
   from the file; that set is exactly what to duplicate into the folder:
   ```bash
   grep -oP '(?<=\]\()[^)]+\.md' docs/Handoff/<feature>/README.md | grep -v '^\.\?/' | sort -u
   ```
   `cp` each referenced `docs/*.md` into the folder. **Exception:** a doc referenced for
   one tangential line isn't worth pulling in whole — leave it un-bundled and repoint that
   single link to the original instead.

2. **Fix the links — there are only three moves, and which applies depends on whether
   the README *moved*:**
   - **README links to a now-co-located doc → flatten to `./`** (`../../motion-tokens.md`
     → `./motion-tokens.md`). Always applies — these are the docs you just bundled.
   - **Source-code links (`src/…`, `.claude/…`) → adjust depth ONLY if the doc moved.**
     If you *moved* a flat `docs/Handoff/foo.md` into `docs/Handoff/foo/`, every
     `../../src/…` gains one `../`. If the README was *already* in its folder, the
     `../../../src/…` links already resolve — **touch nothing.** (This is the easy thing
     to over-correct.)
   - **Inside a bundled doc, links to docs you did NOT bundle → step back out** to where
     they still live (`component-breakdown.md`'s `./README.md` → `../../README.md`).

3. **Verify every link resolves — don't eyeball it.** Run the checker below. It strips
   **both** `#anchors` **and** `:NNN` line suffixes before resolving — a `src/App.vue:380`
   line-anchored link is valid and will false-positive as BROKEN if you forget the `:NNN`
   strip (a real trap):
   ```bash
   BASE="docs/Handoff/<feature>"
   for f in "$BASE"/*.md; do
     echo "-- $f --"
     grep -oP '(?<=\]\()[^)]+' "$f" | while IFS= read -r link; do
       p="${link%%#*}"                          # strip #anchor
       p=$(echo "$p" | sed 's/:[0-9]*$//')      # strip :NNN line suffix
       [[ "$p" == *"<"* ]] && { printf "  SKIP   %s\n" "$link"; continue; }  # template placeholders
       abs=$(cd "$BASE" && realpath "$p" 2>/dev/null)
       [ -e "$abs" ] && printf "  OK     %s\n" "$link" || printf "  BROKEN %s\n" "$link"
     done
   done
   ```
   Fix every `BROKEN` before reporting done. A doc that shows **no** links uses only
   backtick-inline code — confirm that's the reason, don't assume it.

   Note the `SKIP` branch exists for the *template*. In a finished handoff a `<…>`
   link is an unfilled placeholder — see the next check.

4. **Run the structural checks.** These catch the four failure modes that make a
   handoff unusable by an agent:
   ```bash
   BASE="docs/Handoff/<feature>"; R="$BASE/README.md"

   # a) No unfilled placeholders survive OUTSIDE §12. Two deliberate exceptions:
   # §12's paste-ready prompts (fill-ins for whoever pastes the prompt, e.g.
   # "<path to component>"), and a `<…>` inside a backtick code-span that denotes
   # CSS/code syntax (e.g. `transition: <prop> var(--token)`) rather than an
   # unfilled value. Eyeball any remaining hit — this can't be fully mechanical.
   awk '/^## 12\./{exit} {print}' "$R" | grep -n '<[a-z][a-z0-9 _/-]*>' \
     | grep -vE '`[^`]*<[a-z][a-z0-9 _/-]*>[^`]*`' \
     && echo "✗ placeholders left" || echo "✓ no placeholders outside §12"

   # b) Every build-order task declares its states and acceptance criteria.
   awk '
     /^### T[0-9]+/ { if (id) { if (!hs) print "✗ " id " missing Covers states:";
                                 if (!ha) print "✗ " id " missing Acceptance:" }
                      id=$0; hs=0; ha=0; next }
     /Covers states:/ { hs=1 }
     /Acceptance:/    { ha=1 }
     END { if (id) { if (!hs) print "✗ " id " missing Covers states:";
                      if (!ha) print "✗ " id " missing Acceptance:" } }
   ' "$R"

   # c) Frontmatter state count matches the §2.x.a tables and §10.1's total. This
   # ONLY works if every §2.x block kept its `.a` subheading (see the template note)
   # — a state-inventory table without one is invisible to this count.
   FM_COUNT=$(grep -oE '^states: [0-9]+' "$R" | grep -oE '[0-9]+')
   TABLE_COUNT=$(awk '
     /^#### [0-9]+\.[0-9]+\.a/ { insection=1; next }
     /^####/ || /^###/ { insection=0 }
     insection && /^\|/ && $0 !~ /---/ && $0 !~ /Entered when/ { n++ }
     END { print n+0 }
   ' "$R")
   S10_COUNT=$(awk '/^### 10\.1/,/^### 10\.2/' "$R" | grep -cE '^\| [0-9]+ \|')
   echo "frontmatter=$FM_COUNT  §2-tables=$TABLE_COUNT  §10.1=$S10_COUNT"
   [ "$FM_COUNT" = "$TABLE_COUNT" ] && [ "$TABLE_COUNT" = "$S10_COUNT" ] \
     && echo "✓ state counts agree" || echo "✗ state count mismatch — reconcile"

   # d) AGENTS.md exists and is within the context cap.
   [ -f "$BASE/AGENTS.md" ] && wc -l < "$BASE/AGENTS.md" || echo "✗ AGENTS.md missing"
   ```
   Then confirm by hand that every token in the frontmatter `token_contract` appears
   in a §3 table and vice versa — a tier listed but never tabled is the most common
   drift.

5. **Bundle the generating skill itself, so the folder needs no repo access to be
   understood or re-run.** Copy this skill's own three files into a `_skill/`
   subfolder inside the feature's handoff directory — a frozen snapshot, not a
   live link, since the skill may evolve after this handoff ships:
   ```bash
   BASE="docs/Handoff/<feature>"
   mkdir -p "$BASE/_skill"
   cp .claude/skills/web-store-spec-handoff/{SKILL.md,handoff-template.md,agents-template.md} "$BASE/_skill/"
   ```
   Add one line to the README's closing "Related docs" footer pointing at it, e.g.:
   `Generated using the [web-store-spec-handoff](./_skill/SKILL.md) skill —
   bundled as a frozen snapshot; the live skill may have since evolved.`
   Use a subfolder, not the feature folder's top level — `_skill/` reads
   unambiguously as provenance/reference material, never mistaken for part of the
   spec itself, and never collides with the feature's own `README.md`/`AGENTS.md`.
   Verify the copy landed and the footer link resolves:
   ```bash
   for f in SKILL.md handoff-template.md agents-template.md; do
     [ -f "$BASE/_skill/$f" ] && echo "✓ $f" || echo "✗ missing $f"
   done
   grep -q '_skill/SKILL.md' "$BASE/README.md" && echo "✓ footer links to _skill/" || echo "✗ footer link missing"
   ```

---

## Quality bar — a good handoff vs a code dump

**Trace & citation**
- [ ] **Orchestrator identified** — the doc names the one file that owns state + timing.
- [ ] **Choreography captured** — a timeline with exact ms values and the *why* of each beat.
- [ ] **Real code quoted** — transition/keyframe blocks copied from the actual files, not paraphrased, each labelled with its source path:line.
- [ ] **Source-linked** — clickable relative links to every file referenced.
- [ ] **Scope boundary stated** — what's covered, what the sibling path is.
- [ ] **Doesn't restate the system docs** — links to them; bumps a version/date footer.
- [ ] **Self-contained + link-verified** — if bundled, all deps present and every link resolves (script-checked).
- [ ] **Generating skill bundled at `_skill/`** — `SKILL.md`, `handoff-template.md`, `agents-template.md` present, and the README's footer links to `./_skill/SKILL.md`.

**Behaviour transfer**
- [ ] **Every state enumerated** — interaction, async, and domain states, each with entry condition, exit condition, and observable change. States that don't apply are stated, not omitted.
- [ ] **Every transition has a trigger, a guard, and a timing token** (or is explicitly instant).
- [ ] **Props/variants contract complete** — types, defaults, allowed values, and graceful-absent behaviour for every nullable input.
- [ ] **Edge cases as assertions** — empty data, long copy/localisation, rapid re-trigger, unmount mid-transition, invariants.

**Design fidelity**
- [ ] **Every tier tabled with resolved values** — colour, typography, spacing, radius, size, effects, motion. Not just motion.
- [ ] **Typography complete** — size, weight, tracking, line-height **and condense**.
- [ ] **Mapping rule stated** — map by semantic role, add a token for a missing role, never paste the literal, never cross tiers.
- [ ] **Magic numbers flagged** in §3.8, or explicitly "none".

**Agent-executable**
- [ ] **`AGENTS.md` present**, ≤60 lines, leading with prototype-is-reference-not-target.
- [ ] **Frontmatter complete and reconciled** — `token_contract` ↔ §3, `states:` ↔ §2 rows ↔ §10.1.
- [ ] **Tasks atomic** — each cites the states it covers and carries observable acceptance criteria; every §2 state is covered by some task.
- [ ] **Constraints imperative** — MUST/NEVER, including the portability prohibitions.
- [ ] **Open questions explicit**, with owners; `blocking_questions: 0` before `status: ready`.
- [ ] **Paste-ready prompts present** and self-contained.
- [ ] **No hedged language** anywhere in the doc.
- [ ] **No unfilled `<placeholder>`** survives.
- [ ] **Portable** — nothing in the doc assumes the reader's codebase matches the prototype. Read it once as if `src/` were unavailable; every state, value, and acceptance criterion must still be actionable.
