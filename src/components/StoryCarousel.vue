<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import MaterialIcon from './MaterialIcon.vue'

/**
 * StoryCarousel — an Instagram-story-style slideshow.
 *  - Supports 1–5 slides. (Hard cap: the segmented progress bar is designed for
 *    up to 5 segments; more than 5 makes each segment too thin to read.)
 *  - Segmented progress bars on top; the active one fills over `interval`.
 *  - Auto-advances when a segment fills; tapping the left/right half navigates.
 *  - Loop: tap-next on the last slide wraps to the first; tap-prev on the first
 *    wraps to the last.
 *  - SINGLE SLIDE: with exactly one slide there is nothing to advance to, so the
 *    progress bar (and its scrim) are hidden and auto-advance / crossfade are
 *    disabled. The frame then just presents the one hero image.
 *  - Honors prefers-reduced-motion: no auto-advance, active segment shown full,
 *    tap navigation still works.
 */
const props = defineProps({
  /** Array of { image, heading, ctaLabel, ctaIcon?, ctaPoi?, ctaTarget?, ctaCategory? } */
  slides: { type: Array, default: () => [] },
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true },
  /** Per-slide auto-advance interval in ms */
  interval: { type: Number, default: 5000 },
  baseDelay: { type: Number, default: 0 },
  /**
   * Optional CSS aspect-ratio (e.g. '16 / 9') that overrides the default
   * responsive frame ratio (1:1 portrait on narrow, 2.6:1 on wide). Use when a
   * store supplies a single hero whose art is neither square nor the wide
   * banner crop — the container then fits the image instead of cropping it.
   */
  aspectRatio: { type: String, default: null },
})

const emit = defineEmits(['cta'])

const current = ref(0)
const lastIndex = computed(() => props.slides.length - 1)

// A single slide has nothing to advance to — drop the progress bar + autoplay.
const isSingle = computed(() => props.slides.length <= 1)

// Reduced-motion: reactive so toggling it during testing takes effect.
const reduceMotion = ref(false)
let mq = null
function onMq(e) { reduceMotion.value = e.matches }

// Press-to-pause: hold anywhere on the frame to freeze the active segment.
const isPressed = ref(false)
function onPressStart() { isPressed.value = true }
function onPressEnd()   { isPressed.value = false }

onMounted(() => {
  if (typeof matchMedia !== 'undefined') {
    mq = matchMedia('(prefers-reduced-motion: reduce)')
    reduceMotion.value = mq.matches
    mq.addEventListener?.('change', onMq)
  }
  document.addEventListener('pointerup',     onPressEnd)
  document.addEventListener('pointercancel', onPressEnd)
})
onBeforeUnmount(() => {
  mq?.removeEventListener?.('change', onMq)
  document.removeEventListener('pointerup',     onPressEnd)
  document.removeEventListener('pointercancel', onPressEnd)
})

// Whether the active segment animates + auto-advances.
const animate = computed(() => props.autoplay && !reduceMotion.value && !isSingle.value)

function next() {
  if (current.value < lastIndex.value) current.value++
  else if (props.loop) current.value = 0
}
function prev() {
  if (current.value > 0) current.value--
  else if (props.loop) current.value = lastIndex.value
}
// Auto-advance fires when the ACTIVE segment finishes filling.
function onSegEnd(i) {
  if (i === current.value && animate.value) next()
}

const rootStyle = computed(() => ({ animationDelay: props.baseDelay + 'ms' }))

// When an explicit aspectRatio is supplied it overrides the responsive default
// (set on .story__frame in CSS) at every breakpoint.
const frameStyle = computed(() => (props.aspectRatio ? { aspectRatio: props.aspectRatio } : null))

function onCta(slide) {
  emit('cta', slide)
}
</script>

