# Carousel Story — Interaction Handoff

> Complete behaviour + motion spec for the **StoryCarousel**
> ([`src/components/StoryCarousel.vue`](../../../src/components/StoryCarousel.vue)) —
> the Instagram-story-style hero slideshow tucked flush under the NavBar at the top
> of the store page. It specs the four interaction surfaces — **auto-advance**,
> **tap-to-navigate**, **press-to-pause**, and the **CTA** — plus the slide
> crossfade and the segmented-progress timing. Every duration, easing, colour,
> gradient and spacing value here resolves to a **design token** — no per-component
> magic number. Colour/space tokens resolve from
> [`src/tokens/ds/*.css`](../../../src/tokens/ds); brand effects with no semantic
> slot from [`extensions.css`](../../../src/tokens/ds/extensions.css); motion from
> [`motion.css`](../../../src/tokens/motion.css) /
> [`motion-sku.css`](../../../src/tokens/motion-sku.css); keyframes from
> [`keyframes.css`](../../../src/tokens/keyframes.css).
>
> **Scope:** the StoryCarousel component itself and how its single host,
> [`App.vue`](../../../src/App.vue), feeds it data and reacts to its `cta` event.
> The *sibling* horizontal scrollers (`BestSellerCarousel`, `FeaturedCarousel`) are
> a different pattern (drag-scroll, not autoplay) and are **not** covered here.
>
> **Last updated:** 2026-06-11 · tracks prototype v0.11.0. Adds the 1–5 slide-count
> contract (single-slide special case + 5-slide maximum) and the `aspectRatio` prop.

---

## 1. The flow at a glance

Unlike the sign-in flow (orchestrated by the `useAuth` singleton), this feature has
**no singleton orchestrator — the component is its own orchestrator.** StoryCarousel
owns all of its state (`current` slide index, `isPressed`, the reduced-motion flag)
and its timing source is the CSS progress animation, not a JS timer. The host
`App.vue` owns only the *data* (`slides`) and the *reaction* to the emitted `cta`.

```
App.vue                                StoryCarousel.vue (owns all state/timing)
────────                               ─────────────────────────────────────────
:slides="stories"   ───────────────►  render slide[current]  (portrait | landscape)
:base-delay=100     ───────────────►  root sku-enter entrance (delayed beat in cascade)

                                       ┌─ active segment fills 0→100% over `interval`
                                       │     │ @animationend → onSegEnd(current)
                                       │     ▼  if still current && animate
                                       │   next()  →  current++  (wraps if loop)
                                       │     │  re-keys <Transition> → crossfade
                                       │     └──────────────────────────────┐
                                       │                                     ▼
                                       │   tap LEFT  zone → prev()   re-arm new segment
                                       │   tap RIGHT zone → next()
                                       │
                                       │   pointerdown on frame  → isPressed=true  → segment PAUSED
                                       │   pointerup/cancel (doc) → isPressed=false → segment RESUMES
                                       │
@cta="onStoryCta"  ◄───────────────── │   CTA click → emit('cta', slide)
   │                                   └─
   ▼
 filter-mode + ctaCategory → switch category, +220ms → scrollIntoView(ctaTarget)
 page-mode / no category   → scrollIntoView(ctaTarget) directly
```

### Slide-count contract (1–5 slides)

The carousel is designed for **1 to 5 slides**. The bounds matter to design:

- **Maximum 5 slides.** The top progress bar is one flex segment per slide. Beyond
  five, each segment becomes too thin to read as a discrete chapter, and a single
  `interval` cycle (5 s × 6+) makes the full loop too long to feel like a hero. If a
  campaign needs more than five, split it across surfaces — don't overload the hero.
  *(Not hard-enforced in code; treat it as a design rule when authoring `slides`.)*
- **Single slide (special case).** With exactly **one** slide there is nothing to
  advance to, so the component adapts:
  - The **segmented progress bar is hidden** (and its top scrim with it) — an
    always-full one-segment bar would read as a broken loader.
  - **Auto-advance and the crossfade are disabled** (`animate` → false via
    `isSingle`); the lone hero just sits there.
  - **Tap zones are omitted** — there's nowhere to navigate, so no invisible
    prev/next buttons swallow taps over the image.
  - The bottom heading/CTA still render if the slide supplies them.
  - eFootball is the reference case: one landscape KV hero, no progress chrome.
