# Prototype Sharing Guide — External Stakeholders

How to build, theme-switch, and publish the COD:M web store prototype for
external review. The prototype is a fully static Vite/Vue build — there is no
server, no database, and no authentication layer required to run it.

---

## Two build modes: internal vs store-locked

The prototype builds in two modes, driven by the Vite mode flag — the
`@active-stores` virtual module in `vite.config.js` discovers store modules on
disk and, for a store-locked mode, emits only that store's import:

| Mode | Command | What you get |
|---|---|---|
| **Internal** (default) | `npm run build` | Every store bundled; the toolbar shows a store dropdown that switches themes instantly with no reload. For internal reviews and daily dev. |
| **Store-locked** | `npm run build:fcm` / `npm run build:codm` | ONLY that store's assets, fonts, theme CSS, config, and copy in the bundle. `index.html` boots into the store, and the store dropdown is hidden (the device-frame switcher stays). For sharing one store externally. |

Local preview of a locked store: `npm run dev:fcm` / `npm run dev:codm`.

In the internal build, switching stores is still the one-line client-side
operation — the dropdown in `DeviceToolbar.vue` sets
`document.documentElement.dataset.theme` via `useTheme().setTheme()`. The
dropdown lists whatever stores the build registered, so it scales to new
stores automatically and disappears in locked builds.

---

## Build

```bash
cd "SKU Card 3.0"
npm run build        # internal build, all stores + switcher
npm run build:fcm    # FC Mobile only (~3.0 MB vs 4.3 MB)
npm run build:codm   # COD:M only (~1.8 MB)
# output: dist/
```

The `dist/` folder is self-contained — copy it anywhere.

---

## Sharing one store as its own site (Vercel — recommended)

The repo root already has a `vercel.json` (SPA rewrite + immutable asset
caching) that works for every mode. To publish each store on its own URL,
create one Vercel project per store, all pointing at the same repo (the same
pattern as the sign-in motion handoff site):

1. [vercel.com/new](https://vercel.com/new) → Import the repo
2. Project name: e.g. `sku-card-fcm`
3. Framework preset: **Vite** · Root Directory: repo root
4. **Build Command (override):** `npm run build:fcm`
5. Output Directory: `dist`
6. Deploy → share the `sku-card-fcm.vercel.app` URL

Repeat with `npm run build:codm` for a COD:M-only site, and keep a third
project on plain `npm run build` for the internal all-stores review build.
Every `git push` redeploys all of them automatically.

> Adding a future store: create `src/stores/<store>/store.js` — nothing to
> register — then create one more Vercel project with Build Command
> `npx vite build --mode <store>`. Zero component edits — see
> `docs/multi-store-whitelabel.md`.

---

## Sharing options

### Option A — Netlify Drop (fastest, no account needed)

1. Run `npm run build`
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist/` folder onto the page
4. Share the generated `*.netlify.app` URL

Takes under 2 minutes. URL is permanent until you delete the site.

---

### Option B — Cloudflare Pages (recommended for ongoing use)

Best for: a persistent shareable URL, automatic redeploys when the repo updates,
and optional access control (password or SSO) for stakeholders.

**First deploy:**
1. Push the repo to GitHub / GitLab
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com) → Create a project
3. Connect the repo; set build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click Deploy — Cloudflare builds and publishes automatically
5. Share the `*.pages.dev` URL

**Access control (optional, free for up to 50 users):**
- In Cloudflare Zero Trust → Access → Applications, add the Pages URL
- Requires stakeholders to enter an email OTP — no accounts needed on their end

**Every subsequent update:** `git push` → Cloudflare rebuilds and redeploys automatically.

---

### Option C — Docker + nginx (self-hosted / behind a firewall)

Use when stakeholders are on a private network or you want a portable artifact.

**`Dockerfile`** (create in the project root):

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  location / { try_files $uri $uri/ /index.html; }\n}\n' \
    > /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**Build and run:**

```bash
npm run build
docker build -t codm-prototype .
docker run -p 8080:80 codm-prototype
# prototype now at http://localhost:8080
```

**Expose externally** (choose one):

| Tool | Command | Notes |
|---|---|---|
| Cloudflare Tunnel | `cloudflared tunnel --url http://localhost:8080` | Free, HTTPS, no port forwarding |
| ngrok | `ngrok http 8080` | Free tier; URL changes on restart |
| Tailscale Funnel | `tailscale funnel 8080` | Requires Tailscale on both ends |

The Docker image is also a portable artifact you can hand off directly
(`docker save codm-prototype | gzip > codm-prototype.tar.gz`).

---

## Recommendation by use case

| Scenario | Recommended option |
|---|---|
| Share ONE store externally on its own URL | Vercel project with `npm run build:<store>` |
| One-off stakeholder review, same week | Netlify Drop (drag in a store-locked `dist/`) |
| Ongoing design reviews over weeks/months | Vercel / Cloudflare Pages |
| Client is behind a corporate firewall | Docker + Cloudflare Tunnel |
| Sharing a specific build snapshot as a file | Docker image export |

---

## What stakeholders see

- The prototype runs inside a device frame (iPhone 17 Pro Max by default)
- They can switch between iPhone, Samsung S25+, and responsive (no frame) using
  the toolbar at the top
- On the internal build, a store dropdown in the toolbar toggles stores without
  any reload; on a store-locked build the dropdown is hidden and the site is
  pinned to one store

## What stakeholders do NOT see

- Source code (the build is minified and bundled)
- Upstream token tiers — seeds, spectrum ramps, and system tokens are in the
  bundle but are not exposed anywhere in the UI
- Any server or API — all data is static demo content in `App.vue`

---

**Last updated:** June 2026 · COD:M / FC Mobile Web Store prototype v0.10.0
