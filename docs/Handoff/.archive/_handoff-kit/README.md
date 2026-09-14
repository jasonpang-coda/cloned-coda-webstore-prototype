# Handoff Kit

A copy-on-scaffold template for interactive VitePress handoff sites. One command creates a fully wired site; only the small per-feature delta needs authoring.

## Quick start

```bash
node docs/Handoff/_handoff-kit/create-handoff.mjs <slug> "<Title>"
cd docs/Handoff/<slug>
npm install
npm run docs:dev    # http://localhost:5173
```

Then author the per-site delta (see [What to author](#what-to-author)).

---

## Scaffold vs update

| Command | When to use |
|---|---|
| `create-handoff.mjs <slug> "<Title>"` | New site — copies the full template, refuses to overwrite |
| `create-handoff.mjs --update <slug>` | Existing site — re-copies only [generic files](#generic-files), never touches `handoff.config.mjs`, feature components, or markdown |

**Vercel constraint:** each Vercel project has `Root Directory = docs/Handoff/<slug>` and cannot read parent dirs at build time. The kit is copied *into* each site — it is not imported across folders.

---

## What to author

The entire per-site delta is three things:

### 1. `handoff.config.mjs` (~40 lines)

The single file of variability. Everything in `.vitepress/` and `scripts/` reads from it.

```js
export default {
  title: 'My Feature Handoff',
  description: '…',
  pages: [
    { text: 'Flow Spec', link: '/README' },
    { text: 'Motion Tokens', link: '/motion-tokens' },
    { text: 'Playground', link: '/playground' },
  ],
  vendor: {
    roots: {
      tokens: 'src/tokens',
      fonts: 'src/stores/codm/fonts',
      images: 'src/stores/codm/img/content',
    },
    tokens: [
      // Ordered CSS cascade — theme file first
      'ds/themes/codm.css',
      'ds/system.css',
      // … add tiers the feature needs
    ],
    urlRewrites: [
      // codm.css @font-face points at prototype fonts; fix the vendored copy:
      { in: 'codm.css', from: '../../../stores/codm/fonts/', to: '../fonts/' },
    ],
    fonts: ['HitmarkerNormal-Regular.woff2', /* … */],
    images: ['slide-kui-ji-portrait.jpg', /* … */],
  },
  tokenCatalog: {
    durations: [
      { name: '--motion-duration-slow', label: 'Entrance', min: 150, max: 800, step: 10 },
    ],
    easings: [
      { name: '--motion-ease-standard', label: 'Standard' },
    ],
  },
}
```

`scripts/sync-tokens.mjs` reads the vendor manifest and generates `vendor/tokens/index.css` (the single CSS entry point the theme imports). After changing any vendor entry, run `npm run sync-tokens`.

### 2. Feature components (1–2 files)

Drop `.vue` files in `.vitepress/theme/components/` — they auto-register globally by filename with no edits to `theme/index.js`.

Compose the kit primitives:

```vue
<!-- MyFeaturePlayground.vue -->
<TokenSandbox title="Live demo" :durations="durations" :easings="easings">
  <template #default="{ values }">
    <!-- the live demo stage; values is a map of token name → current value -->
  </template>
  <template #controls>
    <!-- feature-specific toggles (autoplay, reduced-motion shim, etc.) -->
  </template>
  <template #hint>Note: …</template>
</TokenSandbox>
```

```vue
<!-- MyFeatureTimeline.vue -->
<BeatTimeline :beats="beats" :range="5000">
  <template #default="{ ms, progress }">
    <!-- stage visual as pure function of ms -->
  </template>
</BeatTimeline>
```

### 3. `index.md` + `playground.md` prose

Fill in the TODO markers — hero tagline, feature feature cards, and section intros.

---

## Kit component APIs

### `TokenSandbox`

Renders duration sliders + easing dropdowns + `TokenChip` readouts + Reset button. Seeds defaults from `getComputedStyle` on mount.

| Prop | Type | Description |
|---|---|---|
| `title` | `String` | Section heading |
| `durations` | `Array<{name, label, min, max, step}>` | Duration tokens to expose |
| `easings` | `Array<{name, label}>` | Easing tokens to expose |

**Slots:**

| Slot | Receives | Purpose |
|---|---|---|
| `default` | `{ values }` — `{ [tokenName]: currentValue }` | Live demo stage; values are CSS values (e.g. `'400ms'`) |
| `controls` | — | Feature toggles (below the sliders) |
| `hint` | — | Footer note (below Reset) |

Provides `tokenRoot` (a `Ref<HTMLElement>`) — child `EasingCurve` components inject it to read overridden tokens from the correct root.

### `BeatTimeline`

RAF-driven scrub/play harness. Play button, speed select (0.25×–2×), scrub slider, beat markers (clickable jump-to).

| Prop | Type | Description |
|---|---|---|
| `beats` | `Array<{ms, label}>` | Named beat markers |
| `range` | `Number` | Total duration in ms |
| `step` | `Number` | Scrub slider resolution (default 50) |

**Slot:**

| Slot | Receives | Purpose |
|---|---|---|
| `default` | `{ ms, progress }` | Stage rendering — pure function of current ms |

**Exposed:** `jumpTo(ms)`, `togglePlay()`

### `EasingCurve`

SVG cubic-bezier visualiser. Reads the token value from the nearest `tokenRoot` (injected) on mount and on `tokenRoot` change.

| Prop | Type | Description |
|---|---|---|
| `token` | `String` | CSS custom property name, e.g. `'--motion-ease-standard'` |

### `TokenChip`

Small inline readout of a CSS custom property value. Used by `TokenSandbox` internally; also usable standalone in markdown.

| Prop | Type | Description |
|---|---|---|
| `token` | `String` | CSS custom property name |

---

## Generic files

These are re-copied by `--update` — never hand-edit them in a site:

```
scripts/sync-tokens.mjs
.vitepress/config.mjs
.vitepress/theme/index.js
.vitepress/theme/custom.css
.vitepress/theme/utils/tokens.js
.vitepress/theme/utils/bezier.js
.vitepress/theme/components/EasingCurve.vue
.vitepress/theme/components/TokenChip.vue
.vitepress/theme/components/TokenSandbox.vue
.vitepress/theme/components/BeatTimeline.vue
vercel.json
.gitignore
```

Per-site files (never touched by `--update`):

```
handoff.config.mjs
.vitepress/theme/components/<FeatureX>.vue   ← your feature components
index.md, playground.md, README.md, …       ← spec + playground content
vendor/                                      ← generated by sync-tokens
package.json                                 ← slug baked in at scaffold time
DEPLOY.md                                    ← slug baked in at scaffold time
```

---

## Gotchas (hard-won)

- **Full token cascade** — if the feature uses the real component (vendored `.vue`), vendor ALL 11 token tiers (theme → system → semantics → space → text-styles → extensions → motion-sku → keyframes → effects → reduced-motion). Missing tiers = unstyled demo.
- **`@font-face` URL rewrite** — `codm.css` references fonts at `../../../stores/codm/fonts/`. Add the rewrite in `vendor.urlRewrites` so the vendored copy points at `../fonts/`.
- **VP font restore** — vendored `text-styles.css` sets Hitmarker on `html` globally. `custom.css` restores `--vp-font-family-base` for doc prose — this is already in the kit's `custom.css`, no action needed.
- **Container queries** — if the feature component uses `@container`, the demo stage element needs `container-type: inline-size` on its wrapper.
- **`prefers-reduced-motion` shim** — the UI can't fake the OS `matchMedia`. Add a HANDOFF-ONLY `forceReduceMotion` prop to the vendored component so the sandbox toggle works. Document it in a code comment.
- **SSR guards** — `getComputedStyle` and `matchMedia` are client-only. Guard with `typeof document !== 'undefined'` and read computed styles in `onMounted`.
- **Tailwind build warning** ("content option missing") — benign, VitePress triggers it. Ignore.
- **Preview MCP / Chrome EPERM in sandbox** — `preview_start` fails. Verify via `npm run docs:build` + `curl` on the dist folder instead.

---

## Deploying

Each site is a separate Vercel project. See the site's own `DEPLOY.md` (generated from the template) for step-by-step instructions. The short version: Vercel Dashboard → New Project → Root Directory = `docs/Handoff/<slug>` → Deploy.