<template>
  <div class="story" :class="{ 'story--single': isSingle }" :style="rootStyle">
    <div class="story__frame" :style="frameStyle" @pointerdown.passive="onPressStart">
      <!-- Background images — portrait shown on narrow containers (1:1),
           landscape shown on wide containers (2.7:1). The whole slide is keyed
           by `current` and wrapped in a <Transition> so the outgoing and
           incoming slides gently CROSSFADE (both present + opacity-tweening
           during the swap). Falls back to a single `image` prop. -->
      <Transition name="story-fade">
        <div class="story__slide" :key="current">
          <img
            v-if="slides[current] && (slides[current].portrait || slides[current].image)"
            :src="slides[current].portrait || slides[current].image"
            alt=""
            class="story__image story__image--portrait"
          />
          <img
            v-if="slides[current] && slides[current].landscape"
            :src="slides[current].landscape"
            alt=""
            class="story__image story__image--landscape"
          />
        </div>
      </Transition>

      <!-- Tap zones: left half = previous, right half = next.
           Omitted for a single slide — there's nowhere to navigate. -->
      <template v-if="!isSingle">
        <button
          class="story__zone story__zone--prev"
          type="button"
          aria-label="Previous slide"
          @click="prev"
        ></button>
        <button
          class="story__zone story__zone--next"
          type="button"
          aria-label="Next slide"
          @click="next"
        ></button>
      </template>

      <!-- Top segmented progress (one bar per slide) — hidden for a single slide -->
      <div v-if="!isSingle" class="story__pagination" aria-hidden="true">
        <div v-for="(s, i) in slides" :key="i" class="story__seg">
          <div
            class="story__seg-fill"
            :class="{
              'story__seg-fill--full': i < current || (i === current && !animate),
              'story__seg-fill--active': i === current && animate,
            }"
            :style="(i === current && animate) ? { animationDuration: interval + 'ms', animationPlayState: isPressed ? 'paused' : 'running' } : null"
            @animationend="onSegEnd(i)"
          ></div>
        </div>
      </div>

      <!-- Bottom content: optional logo + heading + CTA. Logo/heading are keyed
           + wrapped in the same story-fade transition as the image so they
           crossfade in sync with it (no snap). The CTA button is a SIBLING,
           deliberately outside that keyed block — Vue patches its label/handler
           in place on slide change instead of mounting a second copy, so the
           outgoing and incoming buttons never overlap mid-crossfade (two
           overlapping pill borders + blurred labels read as a "sweeping"
           double-exposure otherwise). pointer-events:none on the shell so taps
           fall through to the zones; only the CTA re-enables them. -->
      <div class="story__content">
        <Transition name="story-fade">
          <div class="story__content-text" :key="current">
            <img
              v-if="slides[current] && slides[current].logo"
              :src="slides[current].logo"
              alt=""
              class="story__logo"
            />
            <h3 v-if="slides[current] && slides[current].heading" class="story__heading text-style-heading-modal">
              {{ slides[current].heading }}
            </h3>
          </div>
        </Transition>
        <button
          v-if="slides[current] && slides[current].ctaLabel"
          class="story__cta"
          type="button"
          :data-poi="slides[current].ctaPoi ?? null"
          @click.stop="onCta(slides[current])"
        >
          <MaterialIcon v-if="slides[current].ctaIcon" :name="slides[current].ctaIcon" variant="round" :size="18" />
          <span class="story__cta-label text-style-utility-action-regular">{{ slides[current].ctaLabel }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.story {
  width: 100%;
  animation-name: sku-enter;
  animation-duration: var(--x-motion-sys-duration-slow);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;
}

.story__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1; /* mobile portrait — overridden by the aspectRatio prop (inline) */
  overflow: hidden;
  border-radius: var(--x-radius-container-xs);
  background: var(--x-bestseller-warm);
  box-shadow: var(--x-shadow-story-card);
}
/* Landscape / desktop → wide banner. An inline aspect-ratio (frameStyle) wins
   over this rule, so a store supplying an explicit ratio keeps it at all sizes. */
@container (min-width: 801px) {
  .story__frame {
    aspect-ratio: 2.6 / 1;
  }
}

/* Each slide (portrait + landscape pair) is an absolutely-positioned layer
   filling the frame. Two layers coexist briefly during the crossfade. */
.story__slide {
  position: absolute;
  inset: 0;
  z-index: 0; /* below the scrim (1) and content (2) */
}

.story__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* Show portrait by default; swap to landscape on wide containers */
.story__image--landscape { display: none; }
@container (min-width: 801px) {
  .story__image--portrait  { display: none; }
  .story__image--landscape { display: block; }
}

