<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import PlayerCard from './PlayerCard.vue'
import MaterialIcon from './MaterialIcon.vue'
import { useCheckout } from '../composables/useCheckout.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
const assets = useStoreAssets()
const strings = useStoreStrings()
const config = useStoreConfig()

/**
 * PlayerAccount — "YOUR COD:M ACCOUNT" guest Player ID entry (Figma 5147:22653).
 * Text input for the Player ID; on blur/Enter a donut spinner shows, then a
 * Player Card fades in reflecting the typed value. Reaching "found" unlocks
 * guest checkout (see useCheckout.guestVerified).
 */
const props = defineProps({
  /** Entrance delay (ms) for the page cascade */
  baseDelay: { type: Number, default: 0 },
})

const { setGuestVerified, setGuestPlayerName, guestVerified, guestPlayerName } = useCheckout()

// Restore previous session: if the user already verified their account (e.g. in a
// prior sheet open), start pre-filled in the 'found' state so they see their
// Player Card immediately rather than an empty field.
const playerId = ref(guestPlayerName.value)
const status = ref(guestVerified.value && guestPlayerName.value ? 'found' : 'idle')
let lookupTimer = null

/** Blur / Enter — kick off the simulated lookup (ignored when empty). */
function lookup() {
  if (!playerId.value.trim()) return
  status.value = 'loading'
  clearTimeout(lookupTimer)
  lookupTimer = setTimeout(() => {
    status.value = 'found'
    setGuestVerified(true)
    setGuestPlayerName(playerId.value.trim())
  }, 1100)
}

/** Typing again cancels any pending lookup, restores instructions, re-locks checkout. */
function onEdit() {
  clearTimeout(lookupTimer)
  status.value = 'idle'
  setGuestVerified(false)
}

// Bidirectional sync: if the other PlayerAccount instance (main page ↔ sheet)
// completes a lookup, mirror its result here so both always show the same account.
// Guard: skip if this instance already reflects the state (avoids spurious resets
// when this instance is the one that triggered the change).
watch([guestVerified, guestPlayerName], ([verified, name]) => {
  if (verified && name && (playerId.value !== name || status.value !== 'found')) {
    playerId.value = name
    status.value = 'found'
  }
})

onBeforeUnmount(() => {
  clearTimeout(lookupTimer)
  // Do NOT reset guestVerified here — the user's verified state must survive the
  // component unmounting (e.g. sheet close/reopen). Only onEdit() resets it when
  // the user deliberately changes their Player ID input.
})

// Chips + their instruction content are localised copy — sourced from the store's
// strings.account.chips (see useStoreStrings). Stores that hide this panel
// (config.profile.showAccountInstructions === false) need not define any.
const chips = computed(() => strings.value.account.chips ?? [])

// null = panel collapsed (default); a chip id = panel expanded for that chip.
const activeChip = ref(null)
const activeData = () => chips.value.find(c => c.id === activeChip.value)

function toggleChip(id) {
  activeChip.value = activeChip.value === id ? null : id
}

// Outer disclosure — the chips + instruction panel are hidden until the user
// taps "How to find your COD:M account".
const instructionsOpen = ref(false)

function toggleInstructions() {
  instructionsOpen.value = !instructionsOpen.value
  // Opening with no prior selection: default to the first chip so the
  // instruction steps show immediately. Context is preserved on reopen.
  if (instructionsOpen.value && activeChip.value === null) {
    activeChip.value = chips.value[0].id
  }
}

function onViewInstructions() {
  // TODO: open image instructions (design pending)
}
</script>

