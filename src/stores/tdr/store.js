/**
 * Tom Clancy's The Division Resurgence store module — theme CSS (side-effect
 * import), capability config, user-visible copy, and the imagery registry.
 * Imported only via an active-stores manifest (the @active-stores virtual module, see vite.config.js).
 *
 * SCAFFOLD STATUS: fonts, brand imagery, content art, and final marketing copy
 * are PLACEHOLDERS the user will replace later. The palette (theme tokens) and
 * the store wiring are real. Search "PLACEHOLDER" / "TODO" to find swap points.
 *
 * Layer decision rule (see web-store-whitelabel skill):
 *   colour / type / surface   → ../../tokens/ds/themes/tdr.css (imported here)
 *   imagery                   → assets
 *   structural capability     → config
 *   user-visible copy         → strings
 */

import '@/tokens/ds/themes/tdr.css'
import { LOCALE_SETS } from '../../locale/sets.js'

// ── Localised copy (partial overrides of `strings`; en falls through) ──────────
// Phase-1 languages within TDR's locale set: ja, pt, es, ar, zh-Hant, th, id, ko.
import ja     from './strings/ja.js'
import pt     from './strings/pt.js'
import es     from './strings/es.js'
import ar     from './strings/ar.js'
import zhHant from './strings/zh-Hant.js'
import th     from './strings/th.js'
import id     from './strings/id.js'
import ko     from './strings/ko.js'

// ── Brand (PLACEHOLDER marks — replace with real Division assets) ───────────────
import wordmark from './img/brand/Wordmark.webp'
import logomark from './img/brand/Logomark.webp'
import cpIcon   from './img/brand/cp-icon.svg'

// Coda-platform branding (checkout footer) — market-level, shared across stores.
import coda   from '@/shared/brand/coda.svg'

// ── Content ──────────────────────────────────────────────────────────────────────
import sq       from './img/content/placeholder-square.svg'
import tdrSlide from './img/content/Carousel/TDR_EN.webp'
import avatar   from './img/content/avatar.svg'

// ── SKU card background (shared across all Premium Credits cards) ────────────────
import skuBg from './img/content/SKU/SKU BG.webp'

// ── Premium Credits SKU images — filename = denomination ─────────────────────────
import pc60   from './img/content/SKU/Premium Credits/60.webp'
import pc315  from './img/content/SKU/Premium Credits/315.webp'
import pc645  from './img/content/SKU/Premium Credits/645.webp'
import pc1650 from './img/content/SKU/Premium Credits/1650.webp'
import pc3450 from './img/content/SKU/Premium Credits/3450.webp'
import pc7200 from './img/content/SKU/Premium Credits/7200.webp'

