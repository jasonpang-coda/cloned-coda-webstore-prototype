<script setup>
import { computed } from 'vue'

const props = defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  visible: { type: Boolean, default: false },
  clicking: { type: Boolean, default: false },
})

const cursorStyle = computed(() => ({
  transform: `translate3d(${props.x}px, ${props.y}px, 0)`,
}))
</script>

<template>
  <div
    v-if="visible"
    class="tg-cursor"
    :class="{ 'tg-cursor--clicking': clicking }"
    :style="cursorStyle"
    aria-hidden="true"
  >
    <!-- Ripple Ring on click -->
    <div v-if="clicking" class="tg-cursor__ripple" />

    <!-- Cursor Pointer Arrow -->
    <svg class="tg-cursor__icon" width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3L10.07 20.97L13.58 13.58L20.97 10.07L3 3Z"
        fill="#2563EB"
        stroke="#FFFFFF"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <div class="tg-cursor__halo" />
  </div>
</template>

<style scoped>
.tg-cursor {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 99999;
  transition: transform 0.05s linear;
  will-change: transform;
}

.tg-cursor__icon {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.45));
  transform: translate(-1px, -1px);
}

.tg-cursor__halo {
  position: absolute;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, transparent 70%);
  transform: translate(-25%, -25%);
  pointer-events: none;
}

.tg-cursor__ripple {
  position: absolute;
  top: 0;
  left: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #3B82F6;
  background: rgba(59, 130, 246, 0.2);
  transform: translate(-50%, -50%);
  animation: tg-ripple 0.4s ease-out forwards;
  pointer-events: none;
}

@keyframes tg-ripple {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.3);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.6);
  }
}
</style>
