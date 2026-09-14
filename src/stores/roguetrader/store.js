/**
 * Warhammer 40,000: Rogue Trader store module — theme CSS (side-effect import),
 * capability config, user-visible copy, and the imagery registry. Imported only
 * via an active-stores manifest (the @active-stores virtual module, see vite.config.js), so a build that doesn't
 * include this store never pulls its assets, fonts, or theme rules into the bundle.
 *
 * Built from docs/style-guides/roguetrader/ (style-guide-designer output), itself
 * extracted from the live site roguetrader.owlcat.games. The store is guest-only
 * (no sign-in) and sells the game EDITIONS and DLC keys (scraped from the Steam
 * page) across a two-category 'filter' catalogue — "Games & Editions" and "DLC".
 * The flagship Voidfarer Edition uses the wide HeroSkuCard (cardType 'hero');
 * everything else uses BundleSkuCard (cardType 'bundle', empty items[] = no tiles).
 *
 * Layer decision rule (see web-store-whitelabel skill):
 *   colour / type / surface   → ../../tokens/ds/themes/roguetrader.css (imported here)
 *   imagery                   → assets / catalog item art
 *   structural capability     → config
 *   user-visible copy         → strings / catalog item copy
 */

import '@/tokens/ds/themes/roguetrader.css'
import { LOCALE_SETS } from '../../locale/sets.js'

// ── Localised copy (partial overrides of `strings`; en falls through) ──────────
import ja     from './strings/ja.js'
import pt     from './strings/pt.js'
import es     from './strings/es.js'
import ar     from './strings/ar.js'
import zhHant from './strings/zh-Hant.js'
import th     from './strings/th.js'
import id     from './strings/id.js'
import ko     from './strings/ko.js'

// ── Brand ───────────────────────────────────────────────────────────────────
import wordmark from './img/brand/wordmark.png'
import logomark from './img/brand/logomark.png'
import cpIcon   from './img/brand/cp-icon.svg'

// Coda-platform branding (checkout footer) — market-level, shared across stores.
import coda from '@/shared/brand/coda.svg'

// ── Content ──────────────────────────────────────────────────────────────────
import storyHero     from './img/content/story-hero.jpg'
import avatar        from './img/content/avatar.svg'
import profitFactor  from './img/content/profit-factor.svg'
import warpOrb       from './img/content/warp-orb.png'
import placeholder   from './img/content/placeholder.svg'
import relics        from './img/content/relics.png'
import editionBanner from './img/content/edition-banner.svg'
import dlcBanner     from './img/content/dlc-banner.svg'

