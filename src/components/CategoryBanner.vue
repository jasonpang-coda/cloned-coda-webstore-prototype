<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import MaterialIcon from './MaterialIcon.vue'

const props = defineProps({
  /** URL for the large icon (e.g. COD Point icon). Omit for an icon-less banner. */
  icon: { type: String, default: null },
  /** Title text — optional (some banners are description-only) */
  title: { type: String, default: null },
  /** Main description — supports simple HTML via v-html */
  description: { type: String, default: null },
  /** Secondary line below description */
  subtext: { type: String, default: null },
  /** URL for the banner background image */
  backgroundImage: { type: String, default: null },
  /** Event end time (ms epoch). When set, a live countdown tag is shown. */
  endsAt: { type: Number, default: null },
  /** Prefix for the countdown tag */
  countdownLabel: { type: String, default: 'Event ends in:' },
})

// ── Live countdown ─────────────────────────────────────────────────────────
// Ticks once a second; the tag is informational so it runs regardless of
// prefers-reduced-motion (no decorative animation is attached to it).
const now = ref(Date.now())
let timer = null
onMounted(() => {
  if (props.endsAt == null) return
  timer = setInterval(() => { now.value = Date.now() }, 1000)
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })

const countdown = computed(() => {
  if (props.endsAt == null) return null
  const ms = Math.max(0, props.endsAt - now.value)
  const totalMin = Math.floor(ms / 60000)
  const days = Math.floor(totalMin / 1440)
  const hours = Math.floor((totalMin % 1440) / 60)
  const mins = totalMin % 60
  const pad = (n) => String(n).padStart(2, '0')
  return `${days}d ${pad(hours)}h ${pad(mins)}m`
})
</script>

<template>
  <div class="category-banner">
    <!-- Background image + dark overlay -->
    <div class="category-banner__bg" aria-hidden="true">
      <img v-if="backgroundImage" :src="backgroundImage" alt="" class="category-banner__bg-img" />
      <div class="category-banner__bg-overlay" />
    </div>

    <!-- Icon (only when provided) -->
    <div v-if="icon" class="category-banner__icon">
      <img :src="icon" alt="" class="category-banner__icon-img" />
    </div>

    <!-- Text content -->
    <div class="category-banner__content">
      <h1 v-if="title" class="category-banner__title text-style-heading-card">{{ title }}</h1>
      <!-- Countdown tag — sits below the title -->
      <span v-if="countdown" class="category-banner__countdown">
        <MaterialIcon name="schedule" :size="16" class="category-banner__countdown-icon" />
        <span class="category-banner__countdown-text text-style-utility-label-regular">{{ countdownLabel }} {{ countdown }}</span>
      </span>
      <p v-if="description" class="category-banner__description text-style-utility-default-regular" v-html="description" />
      <p v-if="subtext" class="category-banner__subtext text-style-utility-label-regular">{{ subtext }}</p>
    </div>

    <!-- Optional right-side action (e.g. a secondary CTA) — a sibling of
         .category-banner__content, not nested inside it, so flex:1 on the
         content column doesn't squeeze it. Absent for every existing banner
         usage, so nothing else changes. -->
    <div v-if="$slots.action" class="category-banner__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.category-banner {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding: var(--x-category-banner-pad, var(--x-pad-surface-m) var(--x-pad-surface-s));
  border: var(--x-category-banner-border, none);
  border-bottom: var(--x-category-banner-border-bottom, var(--border-weight-default) solid var(--x-border-divider));
  border-radius: var(--x-radius-container-xs);
  overflow: hidden;

  /* Entrance — animation LONGHANDS (shorthand + comma-easing var is invalid) */
  animation-name: slide-down;
  animation-duration: var(--x-motion-sys-duration-base);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;
}

.category-banner__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
}

.category-banner__bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.category-banner__bg-overlay {
  position: absolute;
  inset: 0;
  background: var(--x-scrim-strong);
  border-radius: inherit;
}

.category-banner__icon {
  flex-shrink: 0;
  width: var(--x-size-img-xxl);
  height: var(--x-size-img-xxl);
  position: relative;
  z-index: 1;
}

.category-banner__icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.category-banner__icon-placeholder {
  flex-shrink: 0;
  width: var(--x-size-img-xxl);
  height: var(--x-size-img-xxl);
  border-radius: var(--x-radius-circle);
  background: var(--x-surface-ghost-2);
  position: relative;
  z-index: 1;
}

.category-banner__content {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-narrow);
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

/* Countdown tag — frosted chip below the title, hugs its content.
   Subtle horizontal gradient (dark-gray→near-white at 16% opacity) matches Figma. */
.category-banner__countdown {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: var(--x-gap-content-narrow);
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-s) var(--x-pad-surface-xxs) var(--x-pad-surface-xs);
  border-radius: var(--x-radius-container-xs);
  background: var(--x-surface-ghost-5);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  color: var(--x-text-header-default);
}
.category-banner__countdown-icon {
  flex-shrink: 0;
}
/* Condense the chip TEXT only (not the box) — keeps padding intact */
.category-banner__countdown-text {
  white-space: nowrap;
}

.category-banner__title {
  color: var(--x-text-header-default);
  margin: 0;
  text-transform: uppercase;
  display: block;
}

.category-banner__description {
  color: var(--x-text-header-default);
  margin: 0;
  /* Pulls the description up closer to the title/countdown above it — was
     the full --x-gap-content-narrow (4px) inherited from the parent's flex
     gap; capped at a tight-but-not-touching 2px (not a larger reduction,
     which would start overlapping the title's own descenders). */
  margin-top: calc(var(--x-gap-content-tight) - var(--x-gap-content-narrow));
  width: 100%;
  display: block;
}

.category-banner__description :deep(strong),
.category-banner__description :deep(b) {
  font-weight: 700; /* accepted carve-out — rich-text bold bump; DS has no standalone weight token */
}

.category-banner__subtext {
  color: var(--x-text-header-default);
  margin: 0;
  width: 100%;
  display: block;
}

.category-banner__action {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
</style>
