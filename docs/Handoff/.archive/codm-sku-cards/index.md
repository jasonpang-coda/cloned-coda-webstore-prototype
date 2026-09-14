---
layout: home

hero:
  name: "COD:M SKU Cards"
  text: Interactive FE Handoff
  tagline: "Just the SKU-card family and its playground — component reference plus live demos wired to the real prototype tokens. Nothing else."
  actions:
    - theme: brand
      text: Components
      link: /components
    - theme: alt
      text: Open Playground
      link: /playground

features:
  - title: Six cards, one skeleton
    details: SkuCard, SkuImageCard, HeroSkuCard, BestSellerCard, BundleSkuCard, GiftSkuCard — props, behaviours, and the gotchas that break them.
  - title: Live token sandbox
    details: Edit the entrance, select, conic-border and bloom tokens live and watch all six cards respond instantly.
  - title: Choreography timeline
    details: Scrub the page-load entrance cascade and the +350ms price reveal at adjustable speed.
---

## Quick links

| Doc | What it covers |
|---|---|
| [Components](/components) | The card family: props, states, containers, gotchas |
| [Playground](/playground) | Live card gallery + token sandbox + entrance timeline |

> Need more depth (end-to-end flow spec, motion/haptic/typography catalogues)?
> That's the full sibling handoff at `docs/Handoff/sku-cards`.

## Deployed site

> **Production URL:** _Deploy via Vercel, then paste the URL here._

This is a separate Vercel project from the main prototype — same repo, root directory `docs/Handoff/codm-sku-cards`. See [DEPLOY.md](./DEPLOY.md) for setup steps.

## Run locally

```bash
cd docs/Handoff/codm-sku-cards
npm install
npm run docs:dev    # http://localhost:5173
```

Build static output: `npm run docs:build` → `.vitepress/dist`

Deploy: `npx vercel login && npx vercel --prod` (or use the Vercel Dashboard — see DEPLOY.md)