- **Aspect ratio.** By default the frame is **1:1** on narrow containers and **2.6:1**
  on wide (`@container ≥ 801px`). A store whose hero art is neither (e.g. eFootball's
  16:9 KV) passes the **`aspectRatio`** prop (`config.carousel.aspectRatio`, e.g.
  `'16 / 9'`); the inline ratio overrides the responsive default at every breakpoint so
  the art fits the container instead of being cropped to square.

### Choreography timeline (one slide cycle, `interval = 5000ms`)

| t (ms) | Event | Source |
|---|---|---|
| 0 | New slide keyed in; image + content **crossfade** (350 ms opacity tween) | `StoryCarousel` `story-fade` `<Transition>` |
| 0 → 5000 | Active segment `story-progress` fills `width: 0 → 100%` (linear) | `keyframes.css` `story-progress`, inline `animationDuration` |
| *(any)* | `pointerdown` → segment **pauses** at current width; `pointerup` → resumes | `isPressed` + `animation-play-state` |
| 5000 | Segment fill hits 100% → `animationend` → `onSegEnd(current)` → `next()` | `StoryCarousel.onSegEnd` |
| 5000 | `current++` (or wrap to 0 if `loop`) → cycle repeats from t=0 | `StoryCarousel.next` |

> **Why advancement is keyframe-driven, not a `setInterval`.** The auto-advance fires
> from the progress bar's own `animationend`, so the bar you see and the moment it
> advances are the *same event* — they can never drift out of sync. It also makes
> **press-to-pause free**: pausing the CSS animation pauses the bar *and* the advance
> together, with zero elapsed-time bookkeeping. A JS timer would need separate logic to
> keep the bar in step and to subtract paused time — this design needs neither. This is
> the single most important architectural decision in the component; do not replace it
> with a timer.

---

## 2. Token reference (everything the feature consumes)

### Motion

| Token | Value | Used by |
|---|---|---|
| `--motion-duration-slow` | `350ms` | Root `sku-enter` entrance duration |
| `--motion-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Root entrance easing (ease-out) |
| `--motion-sku-story-fade` | `350ms` | Slide + content crossfade |
| `--motion-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Crossfade easing |
| `--motion-sku-hover` | `150ms standard` | CTA background-colour hover |

### Keyframes ([`keyframes.css`](../../../src/tokens/keyframes.css))

| Keyframe | Definition | Role |
|---|---|---|
| `sku-enter` | `opacity 0→1, translateY(6px→0)` | Root entrance (cascaded via `baseDelay`) |
| `story-progress` | `width 0→100%` (linear, forwards) | Active segment fill = the auto-advance timer |

### Colour / ink (semantic)

| Token | Resolves to (COD:M) | Used by |
|---|---|---|
| `--text-hyperlink-default` | `--sys-colour-secondary-main` | Active/full segment fill, CTA border + label |
| `--border-divider` | `--sys-colour-neutral-soft` | Empty segment track |
| `--text-header-default` | `--sys-colour-ink-heavy` | Heading colour |

### Brand effects ([`extensions.css`](../../../src/tokens/ds/extensions.css))

| Token | Role |
|---|---|
| `--shadow-story-card` | Three-layer drop shadow on the frame |
| `--text-shadow-story-heading` | Two-layer text shadow keeping the heading legible over imagery |
| `--gradient-story-progress-scrim` | Top scrim (white@20% → 0) behind the progress bars |
| `--gradient-story-vignette` | Bottom vignette (transparent → dark@55%) under heading/CTA |
| `--surface-frost` / `--surface-frost-hover` | CTA translucent fill (paired with `backdrop-filter: blur`) |
| `--bestseller-warm` | Warm near-black frame base (visible before/under imagery) |

### Spacing / radius / border (semantic)

