/**
 * METAL GEAR SOLID Δ: SNAKE EATER store module — theme CSS (side-effect import),
 * capability config, user-visible copy, and the imagery registry. Imported only
 * via an active-stores manifest (the @active-stores virtual module, see vite.config.js), so a build that doesn't
 * include this store never pulls its assets, fonts, or theme rules into the bundle.
 *
 * Built from docs/style-guides/mgs-delta/ (style-guide-designer output), itself
 * extracted from the live site konami.com/mg/mgs3r. The store is guest-only
 * (no sign-in) and sells the game EDITIONS and DLC (scraped from the Steam
 * page) across a two-category 'page' catalogue — "Games & Editions" and "DLC".
 * The Digital Deluxe Edition uses the wide HeroSkuCard (cardType 'hero');
 * everything else uses BundleSkuCard (cardType 'bundle', empty items[] = no tiles).
 *
 * Layer decision rule (see web-store-whitelabel skill):
 *   colour / type / surface   → ../../tokens/ds/themes/mgsse.css (imported here)
 *   imagery                   → assets / catalog item art
 *   structural capability     → config
 *   user-visible copy         → strings / catalog item copy
 */

import '@/tokens/ds/themes/mgsse.css'
import { LOCALE_SETS } from '../../locale/sets.js'

// ── Brand ───────────────────────────────────────────────────────────────────
import wordmark from './img/brand/wordmark.png'
// Standalone Δ mark — solid field-green (#009600), cropped from the site logo's
// delta glyph. Used for the browser tab icon and any icon-only brand slot.
import logomark from './img/brand/logomark.svg'

// Coda-platform branding (checkout footer) — market-level, shared across stores.
import coda from '@/shared/brand/coda.svg'

// ── Content ──────────────────────────────────────────────────────────────────
import storyHero     from './img/content/story-hero.jpg'
import snakePortrait from './img/content/snake-portrait.png'
import evaPortrait   from './img/content/eva-portrait.png'
import foxhuntArt    from './img/content/foxhunt-keyart.jpg'

