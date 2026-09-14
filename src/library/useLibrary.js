import { ref, readonly } from 'vue'

/**
 * useLibrary — open/close + selection state for the component library viewer
 * (singleton). Mirrors useInspector: module-level refs make this a singleton
 * shared between the toolbar toggle, the `/` command-console entry, the
 * "View in library" jump from InspectorPanel, and the LibraryViewer page
 * itself — no prop-drilling.
 *
 *   active        — library page on/off
 *   selectedId    — id of the active story (null = show the empty/landing state)
 *   variantIndex  — index into the active story's `variants` array
 *   widthMode     — stage width: 'iphone' | 'samsung' | 'responsive'
 *
 * The library is its OWN page (App.vue unmounts the store when `active`), and
 * the FULL stage state — story id, variant, width — is reflected in the URL
 * hash so a link can be pasted straight at what someone is looking at
 * ("this card, this variant, at Android width") instead of "open the
 * library, click X, switch to Y". Theme isn't encoded here: it's already
 * addressable via the store-wide `?theme=` query param (useTheme.js), which
 * composes fine alongside this hash since query and hash are independent —
 * e.g. `?theme=fcm#library=sku-card&v=2&w=samsung`.
 *
 * Hash shape: `#library` (bare — open, nothing selected yet) or
 * `#library=<id>&v=<variantIndex>&w=<width>` (v/w omitted when at their
 * default, so the common case stays a short URL). Built with
 * URLSearchParams so it parses back unambiguously.
 *
 * Hash coexistence with the inspector: the inspector only ever writes `#inspect=`
 * fragments, and only via history.replaceState (which fires no `hashchange`), so
 * its hash activity never reaches our listener — we can own `#library` cleanly.
 *
 * Writing: the FIRST open of a session uses `location.hash =` (fires
 * hashchange, adds a history entry, so Back closes the library — same as
 * before this hash carried more than open/closed). Every subsequent change
 * while already open (switching story/variant/width) uses
 * `history.replaceState` instead, so browsing history doesn't grow one entry
 * per click.
 *
 * Like the inspector this is prototype-only dev chrome; App.vue mounts the
 * viewer behind `v-if="!isStoreLocked"`, so it never ships in store-locked
 * ("isolated") builds.
 */
const LIB_PREFIX = 'library'
const DEFAULT_WIDTH = 'iphone'

const active       = ref(false)
const selectedId   = ref(null)
const variantIndex = ref(0)
const widthMode    = ref(DEFAULT_WIDTH)

const hasWindow = typeof window !== 'undefined'

// `#library`, `#library=id`, `#library=id&v=1&w=samsung` — anything else
// (including `#inspect=…` and empty) is not ours.
function isLibHash (h) {
  return h === '#' + LIB_PREFIX || h.startsWith('#' + LIB_PREFIX + '=') || h.startsWith('#' + LIB_PREFIX + '&')
}

function parseHash (h) {
  if (!isLibHash(h)) return null
  const params = new URLSearchParams(h.slice(1))
  const id = params.get(LIB_PREFIX) || null
  const vRaw = Number(params.get('v'))
  const v = id && Number.isInteger(vRaw) && vRaw > 0 ? vRaw : 0
  const w = params.get('w') || DEFAULT_WIDTH
  return { id, v, w }
}

// Serialize the CURRENT module state (not an argument) — every writer below
// always writes what's true right now.
function buildRaw () {
  if (!selectedId.value) return LIB_PREFIX
  const params = new URLSearchParams()
  params.set(LIB_PREFIX, selectedId.value)
  if (variantIndex.value > 0) params.set('v', String(variantIndex.value))
  if (widthMode.value !== DEFAULT_WIDTH) params.set('w', widthMode.value)
  return params.toString()
}

function writeHash (firstOpen) {
  if (!hasWindow) return
  const full = '#' + buildRaw()
  if (window.location.hash === full) return
  if (firstOpen) {
    window.location.hash = full.slice(1)
  } else {
    history.replaceState(null, '', window.location.pathname + window.location.search + full)
  }
}

function clearHash () {
  if (!hasWindow) return
  if (isLibHash(window.location.hash)) {
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }
}

function open (id = null) {
  const wasActive = active.value
  active.value = true
  if (id) {
    selectedId.value = id
    variantIndex.value = 0
  }
  writeHash(!wasActive)
}
function close () {
  active.value = false
  clearHash()
}
function toggle () {
  active.value ? close() : open()
}
function select (id) {
  selectedId.value = id || null
  variantIndex.value = 0
  if (active.value) writeHash(false)
}
function setVariant (i) {
  variantIndex.value = i
  if (active.value) writeHash(false)
}
function setWidth (w) {
  widthMode.value = w
  if (active.value) writeHash(false)
}

// ── URL-hash sync (page deep-link + Back button) ──────────────────────────────
// `#library[...]`       → open (idempotent), adopt id/variant/width from the hash
// `#inspect=…`          → ignore; the inspector is layered over the page and owns
//                         this fragment, so it must NOT toggle the library
// anything else / empty → close (so Back out of `#library` returns to the store)
function onHashChange () {
  const h = window.location.hash
  const parsed = parseHash(h)
  if (parsed) {
    if (!active.value) active.value = true
    if (parsed.id) {
      selectedId.value = parsed.id
      variantIndex.value = parsed.v
    }
    widthMode.value = parsed.w
  }
  else if (h.startsWith('#inspect=')) { /* inspector layered — leave us alone */ }
  else if (active.value) { active.value = false }
}

if (hasWindow) {
  window.addEventListener('hashchange', onHashChange)
  // Restore on load: opening directly at a full `#library=id&v=…&w=…` link
  // lands on that exact story/variant/width.
  const initial = parseHash(window.location.hash)
  if (initial) {
    active.value = true
    if (initial.id) {
      selectedId.value = initial.id
      variantIndex.value = initial.v
    }
    widthMode.value = initial.w
  }
}

export function useLibrary () {
  return {
    active:       readonly(active),
    selectedId:   readonly(selectedId),
    variantIndex: readonly(variantIndex),
    widthMode:    readonly(widthMode),
    open, close, toggle, select, setVariant, setWidth,
  }
}
