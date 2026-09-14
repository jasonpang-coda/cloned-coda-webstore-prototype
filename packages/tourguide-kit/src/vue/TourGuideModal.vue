<script setup>
import { ref, computed, watch } from 'vue'
import { useTourGuide } from './useTourGuide.js'

const { modalOpen, closeModal, listFlows, startFlow } = useTourGuide()

const flows = computed(() => listFlows())
const selectedFlowId = ref('')
const shouldRecord = ref(true)
const shouldAutoplay = ref(true)
const shouldVoiceOver = ref(false)
const selectedSpeed = ref(1)

// Voice-over needs manual mode (time to narrate) and recording (somewhere for
// the mic audio to land) — the row is hidden outside manual mode entirely,
// and disabled (with a hint) when recording is off.
const voiceOverAvailable = computed(() => !shouldAutoplay.value && shouldRecord.value)
watch(voiceOverAvailable, (available) => {
  if (!available) shouldVoiceOver.value = false
})

// Group flows by category
const groupedFlows = computed(() => {
  const groups = {}
  for (const f of flows.value) {
    const cat = f.category || 'General'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(f)
  }
  return groups
})

// Auto-select first flow if none selected
const activeSelectedFlow = computed(() => {
  if (selectedFlowId.value) {
    return flows.value.find(f => f.id === selectedFlowId.value) || flows.value[0]
  }
  return flows.value[0] || null
})

function onStart () {
  if (!activeSelectedFlow.value) return
  startFlow(activeSelectedFlow.value.id, {
    record: shouldRecord.value,
    speed: selectedSpeed.value,
    autoplay: shouldAutoplay.value,
    voiceOver: shouldVoiceOver.value,
  })
}
</script>

<template>
  <div v-if="modalOpen" class="tg-modal-backdrop" @click.self="closeModal">
    <div class="tg-modal" role="dialog" aria-labelledby="tg-modal-title" aria-modal="true">
      <!-- Modal Header -->
      <div class="tg-modal__header">
        <div class="tg-modal__title-row">
          <div class="tg-modal__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h2 id="tg-modal-title" class="tg-modal__title">Tour Guide Walkthroughs</h2>
            <p class="tg-modal__subtitle">Select a journey to autoplay with guided onboarding</p>
          </div>
        </div>
        <button type="button" class="tg-modal__close" aria-label="Close dialog" @click="closeModal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="tg-modal__body">
        <!-- Flow List -->
        <div class="tg-modal__flow-list">
          <div v-for="(groupFlows, category) in groupedFlows" :key="category" class="tg-modal__group">
            <div class="tg-modal__group-title">{{ category }}</div>
            <div class="tg-modal__cards">
              <button
                v-for="f in groupFlows"
                :key="f.id"
                type="button"
                class="tg-flow-card"
                :class="{ 'tg-flow-card--active': (activeSelectedFlow?.id === f.id) }"
                @click="selectedFlowId = f.id"
              >
                <div class="tg-flow-card__top">
                  <span class="tg-flow-card__title">{{ f.title }}</span>
                  <span class="tg-flow-card__steps-badge">{{ f.steps.length }} steps</span>
                </div>
                <p v-if="f.description" class="tg-flow-card__desc">{{ f.description }}</p>
                <div class="tg-flow-card__meta">
                  <span v-if="f.defaultTheme" class="tg-flow-card__tag">Store: {{ f.defaultTheme }}</span>
                  <span v-if="f.defaultDevice" class="tg-flow-card__tag">Device: {{ f.defaultDevice }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Options Panel -->
        <div class="tg-modal__options">
          <h4 class="tg-modal__options-heading">Playback Options</h4>

          <!-- Autoplay Toggle — on by default; off pauses the tour after each
               step's spotlight/cursor/action sequence, waiting for the guide
               card's Back/Next buttons instead of advancing automatically. -->
          <div class="tg-option-row">
            <div class="tg-option-row__info">
              <span class="tg-option-row__label">Autoplay</span>
              <span class="tg-option-row__desc">Advance through steps automatically</span>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="shouldAutoplay"
              class="tg-switch"
              :class="{ 'tg-switch--on': shouldAutoplay }"
              @click="shouldAutoplay = !shouldAutoplay"
            >
              <span class="tg-switch__knob" />
            </button>
          </div>

          <!-- Record Session Toggle -->
          <div class="tg-option-row">
            <div class="tg-option-row__info">
              <span class="tg-option-row__label">Record to WebM</span>
              <span class="tg-option-row__desc">Captures video and downloads .webm upon completion</span>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="shouldRecord"
              class="tg-switch"
              :class="{ 'tg-switch--on': shouldRecord }"
              @click="shouldRecord = !shouldRecord"
            >
              <span class="tg-switch__knob" />
            </button>
          </div>

          <!-- Voice-over (mic) Toggle — manual mode only, needs recording on
               so the narration has somewhere to land. -->
          <div v-if="!shouldAutoplay" class="tg-option-row" :class="{ 'tg-option-row--disabled': !voiceOverAvailable }">
            <div class="tg-option-row__info">
              <span class="tg-option-row__label">Voice-over (mic)</span>
              <span class="tg-option-row__desc">
                {{ voiceOverAvailable ? 'Narrate into the recording using your microphone' : 'Turn on Record to enable' }}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="shouldVoiceOver"
              class="tg-switch"
              :class="{ 'tg-switch--on': shouldVoiceOver }"
              :disabled="!voiceOverAvailable"
              @click="shouldVoiceOver = !shouldVoiceOver"
            >
              <span class="tg-switch__knob" />
            </button>
          </div>

          <!-- Speed Switcher -->
          <div class="tg-option-row">
            <div class="tg-option-row__info">
              <span class="tg-option-row__label">Playback Speed</span>
              <span class="tg-option-row__desc">Adjust hold & animation durations</span>
            </div>
            <div class="tg-speed-pills">
              <button
                v-for="s in [1, 1.5, 2]"
                :key="s"
                type="button"
                class="tg-speed-pill"
                :class="{ 'tg-speed-pill--active': selectedSpeed === s }"
                @click="selectedSpeed = s"
              >
                {{ s }}x
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="tg-modal__footer">
        <button type="button" class="tg-btn tg-btn--ghost" @click="closeModal">Cancel</button>
        <button
          type="button"
          class="tg-btn tg-btn--primary"
          :disabled="!activeSelectedFlow"
          @click="onStart"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span>Start Tour</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tg-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 99995;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  animation: tg-fade-in 0.2s ease-out;
}

