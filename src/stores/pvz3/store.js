/**
 * Plants vs. Zombies 3: Evolved store module — theme CSS (side-effect import),
 * capability config, user-visible copy, imagery registry, and SKU catalogue
 * (catalog.js). Imported only via an active-stores manifest
 * (the @active-stores virtual module, see vite.config.js), so a build that doesn't include pvz3 never
 * bundles these images, fonts, or theme rules.
 *
 * SCAFFOLD — folder structure + wiring only. Every asset below is a generic
 * placeholder SVG (see ./img/) and every copy string is marked PLACEHOLDER.
 * Fill in real content following web-store-whitelabel skill §3/§5 and
 * setup-checklist.md Phases 3-6. Decisions already made (Phase 0):
 *   catalog model → 'filter' (category nav, mirrors src/stores/fcm/)
 *   auth model    → EA-style redirect sign-in (signIn.flow: 'ea-redirect')
 *   currency      → virtual currency top-up ("Gems", placeholder name)
 *
 * Layer decision rule (see web-store-whitelabel skill):
 *   colour / type / surface   → ../../tokens/ds/themes/pvz3.css (imported here)
 *   imagery                   → assets
 *   structural capability     → config
 *   user-visible copy         → strings
 *   catalogue tree / featured → ./catalog.js
 */

import '@/tokens/ds/themes/pvz3.css'
import { LOCALE_SETS } from '../../locale/sets.js'
import { catalog, featured } from './catalog.js'

// ── Brand — PLACEHOLDER art, swap when real brand kit arrives ───────────────
import wordmark from './img/brand/wordmark-placeholder.svg'
import logomark from './img/brand/logomark-placeholder.svg'

// Coda-platform branding (checkout footer) — market-level, shared across stores.
import coda   from '@/shared/brand/coda.svg'
import rating from '@/shared/brand/rating.svg'

// ── Content — PLACEHOLDER art, one square + one wide slot reused everywhere ─
import placeholderSquare from './img/content/placeholder-square.svg'
import placeholderWide   from './img/content/placeholder-wide.svg'

export default {
  key:   'pvz3',
  label: 'Plants vs. Zombies 3: Evolved',

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

    skuList: { layout: 'wrap' },   // TODO — confirm grid vs stack once catalog is real

    // 'filter' = FCM-style category filter nav + catalogue tree.
    catalog: { mode: 'filter', featuredHero: false },

    checkout: {
      showPoweredByCoda: true,
      showRating:        true,
      loyalty:           null,     // TODO — wire a loyalty programme if PvZ3 has one
      allowGuest:        false,    // EA-style redirect sign-in — must sign in first
    },

    // EA-style redirect sign-in overlay (per Phase-0 decision) — mirrors FCM.
    signIn: { flow: 'ea-redirect' },

    navbar: { hideSignIn: false },

    profile: {
      avatarStyle:             'icon',
      playerCard:              'nickname-only',
      showLoyaltyPill:         false,
      showAccountInstructions: true,
      showPlayerRank:          false,
      showPlayerAccount:       true,
    },

    chrome: { iconVariant: 'light' },   // TODO — confirm light/dark polarity once theme is real

    device: { default: 'iphone' },   // TODO — confirm device frame once platform (mobile/PC) is set
  },

  // ── User-visible copy (read via useStoreStrings) — ALL PLACEHOLDER ─────────
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
      name: 'Gems',   // PLACEHOLDER — confirm PvZ3's real premium-currency name
      abbr: 'GM',
    },
    checkout: {
      actionLabel: 'Checkout',
    },
    sku: {
      bonusLabel: 'BONUS',
      bestSeller: 'BEST SELLER',
      bestValue:  'BEST VALUE',
    },
    nav: {
      groups: [{
        label: 'Store',
        children: [
          { label: 'Gem Top-Ups', anchor: 'top-ups' },
        ],
      }],
      items: [],
    },
    signIn: {
      logoAlt:        'Plants vs. Zombies 3: Evolved',
      cta:            'Sign In',
      openingApp:     'Opening Plants vs. Zombies 3: Evolved…',
      qrInstruction:  'Scan this QR code with a mobile device logged into your account',
      pagePrompt:     'Sign in to your account to purchase',
    },
    account: {
      heading:            'YOUR ACCOUNT',
      playerIdLabel:      'Your Player ID',
      instructionsPrefix: 'In the PvZ3 App go to',
      playerCardLabel:    'Player Profile',
    },
    page: {
      tabs:                  ['Gem Top-Ups'],
      promoTitle:            'PLACEHOLDER PROMO TITLE',
      promoAction:           'SHOP NOW',
      doubleCurrencyHeading: '2x Gems',
      doubleCurrencyDesc:    'PLACEHOLDER — double-currency promo copy.',
      newUsersHeading:       'NEW USERS PROMO',
      newUsersDesc:          'PLACEHOLDER — new-user offer copy.',
      newUsersSub:           'PLACEHOLDER — offer limit copy.',
      currencySection:       'Gems',
      giftsHeading:          'GIFTS',
      giftLimit:             'Limit: 1',
      giftClaimHeading:      'Claim Gift',
      giftClaimLabel:        'You are about to claim',
      giftClaimCta:          'Claim Gift',
      giftClaimDoneCta:      'Close',
      giftClaimedHeading:    'Gift Claimed',
      giftClaimedBody:       'has been sent to your account.',
      giftClaimedUpsellIntro: 'Since you are here, check out this offer just for you',
    },
  },

  // ── Localised copy overrides — none yet; falls through to English. ─────────
  translations: {},

  // ── Imagery (read via useStoreAssets) — ALL PLACEHOLDER ────────────────────
  assets: {
    brand: {
      wordmark,
      logomark,
      favicon:        logomark,
      navSignInIcon:  logomark,
      qrCode:         placeholderSquare,
      qrPlaceholder:  placeholderSquare,
      coda,
      rating,
      cpIcon:         placeholderSquare,   // Gem icon
      apIcon:         null,
      loyaltyIcon:       null,
      loyaltyIconColour: null,
    },
    // pc is merged in by useStoreAssets() from the shared PC map (per polarity).
    content: {
      storyHero:        placeholderWide,
      bestSellerImage:  placeholderSquare,
      giftDailyImage:   placeholderSquare,
      avatar:           placeholderSquare,
    },
  },

  catalog,
  featured,
}
