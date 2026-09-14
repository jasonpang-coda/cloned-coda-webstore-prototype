<script setup>
import { computed } from 'vue'

const props = defineProps({
  step: { type: Object, required: true },
  stepIndex: { type: Number, required: true },
  totalSteps: { type: Number, required: true },
  flowTitle: { type: String, default: '' },
  poiRect: { type: Object, default: null },
  progress: { type: Number, default: 0 },
})

const emit = defineEmits(['next', 'prev', 'close'])

const cardStyle = computed(() => {
  if (!props.poiRect) {
    // Center card if no POI
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }

  const r = props.poiRect
  const placement = props.step.poiPlacement || 'auto'
  const cardW = 340
  const cardH = 180
  const gap = 16
  const margin = 16

  let top = r.bottom + gap
  let left = Math.max(margin, Math.min(window.innerWidth - cardW - margin, r.cx - cardW / 2))

  if (placement === 'top' || (placement === 'auto' && r.bottom + cardH + gap > window.innerHeight && r.top - cardH - gap > 0)) {
    top = Math.max(margin, r.top - cardH - gap)
  } else if (placement === 'bottom') {
    top = Math.min(window.innerHeight - cardH - margin, r.bottom + gap)
  } else if (placement === 'left') {
    top = Math.max(margin, Math.min(window.innerHeight - cardH - margin, r.cy - cardH / 2))
    left = Math.max(margin, r.left - cardW - gap)
  } else if (placement === 'right') {
    top = Math.max(margin, Math.min(window.innerHeight - cardH - margin, r.cy - cardH / 2))
    left = Math.min(window.innerWidth - cardW - margin, r.right + gap)
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
    transform: 'none',
  }
})
</script>

<template>
  <div class="tg-guide-card" :style="cardStyle">
    <!-- Progress bar on top edge of card -->
    <div class="tg-guide-card__progress-track">
      <div class="tg-guide-card__progress-fill" :style="{ width: `${progress}%` }" />
    </div>

    <!-- Header Badges -->
    <div class="tg-guide-card__header">
      <div class="tg-guide-card__badges">
        <span class="tg-guide-card__badge tg-guide-card__badge--step">
          Step {{ stepIndex + 1 }} of {{ totalSteps }}
        </span>
        <span v-if="flowTitle" class="tg-guide-card__badge tg-guide-card__badge--flow">
          {{ flowTitle }}
        </span>
      </div>
      <button
        type="button"
        class="tg-guide-card__close-btn"
        aria-label="Stop Tour"
        title="Stop Tour"
        @click="emit('close')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- Title & Explanation -->
    <div class="tg-guide-card__body">
      <h3 class="tg-guide-card__title">{{ step.title }}</h3>
      <p v-if="step.explanation" class="tg-guide-card__text">
        {{ step.explanation }}
      </p>
    </div>

    <!-- Controls -->
    <div class="tg-guide-card__footer">
      <div class="tg-guide-card__actions">
        <button
          type="button"
          class="tg-guide-card__btn tg-guide-card__btn--secondary"
          :disabled="stepIndex === 0"
          @click="emit('prev')"
        >
          Back
        </button>
        <button
          type="button"
          class="tg-guide-card__btn tg-guide-card__btn--primary"
          @click="emit('next')"
        >
          {{ stepIndex === totalSteps - 1 ? 'Finish' : 'Next' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tg-guide-card {
  position: fixed;
  width: 340px;
  max-width: calc(100vw - 32px);
  background: rgba(18, 20, 29, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.4);
  border-radius: 14px;
  color: #FFFFFF;
  padding: 16px 18px 14px;
  z-index: 99998;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: auto;
  overflow: hidden;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  animation: tg-card-in 0.25s cubic-bezier(0, 0, 0.2, 1) forwards;
}

@keyframes tg-card-in {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(6px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.tg-guide-card__progress-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
}

.tg-guide-card__progress-fill {
  height: 100%;
  background: #3B82F6;
  transition: width 0.05s linear;
}

.tg-guide-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tg-guide-card__badges {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.tg-guide-card__badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tg-guide-card__badge--step {
  background: #2563EB;
  color: #FFFFFF;
}

.tg-guide-card__badge--flow {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
}

.tg-guide-card__close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, background 0.15s;
}

.tg-guide-card__close-btn:hover {
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.1);
}

.tg-guide-card__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tg-guide-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
  color: #F8FAFC;
}

.tg-guide-card__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.75);
}

.tg-guide-card__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 4px;
}

.tg-guide-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tg-guide-card__btn {
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.tg-guide-card__btn--secondary {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
}
.tg-guide-card__btn--secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
}
.tg-guide-card__btn--secondary:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.tg-guide-card__btn--primary {
  background: #3B82F6;
  color: #FFFFFF;
}
.tg-guide-card__btn--primary:hover {
  background: #2563EB;
}
</style>
