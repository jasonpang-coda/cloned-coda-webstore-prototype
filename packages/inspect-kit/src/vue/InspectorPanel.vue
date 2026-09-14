<script setup>
/**
 * InspectorPanel — the inspector's side panel (dev chrome).
 *
 * Given a picked DOM element, renders the owning component (if resolvable),
 * a clickable DOM breadcrumb (walk up the tree), and grouped CSS fields —
 * each value reverse-mapped to its design token via useTokenMap. A dedicated
 * Motion section lists keyframe animations + transitions with their motion
 * tokens and a Replay button. Every token/value is click-to-copy; "Copy all"
 * dumps a markdown spec for a ticket.
 *
 * Drives the useInspector singleton directly (no props in other than
 * `device` for context), so breadcrumb clicks just re-select through the
 * same state.
 *
 * Includes:
 *   • State picker (Default / Hover / Pressed / Disabled) — applies CSS
 *     state to the element and re-collects styles via styleVersion.
 *   • "Not a token" warning badge — fields with no token match get a ⚠
 *     indicator when the value is tokenisable (per the `kind` hint in
 *     collectStyles).
 *   • Responsive section — container-query ancestor + current device frame.
 *   • Box-model toggle — button in the Layout section header.
 *   • Standalone states + tokens page — opens the selected element across
 *     every interaction state next to its resolved token contract in a new
 *     tab (see core/standalone.js).
 */
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useInspector } from './useInspector.js'
import { useTokenMap } from './useTokenMap.js'
import { getConfig } from './config.js'
import {
  collectStyles, collectAnimations, replayAnimation,
  formatSpecMarkdown, formatSpecJson, elementSelector,
  describeNode, buildHoverOverride, applyPressedState, applyDisabledState,
  componentUsageSnippet, assetName,
} from '../core/inspect.js'
import { openStandalonePage } from '../core/standalone.js'

const props = defineProps({ device: { type: String, default: 'none' } })

const config = getConfig()

const {
  selected, select,
  showBoxModel, toggleBoxModel,
  activeState, setState,
  styleVersion, bumpStyleVersion,
} = useInspector()

// Closing the panel only deselects — it must NOT exit inspect mode. Inspect
// mode is a session-level toggle the tester turns on once; dismissing one
// element's spec panel to go pick a different element (or just look at the
// page) shouldn't drop them out of inspecting. Only Esc (InspectorOverlay's
// own handler, calling the real useInspector().close()) exits inspect mode.
function closePanel () { select(null) }

const tokens = useTokenMap()

// ── "View in library" deep-link (host-provided hook) ────────────────────────
const libraryEntry = ref(null)
watch(selected, async (el) => {
  libraryEntry.value = null
  if (!config.libraryLink || !el) return
  const comp = spec.value?.component
  if (!comp) return
  const entry = await config.libraryLink(comp)
  // Guard against a stale resolve landing after the selection moved on.
  if (selected.value === el) libraryEntry.value = entry
})
function viewInLibrary () {
  libraryEntry.value?.open?.()
}

// styleVersion is a reactive dep — bump it after state application forces re-collection.
const spec = computed(() => {
  void styleVersion.value
  return selected.value ? collectStyles(selected.value, tokens, config.screenRoot) : null
})
const anims = computed(() => {
  void styleVersion.value
  return selected.value ? collectAnimations(selected.value, tokens) : { animations: [], transitions: [] }
})
const hasMotion = computed(() => anims.value.animations.length || anims.value.transitions.length)

// DOM ancestor chain (screen root → picked node) for the breadcrumb.
const crumbs = computed(() => {
  const el = selected.value
  if (!el) return []
  const root = el.closest(config.screenRoot) || document.body
  const list = []
  let n = el
  while (n) {
    list.unshift({ el: n, label: describeNode(n) })
    if (n === root) break
    n = n.parentElement
  }
  return list
})

// ── state picker ─────────────────────────────────────────────────────────────
const STATES = ['default', 'hover', 'pressed', 'disabled']

let cleanupState = null
function clearState () {
  if (cleanupState) { cleanupState(); cleanupState = null }
}

watch(selected, () => {
  clearState()
  setState('default')
})

