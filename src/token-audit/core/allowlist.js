/**
 * allowlist.js — known-and-accepted exceptions to the drift rules.
 *
 * Every entry cites the doc that blesses it. Nothing is allowlisted without
 * a citation — this file IS the list a reviewer checks before trusting a
 * suppression. Allowlisted rows are never hidden from the model, only
 * tagged `allowlisted: true` (see rules/index.js) — the UI can always show
 * them, and a broad pattern hiding a real regression is a worse failure
 * mode than a false positive.
 */

export const ALLOWLIST = [
  {
    id: 'border-weight-prefix',
    pattern: /^--border-weight-/,
    rules: ['*'],
    reason: 'Deliberately kept un-prefixed to match prod (every other DS token got the --x- prefix).',
    source: 'docs/token-reconcile.md §1',
  },
  {
    id: 'runtime-instance-vars',
    pattern: /^--(px|py|bloom-progress|flag-tile-w|home-steps-icon-url|toolbar-h|navbar-h|navbar-h-max|nav-stack-h|safe-top|reveal-index|opt-delay|stack-height|gift-count|sku-columns|sheet-max-width|page-bg-image|loyalty-icon-url|mi-url)$/,
    rules: ['*'],
    reason: 'Runtime/layout instance values set via :style bindings — not design tokens by decree.',
    source: 'docs/token-reconcile.md §4',
  },
  {
    id: 'haptics-js-only',
    pattern: /^--x-haptic-/,
    rules: ['*'],
    reason: 'Haptics are JS data end-to-end (src/tokens/haptics.js); prod has no parallel CSS token and this repo deliberately doesn\'t mint one.',
    source: 'docs/token-reconcile.md §1',
  },
  {
    id: 'size-img-dynamic-read',
    pattern: /^--x-size-img-/,
    rules: ['unreachable', 'unread'],
    reason: 'Read only via a template literal (`var(--x-size-img-${size})`) in Thumbnail.vue — the one dynamic-name read in the repo. Never statically provable; must not be flagged unused.',
    source: 'src/components/Thumbnail.vue',
  },
  {
    id: 'trustbar-raw-scale-size',
    token: '--x-sys-size-xxxl',
    rules: ['tier-violation'],
    reason: 'TrustBar.vue: no semantic card-min-height token exists yet — known gap, not an oversight.',
    source: 'drift-audit.md §4',
  },
  {
    id: 'home-blob-palette-fallback',
    token: '--x-palette-home-blob-neutral-0',
    rules: ['tier-violation'],
    reason: 'Codashop-only components reading a spectrum-tier token directly; it resolves correctly (declared in themes/codashop.css). Tier breach stands, but it is not dead code.',
    source: 'drift-audit.md §6',
  },
  {
    id: 'fcm-prod-sku-card-pilot',
    pattern: /^--x-(bg|border|gradient|text)-(image-)?(loyalty-badge-|sku-)(card-)?(prod|tag-popular)/,
    rules: ['no-root-default'],
    reason: 'FCM production SKU-card pilot (fcmSkuCardModel flag): inert (none/transparent) at :root by convention, real values only in themes/fcm.css. A named, intentional pattern — not a coverage gap.',
    source: 'docs/fcm-components.md §6',
  },
]

/** True if `name` (a token) is allowlisted for the given rule id. */
export function isAllowlisted (name, ruleId) {
  return ALLOWLIST.some((entry) => {
    const matches = entry.token ? entry.token === name : entry.pattern.test(name)
    if (!matches) return false
    return entry.rules.includes('*') || entry.rules.includes(ruleId)
  })
}

/** The matching allowlist entry (or entries) for a token, regardless of rule. */
export function allowlistEntriesFor (name) {
  return ALLOWLIST.filter((entry) => (entry.token ? entry.token === name : entry.pattern.test(name)))
}
