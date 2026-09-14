<script setup>
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'
import TokenChip from './TokenChip.vue'
import { getToken } from '../utils/tokens.js'

const props = defineProps({
  preset: {
    type: String,
    required: true,
    validator: (v) => ['sheet', 'loader', 'nav-auth', 'snackbar', 'popover'].includes(v),
  },
  responsive: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
  /** External trigger: 'enter' | 'leave' | null */
  phase: { type: String, default: null },
})

const tokenRoot = inject('tokenRoot', null)
const visible = ref(false)
const navSignedIn = ref(false)
const tokens = ref({})

const presetMeta = computed(() => {
  const map = {
    sheet: {
      title: 'SignInSheet',
      transition: 'sheet',
      chips: ['--motion-modal-enter', '--motion-modal-exit'],
    },
    loader: {
      title: 'SignInLoader',
      transition: 'loader',
      chips: ['--motion-modal-enter', '--motion-modal-exit', '--motion-ease-linear'],
    },
    'nav-auth': {
      title: 'NavBar auth swap',
      transition: 'nav-auth',
      chips: ['--motion-duration-exit', '--motion-duration-base', '--motion-ease-accelerate', '--motion-ease-spring'],
    },
    snackbar: {
      title: 'Snackbar',
      transition: 'snackbar',
      chips: ['--motion-snackbar-enter', '--motion-snackbar-exit'],
    },
    popover: {
      title: 'AccountPopover',
      transition: 'popover',
      chips: ['--motion-modal-enter'],
    },
  }
  return map[props.preset]
})

function refreshTokens() {
  const el = tokenRoot?.value || document.documentElement
  const out = {}
  for (const name of presetMeta.value.chips) {
    out[name] = getToken(name, el)
  }
  tokens.value = out
}

async function play() {
  if (props.preset === 'nav-auth') {
    navSignedIn.value = false
    await nextTick()
    navSignedIn.value = true
    refreshTokens()
    return
  }
  if (props.preset === 'snackbar') {
    visible.value = false
    await nextTick()
    visible.value = true
    const enterMs = parseInt(getToken('--motion-duration-slow', tokenRoot?.value) || '350', 10)
    setTimeout(() => { visible.value = false }, enterMs + 1200)
    return
  }
  visible.value = false
  await nextTick()
  visible.value = true
  refreshTokens()
}

function show() {
  if (props.preset === 'nav-auth') navSignedIn.value = true
  else visible.value = true
  refreshTokens()
}

function dismiss() {
  if (props.preset === 'nav-auth') navSignedIn.value = false
  else visible.value = false
}

watch(() => props.phase, async (phase) => {
  if (phase === 'enter') {
    if (props.preset === 'nav-auth') navSignedIn.value = true
    else visible.value = true
  } else if (phase === 'leave') {
    if (props.preset === 'nav-auth') navSignedIn.value = false
    else visible.value = false
  }
})

watch(() => props.responsive, refreshTokens)

onMounted(() => {
  refreshTokens()
  visible.value = false
  navSignedIn.value = false
})

defineExpose({ play, show, dismiss, refreshTokens })
</script>

<template>
  <div class="surface-demo" :class="{ 'surface-demo--compact': compact }">
    <div class="surface-demo__toolbar">
      <strong>{{ presetMeta.title }}</strong>
      <div class="surface-demo__actions">
        <button type="button" class="surface-demo__btn" @click="play">Play</button>
        <button v-if="visible || navSignedIn" type="button" class="surface-demo__btn surface-demo__btn--ghost" @click="dismiss">Dismiss</button>
      </div>
    </div>

    <div class="surface-demo__chips">
      <TokenChip
        v-for="name in presetMeta.chips"
        :key="name"
        :name="name"
        :value="tokens[name]"
      />
    </div>

    <div class="surface-demo__stage">
      <!-- Sheet -->
      <template v-if="preset === 'sheet'">
        <Transition name="sheet" :duration="{ enter: 350, leave: 200 }">
          <div v-if="visible" class="sheet-demo" :class="{ 'sheet-demo--responsive': responsive }">
            <div class="sheet-demo__panel">
              <span class="sheet-demo__title">SIGN IN TO PURCHASE</span>
              <span class="sheet-demo__cta">Sign in with COD:M</span>
            </div>
          </div>
        </Transition>
      </template>

      <!-- Loader -->
      <template v-else-if="preset === 'loader'">
        <Transition name="loader">
          <div v-if="visible" class="loader-demo">
            <div class="loader-demo__content">
              <span class="loader-demo__label">OPENING COD:M APP…</span>
              <div class="loader-demo__track">
                <div class="loader-demo__bar" />
              </div>
            </div>
          </div>
        </Transition>
      </template>

      <!-- Nav auth -->
      <template v-else-if="preset === 'nav-auth'">
        <div class="nav-auth-demo">
          <Transition name="nav-auth" mode="out-in">
            <button v-if="!navSignedIn" key="signin" type="button" class="nav-auth-demo__btn">SIGN IN</button>
            <button v-else key="avatar" type="button" class="nav-auth-demo__avatar" aria-label="Account" />
          </Transition>
        </div>
      </template>

      <!-- Snackbar -->
      <template v-else-if="preset === 'snackbar'">
        <Transition name="snackbar">
          <div v-if="visible" class="snackbar-demo" role="status">
            <span class="snackbar-demo__icon">✓</span>
            <span>SIGNED IN</span>
          </div>
        </Transition>
      </template>

      <!-- Popover -->
      <template v-else-if="preset === 'popover'">
        <div class="popover-demo">
          <button type="button" class="popover-demo__trigger" aria-label="Avatar" />
          <Transition name="popover">
            <div v-if="visible" class="popover-demo__panel">
              <span class="popover-demo__heading">YOUR ACCOUNT</span>
              <span class="popover-demo__item">Sign out</span>
            </div>
          </Transition>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.surface-demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0;
  background: var(--vp-c-bg);
}
.surface-demo--compact .surface-demo__stage {
  min-height: 180px;
}
.surface-demo__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 13px;
}
.surface-demo__actions {
  display: flex;
  gap: 8px;
}
.surface-demo__btn {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #111;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.surface-demo__btn--ghost {
  background: transparent;
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}
.surface-demo__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
}
.surface-demo__stage {
  position: relative;
  min-height: 220px;
  background: #0d1117;
  overflow: hidden;
}