watch(activeState, (s) => {
  clearState()
  if (!selected.value || s === 'default') {
    bumpStyleVersion()
    return
  }
  if (s === 'hover')    cleanupState = buildHoverOverride(selected.value)
  if (s === 'pressed')  cleanupState = applyPressedState(selected.value)
  if (s === 'disabled') cleanupState = applyDisabledState(selected.value)
  bumpStyleVersion()
})

onBeforeUnmount(clearState)

// ── copy ──────────────────────────────────────────────────────────────────────
const copied = ref('')
let copiedTimer = null
async function copy (text, key) {
  try { await navigator.clipboard.writeText(text) } catch { /* clipboard blocked */ }
  copied.value = key
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => { copied.value = '' }, 1100)
}
function copyAll () {
  if (!spec.value) return
  copy(formatSpecMarkdown(spec.value, anims.value, { state: activeState.value, device: props.device }), 'all')
}
function copyJson () {
  if (!spec.value) return
  copy(JSON.stringify(formatSpecJson(spec.value, anims.value, { state: activeState.value, device: props.device }), null, 2), 'json')
}
function copyLink () {
  // The overlay keeps window.location.hash in sync with the selection, so the
  // current href already contains the #inspect= fragment when this runs.
  copy(window.location.href, 'link')
}

function replay (el) { replayAnimation(el || selected.value) }

// Reset the copied flash when the selection changes.
watch(selected, () => { copied.value = '' })

// Warn count — for the badge on the Layout section header toggle.
const warningCount = computed(() => {
  if (!spec.value) return 0
  return spec.value.groups.reduce((n, g) => n + g.fields.filter(f => f.warning).length, 0)
})

// ── component export ─────────────────────────────────────────────────────────
const instance = computed(() => spec.value?.component?.instance || null)
const usageSnippet = computed(() => instance.value ? componentUsageSnippet(instance.value) : null)

function copyUsage () {
  if (usageSnippet.value) copy(usageSnippet.value, 'usage')
}

async function copySource () {
  if (!config.resolveSource) return
  const file = spec.value?.component?.file
  if (!file) return
  const src = await config.resolveSource(file)
  if (src != null) copy(src, 'source')
  else copy('// source unavailable — fetch the file directly', 'source')
}

function baseName (file) {
  return String(file).split('/').pop() || 'component'
}

async function downloadSource () {
  if (!config.resolveSource) return
  const file = spec.value?.component?.file
  if (!file) return
  const src = await config.resolveSource(file)
  if (src == null) return
  triggerDownload(URL.createObjectURL(new Blob([src], { type: 'text/plain' })), baseName(file), true)
}

// Download an asset by URL. Same-origin dev assets download directly via the
// `download` attribute; the revoke flag is for object URLs we created ourselves.
function downloadAsset (url) {
  triggerDownload(url, assetName(url), false)
}
function triggerDownload (href, filename, revoke) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  if (revoke) setTimeout(() => URL.revokeObjectURL(href), 1000)
}

// ── standalone states + tokens page ─────────────────────────────────────────
const standaloneBlocked = ref(false)
let standaloneBlockedTimer = null

function openStandalone () {
  const el = selected.value
  if (!el) return
  const themeValue = config.themeAttr ? document.documentElement.getAttribute(config.themeAttr) : null
  const result = openStandalonePage(el, {
    tokenMap: tokens,
    screenRoot: config.screenRoot,
    themeAttr: themeValue ? { name: config.themeAttr, value: themeValue } : null,
    title: spec.value?.component?.name || describeNode(el),
  })
  if (!result.ok) {
    // Don't fail silently — a blocked popup with no feedback reads as "the
    // button doesn't work". Flash a message on the button itself instead.
    standaloneBlocked.value = true
    clearTimeout(standaloneBlockedTimer)
    standaloneBlockedTimer = setTimeout(() => { standaloneBlocked.value = false }, 4000)
  }
}
onBeforeUnmount(() => clearTimeout(standaloneBlockedTimer))
</script>

