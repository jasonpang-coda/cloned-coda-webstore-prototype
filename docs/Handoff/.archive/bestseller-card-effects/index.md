---
layout: home

hero:
  name: "Best Seller Card Effects"
  text: Interactive FE Handoff
  tagline: "The running border, breathing bloom, metallic shimmer, and mount entrance on COD:M's BestSellerCard — all 7 states live, wired to the real prototype tokens."
  actions:
    - theme: brand
      text: Flow Spec
      link: /README
    - theme: alt
      text: Open Playground
      link: /playground

features:
  - title: One card, four states
    details: Toggle Compact and Selected independently to reach every §2.1 state — including compact-selected, whose correct behaviour is showing no ring at all.
  - title: Live token sandbox
    details: Edit the ring's rotation period, the bloom's breathe period, and the entrance duration live and watch the demo update instantly.
  - title: Warhammer 40,000 worked example
    details: Swap the ring variant to preview Rogue Trader's resolved dual-comet colours (imperial gold + warp-green) straight from its theme file — see README §2.1.c.
---

## Quick links

| Doc | What it covers |
|---|---|
| [Flow Spec](/README) | State matrix, token contract, gotchas, build order |
| [Playground](/playground) | Live demo + token sandbox + entrance timeline |
| [For your AI agent](/AGENTS) | Read-order, hard rules, and stop conditions |

## Deployed site

> **Production URL:** _Deploy via Vercel, then paste the URL here._

This is a separate Vercel project from the main prototype — same repo, root
directory `docs/Handoff/bestseller-card-effects`. See [DEPLOY.md](./DEPLOY.md)
for setup steps.

## Run locally

```bash
cd docs/Handoff/bestseller-card-effects
npm install
npm run docs:dev    # http://localhost:5173
```

Build static output: `npm run docs:build` → `.vitepress/dist`

Deploy: `npx vercel login && npx vercel --prod` (or use the Vercel Dashboard —
see DEPLOY.md)