| Token | Value (COD:M) | Used by |
|---|---|---|
| `--radius-container-xs` | `4px` | Frame + CTA corner radius |
| `--radius-badge-full` | `999px` | Segment + fill pill radius |
| `--gap-content-narrow` | `4px` | Gap between progress segments |
| `--gap-content-loose` | `12px` | Gap between heading and CTA |
| `--pad-surface-s` / `-m` / `-l` | `8` / `12` / `16px` | Pagination + content padding |
| `--border-weight-action` | `2px` | CTA border thickness |

**The governing rules** (restated for this feature, per [`codm-web-store-fe`](../../../.claude/skills/codm-web-store-fe/SKILL.md) §4 and [`motion-tokens.md`](./motion-tokens.md)):
- Entrances **ease-out** (decelerate) — the root `sku-enter` uses `--motion-ease-decelerate`.
- On-screen change uses **standard** ease — the crossfade uses `--motion-ease-standard`.
- The progress fill is the one **linear** animation (a timer must be perfectly even).
- **No spring/overshoot here** — this is a utilitarian hero, not a delight moment.
- Animate only **`transform`/`opacity`** — the crossfade tweens opacity; the only
  exception is the progress fill's `width`, which is intentional (it *is* a progress bar).
- **`animation` shorthand banned** when the easing has a comma — the active segment uses
  `animation-name`/`-timing-function`/`-fill-mode` longhands, with `-duration` /
  `-play-state` supplied inline from props/state.

---

## 3. Surface-by-surface specs

### 3.1 Segmented progress — the auto-advance timer
**File:** [`StoryCarousel.vue`](../../../src/components/StoryCarousel.vue) ·
**z-index:** 2 · **Keyframe:** `story-progress`

One bar per slide. Bars left of `current` render full; the active bar animates
`width: 0 → 100%` over `interval` and its `animationend` drives `next()`. The
`i === current && animate` guard means **only** the active, animating segment gets the
inline `animationDuration` / `animationPlayState` — full and empty segments get `null`.

```vue
<div
  class="story__seg-fill"
  :class="{
    'story__seg-fill--full': i < current || (i === current && !animate),
    'story__seg-fill--active': i === current && animate,
  }"
  :style="(i === current && animate)
    ? { animationDuration: interval + 'ms', animationPlayState: isPressed ? 'paused' : 'running' }
    : null"
  @animationend="onSegEnd(i)"
></div>
```
```css
.story__seg-fill--active {
  animation-name: story-progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  /* animation-duration + -play-state supplied inline */
}
```
- **Linear** because a progress timer must advance evenly — any ease would misrepresent time remaining.
- Longhands, not shorthand — the easing token rule (comma in `cubic-bezier`) forbids the shorthand.

> ⚠️ **Gotcha:** the `i === current && animate` guard is load-bearing. Drop it and every
> segment inherits the `animationPlayState` toggle, so a press would (wrongly) try to
> pause non-animating bars.

### 3.2 Tap-to-navigate — two 50 % zones
**File:** [`StoryCarousel.vue`](../../../src/components/StoryCarousel.vue) ·
**z-index:** 1

Two transparent `<button>`s split the frame; left → `prev()`, right → `next()`.
Both wrap at the ends when `loop`. Changing `current` re-keys the `<Transition>`s and
re-arms the new segment.

```js
function next() {
  if (current.value < lastIndex.value) current.value++
  else if (props.loop) current.value = 0
}
function prev() {
  if (current.value > 0) current.value--
  else if (props.loop) current.value = lastIndex.value
}
```
- Real `<button>`s with `aria-label` ("Previous slide" / "Next slide") — keyboard + SR operable.

### 3.3 Press-to-pause ⭐ (the interaction this doc was opened for)
**File:** [`StoryCarousel.vue`](../../../src/components/StoryCarousel.vue) ·
**Mechanism:** CSS `animation-play-state` (no JS timer)

Press-and-hold **anywhere on the frame** freezes the active segment where it is;
release resumes from that exact point.

```js
const isPressed = ref(false)
function onPressStart() { isPressed.value = true }
function onPressEnd()   { isPressed.value = false }

onMounted(() => {
  // …matchMedia setup…
  document.addEventListener('pointerup',     onPressEnd)
  document.addEventListener('pointercancel', onPressEnd)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerup',     onPressEnd)
  document.removeEventListener('pointercancel', onPressEnd)
})
```
```vue
<div class="story__frame" @pointerdown.passive="onPressStart"> … </div>
```
- `pointerdown` on the frame sets `isPressed`; the active segment's inline style flips
  `animation-play-state` to `paused`, halting the keyframe at its current `width`.
