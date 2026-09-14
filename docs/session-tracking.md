# Session Tracking — Moderated & Unmoderated User Testing

Records where users tap/click, how far they scroll, and where they get stuck
— a Hotjar-style click/scroll recorder for usability testing — persisted to
Supabase, with an in-app heatmap/replay/scroll-depth viewer.

> **The feature lives in its own repo, [`yiweicoda/site-tracker`](https://github.com/yiweicoda/site-tracker)
> (`@coda/track-kit`)** — a **framework-agnostic** package (a Lit Web
> Component viewer + a framework-free capture core, with Vue/React adapters)
> any prototype can depend on directly:
> `npm install github:yiweicoda/site-tracker`. It started life inside this
> repo as `packages/track-kit` (built and dogfooded here through v0.57.0–
> v0.58.x — see those release notes for the build history), then was
> extracted once stable. Unlike [`@coda/comment-kit`](../packages/comment-kit/README.md),
> which stays a workspace member of *this* repo and publishes its built
> `dist/` to an orphan branch (`scripts/publish-comment-kit.sh`) because
> that's a monorepo-subfolder publish, track-kit is a genuinely separate repo
> — npm's `prepare` lifecycle script builds it fresh on install, no branch
> trick needed. This webstore is its first consumer: it uses the **Vue
> adapter** (`@coda/track-kit/vue`), configured in `src/main.js`
> (scope/containers/isolation — same container list comment-kit uses,
> `ANCHOR_CONTAINERS`). This doc covers the **webstore-specific wiring**; the
> package README (in the `site-tracker` repo) is the canonical reference for
> the kit itself, and [comment-mode.md](./comment-mode.md) is the sibling doc
> for the other Supabase-backed feature.

## Turning it on

Recording is on by default for any **deployed** context, and OFF by default on
**localhost/local dev** — the inverse of comment mode's gate, since tracking
should never silently record a developer's own poking around.

- **Local moderated/unmoderated test:** open the app with `?testmode=moderated`
  or `?testmode=unmoderated` — this both tags the session and force-enables
  recording for that visit.
- **Force on/off without the URL param:** the `/` console's "Resume/Pause
  session tracking" command (or `useTracking().enableLocally()` /
  `disableLocally()`) flips the kit's own
  `webstore:tracking:devOverride` localStorage flag — the same escape-hatch
  mechanism comment-kit ships, just for tracking's own storage prefix.
- **Viewer:** click the 📊 (`query_stats`) button in the DeviceToolbar, or use
  the `/` console ("Show session tracker" / "Show click heatmap" / "Show
  scroll depth"). The DeviceToolbar button is hidden on store-locked
  ("isolated") builds; the `/` console commands stay available there so the
  viewer is still reachable.

## Identity & retention

Each device gets a persistent `device_id` (localStorage, survives every future
visit); each page load gets a fresh `session_id`, tagged `moderated` or
`unmoderated` from `?testmode=`. Only the **latest 30 sessions** per store ×
deployment scope are kept — older sessions (and their events, via cascade
delete) are pruned right after each new session starts, since this runs on a
free-tier Supabase project.

## What it records

| type | when |
|---|---|
| `click` | every tap/click inside a configured container |
| `scroll` | throttled scroll-depth percentage on a scrolling container |
| `rage` | ≥3 clicks within ~40px and ~1s of each other |
| `dead` | a click on non-interactive content with no resulting DOM/URL change |
| `nav` | `history.pushState`/`replaceState`/`popstate`/`hashchange` |

Every click carries the same normalized anchor + point shape comment-kit's
pins use (survives layout changes, `transform: scale()`, and scroll), so the
viewer can re-anchor to the original element or fall back to normalized
coordinates when it's gone.

## The viewer panel

`<track-kit-heatmap>` — four tabs over the same recorded data:

- **Sessions** — pick a session; sessions with rage/dead clicks show `🔥`/`💤`
  badges.
- **Replay** — every click/rage/dead/nav step, in order, with a descriptive
  label (e.g. "Clicked SkuCard 'Buy Crystal Pack'"). Click any step to jump to
  it, or Play to step through automatically — each step **autoscrolls its
  container** to the click location and drops a dot there.
- **Heatmap** — canvas radial-gradient accumulation of every session's clicks
  for one surface (or all), with overlapping clicks glowing brighter
  (additive/`lighter` compositing).
- **Scroll Depth** — a red→blue canvas gradient (red = most sessions reached
  here, blue = fewest), opacity scaling with reach so low-traffic sections
  fade out instead of reading as flat color; dashed checkpoints at 100/75/
  50/25/0% depth; plus a distinct solid marker at the *actual* drop-off point
  — one past the deepest any single session reached, wherever that falls.

**Why the overlay scrolls with the page instead of staying fixed:** the same
reason comment-kit's pins are light-DOM, not shadow-DOM — a real child of the
container's own `position:relative` box is moved by the browser's compositor
when that container scrolls internally (like `.device__screen`'s
`overflow-y:auto`), with zero JS and zero lag. See
[`site-tracker`'s `src/elements/overlay.js`](https://github.com/yiweicoda/site-tracker/blob/main/src/elements/overlay.js)'s
`OverlayManager` for the technique, and its injected stylesheet for why the wrapper needs an explicit
high `z-index` (a `transform`-based carousel or similar can otherwise paint
above a `z-index:auto` sibling regardless of DOM order).

## Per-store isolation

Same model as comment-kit: every session/event row is filtered by
`store = useTheme().theme.value` **and** `deployment_scope` (`'internal'` vs
`'locked'`), so FCM never sees COD:M sessions and the internal multi-store
build never mixes with a locked per-store deployment showing the same theme.

## Backend setup

See [`site-tracker`'s `sql/tracking.sql`](https://github.com/yiweicoda/site-tracker/blob/main/sql/tracking.sql)
for the `test_sessions`/`test_events` schema + RLS — it reuses the **same**
Supabase project and `VITE_SUPABASE_*` env vars as comment-kit
([comments-backend.md](./comments-backend.md)); no separate project or env
setup needed.
