import { ref, readonly } from 'vue'

/**
 * useHandoff — open/close + route state for the /handoff surface (singleton).
 * Mirrors src/library/useLibrary.js, but on a real path instead of a hash —
 * this is what makes /handoff a genuine child URL a link can point at,
 * rather than a fragment. The app has no vue-router (see App.vue), so this
 * is a small hand-rolled router in the same spirit as useLibrary's `#library`
 * and the inspector's `#inspect=` fragment.
 *
 *   active   — /handoff surface on/off (pathname starts with /handoff)
 *   slug     — active flow's slug, or null (index view)
 *   tab      — active tab within a flow: tokens | components | states | choreography | spec
 *
 * Vercel already SPA-rewrites every non-/assets path to index.html (see
 * vercel.json), and Vite's dev server does the same for unknown paths, so
 * /handoff, /handoff/<slug>, and /handoff/<slug>/<tab> are all real URLs a
 * reload or a shared link lands on correctly.
 *
 * Like the library this is prototype-only dev chrome; App.vue mounts
 * HandoffApp behind `v-if="!isStoreLocked"`, so it never ships in
 * store-locked ("isolated") builds.
 */
const TABS = ['tokens', 'components', 'states', 'choreography', 'spec']
const DEFAULT_TAB = 'tokens'
const PREFIX = '/handoff'

const active = ref(false)
const slug = ref(null)
const tab = ref(DEFAULT_TAB)

const hasWindow = typeof window !== 'undefined'

function parse (pathname) {
  if (pathname !== PREFIX && !pathname.startsWith(PREFIX + '/')) return null
  const rest = pathname.slice(PREFIX.length).replace(/^\/+|\/+$/g, '')
  if (!rest) return { slug: null, tab: DEFAULT_TAB }
  const [s, t] = rest.split('/')
  return { slug: s || null, tab: TABS.includes(t) ? t : DEFAULT_TAB }
}

function applyFromLocation () {
  if (!hasWindow) return
  const parsed = parse(window.location.pathname)
  active.value = !!parsed
  slug.value = parsed?.slug ?? null
  tab.value = parsed?.tab ?? DEFAULT_TAB
}

function pathFor (s, t) {
  if (!s) return PREFIX
  return `${PREFIX}/${s}${t && t !== DEFAULT_TAB ? `/${t}` : ''}`
}

function writeLocation (s, t) {
  if (!hasWindow) return
  const path = pathFor(s, t)
  if (window.location.pathname === path) return
  history.pushState(null, '', path + window.location.search)
}

function open (s = null, t = DEFAULT_TAB) {
  active.value = true
  slug.value = s
  tab.value = TABS.includes(t) ? t : DEFAULT_TAB
  writeLocation(s, tab.value)
}
function close () {
  active.value = false
  slug.value = null
  if (hasWindow && window.location.pathname.startsWith(PREFIX)) {
    history.pushState(null, '', '/' + window.location.search)
  }
}
function selectFlow (s) { open(s, DEFAULT_TAB) }
function selectTab (t) { if (TABS.includes(t)) { tab.value = t; writeLocation(slug.value, t) } }

if (hasWindow) {
  applyFromLocation()
  window.addEventListener('popstate', applyFromLocation)
}

export function useHandoff () {
  return {
    active: readonly(active),
    slug: readonly(slug),
    tab: readonly(tab),
    tabs: TABS,
    open, close, selectFlow, selectTab,
  }
}