- Because the animation is only *paused* (never restarted), `animationend` still fires
  after the full `interval` of un-paused time — **auto-advance timing is preserved**
  across any number of pauses.
- A quick tap pauses imperceptibly then navigates (the zone `click` follows the
  `pointerdown`); a genuine hold pauses without advancing until release.

> ⚠️ **Gotcha:** `onPressEnd` is bound on **`document`**, not the frame. A press that
> drags off the frame — or a cancelled touch — still releases the pause. Bind it to the
> frame instead and the carousel gets stuck paused. Always remove both listeners in
> `onBeforeUnmount`.

### 3.4 Slide crossfade
**File:** [`StoryCarousel.vue`](../../../src/components/StoryCarousel.vue) ·
**Transition name:** `story-fade` · **z-index:** 0 (images) / 2 (content)

Both the image layer and the content layer are `:key="current"` inside
`<Transition name="story-fade">`, so on an index change the outgoing and incoming
layers coexist and tween opacity in opposite directions — a gentle dissolve, no motion.

```css
.story-fade-enter-active,
.story-fade-leave-active {
  transition: opacity var(--motion-sku-story-fade) var(--motion-ease-standard);
}
.story-fade-enter-from,
.story-fade-leave-to { opacity: 0; }
```
- 350 ms standard ease — deliberately a touch long for a soft, unhurried dissolve.
- Heading + CTA crossfade in sync with their image (same transition, same key).
- Reduced-motion collapses the transition to ~instant globally, so the slide still *changes* — it just snaps.

> ⚠️ **Gotcha:** `.story__cta` sets `will-change: backdrop-filter` so its `blur(12px)`
> is promoted to its own GPU layer *before* the opacity transition starts — otherwise
> the blur visibly lags the button's fade-in.

### 3.5 The CTA
**File:** [`StoryCarousel.vue`](../../../src/components/StoryCarousel.vue) ·
**z-index:** 2 (within the otherwise `pointer-events: none` content layer)

The content layer is `pointer-events: none` so taps fall through to the zones; only
`.story__cta` re-enables them. Rendered only when `slide.ctaLabel` is set.

```vue
<button class="story__cta" type="button" @click.stop="onCta(slides[current])">
  <span class="story__cta-label text-style-utility-action-regular">{{ slides[current].ctaLabel }}</span>
</button>
```
- `@click.stop` — emits `cta` *and* stops the event reaching the tap zone underneath.
- The label condenses via the `.text-style-*` class; `.story__cta-label` overrides
  `transform-origin` to `center center` (the class defaults to left-origin) for the centred button.

> ⚠️ **Gotcha:** the heading similarly overrides `transform-origin: center center` to
> undo the Hitmarker condense's default left-origin — it's a centred heading. (See
> [`codm-web-store-fe`](../../../.claude/skills/codm-web-store-fe/SKILL.md) §2 condense.)

---

## 4. State & timing constants (single source of truth)

**The component owns its own state/timing** — there is no orchestrator composable. Tune
behaviour via the props in [`App.vue:380`](../../../src/App.vue:380), not by editing the component:

| Prop / constant | Where | Value | Meaning |
|---|---|---|---|
| `interval` | prop (default in `StoryCarousel`) | `5000` | Per-slide duration → segment fill + auto-advance |
| `loop` | prop | `true` | Wrap past last → first |
| `autoplay` | prop | `true` | Gate the fill animation + auto-advance (with reduced-motion) |
| `baseDelay` | prop, `=DELAY_STORY` | `100` | Entrance-cascade beat (root `animation-delay`) |
| `aspectRatio` | prop, `=config.carousel?.aspectRatio` | `null` | Overrides the responsive 1:1 / 2.6:1 frame ratio (e.g. `'16 / 9'`); `null` → responsive default |
| `DELAY_STORY` | [`App.vue:212`](../../../src/App.vue:212) | `100ms` | Carousel's slot in the page entrance cascade |
| `220ms` post-category scroll | [`App.vue:119`](../../../src/App.vue:119) | `setTimeout(…, 220)` | Lets the filter category out-in (200 ms leave) settle before `scrollIntoView` |

