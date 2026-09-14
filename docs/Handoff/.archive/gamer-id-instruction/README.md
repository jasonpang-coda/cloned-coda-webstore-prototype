# Gamer ID Instruction — Animation Spec

**Component:** `src/components/PlayerAccount.vue` (Figma 5147:22653)  
**Feature:** "How to find your COD:M account" disclosure — chips + instruction panel

---

## Overview

The Gamer ID Instruction section is a two-level disclosure widget inside
`PlayerAccount`. The outer disclosure reveals a chip-tab row; tapping a chip
opens an instruction panel below. Dismissing the outer disclosure collapses
everything. A lookup spinner plays during account verification, and a Player
Card fades in on success.

---

## Motion tokens

All values resolve from `src/tokens/motion.css`.

### Durations

| Token | Value | Used for |
|---|---|---|
| `--motion-sys-duration-fast` | `150ms` | Instructions block exit |
| `--motion-sys-duration-base` | `250ms` | Component entrance, panel accordion, tab crossfade |
| `--motion-sys-duration-exit` | `200ms` | Instructions block entrance |
| `--motion-sys-duration-slow` | `350ms` | Chevron rotate (`--motion-accordion`) |
| `--motion-spinner` | `700ms` | Lookup donut spinner loop |

### Easing curves

| Token | Value | Used for |
|---|---|---|
| `--motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Entrances (ease-out) |
| `--motion-sys-ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | Exits (ease-in) |
| `--motion-sys-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | On-screen moves, accordion, panel |
| `--motion-sys-ease-linear` | `linear` | Continuous spinner loop |

### Displacement

| Token | Value | Used for |
|---|---|---|
| `--motion-sys-distance-sm` | `4px` | Instructions block slide travel |
| `--motion-sys-distance-lg` | `16px` | Component entrance slide travel |

---

## Animation catalogue

### 1. Component entrance

Plays once when `PlayerAccount` mounts (page cascade).

| Property | Value |
|---|---|
| Keyframe | `slide-down` — `opacity: 0, translateY(-16px)` → `opacity: 1, translateY(0)` |
| Duration | `250ms` (`--motion-sys-duration-base`) |
| Easing | `cubic-bezier(0, 0, 0.2, 1)` (`--motion-sys-ease-decelerate`) |
| Fill mode | `both` |
| Delay | Controlled externally via `baseDelay` prop (page cascade offset) |

---

### 2. Disclosure chevron rotate

Tap "How to find your COD:M account" → chevron flips 180°.

| Property | Value |
|---|---|
| Property animated | `transform: rotate(0deg → 180deg)` |
| Duration | `350ms` (`--motion-accordion` → `--motion-sys-duration-slow`) |
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` (`--motion-sys-ease-standard`) |
| Trigger | `.is-open` class added to `.player-account__disclosure-chevron` |

---

### 3. Instructions block reveal / dismiss

Vue `<Transition name="instructions">` — the entire chip row + panel wrapper.

#### Enter (disclosure opens)

| Property | Value |
|---|---|
| Properties animated | `opacity` + `transform: translateY` |
| Duration | `200ms` (`--motion-sys-duration-exit`) |
| Easing | `cubic-bezier(0, 0, 0.2, 1)` (`--motion-sys-ease-decelerate`) |
| From state | `opacity: 0`, `translateY(-4px)` |
| To state | `opacity: 1`, `translateY(0)` |

#### Leave (disclosure closes)

| Property | Value |
|---|---|
| Properties animated | `opacity` + `transform: translateY` |
| Duration | `150ms` (`--motion-sys-duration-fast`) |
| Easing | `cubic-bezier(0.4, 0, 1, 1)` (`--motion-sys-ease-accelerate`) |
| From state | `opacity: 1`, `translateY(0)` |
| To state | `opacity: 0`, `translateY(-4px)` |

> The exit is shorter than the entrance (150ms vs 200ms) to keep closure snappy.

---

### 4. Chip tab highlight

Tapping a chip updates its `background-color` / `background` between neutral
(`--rarity-gradient-neutral`) and active (`--border-divider`).

