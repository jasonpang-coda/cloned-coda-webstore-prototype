<script setup>
import { ref, onMounted } from 'vue'

const THEMES = [
  { value: 'codm',        label: 'COD:M',         hint: 'warm gold' },
  { value: 'fcm',         label: 'FC Mobile',      hint: 'green / lime' },
  { value: 'roguetrader', label: 'Rogue Trader',   hint: 'gold + warp-green' },
  { value: 'efootball',   label: 'eFootball',      hint: 'bright yellow' },
  { value: 'tdr',         label: 'TDR',            hint: 'warm gold' },
  { value: 'ygodl',       label: 'YGODL',          hint: 'warm gold' },
]

const EFFECTS = [
  {
    key: 'rotate',
    cls: 'fx-glow-border--rotate',
    label: '.fx-glow-border--rotate',
    badge: 'New',
    desc: 'Full gapless tri-tone ring rotating slowly. Premium / charged feel. Reuses border-spin.',
    animated: true,
  },
  {
    key: 'pulse',
    cls: 'fx-glow-border--pulse',
    label: '.fx-glow-border--pulse',
    badge: 'New',
    desc: 'Static ring whose opacity breathes in / out with a drop-shadow glow bleed. Calm "live / unread" signal.',
    animated: true,
  },
  {
    key: 'hud',
    cls: 'fx-glow-border--hud',
    label: '.fx-glow-border--hud',
    badge: 'New · Static',
    desc: 'Four L-shaped corner brackets. HUD / targeting-reticle frame. No animation — works in all motion contexts.',
    animated: false,
  },
  {
    key: 'trace',
    cls: 'fx-glow-border--trace',
    label: '.fx-glow-border--trace',
    badge: 'New',
    desc: 'Border draws itself 0 → 360° then holds. Play once as a reveal, or loop as a loading ring.',
    animated: true,
  },
  {
    key: 'dual',
    cls: 'fx-glow-border--dual',
    label: '.fx-glow-border--dual',
    badge: 'Existing',
    desc: 'Two comets orbiting 180° apart. Lead comet uses --x-fx-border-glow/hot; trail comet uses --x-fx-border-trail-glow/hot.',
    animated: true,
  },
  {
    key: 'hdr',
    cls: 'fx-glow-border--hdr',
    label: '.fx-glow-border--hdr',
    badge: 'Existing',
    desc: 'Single comet, wider arc (80°). Used by BestSellerCard. Reads --x-hdr-glow/hot directly.',
    animated: true,
  },
]

const activeTheme = ref('codm')

function setTheme(value) {
  activeTheme.value = value
  document.documentElement.setAttribute('data-theme', value)
}

// Re-trigger the trace animation by toggling a key on swatches
const traceKey = ref(0)
function replayTrace() {
  traceKey.value++
}

// Auto-replay trace every time theme changes
function onThemeChange(value) {
  setTheme(value)
  traceKey.value++
}

onMounted(() => {
  setTheme('codm')
})
</script>