/* ── Sheet ── */
.sheet-demo {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  pointer-events: none;
}
.sheet-demo__panel {
  width: 100%;
  padding: 20px 16px 24px;
  background: #1a1f2e;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: auto;
}
.sheet-demo__title {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.6);
}
.sheet-demo__cta {
  padding: 12px;
  text-align: center;
  background: oklch(0.91 0.191 97);
  color: #111;
  font-weight: 700;
  font-size: 13px;
  border-radius: 4px;
}
.sheet-enter-active .sheet-demo__panel,
.sheet-leave-active .sheet-demo__panel {
  transition: transform var(--motion-modal-enter), opacity var(--motion-modal-enter);
}
.sheet-enter-from .sheet-demo__panel,
.sheet-leave-to .sheet-demo__panel {
  transform: translateY(100%);
}
.sheet-demo--responsive.sheet-enter-from .sheet-demo__panel,
.sheet-demo--responsive.sheet-leave-to .sheet-demo__panel {
  transform: scale(0.96);
  opacity: 0;
}
.sheet-enter-to .sheet-demo__panel,
.sheet-leave-from .sheet-demo__panel {
  transform: translateY(0);
  opacity: 1;
}

/* ── Loader ── */
.loader-demo {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(8px);
}
.loader-demo__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 200px;
}
.loader-demo__label {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.7);
}
.loader-demo__track {
  width: 80px;
  height: 3px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  overflow: hidden;
}
.loader-demo__bar {
  width: 40%;
  height: 100%;
  background: oklch(0.91 0.191 97);
  animation: loading-indeterminate 1.4s var(--motion-ease-linear) infinite;
  will-change: transform;
}
.loader-enter-active {
  transition: opacity var(--motion-modal-enter);
}
.loader-leave-active {
  transition: opacity var(--motion-modal-exit);
}
.loader-enter-from,
.loader-leave-to {
  opacity: 0;
}

/* ── Nav auth ── */
.nav-auth-demo {
  position: absolute;
  top: 16px;
  right: 16px;
}
.nav-auth-demo__btn {
  padding: 8px 14px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 11px;
  letter-spacing: 0.06em;
  border-radius: 4px;
  cursor: pointer;
}
.nav-auth-demo__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid oklch(0.91 0.191 97);
  background: #2a3142;
  cursor: pointer;
}
.nav-auth-leave-active {
  transition:
    opacity var(--motion-duration-exit) var(--motion-ease-accelerate),
    transform var(--motion-duration-exit) var(--motion-ease-accelerate);
}
.nav-auth-enter-active {
  transition:
    opacity var(--motion-duration-base) var(--motion-ease-decelerate),
    transform var(--motion-duration-base) var(--motion-ease-spring);
}
.nav-auth-enter-from,
.nav-auth-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

/* ── Snackbar ── */
.snackbar-demo {
  position: absolute;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: #1e2433;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  max-width: 280px;
  will-change: transform, opacity;
}
.snackbar-demo__icon {
  color: oklch(0.91 0.191 97);
}
.snackbar-enter-active {
  transition:
    transform var(--motion-snackbar-enter),
    opacity var(--motion-snackbar-enter);
}
.snackbar-enter-from {
  transform: translateX(-50%) translateY(120%);
  opacity: 0;
}
.snackbar-leave-active {
  animation: snackbar-drop var(--motion-snackbar-exit) both;
}

/* ── Popover ── */
.popover-demo {
  position: absolute;
  top: 16px;
  right: 16px;
}
.popover-demo__trigger {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid oklch(0.91 0.191 97);
  background: #2a3142;
  cursor: pointer;
}
.popover-demo__panel {
  position: absolute;
  top: 44px;
  right: 0;
  min-width: 160px;
  padding: 12px;
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transform-origin: top right;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.popover-demo__heading {
  font-size: 10px;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
}
.popover-demo__item {
  font-size: 12px;
  color: #fff;
}
.popover-enter-active,
.popover-leave-active {
  transition:
    opacity var(--motion-modal-enter),
    transform var(--motion-modal-enter);
}
.popover-enter-from .popover-demo__panel,
.popover-leave-to .popover-demo__panel {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
