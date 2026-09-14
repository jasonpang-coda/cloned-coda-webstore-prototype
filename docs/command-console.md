# Command Console

Developer keyboard palette for the COD:M web-store prototype — press `/` anywhere to switch
store, device, auth state, or jump to a page section without reaching for the DeviceToolbar dropdowns.

---

## Overview

The command console is prototype dev-chrome. It lives at the top of the overlay stack (above all
store UI) and drives the same reactive composables that every other prototype switcher already uses,
so it adds no new source of truth.

| Aspect | Detail |
|---|---|
| **Trigger key** | `/` — only when focus is **not** in an input, textarea, select, or contenteditable |
| **Close** | `Esc` or click the backdrop |
| **Navigate results** | `↑` / `↓` arrow keys |
| **Run a command** | `Enter` (highlighted row) or click |
| **Filter** | Type to fuzzy-filter; clears on close |
| **Store-locked builds** | Console still mounts (so dev-only affordances stay reachable via `/`); store-switch and Tools commands are absent (same gate as the DeviceToolbar dropdown/segment) |

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `/` | Open the console (no-op when typing in a field) |
| `↑` / `↓` | Move highlight through results |
| `Enter` | Run the highlighted command |
| `Esc` | Close without running |

---

## Command groups

### Store

Switch the active store theme at runtime. Calls `useTheme().setTheme(key)` — the same function as the DeviceToolbar dropdown.

The current store is **excluded** from the list. In a store-locked build (`vite build --mode <store>`) the active-stores manifest contains only one entry, so this group is absent entirely.

| Command | Action |
|---|---|
| `Store: COD:M` | Switch to `codm` |
| `Store: FC Mobile` | Switch to `fcm` |
| `Store: eFootball` | Switch to `efootball` |
| `Store: The Division Resurgence` | Switch to `tdr` |
| `Store: Yu-Gi-Oh! DUEL LINKS` | Switch to `ygodl` |

---

### Device

Switch the device frame. Emits `update:device` to App.vue — the same event as the DeviceToolbar segmented control.

The current frame is **excluded** from the list.

| Command | Action |
|---|---|
| `Device: iPhone` | `device = 'iphone'` |
| `Device: Android` | `device = 'samsung'` |
| `Device: Responsive` | `device = 'none'` (fluid, no frame) |

---

### Auth

Toggle the simulated sign-in state. Commands switch based on the current `signedIn` value — only one of Sign in / Sign out is shown at a time.

Sign-in routes to the active store's configured flow — EA Account overlay for FCM, sign-in sheet for all others — mirroring NavBar's dispatch logic.

| Command | Condition | Action |
|---|---|---|
| `Sign in` | Signed out | Opens the store's sign-in flow (`config.signIn.flow`) |
| `Sign out` | Signed in | Resets session; clears player name + loyalty balance |

---

### Navigation

Jump to an on-page section or open the nav drawer. Section entries are derived from the live `categories` computed in App.vue, so they update automatically when the store switches (e.g. COD:M section tabs vs FCM category tabs).

| Command | Action |
|---|---|
| `Open menu drawer` | Opens the left nav drawer |
| `Scroll to top` | Scrolls the device screen to the top (`smooth`, respects `prefers-reduced-motion`) |
| `Go to: <section label>` | Calls `onDrawerNavigate(section.id)` — scroll (COD:M) or filter switch (FCM) |

---

### Appearance

Body-font evaluation toggle — COD:M only. Calls `useBodyFont().setBodyFont(key)`, writing `<html data-body-font>`. This group is **absent** for stores where `bodyFonts.length === 1` (i.e. every store except COD:M).

| Command | Action |
|---|---|
| `Body font: Hitmarker` | Default — all-Hitmarker body type |
| `Body font: Barlow` | Barlow evaluation pairing |
| `Body font: Inter` | Inter evaluation pairing |

---

### Tools

Prototype-only dev utilities. The toolbar-collapse/library/inspector/screenshot commands are hidden in store-locked builds (`!__STORE_LOCKED__`); the session-tracker commands below are not — they stay available so the tracker is reachable via `/` even on builds where its toolbar button is hidden.

