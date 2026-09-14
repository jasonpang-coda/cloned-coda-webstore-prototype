/**
 * useFeatureFlags — runtime-mutable, prototype-wide feature toggles.
 *
 * A separate layer from useStoreConfig: those capability flags are STATIC per
 * store (resolved off the active data-theme, never mutated at runtime). Feature
 * flags here are flipped live from the `/` command palette (and, for enum flags,
 * the dev toolbar) and persist across reloads. They are prototype-wide, NOT
 * per-store — one shared set regardless of the active theme (deliberately unlike
 * locale's `locale:<theme>` key).
 *
 * Two flag shapes:
 *   boolean flag — no `options`. `default: false`. Read with isEnabled(key);
 *     flipped with toggleFlag(key)/setFlag(key, bool).
 *   enum flag    — `options: [{ value, label }]`. `default` is one of those
 *     values. Read with flagValue(key); set with setFlag(key, value). Used when
 *     a flag needs more than on/off (e.g. picking between SKU-card designs).
 *
 * `stores` (optional, either shape) restricts where a flag's *control* renders
 * (toolbar/console) to the listed store keys — the flag itself is still one
 * shared prototype-wide value, this only scopes visibility of the UI to flip it.
 * A flag with no `stores` shows everywhere, same as today.
 *
 * `hideWhenLocked` (optional) additionally hides the control in store-locked
 * builds (__STORE_LOCKED__ — build:fcm, build:codm, …), for a pilot whose
 * locked build should ship one fixed answer with no dev toggle at all.
 *
 * `requiresCapability` (optional) is a `(config) => boolean` predicate
 * (config = the active store's useStoreConfig() value) — when it returns
 * false the control is hidden too. For a flag whose effect is itself gated by
 * a static per-store capability (e.g. fcmPaymentSheet behind config.checkout.
 * buyNow), this keeps the control from dangling uselessly on screen when
 * that capability is turned off — same "no dev toggle for something that does
 * nothing" motivation as hideWhenLocked, just keyed off config instead of the
 * build lock.
 *
 * Add a flag = one entry in FLAG_DEFS. Components read it with isEnabled(key)/
 * flagValue(key); the command palette (and toolbar, for enum flags) render a
 * control per registered flag automatically.
 *
 * Module-scope singleton pinned to globalThis (same rationale as useTheme /
 * useLocale — mixed import specifiers must not fork the state).
 */
import { reactive, readonly } from 'vue'