/* Gentle crossfade between slides — both layers tween opacity simultaneously
   so one dissolves into the next (no motion, no harsh cut). Standard ease,
   slightly longer (350ms) for a soft, unhurried feel. Reduced-motion collapses
   this to ~instant via the global rule, so the slide still changes. */
.story-fade-enter-active,
.story-fade-leave-active {
  transition: opacity var(--x-motion-sku-story-fade) var(--x-motion-sys-ease-standard);
}
.story-fade-enter-from,
.story-fade-leave-to {
  opacity: 0;
}

/* Tap zones */
.story__zone {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  z-index: 1;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.story__zone--prev { left: 0; }
.story__zone--next { right: 0; }

/* Grey scrim behind the progress bars — #FCFCFE at 20% fading to 0%.
   Lives on .story__frame::before (z-index 1, above image, below bars/content).
   Using the frame pseudo keeps the bars fully opaque on top of the gradient. */
.story__frame::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 52px; /* covers the 8px top pad + 4px bar + comfortable bleed */
  z-index: 1;   /* above image (0), below pagination + content (2) */
  background: var(--x-gradient-story-progress-scrim);
  pointer-events: none;
}
/* No progress bar on a single slide → no scrim behind it. */
.story--single .story__frame::before { display: none; }

/* Top segmented progress */
.story__pagination {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  gap: var(--x-gap-content-narrow);
  padding: var(--x-pad-surface-s) var(--x-pad-surface-m);
  pointer-events: none;
}
.story__seg {
  flex: 1 1 0;
  height: 4px;
  border-radius: var(--x-radius-badge-full);
  background: var(--x-border-divider);
  overflow: hidden;
}
.story__seg-fill {
  width: 0;
  height: 100%;
  border-radius: var(--x-radius-badge-full);
  background: var(--x-text-hyperlink-default);
}
.story__seg-fill--full {
  width: 100%;
}
.story__seg-fill--active {
  animation-name: story-progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  /* animation-duration supplied inline from the `interval` prop */
}

/* Bottom content shell — always-present (not keyed/transitioned), so the CTA
   button below never duplicates during a slide crossfade. Owns the position/
   scrim/gap every child (text group + button) shares. */
.story__content {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: var(--x-gap-content-loose);
  padding: var(--x-pad-surface-l) var(--x-pad-surface-m);
  /* Subtle bottom scrim so text/CTA/logo stay legible over the image. A store
     can override --x-gradient-story-scrim to fade the banner into its page bg. */
  background: var(--x-gradient-story-scrim, var(--x-gradient-story-vignette));
  pointer-events: none; /* taps fall through to the zones */
}

/* Logo + heading — the part that still crossfades with the image (keyed,
   inside <Transition>). Same gap as the shell so logo↔heading spacing matches
   the original single-flex-column layout exactly. */
.story__content-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-loose);
}

.story__logo {
  display: block;
  max-height: var(--x-story-logo-max-height, 64px);
  max-width: var(--x-story-logo-max-width, 220px);
  width: auto;
  object-fit: contain;
  filter: var(--x-shadow-logo);
}

.story__heading {
  margin: 0;
  max-width: 100%;
  text-transform: uppercase;
  text-align: center;
  color: var(--x-text-header-default);
  text-shadow: var(--x-text-shadow-story-heading);
  /* Centred heading — override the default left-origin condense from the class */
  transform-origin: center center;
}

.story__cta {
  pointer-events: auto; /* re-enable interaction for the button only */
  width: 100%;
  max-width: 336px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-narrow);
  padding: var(--x-pad-surface-m) var(--x-pad-surface-s);
  border: var(--border-weight-action) solid var(--x-text-hyperlink-default);
  border-radius: var(--x-radius-control-full);
  background: var(--x-surface-frost);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  /* Promote to GPU layer before the story-fade opacity transition starts so
     backdrop-filter composites in sync with the button — prevents the blur
     from appearing to lag behind the button's fade-in. */
  will-change: backdrop-filter;
  color: var(--x-text-hyperlink-default);
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color var(--x-motion-sku-hover);
}
.story__cta:hover {
  background: var(--x-surface-frost-hover);
}
/* Condense the label text (not the button box) — class handles display + scaleX.
   Centre-aligned within the button, so override the default left-origin. */
.story__cta-label {
  transform-origin: center center;
}
</style>
