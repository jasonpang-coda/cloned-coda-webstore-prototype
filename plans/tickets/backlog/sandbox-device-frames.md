---
epic: sandbox
size: M
status: backlog
created: 2026-09-13
owner: unassigned
---

# Add device frames support

## Context

A PM Ideation Sandbox bundle's `CanvasHost.vue` renders the composed page as
a flat, unframed block in the browser viewport — confirmed visually during
the first real `/ideate` dry run (2026-09-13). The real app renders every
page inside a phone-chrome frame (iPhone / Android / Responsive), picked via
`useDeviceFrame()` and drawn by `src/components/DeviceFrame.vue` (613
lines). A PM reviewing an idea in the sandbox today has no way to see it as
it would actually look on a phone — no notch, no safe-area, no sense of
real viewport width.

## Goal

Let a PM/designer preview their composed page inside the same device-frame
chrome the real app uses, at minimum iPhone + Android + Responsive, so what
they review is closer to how it will actually look on a real store.

## Why size M, not L

The frame itself (`DeviceFrame.vue`) already exists and is proven — this is
a **vendoring + wiring** task, not new design work:
- Vendor `DeviceFrame.vue` and `useDeviceFrame.js` (read-only, same pattern
  as every other curated component) into the exporter's closure walk.
- Add the frame around `CanvasHost.vue`'s rendered page, with a switcher
  (mirroring `DeviceToolbar.vue`'s existing `<select>` markup, same pattern
  Milestone 2 already used for the store switcher).
- Confirm `DeviceFrame.vue`'s own import closure doesn't reach into
  excluded areas (nav chrome / sheets) — if it does, that is the one part
  of this ticket that could push it toward L; check early.

## Suggested approach

1. Add `DeviceFrame` + `useDeviceFrame` to `tools/sandbox/curated.manifest.mjs`'s
   `ALWAYS_VENDOR` (or a new always-vendor category for canvas chrome,
   distinct from curated *content* components).
2. `CanvasHost.vue` wraps `<slot>` in `<DeviceFrame :device="device">`,
   `device` from `useDeviceFrame()`.
3. A small device switcher, `v-if` more than one device is meaningful —
   always true here since Responsive is always available.
4. Re-run Milestone 1/2's QA suite (export, install, build, lint, multi-store
   switch) to confirm no regression — this ticket must not touch
   `export-sandbox.mjs`'s tested behavior beyond the manifest addition and
   `template/` changes.
5. Update `tools/sandbox/template/AGENTS.md` to mention the device switcher.

## Acceptance criteria

- A freshly exported bundle renders the composed page inside a real device
  frame by default (iPhone, matching the real app's own default in
  `useDeviceFrame.js`).
- A switcher lets the PM change device (iPhone / Android / Responsive)
  without restarting the dev server.
- `npm run lint` and `npm run build` stay clean on the example page and on
  a multi-store bundle.
- No change to `export-sandbox.mjs`'s CLI surface or existing bundle
  contents beyond the new vendored files + `CanvasHost.vue` template
  change.

## Out of scope

- Notch/safe-area-aware authoring guidance for the PM (a follow-up ticket
  if this turns out to matter in practice).
- Any change to the real app's own `DeviceFrame.vue` — vendored read-only,
  never edited.