// Registry — every flag the prototype knows about. `default` applies when there
// is no persisted value.
export const FLAG_DEFS = [
  {
    key: 'localeSwitcher',
    label: 'Language & region switcher',
    description: 'Show the region/language switcher in the drawer footer and desktop navbar',
    default: false,
  },
  {
    key: 'fcmMilestoneScenario',
    label: 'FCM milestone reward scenario',
    description: 'Preview the Milestone Rewards rail at different player MP amounts',
    default: '0',
    stores: ['fcm'],
    options: [
      { value: '0',    label: '0 MP' },
      { value: '750',  label: '750 MP' },
      { value: '5000', label: '5,000 MP' },
    ],
  },
  {
    key: 'fcmSkuCardModel',
    label: 'FCM SKU card design',
    description: 'Swap the new (unreleased) SKU card designs for the ones currently in production',
    default: 'new',
    stores: ['fcm'],
    hideWhenLocked: true,
    options: [
      { value: 'new',  label: 'New designs (unreleased)' },
      { value: 'prod', label: 'Current production designs' },
    ],
  },
  {
    key: 'fcmPaymentSheet',
    label: 'FCM Buy Now flow',
    description: 'Sticky Buy Now bar + Order-Summary / Select-Payment sheet (FCM pilot)',
    default: true,
    stores: ['fcm'],
    requiresCapability: (config) => !!config.checkout?.buyNow,
  },
  {
    key: 'categoryJumpNav',
    label: 'FCM category jump nav',
    description: 'Show a dropdown at the end of each category, to jump to any of FCM\'s many categories',
    default: true,
    stores: ['fcm'],
    requiresCapability: (config) => !!config.nav?.categoryJump,
  },
  {
    key: 'fcmFewerPaymentChannels',
    label: 'FCM fewer payment channels',
    description: 'Trim the payment-channel list so the sheet body fits without scrolling (hides the footer T&C link)',
    default: false,
    stores: ['fcm'],
    requiresCapability: (config) => !!config.checkout?.buyNow,
  },
  {
    key: 'codmMilestoneRewards',
    label: 'COD:M milestone rewards',
    description: 'Enable the Armory Point milestone loyalty programme (L1 nav tab, navbar icon, rewards page)',
    default: false,
    stores: ['codm'],
  },
  {
    key: 'forceIosInstallSheet',
    label: 'Force iOS PWA install sheet',
    description: 'Show the iOS Add-to-Home-Screen install sheet regardless of real device/OS version — lets you preview the flow from any device via the command console',
    default: false,
    stores: ['codm'],
  },
  {
    key: 'forceWebviewInstallSheet',
    label: 'Force in-app WebView sheet',
    description: 'Preview the TaskGiftSheet as if loaded inside an in-app browser (Instagram/TikTok/etc.) regardless of real UA — neither install nor push works there, so the sheet shows "open in your browser" steps instead',
    default: false,
    stores: ['codm'],
  },
  {
    key: 'pwaInstalledState',
    label: 'PWA install state',
    description: 'Preview the post-install store — PWA install signposts become Web Push upsell (Gifts-banner toggle, Order Complete bar, drawer row, carousel slide)',
    default: 'not-installed',
    stores: ['codm'],
    options: [
      { value: 'not-installed', label: 'Not installed' },
      { value: 'installed',     label: 'Installed (web push)' },
    ],
  },
  {
    key: 'simulateWebPushGranted',
    label: 'Simulate Web Push granted',
    description: 'Bypass the real Notification permission prompt and preview the subscribed state — useful when the browser/sandbox always denies it (e.g. testing the TaskGiftSheet install→push→claim flow end to end)',
    default: 'off',
    stores: ['codm'],
    // Enum (not boolean) so it gets its own toolbar select like pwaInstalledState
    // above — a boolean flag only gets a command-palette control, and this one
    // needs to be reachable without the palette to test the gift-claim flow.
    options: [
      { value: 'off', label: 'Off' },
      { value: 'on',  label: 'On (simulate granted)' },
    ],
  },
  {
    key: 'allowGiftUnclaim',
    label: 'Allow gift unclaim',
    description: 'Show a small undo control on claimed gift cards (and the 88 CP task sheet) so a claim can be reset for retesting, without clearing localStorage by hand',
    default: false,
    stores: ['codm'],
  },
  {
    key: 'skuCardMaterial',
    label: 'SKU card material',
    description: 'Explore alternate surface materials for the product-grid SKU card, physically classified per the material-fx skill (Codashop pilot)',
    default: 'glass',
    stores: ['codashop'],
    requiresCapability: (config) => !!config.skuCard?.materialExploration,
    options: [
      { value: 'glass',       label: 'Glass (current)' },
      { value: 'plastic',     label: 'Plastic' },
      { value: 'metal',       label: 'Metal' },
      { value: 'carbonFibre', label: 'Carbon fibre' },
    ],
  },
  {
    key: 'homepageLayout',
    label: 'Codashop homepage layout',
    description: 'Standard editorial layout vs. the visual / cinematic layout vs. the acrylic blob layout (Codashop pilot)',
    default: 'blob',
    stores: ['codashop'],
    requiresCapability: (config) => !!config.home,
    options: [
      { value: 'standard', label: 'Standard — editorial' },
      { value: 'visual',   label: 'Visual — cinematic / game-art-forward' },
      { value: 'blob',     label: 'Blob — acrylic organic shapes' },
    ],
  },
]

const STATE = Symbol.for('webstore.useFeatureFlags.state')
const STORAGE_KEY = 'webstore:flags'

const KNOWN = new Set(FLAG_DEFS.map(f => f.key))
const DEFS_BY_KEY = Object.fromEntries(FLAG_DEFS.map(f => [f.key, f]))
const DEFAULTS = Object.fromEntries(FLAG_DEFS.map(f => [f.key, f.default]))

function isEnumFlag (key) {
  return !!DEFS_BY_KEY[key]?.options
}

function coerce (key, value) {
  const def = DEFS_BY_KEY[key]
  if (!def) return value
  if (def.options) {
    // Enum flag — value must be one of the registered options; fall back to
    // default on a stale/unknown persisted value (e.g. after an option is removed).
    return def.options.some(o => o.value === value) ? value : def.default
  }
  return !!value
}

function readPersisted () {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
    // Only overlay keys we still recognise — a removed flag can't leave an orphan.
    return Object.fromEntries(
      Object.entries(saved).filter(([k]) => KNOWN.has(k)).map(([k, v]) => [k, coerce(k, v)]),
    )
  } catch {
    return {}
  }
}

function initState () {
  const flags = reactive({ ...DEFAULTS, ...readPersisted() })

  function persist () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
    } catch { /* storage unavailable — flags live for the session only */ }
  }

  function isEnabled (key) {
    return !!flags[key]
  }

  function flagValue (key) {
    return flags[key]
  }

  function setFlag (key, value) {
    if (!KNOWN.has(key)) return
    flags[key] = coerce(key, value)
    persist()
  }

  function toggleFlag (key) {
    if (!KNOWN.has(key) || isEnumFlag(key)) return // enum flags are set, not toggled
    flags[key] = !flags[key]
    persist()
  }

  function resetFlags () {
    Object.assign(flags, DEFAULTS)
    persist()
  }

  return { flags, isEnabled, flagValue, setFlag, toggleFlag, resetFlags }
}

const state = globalThis[STATE] ?? (globalThis[STATE] = initState())

export function useFeatureFlags () {
  return {
    flags: readonly(state.flags),
    isEnabled: state.isEnabled,
    flagValue: state.flagValue,
    setFlag: state.setFlag,
    toggleFlag: state.toggleFlag,
    resetFlags: state.resetFlags,
    FLAG_DEFS,
  }
}