<template>
  <div class="demo">
    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <header class="demo__header">
      <div class="demo__header-inner">
        <div>
          <h1 class="demo__title">FX Border Effects</h1>
          <p class="demo__subtitle">
            Six border treatments. All brand-agnostic — they read
            <code>--fx-border-*</code> tokens, which each store theme already defines.
          </p>
        </div>
        <div class="demo__theme-bar">
          <span class="demo__theme-label">Store</span>
          <div class="demo__theme-pills">
            <button
              v-for="t in THEMES"
              :key="t.value"
              class="demo__pill"
              :class="{ 'demo__pill--active': activeTheme === t.value }"
              @click="onThemeChange(t.value)"
            >
              {{ t.label }}
              <span class="demo__pill-hint">{{ t.hint }}</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- ── Effect grid ────────────────────────────────────────────────────── -->
    <main class="demo__main">
      <section
        v-for="effect in EFFECTS"
        :key="effect.key"
        class="demo__card"
      >
        <div class="demo__card-meta">
          <div class="demo__card-top">
            <code class="demo__effect-name">{{ effect.label }}</code>
            <span
              class="demo__badge"
              :class="effect.badge.includes('Existing') ? 'demo__badge--existing' : 'demo__badge--new'"
            >{{ effect.badge }}</span>
          </div>
          <p class="demo__effect-desc">{{ effect.desc }}</p>
        </div>

        <!-- Swatch: the actual effect applied to a placeholder element -->
        <div class="demo__swatch-wrap">
          <!-- Wide card-like swatch -->
          <div
            :key="effect.key === 'trace' ? traceKey : effect.key"
            class="demo__swatch demo__swatch--card"
            :class="effect.cls"
          >
            <div class="demo__swatch-inner">
              <div class="demo__swatch-eyebrow">PREMIUM EDITION</div>
              <div class="demo__swatch-title">{{ effect.label.replace('.fx-glow-border', '') }}</div>
            </div>
          </div>
          <!-- Square badge-like swatch -->
          <div
            :key="effect.key === 'trace' ? traceKey + 'sq' : effect.key + 'sq'"
            class="demo__swatch demo__swatch--square"
            :class="effect.cls"
          >
          </div>
        </div>

        <button
          v-if="effect.key === 'trace'"
          class="demo__replay"
          @click="replayTrace"
        >↺ Replay</button>
      </section>
    </main>

    <!-- ── Token reference ────────────────────────────────────────────────── -->
    <footer class="demo__footer">
      <div class="demo__token-table">
        <h2 class="demo__token-title">Token reference</h2>
        <table class="demo__table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Used by</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>--x-fx-border-glow</code></td><td>All except --hdr</td><td>--x-hdr-glow (warm gold)</td></tr>
            <tr><td><code>--x-fx-border-hot</code></td><td>All except --hdr</td><td>--x-hdr-hot (near-white)</td></tr>
            <tr><td><code>--x-fx-border-trail-glow</code></td><td>--rotate, --dual</td><td>--x-hdr-glow</td></tr>
            <tr><td><code>--x-fx-border-trail-hot</code></td><td>--rotate, --dual</td><td>--x-hdr-hot</td></tr>
            <tr><td><code>--x-fx-hud-corner-length</code></td><td>--hud</td><td>18px</td></tr>
            <tr><td><code>--x-fx-hud-weight</code></td><td>--hud</td><td>--border-weight-default</td></tr>
          </tbody>
        </table>
        <p class="demo__token-note">
          Override any of these in <code>html[data-theme="your-store"]</code> to brand the effects. No component edits needed.
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; }

body {
  background: var(--x-bg-page, #0c0c0f);
  color: var(--x-text-body-default, #fff);
  font-family: Inter, system-ui, sans-serif;
  min-height: 100vh;
}

/* Demo trace should loop for the demo page */
.demo .fx-glow-border--trace::before {
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
</style>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────────────── */
.demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 64px;
}

.demo__header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--x-bg-page, #0c0c0f);
  border-bottom: 1px solid var(--x-border-soft, oklch(1 0 0 / 0.08));
  padding: 20px 0;
  margin-bottom: 40px;
}
.demo__header-inner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
}

