import { ref, readonly } from 'vue'

/**
 * useTokenAudit — open/close + route state for the /tokens dashboard
 * (singleton). Direct port of src/handoff/useHandoff.js's path-router
 * pattern: a real child URL (`/tokens`, `/tokens/<tab>`), not a hash — the
 * dashboard's whole point is sharing findings, so "here are the 41 unused
 * prod tokens" needs to be a URL a reload or a pasted link still resolves.
 * Vercel already SPA-rewrites every non-/assets path to index.html (see
 * vercel.json) and Vite's dev server does the same, so this works exactly
 * like /handoff.
 *
 * Prototype-only dev chrome — App.vue mounts TokenAuditApp behind
 * `v-if="!isStoreLocked"`, so it never ships in store-locked builds.
 */
const TABS = ['overview', 'coverage', 'drift', 'custom', 'stores']
const DEFAULT_TAB = 'overview'
const PREFIX = '/tokens'

const active = ref(false)
const tab = ref(DEFAULT_TAB)

const hasWindow = typeof window !== 'undefined'

function parse (pathname) {
  if (pathname !== PREFIX && !pathname.startsWith(PREFIX + '/')) return null
  const rest = pathname.slice(PREFIX.length).replace(/^\/+|\/+$/g, '')
  if (!rest) return { tab: DEFAULT_TAB }
  const [t] = rest.split('/')
  return { tab: TABS.includes(t) ? t : DEFAULT_TAB }
}

function applyFromLocation () {
  if (!hasWindow) return
  const parsed = parse(window.location.pathname)
  active.value = !!parsed
  tab.value = parsed?.tab ?? DEFAULT_TAB
}

function pathFor (t) {
  return t && t !== DEFAULT_TAB ? `${PREFIX}/${t}` : PREFIX
}

function writeLocation (t) {
  if (!hasWindow) return
  const path = pathFor(t)
  if (window.location.pathname === path) return
  history.pushState(null, '', path + window.location.search)
}

function open (t = DEFAULT_TAB) {
  active.value = true
  tab.value = TABS.includes(t) ? t : DEFAULT_TAB
  writeLocation(tab.value)
}
function close () {
  active.value = false
  if (hasWindow && window.location.pathname.startsWith(PREFIX)) {
    history.pushState(null, '', '/' + window.location.search)
  }
}
function toggle () { active.value ? close() : open() }
function selectTab (t) { if (TABS.includes(t)) { tab.value = t; writeLocation(t) } }

if (hasWindow) {
  applyFromLocation()
  window.addEventListener('popstate', applyFromLocation)
}

export function useTokenAudit () {
  return {
    active: readonly(active),
    tab: readonly(tab),
    tabs: TABS,
    open, close, toggle, selectTab,
  }
}
