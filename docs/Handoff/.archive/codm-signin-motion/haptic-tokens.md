# Haptic Tokens Documentation

CODM SKU Card 3.0 — Haptic Feedback Design Tokens

---

## Overview

Haptic tokens are the tactile counterpart to motion tokens — a short `navigator.vibrate()` on tap makes interactions feel physical and responsive on supported devices (Android Chrome). They expose the same **primitive → semantic two-tier structure** as `motion.css` / `motion-sku.css` so vibration durations and patterns are tuned in one place, never inline.

**Source of truth:** `src/tokens/haptics.js`
**Engine:** `src/composables/useHaptics.js`
**Directive:** `src/directives/vHaptic.js`

---

## Why JS, not CSS

`navigator.vibrate()` takes a **number (ms)** or an **array pattern** (`[10, 40, 20]`). CSS custom properties cannot hold arrays, so haptics are authored in JS — the same pragmatic exception already made for gradients (which are authored in CSS because they can't be Figma variables). The file mirrors the motion token tiering exactly so it reads as a token file, not a constants dump.

This file is **pure data.** Gating, feature detection, and the iOS no-op all live in `useHaptics` — never here.

<HapticTester />

---

## Token Tiers

### Tier 1 — Primitives

Parallels `--motion-duration-*`. Components never reference these directly; they exist to give the semantic tier a single place to tune durations.

| Name | Value | Intent |
|---|---|---|
| `light` | `10` ms | Micro-feedback; weightless tap confirmation |
| `medium` | `20` ms | Committing action; noticeable but not disruptive |
| `heavy` | `35` ms | Weighty confirmation; deliberate, consequential |

### Tier 2 — Semantic Map

Parallels `--motion-sku-*`. **Components always reference these names** — never the primitives above, never a raw `navigator.vibrate(n)` call.

#### Single-tap tokens

| Token | Primitive | Use case |
|---|---|---|
| `press` | light (10 ms) | Generic button / icon / close |
| `chip` | light (10 ms) | Chip / tab selection |
| `select` | medium (20 ms) | SKU / bundle / best-seller card select |
| `confirm` | heavy (35 ms) | Checkout CTA ("BUY NOW") |

#### Pattern tokens

Patterns are `[vibrate, pause, vibrate, …]` arrays (ms). They convey state through rhythm, not just intensity.

| Token | Pattern | Use case |
|---|---|---|
| `success` | `[10, 40, 20]` | Sign-in success snackbar — light pulse, gap, medium settle |
| `error` | `[20, 30, 20]` | Failed lookup / destructive action — double medium beat |

---

## Consuming Tokens — Two Patterns

### Pattern A — `v-haptic` directive (simple buttons and chips)

Fires on `pointerdown`, mirroring `v-ripple`. The **arg** selects the semantic token; the default is `press`.

```html
<!-- Generic button / close / icon -->
<button v-ripple v-haptic type="button">…</button>

<!-- Chip / tab selection -->
<button v-ripple v-haptic:chip type="button">…</button>

<!-- Checkout CTA — heavier confirmation buzz -->
<button v-ripple v-haptic:confirm type="button">BUY NOW</button>
```

Use the directive for **unconditional taps** — any press on the element should fire. Registered globally in `main.js` alongside `v-ripple`.

### Pattern B — `useHaptics()` composable (gated / outcome-dependent)

A directive fires on every `pointerdown` — including no-op taps where a gate prevents the action. Use the composable when feedback should match the **outcome**, not the press.

```js
import { useHaptics } from '../composables/useHaptics.js'
const { haptic } = useHaptics()
```

**SKU cards** — fire `select` only when checkout actually opens (`openCheckout` returns `true`):

```js
function onSelect() {
  const opened = openCheckout({ amount: props.amount, label: props.label })
  if (opened) haptic('select') // silent on no-op (signed out, no guest ID)
}
```

**Sign-in success** — fired inside `useAuth.showSnackbar()` (the single sign-in choke point):

```js
haptic('success') // double-pulse on the snackbar entrance
```

**Destructive sign-out** — fired at the top of `useAuth.signOut()`:

```js
haptic('error') // signals a consequential, irreversible action
```

> **Double-buzz prevention:** `AccountPopover`'s sign-out button does NOT carry `v-haptic` — `useAuth.signOut()` already fires the `error` pattern. The directive would buzz twice.

---

## Platform Behaviour

| Platform | `navigator.vibrate` | Result |
|---|---|---|
| Android Chrome | ✅ Supported | Vibrates per token value / pattern |
| iOS Safari | ❌ Not implemented (`undefined`) | Silent no-op (correct, not a bug) |
| macOS / Windows (desktop) | ❌ Not implemented | Silent no-op |
| Firefox (any OS) | Limited / permission-gated | May no-op depending on user gesture context |

iOS will never vibrate from a web page via this API. The `<input type="checkbox" switch>` / `label.click()` Taptic Engine workaround was evaluated (2026-06-06) and **deliberately rejected** — Apple patched programmatic `label.click()` triggering in iOS 26.5, and the technique provides no intensity or pattern control (one fixed tick regardless of token tier). See the addendum in the plan file for full rationale.

---

## Gating

The composable gates haptics on two conditions — **both must pass** for a vibration to fire:

### 1. Feature detection

```js
const supported = () =>
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
```

Returns `false` on iOS Safari (where `navigator.vibrate` is `undefined`), desktop browsers, and any environment without the Vibration API. The no-op is silent — no errors, no warnings.

### 2. `prefers-reduced-motion`

```js
const prefersReduced = () =>
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches
```

Vibration is motion — suppressed when the OS accessibility setting is on. Matches the existing `useDragScroll` / `CategoryNav` idiom in the repo (deliberately not refactored into a shared composable — out of scope).

### Toggle seam (not built)

A module-level `enabled` ref inside `useHaptics` would wire a future in-app haptics toggle with zero call-site changes. The seam is designed; the UI is not built.

---

## Engine — `useHaptics` composable

```js
import { haptics } from '../tokens/haptics.js'

function trigger(token) {
  if (!supported()) return false       // iOS / desktop → silent no-op
  if (prefersReduced()) return false   // accessibility gate
  const value = typeof token === 'string' ? haptics[token] : token
  if (value == null) return false      // unknown token → no-op, don't throw
  try { return navigator.vibrate(value) } catch { return false }
}

export function useHaptics() { return { haptic: trigger, supported, prefersReduced } }
export { trigger as triggerHaptic }    // bare export consumed by the directive
```

- Accepts a **semantic name** (`'select'`) or a raw value / pattern (escape hatch for one-off use).
- Unknown token names silently no-op — they do not throw, so a misspelled name won't break the page.
- Returns `boolean` (`navigator.vibrate` return value, or `false` on any gate/error).

---

## Directive — `v-haptic`

Mirrors `vRipple` exactly: `pointerdown` listener mounted/cleaned up with the element.

```js
export const vHaptic = {
  mounted(el, binding) {
    const token = binding.arg || 'press'      // v-haptic → 'press', v-haptic:chip → 'chip'
    el._hapticHandler = () => triggerHaptic(token)
    el.addEventListener('pointerdown', el._hapticHandler)
  },
  unmounted(el) {
    el.removeEventListener('pointerdown', el._hapticHandler)
    delete el._hapticHandler
  },
}
```

Registered globally in `main.js`:

```js
app.directive('haptic', vHaptic)  // alongside .directive('ripple', vRipple)
```

---

## Dev-Time Testing (macOS)

macOS will never physically vibrate. To verify the token wiring without an Android device, paste this shim in DevTools **before** interacting:

```js
navigator.vibrate = (pattern) => {
  console.log('%c[haptic]', 'color:#ffe700;font-weight:bold', pattern)
  return true
}
```

Expected console output per surface:

| Action | Expected log |
|---|---|
| Button / icon tap | `10` |
| Chip / tab tap | `10` |
| SKU card select (signed in) | `20` |
| SKU card tap (signed out) | *(nothing — gated no-op)* |
| BUY NOW tap | `35` |
| Sign-in success snackbar | `[10, 40, 20]` |
| Sign-out | `[20, 30, 20]` |

To test `prefers-reduced-motion` gating: DevTools → **Rendering** panel → **Emulate CSS prefers-reduced-motion: reduce** — the shim should receive no calls.

To feel real haptics: connect an Android device via USB → `chrome://inspect` → forward port 5173 → open the URL in mobile Chrome.

---

## Integration Checklist

When adding a new interactive element:

- [ ] Simple button or chip → add `v-haptic` (or `:chip` / `:confirm`) beside `v-ripple`
- [ ] Gated or outcome-dependent feedback → `useHaptics().haptic(token)` in the handler, not the directive
- [ ] New intensity or pattern → add a named entry to `haptics.js` (never `navigator.vibrate(n)` inline in a component)
- [ ] Double-buzz check — if the handler already calls `haptic()`, do not also add `v-haptic`
- [ ] No-op taps should stay silent — verify the gated case manually with the DevTools shim

---

## File Map

```
src/tokens/haptics.js             Token values (primitives + semantic map)
src/composables/useHaptics.js     Engine — gating, feature detection, trigger()
src/directives/vHaptic.js         Declarative pointerdown wrapper (mirrors vRipple)
src/main.js                       Global directive registration
```

---

## References

- **Motion tokens:** `docs/motion-tokens.md`
- **Motion token source:** `src/tokens/motion.css`, `src/tokens/motion-sku.css`
- **Ripple directive (structural twin):** `src/directives/vRipple.js`
- **FE rules of engagement:** `.claude/skills/codm-web-store-fe/`
- **Figma design:** CODM SKU Card 3.0

---

**Last updated:** June 2026
**Version:** v1.0.0 — initial haptic token documentation