| Property | Value |
|---|---|
| Properties animated | `background-color`, `background` |
| Duration | `250ms` (`--motion-tab-indicator` → `--motion-sys-duration-base`) |
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` (`--motion-sys-ease-standard`) |
| Trigger | `.player-account__chip--active` class |

Also: the **bottom border-radius** of chips collapses from `var(--radius-container-xs)` → `0` when the panel opens (`.is-open` on the wrapping `.player-account__instructions`). This is instant (no transition) — purely a geometry snap so chips merge visually with the panel edge.

---

### 5. Panel accordion expand

`grid-template-rows: 0fr → 1fr` on `.player-account__panel-wrap`. Opens when any chip is active; collapses when all chips are deselected.

| Property | Value |
|---|---|
| Property animated | `grid-template-rows` |
| Duration | `250ms` (`--motion-sys-duration-base`) |
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` (`--motion-sys-ease-standard`) |
| Trigger | `.is-open` class on `.player-account__instructions` |

The inner `.player-account__panel` has `overflow: hidden` — this is the clipping container that makes grid-rows height animation work.

---

### 6. Tab content crossfade

Vue `<Transition name="tab-content" mode="out-in">` — switching between chip panels. `mode="out-in"` means the old content fades out fully before the new content fades in.

| Phase | Property | Duration | Easing |
|---|---|---|---|
| Enter | `opacity: 0 → 1` | `250ms` (`--motion-sys-duration-base`) | `cubic-bezier(0, 0, 0.2, 1)` |
| Leave | `opacity: 1 → 0` | instant (no leave-active defined) | — |

> Only `opacity` animates — no layout reflow, GPU-composited, 60fps safe.

---

### 7. Player card fade-in

Vue `<Transition name="tab-content">` (same transition class) — the `PlayerCard` fades in once the account lookup resolves to `'found'`.

| Property | Value |
|---|---|
| Property animated | `opacity: 0 → 1` |
| Duration | `250ms` (`--motion-sys-duration-base`) |
| Easing | `cubic-bezier(0, 0, 0.2, 1)` (`--motion-sys-ease-decelerate`) |

---

### 8. Lookup spinner

Plays from the moment the Player ID input blurs / Enter is pressed until the
simulated lookup resolves (~1100ms).

| Property | Value |
|---|---|
| Keyframe | `spin` — `transform: rotate(0deg → 360deg)` |
| Duration | `700ms` (`--motion-spinner`) |
| Easing | `linear` (`--motion-sys-ease-linear`) |
| Iteration | `infinite` |
| Element | Donut ring: 20×20px, `border-top-color: --text-hyperlink-default` |
| Position | Absolute, vertically centred inside the input, right-aligned |

---

## Choreography (full interaction sequence)

```
0ms      User blurs input / presses Enter
         → Spinner appears (spin, 700ms/loop, linear, infinite)
         → Input border: --border-soft-2 → --border-input-focused

~1100ms  Lookup resolves (simulated)
         → Spinner unmounts
         → PlayerCard fades in (opacity 0→1, 250ms, ease-out)

---  Separate flow: user taps "How to find your COD:M account"  ---

0ms      Disclosure tapped
         → Chevron starts rotating (0→180°, 350ms, standard)
         → Instructions block enters (opacity+translateY, 200ms, ease-out)
         → First chip auto-selected (UID)
         → Chips' bottom-radius collapses (instant)
         → Panel accordion expands (grid-rows 0fr→1fr, 250ms, standard)
         → Tab content fades in (opacity 0→1, 250ms, ease-out)

Any chip tapped (switch)
         → Old panel content fades out (opacity 1→0, instant)
         → Chip bg transitions (250ms, standard)
         → New panel content fades in (opacity 0→1, 250ms, ease-out)

Disclosure tapped again (close)
         → Chevron reverses (180→0°, 350ms, standard)
         → Instructions block exits (opacity+translateY, 150ms, ease-in)
         → Panel collapses (grid-rows 1fr→0fr, 250ms, standard) ← behind the fade
```

---

## Reduced-motion

Global `reduced-motion.css` overrides all tokens to `0ms` durations when
`prefers-reduced-motion: reduce` is active. No per-component handling is needed
— the transition and animation declarations consume the same token variables.

---

## Implementation notes for FE

- Use **CSS custom property longhands** (`transition-duration`, `transition-timing-function`) when the token value contains commas (e.g. easing curves). CSS shorthand `transition: opacity var(--motion-sys-ease-decelerate)` will parse incorrectly because the comma-separated bezier values are mistaken for multiple transition targets.
- The `grid-template-rows` accordion technique requires `overflow: hidden` on the inner child — the outer element animates height via grid, the inner element clips the overflow.
- The spinner uses `top/right` offsets for centering (not `top: 50%; transform: translateY(-50%)`) so the `spin` keyframe's `transform: rotate()` has sole ownership of the `transform` property and doesn't fight a centering translate.
- `tab-content` leave has no explicit leave-active rule — the `v-if` removal is instant. Only the enter transition is animated.