export default {
  key:   'roguetrader',
  label: 'Warhammer 40K: Rogue Trader',

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

    // 'page' = COD:M-style single-scroll: all catalog categories visible at once.
    // featuredHero:false suppresses App.vue's standalone FCM best-seller hero.
    // page.sections: [] hides all COD:M-specific page sections; catalog renders
    // instead via the catalog-in-page-mode branch in App.vue.
    catalog: { mode: 'page', featuredHero: false },
    page: { sections: [] },

    checkout: {
      showPoweredByCoda: true,
      showRating:        false,
      loyalty:           null,     // no loyalty programme wired
      allowGuest:        true,
    },

    // Rogue Trader is guest-checkout only — no sign-in feature.
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
      name: 'Profit Factor',
      abbr: 'PF',
    },
    checkout: {
      actionLabel: 'Acquire',
    },
    sku: {
      bonusLabel: 'WARRANT BONUS',
      bestSeller: 'MOST FAVOURED',
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
      items: [{ label: 'Code Redemption', anchor: null }],
    },
    signIn: {
      logoAlt:        'Warhammer 40,000: Rogue Trader',
      cta:            'Sign in',
      openingApp:     'Opening Rogue Trader…',
      qrInstruction:  'Scan this QR code with a mobile device logged into your account',
      pagePrompt:     'Sign in to your account to purchase',
      accountLinkPrompt: 'Link your account to continue',
    },
    account: {
      heading:            'Your Rogue Trader Warrant',
      playerIdLabel:      'Your Rogue Trader ID',
      instructionsPrefix: 'In the Rogue Trader app go to',
      playerCardLabel:    null,
    },
    page: {
      tabs:                  ['Games & Editions', 'DLC'],
      promoTitle:            'WARRANT OF TRADE: ACQUIRE THE VOIDFARER EDITION',
      promoAction:           'SHOP NOW',
      bestSellerDesc:        'The Expanse’s most coveted editions and warrant supplies.',
      doubleCurrencyHeading: '2x Profit Factor',
      doubleCurrencyDesc:    'Claim <strong>100%</strong> Bonus on selected warrants.',
      giftsHeading:          'TRIBUTE',
      giftDailyTitle:        'DAILY TRIBUTE',
      giftDailySub:          'Relic Cache',
      giftEmoteTitle:        'VOID-BORN INSIGNIA',
      giftGunTitle:          'RELIC BOLT WEAPON',
      giftLimit:             'Limit:1',
      giftClaimHeading:      'Claim Tribute',
      giftClaimLabel:        'You are about to claim',
      giftClaimCta:          'Claim Tribute',
      giftClaimDoneCta:      'Close',
      giftClaimedHeading:      'Tribute Claimed',
      giftClaimedBody:         'has been sent to your in-game vault.',
      giftClaimedUpsellIntro:  'Since you command this bridge, consider this warrant',
      newUsersHeading:       'NEW VOIDFARERS WARRANT',
      newUsersDesc:          'Claim <strong>50%</strong> off your first acquisition',
      newUsersSub:           'You may only claim 1 warrant from those below',
      currencySection:       'Profit Factor',
      cpDealsHeading:        'New Voidfarers',
      cpDealsDesc:           'Claim <strong>50%</strong> off your first Profit Factor warrant',
      cpDealsSub:            'You may only claim 1 warrant from those below',
      cpImageSection:        'Profit Factor',
      cpImageSectionDesc:    'Acquire Profit Factor to extend your dynasty’s reach',
    },
  },

  // ── Localised copy overrides, keyed by language code (see ./strings/*) ─────
  translations: { ja, pt, es, ar, 'zh-Hant': zhHant, th, id, ko },

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
      cpIcon,                     // gold Profit Factor coin
      bg:                null,
      loyaltyIcon:       null,    // no loyalty programme (config.checkout.loyalty is null)
      loyaltyIconColour: null,
    },
    // pc is merged in by useStoreAssets() from the shared PC map (per polarity).
    content: {
      // Single hero slide (storyHero branch — no auto-advance, no heading/CTA).
      storyHero,
      // Legacy banner slots — unused in filter mode; null = absent.
      bannerMidnightSun:   null,
      bannerTheBoys:       null,
      cpSkuBanner:         null,
      skuMidnightSunHero:  null,
      bestSellerImage:     null,
      cpCategoryBg:        null,
      // SKU / currency art.
      skuCrate:    profitFactor,
      skuCodPoint: profitFactor,
      cpCoins:     null,
      // Tribute (gifts) category art — unused in filter mode but wired.
      giftSecretCache: warpOrb,
      giftEmote:       placeholder,
      giftGun:         placeholder,
      // Player avatar (navbar, account popover).
      avatar,
    },
  },

  // ── Catalogue (filter model) — read via useStoreCatalog ────────────────────
  // Two categories drive the nav tabs (App.vue derives them from these labels).
  // Prices are USD with Steam's live-sale discounts; "Free"/full-price items pass
  // originalPrice/discountPercent: null.
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
              eyebrow:         'ULTIMATE EDITION',
              title:           'Voidfarer Edition',
              description:     'The complete warrant — base game, every pack, and the Season Pass.',
              includes:        ['Base Game', 'Deluxe Pack', 'Voidfarer Pack', 'Season Pass'],
              image:           storyHero,
              skuImage:        profitFactor,
              currentPrice:    '$44.50',
              originalPrice:   '$113.75',
              discountPercent: '-61%',
            },
          ],
        },
        {
          id: 'editions',
          label: 'Editions',
          cardType: 'bundle',
          items: [
            {
              bannerImage:     editionBanner,
              title:           'Rogue Trader',
              subtitle:        'Command your dynasty across the Koronus Expanse.',
              currentPrice:    '$23.60',
              originalPrice:   '$59.00',
              discountPercent: '-60%',
              skuImage:        profitFactor,
              items:           [],
            },
            {
              bannerImage:     editionBanner,
              title:           'Deluxe Edition',
              subtitle:        'Base game plus the Deluxe Pack of void-craft cosmetics and goodies.',
              currentPrice:    '$28.67',
              originalPrice:   '$73.50',
              discountPercent: '-61%',
              skuImage:        profitFactor,
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
          id: 'expansions',
          label: 'Story Expansions & Passes',
          cardType: 'bundle',
          items: [
            {
              bannerImage:  dlcBanner,
              title:        'Season Pass 2',
              subtitle:     'Two further story expansions — newly chartered.',
              currentPrice: '$34.99',
              skuImage:     profitFactor,
              items:        [],
            },
            {
              bannerImage:     dlcBanner,
              title:           'Season Pass',
              subtitle:        'Two major story expansions for your voyage.',
              currentPrice:    '$14.00',
              originalPrice:   '$34.99',
              discountPercent: '-60%',
              skuImage:        profitFactor,
              items:           [],
            },
            {
              bannerImage:  dlcBanner,
              title:        'The Infinite Museion',
              subtitle:     'Breach Trazyn’s vault and bend his designs to your dynasty.',
              currentPrice: '$12.99',
              skuImage:     profitFactor,
              items:        [],
            },
            {
              bannerImage:     relics,
              title:           'Lex Imperialis',
              subtitle:        'The Adeptus Arbites arrive — a new companion and ~15 hours of intrigue.',
              currentPrice:    '$9.09',
              originalPrice:   '$12.99',
              discountPercent: '-30%',
              skuImage:        profitFactor,
              items:           [],
            },
            {
              bannerImage:     dlcBanner,
              title:           'Void Shadows',
              subtitle:        'A genestealer cult festers aboard — a new romanceable companion.',
              currentPrice:    '$7.79',
              originalPrice:   '$12.99',
              discountPercent: '-40%',
              skuImage:        profitFactor,
              items:           [],
            },
          ],
        },
        {
          id: 'packs',
          label: 'Packs & Extras',
          cardType: 'bundle',
          items: [
            {
              bannerImage:     dlcBanner,
              title:           'Deluxe Pack',
              subtitle:        'Cosmetic gear and digital goodies for the Expanse.',
              currentPrice:    '$5.07',
              originalPrice:   '$14.50',
              discountPercent: '-65%',
              skuImage:        profitFactor,
              items:           [],
            },
            {
              bannerImage:     dlcBanner,
              title:           'Voidfarer Pack',
              subtitle:        'Additional in-game items for the long voyage.',
              currentPrice:    '$1.83',
              originalPrice:   '$5.25',
              discountPercent: '-65%',
              skuImage:        profitFactor,
              items:           [],
            },
            {
              bannerImage:  dlcBanner,
              title:        'Appearance Pack',
              subtitle:     'Four hairstyles and a unique augmetic for your Lord Captain.',
              currentPrice: '$4.99',
              skuImage:     profitFactor,
              items:        [],
            },
            {
              bannerImage:  relics,
              title:        'The Shovel DLC',
              subtitle:     'The Sapper Shovel from Darktide — wield it with grim purpose.',
              currentPrice: 'Free',
              skuImage:     profitFactor,
              items:        [],
            },
            {
              bannerImage:     dlcBanner,
              title:           'The Darkest Grimdark Bundle',
              subtitle:        'Rogue Trader + Darkest Dungeon — two grimdark voyages, one warrant.',
              currentPrice:    '$24.54',
              originalPrice:   '$61.99',
              discountPercent: '-67%',
              skuImage:        profitFactor,
              items:           [],
            },
          ],
        },
      ],
    },
  ],

  featured: null,
}
