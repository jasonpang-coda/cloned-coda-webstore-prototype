/**
 * Store config schema — the single source of truth for `store.js`'s `config` key.
 *
 * This is the thing that was missing before the store CMS: every knob a store's
 * `config` object can carry, with its type, default, and which file/component
 * gates on it. `audit.mjs` diffs every store module against this list; the CMS
 * dashboard renders a form field per entry; `generators/store-module.mjs` uses
 * the defaults to fill in a value the wizard didn't ask about.
 *
 * Derived by reading all ten `src/stores/<store>/store.js` files plus every
 * `config.*` read in `src/App.vue` and `src/components/*.vue`. Where the repo
 * docs (docs/multi-store-whitelabel.md) disagreed with the code, the code won —
 * see the `note` field below for the corrections this schema settles.
 *
 * Field shape:
 *   path      — dot path into `config` (e.g. 'checkout.allowGuest')
 *   type      — 'string' | 'boolean' | 'number' | 'enum' | 'stringArray' | 'object' | 'nullable'
 *   options   — for type:'enum', the allowed values
 *   default   — value every store gets if the CMS wizard doesn't ask
 *   required  — true if every managed store must set this explicitly (no silent default)
 *   gates     — file:symbol that reads this flag
 *   help      — one-line explanation for the dashboard form
 *   note      — optional correction / gotcha worth surfacing
 */