<template>
  <div class="player-account" :style="{ animationDelay: baseDelay + 'ms' }">
    <h2 class="player-account__title text-style-heading-banner">{{ strings.account.heading }}</h2>

    <div class="player-account__form">
      <!-- Player ID text input — spinner overlays on the right while looking up -->
      <div
        class="player-account__field"
        :class="{ 'player-account__field--loading': status === 'loading' }"
      >
        <input
          v-model="playerId"
          type="text"
          class="player-account__input text-style-utility-label-regular"
          :placeholder="strings.account.playerIdLabel"
          @input="onEdit"
          @blur="lookup"
          @keyup.enter="lookup"
        />
        <span
          v-if="status === 'loading'"
          class="player-account__spinner"
          role="status"
          aria-label="Looking up account"
        />
      </div>

      <!-- Disclosure: a tappable label reveals the chips + instruction panel -->
      <div v-if="status !== 'found' && config.profile?.showAccountInstructions !== false">
        <button
          v-ripple
          type="button"
          class="player-account__disclosure"
          :aria-expanded="instructionsOpen"
          @click="toggleInstructions"
        >
          <span class="text-style-utility-default-regular">{{ strings.account.disclosureLabel }}</span>
          <MaterialIcon
            name="expand_more"
            variant="round"
            :size="20"
            class="player-account__disclosure-chevron"
            :class="{ 'is-open': instructionsOpen }"
          />
        </button>

        <!-- Chip tabs + collapsible instruction panel -->
        <Transition name="instructions">
        <div v-if="instructionsOpen" class="player-account__instructions" :class="{ 'is-open': activeChip !== null }">
        <div class="player-account__chips" role="tablist">
          <button
            v-for="chip in chips"
            :key="chip.id"
            v-ripple
            v-haptic:chip
            type="button"
            role="tab"
            :aria-selected="activeChip === chip.id"
            class="player-account__chip"
            :class="{ 'player-account__chip--active': activeChip === chip.id }"
            @click="toggleChip(chip.id)"
          >
            <span :class="['player-account__chip-label', activeChip === chip.id ? 'text-style-utility-label-bold' : 'text-style-utility-label-regular']">{{ chip.label }}</span>
          </button>
        </div>

        <!-- Panel — hidden by default, expands when a chip is active -->
        <div class="player-account__panel-wrap">
          <Transition name="tab-content" mode="out-in">
            <div
              v-if="activeChip !== null"
              :key="activeChip"
              class="player-account__panel"
              role="tabpanel"
            >
              <template v-for="(line, i) in activeData().lines" :key="i">
                <p v-if="line.type === 'text'" class="player-account__panel-text text-style-utility-default-regular">{{ line.content }}</p>
                <p v-else-if="line.type === 'para'" class="player-account__panel-para text-style-utility-default-regular">{{ line.content }}</p>
              </template>
              <button v-ripple v-haptic type="button" class="player-account__panel-link text-style-utility-default-regular" @click="onViewInstructions">
                {{ strings.account.viewImageInstructions }}
              </button>
            </div>
          </Transition>
        </div>
        </div>
        </Transition>
      </div>

      <!-- Player card — fades in once an account is "found" -->
      <Transition name="tab-content">
        <PlayerCard
          v-if="status === 'found'"
          :name="playerId"
          id-masked="**** 9859"
          :level="80"
          rank="Rookie 1"
          :avatar-src="assets.content.avatar"
          :show-rank="config.profile?.showPlayerRank !== false"
        />
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.player-account {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  width: 100%;

  /* Entrance longhands — shorthand + comma-easing var is invalid */
  animation-name: slide-down;
  animation-duration: var(--x-motion-sys-duration-base);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;
}

.player-account__title {
  margin: 0;
  text-transform: uppercase;
  color: var(--x-text-header-default);
  display: block;
}

/* Form — input + instruction panel, no divider */
.player-account__form {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  width: 100%;
}

/* Text input */
.player-account__input {
  width: 100%;
  height: 40px;
  padding: 0 var(--x-pad-surface-s);
  border: var(--border-weight-default) solid var(--x-border-soft-2);
  border-radius: var(--x-radius-container-xs);
  background: var(--x-surface-ghost);
  color: var(--x-text-body-default);
  /* text-style-utility-label-regular on the element handles family/size/weight/tracking.
     Override display, dimensions, and the global condense transform so the input
     fills its container and isn't visually squeezed by [class*="text-style-"]. */
  display: block;
  transform: none;
  line-height: 1;
  outline: none;
  box-sizing: border-box;
}
.player-account__input::placeholder { color: var(--x-text-body-soft); }
.player-account__input:focus { border-color: var(--x-border-input-focused); }

/* Field wrapper — positions the lookup spinner inside the input */
.player-account__field {
  position: relative;
  width: 100%;
}
/* Looking up: focused input ring + room for spinner */
.player-account__field--loading .player-account__input {
  border-color: var(--x-border-input-focused);
  padding-right: calc(var(--x-pad-surface-s) + 28px);
}

/* Donut loader — track ring + single coloured arc, rotating.
   Centred with top/right offsets (no static transform) so the `spin` keyframe's
   rotate() owns the transform property outright. Only transform animates → 60fps;
   reduced-motion is handled globally. */
