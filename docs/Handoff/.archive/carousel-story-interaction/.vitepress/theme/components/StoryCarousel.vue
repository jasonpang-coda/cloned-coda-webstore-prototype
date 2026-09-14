<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/**
 * StoryCarousel — an Instagram-story-style slideshow.
 *  - Up to 5 slides, each with a background image, heading and CTA.
 *  - Segmented progress bars on top; the active one fills over `interval`.
 *  - Auto-advances when a segment fills; tapping the left/right half navigates.
 *  - Loop: tap-next on the last slide wraps to the first; tap-prev on the first
 *    wraps to the last.
 *  - Honors prefers-reduced-motion: no auto-advance, active segment shown full,
 *    tap navigation still works.
 */
const props = defineProps({
  /** Array of { image, heading, ctaLabel, ctaTarget?, ctaCategory? } */
  slides: { type: Array, default: () => [] },
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true },
  /** Per-slide auto-advance interval in ms */
  interval: { type: Number, default: 5000 },
  baseDelay: { type: Number, default: 0 },
  /**
   * HANDOFF-ONLY shim (not in the prototype source). A UI toggle can't fake the
   * OS `prefers-reduced-motion` setting that `matchMedia` reads, so the
   * playground forces the reduced-motion branch via this prop. In the real
   * component reduced-motion is driven solely by the OS/browser setting.
   */
  forceReduceMotion: { type: Boolean, default: false },
})

const emit = defineEmits(['cta'])

const current = ref(0)
const lastIndex = computed(() => props.slides.length - 1)

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

// Whether the active segment animates + auto-advances. `forceReduceMotion` is
// the handoff-only override (see prop note); the prototype omits it.
const animate = computed(() => props.autoplay && !reduceMotion.value && !props.forceReduceMotion)

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

function onCta(slide) {
  emit('cta', slide)
}
</script>

<template>
  <div class="story" :style="rootStyle">
    <div class="story__frame" @pointerdown.passive="onPressStart">
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

      <!-- Tap zones: left half = previous, right half = next -->
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

      <!-- Top segmented progress (one bar per slide) -->
      <div class="story__pagination" aria-hidden="true">
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

      <!-- Bottom content: heading + CTA. Keyed + wrapped in the same story-fade
           transition as the image so each slide's unique heading/button
           crossfades in sync (no snap). pointer-events:none so taps fall through
           to the zones; only the CTA re-enables them. -->
      <Transition name="story-fade">
        <div class="story__content" :key="current">
          <h3 v-if="slides[current] && slides[current].heading" class="story__heading text-style-heading-modal">
            {{ slides[current].heading }}
          </h3>
          <button
            v-if="slides[current] && slides[current].ctaLabel"
            class="story__cta"
            type="button"
            @click.stop="onCta(slides[current])"
          >
            <span class="story__cta-label text-style-utility-action-regular">{{ slides[current].ctaLabel }}</span>
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.story {
  width: 100%;
  animation-name: sku-enter;
  animation-duration: var(--motion-duration-slow);
  animation-timing-function: var(--motion-ease-decelerate);
  animation-fill-mode: both;
}

.story__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1; /* mobile portrait */
  overflow: hidden;
  border-radius: var(--radius-container-xs);
  background: var(--bestseller-warm);
  box-shadow: var(--shadow-story-card);
}
/* Landscape / desktop → wide banner */
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
  transition: opacity var(--motion-sku-story-fade) var(--motion-ease-standard);
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
  background: var(--gradient-story-progress-scrim);
  pointer-events: none;
}

/* Top segmented progress */
.story__pagination {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  gap: var(--gap-content-narrow);
  padding: var(--pad-surface-s) var(--pad-surface-m);
  pointer-events: none;
}
.story__seg {
  flex: 1 1 0;
  height: 4px;
  border-radius: var(--radius-badge-full);
  background: var(--border-divider);
  overflow: hidden;
}
.story__seg-fill {
  width: 0;
  height: 100%;
  border-radius: var(--radius-badge-full);
  background: var(--text-hyperlink-default);
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

/* Bottom content */
.story__content {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: var(--gap-content-loose);
  padding: var(--pad-surface-l) var(--pad-surface-m);
  /* Subtle bottom scrim so text/CTA stay legible over the image */
  background: var(--gradient-story-vignette);
  pointer-events: none; /* taps fall through to the zones */
}

.story__heading {
  margin: 0;
  max-width: 100%;
  text-transform: uppercase;
  text-align: center;
  color: var(--text-header-default);
  text-shadow: var(--text-shadow-story-heading);
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
  padding: var(--pad-surface-m) var(--pad-surface-s);
  border: var(--border-weight-action) solid var(--text-hyperlink-default);
  border-radius: var(--radius-container-xs);
  background: var(--surface-frost);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  /* Promote to GPU layer before the story-fade opacity transition starts so
     backdrop-filter composites in sync with the button — prevents the blur
     from appearing to lag behind the button's fade-in. */
  will-change: backdrop-filter;
  color: var(--text-hyperlink-default);
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color var(--motion-sku-hover);
}
.story__cta:hover {
  background: var(--surface-frost-hover);
}
/* Condense the label text (not the button box) — class handles display + scaleX.
   Centre-aligned within the button, so override the default left-origin. */
.story__cta-label {
  transform-origin: center center;
}
</style>
