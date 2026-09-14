---
layout: home

hero:
  name: COD:M Sign-In Motion
  text: Interactive FE Handoff
  tagline: Playable previews, easing curves, choreography timeline, and live token sandbox — wired to the real motion tokens in the prototype.
  actions:
    - theme: brand
      text: Flow Spec
      link: /README
    - theme: alt
      text: Open Playground
      link: /playground

features:
  - title: Real token source
    details: Demos use vendored copies of motion.css, motion-sku.css, and keyframes.css synced from the prototype — same values, Vercel-safe.
  - title: Playable surfaces
    details: Sheet, loader, navbar swap, snackbar spring, and popover — each with Play/Dismiss and live token readouts.
  - title: Choreography timeline
    details: Scrub the 0 → 5000 → 5500 → 10500ms beats with adjustable playback speed.
  - title: Full sandbox
    details: Edit duration and easing tokens live, preview composite tokens, copy values to clipboard.
---

## Quick links

| Doc | What it covers |
|---|---|
| [Flow Spec](/README) | End-to-end sign-in choreography + surface-by-surface specs |
| [Motion Tokens](/motion-tokens) | Full motion system reference |
| [Haptic Tokens](/haptic-tokens) | Vibration token tiers + platform behaviour |
| [Component Breakdown](/component-breakdown) | Stack, page composition, overlay model |
| [Playground](/playground) | Full interactive token sandbox |

## Deployed site

> **Production URL:** _Deploy via Vercel, then paste the URL here._

This is a separate Vercel project from the main prototype — same repo, root directory `docs/Handoff/codm-signin-motion`. See [DEPLOY.md](./DEPLOY.md) for setup steps.

## Run locally

```bash
cd docs/Handoff/codm-signin-motion
npm install
npm run docs:dev    # http://localhost:5173
```

Build static output: `npm run docs:build` → `.vitepress/dist`

Deploy: `npx vercel login && npx vercel --prod` (or use the Vercel Dashboard — see DEPLOY.md)
