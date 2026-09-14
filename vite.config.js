import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, basename } from 'path'
import { readdirSync, existsSync, readFileSync, rmSync } from 'fs'
import { execFileSync } from 'child_process'

const STORES_DIR = resolve(__dirname, 'src/stores')

// codm is the default store on load (see @active-stores usage in
// useStoreAssets/useStoreConfig/useStoreStrings, and useTheme's THEMES[0]
// fallback) — kept explicit rather than "first alphabetically" so this stays
// true regardless of what other stores exist.
const DEFAULT_STORE = 'codm'

// Discover store modules by scanning the filesystem instead of a hand-maintained
// list. Onboarding a store is now "create src/stores/<key>/store.js" — nothing
// here to edit or forget. A directory only counts as a store once its store.js
// exists, so a scaffold-in-progress folder doesn't break other builds.
function discoverStores () {
  return readdirSync(STORES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(resolve(STORES_DIR, d.name, 'store.js')))
    .map(d => d.name)
    .sort()
}

export default defineConfig(({ mode }) => {
  // Whether this run is store-locked, and to which store, is fixed for the
  // life of this process — the --mode flag can't change mid-run, so a single
  // discovery at config time is correct for `store` and __STORE_LOCKED__.
  // The ALL-STORES case is different: which stores exist can change while
  // `npm run dev` keeps running (the store CMS creates one), so the
  // active-stores plugin's load() below re-scans the filesystem on every
  // request rather than reusing a snapshot taken at server boot — a store
  // created mid-session shows up on the next page reload, not just on
  // restart.
  const store = discoverStores().includes(mode) ? mode : null

  return {
    // __STORE_LOCKED__ is replaced at build time: true in store-locked builds
    // (build:codm, build:fcm, …), false in the multi-store dev/build. Components
    // gate prototype-only tooling (screenshot) behind this flag so published
    // store builds stay clean.
    define: {
      __STORE_LOCKED__: store !== null,
    },
    plugins: [
      vue(),
      {
        // Store-locked builds boot directly into their store: rewrite the
        // default data-theme on <html> so first paint uses the right theme.
        name: 'store-lock-html',
        transformIndexHtml(html) {
          return store ? html.replace('data-theme="codm"', `data-theme="${store}"`) : html
        },
      },
      {
        // stage-handoff — regenerates public/handoff/ (staged AI-readable
        // specs, index.json manifest, per-store resolved-token JSON) at the
        // start of a build, so it can never ship stale relative to
        // docs/Handoff/ or the token CSS on disk.
        //
        // Gated to unlocked (--mode all-stores / internal) builds ONLY.
        // stageFeatures() walks the ENTIRE docs/Handoff/ tree and
        // stageTokens() writes a resolved-token JSON for EVERY registered
        // store — both scoped to "everything", not to whichever store a
        // --mode <store> build is locked to. vercel.json also carves
        // `/handoff/` out of the SPA rewrite so it serves as plain static
        // files with no auth. Together that means a store-locked client
        // deploy previously shipped every OTHER client's brand tokens and
        // every feature's spec at a guessable URL — the opposite of the
        // "hide other tools/features from this client" intent behind
        // __STORE_LOCKED__ elsewhere in this file. External clients get
        // their own per-feature VitePress site (docs/Handoff/<slug>/) as
        // the intentionally-curated channel instead; this manifest is for
        // internal engineers and agents working against the multi-store
        // build. Not run in dev either way — `npm run stage:handoff`
        // covers manual/local iteration on it.
        name: 'stage-handoff',
        apply: 'build',
        buildStart () {
          if (store) {
            // Vite copies public/ into dist/ verbatim regardless of any
            // plugin logic — merely skipping regeneration (below) isn't
            // enough, because a STALE public/handoff/ from an earlier
            // unlocked build/dev session on this same checkout would still
            // get copied into THIS locked build's dist/ output. Actively
            // remove it so a locked build can never ship it, staged or not.
            rmSync(resolve(__dirname, 'public/handoff'), { recursive: true, force: true })
            return
          }
          execFileSync('node', [resolve(__dirname, 'scripts/stage-handoff.mjs')], { stdio: 'inherit' })
        },
      },
      {
        // pwa-manifest — build-time-only per-store Web App Manifest + service
        // worker emission, gated the same way as store-lock-html (only fires
        // for a locked `--mode <store>` build) and further gated on that
        // store having a `pwa.config.js` (only COD:M does today — see
        // src/stores/codm/pwa.config.js). public/ does exist (llms.txt, the
        // stage-handoff output above) and ships to the build root verbatim,
        // but a manifest/service-worker still can't live there as a static
        // file: each store deploys as its own single-store Vercel project,
        // so a generic static manifest would wrongly give every store's
        // deploy the same
        // name/icons — this instead emits one manifest scoped to whichever
        // store the build is locked to, mirroring store-lock-html's own
        // build-time `transformIndexHtml` rewrite.
        name: 'pwa-manifest',
        async transformIndexHtml(html) {
          if (!store) return html
          const pwaConfigPath = resolve(STORES_DIR, store, 'pwa.config.js')
          if (!existsSync(pwaConfigPath)) return html
          const { default: pwaConfig } = await import(pwaConfigPath)
          const touchIcon = pwaConfig.icons.find(i => i.purpose === 'any') ?? pwaConfig.icons[0]
          return html.replace(
            '</head>',
            `    <link rel="manifest" href="/manifest.webmanifest" />\n` +
            `    <meta name="theme-color" content="${pwaConfig.theme_color}" />\n` +
            `    <link rel="apple-touch-icon" href="/pwa/${basename(touchIcon.file)}" />\n` +
            `  </head>`,
          )
        },
        async generateBundle() {
          if (!store) return
          const pwaConfigPath = resolve(STORES_DIR, store, 'pwa.config.js')
          if (!existsSync(pwaConfigPath)) return
          const { default: pwaConfig } = await import(pwaConfigPath)

          for (const icon of pwaConfig.icons) {
            this.emitFile({
              type: 'asset',
              fileName: `pwa/${basename(icon.file)}`,
              source: readFileSync(resolve(STORES_DIR, store, icon.file)),
            })
          }

          this.emitFile({
            type: 'asset',
            fileName: 'manifest.webmanifest',
            source: JSON.stringify({
              name: pwaConfig.name,
              short_name: pwaConfig.short_name,
              theme_color: pwaConfig.theme_color,
              background_color: pwaConfig.background_color,
              display: 'standalone',
              start_url: '.',
              scope: '.',
              icons: pwaConfig.icons.map(icon => ({
                src: `/pwa/${basename(icon.file)}`,
                sizes: icon.sizes,
                type: 'image/png',
                purpose: icon.purpose,
              })),
            }, null, 2),
          })

          this.emitFile({
            type: 'asset',
            fileName: 'sw.js',
            source: readFileSync(resolve(__dirname, 'src/sw.js')),
          })
        },
      },
      {
        // Virtual @active-stores module — replaces the hand-maintained
        // src/stores/active.*.js manifest files. Each active store is a
        // static import (by literal path, not a computed one), so Rollup
        // still walks only those stores' dependency graphs and a store-locked
        // build never bundles another store's assets/fonts/theme CSS.
        name: 'active-stores',
        resolveId (id) {
          if (id === '@active-stores') return '\0@active-stores'
        },
        load (id) {
          if (id !== '\0@active-stores') return
          const active = store ? [store] : [DEFAULT_STORE, ...discoverStores().filter(s => s !== DEFAULT_STORE)]
          const imports = active
            .map((key, i) => `import s${i} from ${JSON.stringify(`/src/stores/${key}/store.js`)}`)
            .join('\n')
          const list = active.map((_, i) => `s${i}`).join(', ')
          return `${imports}\nexport const ACTIVE_STORES = [${list}]\n`
        },
        // Vite's dev server caches a virtual module's load() output in its
        // module graph until something invalidates it — it does NOT re-run
        // load() on every request, so the re-scan inside load() above only
        // matters the first time. Watch for a NEW src/stores/<key>/store.js
        // appearing (the store CMS creates one) and invalidate + full-reload
        // so a store created mid-session shows up without restarting `npm
        // run dev`. Only relevant to the all-stores case — a locked build's
        // single store is fixed for the process lifetime regardless.
        configureServer (server) {
          if (store) return
          server.watcher.on('add', file => {
            if (!/[\\/]src[\\/]stores[\\/][^\\/]+[\\/]store\.js$/.test(file)) return
            const mod = server.moduleGraph.getModuleById('\0@active-stores')
            if (mod) server.moduleGraph.invalidateModule(mod)
            server.ws.send({ type: 'full-reload' })
          })
        },
      },
    ],
    resolve: {
      // Array form (ordered): the comment-kit entries use exact-match regexes so
      // Neither @coda/comment-kit nor @coda/track-kit has a dev-alias — both
      // are real dependencies (github:yiweicoda/comment-kit,
      // github:yiweicoda/site-tracker), not local workspace members. They
      // resolve normally from node_modules/@coda/*/dist/* via each package's
      // own `exports` map, exactly like any other dependency. See
      // docs/comment-mode.md and docs/session-tracking.md.
      alias: [
        // @/ resolves to src/ — used by useStoreAssets and composables so import
        // paths stay store-relative without ../../ ladders in every component.
        { find: '@', replacement: resolve(__dirname, 'src') },
        { find: '@coda/harness-kit/vue/style.css', replacement: resolve(__dirname, 'packages/harness-kit/dist/style.css') },
        { find: '@coda/harness-kit/vue', replacement: resolve(__dirname, 'packages/harness-kit/dist/vue.js') },
        { find: '@coda/harness-kit', replacement: resolve(__dirname, 'packages/harness-kit/dist/index.js') },
      ],
    },
    build: {
      // Prevent SVGs from being inlined as data URIs — URL-encoded SVG attribute
      // values contain unescaped single quotes that break CSS url() parsing when
      // substituted via a custom property into mask/background-image.
      assetsInlineLimit(filePath) {
        if (filePath.endsWith('.svg')) return false
        // undefined → use Vite's default 4096-byte threshold for everything else
      },
    },
  }
})
