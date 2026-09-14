/**
 * Yu-Gi-Oh! DUEL LINKS store module (publisher: KONAMI) — theme CSS (side-effect
 * import), capability config, user-visible copy, the imagery registry, and the
 * per-store SKU data. Imported only via an active-stores manifest
 * (the @active-stores virtual module, see vite.config.js), so a build that doesn't include YGO:DL never bundles
 * these assets or theme rules.
 *
 * Built from the Coda proposal deck (Coda_Proposal.pptx):
 *   page model = single-scroll sections with the bottom CategoryNav visible
 *     (Regular / Limited / Free Rewards), KONAMI ID (myKONAMI) sign-in, one
 *     weekly free reward, recommendation/discount badges + expiry countdowns.
 *
 * SCAFFOLD STATUS: WIRING-ONLY. The palette (theme tokens), store wiring, copy
 * and pricing are real. The blue tech page background is the real provided
 * asset. The logo / gem icon / SKU art are PLACEHOLDERs to swap later — search
 * "PLACEHOLDER" / `sq` below for the swap points.
 *
 * Layer decision rule (see web-store-whitelabel skill):
 *   colour / type / surface   → ../../tokens/ds/themes/ygodl.css (imported here)
 *   imagery                   → assets
 *   structural capability     → config
 *   user-visible copy         → strings
 *   per-store SKU data        → skus  (consumed by useStoreSkus() + App.vue)
 */

import '@/tokens/ds/themes/ygodl.css'
import { LOCALE_SETS } from '../../locale/sets.js'

// ── Per-language copy overrides (PARTIAL; omitted keys fall back to English) ──
import ja     from './strings/ja.js'
import pt     from './strings/pt.js'
import es     from './strings/es.js'
import ar     from './strings/ar.js'
import zhHant from './strings/zh-Hant.js'
import th     from './strings/th.js'
import id     from './strings/id.js'
import ko     from './strings/ko.js'

// ── Brand ─────────────────────────────────────────────────────────────────────
import logomark from './img/brand/logomark.webp'
import cpIcon   from './img/brand/cp-icon.svg'   // PLACEHOLDER
import bg       from './img/brand/YDL-bg.webp'

// Coda-platform branding (checkout footer) — market-level, shared across stores.
import coda   from '@/shared/brand/coda.svg'

// ── Content ────────────────────────────────────────────────────────────────────
import carouselHero from './img/content/carousel-hero.webp'

// Regular Items
import skuCp52    from './img/content/SKUs/Regular Items/Crystal Pack 52.png'
import skuCp270   from './img/content/SKUs/Regular Items/Crystal Pack 270.png'
import skuCp550   from './img/content/SKUs/Regular Items/Crystal Pack 550.png'
import skuCp1130  from './img/content/SKUs/Regular Items/Crystal Pack 1130.png'
import skuCp2310  from './img/content/SKUs/Regular Items/Crystal Pack 2310.png'
import skuCp6040  from './img/content/SKUs/Regular Items/Crystal Pack 6040.png'
import skuCp12080 from './img/content/SKUs/Regular Items/Crystal Pack 12080.png'
import skuCp750   from './img/content/SKUs/Regular Items/Crystal Pack Deal 750.png'
import skuCp1500  from './img/content/SKUs/Regular Items/Crystal Pack Deal 1500.png'

// Limited Items
import skuBanner         from './img/content/SKUs/Limited Items/SKU Banner.webp'
import skuMonthlyA       from './img/content/SKUs/Limited Items/Monthly Crystal Pack A.png'
import skuMonthlyB       from './img/content/SKUs/Limited Items/Monthly Crystal Pack B.png'
import skuMonthlyC       from './img/content/SKUs/Limited Items/Monthly Crystal Pack C.png'
import skuStarterVeiler  from './img/content/SKUs/Limited Items/Starter Set UR "Effect Veiler" Bundle.png'
import skuStarterDroplet from './img/content/SKUs/Limited Items/Starter Set UR "Forbidden Droplet" Bundle.png'
import skuStarterNibiru  from './img/content/SKUs/Limited Items/Starter Set UR "Nibiru, the Primal Being" Bundle.png'
import dlCrystal   from './img/content/SKUs/Limited Items/DL_Crystal.webp'
import cardVeiler   from './img/content/SKUs/Limited Items/Cards/EffectVeiler.webp'
import cardDroplet  from './img/content/SKUs/Limited Items/Cards/ForbiddenDroplet.webp'
import cardNibiru   from './img/content/SKUs/Limited Items/Cards/NibiruthePrimalBeing.webp'

