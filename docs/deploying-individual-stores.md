# Deploying Individual Stores

How to publish **each store as its own standalone site** — a dedicated URL per
store (e.g. an FC Mobile site and a COD:M site), where the visitor only ever
sees that one store, with no theme switcher and none of the other stores' assets
in the bundle.

This is the deep-dive companion to [`prototype-sharing-guide.md`](prototype-sharing-guide.md)
(which covers the quick internal all-stores share) and
[`multi-store-whitelabel.md`](multi-store-whitelabel.md) (the architecture). Read
this when you want to ship one store to external stakeholders on its own link.

---

## 1. The two build modes

The same codebase builds in two modes, selected by the Vite `--mode` flag. There
is **no source edit** to switch between them — only the build command differs.

| | Internal build | Store-locked build |
|---|---|---|
| **Command** | `npm run build` | `npm run build:fcm` · `npm run build:codm` |
| **Stores in bundle** | all of them | exactly one |
| **Store switcher** | dropdown in toolbar | hidden |
| **First paint** | `data-theme="codm"` (default) | the locked store |
| **Bundle size** | ~4.3 MB | FCM ~3.0 MB · COD:M ~1.8 MB |
| **Use for** | daily dev, internal review across stores | sharing one store externally |

### Why store-locked builds are truly isolated

A store-locked build is not just the internal build with the switcher hidden —
the other store is **physically absent** from the output:

- Each store is a self-contained module at `src/stores/<store>/store.js` that
  imports its own theme CSS, fonts, imagery, config, and copy.
- `vite.config.js`'s `@active-stores` virtual module discovers stores on disk
  and, for a store-locked mode, emits an import of **only** the active store's
  module.
- Because the other store's module is never imported, Rollup never walks its
  dependency graph — its assets, fonts, and `[data-theme]` CSS rules are dropped
  entirely.

That means an FCM site does not ship a single COD:M font or image, and vice
versa. (See [`multi-store-whitelabel.md`](multi-store-whitelabel.md) §1 for the
full mechanism.)

---

## 2. Build and preview locally first

Always verify a store-locked build locally before deploying.

```bash
cd "SKU Card 3.0"

# Build the store you want to ship
npm run build:fcm        # → dist/   (FC Mobile only)
# or
npm run build:codm       # → dist/   (COD:M only)

# Preview the production build exactly as it will deploy
npm run preview          # serves dist/ at http://localhost:4173
```

Open the preview and confirm:

- [ ] The site boots straight into the right store (correct logo, colours, copy).
- [ ] The toolbar shows **only** the device-frame control — no store dropdown.
- [ ] Fonts render correctly (FCM: Cruyff Sans · COD:M: Hitmarker).
- [ ] The sign-in flow, checkout footer, and currency labels match the store.
- [ ] No console errors.

To develop against a single store (hot reload, locked mode):

```bash
npm run dev:fcm          # or  npm run dev:codm
```

> `dist/` is overwritten by each build. If you need both stores' outputs at once
> (e.g. to inspect them side by side), build one, copy `dist/` aside, then build
> the other — but for deployment you never need this; each Vercel project runs
> its own build.

---

## 3. Deploy to Vercel (recommended)

The repo root [`vercel.json`](../vercel.json) (SPA rewrite + immutable asset
cache headers) is **store-agnostic** and applies to every build mode unchanged.
The model is **one Vercel project per store, all pointed at the same GitHub
repo** — identical to how the sign-in motion handoff site is a separate project
([precedent](Handoff/codm-signin-motion/DEPLOY.md)). Only the **Build Command**
differs between projects.

### Option A — Vercel Dashboard (recommended)

Do this once per store. Example for **FC Mobile**:

