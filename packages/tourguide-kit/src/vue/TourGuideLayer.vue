<script setup>
import { computed } from 'vue'
import { useTourGuide } from './useTourGuide.js'
import VirtualCursor from './components/VirtualCursor.vue'
import TourGuideCard from './components/TourGuideCard.vue'
import TourGuidePlayerBar from './components/TourGuidePlayerBar.vue'

const {
  state,
  activeFlow,
  currentStepIndex,
  currentStep,
  totalSteps,
  speed,
  cursor,
  activePoi,
  stepProgress,
  isRecording,
  recordingTime,
  togglePlayPause,
  nextStep,
  prevStep,
  stopFlow,
  setSpeed,
} = useTourGuide()

const isActive = computed(() => state.value !== 'idle')

const spotlightBoxStyle = computed(() => {
  if (!activePoi.value?.rect) return null
  const r = activePoi.value.rect
  const pad = 6
  return {
    top: `${Math.max(0, r.top - pad)}px`,
    left: `${Math.max(0, r.left - pad)}px`,
    width: `${r.width + pad * 2}px`,
    height: `${r.height + pad * 2}px`,
  }
})
</script>

<template>
  <div v-if="isActive" class="tg-layer" aria-live="polite">
    <!-- Plain full-screen scrim — only while there's no POI, since the
         spotlight box below already darkens the whole screen via its own
         9999px shadow cutout. Rendering both at once double-dims the
         backdrop and the highlighted element reads darker than intended. -->
    <div v-if="!spotlightBoxStyle" class="tg-layer__scrim" />

    <!-- Spotlight cutout highlight box around active POI -->
    <div v-if="spotlightBoxStyle" class="tg-layer__spotlight" :style="spotlightBoxStyle" />

    <!-- Virtual Simulated Pointer -->
    <VirtualCursor
      :x="cursor.x"
      :y="cursor.y"
      :visible="cursor.visible"
      :clicking="cursor.clicking"
    />

    <!-- Floating Onboarding Guide Card -->
    <TourGuideCard
      v-if="currentStep"
      :step="currentStep"
      :step-index="currentStepIndex"
      :total-steps="totalSteps"
      :flow-title="activeFlow?.title || ''"
      :poi-rect="activePoi?.rect || null"
      :progress="stepProgress"
      @next="nextStep"
      @prev="prevStep"
      @close="stopFlow"
    />

    <!-- Bottom Player Control Bar — hidden while a recording is in session so
         it doesn't show up in the captured .webm (manual-mode Back/Next stay
         available via the guide card's own controls). -->
    <TourGuidePlayerBar
      v-if="!isRecording"
      :state="state"
      :step-index="currentStepIndex"
      :total-steps="totalSteps"
      :speed="speed"
      :is-recording="isRecording"
      :recording-time="recordingTime"
      @toggle-play="togglePlayPause"
      @next="nextStep"
      @prev="prevStep"
      @set-speed="setSpeed"
      @stop="stopFlow"
    />
  </div>
</template>

<style scoped>
.tg-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 99990;
}

.tg-layer__scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.tg-layer__spotlight {
  position: fixed;
  border-radius: 12px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45), 0 0 16px 2px rgba(59, 130, 246, 0.65);
  border: 2px solid #3B82F6;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  animation: tg-spotlight-pulse 2s infinite ease-in-out;
}

@keyframes tg-spotlight-pulse {
  0%, 100% {
    border-color: #3B82F6;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45), 0 0 16px 2px rgba(59, 130, 246, 0.65);
  }
  50% {
    border-color: #60A5FA;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45), 0 0 24px 6px rgba(96, 165, 250, 0.85);
  }
}
</style>
