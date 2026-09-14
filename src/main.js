// Active store modules — MUST be the first import. Each store module pulls in
// its themes/<store>.css as a side effect, keeping the theme files ahead of the
// :root structural tiers below (a [data-theme] block at equal specificity loses
// to a later :root declaration — see web-store-tokens §3). Which manifest this
// resolves to is decided by the build mode in vite.config.js.
import '@active-stores'

import { createApp } from 'vue'
import { createComments } from '@coda/comment-kit/vue'
import { createTracking } from '@coda/track-kit/vue'
import { createInspector } from '@coda/inspect-kit/vue'
import '@coda/inspect-kit/vue/style.css'
import App from './App.vue'
import router from './router.js'
import { vRipple } from './directives/vRipple.js'
import { vHaptic } from './directives/vHaptic.js'
import { useTheme } from './composables/useTheme.js'

// Design-system tokens (4-tier cascade). Imported here (not via CSS @import) so
// they bundle regardless of the @tailwind directive order in style.css.
import './tokens/ds/system.css'        // sys-* role ramps (alias spectrums)
import './tokens/ds/semantics.css'     // semantic tokens components consume (alias system)
import './tokens/ds/space.css'         // spacing/radius/size/elevation scale
import './tokens/ds/text-styles.css'   // .text-style-* typographic classes
import './tokens/ds/extensions.css'    // brand effects with no DS slot

// Light + material tokens — the shared scene light (direction/type/colour)
// and the composable per-material axes (F0, diffuse albedo, shimmer shape)
// that derive their angle/colour from it. See .claude/skills/material-fx.
import './tokens/light.css'
import './tokens/materials.css'

// Motion design tokens — imported here (not via CSS @import) so they bundle
// reliably regardless of the @tailwind directive order in style.css.
import './tokens/motion.css'
import './tokens/motion-sku.css'
import './tokens/motion-trust.css'
import './tokens/keyframes.css'
import './tokens/effects.css'
import './tokens/reduced-motion.css'

import './style.css'

// Anchorable containers, innermost scroll regions before outer panels;
// .device__screen last = default/fallback. All are position:relative.
// Shared by comment-kit (pin placement) and track-kit (click/scroll capture)
// — both anchor to the same DOM regions.
const ANCHOR_CONTAINERS = [
  '.sheet__body',          // checkout / item-summary / claim-gift sheets' scrolling body
  '.signin-sheet__body',   // SignInSheet's scrolling body
  '.selector__body',       // Region/LanguageSelectorSheet's scrolling body
  '.nav-drawer__nav',      // NavDrawer's scrolling menu list
  '.ea-page__scroll',      // EaSignInPage's scrolling body
  '.konami-page__scroll',  // KonamiSignInPage's scrolling body
  '.sheet__panel',         // sheet header/footer chrome outside the scroll region
  '.nav-drawer__panel',    // NavDrawer chrome outside .nav-drawer__nav
  '.account-popover',      // AccountPopover (no inner scroll region)
  '.ea-page',              // EaSignInPage chrome outside .ea-page__scroll
  '.konami-page',          // KonamiSignInPage chrome outside .konami-page__scroll
  '.device__screen',       // base storefront + txn history (fallback / default)
]