.player-account__spinner {
  position: absolute;
  top: calc(50% - 10px);
  right: var(--x-pad-surface-s);
  width: 20px;
  height: 20px;
  box-sizing: border-box;
  border: var(--border-weight-action) solid var(--x-border-soft-2);
  border-top-color: var(--x-text-hyperlink-default);
  border-radius: var(--x-radius-badge-full);
  animation-name: spin;
  animation-duration: var(--x-motion-spinner);
  animation-timing-function: var(--x-motion-sys-ease-linear);
  animation-iteration-count: infinite;
}

/* Disclosure trigger — white underlined label + chevron, 4px apart */
.player-account__disclosure {
  display: inline-flex;
  align-items: center;
  gap: var(--x-gap-content-narrow);
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--x-text-body-default);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.player-account__disclosure-chevron {
  color: var(--x-text-body-default);
  transition: transform var(--x-motion-accordion);
}
.player-account__disclosure-chevron.is-open { transform: rotate(180deg); }

/* Chip tabs + collapsible panel wrapper */
.player-account__instructions {
  width: 100%;
  margin-top: var(--x-gap-content-default);
}

.player-account__chips {
  display: flex;
  width: 100%;
  height: 32px;
}
.player-account__chip {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--x-pad-surface-l);
  border: var(--border-weight-default) solid var(--x-border-divider);
  border-radius: 0;
  background: var(--x-rarity-gradient-neutral);
  cursor: pointer;
  transition:
    background-color var(--x-motion-tab-indicator),
    background var(--x-motion-tab-indicator);
}
.player-account__chip:not(:first-child) { border-left: 0; }
/* Closed: all four corners rounded */
.player-account__chip:first-child { border-radius: var(--x-radius-container-xs) 0 0 var(--x-radius-container-xs); }
.player-account__chip:last-child  { border-radius: 0 var(--x-radius-container-xs) var(--x-radius-container-xs) 0; }
/* Open: bottom corners go flat so chips merge visually with the panel below */
.is-open .player-account__chip:first-child { border-radius: var(--x-radius-container-xs) 0 0 0; }
.is-open .player-account__chip:last-child  { border-radius: 0 var(--x-radius-container-xs) 0 0; }

.player-account__chip--active { background: var(--x-border-divider); }
/* Active chip: hide bottom border so it blends into the open panel */
.is-open .player-account__chip--active { border-bottom-color: var(--x-border-divider); }

.player-account__chip-label {
  color: var(--x-text-body-default);
  white-space: nowrap;
  transform-origin: center center;
  transition: font-weight 0ms;
}

/* Panel wrapper — zero-height when closed, auto when open */
.player-account__panel-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
}
.is-open .player-account__panel-wrap {
  grid-template-rows: 1fr;
}

/* Instruction panel — dark box, top corners flat (attached to chip row) */
.player-account__panel {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-m) var(--x-pad-surface-s);
  border: var(--border-weight-default) solid var(--x-border-divider);
  border-top: 0;
  border-radius: 0 0 var(--x-radius-container-xs) var(--x-radius-container-xs);
  background: var(--x-border-divider);
}

.player-account__panel-text {
  margin: 0;
  color: var(--x-text-body-default);
  display: block;
}
.player-account__panel-para {
  margin: 0;
  color: var(--x-text-body-default);
  white-space: pre-line;
  display: block;
}
.player-account__panel-link {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--x-text-hyperlink-default);
  text-decoration: underline;
  text-underline-offset: 2px;
  text-align: left;
  display: block;
}

/* ── Instructions block reveal ───────────────────────────────────────────
   Entrance: 250ms ease-out — slides down 4px from the disclosure button,
   fades in. Exit: 200ms ease-in — retreats upward, fades out. Shorter exit
   keeps closure snappy. Longhands required (easing tokens contain commas). */
.instructions-enter-active {
  transition-property: opacity, transform;
  transition-duration: var(--x-motion-sys-duration-exit);
  transition-timing-function: var(--x-motion-sys-ease-decelerate);
}
.instructions-leave-active {
  transition-property: opacity, transform;
  transition-duration: var(--x-motion-sys-duration-fast);
  transition-timing-function: var(--x-motion-sys-ease-accelerate);
}
.instructions-enter-from,
.instructions-leave-to {
  opacity: 0;
  transform: translateY(calc(-1 * var(--x-motion-sys-distance-sm)));
}

/* ── Player card fade-in ─────────────────────────────────────────────────
   Only `opacity` animates — no layout reflow, 60fps safe. */
.tab-content-enter-active {
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.tab-content-enter-from,
.tab-content-leave-to {
  opacity: 0;
}
</style>
