---
epic: harness-design-quality
size: XL
status: done
created: 2026-09-12
owner: unassigned
last-verified: 2026-09-12
---

# Library Viewer UX — make it a design tool, not a test-runner UI (Plan 5)

_Not yet authorized. From the 2026-09-12 product-design assessment of the harness — see
[`plans/INDEX.md`](../../INDEX.md)._

## Context

`src/library/LibraryViewer.vue` is well-built as dev chrome (resizable panels, collapsed rail,
search, inspector handoff, no duplicated spec logic). The gap is that it treats a component as a
payload to render rather than an object to *look at and compare*. Three concrete consequences,
all observed live at `#library`.

---

## 1. Deep-link the full stage state (do this first — it unblocks two other plans) — ✅ done 2026-09-12

Implemented in `src/library/useLibrary.js`: the hash is now `#library=<id>&v=<variantIndex>&w=<width>`
(v/w omitted at their default so the common case stays a short URL), parsed with `URLSearchParams`.
`widthMode` moved from a local ref in `LibraryViewer.vue` into `useLibrary` as shared state so it's
part of the same URL. First open still uses `location.hash =` (so Back closes the library);
every subsequent change while open uses `history.replaceState` so switching variant/width doesn't
spam browser history — verified live (`w=samsung` → click "Responsive" → hash became
`w=responsive` via replaceState, `history.length` unchanged).

**Found and fixed a real correctness bug along the way**: `src/composables/useUrlState.js`'s merged
query-writer called `router.replace({ query })` with no `hash` key on every write, including its
own `{ immediate: true }` fire on mount — vue-router does not auto-preserve the URL fragment for an
object-form location missing `hash`, so this was silently wiping any `#library=…` or `#inspect=…`
fragment present on initial page load. It went unnoticed because nothing depended on the hash
surviving boot before now. Fixed by passing `hash: window.location.hash` explicitly (read from
`window.location`, not `route.hash` — the library/inspector hash writers use raw
`history.replaceState()`, which doesn't fire `popstate`, so vue-router's own reactive `route.hash`
can be stale).

`src/library/useLibrary.js` reflects only `#library` in the URL. The selected **story id,
variant, theme and width are not in the URL at all**, so a designer cannot send anyone
"look at *this* card, *this* variant, on FCM, at Android width."

This is conspicuous because the rest of the repo invested heavily in URL-state addressability
(device / orientation / store / overlay / `?sku=`); the library viewer is the one surface that
missed it.

**Do:** `#library=<story-id>&v=<index>&theme=<store>&w=<width>`, written with the same
`hashchange`/`replaceState` discipline `useLibrary.js` already documents (and the same care about
not colliding with the inspector's `#inspect=` fragment).

**Unblocks:**
- [`plans/tickets/in-progress/visual-capture-rig.md`](../in-progress/visual-capture-rig.md) — the rig addresses a shot by URL.
- The Figma Code Connect mappings in
  [`plans/tickets/in-progress/harness-false-confidence.md`](../in-progress/harness-false-confidence.md) — which currently emit
  `?library=<slug>` URLs that do nothing.
- Review-by-link generally (paste a link in a comment thread instead of "open the library, pick
  X, switch to FCM, hit Android").

## 2. Theme grid — one variant across all 12 stores at once — ✅ done 2026-09-12

Theme was a `<select>`: 12 stores, one at a time, so cross-store consistency had to be judged from
memory. Added a "Grid" toggle (icon button next to the Theme control) that renders the active
story+variant across all 12 registered stores simultaneously as small multiples, each cell labeled
with its store name.

**The harder part was plumbing, not UI.** `useStoreAssets`/`useStoreConfig` were hard-wired to the
single global `theme` ref (via `useTheme()`) — there was no way to get "FCM's assets" while the
global theme stayed COD:M. Exported `assetsFor(key)`/`configFor(key)` from those composables
(mirroring the `stringsFor(key, lang)` export already added for Gate 2), each a plain function
doing the same per-store lookup the reactive composable already did internally, just addressable
by an explicit key instead of only the global one. `src/library/StoryStage.vue` (the adapter
wrapping `@coda/harness-kit`'s real `StoryStage`) gained an optional `themeOverride` prop that,
when set, builds its `hostContext` from `assetsFor`/`configFor`/`stringsFor` for that store instead
of the reactive global composables — every other consumer (normal single-theme mode) is
unaffected.

Verified live: 12 cells, each showing genuinely distinct per-store content (different currency
icon shapes/colors per store — Codashop's diamond, Diablo Immortal's copper circle, PvZ's green
square, …), not a shared/stale render. State simulation (hover/focus/pressed/disabled) and the
single-store `<select>` are hidden while grid mode is on — a pseudo-state has no single target
across 12 simultaneous cells. Grid mode is a local, un-persisted UI toggle (not wired into the
`#library=` URL hash) — a scope cut, not an oversight; item 1's URL scheme could grow a `&grid=1`
dimension later if that turns out to matter.

## 3. Stage ergonomics — ✅ done 2026-09-12

Observed: the stage is top-anchored in a large void with no scale control. `InfoTag` renders as a
~270px chip adrift in a ~700×400 stage and is unreadable without zooming the entire browser;
`SkuCard` is fine but sits in ~60% empty space with the notes dock taking a third of the height.

- **Zoom**: a segmented control (1×/1.5×/2×/3×) using the CSS `zoom` property (not
  `transform: scale`, so the box actually reflows at the new size rather than just visually
  stretching) on the single-theme stage. Verified live — SkuCard visibly grows and stays centered
  at 2×. Not shown in grid mode, which uses its own fixed compact scale (`zoom: 0.4` per cell) so
  12 device-width stages fit at once; a per-cell adjustable zoom was cut from this pass.
- **Background swap**: Checker (default, unchanged) / Light / Dark, overriding
  `@coda/harness-kit`'s own painted device-screen background (the real store `--x-bg-page`/brand
  bg image) via a `:deep()` + `!important` class — necessary because that paint lives in a sibling
  package this viewer doesn't own. Verified live: switching to Light correctly replaced the store's
  real dark page colour behind the card, leaving the card's own (still-dark) fill untouched.
  **Scope cut**: only 3 modes, not the original 4 — "brand surface" was dropped since there's no
  single well-defined "brand ground" color across 12 differently-themed stores without adding
  per-store lookup complexity the ask didn't clearly justify.
- **Centering**: `:deep(.stage-host) { align-items: center; }` in the viewer's own scoped CSS
  (unconditional, not a toggle) — `.stage-host`'s flex alignment is owned by `@coda/harness-kit`,
  shared by other consumers (Handoff app, token-audit), so this overrides it locally rather than
  editing the shared package and risking those other surfaces.

## Next step

All three items done. No further open items in this plan.
