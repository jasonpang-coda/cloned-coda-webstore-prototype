# COD:M Sign-In Flow — Motion Handoff

> Comprehensive motion spec for the **COD:M** simulated sign-in journey, from the
> navbar **SIGN IN** tap through the success snackbar and the signed-in account
> popover. Every duration, easing and displacement below is a **design token** —
> no value here is a per-component magic number. Tokens resolve from
> [`src/tokens/motion.css`](../../../src/tokens/motion.css) (primitives + composites)
> and [`src/tokens/motion-sku.css`](../../../src/tokens/motion-sku.css).
>
> **Scope:** this covers the COD:M (`data-theme="codm"`) path. The FCM EA-Account
> redirect (`EaSignInPage.vue`, `ea-page` transition) is a *sibling* flow selected
> by `config.signIn.flow === 'ea-redirect'`; it is noted where the two diverge but
> is not the subject of this doc.
>
> **Last updated:** 2026-06-09 · tracks prototype v0.9.1.

---

## 1. The flow at a glance

The flow is **time-driven simulation** orchestrated by the `useAuth()` singleton
([`src/composables/useAuth.js`](../../../src/composables/useAuth.js)). State refs flip
on timers; each UI surface is a `v-if` on a shared ref wrapped in a Vue
`<Transition>`. No surface owns the timing — the composable does.

```
NavBar "SIGN IN" tap
   │  openSignInSheet()              signInSheetOpen = true
   ▼
┌──────────────────────────┐
│ SignInSheet               │  bottom sheet slides up (no scrim)
│ "SIGN IN TO PURCHASE"     │
└──────────────────────────┘
   │  tap "Sign in with COD:M"
   │  closeSignInSheet() + startSignIn()
   ▼
┌──────────────────────────┐
│ SignInLoader              │  full-screen overlay fades in (blurred scrim)
│ mobile: "Opening COD:M…"  │  indeterminate bar loops
│ desktop: QR + user code   │
└──────────────────────────┘
   │  SIGN_IN_DELAY = 5000ms  (or "Cancel sign in" → abort)
   │  signingIn = false ; signedIn = true
   ▼
   │  NavBar nav-auth swap: SIGN IN button → avatar (spring pop)
   │
   │  +500ms choreography pause  (loader fade + navbar swap settle first)
   ▼
┌──────────────────────────┐
│ Snackbar "SIGNED IN"      │  springs up from below (the one delight beat)
└──────────────────────────┘
   │  SNACKBAR_DURATION = 5000ms → snackbar-drop exit
   ▼
(signed in)  tap avatar → AccountPopover "YOUR ACCOUNT"  (scale from corner)
             sign out → resets all state
```

### Choreography timeline (the deliberate beats)

| t (ms) | Event | Source |
|---|---|---|
| 0 | Sheet dismissed, `startSignIn()` fires, loader begins fade-in | `SignInSheet.handleSignIn` |
| 0–350 | Loader fades in (`--motion-modal-enter`) | `SignInLoader` |
| 5000 | `signingIn=false`, `signedIn=true` — loader fades out (200ms), navbar swaps | `useAuth` `SIGN_IN_DELAY` |
| 5500 | **+500ms pause**, then `showSnackbar()` — snackbar springs in | `useAuth` `setTimeout(showSnackbar, 500)` |
| 10500 | `dismissSnackbar()` — snackbar drops off-screen | `useAuth` `SNACKBAR_DURATION` |

> **Why the 500ms pause matters.** It lets the loader's 200ms exit fade and the
> navbar's nav-auth swap complete *before* the snackbar bounces in — the moments
> are sequenced, not stacked. Firing the snackbar immediately would put three
> animations on screen at once and read as chaotic. This is the flow's single most
> important choreography decision. (The FCM EA path uses a shorter **300ms** pause
> because it has no full-screen loader to clear.)

<ChoreographyTimeline />

---

## 2. Token reference (everything the flow consumes)

### Composite tokens used

| Token | Value | Used by |
|---|---|---|
| `--motion-modal-enter` | `350ms cubic-bezier(0,0,0.2,1)` (slow · decelerate) | Sheet enter, loader enter |
| `--motion-modal-exit` | `200ms cubic-bezier(0.4,0,1,1)` (exit · accelerate) | Sheet exit, loader exit |
| `--motion-snackbar-enter` | `350ms cubic-bezier(0.34,1.56,0.64,1)` (slow · **spring**) | Snackbar entrance |
| `--motion-snackbar-exit` | `250ms cubic-bezier(0.4,0,1,1)` (base · accelerate) | Snackbar exit |
| `--motion-sku-hover` | `150ms cubic-bezier(0.4,0,0.2,1)` (fast · standard) | Close-button + CTA hover within sheet/navbar |
| `--motion-hover` | `150ms standard` | Snackbar close-button opacity |
| `--motion-ripple` | `350ms` | `v-ripple` on every sheet/navbar button |

