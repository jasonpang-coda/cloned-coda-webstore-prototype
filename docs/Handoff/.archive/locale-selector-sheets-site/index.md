---
layout: home

hero:
  name: "Language & Region Selector Sheets"
  text: Interactive FE Handoff
  tagline: "RegionSelectorSheet's searchable, continent-grouped market picker and LanguageSelectorSheet's flat language list — all 19 §2 states live, wired to the real prototype tokens."
  actions:
    - theme: brand
      text: Flow Spec
      link: /README
    - theme: alt
      text: Open Playground
      link: /playground

features:
  - title: Two sheets, one demo frame
    details: Switch between the region and language sheets, toggle isMobile, and watch the region→language reset rule fire live when you pick a region that doesn't offer the current language.
  - title: Live token sandbox
    details: Edit the entrance, exit, and hover/scroll-fade durations and easings live and watch the demo update instantly.
  - title: The RTL gate, made visible
    details: The real sheet has no in-UI path to an RTL active language today — a clearly-labelled demo-only toggle previews that state anyway. See README §11.
---

## Quick links

| Doc | What it covers |
|---|---|
| [Flow Spec](/README) | State matrix, token contract, gotchas, build order |
| [Playground](/playground) | Live demo + token sandbox + enter/exit timeline |
| [Motion Tokens](/motion-tokens) | The house motion system this feature draws from |
| [Haptic Tokens](/haptic-tokens) | The `v-haptic` patterns used on every row/close button |
| [Component Breakdown](/component-breakdown) | Full FE dev handover reference for the whole prototype |
| [Typography](/typography) | The type-style system, including the condense rule |
| [For your AI agent](/AGENTS) | Read-order, hard rules, and stop conditions |

## Deployed site

> **Production URL:** _Deploy via Vercel, then paste the URL here._

This is a separate Vercel project from the main prototype — same repo, root
directory `docs/Handoff/locale-selector-sheets`. See
[DEPLOY.md](./DEPLOY.md) for setup steps.

## Run locally

```bash
cd docs/Handoff/locale-selector-sheets
npm install
npm run docs:dev    # http://localhost:5173
```

Build static output: `npm run docs:build` → `.vitepress/dist`

Deploy: `npx vercel login && npx vercel --prod` (or use the Vercel Dashboard —
see DEPLOY.md)
