# Deploy to Vercel

This handoff site is a **separate Vercel project** from the main SKU Card 3.0 prototype. Both live in the same GitHub repo; only the root directory differs.

## Option A — Vercel Dashboard (recommended)

1. Go to [vercel.com/new](https://vercel.com/new) and import `yiweicoda/SKU-Card-3.0`.
2. Set **Root Directory** to `docs/Handoff/carousel-story-interaction` (Edit → enter path → Continue).
3. Confirm build settings (auto-detected from [`vercel.json`](./vercel.json)):

   | Setting | Value |
   |---|---|
   | Install Command | `npm install` |
   | Build Command | `npm run docs:build` |
   | Output Directory | `.vitepress/dist` |

4. Deploy. Copy the production URL (e.g. `carousel-story-handoff.vercel.app`).
5. Share that URL with the FE dev — no repo access required.

### Git auto-deploy

Each push to the connected branch redeploys automatically.

### Tokens, fonts & images on Vercel

Vercel cannot read files outside the Root Directory during build. The carousel demo mounts the **real** `StoryCarousel.vue`, which needs the whole token cascade plus the Hitmarker font and the slide art — all vendored under [`vendor/`](./vendor/) (committed copies of `src/tokens/*`, `src/stores/codm/fonts/*`, and the four `slide-*` images). After changing any of those in the prototype, run `npm run sync-tokens` and commit the updated vendor files.

## Option B — Vercel CLI

From this folder:

```bash
npx vercel login
npx vercel --prod
```

The CLI reads [`vercel.json`](./vercel.json) for build/output settings.

## Why a second project?

The prototype uses the repo-root [`vercel.json`](../../../vercel.json) with SPA rewrites for the Vue app (`dist/`). This site builds VitePress static HTML (`.vitepress/dist/`) and must not inherit those rewrites — hence a dedicated project with its own root directory.
