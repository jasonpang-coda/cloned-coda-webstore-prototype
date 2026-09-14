<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import MaterialIcon from '../MaterialIcon.vue'

/**
 * TitleCard — a single title tile on the Codashop homepage (grid or rail).
 * Real square tile art (see the store module's img/ref/ imports) and an
 * optional merchandising ribbon (HOT/NEW) float over it. The title name is
 * printed below the tile (PM feedback: the tile alone read as unclear
 * without it — this reverses an earlier decision to drop the visible name
 * and rely on art + the hover CTA alone). Shared by both homepage layouts;
 * `variant` only changes presentation (standard: small/dense; visual:
 * bigger radius + hover lift).
 *
 * Cursor-tracked 3D parallax — in the spirit of
 * https://codepen.io/krautgti/pen/VwXNRYE ("Nike Product Card Parallax 3D"),
 * but that pen is pure CSS `:hover` (no cursor tracking); this tracks the
 * pointer's actual position over the tile via `pointermove`, writing
 * normalised offsets (--px/--py, roughly -0.5…0.5) that drive BOTH a whole-
 * tile tilt (rotateX/rotateY on .title-card__thumb) and a per-layer
 * translate — each layer moves a DIFFERENT amount so they visually
 * separate in depth: the image (furthest back) shifts least, the ribbon/
 * instant badges shift more, the "View Items" CTA (nearest the viewer)
 * shifts most. Every floating layer also carries a real drop-shadow
 * (--x-shadow-card) — with the title name gone there's nothing else visually
 * anchoring them to the art, so the shadow is what reads as "hovering
 * above it" rather than just "printed on it". translateZ still gives each
 * layer its resting depth; the pointer-driven translate rides on top of
 * that.
 *
 * Deliberately NO CSS transition on any of these transforms — every
 * pointermove writes --px/--py straight through to the next paint (already
 * rAF-throttled in JS, so it's smooth without needing an eased transition
 * on top), and the hover-triggered "zoom in" (image scale, badge/CTA lift)
 * applies the instant it starts rather than easing in — the tile should
 * feel like it's reacting to the cursor in real time, not catching up to it
 * a beat later.
 *
 * Pointer-only (`(hover: hover) and (pointer: fine)`) and skipped under
 * prefers-reduced-motion — touch and reduced-motion tiles stay flat with no
 * listener attached at all.
 *
 * The tile carries a gradient border ring (the same ::before mask-composite
 * technique as SkuCard, reusing --x-border-sku-card-default/-hover — a
 * dielectric material gets a defined edge, not a re-rolled effect) plus the
 * game title printed below it, and the whole card lifts/scales further on
 * hover so it reads as popping off the page, not just tilting in place.
 */
defineProps({
  name: { type: String, required: true },
  cat: { type: String, default: null },
  ribbon: { type: String, default: null },
  tile: { type: String, default: null },
  /** 'standard' | 'visual' — presentation only, same data/behaviour. */
  variant: { type: String, default: 'standard' },
  baseDelay: { type: Number, default: 0 },
})
defineEmits(['click'])

const rootRef = ref(null)
let hoverMq = null
let reduceMq = null
let raf = 0
let pendingEvent = null

function canTilt () {
  return !!hoverMq?.matches && !reduceMq?.matches
}

function applyTilt () {
  raf = 0
  const el = rootRef.value
  if (!el || !pendingEvent) return
  const rect = el.getBoundingClientRect()
  const px = (pendingEvent.clientX - rect.left) / rect.width - 0.5
  const py = (pendingEvent.clientY - rect.top) / rect.height - 0.5
  el.style.setProperty('--px', px.toFixed(3))
  el.style.setProperty('--py', py.toFixed(3))
}

function onPointerMove (e) {
  if (!canTilt()) return
  pendingEvent = e
  if (!raf) raf = requestAnimationFrame(applyTilt)
}
function onPointerLeave () {
  rootRef.value?.style.setProperty('--px', 0)
  rootRef.value?.style.setProperty('--py', 0)
}
function onMqChange () {
  if (!canTilt()) onPointerLeave()
}