**Internal state refs** (all in `StoryCarousel`):

| Ref / computed | Notes |
|---|---|
| `current` | Active slide index |
| `isPressed` | True while held → pauses the active segment |
| `reduceMotion` | Reactive `matchMedia` listener (added in `onMounted`, removed in `onBeforeUnmount`) |
| `isSingle` | `slides.length <= 1` — hides progress bar + tap zones, forces `animate` off |
| `animate` | `autoplay && !reduceMotion && !isSingle` — gates fill animation + auto-advance |

**Listener cleanup:** the `matchMedia` `change` listener and both `document` pointer
listeners are removed in `onBeforeUnmount`, so an unmounted carousel leaves no hanging
state.

---

## 5. Accessibility & performance

- **`prefers-reduced-motion`** is handled two ways: the **global** layer
  ([`reduced-motion.css`](../../../src/tokens/reduced-motion.css)) collapses the crossfade
  to ~instant, and the component's reactive `reduceMotion` flips `animate` to false —
  **no auto-advance**, the active segment renders full instead of animating. **Tap
  navigation and press-to-pause still work** — the slideshow is fully operable, it just
  doesn't move on its own.
- **Motion is never the only signal** of position — the segmented bar shows which slide
  is active independent of any animation.
- **Hot path** animates only `opacity` (crossfade) and `width` (the progress bar, by
  design); `will-change: backdrop-filter` is set on the CTA to sync its blur.
- **ARIA:** tap zones are real `<button>`s with `aria-label`; the pagination is
  `aria-hidden`. Press-to-pause adds no keyboard affordance (a pointer-only delight on a
  decorative hero); keyboard users navigate via the zone buttons.

---

## 6. Where it mounts & internal z-index model

**Not an overlay** — unlike sheets/drawers/toasts (which mount in the DeviceFrame
`#overlay` slot), StoryCarousel sits in **normal page flow** as the first section, inside
`Grid > Span size="carousel"` ([`App.vue:377`](../../../src/App.vue:377)):

```
section.section--flush-top   ← no top padding/border; tucks under NavBar
  └ Grid
     └ Span size="carousel"  ← FULL BLEED on XS/S (cancels grid gutter), 2/3 centred on M/L
        └ StoryCarousel       ← container-query aspect: 1:1 → 2.6:1 at ≥801px
```

It uses **container queries, never viewport media queries**, so it responds to its
column width and behaves correctly at any device-frame size. The frame's
`portrait`/`landscape` image pair swaps at the same `@container (min-width: 801px)`
breakpoint as the aspect-ratio change.

Internal stacking within `.story__frame`:

```
0  .story__slide (images)  <  1  ::before top-scrim · tap zones  <  2  pagination · content (CTA re-enables pointer-events)
```

---

## 7. Quick reference — what to copy when extending this surface

- **A new autoplaying progress slideshow** → copy the `story-progress` keyframe +
  `animationend → onSegEnd → next()` link; never reach for `setInterval`.
- **Press-to-pause on any timed animation** → the `isPressed` ref + inline
  `animation-play-state` toggle + `document`-level `pointerup`/`pointercancel` release.
  Bind the *start* on the element, the *end* on `document`.
- **Art-directed responsive imagery** → the `portrait`/`landscape` pair toggled by
  `@container` + `display`, both in the DOM (don't swap `src` in JS).
- **A CTA that must stay tappable inside a `pointer-events: none` layer** → set the
  layer `none`, the button `auto`, and `@click.stop` the handler.
- **Changing timing/cascade** → adjust the `interval` prop and `DELAY_STORY` in
  [`App.vue`](../../../src/App.vue); never hardcode a duration in the component CSS.

---

**Related docs:** [`motion-tokens.md`](./motion-tokens.md) ·
[`typography.md`](./typography.md) ·
[`component-breakdown.md`](./component-breakdown.md) ·
[`codm-web-store-fe` skill](../../../.claude/skills/codm-web-store-fe/SKILL.md)