| Command | Action |
|---|---|
| `Collapse preview toolbar` / `Expand preview toolbar` | **(v0.35.0)** Toggles `useToolbarCollapse()` — same state as DeviceToolbar's tab handle. Label flips with current state. |
| `Open component library` | Calls `useLibrary().toggle()` — swaps the store shell for the component library viewer. |
| `Inspect elements` / `Exit inspection mode` | Calls `useInspector().toggle()`. Label flips with current state. |
| `Take screenshot` | Closes the console, waits a frame, then calls `useScreenshot().capture(device, theme)` so the palette never lands in the shot. |
| `Show/Hide session tracker` · `Show click heatmap` · `Show scroll depth` · `Pause/Resume session tracking` | **(v0.57.0)** From `useTracking()` (`@coda/track-kit/vue`) — see [session-tracking.md](./session-tracking.md). Registers unconditionally (unlike the comment-kit commands, tracking has no opt-in `enabled` gate here — pause/resume works regardless of the localhost/deployed default). |

---

## Fuzzy filter

Type any part of a command label or its keywords to narrow the list. The filter uses a **dependency-free subsequence match**: every character of the query must appear in order in the label or keyword string, so `fcm`, `mobile`, `fc m`, and `fc mobile` all surface `Store: FC Mobile`.

The highlight resets to the first result whenever the query changes.

---

## Backdrop

The console renders over a **full-bleed backdrop** that blurs (`backdrop-filter: blur(64px)`) and dims (`--scrim`) the store behind it — the same pattern as the NavDrawer scrim. The backdrop fades in with the panel on open and fades out on close, using `--motion-modal-enter` / `--motion-modal-exit`.

---

## Typography

The console uses the **OS system font** (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`) so it reads clearly as dev chrome, visually separate from whatever store typeface is active. The `--sys-font-family-body` and `--sys-font-family-heading` tokens are overridden on the panel root so `.text-style-*` descendant classes resolve to the system stack instead of Hitmarker, Cruyff Sans, etc.

---

## Implementation

| File | Role |
|---|---|
| [`src/composables/useCommandConsole.js`](../src/composables/useCommandConsole.js) | Singleton open/close state (`open`, `openConsole`, `closeConsole`, `toggleConsole`) |
| [`src/components/CommandConsole.vue`](../src/components/CommandConsole.vue) | Overlay, command registry, filter, keyboard navigation |
| [`src/App.vue`](../src/App.vue) | Global `/` keydown listener (registered in `onMounted`, removed in `onBeforeUnmount`); mounts `<CommandConsole>` in the `#overlay` slot |

### How the `/` listener works

```js
function isTypingTarget(el) {
  if (!el) return false
  const tag = el.tagName
  return el.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

function onGlobalKey(e) {
  if (e.key === '/' && !consoleOpen.value && !isTypingTarget(e.target)) {
    e.preventDefault()
    openConsole()
  }
}
```

### How the command registry works

`commands` is a reactive `computed` that rebuilds whenever any of its composable dependencies change. Adding a command is a single object pushed to the array — no component edits required.

```js
{
  id:       'store:fcm',        // unique key for v-for
  group:    'Store',            // section heading
  label:    'Store: FC Mobile', // display text
  hint:     'Switch store',     // secondary label (right-aligned)
  keywords: 'theme reskin fcm FC Mobile', // fuzzy-filter haystack
  run:      () => setTheme('fcm'),         // called on Enter / click
}
```

### Z-index

| Layer | z-index |
|---|---|
| CategoryNav | 0 |
| NavDrawer | 1 |
| SignInLoader | 2 |
| CheckoutSheet / ClaimGiftSheet / SignInSheet | 4 |
| AccountPopover / Snackbar | 5 |
| **CommandConsole** | **6** |

---

## Adding a new command

1. Import any composable you need inside `CommandConsole.vue`.
2. Push an object to the `commands` computed array:
   ```js
   list.push({
     id: 'mygroup:mycommand',
     group: 'My Group',
     label: 'My Command',
     hint: 'What it does',
     keywords: 'search terms',
     run: () => doSomething(),
   })
   ```
3. That's it — the filter, keyboard nav, and grouping are automatic.

---

**Last updated:** August 2026 · v0.57.0
