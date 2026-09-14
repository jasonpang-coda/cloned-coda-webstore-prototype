/**
 * config.js — host configuration for the inspector, set once by
 * createInspector(opts) (see ./index.js) and read by the composables/
 * components. A module-level singleton, matching the existing
 * useInspector()/useTokenMap() singleton pattern rather than provide/inject,
 * so every consumer (including ones mounted outside the app's component
 * tree, like a toolbar button) sees the same config without prop-drilling.
 */

const DEFAULTS = {
  // Selector for the inspection root — used for the DOM-path breadcrumb,
  // the container-query fallback, and the #inspect= deep-link scope.
  screenRoot: '.device__screen',
  // Elements matching this selector are never highlighted/selected/blocked —
  // the host's own dev chrome (toolbar, the inspector's own panel, etc).
  chromeSelectors: '.toolbar, .inspector',
  // Attribute the host toggles per theme (read for the standalone page so
  // it re-resolves the same themed tokens). Set to null to disable.
  themeAttr: 'data-theme',
  // () => boolean — gates whether the inspector is allowed to be active at
  // all (e.g. hide in a store-locked/production build).
  enabled: () => true,
  // Token reverse-map tuning — see core/token-map.js for shape.
  tokenRules: {},
  // async (file) => string|null — fetch a component's source for "Copy
  // source"/"Download". Return null (the default) to hide those actions.
  resolveSource: null,
  // (component) => { id, open() } | null — resolve a "View in library" jump
  // for the given { name, instance }. Return null (the default) to hide it.
  libraryLink: null,
}

// A single stable object, mutated in place (never reassigned) — consumers that
// destructure `const config = getConfig()` at their own setup() time (most do,
// since they mount once and stay mounted) still see later setConfig() calls,
// because they hold a reference to THIS object, not a snapshot of its fields.
// This is what lets a host retarget `screenRoot` at runtime (e.g. the handoff
// surface pointing the inspector at a component stage instead of the live
// storefront) without needing every consumer to re-fetch getConfig().
const config = { ...DEFAULTS }

export function setConfig (opts = {}) {
  // Merge onto the CURRENT config, not DEFAULTS — a later partial call (e.g.
  // the handoff surface retargeting just `screenRoot`) must not clobber the
  // host's earlier full configuration (resolveSource, tokenRules, etc.).
  Object.assign(config, opts)
}

export function getConfig () {
  return config
}
