/**
 * Yu-Gi-Oh! MASTER DUEL store module (publisher: KONAMI) — theme CSS
 * (side-effect import), capability config, user-visible copy, the imagery
 * registry, and the per-store SKU data. Imported only via an active-stores
 * manifest (the @active-stores virtual module, see vite.config.js), so a build that doesn't include YGOMD
 * never bundles these assets, fonts, or theme rules.
 *
 * Built from docs/style-guides/yugioh-masterduel/spec.json (style-guide-
 * designer output), itself extracted from the live site
 * konami.com/yugioh/masterduel/us/en, PLUS the real SKU catalogue scraped
 * from yugioh-masterduel.codashop.com/en-us/masterduel (accessed 2026-07-07).
 *
 * Page model: a single flat 'regular' section (KONAMI ID sign-in, no
 * loyalty programme) — the exact shape ygodl.css/store.js already uses for
 * its own Crystal Packs, since Master Duel Gems are the same "flat currency
 * top-up list" pattern (not a category-tree catalogue). The 2 real
 * limited/exclusive Gem Packs sort first in the same array (matching how
 * ygodl's own web-exclusive deals lead its regular list), each carrying its
 * own subtitle spelling out its real purchase limit (3 vs 1) rather than
 * the shared generic "Limit: 1" — see the `subtitle` fields below.
 *
 * Layer decision rule (see web-store-whitelabel skill):
 *   colour / type / surface   → ../../tokens/ds/themes/ygomd.css (imported here)
 *   imagery                   → assets / skus item art
 *   structural capability     → config
 *   user-visible copy         → strings / skus item copy
 *   per-store SKU data        → skus  (consumed by useStoreSkus() + App.vue)
 */

import '@/tokens/ds/themes/ygomd.css'
import { LOCALE_SETS } from '../../locale/sets.js'

// ── Brand ─────────────────────────────────────────────────────────────────────
// Real user-supplied brand icon (small card-back/portal mark) — used for the
// navbar logo, sign-in icon, and favicon.
import logomark from './img/brand/logomark.png'

// Coda-platform branding (checkout footer) — market-level, shared across stores.
import coda from '@/shared/brand/coda.svg'

// ── Content ──────────────────────────────────────────────────────────────────
// 5 real user-supplied icons (generic gem-crystal / treasure-chest art — not
// Konami character art, no copyright concern). Scaled by SKU tier below.
import gemSmall  from './img/content/gem-small.png'
import gemMedium from './img/content/gem-medium.png'
import gemLarge  from './img/content/gem-large.png'
import chestBlue from './img/content/chest-blue.png'
import chestGold from './img/content/chest-gold.png'

// Real user-supplied carousel art — the official 4th Anniversary key art
// (Dark Magician Girl + KONAMI wordmark). NOTE: unlike the gem/chest icons
// above, this IS Konami's own character art — the same kind of asset the
// style guide's assetManifest marks "not for redistribution" when sourced
// from docs/style-guides/yugioh-masterduel/refs/. This particular file was
// supplied directly by the store owner as an explicit, informed choice for
// the carousel, not pulled from the reference-only refs/ folder — flagging
// here so the licensing trade-off stays visible in the code, not just chat.
import storyHero from './img/content/story-hero.png'

