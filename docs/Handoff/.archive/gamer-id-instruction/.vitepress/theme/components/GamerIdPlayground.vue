<script setup>
import { ref } from 'vue'

const instructionsOpen = ref(false)
const activeChip = ref(null)
const lookupState = ref('idle') // idle | loading | found
let spinnerTimer = null

const chips = [
  { id: 'uid',       label: 'Find UID' },
  { id: 'player-id', label: 'Find Player ID' },
  { id: 'nickname',  label: 'Find Nickname' },
]

const panelContent = {
  uid:        { title: 'UID', body: 'Your ID consists of 19–20 numbers.\n\nIn-game:\n  •  Player Profile > BASIC' },
  'player-id':{ title: 'Player ID', body: 'A shorter numeric identifier for your account.\n\nIn-game:\n  •  Player Profile > BASIC' },
  nickname:   { title: 'Nickname', body: 'Your in-game display name.\n\nIn-game:\n  •  Player Profile > BASIC' },
}

function toggleInstructions() {
  instructionsOpen.value = !instructionsOpen.value
  if (instructionsOpen.value && activeChip.value === null) {
    activeChip.value = chips[0].id
  }
}

function toggleChip(id) {
  activeChip.value = activeChip.value === id ? null : id
}

function triggerLookup() {
  if (lookupState.value === 'loading') return
  lookupState.value = 'loading'
  instructionsOpen.value = false
  activeChip.value = null
  clearTimeout(spinnerTimer)
  spinnerTimer = setTimeout(() => { lookupState.value = 'found' }, 1100)
}

function reset() {
  clearTimeout(spinnerTimer)
  lookupState.value = 'idle'
  instructionsOpen.value = false
  activeChip.value = null
}
</script>

<template>
  <TokenSandbox title="Live demo">
    <template #default>
      <div class="demo-stage">
        <!-- Simulated input field -->
        <div class="demo-field" :class="{ 'demo-field--loading': lookupState === 'loading' }">
          <div class="demo-input-label">Player ID</div>
          <div class="demo-input-value">CODM_USER_12345</div>
          <span v-if="lookupState === 'loading'" class="demo-spinner" />
        </div>

        <!-- Disclosure trigger (hidden once found) -->
        <template v-if="lookupState !== 'found'">
          <button class="demo-disclosure" @click="toggleInstructions">
            <span>How to find your COD:M account</span>
            <span class="demo-chevron" :class="{ 'is-open': instructionsOpen }">▾</span>
          </button>

          <Transition name="instructions">
            <div v-if="instructionsOpen" class="demo-instructions" :class="{ 'is-open': activeChip !== null }">
              <!-- Chips -->
              <div class="demo-chips">
                <button
                  v-for="chip in chips"
                  :key="chip.id"
                  class="demo-chip"
                  :class="{ 'demo-chip--active': activeChip === chip.id }"
                  @click="toggleChip(chip.id)"
                >{{ chip.label }}</button>
              </div>

              <!-- Panel accordion -->
              <div class="demo-panel-wrap">
                <Transition name="tab-content" mode="out-in">
                  <div v-if="activeChip" :key="activeChip" class="demo-panel">
                    <strong>{{ panelContent[activeChip].title }}</strong>
                    <p style="white-space:pre-line;margin:4px 0 0">{{ panelContent[activeChip].body }}</p>
                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </template>

        <!-- Player card -->
        <Transition name="tab-content">
          <div v-if="lookupState === 'found'" class="demo-player-card">
            <div class="demo-avatar">🎮</div>
            <div>
              <div class="demo-player-name">CODM_USER_12345</div>
              <div class="demo-player-meta">**** 9859 · Lv 80 · Rookie 1</div>
            </div>
          </div>
        </Transition>

        <!-- Action buttons -->
        <div class="demo-actions">
          <button v-if="lookupState === 'idle'" class="demo-btn demo-btn--primary" @click="triggerLookup">
            Simulate lookup
          </button>
          <button v-if="lookupState !== 'idle'" class="demo-btn" @click="reset">
            Reset
          </button>
        </div>
      </div>
    </template>

    <template #hint>
      Try: open the disclosure, switch chips, then simulate a lookup to see the full sequence.
    </template>
  </TokenSandbox>
</template>

<style scoped>
.demo-stage {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 320px;
  margin: 0 auto;
  font-family: var(--vp-font-family-base, sans-serif);
  font-size: 13px;
}