export default {
  key:   'tdr',
  label: 'TDR',

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

    // Region/language switcher set — tdr-translate skill (29 languages).
    locale: LOCALE_SETS.tdr,

    skuList: { layout: 'columns' },

    // 'page' = bespoke single-scroll sections (COD:M-style).
    // hideNav — suppresses the bottom CategoryNav (TDR has a single category).
    // sections — allowlist of section IDs to render (omit = show all).
    catalog: { mode: 'page', hideNav: true },
    page: { sections: ['cp-img'] },

    checkout: {
      showPoweredByCoda: true,
      showRating:        false,
      loyalty:           null,     // no loyalty programme wired
      allowGuest:        true,
    },

    // TDR is guest-checkout only — no sign-in feature.
    navbar: { hideSignIn: true },
    signIn: { flow: 'codm' },

    profile: {
      avatarStyle:            'image',
      playerCard:             'full',
      showLoyaltyPill:        false,
      showAccountInstructions: false,
      showPlayerRank:          false,
    },

    chrome: { iconVariant: 'light' }, // light PC logos + social icons for the dark UI
  },

  // ── User-visible copy (read via useStoreStrings) — PLACEHOLDER copy ─────────
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
      name: 'Premium Credits',
      abbr: 'PC',
    },
    checkout: {
      actionLabel: 'Buy Now',
    },
    sku: {
      bonusLabel: 'WEB BONUS',
      bestSeller: 'BEST SELLER',
      bestValue:  'BEST VALUE',
    },
    nav: {
      groups: [{
        label: 'Store',
        children: [
          { label: 'Gifts',   anchor: 'cat-gifts' },
          { label: 'Credits', anchor: 'cat-cp' },
        ],
      }],
      items: [{ label: 'Code Redemption', anchor: null }],
    },
    signIn: {
      logoAlt:        'The Division Resurgence',
      cta:            'Sign in with The Division',
      openingApp:     'Opening The Division Resurgence…',
      qrInstruction:  'Scan this QR code with a mobile device logged into your account',
      pagePrompt:     'Sign in to your account to purchase',
      accountLinkPrompt: 'Link your account to continue',
    },
    account: {
      heading:            'Your Division Resurgence Account',
      playerIdLabel:      'Your Division Resurgence ID',
      instructionsPrefix: 'In The Division Resurgence app go to',
      playerCardLabel:    null,
    },
    page: {
      tabs:                  ['Best Sellers', '2x Credits', 'Gifts', 'New Users', 'Credits'],
      promoTitle:            'WEB EXCLUSIVE: GET 100% BONUS CREDITS + A FREE GIFT',
      promoAction:           'SHOP NOW',
      bestSellerDesc:        'Community favourites — top-rated bundles and agent gear.',
      doubleCurrencyHeading: '2x Credits',
      doubleCurrencyDesc:    'Get <strong>100%</strong> Bonus on selected items. Each item can be purchased only ONCE across the web store and in-game.',
      giftsHeading:          'GIFTS',
      giftDailyTitle:        'DAILY GIFT',
      giftDailySub:          'Field Cache',
      giftEmoteTitle:        'AGENT EMOTE',
      giftGunTitle:          'SHD WEAPON SKIN',
      giftLimit:             'Limit:1',
      giftClaimHeading:      'Claim Gift',
      giftClaimLabel:        'You are about to claim',
      giftClaimCta:          'Claim Gift',
      giftClaimDoneCta:      'Close',
      giftClaimedHeading:      'Gift Claimed',
      giftClaimedBody:         'has been sent to your in-game inbox.',
      giftClaimedUpsellIntro:  'Since you are here, check out this offer just for you',
      newUsersHeading:       'NEW AGENTS PROMO',
      newUsersDesc:          'Get <strong>50%</strong> off your first purchase',
      newUsersSub:           'You may only get 1 item from the items below',
      currencySection:       'Credits',
      cpDealsHeading:        'New Agents',
      cpDealsDesc:           'Get <strong>50%</strong> off your first Credits top-up',
      cpDealsSub:            'You may only get 1 item from the items below',
      cpImageSection:        'Premium Credits',
      cpImageSectionDesc:    'Get 20% discount on your first purchase',
    },
  },

  // ── Localised copy overrides, keyed by language code (see ./strings/*) ─────
  translations: { ja, pt, es, ar, 'zh-Hant': zhHant, th, id, ko },

  // ── Imagery (read via useStoreAssets) — PLACEHOLDER art ─────────────────────
  assets: {
    brand: {
      wordmark,
      logomark,
      signinLogomark: logomark,   // icon inside the sign-in button
      navSignInIcon:  logomark,   // icon inside the navbar SIGN IN button
      favicon:        logomark,
      qrCode:         null,
      qrPlaceholder:  null,
      coda,
      rating:         null,
      cpIcon,
      bg:                null,    // optional page background — none yet
      loyaltyIcon:       null,    // no loyalty programme (config.checkout.loyalty is null)
      loyaltyIconColour: null,
    },
    // pc is merged in by useStoreAssets() from the shared PC map (per polarity).
    content: {
      // Single hero slide (storyHero branch — no auto-advance, no heading/CTA).
      storyHero: tdrSlide,
      // Banners / bundle heroes — PLACEHOLDER, replace with real Division art.
      bannerMidnightSun:   null,
      bannerTheBoys:       null,
      cpSkuBanner:         null,
      skuMidnightSunHero:  null,
      bestSellerImage:     null,
      cpCategoryBg:        null,
      // SKU / currency art — PLACEHOLDER square.
      skuCrate:    sq,
      skuCodPoint: sq,
      cpCoins:     null,          // falls back to skuCodPoint via cpCoinFor()
      // Gifts category art — PLACEHOLDER square.
      giftSecretCache: sq,
      giftEmote:       sq,
      giftGun:         sq,
      // Player avatar (navbar, account popover).
      avatar,
    },
  },

  // 'page' model — no category catalogue / featured carousel data.
  catalog:  null,
  featured: null,

  // Per-store SKU overrides — consumed by useStoreSkus() + App.vue cpImageRegular.
  // Prices are PLACEHOLDER — update with real pricing before launch.
  skus: {
    cpImageRegular: [
      { amount: 125,  baseAmount: 120,  bonusAmount: 5,    currentPrice: '$1.59',  originalPrice: '$1.91',  discountPercent: '-20%', skuImage: pc60,   backgroundImage: skuBg },
      { amount: 315,  baseAmount: 300,  bonusAmount: 15,   currentPrice: '$3.99',  originalPrice: '$4.79',  discountPercent: '-20%', skuImage: pc315,  backgroundImage: skuBg },
      { amount: 645,  baseAmount: 600,  bonusAmount: 45,   currentPrice: '$7.99',  originalPrice: '$9.59',  discountPercent: '-20%', skuImage: pc645,  backgroundImage: skuBg },
      { amount: 1650, baseAmount: 1500, bonusAmount: 150,  currentPrice: '$19.99', originalPrice: '$23.99', discountPercent: '-20%', skuImage: pc1650, backgroundImage: skuBg },
      { amount: 3450, baseAmount: 3000, bonusAmount: 450,  currentPrice: '$39.99', originalPrice: '$47.99', discountPercent: '-20%', skuImage: pc3450, backgroundImage: skuBg },
      { amount: 7200, baseAmount: 6000, bonusAmount: 1200, currentPrice: '$79.99', originalPrice: '$95.99', discountPercent: '-20%', skuImage: pc7200, backgroundImage: skuBg },
    ],
  },
}
