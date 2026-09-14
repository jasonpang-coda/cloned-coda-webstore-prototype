<script setup>
import { useAuth } from '../composables/useAuth.js'
import MaterialIcon from './MaterialIcon.vue'
import Button from './Button.vue'

/**
 * Snackbar — success toast shown on sign-in (Figma node 4863:15067).
 *
 * Mounted in DeviceFrame's #overlay slot. Reads `snackbarVisible` from the
 * shared useAuth singleton; auto-dismisses after 5s (timer lives in the
 * composable) and the close button dismisses early.
 *
 * Motion (see motion.css / keyframes.css): bounces up from below the screen
 * with the spring curve on entrance, hops + drops off the bottom on exit —
 * a deliberate delight beat for a successful sign-in.
 */
const { snackbarVisible, snackbarContent, dismissSnackbar } = useAuth()

// Mobile (framed) vs responsive — framed pins to the device screen bottom
// (absolute); responsive pins to the viewport bottom (fixed). From App.vue.
defineProps({
  isMobile: { type: Boolean, default: true },
})
</script>

<template>
  <Transition name="snackbar">
    <div v-if="snackbarVisible" class="snackbar" :class="{ 'snackbar--responsive': !isMobile }" role="status" aria-live="polite">
      <MaterialIcon name="check_circle" variant="round" :size="24" class="snackbar__check" />

      <div class="snackbar__content">
        <p class="snackbar__title text-style-heading-banner">{{ snackbarContent.title }}</p>
        <p class="snackbar__text text-style-utility-default-regular">{{ snackbarContent.text }}</p>
      </div>

      <Button variant="icon" size="medium" icon="close" :ripple="false" aria-label="Dismiss" class="snackbar__close" @click="dismissSnackbar()" />
    </div>
  </Transition>
</template>

<style scoped>
.snackbar {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 32px; /* 32px above the screen-box bottom, per spec */
  z-index: 5;   /* above all sheets (z:4), loader (z:2), drawer (z:1) */
  /* Responsive: pin to the VIEWPORT bottom (the overlay layer spans the whole
     scrolling page, so absolute would land at the page bottom). The overlay's
     container-type was removed so fixed resolves to the viewport. */
  /* Fluid on mobile (360px screen), capped at 400px on wider viewports */
  width: calc(100% - var(--x-pad-surface-m) * 2);
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-s) var(--x-pad-surface-s) var(--x-pad-surface-m);
  border: var(--border-weight-default) solid var(--x-text-success-default);
  border-radius: var(--x-radius-container-s, 8px);
  background-image: var(--x-bg-snackbar-success);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
  pointer-events: auto;
  will-change: transform, opacity;
}

/* Responsive/desktop: fixed to the viewport bottom (not the tall page). */
.snackbar--responsive {
  position: fixed;
}

.snackbar__check {
  color: var(--x-text-success-default);
}

.snackbar__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-narrow);
  text-align: left;
  align-items: flex-start;
}
.snackbar__title {
  text-transform: uppercase;
  color: var(--x-text-success-inverse);
}
.snackbar__text {
  color: var(--x-text-success-inverse);
}

.snackbar__close {
  flex-shrink: 0;
  --btn-icon-color: var(--x-text-success-inverse);
  --btn-icon-color-hover: var(--x-text-success-inverse);
  --btn-icon-opacity-hover: 0.7;
}

/* ── Bounce in / drop out ──────────────────────────────────────────────────
   Enter: slide up from below the screen; spring easing (control point >1)
   overshoots past rest and settles — a real bounce, no keyframe needed.
   Exit: snackbar-drop keyframe — small anticipation hop, then accelerate off
   the bottom. Reduced-motion collapses both globally. */
.snackbar-enter-active {
  transition: transform var(--x-motion-snackbar-enter),
              opacity var(--x-motion-snackbar-enter);
}
.snackbar-enter-from {
  /* Keep translateX(-50%) so the entrance doesn't shift from left:50% anchor */
  transform: translateX(-50%) translateY(120%);
  opacity: 0;
}
.snackbar-leave-active {
  animation: snackbar-drop var(--x-motion-snackbar-exit) both;
}
</style>