1. Go to [vercel.com/new](https://vercel.com/new) and import
   `yiweicoda/coda-webstore-prototype`.
2. **Project Name:** `sku-card-fcm` (this becomes the URL —
   `sku-card-fcm.vercel.app`).
3. **Framework Preset:** Vite (auto-detected).
4. **Root Directory:** leave as repo root (`./`) — **not** a subfolder. (The
   handoff site uses a subfolder; the store builds do not.)
5. **Build & Output Settings** — expand and override:

   | Setting | Value |
   |---|---|
   | Install Command | see **"Private git dependencies on Vercel"** below — plain `npm install` fails |
   | Build Command | `npm run build:fcm` |
   | Output Directory | `dist` |

6. **Deploy.** Copy the production URL and share it — no repo access needed by
   the viewer.

Repeat for **COD:M**: project name `sku-card-codm`, Build Command
`npm run build:codm`, everything else identical.

> **Keep a third project for the internal build** if you want an all-stores
> review link: same import, project name `sku-card-internal`, Build Command
> `npm run build` (the default). That one keeps the store dropdown.

### Private git dependencies on Vercel

`@coda/comment-kit` and `@coda/track-kit` (see
[comment-mode.md](comment-mode.md) / [session-tracking.md](session-tracking.md))
are private-repo git dependencies, not registry packages. **Plain `npm install`
fails on Vercel** with `Permission denied (publickey)` — a real bug hit and
fixed in v0.59.3, worth understanding so it doesn't reappear on a new project:

- npm/pacote **canonicalizes any recognized GitHub git dependency to an
  `ssh://git@github.com/...` URL when writing `package-lock.json`'s
  `resolved` field** — regardless of whether `package.json` specifies
  `github:owner/repo` or an explicit `git+https://…` URL, and regardless of
  whether the machine that generated the lockfile even has working SSH access
  (confirmed: it does this even when `ssh -T git@github.com` fails locally).
  A later `npm install` elsewhere fetches from that exact recorded URL — and
  Vercel's build container has no SSH key for either repo, so it fails.
- The fix is **not** trying to force an https URL into `package.json` (npm
  ignores that) and **not** an embedded `${TOKEN}`-in-the-URL trick (npm does
  not do environment-variable substitution inside dependency version
  strings — it will percent-encode the literal `${...}` text and fail auth).
  It's a **git-level URL rewrite**, applied via the Install Command, that
  intercepts the SSH URL npm insists on using and silently redirects it to an
  authenticated HTTPS URL before git ever sees it:

  **Install Command** (every project building this repo needs this, not just
  the store-locked ones — note the `--add` on both `git config` calls: without
  it, the second call silently **overwrites** the first instead of adding a
  second `insteadOf` value, since `url.<base>.insteadOf` is multi-valued —
  this exact mistake shipped once and broke every build with the same
  `Permission denied (publickey)` error, because the `ssh://git@github.com/`
  rule specifically — the one that matters, since that's the literal URL npm
  fetches — was the one getting wiped):
  ```
  git config --global --add url."https://${GH_PACKAGES_TOKEN}@github.com/".insteadOf "ssh://git@github.com/" && git config --global --add url."https://${GH_PACKAGES_TOKEN}@github.com/".insteadOf "git@github.com:" && npm install
  ```
- **Environment Variable** — add to every project (Settings → Environment
  Variables, all environments): `GH_PACKAGES_TOKEN` = a GitHub fine-grained
  Personal Access Token, **read-only, scoped to only the `comment-kit` and
  `site-tracker` repos** (Settings → Developer settings → Personal access
  tokens → Fine-grained → Repository access: select only those two repos;
  Permissions: Contents → Read-only). Do not use a classic all-repo token.
- **Local dev needs no change** — a working `gh auth login` (or an SSH key
  actually registered with GitHub) already resolves these dependencies fine
  locally; the rewrite above is only necessary where no such credential
  helper exists, i.e. CI/Vercel.

### Option B — Vercel CLI

From the repo root:

```bash
npx vercel login

# First deploy of a store — link/create a project, then override the build cmd:
npx vercel --prod \
  --build-env NPM_FLAGS="" \
  --name sku-card-fcm

# When prompted "In which directory is your code located?" → ./
# Set the Build Command to `npm run build:fcm` and Output Directory to `dist`.
```

The CLI persists these settings in the project, so subsequent
`npx vercel --prod` runs reuse them. For a second store, run the same command
from a fresh project name (`--name sku-card-codm`) and set its build command to
`npm run build:codm`.

> CLI tip: because both projects share one repo and one `vercel.json`, the only
> thing that distinguishes them is the **Build Command** stored on each Vercel
> project. Set it correctly once and Git pushes do the rest.

### Git auto-deploy

Each project redeploys automatically on every push to the connected branch. One
`git push` rebuilds **all** the store projects (each with its own build
command), so the FCM site, COD:M site, and internal site stay in sync.

### Optional: access control

The repo root [`middleware.js`](../middleware.js) is a Vercel Edge Middleware that
gates a deployment behind HTTP Basic Auth — the browser's native username/password
prompt, enforced before any HTML or asset is served. It ships in every build mode
unchanged (like `vercel.json`), but only takes effect per project once you configure it.

1. On the Vercel project you want to lock (e.g. `sku-card-codm`), go to
   **Settings → Environment Variables** and set `BASIC_AUTH_USER` and
   `BASIC_AUTH_PASSWORD` (optionally `BASIC_AUTH_REALM` to name the popup after that
   store). See `.env.example` for the full list.
2. Redeploy — env var changes only take effect on the next deployment, not retroactively.
3. That project now requires the credential; any project left with those vars **unset**
   stays open with no login (e.g. `sku-card-internal` for daily review).

Because each store deploys as its own Vercel project, each one gets its own
independent credential — e.g. `codm-webstore-prototype.vercel.app` and
`fcm-webstore-prototype.vercel.app` can use different logins, or none. Credentials
are never committed: they live only in each project's Vercel environment variables,
and are read server-side by the middleware — never inlined into the client bundle.

To test the gate locally, use `vercel dev` (not `npm run dev`/`npm run preview` — those
run Vite directly and never execute Vercel middleware) with the vars set in a local
`.env`.

Vercel's own **Deployment Protection** (Vercel Authentication or a shared password,
Project → Settings → Deployment Protection) remains a plan-gated alternative if you'd
rather not self-host the gate.

