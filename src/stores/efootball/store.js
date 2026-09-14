/**
 * eFootball™ store module — everything that defines the KONAMI eFootball™
 * web store: theme CSS (side-effect import), capability config, user-visible
 * copy, and the imagery registry.
 *
 * Layer decision rule (see web-store-whitelabel skill):
 *   colour / type / surface   → ../../tokens/ds/themes/efootball.css (imported here)
 *   imagery                   → assets
 *   structural capability     → config
 *   user-visible copy         → strings
 *   catalogue tree / featured → ./catalog.js (TODO — add once platform SKU structure confirmed)
 *
 * New capabilities introduced by this store (not present in codm/fcm):
 *   config.background.style = 'fixed-image'  — full-cover bg art stays fixed during scroll
 *   config.signIn.desktop / .mobile          — device-split sign-in flows
 *   config.platforms                         — ['ios','android','steam'] catalog gating
 */

import '@/tokens/ds/themes/efootball.css'
import { LOCALE_SETS } from '../../locale/sets.js'

// ── Localised copy (partial overrides of `strings`; en falls through) ──────────
// Phase-1 languages within eFootball's Codashop locale set: ja, pt, es, ar,
// zh-Hant, th, id, ko.
import ja     from './strings/ja.js'
import pt     from './strings/pt.js'
import es     from './strings/es.js'
import ar     from './strings/ar.js'
import zhHant from './strings/zh-Hant.js'
import th     from './strings/th.js'
import id     from './strings/id.js'
import ko     from './strings/ko.js'

// ── Brand ─────────────────────────────────────────────────────────────────────
import wordmark        from './img/content/navbar logo.svg'
import logomark        from './img/brand/logomark.svg'
import signinLogomark  from './img/content/Logomark.svg'
import bg              from './img/content/BG.webp'

// Coda-platform branding (checkout footer) — market-level, shared across stores.
import coda   from '@/shared/brand/coda.svg'
import rating from '@/shared/brand/rating.svg'

// ── Content ───────────────────────────────────────────────────────────────────
import storyHero from './img/content/Carousel/efootball.webp'