@keyframes tg-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.tg-modal {
  width: 580px;
  max-width: 100%;
  max-height: 85vh;
  background: #141724;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  color: #FFFFFF;
  overflow: hidden;
}

.tg-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.tg-modal__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tg-modal__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.18);
  color: #3B82F6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tg-modal__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #F8FAFC;
}

.tg-modal__subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.tg-modal__close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.tg-modal__close:hover {
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.1);
}

.tg-modal__body {
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tg-modal__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.tg-modal__group-title {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tg-modal__cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tg-flow-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.15s ease;
}

.tg-flow-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.18);
}

.tg-flow-card--active {
  background: rgba(59, 130, 246, 0.12) !important;
  border-color: #3B82F6 !important;
}

.tg-flow-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tg-flow-card__title {
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
}

.tg-flow-card__steps-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.tg-flow-card__desc {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.4;
}

.tg-flow-card__meta {
  display: flex;
  gap: 6px;
}

.tg-flow-card__tag {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.25);
  padding: 2px 6px;
  border-radius: 4px;
}

.tg-modal__options {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tg-modal__options-heading {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tg-option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.tg-option-row--disabled {
  opacity: 0.5;
}

.tg-option-row__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tg-option-row__label {
  font-size: 13px;
  font-weight: 600;
  color: #FFFFFF;
}

.tg-option-row__desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
}

.tg-switch {
  flex-shrink: 0;
  width: 38px;
  height: 22px;
  padding: 2px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.15s ease;
}

.tg-switch--on {
  background: #3B82F6;
}

.tg-switch:disabled {
  cursor: not-allowed;
}

.tg-switch__knob {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  transition: transform 0.15s ease;
}

.tg-switch--on .tg-switch__knob {
  transform: translateX(16px);
}

.tg-speed-pills {
  display: flex;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 2px;
}

.tg-speed-pill {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.tg-speed-pill--active {
  background: #3B82F6;
  color: #FFFFFF;
}

.tg-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.tg-btn {
  border: none;
  border-radius: 10px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
}

.tg-btn--ghost {
  background: none;
  color: rgba(255, 255, 255, 0.7);
}

.tg-btn--ghost:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
}

.tg-btn--primary {
  background: #3B82F6;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.tg-btn--primary:hover:not(:disabled) {
  background: #2563EB;
}

.tg-btn--primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