---

## 4. Deploy elsewhere

The output is a plain static `dist/` folder — any static host works. Build the
locked store first, then point the host at `dist/`.

### Netlify Drop (fastest, no account)

```bash
npm run build:fcm
```

Then drag the `dist/` folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
You get an instant `*.netlify.app` URL. (For SPA fallback on Netlify, add a
`dist/_redirects` file containing `/*  /index.html  200` before dragging, or
configure it in the Netlify UI — the repo `vercel.json` rewrite is Vercel-only.)

### Cloudflare Pages

Connect the repo, set **Build command** `npm run build:fcm` and **Output
directory** `dist`. Create a second Pages project for COD:M with
`npm run build:codm`. Free email-OTP access control is available under
Cloudflare Zero Trust → Access.

### Docker + nginx (self-hosted / behind a firewall)

```dockerfile
# Dockerfile
FROM node:24-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build:fcm        # ← pick the store here

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  location / { try_files $uri $uri/ /index.html; }\n}\n' \
    > /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```bash
docker build -t sku-card-fcm .
docker run -p 8080:80 sku-card-fcm     # http://localhost:8080
```

Expose externally with `cloudflared tunnel --url http://localhost:8080`,
`ngrok http 8080`, or `tailscale funnel 8080`.

---

## 5. Verifying isolation (optional but reassuring)

To prove a locked build excludes the other store, inspect `dist/` after building:

```bash
npm run build:fcm

# index.html boots into FCM
grep -o 'data-theme="[a-z]*"' dist/index.html        # → data-theme="fcm"

# No COD:M Hitmarker fonts shipped
ls dist/assets | grep -ci hitmarker                  # → 0

# No COD:M content images shipped
ls dist/assets | grep -ciE 'cod-point|crate|kui-ji|midnight-sun'   # → 0

# No COD:M theme rules in the CSS
grep -c 'data-theme="codm"' dist/assets/*.css        # → 0

# Shared payment + Coda art IS present (market-level, ships in every build)
ls dist/assets | grep -ciE 'google-apple|paypal-venmo|coda|rating' # → > 0
```

The mirror checks for `npm run build:codm` look for `fcm-wordmark`, `Carousel`,
`ea-logomark`, etc. (all → 0) and confirm Hitmarker fonts ARE present.

> One known, accepted exception in COD:M builds: `MP Simple.svg` (~1 KB) ships
> because two shared components import it directly per the skill-mandated MP-icon
> pattern. It is never rendered in COD:M and is too small to matter.

---

## 6. Adding a new store to the deploy lineup

When a new store module exists (see the add-a-store playbook in
[`multi-store-whitelabel.md`](multi-store-whitelabel.md) §7), wiring it for
individual deploy is one step:

1. **Create the Vercel project** — import the same repo, set Build Command
   `npx vite build --mode <store>`, Output Directory `dist`, and the Install
   Command + `GH_PACKAGES_TOKEN` env var from **"Private git dependencies on
   Vercel"** above (easy to forget on a fresh project — plain `npm install`
   will fail). Nothing to register in `vite.config.js` or `package.json`
   first — the `@active-stores` virtual module discovers the store module on
   disk. (A `dev:<store>` / `build:<store>` script pair in `package.json` is
   an optional convenience alias, not a requirement.)

No component edits, no changes to the other stores' projects.

---

## 7. Quick reference

| Task | Command |
|---|---|
| Build FC Mobile only | `npm run build:fcm` |
| Build COD:M only | `npm run build:codm` |
| Build all stores (internal) | `npm run build` |
| Preview a built `dist/` | `npm run preview` |
| Dev a single locked store | `npm run dev:fcm` / `npm run dev:codm` |

| Vercel project | Build Command | Output | Root |
|---|---|---|---|
| `sku-card-fcm` | `npm run build:fcm` | `dist` | `./` |
| `sku-card-codm` | `npm run build:codm` | `dist` | `./` |
| `sku-card-internal` (optional) | `npm run build` | `dist` | `./` |

---

**Last updated:** August 2026 · COD:M / FC Mobile Web Store prototype