onMounted(() => {
  if (typeof matchMedia !== 'undefined') {
    hoverMq = matchMedia('(hover: hover) and (pointer: fine)')
    reduceMq = matchMedia('(prefers-reduced-motion: reduce)')
    hoverMq.addEventListener?.('change', onMqChange)
    reduceMq.addEventListener?.('change', onMqChange)
  }
})
onBeforeUnmount(() => {
  hoverMq?.removeEventListener?.('change', onMqChange)
  reduceMq?.removeEventListener?.('change', onMqChange)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <button
    ref="rootRef"
    v-ripple
    v-haptic
    type="button"
    class="title-card"
    :class="[`title-card--${variant}`]"
    :style="{ animationDelay: baseDelay + 'ms' }"
    @click="$emit('click')"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <span class="title-card__thumb">
      <img v-if="tile" :src="tile" :alt="name" class="title-card__img" loading="lazy" />
      <span class="title-card__scrim" aria-hidden="true"></span>
      <span v-if="ribbon" class="title-card__ribbon text-style-utility-default-bold">{{ ribbon }}</span>
      <span class="title-card__instant text-style-utility-micro-regular">
        <MaterialIcon name="bolt" :size="11" />
      </span>
      <!-- Purely visual — not a real <button> (can't nest interactive
           elements inside the card's own outer <button>); the whole tile
           already performs this exact action, so it needs no click handler
           of its own. -->
      <span class="title-card__visit text-style-utility-action-regular" aria-hidden="true">View Items</span>
    </span>
    <span class="title-card__name text-style-utility-default-bold">{{ name }}</span>
  </button>
</template>

<style scoped>
.title-card {
  display: block;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
  position: relative;
  border-radius: var(--x-radius-container-xs);
  animation-name: sku-enter;
  animation-duration: var(--x-motion-sys-duration-slow);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;
  transition: transform var(--x-motion-sku-hover);
  --px: 0;
  --py: 0;
}
/* Whole box "pops out" on hover — bigger lift + a slight scale, not just
   the 2px nudge it had before, so the card reads as lifting off the page. */
.title-card:hover { transform: translateY(-4px) scale(1.02); }
.title-card:active { transform: scale(0.98); }

/* Gradient border ring — same ::before mask-composite technique as
   SkuCard, reusing the same semantic border tokens so it matches the rest
   of the storefront rather than inventing a new edge treatment. */
.title-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: var(--border-weight-default);
  background: var(--x-border-sku-card-default);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: destination-out;
  pointer-events: none;
  z-index: 2;
  transition: background var(--x-motion-sku-hover);
}
.title-card:hover::before {
  background: var(--x-border-sku-card-hover);
}

.title-card__thumb {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
  box-sizing: border-box;
  border-radius: var(--x-radius-container-xs);
  overflow: hidden;
  background: var(--x-bg-card-default);
  box-shadow: var(--x-shadow-card);
  perspective: 400px;
  transform-style: preserve-3d;
  /* Whole-tile tilt toward the cursor — --px/--py are 0 unless a fine
     pointer is actively over this tile (set by the script above). No
     transition: the tilt must track the cursor immediately, every frame,
     not ease toward a stale target. */
  transform: rotateX(calc(var(--py) * -16deg)) rotateY(calc(var(--px) * 16deg));
}
.title-card:hover .title-card__thumb {
  box-shadow: var(--x-shadow-card-hover);
}

.title-card__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Furthest-back layer — smallest cursor-follow shift. The hover scale
     bump has no transition either: "zoom in" should be instant the moment
     the pointer arrives, not tween in over the next few frames. */
  transform: translateZ(0) scale(1) translate(calc(var(--px) * 16px), calc(var(--py) * 16px));
}
.title-card:hover .title-card__img {
  transform: translateZ(20px) scale(1.08) translate(calc(var(--px) * 16px), calc(var(--py) * 16px));
}

/* Bottom-anchored glass scrim (Codashop-only token) so the overlaid title
   stays legible over any source photo — darker/taller than the generic
   story-hero vignette since this tile is much smaller and busier. */
.title-card__scrim {
  position: absolute;
  inset: 0;
  background: var(--x-gradient-home-tile-scrim, var(--x-gradient-story-vignette));
  pointer-events: none;
}

.title-card__ribbon {
  position: absolute;
  top: var(--x-pad-surface-s);
  left: var(--x-pad-surface-s);
  padding: 2px var(--x-pad-surface-xs);
  border-radius: var(--x-radius-badge-full);
  background: var(--x-gradient-home-ribbon, var(--x-bg-indicator-selected-default));
  color: var(--x-text-header-default);
  text-transform: uppercase;
  /* Every floating layer gets a real drop-shadow now (not just the card's
     own resting box-shadow) — it's what actually sells "floating above the
     art" once the title name (which used to anchor them visually against
     the bottom scrim) is gone. */
  box-shadow: var(--x-shadow-card);
  /* Nearest layer (besides the CTA) — largest cursor-follow shift. */
  transform: translateZ(6px) translate(calc(var(--px) * 28px), calc(var(--py) * 28px));
}
.title-card__instant {
  position: absolute;
  top: var(--x-pad-surface-s);
  right: var(--x-pad-surface-s);
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: var(--x-radius-badge-full);
  background: var(--x-bg-tag-inverse);
  color: var(--x-text-header-inverse);
  box-shadow: var(--x-shadow-card);
  transform: translateZ(6px) translate(calc(var(--px) * 28px), calc(var(--py) * 28px));
}
.title-card:hover .title-card__ribbon,
.title-card:hover .title-card__instant {
  transform: translateZ(70px) translate(calc(var(--px) * 28px), calc(var(--py) * 28px));
}

/* "View Items" — hidden at rest, appears on hover; the CLOSEST layer to the
   viewer (biggest translateZ, biggest cursor-follow shift), floating
   centred over the tile. No transition on the transform (tracks the
   cursor instantly, same as every other layer) — opacity keeps a very
   short fade so it doesn't just blink into existence. */
.title-card__visit {
  position: absolute;
  top: 50%;
  left: 50%;
  padding: var(--x-pad-surface-s) var(--x-pad-surface-l);
  border-radius: var(--x-radius-control-full);
  background: var(--x-bg-action-primary);
  color: var(--x-text-on-primary);
  white-space: nowrap;
  box-shadow: var(--x-shadow-card);
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -50%) translateZ(40px) translate(calc(var(--px) * 36px), calc(var(--py) * 36px));
  transition: opacity var(--x-motion-sys-duration-fast) var(--x-motion-sys-ease-standard);
}
.title-card:hover .title-card__visit {
  opacity: 1;
  transform: translate(-50%, -50%) translateZ(90px) translate(calc(var(--px) * 36px), calc(var(--py) * 36px));
}

/* Visual layout — larger radius, more of a "key art" presence than the
   standard grid's compact list-y tile. Root radius must match the thumb's
   so the border ring's corners line up with the art underneath it. */
.title-card--visual {
  border-radius: var(--x-radius-container-s);
}
.title-card--visual .title-card__thumb {
  border-radius: var(--x-radius-container-s);
}

.title-card__name {
  display: block;
  margin-top: var(--x-gap-content-tight);
  color: var(--x-home-surface-text, var(--x-text-header-default));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