export default {
  key:   'efootball',
  label: 'eFootball™',  /* eFootball™ — ™ as Unicode to avoid HTML entity in JS */

  // ── Structural capabilities ────────────────────────────────────────────────
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

    skuList: { layout: 'wrap' },   // 2-up grid (matches FCM; adjust once catalogue confirmed)

    catalog: { mode: 'filter' },   // category filter nav — populated per-platform post sign-in

    // eFootball™ is multi-platform: iOS / Android / Steam.
    // The UI should offer a platform picker after sign-in and load the
    // platform-appropriate catalogue. Currently unimplemented — catalog is null.
    platforms: ['ios', 'android', 'steam'],

    // Full-cover page background image, fixed to viewport during scroll.
    // App.vue injects --page-bg-image CSS var when assets.brand.bg is defined;
    // efootball.css applies it to .device__screen via html[data-theme] override.
    background: { style: 'fixed-image' },

    // Story carousel: a single landscape KV hero. The aspectRatio overrides the
    // carousel's default 1:1 (mobile) / 2.6:1 (desktop) frame so the wide art
    // fits without cropping. Other stores omit this → responsive default.
    carousel: { aspectRatio: '16 / 9' },

    checkout: {
      showPoweredByCoda: false,
      showRating:        false,
      loyalty:           null,    // eFootball has no loyalty/points programme — no checkout banner, no card rows
      allowGuest:        false,   // must sign in (myKONAMI or eFootball app)
    },

    // Two sign-in methods, split by device:
    //   desktop / Steam → myKONAMI web redirect only
    //   mobile (iOS / Android) → myKONAMI + eFootball in-app QR (like COD:M flow)
    // The SignIn component will read .desktop / .mobile arrays when wired.
    // Legacy flow string is intentionally absent — new shape only.
    signIn: {
      desktop: ['mykonami'],
      mobile:  ['mykonami', 'efootball'],
    },

    profile: {
      avatarStyle:     'icon',          // no in-game avatar URL; generic account_circle
      playerCard:      'nickname-only', // myKONAMI only surfaces the display name
      showLoyaltyPill: false,
    },

    chrome: { iconVariant: 'light' },

    navbar: { hideSignIn: true },
  },

  // ── User-visible copy ──────────────────────────────────────────────────────
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
      name: 'eFootball Coins',
      abbr: 'EFC',
    },
    checkout: {
      actionLabel: 'Checkout',
    },
    sku: {
      bonusLabel: 'Coins Bonus',
      bestSeller: 'BEST SELLER',
      bestValue:  'BEST VALUE',
    },
    nav: {
      groups: [{
        label: 'Store',
        children: [
          { label: 'Top Ups',        anchor: 'top-ups' },
          { label: 'Coin Packs',     anchor: 'coin-packs' },
          { label: 'Special Offers', anchor: 'special-offers' },
        ],
      }],
      items: [],
    },
    signIn: {
      logoAlt:           'eFootball™',
      pagePrompt:        'Sign in to purchase',
      accountLinkPrompt: 'How to link your game account with your KONAMI ID',

      // myKONAMI web-redirect flow (desktop + mobile primary)
      mykonami: {
        cta:           'KONAMI ID Sign In',
        pagePrompt:    'Sign in to your myKONAMI account to purchase',
        openingApp:    'Opening myKONAMI…',
      },

      // eFootball in-app QR flow (mobile secondary — mirrors COD:M 'codm' flow)
      efootball: {
        cta:            'Sign in with eFootball',
        openingApp:     'Opening eFootball™…',
        qrInstruction:  'Scan this QR code with a mobile device logged into your eFootball™ account',
        pagePrompt:     'Sign in to your eFootball™ account to purchase',
      },
    },
    account: {
      heading:            'YOUR EFOOTBALL™ ACCOUNT',
      playerIdLabel:      'Your eFootball™ Player ID',
      instructionsPrefix: 'In the eFootball™ app go to',
      playerCardLabel:    'Player Profile',
    },
    page: {
      tabs:           ['Top Ups', 'Coin Packs', 'Special Offers'],
      promoTitle:     'WEB EXCLUSIVE: GET BONUS EFOOTBALL COINS',
      promoAction:    'SHOP NOW',
      currencySection: 'eFootball Coins',
    },
  },

  // ── Localised copy overrides, keyed by language code (see ./strings/*) ─────
  translations: { ja, pt, es, ar, 'zh-Hant': zhHant, th, id, ko },

  // ── Imagery ────────────────────────────────────────────────────────────────
  assets: {
    brand: {
      wordmark,         // eFootball™ wordmark (navbar)
      logomark,         // KONAMI / eFootball™ icon (brand)
      signinLogomark,   // eFootball logomark for sign-in button (content/Logomark.svg)
      qrCode: null,     // real QR code webp (TBD)
      coda,
      rating,
      bg,               // full-cover page background art (fixed during scroll)

      // These are referenced by NavBar / SignIn components for the sign-in button icon.
      // Set to logomark until a dedicated nav-sign-in asset is provided.
      navSignInIcon: logomark,
      favicon:       logomark,  // logomark.svg — browser tab icon
    },
    // pc is merged in by useStoreAssets() from the shared PC map (per polarity).
    content: {
      // Single story-carousel hero (16:9 KV). Drives the one-slide carousel.
      storyHero,
      // TODO: add SKU images + banners once campaign art / platform catalog ready.
      avatar: null,
    },
  },

  // Catalogue and featured items pending platform SKU structure confirmation.
  // For filter-mode stores, wire up catalog.js (mirror src/stores/fcm/catalog.js).
  catalog:  null,
  featured: null,
}