<template>
  <Transition name="inspect-panel">
    <aside v-if="selected" class="ip" aria-label="Inspector">

      <!-- ── header ────────────────────────────────────────────────────────── -->
      <header class="ip__head">
        <div class="ip__title">
          <span class="ip__comp">{{ spec.component.name || 'Element' }}</span>
        </div>
        <button type="button" class="ip__icon-btn" aria-label="Close panel" title="Deselect (Esc exits inspect mode entirely)" @click="closePanel()">✕</button>
      </header>

      <!-- Source file -->
      <div v-if="spec.component.file" class="ip__file" :title="spec.component.file">
        <button type="button" class="ip__file-btn" @click="copy(spec.component.file, 'file')">
          {{ spec.component.file.replace(/^.*\/src\//, 'src/') }}
          {{ copied === 'file' ? '✓' : '⧉' }}
        </button>
      </div>

      <!-- Component tree -->
      <div v-if="spec.breadcrumb.length" class="ip__tree">
        <span v-for="(b, i) in spec.breadcrumb" :key="i" class="ip__tree-node">
          {{ b.name }}<span v-if="i < spec.breadcrumb.length - 1" class="ip__tree-sep">›</span>
        </span>
      </div>

      <!-- DOM breadcrumb — click to re-select an ancestor -->
      <div class="ip__crumbs">
        <button
          v-for="(c, i) in crumbs"
          :key="i"
          type="button"
          class="ip__crumb"
          :class="{ 'ip__crumb--active': c.el === selected }"
          @click="select(c.el)"
        >{{ c.label }}</button>
      </div>

      <!-- View in library — host-provided jump (optional) -->
      <div v-if="libraryEntry" class="ip__library">
        <button type="button" class="ip__library-btn" @click="viewInLibrary()">
          View in library
        </button>
      </div>

      <!-- ── state picker ─────────────────────────────────────────────────── -->
      <div class="ip__states" role="group" aria-label="Simulated state">
        <button
          v-for="s in STATES"
          :key="s"
          type="button"
          class="ip__state-btn"
          :class="{ 'ip__state-btn--active': activeState === s }"
          @click="setState(s)"
        >{{ s }}</button>
      </div>

      <div class="ip__scroll">
        <!-- Style groups -->
        <section v-for="group in spec.groups" :key="group.title" class="ip__group">
          <h3 class="ip__group-title">
            {{ group.title }}
            <!-- Box-model toggle in the Layout section -->
            <button
              v-if="group.title === 'Layout'"
              type="button"
              class="ip__toggle-btn"
              :class="{ 'ip__toggle-btn--active': showBoxModel }"
              title="Toggle box-model overlay"
              @click="toggleBoxModel()"
            >box model</button>
          </h3>
          <div v-for="f in group.fields" :key="f.label" class="ip__row">
            <span class="ip__label">{{ f.label }}</span>
            <div class="ip__vals">
              <button
                type="button"
                class="ip__val"
                :title="`Copy ${f.value}`"
                @click="copy(f.value, group.title + f.label + 'v')"
              >{{ copied === group.title + f.label + 'v' ? 'copied' : f.value }}</button>
              <button
                v-if="f.token"
                type="button"
                class="ip__token"
                :class="{ 'ip__token--inferred': f.source === 'inferred' }"
                :title="f.source === 'inferred'
                  ? `Best guess — matched by value, not read from source.${f.alts && f.alts.length > 1 ? ' Other candidates: ' + f.alts.filter(a => a !== f.token).join(', ') : ''} Copy var(${f.token})`
                  : `Read from the authored CSS. Copy var(${f.token})`"
                @click="copy(`var(${f.token})`, group.title + f.label + 't')"
              >{{ copied === group.title + f.label + 't' ? 'copied' : f.token }}<sup v-if="f.source === 'inferred'" class="ip__token-tag">?</sup></button>
              <!-- Raw literal: a CSS rule matched but its value has no var() at all — genuinely
                   un-tokenised. Gated on f.warning too, not just f.raw — a field marked
                   non-warnable (e.g. Font/Weight, where flagging a bare value is just noise)
                   should stay quiet even when the winning rule happens to be a raw literal. -->
              <span v-else-if="f.raw && f.warning" class="ip__warn" title="This value is a raw literal in the authored CSS — not tokenised">⚠ raw literal</span>
              <!-- Warning: no rule declares this property, and no value-based guess matched either -->
              <span v-else-if="f.warning" class="ip__warn" title="No design token found for this value — consider tokenising it">⚠ no token</span>
            </div>
          </div>
        </section>

        <!-- Motion -->
        <section v-if="hasMotion" class="ip__group">
          <h3 class="ip__group-title">
            Motion
            <button
              v-if="anims.animations.length"
              type="button"
              class="ip__replay"
              title="Replay animations"
              @click="replay()"
            >↻ Replay</button>
          </h3>

          <div v-for="(a, i) in anims.animations" :key="'a' + i" class="ip__motion">
            <div class="ip__motion-head">
              <span class="ip__motion-kind">animation</span>
              <span class="ip__motion-name">{{ a.name }}</span>
            </div>
            <div class="ip__motion-meta">
              <span>{{ a.duration }}</span><span>{{ a.easing }}</span>
              <span v-if="a.iteration && a.iteration !== '1'">×{{ a.iteration }}</span>
            </div>
            <div class="ip__motion-tokens">
              <button
                v-for="t in [a.motionToken, !a.motionToken && a.durationToken, !a.motionToken && a.easingToken].filter(Boolean)"
                :key="t"
                type="button"
                class="ip__token"
                @click="copy(`var(${t})`, 'a' + i + t)"
              >{{ copied === 'a' + i + t ? 'copied' : t }}</button>
            </div>
          </div>

          <div v-for="(t, i) in anims.transitions" :key="'t' + i" class="ip__motion">
            <div class="ip__motion-head">
              <span class="ip__motion-kind ip__motion-kind--t">transition</span>
              <span class="ip__motion-name">{{ t.property }}</span>
            </div>
            <div class="ip__motion-meta">
              <span>{{ t.duration }}</span><span>{{ t.easing }}</span>
            </div>
            <div class="ip__motion-tokens">
              <button
                v-for="tok in [t.motionToken, !t.motionToken && t.durationToken, !t.motionToken && t.easingToken].filter(Boolean)"
                :key="tok"
                type="button"
                class="ip__token"
                @click="copy(`var(${tok})`, 't' + i + tok)"
              >{{ copied === 't' + i + tok ? 'copied' : tok }}</button>
            </div>
          </div>
        </section>

        <!-- Responsive — container query context + device frame -->
        <section v-if="spec.container || device !== 'none'" class="ip__group">
          <h3 class="ip__group-title">Responsive</h3>
          <div v-if="device !== 'none'" class="ip__row">
            <span class="ip__label">Device</span>
            <span class="ip__val ip__val--static">{{ device }}</span>
          </div>
          <template v-if="spec.container">
            <div class="ip__row">
              <span class="ip__label">Container</span>
              <div class="ip__vals">
                <span class="ip__val ip__val--static">.{{ spec.container.cls }}</span>
                <span v-if="spec.container.name" class="ip__token ip__token--static">{{ spec.container.name }}</span>
              </div>
            </div>
            <div class="ip__row">
              <span class="ip__label">Type</span>
              <span class="ip__val ip__val--static">{{ spec.container.type }}</span>
            </div>
            <div class="ip__row">
              <span class="ip__label">Inline size</span>
              <button
                type="button"
                class="ip__val"
                :title="`Copy ${spec.container.inlineSize}px`"
                @click="copy(`${spec.container.inlineSize}px`, 'container-inline')"
              >{{ copied === 'container-inline' ? 'copied' : `${spec.container.inlineSize}px` }}</button>
            </div>
          </template>
        </section>

        <!-- Props — live prop values + declared schema -->
        <section v-if="spec.props && spec.props.length" class="ip__group">
          <h3 class="ip__group-title">Props</h3>
          <div
            v-for="p in spec.props"
            :key="p.name"
            class="ip__row"
            :class="{ 'ip__row--dim': p.isDefault }"
          >
            <span class="ip__label">
              {{ p.name }}<span v-if="p.required" class="ip__req" title="required">*</span>
            </span>
            <div class="ip__vals">
              <button
                type="button"
                class="ip__val"
                :title="`Copy ${p.value}`"
                @click="copy(String(p.value), 'prop' + p.name)"
              >{{ copied === 'prop' + p.name ? 'copied' : (typeof p.value === 'string' ? p.value : JSON.stringify(p.value)) }}</button>
              <span v-if="p.type" class="ip__prop-type">{{ p.type }}</span>
            </div>
          </div>
        </section>

        <!-- Accessibility — contrast + ARIA -->
        <section v-if="spec.a11y && (spec.a11y.contrast || spec.a11y.role || spec.a11y.ariaLabel)" class="ip__group">
          <h3 class="ip__group-title">Accessibility</h3>
          <div v-if="spec.a11y.contrast" class="ip__row">
            <span class="ip__label">Contrast</span>
            <div class="ip__vals">
              <span class="ip__val ip__val--static">{{ spec.a11y.contrast.ratio }}:1</span>
              <span
                class="ip__badge"
                :class="spec.a11y.contrast.aa ? 'ip__badge--pass' : (spec.a11y.contrast.aaLarge ? 'ip__badge--warn' : 'ip__badge--fail')"
              >{{ spec.a11y.contrast.aaa ? 'AAA' : spec.a11y.contrast.aa ? 'AA' : spec.a11y.contrast.aaLarge ? 'AA large' : 'Fail' }}</span>
            </div>
          </div>
          <div v-if="spec.a11y.role" class="ip__row">
            <span class="ip__label">Role</span>
            <span class="ip__val ip__val--static">{{ spec.a11y.role }}</span>
          </div>
          <div v-if="spec.a11y.ariaLabel" class="ip__row">
            <span class="ip__label">aria-label</span>
            <span class="ip__val ip__val--static">{{ spec.a11y.ariaLabel }}</span>
          </div>
        </section>

        <!-- Assets — images in the subtree, with download -->
        <section v-if="spec.assets && spec.assets.length" class="ip__group">
          <h3 class="ip__group-title">Assets</h3>
          <div v-for="(a, i) in spec.assets" :key="i" class="ip__asset">
            <img v-if="a.kind !== 'data'" class="ip__asset-thumb" :src="a.url" alt="" loading="lazy" />
            <span class="ip__asset-name" :title="a.url">{{ assetName(a.url) }}</span>
            <button type="button" class="ip__asset-dl" title="Download asset" @click="downloadAsset(a.url)">⇩</button>
          </div>
        </section>

        <!-- Component export — usage snippet from live props -->
        <section v-if="usageSnippet" class="ip__group">
          <h3 class="ip__group-title">
            Usage
            <button type="button" class="ip__toggle-btn" title="Copy usage snippet" @click="copyUsage()">
              {{ copied === 'usage' ? 'Copied' : 'Copy' }}
            </button>
          </h3>
          <pre class="ip__snippet">{{ usageSnippet }}</pre>
        </section>
      </div>

      <footer class="ip__foot">
        <!-- Token warning summary -->
        <div v-if="warningCount > 0" class="ip__warn-summary">
          <span>⚠ {{ warningCount }} value{{ warningCount !== 1 ? 's' : '' }} not tokenised</span>
        </div>
        <!-- Component source export — only when the host provides resolveSource -->
        <div v-if="config.resolveSource && spec.component.file" class="ip__foot-row">
          <button type="button" class="ip__sec-btn" title="Copy the component's source" @click="copySource()">
            {{ copied === 'source' ? 'Copied' : 'Copy source' }}
          </button>
          <button type="button" class="ip__sec-btn" title="Download the source file" @click="downloadSource()">
            Download
          </button>
        </div>
        <!-- Secondary actions row -->
        <div class="ip__foot-row">
          <button type="button" class="ip__sec-btn" title="Copy full spec as JSON" @click="copyJson()">
            {{ copied === 'json' ? 'Copied' : 'Copy as JSON' }}
          </button>
          <button type="button" class="ip__sec-btn" title="Copy shareable link to this selection" @click="copyLink()">
            {{ copied === 'link' ? 'Copied' : 'Copy link' }}
          </button>
        </div>
        <!-- Standalone states + tokens page -->
        <button
          type="button"
          class="ip__standalone-btn"
          :class="{ 'ip__standalone-btn--blocked': standaloneBlocked }"
          :title="standaloneBlocked ? 'Popup blocked — allow popups for this site and try again' : 'Open this element across every state, with its token contract, in a new tab'"
          @click="openStandalone()"
        >
          {{ standaloneBlocked ? '⚠ Popup blocked — allow popups & retry' : '⧉ Open standalone page' }}
        </button>
        <button type="button" class="ip__copy-all" @click="copyAll()">
          {{ copied === 'all' ? 'Copied spec' : 'Copy all as spec' }}
        </button>
      </footer>
    </aside>
  </Transition>
</template>

<style scoped>
.ip {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(92vw, 340px);
  display: flex;
  flex-direction: column;
  background: #16181c;
  backdrop-filter: blur(64px);
  -webkit-backdrop-filter: blur(64px);
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
  color: #e7e7ea;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 11.5px;
  line-height: 1.45;
}

.ip__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}
.ip__title { display: inline-flex; align-items: center; gap: 7px; color: #fff; }
.ip__comp { font-weight: 700; font-size: 13px; letter-spacing: 0.2px; }

.ip__icon-btn {
  display: inline-flex;
  border: 0;
  background: transparent;
  color: #9a9aa2;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.ip__icon-btn:hover { color: #fff; }

.ip__file { padding: 6px 12px; flex-shrink: 0; }
.ip__file-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  color: #6aa3f8;
  cursor: pointer;
  font: inherit;
  text-align: left;
  word-break: break-all;
}

.ip__tree {
  padding: 0 12px 8px;
  color: #9a9aa2;
  font-size: 10.5px;
  flex-shrink: 0;
}
.ip__tree-sep { margin: 0 5px; opacity: 0.5; }

.ip__crumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 0 12px 8px;
  flex-shrink: 0;
}
.ip__crumb {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: #9a9aa2;
  border-radius: 4px;
  padding: 2px 6px;
  font: inherit;
  font-size: 10px;
  cursor: pointer;
}
.ip__crumb:hover { color: #fff; }
.ip__crumb--active {
  background: rgba(28, 111, 235, 0.18);
  color: #6aa3f8;
  border-color: rgba(28, 111, 235, 0.45);
}

/* View-in-library jump */
.ip__library { padding: 0 12px 10px; flex-shrink: 0; }
.ip__library-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  justify-content: center;
  border: 1px solid rgba(28, 111, 235, 0.35);
  background: rgba(28, 111, 235, 0.1);
  color: #6aa3f8;
  border-radius: 4px;
  padding: 6px 8px;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background 120ms, border-color 120ms;
}
.ip__library-btn:hover { background: rgba(28, 111, 235, 0.2); border-color: rgba(28, 111, 235, 0.55); }

/* State picker */
.ip__states {
  display: flex;
  gap: 2px;
  padding: 0 12px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}
.ip__state-btn {
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: #9a9aa2;
  border-radius: 4px;
  padding: 4px 2px;
  font: inherit;
  font-size: 10px;
  text-transform: capitalize;
  cursor: pointer;
  transition: background 120ms, color 120ms, border-color 120ms;
}
.ip__state-btn:hover { color: #fff; }
.ip__state-btn--active {
  background: rgba(28, 111, 235, 0.18);
  color: #6aa3f8;
  border-color: rgba(28, 111, 235, 0.45);
  font-weight: 700;
}

.ip__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 0 8px;
  scrollbar-width: thin;
}

.ip__group { padding: 8px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.ip__group-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 6px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #8a8a92;
}

.ip__row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 2px 0;
}
.ip__row--dim { opacity: 0.5; }
.ip__label { flex-shrink: 0; width: 84px; color: #9a9aa2; }
.ip__vals { display: flex; flex-wrap: wrap; gap: 4px; min-width: 0; }

.ip__req { color: #6aa3f8; margin-left: 1px; }
.ip__prop-type {
  align-self: center;
  font-size: 8.5px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 0 4px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  color: #9a9aa2;
}

.ip__badge {
  align-self: center;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  padding: 1px 5px;
  border-radius: 4px;
}
.ip__badge--pass { background: rgba(50, 210, 130, 0.2);  color: #7fe3a8; }
.ip__badge--warn { background: rgba(224, 177, 90, 0.2);  color: #f0cd86; }
.ip__badge--fail { background: rgba(235, 80, 80, 0.2);   color: #f29a9a; }

.ip__asset {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 3px 0;
}
.ip__asset-thumb {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
}
.ip__asset-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #e7e7ea;
}
.ip__asset-dl {
  flex-shrink: 0;
  display: inline-flex;
  border: 0;
  cursor: pointer;
  padding: 3px 5px;
  border-radius: 4px;
  background: rgba(28, 111, 235, 0.12);
  color: #6aa3f8;
}
.ip__asset-dl:hover { background: rgba(28, 111, 235, 0.24); }

.ip__snippet {
  margin: 0;
  padding: 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(28, 111, 235, 0.25);
  color: #9ecbff;
  font: inherit;
  font-size: 10.5px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
}

.ip__val, .ip__token {
  border: 0;
  cursor: pointer;
  font: inherit;
  padding: 1px 5px;
  border-radius: 4px;
  text-align: left;
  word-break: break-all;
}
.ip__val { background: rgba(255, 255, 255, 0.06); color: #f2f2f4; }
.ip__token {
  background: rgba(28, 111, 235, 0.15);
  color: #6aa3f8;
}
.ip__val--static, .ip__token--static {
  cursor: default;
}
.ip__val:not(.ip__val--static):hover { background: rgba(255, 255, 255, 0.12); }
.ip__token:not(.ip__token--static):hover { background: rgba(28, 111, 235, 0.28); }

/* Inferred (value-matched guess, not read from source) — dashed outline +
   a small "?" superscript so it visibly reads as less certain than an
   authored token, which gets the plain solid-fill treatment above. */
.ip__token--inferred {
  background: transparent;
  border: 1px dashed rgba(106, 163, 248, 0.55);
}
.ip__token--inferred:hover { background: rgba(28, 111, 235, 0.14); }
.ip__token-tag {
  margin-left: 2px;
  opacity: 0.75;
}

.ip__warn {
  font-size: 9.5px;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(224, 177, 90, 0.18);
  color: #f0cd86;
  letter-spacing: 0.2px;
}

.ip__toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: #9a9aa2;
  border-radius: 4px;
  padding: 1px 6px;
  font: inherit;
  font-size: 9px;
  letter-spacing: 0;
  text-transform: none;
  cursor: pointer;
}
.ip__toggle-btn:hover { color: #fff; }
.ip__toggle-btn--active {
  background: rgba(50, 210, 180, 0.22);
  color: #65e8d0;
  border-color: rgba(50, 210, 180, 0.4);
  font-weight: 700;
}

.ip__replay {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: 0;
  cursor: pointer;
  font: inherit;
  font-size: 10px;
  letter-spacing: 0;
  text-transform: none;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.ip__replay:hover { background: rgba(255, 255, 255, 0.16); }

.ip__motion { padding: 5px 0; }
.ip__motion-head { display: flex; align-items: center; gap: 6px; }
.ip__motion-kind {
  font-size: 8.5px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(111, 208, 140, 0.22);
  color: #9fe6b3;
}
.ip__motion-kind--t {
  background: rgba(224, 177, 90, 0.22);
  color: #f0cd86;
}
.ip__motion-name { color: #fff; font-weight: 700; }
.ip__motion-meta { display: flex; flex-wrap: wrap; gap: 8px; color: #9a9aa2; padding: 2px 0; }
.ip__motion-tokens { display: flex; flex-wrap: wrap; gap: 4px; }

.ip__foot {
  padding: 10px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ip__warn-summary {
  font-size: 10px;
  color: #f0cd86;
  text-align: center;
  opacity: 0.85;
}

.ip__foot-row {
  display: flex;
  gap: 6px;
}
.ip__sec-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid rgba(28, 111, 235, 0.35);
  background: rgba(28, 111, 235, 0.08);
  color: #6aa3f8;
  border-radius: 4px;
  padding: 5px 4px;
  font: inherit;
  font-size: 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 120ms, border-color 120ms;
}
.ip__sec-btn:hover {
  background: rgba(28, 111, 235, 0.18);
  border-color: rgba(28, 111, 235, 0.55);
}

.ip__standalone-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  border: 1px solid rgba(101, 232, 208, 0.35);
  background: rgba(50, 210, 180, 0.1);
  color: #65e8d0;
  border-radius: 6px;
  padding: 7px 8px;
  font: inherit;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  transition: background 120ms, border-color 120ms;
}
.ip__standalone-btn:hover { background: rgba(50, 210, 180, 0.2); border-color: rgba(101, 232, 208, 0.55); }
.ip__standalone-btn--blocked {
  border-color: rgba(224, 177, 90, 0.45);
  background: rgba(224, 177, 90, 0.12);
  color: #f0cd86;
}

.ip__copy-all {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  border: 0;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  padding: 9px;
  border-radius: 8px;
  background: #1c6feb;
  color: #fff;
}
.ip__copy-all:hover { filter: brightness(1.08); }

/* Slide-in from the right */
.inspect-panel-enter-active, .inspect-panel-leave-active {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
.inspect-panel-enter-from, .inspect-panel-leave-to { transform: translateX(100%); }
</style>
