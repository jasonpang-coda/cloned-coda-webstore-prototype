# @coda/inspect-kit

Browser-inspect-style element inspector for any front-end — hover to see
specs/gaps/design tokens, draw box-model spacing directly onto an element,
and open any selected element across every interaction state next to its
resolved token contract in a standalone page.

Framework-free core (`.`) with a Vue 3 adapter (`./vue`), following the same
shape as `@coda/comment-kit` / `@coda/track-kit`.

## Vue usage

The Vue components ship scoped CSS as a separate stylesheet (the Vue SFC
compiler extracts `<style scoped>` into its own file rather than
auto-injecting it) — import it once, anywhere in your entry:

```js
import '@coda/inspect-kit/vue/style.css'
```

```js
import { createApp } from 'vue'
import { createInspector, InspectorLayer, useInspector } from '@coda/inspect-kit/vue'

app.use(createInspector({
  screenRoot: '.device__screen',
  chromeSelectors: '.toolbar, .inspector, .lib__sidebar, .lib__topbar, .lib__controls, .lib__docs',
  enabled: () => !__STORE_LOCKED__,
  resolveSource: (file) => import(/* @vite-ignore */ `/@fs${file}?raw`).then(m => m.default),
  libraryLink: async (component) => {
    const story = findStory({ component: component.instance?.type, name: component.name })
    return story ? { open: () => library.open(story.id) } : null
  },
}))
```

Mount `<InspectorLayer />` once at the host app's **root** — not inside any
transformed/scaled/clipped ancestor, since the overlay is `position:fixed`
and a transformed ancestor would trap it (a device-frame mockup with
`transform: scale()` is the motivating case).

```vue
<InspectorLayer v-if="!isStoreLocked" :device="device" />
```

Toggle inspection mode from anywhere via the singleton:

```js
import { useInspector } from '@coda/inspect-kit/vue'
const { active, toggle } = useInspector()
```

## Config

| Option | Default | Purpose |
|---|---|---|
| `screenRoot` | `.device__screen` | Inspection-root selector — DOM-path breadcrumb, container-query fallback, `#inspect=` deep-link scope. |
| `chromeSelectors` | `.toolbar, .inspector` | Never highlighted/selected/blocked — the host's own dev chrome. |
| `themeAttr` | `data-theme` | Attribute watched for theme changes (invalidates the token cache) and stamped on the standalone page. `null` disables. |
| `enabled` | `() => true` | Gate — the host decides whether to render `<InspectorLayer>` at all (this option exists for parity with comment-kit/track-kit's `enabled`; the host still controls mounting via `v-if`). |
| `tokenRules` | `{}` | `{ colorPrefixes: RegExp, tierRank(name) => number }` — see `core/token-map.js`. Tunes reverse-mapping for the host's own token-naming convention. |
| `resolveSource` | `null` | `async (file) => string\|null` — powers "Copy source" / "Download". Omit to hide those actions. |
| `libraryLink` | `null` | `async (component) => { open() } \| null` — optional "View in library" jump. Omit to hide it. |

## Standalone states + tokens page

From the panel footer, "Open standalone page" opens a new tab with:
- the selected element cloned across **Default / Hover / Pressed / Disabled / Focus**,
- a **token contract** table — every design token actually resolved on the
  element's subtree, deduped, with use counts, grouped by family (Colour /
  Spacing & size / Radius / Typography / Motion),
- an **untokenised values** table — the same "not a token" lint the live
  panel shows, aggregated.

The page is fully self-contained (inlined stylesheets + resolved `:root`
tokens) — shareable, printable, savable.

`openStandalonePage()` builds the HTML first and opens it as a `blob:` URL in
one synchronous `window.open(url, '_blank')` call — the pattern popup
blockers reliably allow from a real click, as opposed to opening an empty
window and `document.write`-ing into it after (which some blockers flag as a
pop-under pattern). It returns `{ ok: true, win }` or `{ ok: false, reason }`
rather than throwing — the Vue panel shows an inline "popup blocked, allow
popups and retry" message on `{ ok: false }` instead of failing silently.

## Core (framework-free) exports

`collectStyles`, `collectAnimations`, `replayAnimation`, state applicators
(`buildHoverOverride`/`applyPressedState`/`applyDisabledState`),
`createTokenMap`, `buildStandaloneHtml`/`openStandalonePage`,
`formatSpecMarkdown`/`formatSpecJson`, `elementSelector`, `collectProps`,
`componentUsageSnippet`, `collectAssets`. No Vue dependency — usable from a
plain script, or as the base for a future framework-agnostic Web Component
rewrite of the interactive layer (the comment-kit/track-kit end state).
