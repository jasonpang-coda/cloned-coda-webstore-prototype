---
epic: harness-design-quality
size: XL
status: in-progress
created: 2026-09-12
owner: unassigned
last-verified: 2026-09-13
---

# Visual Capture Rig (Plan 3)

_From the 2026-09-12 product-design assessment of the harness — see
[`plans/INDEX.md`](../../INDEX.md). Phase 1 + Phase 2 (proof) + Phase 3b implemented 2026-09-13 —
see the status notes inline below. Phase 3a (CI pixel-diff gate) and 3c (figma:prime handing back
a file) remain open._

## Why this comes before the pixel-diff gate

Three separate wants in this repo are the same underlying capability — "render a story to an
image, deterministically":

1. **Pixel-diff regression gate** — [`plans/tickets/backlog/pixel-diff-gate.md`](../backlog/pixel-diff-gate.md).
2. **Spec images in handoff docs** — `docs/Handoff/components/<slug>/spec.md` is currently 100%
   prose + token tables with **zero visual reference** (see `sku-card/spec.md`, 84 lines, no image).
   A FE engineer reading a spec has nothing to compare their build against.
3. **Figma capture priming** — `tools/figma-harness.mjs prime` already outputs a capture URL and a
   readiness signal, but a human/agent still has to take the shot manually.

Build the capture once and all three land. Building the pixel-diff gate first solves only (1), and
its open questions (storage, flake, re-bless) are what have kept it at `proposed`.

## Scope

### Phase 1 — the rig — ✅ implemented 2026-09-13

`tools/harness-capture.mjs manifest [storyId | --curated] [--json]` — the DETERMINISTIC half of
"render a story to an image": given a story (or the curated set — see Phase 2), it computes every
(story, variant, theme, width) capture target, the exact deep-link URL each is addressed by, and
the exact file path the resulting PNG belongs at. Built on the `#library=<id>&v=<n>&w=<width>`
scheme from `plans/tickets/done/library-viewer-ux.md` (composed with `?theme=<store>`), exactly as this plan
anticipated.

**What it deliberately does NOT do**: drive a headless browser. This repo has no
Playwright/Puppeteer dependency, and adding one is a real infra decision (a new multi-hundred-MB
devDependency, CI runner setup) — not made unilaterally here, consistent with this plan's own
"Open questions" never resolving it. What actually takes the pixels is a **new isolated capture
mode**, `?capture=1` on `LibraryViewer.vue` — hides every chrome element but the staged component
(full-bleed, centered, on whatever `Background` mode the story would show) and sets
`document.documentElement.dataset.captureReady` once images/fonts/entrance-motion have settled
(reusing `figmaCapture.js`'s existing `waitForCaptureReady`, exported for this — not a second
implementation), so a driver waits on a real signal, never a fixed timeout, exactly as this plan's
Phase 1 required. A human/agent (or, later, an actual headless script once that infra decision is
made) drives a real browser to the manifest's URLs and captures via `modern-screenshot`'s
`domToPng` (already a repo dependency) — the same hand-off-a-file pattern `figma-harness.mjs`'s
`diff-tokens` already uses for Figma captures, since a detached Node process has no more access to
a real paint here than that script's process has to the Figma MCP.

**Found and fixed two real bugs along the way:**
1. `tools/harness-cli.mjs`'s `loadAllStories()` needed exporting for reuse (per the one-extractor
   rule), but the file had no main-module guard — importing it from `harness-capture.mjs` ALSO ran
   its own bottom-of-file CLI dispatch against the importer's `argv`, printing harness-cli's usage
   banner as an unrelated side effect. Fixed with an `isMainModule` guard.
2. **The exact same class of bug as `library-viewer-ux.md` item 1's `useUrlState.js` hash fix, but
   for a query param this time**: the new `?capture=1` flag was silently stripped on load. The
   watcher's `query = { ...route.query, device, theme }` rebuild trusts `route.query` to already
   contain anything the app itself doesn't track — but this file's OWN header comment already
   documented that `route.query` isn't reliable that early ("vue-router hasn't finished resolving
   the initial navigation yet"). Fixed the same way as the hash: read `capture` off
   `window.location.search` once at boot (`initialCapture`) and re-inject it into the query object
   on every write, alongside the existing `device`/`orientation`/`overlay`/`sku` handling.

### Phase 2 — curated baseline, not the full matrix — ✅ scoped + proven 2026-09-13