createApp(App)
  .use(router)
  .directive('ripple', vRipple)
  .directive('haptic', vHaptic)
  // Collaborator comment mode (@coda/comment-kit — its own repo,
  // github:yiweicoda/comment-kit; see docs/comment-mode.md). This config
  // block is the webstore's ONLY comment-specific wiring besides App.vue's
  // entry points + surface aggregation.
  .use(createComments({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    // Isolation: active store theme (reactive — internal build switches at
    // runtime) × build flavour. Same DB columns/values as pre-extraction.
    scope: useTheme().theme,
    deploymentScope: __STORE_LOCKED__ ? 'locked' : 'internal',
    containers: ANCHOR_CONTAINERS,
    ignoreSelectors: ['.toolbar'],   // DeviceToolbar clicks are never pin placements
    // Available on any production/Vercel deployment; local dev opts in via the
    // kit's built-in <prefix>:devOverride localStorage escape hatch.
    enabled: () => import.meta.env.PROD || location.hostname.endsWith('.vercel.app'),
    // Keep the pre-extraction key prefix so reviewer identities + caches survive.
    storagePrefix: 'webstore:comments',
    // The webstore has its own entry points (C key with console/library guards
    // in App.vue, the DeviceToolbar 💬 button, `/` console commands).
    hotkey: false,
    launcher: false,
  }))
  // Session click/scroll tracking for moderated + unmoderated user testing
  // (@coda/track-kit — its own repo, github:yiweicoda/site-tracker; see
  // docs/session-tracking.md). Reuses the same Supabase project/env as
  // comment-kit, isolated by the same scope × deploymentScope pair, so it
  // never mixes with comment rows (they live in different tables) or
  // another store's sessions.
  .use(createTracking({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    scope: useTheme().theme,
    deploymentScope: __STORE_LOCKED__ ? 'locked' : 'internal',
    containers: ANCHOR_CONTAINERS,
    ignoreSelectors: ['.toolbar'],
    storagePrefix: 'webstore:tracking',
    // On by default for any deployed context; OFF by default on localhost/
    // local dev, same posture as comment-kit — a facilitator running a
    // moderated/unmoderated test locally opts in explicitly via ?testmode=.
    // The kit's own `webstore:tracking:devOverride` localStorage escape
    // hatch (flipped by the console's "Resume session tracking" command)
    // also wins over this, for pausing/resuming without the URL param.
    enabled: () => new URLSearchParams(location.search).has('testmode')
      || (!import.meta.env.DEV
        && location.hostname !== 'localhost'
        && location.hostname !== '127.0.0.1'),
  }))
  // Element inspector (@coda/inspect-kit — packages/inspect-kit in this
  // workspace; see packages/inspect-kit/README.md). Prototype-only: hidden
  // in store-locked builds via App.vue's `v-if="!isStoreLocked"` on
  // <InspectorLayer>, same gating comment-kit's own UI doesn't need since it
  // ships its own `enabled` posture.
  .use(createInspector({
    screenRoot: '.device__screen',
    // The library viewer's own chrome must stay interactive while inspecting
    // its stage (see library/LibraryViewer.vue's `.lib__*` classes). Same
    // reasoning for the handoff surface's sidebar/topbar/tabs (handoff/
    // HandoffApp.vue) — it retargets this same inspector at its component
    // stage (see handoff/components/TokenContract.vue) rather than running a
    // second instance, so its own nav must stay clickable too.
    chromeSelectors: '.toolbar, .inspector, .lib__sidebar, .lib__topbar, .lib__controls, .lib__docs, .handoff__sidebar, .handoff__topbar, .handoff__tabs',
    // Reverse-value-match tiebreak (see packages/inspect-kit's token-map.js):
    // several tokens in this repo's 4-tier cascade (.claude/skills/
    // web-store-tokens) commonly resolve to the identical computed colour —
    // e.g. --x-text-header-default -> --x-sys-colour-ink-heavy ->
    // --x-palette-neutral-0 can all be the same white in a given theme.
    // Without a tierRank every match ranks 0 and the tiebreak falls to
    // alphabetical order, which surfaces an upstream token (or an unrelated
    // extensions-tier one that just happens to share the value, e.g.
    // --x-brand-google is also pure white) instead of the semantic token a
    // component actually references — confusing when inspecting.
    //
    // Rank 0 is reserved for the semantic-tier prefixes components are
    // meant to consume (--x-bg-/-text-/-border-/-pad-/-gap-/-radius-/-size-,
    // the legacy --border-weight-, and non-sys --x-motion- aliases) — NOT
    // every --x-* token, since extensions-tier tokens (--x-brand-google,
    // --x-surface-ghost-2, --x-toolbar-bg, etc.) can coincidentally share a
    // semantic token's value and must not out-rank it alphabetically.
    // Everything else --x-*-prefixed (extensions tier) is rank 1, then the
    // structural tiers in cascade order: --x-sys-* (2) -> --x-palette-* (3)
    // -> --x-ref-* (4, the most upstream).
    tokenRules: {
      tierRank: (name) => {
        if (
          /^--x-(bg|text|border|pad|gap|radius|size)-/.test(name) ||
          /^--border-weight-/.test(name) ||
          /^--x-motion-(?!sys-)/.test(name)
        ) return 0
        if (name.startsWith('--x-ref-')) return 4
        if (name.startsWith('--x-palette-')) return 3
        if (name.startsWith('--x-sys-')) return 2
        return 1
      },
    },
    // Vite's raw-serve endpoint — dev-only; unavailable (and unused) in a
    // production build's isolated bundle.
    resolveSource: (file) => import(/* @vite-ignore */ `/@fs${file}?raw`).then(m => m.default).catch(() => null),
    // "View in library" jump — lazy import so the stories tree stays out of
    // store-locked bundles (mirrors InspectorPanel's prior inline hook).
    libraryLink: async (component) => {
      const { findStory } = await import('./library/registry.js')
      const story = findStory({ component: component.instance?.type, name: component.name })
      if (!story) return null
      const { useLibrary } = await import('./library/useLibrary.js')
      return { open: () => useLibrary().open(story.id) }
    },
  }))
  .mount('#app')

// PWA service-worker registration — store-locked builds only. The internal
// multi-store dev/review build serves every store's theme from one origin
// via the runtime switcher, so it must never register a service worker that
// could cache one store's shell over another's on that shared origin. See
// vite.config.js's `pwa-manifest` plugin (emits /sw.js + manifest.webmanifest
// only for a store that has its own src/stores/<store>/pwa.config.js).
if (__STORE_LOCKED__ && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