### Primitives referenced directly (NavBar nav-auth, popover)

| Token | Value |
|---|---|
| `--motion-duration-base` | `250ms` |
| `--motion-duration-exit` | `200ms` |
| `--motion-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` — entrances |
| `--motion-ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` — permanent exits |
| `--motion-ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` — overshoot (delight only) |
| `--motion-ease-linear` | `linear` — loops only (indeterminate bar) |
| `--motion-distance-*` | `sm 4px · md 8px · lg 16px · xl 24px` |
| `--motion-spinner` | `700ms` (donut loaders, not used in this flow) |

**The governing rules** (from the motion system, restated for this flow):
- Entrances **ease-out** (decelerate) — arrive fast, settle gently.
- Permanent exits **ease-in** (accelerate) — departure is decisive and shorter.
- **Spring/overshoot is reserved for delight** — used exactly *once* here, the
  success snackbar (and the navbar avatar pop). Utilitarian surfaces (the sheet,
  the loader) **never** bounce.
- Animate **only `transform` and `opacity`**.
- The **animation shorthand is banned** when the easing token contains a comma
  (every cubic-bezier does) — use longhand `animation-name` / `-duration` /
  `-timing-function`, or apply the token to `transition:` which parses fine.

---

## 3. Surface-by-surface specs

### 3.1 SignInSheet — "SIGN IN TO PURCHASE" bottom sheet
**File:** [`src/components/SignInSheet.vue`](../../../src/components/SignInSheet.vue) ·
**Transition name:** `sheet` · **z-index:** 4 (shares layer 4 with CheckoutSheet — mutually exclusive)