Rescoped concretely: "~60 shots, not 774" (this plan's own original framing) meant a curated **set
of stories**, not just fewer dimensions per story — 3 stores × 3 widths is already 9 shots per
story, so running that against all ~86 registered stories is 774, the exact count being avoided.
`CURATED_STORY_IDS` in `tools/harness-capture.mjs` names **7 stories spanning structurally distinct
categories** most likely to break differently: `info-tag` (atom), `sku-card` (content-heavy card —
breakdown rows, badges, bonus), `bundle-sku-card` (composite/bundle card), `nav-bar` (chrome/nav),
`best-seller-carousel` (carousel), `sign-in-sheet` (overlay sheet), `grid` (layout primitive) — 7 ×
9 = **63 shots**. `--curated` targets exactly this set; omitting both a story id and `--curated`
still covers all 86 (774 shots) but prints a loud warning first rather than silently running the
full sweep — a deliberate, visible choice, not a trap.

**Proven end-to-end, not just planned**: captured the full 9-shot matrix for `sku-card`
(`docs/Handoff/components/sku-card/captures/*.png`) — COD:M/Codashop/FCM × iPhone/Android/
Responsive. Verified each shot shows genuinely distinct, correct per-store rendering (COD:M's dark
UI, Codashop's purple/diamond branding, FCM's EA branding + stadium art), not a stale/shared
render, and that the `.sku-card::before` ring-mask workaround `useScreenshot.js` already documents
(the live in-app capture feature) was needed and worked here too. **The remaining 6 curated
stories' capture sets are a mechanical repeat of this exact, proven procedure — not completed this
session.**

**The manual loop itself is now a reusable script, not ad-hoc per-shot code — ✅ done 2026-09-13.**
Deliberately *not* the headless-browser driver from the open decision below — this formalizes the
same human/agent-driven loop instead of automating it away:
- `src/dev/captureHelper.js`'s `captureCurrentStage()` is the one-line browser-side call
  (`const { captureCurrentStage } = await import('/src/dev/captureHelper.js'); return await
  captureCurrentStage()`), reusing `useScreenshot.js`'s real-device-frame workarounds (ring-mask
  neutralisation, backdrop-filter strip, resolved page-bg) verbatim via three newly-exported
  functions (`resolvePageBg`, `neutraliseRings`, `makeOnCloneEachNode` — the last generalized to
  take a `screenClass` param so the library-viewer's `.stage-host__screen` reuses the exact same
  clone-time fixes as the real `.device__screen` frame) instead of a second copy of that logic.
- `tools/harness-capture.mjs save --from <file> --to <outFile> [--raw]` is the Node-side decode
  half: it either unwraps the Browser pane's auto-saved `[{type,text}]` tool-result shape (the form
  a capture takes when the payload is large enough to be saved to a file rather than returned
  inline) or, with `--raw`, treats `--from` as a bare base64 string — both paths decode to real PNG
  bytes and fail loud (not a silent no-op) on a missing flag or an unparseable `--from`.
- Verified live end-to-end against a real manifest target (`info-tag`, codm/iphone): navigated to
  the manifest's URL, ran the one-liner, decoded the returned base64 via `save --raw`, confirmed the
  output was a genuine 780×400 RGBA PNG (not garbage bytes) via `file`.
- 5 new locking tests in `tests/harness-capture.test.mjs` (13/13 passing in that file) cover both
  decode paths, directory auto-creation, and the two loud-failure cases.

### Phase 3 — the three payoffs
- **a. Pixel-diff CI gate — still open.** Not attempted this session; needs the headless-browser
  dependency decision above before it can run unattended in CI. `pixel-diff-gate.md` remains the
  detail spec for this phase.
- **b. Spec images in handoff docs — ✅ done 2026-09-13.** `scripts/export-handoff.mjs`'s
  `renderStorySpecMd` now scans `docs/Handoff/components/<id>/captures/*.png` at export time and
  emits a "## Reference Captures" section (one image per store/width, sorted deterministically) —
  reading real files on disk, the same "never hand-transcribed" discipline every other section in
  this generator already follows, so `--verify`'s byte-comparison genuinely catches a capture that
  arrived (or changed) since the spec was last regenerated, not just its absence. Verified live on
  `sku-card/spec.md`; a locking test (`tests/export-handoff.test.mjs`) proves both the embed and
  the drift-detection with a disposable fixture story.
- **c. `figma:prime` handing back a captured file — still open.** Not attempted this session;
  natural next step once Phase 3a's driver exists, since it would reuse the same capture mechanism
  against `figma:prime`'s existing step URLs instead of the library viewer's.

## Open questions

- **The real remaining blocker**: whether to add a headless-browser dependency (Playwright is the
  obvious choice — actively maintained, one package bundles a pinned Chromium) so Phase 3a/3c can
  run unattended instead of needing a human/agent to drive each shot. This is a real infra cost
  (download size, CI image/runner setup) genuinely worth a deliberate decision, not a default.
- Headless paint stability across CI runners (fonts, rasterization) once that dependency exists —
  carried over from `pixel-diff-gate.md`, cheaper to answer against 63 shots than 774.
- Which variant counts as "worst case" per story — **resolved**: `captureVariant` on the story
  (index or variant name), else the last authored variant by convention — implemented in
  `src/library/story.js` and `tools/harness-cli.mjs`.

## Next step

Either commit to the headless-browser dependency decision and build the automated driver (Phase
3a), or continue proving the curated set by hand for the remaining 6 stories and treat Phase 3a as
a separate, later authorization.