import sq     from './img/content/placeholder-square.svg'  // PLACEHOLDER — gift + bundle items
import avatar from './img/content/avatar.svg'

export default {
  key:   'ygodl',
  label: 'Yu-Gi-Oh! DUEL LINKS',

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

    // 'page' = single-scroll bespoke sections. hideNav is omitted → the bottom
    // CategoryNav is VISIBLE and scroll-spies the three sections below.
    catalog: { mode: 'page' },
    page: { sections: ['regular', 'limited', 'free-rewards'] },

    // Full-cover page background image, fixed to the viewport during scroll.
    // App.vue injects --page-bg-image from assets.brand.bg; ygodl.css applies it
    // to .device__screen via the html[data-theme] override.
    background: { style: 'fixed-image' },

    checkout: {
      showPoweredByCoda: true,
      showRating:        false,
      loyalty:           null,     // no loyalty/points programme
      allowGuest:        false,    // must sign in (KONAMI ID) → page sign-in section
    },

    // KONAMI ID (myKONAMI) sign-in only — reuses the eFootball myKONAMI flow.
    signIn: {
      desktop: ['mykonami'],
      mobile:  ['mykonami'],
    },

    // Navbar SIGN IN button suppressed — sign-in lives in the page section
    // (matches the proposal mockup: black header with just the wordmark + menu).
    navbar: { hideSignIn: true },

    profile: {
      avatarStyle:     'image',
      playerCard:      'nickname-only', // KONAMI ID surfaces the display name only
      showLoyaltyPill: false,
    },

    chrome: { iconVariant: 'light' },      // light PC logos + social icons for the dark UI
  },

  // ── User-visible copy (read via useStoreStrings) ────────────────────────────
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
      name: 'Crystals',
      abbr: 'Crystals',
    },
    checkout: {
      actionLabel: 'Buy Now',
    },
    sku: {
      bonusLabel:      'Free',
      bestSeller:      'RECOMMENDED',
      bestValue:       'BEST VALUE',
      bonusTag:        'BONUS',
      webExclusiveTag: 'WEB STORE EXCLUSIVE',
    },
    nav: {
      groups: [{
        label: 'Store',
        children: [
          { label: 'Regular',      anchor: 'cat-regular' },
          { label: 'Limited',      anchor: 'cat-limited' },
          { label: 'Free Rewards', anchor: 'cat-free-rewards' },
        ],
      }],
      items: [],
    },
    signIn: {
      logoAlt:           'Yu-Gi-Oh! DUEL LINKS',
      pagePrompt:        'Sign in to purchase',
      accountLinkPrompt: 'How to link your game account with your KONAMI ID',

      // myKONAMI web-redirect flow (KONAMI ID).
      mykonami: {
        cta:        'KONAMI ID Sign In',
        pagePrompt: 'Sign in to your KONAMI ID account to purchase',
        openingApp: 'Opening KONAMI ID…',
      },
    },
    account: {
      heading:            'YOUR KONAMI ID ACCOUNT',
      playerIdLabel:      'Your Player ID',
      instructionsPrefix: 'In the Yu-Gi-Oh! DUEL LINKS app go to',
      playerCardLabel:    'Player Profile',
    },
    page: {
      // Bottom CategoryNav tabs — zipped 1:1 with config.page.sections in App.vue.
      tabs:           ['Regular', 'Limited', 'Free Rewards'],
      promoTitle:     'WEB STORE EXCLUSIVE',
      promoAction:    'SHOP NOW',
      currencySection: 'Crystals',

      // Section headings (YGO:DL page sections).
      regularHeading: 'Crystal Packs',
      limitedHeading: 'Limited Offers',
      giftsHeading:   'Free Rewards',

      // Free-rewards gift card chrome (GiftSkuCard, via App.vue rewardGifts).
      // The "Limit: 1" label comes from useLocale().common.sku.limitLabel.
      giftTagLabel:       'FREE GIFT',
      giftTitle:          'WEEKLY GIFT',
      giftSubtitle:       'Available once per week',
      giftCta:            'Claim',
      giftEndsLabel:      'Refreshes in:',
      giftRefreshesLabel: 'Refreshes:',

      // Gift claim sheet copy (useGiftClaim / ClaimGiftSheet).
      giftClaimHeading:       'Claim Reward',
      giftClaimLabel:         'You are about to claim',
      giftClaimCta:           'Claim Reward',
      giftClaimDoneCta:       'Close',
      giftClaimedHeading:     'Reward Claimed',
      giftClaimedBody:        'has been sent to your in-game inbox.',
      giftClaimedUpsellIntro: 'Since you are here, check out this offer just for you',
    },
  },

  // ── Per-language overrides of `strings` (Codashop fallback locale set) ──────
  translations: { ja, pt, es, ar, 'zh-Hant': zhHant, th, id, ko },

  // ── Imagery (read via useStoreAssets) — PLACEHOLDER art except bg ───────────
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
      rating:         null,
      cpIcon,
      bg,                         // REAL — fixed blue tech page background
      loyaltyIcon:       null,    // no loyalty programme (config.checkout.loyalty is null)
      loyaltyIconColour: null,
    },
    // pc is merged in by useStoreAssets() from the shared PC map (per polarity).
    content: {
      // Single hero slide (storyHero branch — no auto-advance / heading / CTA).
      storyHero: carouselHero,
      // COD:M-only banners / hero art (sections hidden for YGO:DL) — absent.
      bannerMidnightSun:  null,
      bannerTheBoys:      null,
      cpSkuBanner:        null,
      skuMidnightSunHero: null,
      bestSellerImage:    null,
      cpCategoryBg:       null,
      slideKuiJiPortrait:    null,
      slideKuiJiLandscape:   null,
      slideTheBoysPortrait:  null,
      slideTheBoysLandscape: null,
      // SKU / currency art — PLACEHOLDER square.
      skuCrate:    sq,
      skuCodPoint: sq,
      cpCoins:     null,          // falls back to skuCodPoint via cpCoinFor()
      // Gifts art — PLACEHOLDER square.
      giftSecretCache: sq,
      giftEmote:       sq,
      giftGun:         sq,
      // Player avatar (navbar, account popover).
      avatar,
    },
  },

  // 'page' model — no category-tree catalogue / featured carousel data.
  catalog:  null,
  featured: null,

  // ── Per-store SKU data (consumed by useStoreSkus() + App.vue) ───────────────
  // Pricing/copy from the proposal deck. Art is PLACEHOLDER (sq). Countdowns use
  // a relative `endsInMs` offset that App.vue converts to an absolute endsAt.
  skus: {
    // Regular items — web-exclusive deals first, then plain Crystal Packs.
    // UI chrome is NOT baked in here: bonusLabel comes from strings.sku.bonusLabel,
    // `tagKey` names a strings.sku key resolved in App.vue, and `limited: true`
    // pulls the shared "Limit: 1" subtitle — all localise with the language switch.
    regular: [
      { amount: 750,   baseAmount: 500,   bonusAmount: 250,  currentPrice: '$8.19',   skuImage: skuCp750,   tagKey: 'webExclusiveTag', limited: true },
      { amount: 1500,  baseAmount: 1000,  bonusAmount: 500,  currentPrice: '$16.49',  skuImage: skuCp1500,  tagKey: 'webExclusiveTag', limited: true },
      { amount: 52,    baseAmount: 50,    bonusAmount: 2,    currentPrice: '$0.89',   skuImage: skuCp52 },
      { amount: 270,   baseAmount: 250,   bonusAmount: 20,   currentPrice: '$4.09',   skuImage: skuCp270 },
      { amount: 550,   baseAmount: 500,   bonusAmount: 50,   currentPrice: '$8.19',   skuImage: skuCp550 },
      { amount: 1130,  baseAmount: 1000,  bonusAmount: 130,  currentPrice: '$16.49',  skuImage: skuCp1130 },
      { amount: 2310,  baseAmount: 2000,  bonusAmount: 310,  currentPrice: '$32.99',  skuImage: skuCp2310 },
      { amount: 6040,  baseAmount: 5000,  bonusAmount: 1040, currentPrice: '$81.99',  skuImage: skuCp6040 },
      { amount: 12080, baseAmount: 10000, bonusAmount: 2080, currentPrice: '$163.98', skuImage: skuCp12080, tagKey: 'bestValue' },
    ],

    // Limited items — Monthly Crystal Packs + Starter Set bundles.
    limited: [
      {
        id:           'monthly-crystal-pack-a',
        title:        'Monthly Crystal Pack A',
        currentPrice: '$81.99',
        bannerImage:  skuBanner,
        skuImage:     skuMonthlyA,
        skuOnBanner:  true,
        endsInMs:     null,
        breakdownScrollable: true,
        items: [
          { image: dlCrystal, tileBg: 'var(--x-rarity-gradient-legendary)', quantity: 5000 },
          { quantity: 300 },
          { quantity: 1 }, { quantity: 1 }, { quantity: 1 }, { quantity: 1 },
          { quantity: 1 }, { quantity: 1 },
        ],
      },
      {
        id:           'monthly-crystal-pack-b',
        title:        'Monthly Crystal Pack B',
        currentPrice: '$40.99',
        bannerImage:  skuBanner,
        skuImage:     skuMonthlyB,
        skuOnBanner:  true,
        endsInMs:     null,
        items: [
          { image: dlCrystal, tileBg: 'var(--x-rarity-gradient-legendary)', quantity: 2500 },
          { quantity: 300 }, { quantity: 1 }, { quantity: 1 },
        ],
      },
      {
        id:           'monthly-crystal-pack-c',
        title:        'Monthly Crystal Pack C',
        currentPrice: '$40.99',
        bannerImage:  skuBanner,
        skuImage:     skuMonthlyC,
        skuOnBanner:  true,
        endsInMs:     null,
        items: [
          { image: dlCrystal, tileBg: 'var(--x-rarity-gradient-legendary)', quantity: 2500 },
          { quantity: 300 }, { quantity: 1 }, { quantity: 1 },
        ],
      },
      {
        id:           'starter-effect-veiler',
        title:        'Starter Set: UR "Effect Veiler" Bundle',
        currentPrice: '$8.19',
        bannerImage:  skuBanner,
        skuImage:     skuStarterVeiler,
        skuOnBanner:  true,
        endsInMs:     296 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000 + 43 * 60 * 1000,
        items: [
          { image: dlCrystal, tileBg: 'var(--x-rarity-gradient-legendary)', quantity: 500 },
          { image: cardVeiler,  tag: { labelKey: 'bonusTag', variant: 'bonus' }, quantity: 1 },
        ],
      },
      {
        id:           'starter-forbidden-droplet',
        title:        'Starter Set: UR "Forbidden Droplet" Bundle',
        currentPrice: '$8.19',
        bannerImage:  skuBanner,
        skuImage:     skuStarterDroplet,
        skuOnBanner:  true,
        endsInMs:     295 * 24 * 60 * 60 * 1000 + 24 * 60 * 1000,
        items: [
          { image: dlCrystal,   tileBg: 'var(--x-rarity-gradient-legendary)', quantity: 500 },
          { image: cardDroplet, tag: { labelKey: 'bonusTag', variant: 'bonus' }, quantity: 1 },
        ],
      },
      {
        id:           'starter-nibiru',
        title:        'Starter Set: UR "Nibiru, the Primal Being" Bundle',
        currentPrice: '$8.19',
        bannerImage:  skuBanner,
        skuImage:     skuStarterNibiru,
        skuOnBanner:  true,
        endsInMs:     null,
        items: [
          { image: dlCrystal,  tileBg: 'var(--x-rarity-gradient-legendary)', quantity: 500 },
          { image: cardNibiru, tag: { labelKey: 'bonusTag', variant: 'bonus' }, quantity: 1 },
        ],
      },
    ],

    // Free rewards — one weekly gift (refreshes every Monday → refreshes-on-claim).
    // All card chrome (tag / title / subtitle / limit / CTA / countdown labels)
    // comes from strings.page.gift* + common.sku.limitLabel via App.vue, so it
    // localises with the language switch.
    gift: [
      {
        id:               'gift-weekly',
        image:            sq,
        endsInMs:         7 * 24 * 60 * 60 * 1000,
        refreshesOnClaim: true,
      },
    ],
  },
}