/* Input field */
.demo-field {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border: 1px solid #555;
  border-radius: 4px;
  background: rgba(255,255,255,0.05);
}
.demo-field--loading { border-color: #4a90d9; padding-right: 38px; }
.demo-input-label { color: #888; font-size: 11px; }
.demo-input-value { color: #eee; }

/* Spinner */
.demo-spinner {
  position: absolute;
  right: 10px;
  top: calc(50% - 10px);
  width: 20px; height: 20px;
  border: 2px solid #555;
  border-top-color: #4a90d9;
  border-radius: 50%;
  animation-name: spin;
  animation-duration: var(--motion-spinner, 700ms);
  animation-timing-function: var(--motion-sys-ease-linear, linear);
  animation-iteration-count: infinite;
}

/* Disclosure */
.demo-disclosure {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #ccc;
  text-decoration: underline;
  font-size: 13px;
}
.demo-chevron {
  display: inline-block;
  transition: transform var(--motion-accordion, 350ms cubic-bezier(0.4,0,0.2,1));
}
.demo-chevron.is-open { transform: rotate(180deg); }

/* Instructions block */
.demo-instructions { width: 100%; }

/* Chips */
.demo-chips { display: flex; height: 32px; }
.demo-chip {
  flex: 1;
  border: 1px solid #555;
  border-radius: 0;
  background: rgba(255,255,255,0.05);
  color: #ccc;
  cursor: pointer;
  font-size: 11px;
  transition:
    background-color var(--motion-tab-indicator, 250ms cubic-bezier(0.4,0,0.2,1)),
    background var(--motion-tab-indicator, 250ms cubic-bezier(0.4,0,0.2,1));
}
.demo-chip:not(:first-child) { border-left: 0; }
.demo-chip:first-child { border-radius: 4px 0 0 4px; }
.demo-chip:last-child  { border-radius: 0 4px 4px 0; }
.is-open .demo-chip:first-child { border-radius: 4px 0 0 0; }
.is-open .demo-chip:last-child  { border-radius: 0 4px 0 0; }
.demo-chip--active { background: rgba(255,255,255,0.15); }
.is-open .demo-chip--active { border-bottom-color: rgba(255,255,255,0.15); }

/* Panel accordion */
.demo-panel-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--motion-sys-duration-base, 250ms) var(--motion-sys-ease-standard, cubic-bezier(0.4,0,0.2,1));
}
.is-open .demo-panel-wrap { grid-template-rows: 1fr; }
.demo-panel {
  overflow: hidden;
  padding: 10px;
  border: 1px solid rgba(255,255,255,0.15);
  border-top: 0;
  border-radius: 0 0 4px 4px;
  background: rgba(255,255,255,0.08);
  color: #ccc;
  font-size: 12px;
  line-height: 1.5;
}
.demo-panel strong { color: #fff; }

/* Player card */
.demo-player-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  background: rgba(255,255,255,0.08);
}
.demo-avatar { font-size: 28px; }
.demo-player-name { color: #fff; font-weight: 600; }
.demo-player-meta { color: #888; font-size: 11px; margin-top: 2px; }

/* Action buttons */
.demo-actions { display: flex; gap: 8px; margin-top: 4px; }
.demo-btn {
  padding: 6px 14px;
  border: 1px solid #555;
  border-radius: 4px;
  background: rgba(255,255,255,0.05);
  color: #ccc;
  cursor: pointer;
  font-size: 12px;
}
.demo-btn--primary { background: #4a90d9; border-color: #4a90d9; color: #fff; }

/* ── Transitions ── */
.instructions-enter-active {
  transition-property: opacity, transform;
  transition-duration: var(--motion-sys-duration-exit, 200ms);
  transition-timing-function: var(--motion-sys-ease-decelerate, cubic-bezier(0,0,0.2,1));
}
.instructions-leave-active {
  transition-property: opacity, transform;
  transition-duration: var(--motion-sys-duration-fast, 150ms);
  transition-timing-function: var(--motion-sys-ease-accelerate, cubic-bezier(0.4,0,1,1));
}
.instructions-enter-from,
.instructions-leave-to {
  opacity: 0;
  transform: translateY(calc(-1 * var(--motion-sys-distance-sm, 4px)));
}

.tab-content-enter-active {
  transition: opacity var(--motion-sys-duration-base, 250ms) var(--motion-sys-ease-decelerate, cubic-bezier(0,0,0.2,1));
}
.tab-content-enter-from,
.tab-content-leave-to { opacity: 0; }
</style>
