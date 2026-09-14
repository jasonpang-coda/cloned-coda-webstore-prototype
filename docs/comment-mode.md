# Comment Mode — Collaborator Feedback

Lets reviewers leave Figma/Vercel-style comments **on** the prototype: enter
comment mode, click any element, a panel opens anchored to that spot, and you
type. Comments are shared via Supabase and scoped per store.

> **The feature lives in its own repo, [`yiweicoda/comment-kit`](https://github.com/yiweicoda/comment-kit)
> (`@coda/comment-kit`)** — a **framework-agnostic** package (a Lit Web
> Component core + a Vue adapter) any prototype on the team can depend on
> directly: `npm install github:yiweicoda/comment-kit`. It started life
> inside this repo as `packages/comment-kit` (built and dogfooded here through
> v0.45.0), then was extracted once stable. This webstore is its first
> consumer: it uses the **Vue adapter** (`@coda/comment-kit/vue`), configured
> in `src/main.js` (scope/containers/isolation). This doc covers the
> **webstore-specific wiring** — entry points, surface aggregation, and the
> container list. The package README (in the `comment-kit` repo) is the
> canonical reference for the kit itself.
>
> **Migrating from the old `#comment-kit` branch install:** the
> `github:yiweicoda/coda-webstore-prototype#comment-kit` branch is now
> **frozen** (deprecated, not deleted — existing installs keep working
> unchanged) in favor of the standalone repo above. Same Supabase table,
> `storagePrefix`, and data shape — reviewer identities and existing comments
> carry over with no migration needed on the data side, only the install URL
> changes whenever you're ready to move a consumer over.

## Turning it on

Comment mode is available on **Vercel deployments** (any `import.meta.env.PROD`
build or `*.vercel.app` host) plus a **local-dev opt-in**. It is deliberately NOT
gated on `__STORE_LOCKED__`, so it works on the locked per-store review builds
(`build:codm`, `build:fcm`, …) where the `/` dev console is compiled out.

- **Local dev:** set `localStorage.setItem('webstore:comments:devOverride','1')`
  and reload.
- **Toggle:** press **C**, click the 💬 button in the DeviceToolbar (present even
  on locked builds — the primary entry point there), or use the `/` console
  ("Comment mode" / "Show comments list") on non-locked builds.

First post asks for your name/initials (persisted). Press **C** or **Esc** to
exit; Esc also backs out of the open panel / list / identity gate first.

## How it works

| Piece | File (in [`comment-kit`](https://github.com/yiweicoda/comment-kit)'s `src/`) | Role |
|---|---|---|
| Kit config (webstore side) | **`src/main.js`** (this repo) | `createComments({...})` from `@coda/comment-kit/vue` — Supabase env, `scope: useTheme().theme`, `deploymentScope` from `__STORE_LOCKED__`, the 12-selector `containers` list, `ignoreSelectors: ['.toolbar']`, `storagePrefix: 'webstore:comments'`, `hotkey/launcher: false` (webstore has its own entry points). |
| State store | `core/store.js` | Framework-free singleton: mode, identity, CRUD, scope-filtered fetch + realtime, `enabled` gate, subscribe/emit. globalThis-pinned; `init()` once, `syncScope()` on scope change. Falls back to a per-scope `localStorage` cache when no Supabase is configured. |
| Backend client | `core/supabase.js` | Singleton client built from options; `null` when absent (feature no-ops, never crashes). |
| Anchor util | `core/anchor.js` | `resolveContainer` finds the nearest anchorable container from `config.containers`. `captureAnchor` builds a container-rooted selector + normalized coords + a semantic tag. Two resolvers: `resolveAnchor` (viewport px, for the fixed panel) and `resolveLocalAnchor` (the container's own untransformed layout space, for the pin). |
| Custom element | `elements/comment-layer.js` | `<comment-kit-layer>` (Lit). Renders the thread/compose panel, list, identity gate, banner, and optional launcher in a **shadow root** (style-isolated), owns the document capture-phase listeners + runtime cursor rule + hotkey, and subscribes to the store. Mounted at the app root (`position:fixed` panels escape any transform). |
| Pin manager | `elements/pins.js` | Pins can't live in the shadow root (they must scroll natively with host content), so they're imperative **light-DOM** children of each container, positioned `absolute` via `resolveLocalAnchor`, styled by an injected light-DOM stylesheet. |
| Vue adapter | `vue.js` | `createComments` plugin, `CommentLayer` (renders `<comment-kit-layer>`), and `useComments()` — Vue refs/computeds over the store, preserving the pre-agnostic surface. |

**Styling** is fixed/neutral (not store theme tokens) on purpose — the comment UI
must look identical on every store, exactly like the handoff inspector.

**Why pins live inside `.device__screen` but the panel doesn't:** a pin should
track its anchored element with zero lag, which only native browser scrolling
gives you — hence Teleport + `position:absolute` in the scroll container's own
coordinate space. The floating panel, list, and banner are window chrome, not
content, so they stay `position:fixed` at the app root; recomputing their
viewport position via `getBoundingClientRect()` on scroll is fine since they're
UI, not something the user visually expects to be glued frame-perfectly to
content the way a pin does.

## Element tagging & flow state

Each comment is tagged to the **semantic element beneath it** — component name
(`SkuCard`), a structural label, and a short text snippet (e.g. `"1,200 CP"`) —
so the list reads meaningfully and pins re-anchor by meaning (not raw pixels)
when the layout reflows across screen sizes.

Comments also work on **overlays** (checkout sheet, account popover, nav drawer,
region/language sheets, EA/KONAMI sign-in). The anchor records which container it
lives in and the flow's **surface** (e.g. `checkout`). A pin renders on-canvas
**only when its surface is open again** — placed inside the sheet, Teleported into
its own scrolling element (e.g. `.sheet__body`, not just the outer `.sheet__panel`)
so it tracks that inner scroll natively, with zero lag, exactly like the base
storefront — `.sheet__body` and the other overlays' inner scroll regions all
carry `position: relative` for this reason. While a surface is closed the
comment still appears in the list, tagged with its surface (e.g. "Checkout");
clicking the row opens the thread. `App.vue` derives the active surface by
static z-index priority (topmost wins) and publishes it via `setContext`.

The full `anchor` / `context` payload shapes are documented in
[comments-schema.md](./comments-schema.md).

## Exporting comments

The list panel can export threads as Markdown — author, timestamp, resolved
status, the anchor's element reference, surface, body, and replies for each —
ready to paste into an AI coding session. Export **all** (ignores the active
filter) or hand-pick a **selection** (checkboxes + a bulk bar, with Shift-click
for a range and Cmd/Ctrl-click for individual toggle); either way you're asked
whether to include resolved threads before the file downloads. See the
[package README's "Exporting comments"](https://github.com/yiweicoda/comment-kit#exporting-comments)
section for the full behavior and the `exportMarkdown()` API for wiring a
custom export button.

## Per-store isolation

All stores share one Supabase table, but each build reads **only its own store's
rows**: every query filters `store = useTheme().theme.value` and the realtime
channel subscribes with `store=eq.<store>`, backed by RLS. A locked per-store
build has one fixed theme, so FCM can never see COD:M comments, and vice-versa.

**Internal build vs. locked builds.** There's a second isolation boundary,
`deployment_scope` (`'internal'` | `'locked'`), because the same `store` value
can come from two different deployments: the locked `sku-card-codm` build
(always `store: "codm"`) and the internal multi-store build (`store: "codm"`
whenever its runtime theme switcher is set to COD:M). Without this, a comment
left on the internal build while showing COD:M would bleed into the standalone
locked COD:M deployment. `deployment_scope` is computed once per build from the
`__STORE_LOCKED__` compile-time flag and required to match on every fetch and
insert; the realtime channel adds a client-side check for it (Realtime's server
filter only reliably supports one column, already used for `store`).

## Backend setup

See [comments-backend.md](./comments-backend.md) for the Supabase table, RLS
policies, realtime toggle, and the two `VITE_SUPABASE_*` env vars (set them in
every Vercel project). Without the env vars, comment mode still toggles and works
in-memory for the session but nothing persists or syncs.
