---
layout: home

hero:
  name: "SKU Cards"
  text: Interactive FE Handoff
  tagline: "The whole SKU-card family — SkuCard, SkuImageCard, HeroSkuCard, BestSellerCard, BundleSkuCard, GiftSkuCard — specced, token-cited, and playable against the real prototype tokens."
  actions:
    - theme: brand
      text: Flow Spec
      link: /README
    - theme: alt
      text: Open Playground
      link: /playground

features:
  - title: Six cards, one skeleton
    details: Gradient ring, sku-enter cascade, hover/press/selected — the shared anatomy every card reuses, plus the per-card divergences.
  - title: Live token sandbox
    details: Edit the entrance, select, conic-border and bloom tokens live and watch all six cards respond instantly.
  - title: Choreography timeline
    details: Scrub the page-load entrance cascade and the +350ms price reveal at adjustable speed.
---

## Quick links

| Doc | What it covers |
|---|---|
| [Flow Spec](/README) | End-to-end behaviour, shared anatomy, surface-by-surface specs, gotchas |
| [Motion Tokens](/motion-tokens) | The canonical motion-token catalogue |
| [Component Breakdown](/component-breakdown) | Full component API reference |
| [Haptics](/haptic-tokens) | Semantic haptic tokens (the `select` / `success` feedback) |
| [Typography](/typography) | Type styles + the Hitmarker condense the cards use |
| [Playground](/playground) | Live demo + token sandbox + timeline |

## Deployed site

> **Production URL:** _Deploy via Vercel, then paste the URL here._

This is a separate Vercel project from the main prototype — same repo, root directory `docs/Handoff/sku-cards`. See [DEPLOY.md](./DEPLOY.md) for setup steps.

## Run locally

```bash
cd docs/Handoff/sku-cards
npm install
npm run docs:dev    # http://localhost:5173
```

Build static output: `npm run docs:build` → `.vitepress/dist`