export default {
  key:   'ygomd',
  label: 'Yu-Gi-Oh! MASTER DUEL',

  // ── Structural capabilities (read via useStoreConfig) ──────────────────────
  config: {
    // Footer "Need Help?" action (hidden when supportUrl is null) + per-network
    // social profile URLs (icons are shared/market-level — see useStoreAssets;
    // null hides that one icon regardless of asset availability).
    // TODO — supportUrl is a placeholder pending the real support destination.
    footer: {
      supportUrl: '#',
      social: { x: '#', facebook: '#', instagram: '#', youtube: '#', tiktok: '#', discord: '#' },
    },

    // Region/language switcher set — Codashop standard 27 (no dedicated skill yet).
    locale: LOCALE_SETS.codashop,

    skuList: { layout: 'columns' },

    // Gold+violet spinning dual-comet ring on the flagship hero SKU (App.vue /
    // HeroSkuCard — reused here on the Limited-Time Gem Pack, the first
    // 'regular' item below) — "activated relic / premium drop," not the
    // calmer camo-breathe variant MGSΔ opted into.
    sku: { heroRingEffect: 'dual' },

    // 'page' = single-scroll: the flat Gem-Pack grid renders as one section
    // (page.sections below), no category-tree catalogue. hideNav:true drops
    // the bottom CategoryNav — same flag TDR uses for its own single category,
    // pointless here too since there's only the one "Gems" section to jump to.
    catalog: { mode: 'page', hideNav: true },
    // storyHeroLogo:false — the carousel key art already reads as branded on
    // its own; no need to stamp the small card-back brand mark on top of it
    // too (that mark still shows in the navbar/favicon via assets.brand.*).
    page: { sections: ['regular'], storyHeroLogo: false },

    checkout: {
      showPoweredByCoda: true,
      showRating:        false,
      loyalty:           null,   // no loyalty programme wired
      // No guest checkout — same as ygodl. Forces the page-level KONAMI ID
      // sign-in section (below) to render before the products, matching
      // Master Duel's own real account model (Gems are tied to a KONAMI ID).
      allowGuest:        false,
    },

    // KONAMI ID (myKONAMI) sign-in — Master Duel's own copy repeatedly
    // confirms KONAMI ID accounts ("Your Gems are linked to your KONAMI ID,
    // Duelist" — spec.json generic.voice.copyExamples.confirmation), reusing
    // the same flow + the same generic PageSignInSection.vue component
    // ygodl (Duel Links, same publisher) already uses — reskinned via
    // --x-bg-action-mykonami in ygomd.css, no component edit.
    signIn: {
      desktop: ['mykonami'],
      mobile:  ['mykonami'],
    },
    // Sign-in now lives in the page section above (allowGuest:false), not
    // the navbar — same pattern ygodl uses.
    navbar: { hideSignIn: true },

    profile: {
      avatarStyle:             'image',
      playerCard:              'nickname-only',
      showLoyaltyPill:         false,
      showAccountInstructions: false,
      showPlayerRank:          false,
      showPlayerAccount:       false,
    },

    chrome: { iconVariant: 'light' },    // light PC logos + social icons for the dark UI

    // Master Duel sells Gems — the same mobile top-up buying context COD:M's
    // phone frame represents, even though the game itself is cross-platform
    // (PC/console/mobile). device.default omitted → App.vue's 'iphone' default.
  },

  // ── User-visible copy (read via useStoreStrings) ───────────────────────────
  // Voice: grand/declarative, addresses the player as "Duelist" — see
  // docs/style-guides/yugioh-masterduel/spec.json generic.voice for the full
  // extraction (verbatim quotes from the live site's own copy).
  strings: {
    // Site footer (see Footer.vue). disclaimer/legalLinks are per-store —
    // null/empty hides that block.
    footer: {
      supportCta:    'Support Portal',
      cookieLabel:   'Cookie Preference',
      cookieCta:     'Manage Your Cookie Preference',
      socialHeading: 'Stay up to date with us',
      disclaimer:    null,
      legalLinks:    [],
    },
    currency: {
      name: 'Gems',
      abbr: 'Gems',
    },
    checkout: {
      actionLabel: 'Complete the Duel',   // spec.json voice.copyExamples.checkoutCta
    },
    sku: {
      bonusLabel:     'Duelist Bonus',    // spec.json voice.copyExamples.bonusBadge
      bestSeller:      'DUELIST’S PICK',
      bestValue:       'BEST VALUE',
      limitedTimeTag:  'LIMITED-TIME',    // tagKey on the Limited-Time Gem Pack
      exclusiveTag:    'GAMES STORE EXCLUSIVE',  // tagKey on the Exclusive Gem Pack
    },
    nav: {
      groups: [{
        label: 'Store',
        children: [
          { label: 'Gems', anchor: 'cat-regular' },
        ],
      }],
      items: [
        { label: 'Festivals',    anchor: null },
        { label: 'My Account',   anchor: null },
      ],
    },
    signIn: {
      logoAlt:           'Yu-Gi-Oh! MASTER DUEL',
      pagePrompt:        'Sign in to your KONAMI ID, Duelist',
      accountLinkPrompt: 'How to link your game account with your KONAMI ID',
      mykonami: {
        cta:        'KONAMI ID Sign In',
        pagePrompt: 'Sign in to your KONAMI ID account to purchase',
        openingApp: 'Opening KONAMI ID…',
      },
    },
    account: {
      heading:            'Your KONAMI ID',
      playerIdLabel:      'Your Duelist ID',
      instructionsPrefix: 'In the MASTER DUEL app go to',
      playerCardLabel:    'Player Profile',
    },
    // Unused while page.sections: ['regular'] omits every other page section —
    // kept for schema completeness only (App.vue gates each behind showSection()).
    page: {
      tabs:            ['Gems'],
      promoTitle:      'ENTER THE ULTIMATE BATTLE',   // spec.json voice.copyExamples.hero
      promoAction:     'Master the Deck',              // spec.json voice.copyExamples.skuCta
      currencySection: 'Gems',
      regularHeading:  'Gem Packs',
    },
  },

  // ── Localised copy overrides — none yet; falls through to English for every
  // locale until translations are commissioned.
  translations: {},

  // ── Imagery (read via useStoreAssets) ──────────────────────────────────────
  assets: {
    brand: {
      wordmark:       logomark,
      logomark,
      signinLogomark: logomark,
      navSignInIcon:  logomark,
      favicon:        logomark,
      qrCode:         null,
      qrPlaceholder:  null,
      coda,
      rating:            null,
      cpIcon:            null,   // no dedicated Gem icon supplied; falls back to skuCodPoint via cpCoinFor()
      bg:                null,   // page backdrop is a hardcoded CSS gradient (see ygomd.css), no image asset
      loyaltyIcon:       null,   // no loyalty programme (config.checkout.loyalty is null)
      loyaltyIconColour: null,
    },
    // pc is merged in by useStoreAssets() from the shared PC map (per polarity).
    content: {
      storyHero,   // real 4th Anniversary key art (see import comment above re: licensing)
      bannerMidnightSun:    null,
      bannerTheBoys:        null,
      cpSkuBanner:          null,
      skuMidnightSunHero:   null,
      bestSellerImage:      null,
      cpCategoryBg:         null,
      // SKU / currency art — tier-scaled gem-crystal renders (see skus below
      // for which SKU uses which image).
      skuCrate:    gemMedium,
      skuCodPoint: gemMedium,
      cpCoins:     null,          // falls back to skuCodPoint via cpCoinFor()
      giftSecretCache: null,
      giftEmote:       null,
      giftGun:         null,
      avatar:          null,
    },
  },

  // 'page' model — no category-tree catalogue / featured carousel data.
  catalog:  null,
  featured: null,

  // ── Per-store SKU data (consumed by useStoreSkus() + App.vue) ───────────────
  // Real pricing/copy from yugioh-masterduel.codashop.com/en-us/masterduel
  // (accessed 2026-07-07). The 2 limited/exclusive packs lead the list (same
  // ordering convention ygodl uses for its own web-exclusive deals); their
  // `subtitle` spells out the real purchase limit (3 / 1) directly rather
  // than relying on the shared generic "Limit: 1" string, since one of them
  // isn't Limit:1. Gem-crystal art scales by tier: gemSmall for the two
  // smallest packs, gemMedium for the two mid packs, gemLarge for the four
  // largest — this size mapping is an inference from the 3 supplied crystal
  // images, not confirmed against real store data; adjust freely.
  skus: {
    regular: [
      { amount: 2625, baseAmount: 1590,  bonusAmount: 1035, currentPrice: '$26.99',  skuImage: chestGold, tagKey: 'limitedTimeTag', subtitle: 'Limit: 3' },
      { amount: 1000, baseAmount: 630,   bonusAmount: 370,  currentPrice: '$10.99',  skuImage: chestBlue, tagKey: 'exclusiveTag',   subtitle: 'Limit: 1' },
      { amount: 70,    baseAmount: 67,    bonusAmount: 3,    currentPrice: '$1.19',   skuImage: gemSmall },
      { amount: 147,   baseAmount: 134,   bonusAmount: 13,   currentPrice: '$2.29',   skuImage: gemSmall },
      { amount: 378,   baseAmount: 335,   bonusAmount: 43,   currentPrice: '$5.69',   skuImage: gemMedium },
      { amount: 735,   baseAmount: 630,   bonusAmount: 105,  currentPrice: '$10.99',  skuImage: gemMedium },
      { amount: 1491,  baseAmount: 1255,  bonusAmount: 236,  currentPrice: '$21.49',  skuImage: gemLarge },
      { amount: 2468,  baseAmount: 2050,  bonusAmount: 418,  currentPrice: '$34.99',  skuImage: gemLarge },
      { amount: 5198,  baseAmount: 4170,  bonusAmount: 1028, currentPrice: '$70.99',  skuImage: gemLarge },
      { amount: 15594, baseAmount: 12510, bonusAmount: 3084, currentPrice: '$214.99', skuImage: gemLarge },
    ],
  },
}