export default {
  key:   'mgsse',
  label: 'METAL GEAR SOLID Δ: SNAKE EATER',

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

    // Calm/stealthy ring on the flagship hero SKU card (HeroSkuCard renders
    // the Digital Deluxe Edition here — cardType:'hero' below) instead of the
    // default spinning comet — see src/tokens/effects.css
    // fx-glow-border--camo-breathe and HeroSkuCard.vue / BestSellerCard.vue's
    // shared capability-flag wiring.
    sku: { heroRingEffect: 'camo-breathe' },

    // 'page' = COD:M-style single-scroll: all catalog categories visible at once.
    // featuredHero:false suppresses App.vue's standalone FCM best-seller hero.
    // page.sections: [] hides all COD:M-specific page sections (currency top-up,
    // gifts, new-user promos) — this store sells editions/DLC only, no virtual
    // currency; catalog renders instead via the catalog-in-page-mode branch.
    catalog: { mode: 'page', featuredHero: false },
    page: { sections: [] },

    checkout: {
      showPoweredByCoda: true,
      showRating:        false,
      loyalty:           null,     // no loyalty programme wired
      allowGuest:        true,
    },

    // Steam-key store — guest checkout only, no sign-in feature.
    navbar: { hideSignIn: true },
    signIn: { flow: 'codm' },       // unused (navbar.hideSignIn), but every flag gets a value

    profile: {
      avatarStyle:             'image',
      playerCard:              'full',
      showLoyaltyPill:         false,
      showAccountInstructions: false,
      showPlayerRank:          false,
      showPlayerAccount:       false,   // no game account to link — selling Steam keys
    },

    chrome: { iconVariant: 'light' },    // light PC logos + social icons for the dark UI

    device: { default: 'none' },     // PC game — open in Responsive frame, not iPhone
  },

  // ── User-visible copy (read via useStoreStrings) ───────────────────────────
  // Voice: measured, third-person, mission-briefing register — see
  // docs/style-guides/mgs-delta/spec.json generic.voice for the full extraction.
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
      name: 'Requisition',   // vestigial — this store has no virtual currency top-up
      abbr: 'RQ',            // SKU (unused: no cp-icon wired, see assets.brand.cpIcon: null)
    },
    checkout: {
      actionLabel: 'Deploy',   // spec.json voice.copyExamples.checkoutCta
    },
    sku: {
      bonusLabel: 'MISSION BONUS',
      bestSeller: 'MOST DEPLOYED',
      bestValue:  'BEST VALUE',
    },
    nav: {
      // Page mode: anchors are section ids (tap → scroll to section).
      groups: [{
        label: 'Store',
        children: [
          { label: 'Games & Editions', anchor: 'cat-games' },
          { label: 'DLC',              anchor: 'cat-dlc' },
        ],
      }],
      items: [{ label: 'Support', anchor: null }],
    },
    signIn: {
      logoAlt:        'METAL GEAR SOLID Δ: SNAKE EATER',
      cta:            'Sign in',
      openingApp:     'Opening METAL GEAR SOLID Δ…',
      qrInstruction:  'Scan this QR code with a mobile device logged into your account',
      pagePrompt:     'Sign in to your account to purchase',
      accountLinkPrompt: 'Link your account to continue',
    },
    account: {
      heading:            'Your Mission Record',
      playerIdLabel:      'Your Operative ID',
      instructionsPrefix: 'In the MGSΔ app go to',
      playerCardLabel:    null,
    },
    // Unused while page.sections: [] — kept for schema completeness only
    // (App.vue gates every one of these behind showSection(), see store.js
    // header comment / plan verification notes). Not live copy.
    page: {
      tabs:                  ['Games & Editions', 'DLC'],
      promoTitle:            'THE BEGINNING OF IT ALL',
      promoAction:           'BEGIN THE MISSION',
      bestSellerDesc:        "Ebisugaoka's — no, Tselinoyarsk's most requested operations.",
      doubleCurrencyHeading: '2x Requisition',
      doubleCurrencyDesc:    'Claim <strong>100%</strong> Bonus on selected supply drops.',
      giftsHeading:          'FIELD SUPPLY',
      giftDailyTitle:        'DAILY SUPPLY DROP',
      giftDailySub:          'Ration Cache',
      giftEmoteTitle:        'CODEC FREQUENCY',
      giftGunTitle:          'FIELD WEAPON CACHE',
      giftLimit:             'Limit:1',
      giftClaimHeading:      'Claim Supply Drop',
      giftClaimLabel:        'You are about to claim',
      giftClaimCta:          'Claim Supply Drop',
      giftClaimDoneCta:      'Close',
      giftClaimedHeading:      'Supply Drop Claimed',
      giftClaimedBody:         'has been sent to your field cache.',
      giftClaimedUpsellIntro:  'Since you command this operation, consider this drop',
      newUsersHeading:       'NEW OPERATIVE BRIEFING',
      newUsersDesc:          'Claim <strong>50%</strong> off your first requisition',
      newUsersSub:           'You may only claim 1 offer from those below',
      currencySection:       'Requisition',
      cpDealsHeading:        'New Operatives',
      cpDealsDesc:           'Claim <strong>50%</strong> off your first Requisition drop',
      cpDealsSub:            'You may only claim 1 offer from those below',
      cpImageSection:        'Requisition',
      cpImageSectionDesc:    'Acquire Requisition to extend your mission reach',
    },
  },

  // ── Localised copy overrides — none yet; falls through to English for every
  // locale until translations are commissioned (see plan: out of scope for v1).
  translations: {},

  // ── Imagery (read via useStoreAssets) ──────────────────────────────────────
  assets: {
    brand: {
      wordmark,
      logomark,
      signinLogomark: logomark,   // unused (sign-in hidden) but wired
      navSignInIcon:  logomark,
      favicon:        logomark,
      qrCode:         null,
      qrPlaceholder:  null,
      coda,
      rating:         null,
      cpIcon:         null,       // no virtual currency
      bg:             null,
      loyaltyIcon:       null,    // no loyalty programme (config.checkout.loyalty is null)
      loyaltyIconColour: null,
    },
    // pc is merged in by useStoreAssets() from the shared PC map (per polarity).
    content: {
      // Single hero slide (storyHero branch — no auto-advance, no heading/CTA).
      storyHero,
      // Legacy banner slots — unused in page mode; null = absent.
      bannerMidnightSun:   null,
      bannerTheBoys:       null,
      cpSkuBanner:         null,
      skuMidnightSunHero:  null,
      bestSellerImage:     null,
      cpCategoryBg:        null,
      // SKU / edition art.
      skuCrate:    snakePortrait,
      skuCodPoint: snakePortrait,
      cpCoins:     null,
      // Unused (no gifting feature — page.sections: []) but wired.
      giftSecretCache: foxhuntArt,
      giftEmote:       evaPortrait,
      giftGun:         foxhuntArt,
      // Player avatar (navbar, account popover) — unused (navbar.hideSignIn).
      avatar: evaPortrait,
    },
  },

  // ── Catalogue (page model) — read via useStoreCatalog ──────────────────────
  // Two categories drive the nav tabs (App.vue derives them from strings.page.tabs).
  // Prices are USD with Steam's live-sale discounts, confirmed 2026 from the
  // Steam store page (store.steampowered.com/app/2417610). Cross-title Master
  // Collection bundles are intentionally excluded — they reference games not
  // sold in this store.
  catalog: [
    {
      id: 'games',
      label: 'Games & Editions',
      subcategories: [
        {
          // Flagship — the wide HeroSkuCard, no heading above it.
          id: 'flagship',
          label: null,
          cardType: 'hero',
          items: [
            {
              eyebrow:         'DIGITAL DELUXE EDITION',
              title:           'METAL GEAR SOLID Δ: SNAKE EATER — Digital Deluxe Edition',
              description:     'The base game plus the Sneaking DLC Pack — cosmetic uniforms, masks, and field equipment.',
              includes:        ['Base Game', 'Sneaking DLC Pack', 'Cosmetic Uniforms & Equipment'],
              image:           storyHero,
              skuImage:        snakePortrait,
              currentPrice:    '$47.99',
              originalPrice:   '$79.99',
              discountPercent: '-40%',
            },
          ],
        },
        {
          id: 'editions',
          label: 'Editions',
          cardType: 'bundle',
          items: [
            {
              bannerImage:     storyHero,
              title:           'METAL GEAR SOLID Δ: SNAKE EATER',
              subtitle:        'The Beginning of it All — the Cold War Crisis that started it all.',
              currentPrice:    '$41.99',
              originalPrice:   '$69.99',
              discountPercent: '-40%',
              skuImage:        snakePortrait,
              items:           [],
            },
          ],
        },
      ],
    },
    {
      id: 'dlc',
      label: 'DLC',
      subcategories: [
        {
          id: 'packs',
          label: 'Packs & Extras',
          cardType: 'bundle',
          items: [
            {
              bannerImage:  foxhuntArt,
              title:        'Sneaking DLC Pack',
              subtitle:     'Cosmetic uniforms, masks, and field equipment for the mission ahead.',
              currentPrice: '$14.99',
              skuImage:     foxhuntArt,
              items:        [],
            },
          ],
        },
      ],
    },
  ],

  featured: null,
}
