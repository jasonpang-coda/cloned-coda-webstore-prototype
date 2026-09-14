<script setup>
defineProps({
  state: { type: String, required: true },
  stepIndex: { type: Number, required: true },
  totalSteps: { type: Number, required: true },
  speed: { type: Number, default: 1 },
  isRecording: { type: Boolean, default: false },
  recordingTime: { type: String, default: '00:00' },
})

const emit = defineEmits(['toggle-play', 'next', 'prev', 'set-speed', 'stop'])
</script>

<template>
  <div class="tg-player-bar">
    <!-- Recording indicator badge -->
    <div v-if="isRecording" class="tg-player-bar__rec-badge">
      <span class="tg-player-bar__rec-dot" />
      <span class="tg-player-bar__rec-text">REC {{ recordingTime }}</span>
    </div>

    <!-- Navigation / Play Controls -->
    <div class="tg-player-bar__controls">
      <button
        type="button"
        class="tg-player-bar__icon-btn"
        :disabled="stepIndex === 0"
        title="Previous step"
        @click="emit('prev')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      <button
        type="button"
        class="tg-player-bar__play-btn"
        :title="state === 'playing' ? 'Pause' : 'Play'"
        @click="emit('toggle-play')"
      >
        <!-- Pause icon -->
        <svg v-if="state === 'playing'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
        <!-- Play icon -->
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      <button
        type="button"
        class="tg-player-bar__icon-btn"
        :disabled="stepIndex >= totalSteps - 1"
        title="Next step"
        @click="emit('next')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>
    </div>

    <!-- Step Indicator Dots -->
    <div class="tg-player-bar__steps">
      <div
        v-for="i in totalSteps"
        :key="i"
        class="tg-player-bar__step-dot"
        :class="{
          'tg-player-bar__step-dot--active': i - 1 === stepIndex,
          'tg-player-bar__step-dot--completed': i - 1 < stepIndex,
        }"
      />
    </div>

    <!-- Speed Switcher -->
    <div class="tg-player-bar__speed-group">
      <button
        v-for="s in [1, 1.5, 2]"
        :key="s"
        type="button"
        class="tg-player-bar__speed-btn"
        :class="{ 'tg-player-bar__speed-btn--active': speed === s }"
        @click="emit('set-speed', s)"
      >
        {{ s }}x
      </button>
    </div>

    <!-- Stop / Close Button -->
    <button
      type="button"
      class="tg-player-bar__stop-btn"
      title="Exit Tour"
      @click="emit('stop')"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" />
      </svg>
      <span>Stop</span>
    </button>
  </div>
</template>

<style scoped>
.tg-player-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 17, 26, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
  border-radius: 40px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #FFFFFF;
  z-index: 99999;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  animation: tg-bar-in 0.3s cubic-bezier(0, 0, 0.2, 1) forwards;
}

@keyframes tg-bar-in {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.tg-player-bar__rec-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 20px;
  padding: 4px 10px;
}

.tg-player-bar__rec-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #EF4444;
  animation: tg-rec-blink 1.2s infinite ease-in-out;
}

@keyframes tg-rec-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.tg-player-bar__rec-text {
  font-size: 11px;
  font-weight: 700;
  color: #F87171;
  letter-spacing: 0.05em;
}

.tg-player-bar__controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tg-player-bar__icon-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.tg-player-bar__icon-btn:hover:not(:disabled) {
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.1);
}

.tg-player-bar__icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.tg-player-bar__play-btn {
  background: #3B82F6;
  border: none;
  color: #FFFFFF;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transition: transform 0.15s, background 0.15s;
}

.tg-player-bar__play-btn:hover {
  background: #2563EB;
  transform: scale(1.06);
}

.tg-player-bar__steps {
  display: flex;
  align-items: center;
  gap: 5px;
}

.tg-player-bar__step-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  transition: all 0.2s;
}

.tg-player-bar__step-dot--completed {
  background: #3B82F6;
}

.tg-player-bar__step-dot--active {
  background: #FFFFFF;
  transform: scale(1.4);
}

.tg-player-bar__speed-group {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2px;
}

.tg-player-bar__speed-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.tg-player-bar__speed-btn--active {
  background: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
}

.tg-player-bar__stop-btn {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #F87171;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
}

.tg-player-bar__stop-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #FFFFFF;
}
</style>
