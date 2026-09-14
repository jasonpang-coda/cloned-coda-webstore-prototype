---
layout: home

hero:
  name: "{{TITLE}}"
  text: Interactive FE Handoff
  tagline: "TODO: one-line pitch — what's playable, wired to the real prototype tokens."
  actions:
    - theme: brand
      text: Flow Spec
      link: /README
    - theme: alt
      text: Open Playground
      link: /playground

features:
  - title: "TODO: feature 1"
    details: "e.g. The real component mounted live — not a redrawn mock."
  - title: Live token sandbox
    details: Edit the feature's duration/easing tokens live and watch the demo update instantly.
  - title: "TODO: timeline"
    details: "Scrub or play the feature's choreography beats at adjustable speed."
---

## Quick links

| Doc | What it covers |
|---|---|
| [Flow Spec](/README) | End-to-end behaviour + surface-by-surface specs |
| [Playground](/playground) | Live demo + token sandbox |

<!-- TODO: add rows for the other bundled spec docs -->

## Deployed site

> **Production URL:** _Deploy via Vercel, then paste the URL here._

This is a separate Vercel project from the main prototype — same repo, root directory `docs/Handoff/{{SLUG}}`. See [DEPLOY.md](./DEPLOY.md) for setup steps.

## Run locally

```bash
cd docs/Handoff/{{SLUG}}
npm install
npm run docs:dev    # http://localhost:5173
```

Build static output: `npm run docs:build` → `.vitepress/dist`

Deploy: `npx vercel login && npx vercel --prod` (or use the Vercel Dashboard — see DEPLOY.md)