.demo__title {
  font-size: 22px;
  font-weight: 700;
  color: var(--x-text-header-default, #fff);
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.demo__subtitle {
  font-size: 13px;
  color: var(--x-text-body-default, oklch(1 0 0 / 0.6));
  margin-top: 4px;
  line-height: 1.5;
}
.demo__subtitle code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 11px;
  color: var(--x-text-hyperlink-default, #ffd700);
  background: oklch(1 0 0 / 0.06);
  padding: 1px 4px;
  border-radius: 4px;
}

/* ── Theme switcher ─────────────────────────────────────────────────────── */
.demo__theme-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.demo__theme-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--x-text-body-default, oklch(1 0 0 / 0.45));
  white-space: nowrap;
}
.demo__theme-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.demo__pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--x-border-soft, oklch(1 0 0 / 0.10));
  background: transparent;
  color: var(--x-text-body-default, oklch(1 0 0 / 0.55));
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms, color 150ms, border-color 150ms;
  white-space: nowrap;
}
.demo__pill:hover {
  background: oklch(1 0 0 / 0.06);
  color: var(--x-text-header-default, #fff);
}
.demo__pill--active {
  background: var(--x-fx-border-glow, oklch(0.82 0.20 75));
  border-color: transparent;
  color: oklch(0.1 0 0);
}
.demo__pill-hint {
  font-size: 9px;
  font-weight: 400;
  opacity: 0.7;
  letter-spacing: 0;
}

/* ── Effect grid ────────────────────────────────────────────────────────── */
.demo__main {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.demo__card {
  background: oklch(1 0 0 / 0.03);
  border: 1px solid var(--x-border-soft, oklch(1 0 0 / 0.08));
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo__card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.demo__effect-name {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--x-text-hyperlink-default, #ffd700);
}
.demo__badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 2px 7px;
  border-radius: 999px;
}
.demo__badge--new {
  background: oklch(0.82 0.20 75 / 0.15);
  color: oklch(0.82 0.20 75);
  border: 1px solid oklch(0.82 0.20 75 / 0.3);
}
.demo__badge--existing {
  background: oklch(1 0 0 / 0.06);
  color: oklch(1 0 0 / 0.45);
  border: 1px solid oklch(1 0 0 / 0.10);
}
.demo__effect-desc {
  font-size: 12px;
  line-height: 1.55;
  color: var(--x-text-body-default, oklch(1 0 0 / 0.55));
}

/* ── Swatches ───────────────────────────────────────────────────────────── */
.demo__swatch-wrap {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

/* Wide landscape card swatch */
.demo__swatch--card {
  flex: 1;
  min-height: 90px;
  border-radius: 12px;
  background: var(--x-bg-sku-card-default, oklch(0.16 0.01 270));
  display: flex;
  align-items: flex-end;
}
.demo__swatch-inner {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  pointer-events: none;
}
.demo__swatch-eyebrow {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--x-text-hyperlink-default, oklch(0.82 0.20 75));
  opacity: 0.8;
}
.demo__swatch-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--x-text-header-default, #fff);
  letter-spacing: -0.01em;
}

/* Square badge / icon swatch */
.demo__swatch--square {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 12px;
  background: var(--x-bg-sku-card-default, oklch(0.16 0.01 270));
}

/* ── Replay button (trace only) ─────────────────────────────────────────── */
.demo__replay {
  align-self: flex-start;
  font-size: 11px;
  font-weight: 600;
  color: var(--x-text-hyperlink-default, oklch(0.82 0.20 75));
  background: transparent;
  border: 1px solid var(--x-fx-border-glow, oklch(0.82 0.20 75 / 0.3));
  border-radius: 999px;
  padding: 4px 12px;
  cursor: pointer;
  transition: background 150ms;
}
.demo__replay:hover {
  background: oklch(0.82 0.20 75 / 0.08);
}

/* ── Footer / token table ───────────────────────────────────────────────── */
.demo__footer {
  margin-top: 56px;
  padding-top: 32px;
  border-top: 1px solid var(--x-border-soft, oklch(1 0 0 / 0.08));
}
.demo__token-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--x-text-header-default, #fff);
  margin-bottom: 16px;
}
.demo__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.demo__table th {
  text-align: left;
  padding: 8px 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: oklch(1 0 0 / 0.35);
  border-bottom: 1px solid oklch(1 0 0 / 0.08);
}
.demo__table td {
  padding: 9px 12px;
  color: oklch(1 0 0 / 0.65);
  border-bottom: 1px solid oklch(1 0 0 / 0.05);
  vertical-align: top;
}
.demo__table td:first-child code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--x-text-hyperlink-default, oklch(0.82 0.20 75));
  font-size: 11px;
}
.demo__token-note {
  margin-top: 14px;
  font-size: 12px;
  line-height: 1.6;
  color: oklch(1 0 0 / 0.4);
}
.demo__token-note code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 11px;
  color: oklch(1 0 0 / 0.65);
  background: oklch(1 0 0 / 0.05);
  padding: 1px 5px;
  border-radius: 4px;
}
</style>