export const CONFIG_SCHEMA = [
  // ── catalog ──────────────────────────────────────────────────────────────
  { path: 'catalog.mode', type: 'enum', options: ['page', 'filter'], default: 'page', required: true,
    gates: 'App.vue (isFilter) / useStoreCatalog.js',
    help: '"page" = COD:M-style bespoke single-scroll sections. "filter" = FCM-style category filter nav + catalogue tree (needs a catalog.js).' },
  { path: 'catalog.hideNav', type: 'boolean', default: false,
    gates: 'App.vue (sticky bottom CategoryNav)',
    help: 'Suppress the sticky bottom category nav — for single-category stores.' },
  { path: 'catalog.featuredHero', type: 'boolean', default: false,
    gates: 'App.vue / useFeaturedItems()',
    help: 'Render a standalone best-seller hero above the category list.' },
  { path: 'catalog.reseller', type: 'boolean', default: false,
    gates: 'FCM catalog.js',
    help: 'Reseller-badge variant of the filter catalogue (FCM-specific, rarely needed for a new store).' },

  // ── page (only meaningful when catalog.mode === 'page') ────────────────────
  { path: 'page.sections', type: 'stringArray', default: null,
    options: ['best-seller', 'bundle', 'gifts', 'new-users', 'cp', 'cp-img-newuser', 'cp-img', 'regular', 'limited', 'free-rewards'],
    gates: 'App.vue showSection()',
    help: 'Allowlist of page sections to render, in order. Omit (null) to show all. [] hides every page section (e.g. a guest-only PC store with a custom catalog).' },
  { path: 'page.layout', type: 'enum', options: [null, 'split'], default: null,
    gates: 'Span.vue / GameIdentity.vue',
    help: '"split" gives a 2-column layout with a left-rail game identity card (Codashop only so far).' },
  { path: 'page.hero', type: 'boolean', default: true,
    gates: 'App.vue (StoryCarousel)',
    help: 'Show the hero story carousel. Set false to hide it entirely.' },
  { path: 'page.storyHeroLogo', type: 'boolean', default: true,
    gates: 'App.vue hero section',
    help: 'Show the brand mark overlaid on the hero carousel.' },

  // ── skuList ────────────────────────────────────────────────────────────────
  { path: 'skuList.layout', type: 'enum', options: ['columns', 'wrap', 'stack'], default: 'columns', required: true,
    gates: 'SkuList.vue',
    help: 'Grid arrangement for the plain SKU list.' },
  { path: 'skuList.columns', type: 'number', default: null,
    gates: 'SkuList.vue (--sku-columns)',
    help: 'Override the default 4-up grid at >=641px with an explicit column count.' },

  // ── checkout ─────────────────────────────────────────────────────────────
  { path: 'checkout.mode', type: 'enum', options: [null, 'inline'], default: null,
    gates: 'App.vue (CheckoutSheet vs inline steps)',
    help: '"inline" replaces the overlay CheckoutSheet with page-embedded steps (Gamer ID / Payment / Zip / Details) — see src/components/checkout/.' },
  { path: 'checkout.allowGuest', type: 'boolean', default: true, required: true,
    gates: 'App.vue, SignInSheet.vue',
    help: 'Allow a guest Player-ID lookup + "check out as guest" instead of requiring sign-in first.' },
  { path: 'checkout.loyalty', type: 'nullable', default: null,
    shape: '{ label: string }',
    gates: 'App.vue (loyaltyPoints), NavBar.vue, CheckoutSheet.vue',
    help: 'null disables all loyalty UI. Set { label } to enable the loyalty banner + navbar pill everywhere. Rule: every loyalty surface guards on this being non-null, never on the loyalty asset alone.' },
  { path: 'checkout.showPoweredByCoda', type: 'boolean', default: true, required: true,
    gates: 'CheckoutSheet.vue', help: '"Powered by Coda" footer line.' },
  { path: 'checkout.showRating', type: 'boolean', default: true, required: true,
    gates: 'CheckoutSheet.vue', help: 'Rating badge under the checkout CTA.' },

  // ── signIn ───────────────────────────────────────────────────────────────
  { path: 'signIn.flow', type: 'enum', options: ['codm', 'ea-redirect', 'mykonami', 'efootball'], default: 'codm',
    gates: 'NavBar.vue, SignInSheet.vue, PageSignInSection.vue, CommandConsole.vue, ClaimGiftSheet.vue',
    help: 'Which sign-in UI/flow to render. "codm" = in-app QR + loader. Device-split stores instead use signIn.desktop/.mobile arrays.' },
  { path: 'signIn.desktop', type: 'stringArray', default: null,
    gates: 'SignInSheet.vue / PageSignInSection.vue device-split branch',
    help: 'Alternate to signIn.flow — an ordered list of flows to try on desktop (e.g. ["mykonami","efootball"]).' },
  { path: 'signIn.mobile', type: 'stringArray', default: null,
    gates: 'SignInSheet.vue / PageSignInSection.vue device-split branch',
    help: 'Mirror of signIn.desktop for mobile.' },

  // ── navbar ───────────────────────────────────────────────────────────────
  { path: 'navbar.hideSignIn', type: 'boolean', default: false,
    gates: 'NavBar.vue',
    help: 'Hide both the sign-in button and the account avatar — for guest-only stores with no account concept.' },

  // ── profile ──────────────────────────────────────────────────────────────
  { path: 'profile.avatarStyle', type: 'enum', options: ['image', 'icon'], default: 'image', required: true,
    gates: 'NavBar.vue, AccountPopover.vue', help: 'In-game player avatar image vs a generic account icon.' },
  { path: 'profile.playerCard', type: 'enum', options: ['full', 'nickname-only'], default: 'full', required: true,
    gates: 'PlayerCard.vue, PageSignInSection.vue, AccountPopover.vue', help: 'PlayerCard detail level.' },
  { path: 'profile.showLoyaltyPill', type: 'boolean', default: false, required: true,
    gates: 'NavBar.vue', help: 'Navbar loyalty-points pill. Pair with checkout.loyalty !== null.' },
  { path: 'profile.showAccountInstructions', type: 'boolean', default: true,
    gates: 'PlayerAccount.vue (default-true via !== false)',
    help: 'Guest-lookup instruction chips on the account page.' },
  { path: 'profile.showPlayerRank', type: 'boolean', default: false,
    gates: 'PlayerCard.vue', help: 'Rank row on the full PlayerCard variant.' },
  { path: 'profile.showPlayerAccount', type: 'boolean', default: false,
    gates: 'PlayerAccount.vue', help: 'Game-account linking block on the account page.' },

  // ── footer ───────────────────────────────────────────────────────────────
  { path: 'footer.supportUrl', type: 'nullable', default: null,
    gates: 'Footer.vue', help: 'null hides the "Need Help?" action. Otherwise a URL (or "#" placeholder).' },
  { path: 'footer.social', type: 'object', default: { x: null, facebook: null, instagram: null, youtube: null, tiktok: null, discord: null },
    shape: '{ x, facebook, instagram, youtube, tiktok, discord }: string | null',
    gates: 'Footer.vue', help: 'Per-network profile URL. null hides that one icon regardless of asset availability.' },

  // ── locale ───────────────────────────────────────────────────────────────
  { path: 'locale', type: 'object', default: null, required: true,
    gates: 'src/locale/sets.js — LOCALE_SETS.{codm,fcm,tdr,codashop}',
    help: 'Reference into a named LOCALE_SET ({ defaultMarket, languages[], markets[] }). New stores typically reuse LOCALE_SETS.codashop (the generic 27-market set) unless they need dedicated language support.' },

  // ── chrome ───────────────────────────────────────────────────────────────
  { path: 'chrome.iconVariant', type: 'enum', options: ['light', 'dark'], default: 'light', required: true,
    gates: 'useStoreAssets.js (shared PC + social icon polarity)',
    note: 'src/shared/pc/dark/ is currently an empty stub — selecting "dark" silently falls back to the light logos until that folder is filled in. Warn in the dashboard.',
    help: 'Payment-channel + social icon polarity to match a light vs dark store background.' },

  // ── device ───────────────────────────────────────────────────────────────
  { path: 'device.default', type: 'enum', options: ['iphone', 'none'], default: 'iphone',
    gates: 'DeviceToolbar.vue', help: 'Initial device-frame preset. "none" for a store with no device-frame concept (e.g. a PC/desktop-only store).' },

  // ── carousel ─────────────────────────────────────────────────────────────
  { path: 'carousel.aspectRatio', type: 'string', default: null,
    gates: 'App.vue (StoryCarousel)', help: 'CSS aspect-ratio override for the hero carousel, e.g. "16 / 9".' },

  // ── bundle ───────────────────────────────────────────────────────────────
  { path: 'bundle.itemSummary', type: 'boolean', default: false,
    gates: 'BundleItem.vue / ItemSummarySheet.vue',
    help: 'Tapping a bundle child tile opens the ItemSummarySheet detail view. Requires bundle items to carry name/media/description.' },

  // ── sku ──────────────────────────────────────────────────────────────────
  { path: 'sku.heroRingEffect', type: 'enum', options: [null, 'camo-breathe', 'dual'], default: null,
    gates: 'SkuCard.vue / HeroSkuCard.vue (fx-glow-border-* variant)',
    help: 'Decorative animated ring effect on the hero/best-seller SKU.' },

  // ── background ───────────────────────────────────────────────────────────
  { path: 'background.style', type: 'enum', options: [null, 'fixed-image'], default: null,
    gates: 'App.vue root background',
    help: '"fixed-image" gives a full-cover fixed page background. Requires assets.brand.bg.' },

  // ── platforms ────────────────────────────────────────────────────────────
  { path: 'platforms', type: 'stringArray', default: null,
    gates: 'none yet — currently unread by any component',
    note: 'efootball declares this (["ios","android","steam"]) as forward-looking catalog-gating data, but no component reads it today. Kept in the schema so it isn\'t flagged as drift; a future platform-filtered catalogue would consume it.',
    help: 'Which platforms this store\'s catalogue targets.' },

  // ── identity (Codashop-style split layout only) ─────────────────────────
  { path: 'identity.image', type: 'nullable', default: null,
    gates: 'GameIdentity.vue', help: 'Left-rail game identity thumbnail. Only used when page.layout === "split".' },
  { path: 'identity.title', type: 'string', default: null,
    gates: 'GameIdentity.vue', help: 'Left-rail game identity title.' },
]

// Corrections this schema settles vs. the (stale) prose docs — see
// docs/multi-store-whitelabel.md, which is being updated to match:
export const KNOWN_DOC_DISCREPANCIES = [
  'checkout.actionLabel is a STRING (strings.checkout.actionLabel), not config.',
  'The flag is config.chrome.iconVariant, not "pc.variant".',
  'COD:M\'s skuList.layout is "columns", not "stack".',
  'checkout.loyalty is { label } only — no "suffix" field exists in any store.',
  'The asset key is assets.brand.loyaltyIconColour, not "mpColourIcon".',
]