A bottom sheet anchored to the device's bottom edge. **No dimming scrim** — the
page behind stays visible and fully interactive (`pointer-events: none` on the
overlay, re-enabled on the panel). Dismiss: close button, `Escape`, or a tap
outside the panel (document-level `pointerdown`, deferred one tick so the opening
tap doesn't immediately close it).

**Mobile / framed — slide up:**
```css
.sheet-enter-active .signin-sheet__panel { transition: transform var(--motion-modal-enter); }  /* 350ms decelerate */
.sheet-enter-from   .signin-sheet__panel { transform: translateY(100%); }
.sheet-enter-to     .signin-sheet__panel { transform: translateY(0); }

.sheet-leave-active .signin-sheet__panel { transition: transform var(--motion-modal-exit); }   /* 200ms accelerate */
.sheet-leave-from   .signin-sheet__panel { transform: translateY(0); }
.sheet-leave-to     .signin-sheet__panel { transform: translateY(100%); }
```
- Enters/exits from the **bottom edge it lives on** — spatially coherent.
- `<Transition name="sheet" :duration="{ enter: 350, leave: 200 }">` — explicit
  durations match the tokens so Vue removes the node at the right frame.

**Responsive — centred modal (≥801px):** instead of sliding from the bottom, the
panel scales in from centre. Same enter/exit tokens, scale + opacity instead of
translate:
```css
.signin-sheet--responsive.sheet-enter-from .signin-sheet__panel { transform: scale(0.96); opacity: 0; }
/* enter/leave-active add opacity to the modal-enter transition */
```

**Within the sheet:**
- Close button: `transition: color var(--motion-sku-hover)` → `--text-header-strong` on hover.
- "Sign in with COD:M" CTA: `transition: filter var(--motion-sku-hover)` → `brightness(1.2)` on hover.
- Every button carries `v-ripple` (350ms ink ripple) + `v-haptic` (light tap).

<SheetDemo />

---

### 3.2 SignInLoader — full-screen sign-in overlay
**File:** [`src/components/SignInLoader.vue`](../../../src/components/SignInLoader.vue) ·
**Transition name:** `loader` · **z-index:** 2 (above nav drawer z:1, below snackbar z:3)

Full-screen overlay shown while `signingIn === true`. **Blurred scrim** (`--scrim`
+ `blur(32px)`) captures pointer events so the screen underneath is inert — the
opposite of the scrim-less sheet, because here the user *must* wait. Two
device-driven variants via `:is-mobile` (proxied from the device frame):

- **Mobile (framed):** "OPENING COD:M APP…" — wordmark + indeterminate bar + copy.
- **Desktop (responsive):** QR-code sign-in — heading, scan instruction, QR with
  centred logomark, user-code box. `position: fixed` so it pins to the viewport,
  not the tall scrolling page.

**Overlay fade (the only transition on the container):**
```css
.loader-enter-active { transition: opacity var(--motion-modal-enter); }  /* 350ms decelerate */
.loader-leave-active { transition: opacity var(--motion-modal-exit); }   /* 200ms accelerate */
.loader-enter-from,
.loader-leave-to     { opacity: 0; }
```
The surface only **fades** — no slide. It's a blocking full-screen state, not an
edge-anchored panel, so a directional slide would imply a spatial origin it
doesn't have.

**Indeterminate progress bar (mobile variant)** — the flow's only perpetual loop:
```css
.loader__bar-fill {
  animation: loading-indeterminate 1.4s var(--motion-ease-linear) infinite;
  will-change: transform;
}
@keyframes loading-indeterminate {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(250%); }
}
```
A 40%-wide fill sweeps across a fixed 80px track. **Linear** easing — status motion
runs at a steady rate (a decelerating progress bar reads as "stalling"). Loops
indefinitely because the 5s wait is simulated, not measured.

**Cancel:** the "Cancel sign in" link calls `cancelSignIn()`, which clears the
timer and flips `signingIn=false`, fading the loader straight out (no signed-in
state, no snackbar).

<LoaderDemo />

---

### 3.3 NavBar auth swap — SIGN IN button ↔ avatar
**File:** [`src/components/NavBar.vue`](../../../src/components/NavBar.vue) ·
**Transition name:** `nav-auth` (`mode="out-in"`)

When `signedIn` flips at t=5000, the navbar crossfades the SIGN IN button out and
the account avatar in. This is the **second delight beat** — the avatar springs in:
```css
.nav-auth-leave-active {            /* button leaving — accelerate away */
  transition: opacity var(--motion-duration-exit)  var(--motion-ease-accelerate),
              transform var(--motion-duration-exit) var(--motion-ease-accelerate);
}
.nav-auth-enter-active {            /* avatar entering — spring pop */
  transition: opacity var(--motion-duration-base)  var(--motion-ease-decelerate),
              transform var(--motion-duration-base) var(--motion-ease-spring);
}
.nav-auth-enter-from,
.nav-auth-leave-to { opacity: 0; transform: scale(0.85); }
```
- `mode="out-in"` — old element fully leaves before the new one enters (no overlap).
- The avatar **scales 0.85 → 1.0 on the spring curve** — a small reward for signing in.
- Colour and content also change, so **motion is never the only signal** of the state change.
- The FCM rewards pill (`nav-rewards`) fades + scales `0.75 → 1.0` alongside, same spring.

<NavAuthDemo />

---

### 3.4 Snackbar — "SIGNED IN" success toast
**File:** [`src/components/Snackbar.vue`](../../../src/components/Snackbar.vue) ·
**Transition name:** `snackbar` · **z-index:** 3 (above loader z:2, drawer z:1)

The choreographic payoff. Fires 500ms after sign-in completes; auto-dismisses
after `SNACKBAR_DURATION` (5s) or on the close button. Centred via
`left: 50%; transform: translateX(-50%); bottom: 32px`, capped at 400px wide.

**Entrance — spring bounce (no keyframe needed):**
```css
.snackbar-enter-active {
  transition: transform var(--motion-snackbar-enter),   /* 350ms spring */
              opacity   var(--motion-snackbar-enter);
}
.snackbar-enter-from {
  transform: translateX(-50%) translateY(120%);   /* keep -50% to hold the centre anchor */
  opacity: 0;
}
```
The spring curve's `>1` control point overshoots past rest and settles — a genuine
bounce produced by the *easing*, not a keyframe.

**Exit — `snackbar-drop` keyframe (anticipation hop, then fall):**
```css
.snackbar-leave-active { animation: snackbar-drop var(--motion-snackbar-exit) both; }  /* 250ms accelerate */

@keyframes snackbar-drop {
  0%   { transform: translateX(-50%) translateY(0);    opacity: 1; }
  18%  { transform: translateX(-50%) translateY(-12%); opacity: 1; }   /* tiny hop up */
  100% { transform: translateX(-50%) translateY(120%); opacity: 0; }   /* then drop away */
}
```
> ⚠️ **Gotcha:** `translateX(-50%)` must be repeated in *every* keyframe step. A
> keyframe overwrites the whole `transform` property; omitting it would snap the
> toast to the left edge mid-animation.

**Why a spring here and nowhere else:** this is the deliberate delight moment of
the entire flow — the reward for completing sign-in. The utilitarian surfaces (the
sheet, the loader, the payment sheets) are explicitly **forbidden** from bouncing.

**Haptics:** `useAuth.showSnackbar()` fires `haptic('success')` — the `[10,40,20]`
double-pulse pattern (no-op on iOS, which lacks the Vibration API).

<SnackbarDemo />

---

### 3.5 AccountPopover — "YOUR ACCOUNT" (signed-in)
**File:** [`src/components/AccountPopover.vue`](../../../src/components/AccountPopover.vue) ·
**Transition name:** `popover` · **z-index:** 5 (topmost overlay)

Opened by tapping the avatar. Combines fade + small scale + a 4px downward nudge,
**origin pinned to the top-right corner** it grows out of:
```css
.popover-enter-active,
.popover-leave-active {
  transition: opacity var(--motion-modal-enter), transform var(--motion-modal-enter);
}
.popover-enter-from .account-popover__panel,
.popover-leave-to   .account-popover__panel {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
.account-popover__panel { transform-origin: top right; }   /* grows from the avatar corner */
```
- Scale is deliberately small (`0.98 → 1.0`) — hints at origin without distracting.
- Uses `--motion-modal-enter` for **both** enter and leave (the popover may reopen
  quickly, so the exit doesn't need to be aggressively short).

<PopoverDemo />

---

## 4. State & timing constants (single source of truth)

All in [`useAuth.js`](../../../src/composables/useAuth.js) — change the beat here, not
in components:

| Constant | Value | Meaning |
|---|---|---|
| `SIGN_IN_DELAY` | `5000ms` | loader visible → signed-in |
| `SNACKBAR_DURATION` | `5000ms` | snackbar auto-dismiss |
| `setTimeout(showSnackbar, 500)` | `500ms` | post-sign-in choreography pause (COD:M) |
| `setTimeout(showSnackbar, 300)` | `300ms` | same pause for the FCM EA path |

Re-entrancy is guarded: `startSignIn()` ignores taps while `signingIn || signedIn`.
`cancelSignIn()` and `dismissSnackbar()` clear their module-scoped timers so an
aborted flow leaves no hanging timer.

---

## 5. Accessibility & performance

- **`prefers-reduced-motion`** is handled **globally** (`reduced-motion.css`
  collapses all transitions/animations) — none of the surfaces above re-implement
  it. JS-driven motion is gated on `prefersReduced()`; haptics self-suppress under
  reduced-motion.
- **Motion is never the only signal** — every state change also changes colour,
  content, or both (navbar button→avatar, snackbar appears with text + icon).
- Only `transform` and `opacity` animate on every hot path; `will-change:
  transform, opacity` is set on the snackbar and the loader bar.
- ARIA: loader is `role="status" aria-live="polite"`; snackbar likewise; sheet is
  `role="dialog" aria-modal="false"` (false because the page behind stays live).

---

## 6. Overlay & z-index model (where these surfaces mount)

All four overlay surfaces mount in the DeviceFrame **`#overlay` slot** (non-scrolling,
`z-index: 40`), and each takes `:is-mobile="device !== 'none'"` to switch
`position: absolute` (framed) vs `position: fixed` (responsive). The slot must
**never** get `container-type` — it would trap the `position: fixed` responsive
variants.

Stacking within the overlay layer:
```
CategoryNav 0  <  NavDrawer 1  <  SignInLoader 2  <  Snackbar 3  <  SignInSheet / CheckoutSheet 4  <  AccountPopover 5
```

---

## 7. Quick reference — what to copy when extending this flow

- **A new blocking full-screen step** → fade only (`loader` pattern), blurred
  scrim, `role="status"`.
- **A new bottom sheet** → `sheet` pattern (`translateY(100%)` ↔ `0`,
  modal-enter/exit), responsive scale-in variant, decide scrim by whether the page
  behind should stay interactive.
- **A success/reward moment** → spring (`--motion-snackbar-enter`) + `haptic('success')`.
  Everything utilitarian stays on decelerate/accelerate.
- **An anchored popover** → `popover` pattern, `transform-origin` at the trigger corner.
- **Timing/choreography** → add the constant to `useAuth.js`; never hardcode a
  `setTimeout` in a component.

---

**Related docs:** [`motion-tokens.md`](./motion-tokens.md) (full motion system),
[`haptic-tokens.md`](./haptic-tokens.md), [`component-breakdown.md`](./component-breakdown.md).
