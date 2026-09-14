---
layout: home

hero:
  name: COD:M Story Carousel
  text: Interactive FE Handoff
  tagline: The real StoryCarousel mounted live — edit interval, crossfade and easing tokens, scrub a slide cycle, and flip portrait↔landscape, all wired to vendored prototype tokens.
  actions:
    - theme: brand
      text: Flow Spec
      link: /README
    - theme: alt
      text: Open Playground
      link: /playground

features:
  - title: The real component, live
    details: The playground mounts the actual StoryCarousel.vue (data-in / @cta-out) with the vendored Hitmarker font, token cascade and slide art — not a redrawn mock.
  - title: Live token sandbox
    details: Drag --motion-sku-story (interval) and --motion-sku-story-fade, swap the standard/decelerate easings, toggle autoplay & reduced-motion — the carousel updates instantly.
  - title: Slide-cycle timeline
    details: Scrub or play one cycle — linear progress fill → advance → crossfade — at adjustable speed.
  - title: Portrait ↔ landscape
    details: Flip the container across the 801px container-query line to see the 1:1 portrait / 2.6:1 landscape image swap.
---

## Quick links

| Doc | What it covers |
|---|---|
| [Flow Spec](/README) | StoryCarousel interaction model + choreography |
| [Motion Tokens](/motion-tokens) | Full motion system reference |
| [Typography](/typography) | Hitmarker text + condense system |
| [Component Breakdown](/component-breakdown) | Stack, page composition, props/state |
| [Playground](/playground) | Live carousel + token sandbox |

## Deployed site

> **Production URL:** _Deploy via Vercel, then paste the URL here._

This is a separate Vercel project from the main prototype — same repo, root directory `docs/Handoff/carousel-story-interaction`. See [DEPLOY.md](./DEPLOY.md) for setup steps.

## Run locally

```bash
cd docs/Handoff/carousel-story-interaction
npm install
npm run docs:dev    # http://localhost:5173
```

Build static output: `npm run docs:build` → `.vitepress/dist`

Deploy: `npx vercel login && npx vercel --prod` (or use the Vercel Dashboard — see DEPLOY.md)
