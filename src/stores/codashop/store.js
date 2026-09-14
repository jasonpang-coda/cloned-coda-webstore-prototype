/**
 * Codashop store module — theme CSS (side-effect import), capability config,
 * user-visible copy, and the imagery registry. Imported only via an
 * active-stores manifest (the @active-stores virtual module, see vite.config.js), so a build that doesn't
 * include Codashop never bundles these images, fonts, or theme rules.
 *
 * SCAFFOLD — placeholder Mobile Legends: Bang Bang catalog (per the Figma
 * reference, node 2189:2729), built to exercise the new two-column split
 * layout and inline checkout capabilities. Every image below is a generic
 * placeholder (see ./img/README.md) and no real MLBB assets are shipped.
 *
 * Phase-0 decisions:
 *   catalog model → 'page' (bespoke single-scroll page, mirrors COD:M — the
 *                   Figma reference is one product page, not a filterable
 *                   multi-category catalogue)
 *   page layout   → 'split' (4-col left rail / 8-col right rail at M/L —
 *                   see src/App.vue and src/components/Span.vue)
 *   checkout      → 'inline' page-step cards, not the overlay CheckoutSheet
 *                   (see src/components/checkout/*, src/composables/useCheckout.js)
 *   auth model    → guest Gamer ID lookup (no sign-in) — matches the Figma's
 *                   "Enter Gamer ID" step, which has no sign-in affordance
 *   currency      → in-game "CP" diamonds (MLBB naming), reusing the CP
 *                   currency shape already used by COD:M
 *   device        → 'none' (desktop-first — the split layout is invisible in
 *                   the framed phone devices, which are permanently XS)
 *
 * Layer decision rule (see web-store-whitelabel skill):
 *   colour / type / surface   → ../../tokens/ds/themes/codashop.css (imported here)
 *   imagery                   → assets
 *   structural capability     → config
 *   user-visible copy         → strings
 */

import '@/tokens/ds/themes/codashop.css'
import { LOCALE_SETS } from '../../locale/sets.js'

// ── Brand — real logo (user-supplied, see img/ref/) ─────────────────────────
// The new Codashop wordmark, dropped into img/ref/ alongside the homepage's
// title/banner art. Replaces the earlier codashop-logomark.svg placeholder as
// both the navbar wordmark AND the sign-in logomark — see assets.brand below.
import codashopLogo from './img/ref/imgi_1_codashop-logo-new-3a.png'
import codashopLogomark from './img/brand/codashop-logomark.svg'
import cpIcon   from './img/brand/cp-icon-placeholder.svg'

// Coda-platform branding (checkout footer) — market-level, shared across stores.
import coda   from '@/shared/brand/coda.svg'
import rating from '@/shared/brand/rating.svg'

// ── Content — PLACEHOLDER art ────────────────────────────────────────────────
import placeholderSquare from './img/content/placeholder-square.svg'
import identityThumb     from './img/content/identity-thumb.jpg'

// Real publisher logos (provided directly, not placeholders) for TrustBar's
// "Officially partnered" card — see img/README.md for provenance. Only 4 of
// the 8 names in a hypothetical full roster have real assets; the rotator
// shows exactly these 2 pairs rather than inventing logos for more.
// pubgMobile is a near-black mark (#050000) — TrustBar backs every logo with
// a small light tile (not a bare image on the dark panel) so it stays legible
// regardless of the source logo's own colour.
import mobileLegendsLogo from './img/content/publishers/mobile-legends.png'
import pubgMobileLogo    from './img/content/publishers/pubg-mobile.svg'
import genshinLogo       from './img/content/publishers/genshin-impact.svg'
import freeFireLogo      from './img/content/publishers/free-fire.svg'

// Publisher Spotlight (Home Blob variant) — real HoYoverse key art, dropped
// into img/content/spotlight/.
import hoyoverseLogo     from './img/content/spotlight/HoYoverse.svg'
import spotlightGenshin  from './img/content/spotlight/GI.webp'
import spotlightHsr      from './img/content/spotlight/HSR.webp'
import spotlightZzz      from './img/content/spotlight/ZZZ.webp'

// Highlighted Titles "ALL" curated set (Home Blob variant) — real key art,
// dropped into img/content/highlights/.
import highlightMlbb     from './img/content/highlights/MLBB.webp'
import highlightFreeFire from './img/content/highlights/FF.webp'
import highlightLol      from './img/content/highlights/LoL.webp'
import highlightFcm      from './img/content/highlights/FCM.webp'

// ── Homepage (config.home) — real reference art, user-supplied ─────────────
// Codashop's title-listing aggregator homepage. Every image below is real
// Codashop tile/banner/icon art dropped into img/ref/ (NOT placeholders like
// the rest of this scaffold store) — square title tiles, landscape hero
// banners, and the "how it works" feature icons. Titles are Codashop's own
// SG catalogue (see home.categories below), not the other prototype
// whitelabel stores — those are a different surface, not "titles Codashop
// sells." Only Mobile Legends has a full product page in this prototype
// (the existing scaffold below); every title card routes there as the
// representative "title detail" view.
import heroEafcmPromo   from './img/ref/imgi_2_EN-EAFCM-SEA-PromoCode-730x382.jpg'
import heroR6mPromo     from './img/ref/imgi_3_EN-R6M-SilentDescent-720x280.jpg'
import heroEafcChamps   from './img/ref/imgi_4_EA_FCM_Champions_2026_EN_730x382.png'
import heroEafcOct      from './img/ref/imgi_50_EA_FC_Oct_2025.png'

import tileMlbb         from './img/ref/imgi_19_MLBB-2025-tiles-178x178.jpg'
import tileMcgg         from './img/ref/imgi_25_NEWmcgg.png'
import tileGenshin      from './img/ref/imgi_20_genshinimpact_tile.jpg'
import tileHsr          from './img/ref/imgi_23_hsr_tile.jpg'
import tileValorant     from './img/ref/imgi_47_valorant_tile.jpg'
import tileLol          from './img/ref/imgi_48_LOL_tile.jpg'
import tileTft          from './img/ref/imgi_49_TeamFightTactics_178x178.jpg'
import tileEafcm        from './img/ref/imgi_18_EAFCMTile.jpg'
import tilePubgm        from './img/ref/imgi_15_pubgm_tile_aug2024.jpg'
import tileFreeFire     from './img/ref/imgi_58_free_fire_new_tile.png'
import tileFreeFireMax  from './img/ref/imgi_59_ffmax_tile.png'
import tileHonorOfKings from './img/ref/imgi_41_Honor-of-Kings-Tile.png'
import tileLoveDeepspace from './img/ref/imgi_21_love_and_deepspace_tile_178x178.jpg'
import tileOpm          from './img/ref/imgi_22_opm_new2_tile.png'
import tileWildRift     from './img/ref/imgi_51_Wildrift_APPICON_iOS_1024px.png'
import tileRainbowSix   from './img/ref/imgi_16_EN-RB6-tile-178x178.png'
import tileAfkJourney   from './img/ref/imgi_27_watcher_of_realms_tile.png'

import tileGrowtopia    from './img/ref/imgi_29_growtopia_tile.png'
import tileMapleStoryM  from './img/ref/imgi_32_Nexon_Maplestory_M_178_x178.png'
import tileDragonRaja   from './img/ref/imgi_31_dragonraja_tile.png'
import tileDragonNestM  from './img/ref/imgi_30_DragonNestM.png'
import tileWestward     from './img/ref/imgi_33_westward-tile.png'
import tileBeTheKing    from './img/ref/imgi_34_betheking_tile.png'
import tileRevelation   from './img/ref/imgi_52_vng_revalation_tile.png'
import tileMuOrigin     from './img/ref/imgi_36_mu_origin_tile.jpg'
import tileMinecraft    from './img/ref/imgi_57_-Minecraft_178x178.jpg'

import tileZepeto       from './img/ref/imgi_35_zepeto_tile.png'
import tileChamet       from './img/ref/imgi_24_chamet_tile.png'
import tileKumu         from './img/ref/imgi_26_kumu_tile.jpg'
import tileBigoLive     from './img/ref/imgi_40_bigo_live_tile.jpg'
import tileYallaLudo    from './img/ref/imgi_38_YallaLudo_178x178 (1).png'
import tileYallaLive    from './img/ref/imgi_55_yallalive_tile.png'
import tileHeeSay       from './img/ref/imgi_54_HeeSayTileImage.png'
import tileTinder       from './img/ref/imgi_43_tinder_tile.jpg'
import tileBilibili     from './img/ref/imgi_45_Bilibili_tile_178x178.jpg'

import tileSteamWallet  from './img/ref/imgi_39_steam_tile.jpg'
import tileNintendoEshop from './img/ref/imgi_37_nintendoeshop_tile.jpg'
import tilePsnStore     from './img/ref/imgi_42_psn_store_tile.jpg'

import tileTwoPointCampus from './img/ref/imgi_56_TwoPointCampus_tile_178x178.jpg'
import tileMetaphor     from './img/ref/imgi_60_Metaphor_Tile_image.png'

import portalEasyFast   from './img/ref/imgi_67_easy_and_fast_portal.png'
import portalInstant    from './img/ref/imgi_68_instant_delivery_portal.png'
import portalPayment    from './img/ref/imgi_69_payment_method_portal.png'
import portalSupport    from './img/ref/imgi_70_customer_support_portal.png'
import portalPromotion  from './img/ref/imgi_71_promotion_portal.png'

import homeSocialFacebook  from './img/ref/imgi_73_socmed-facebook-H36.png'
import homeSocialInstagram from './img/ref/imgi_74_socmed-instagram-H36.png'
import homeSocialTiktok    from './img/ref/imgi_75_socmed-tiktok-H36.png'

export default {
  key:   'codashop',
  label: 'Codashop',

  // ── Structural capabilities (read via useStoreConfig) ──────────────────────
  config: {
    footer: {
      supportUrl: '#',
      social: { x: '#', facebook: '#', instagram: '#', youtube: '#', tiktok: '#', discord: '#' },
    },

    locale: LOCALE_SETS.codashop,

    // Two-column split at M/L (see src/App.vue). Every other store omits this
    // flag entirely, so they keep today's single-column behaviour untouched.
    // sections: the Figma reference's "Highlighted"/best-seller block is
    // hidden (frame 2198:5130, hidden=true) and it has no bundle/gifts
    // sections — only the New Users Promo banner + the CP denomination grid.
    // hero: false — no promotional story carousel on this page (Figma
    // reference has none); every other store omits this flag and keeps its
    // hero shown, unaffected.
    // topNav: true — category nav embedded IN the SKU section: since
    // catalogBoxed is also true, App.vue renders it as a plain in-flow tab
    // row at the top of the catalog-card itself (not the sticky page-nav-
    // stack ZZZ uses for its flat/unboxed catalog), instead of the default
    // sticky-bottom CategoryNav (see catalog.hideNav below, which suppresses
    // that default bar so the two don't both render).
    page: { layout: 'split', sections: ['new-users', 'cp'], hero: false, catalogBoxed: true, topNav: true },

    // 5-up SKU grid, per the Figma reference — see src/components/SkuList.vue.
    skuList: { layout: 'wrap', columns: 5 },

    // materialExploration — gates the skuCardMaterial dev flag (see
    // useFeatureFlags.js). Codashop-only pilot: SkuCard reads this capability,
    // not the theme name, before applying any material other than 'glass' —
    // every other store keeps today's card look regardless of the flag value.
    skuCard: { materialExploration: true },

    // 'page' = bespoke single-scroll sections (mirrors COD:M).
    // hideNav: true — the embedded page.topNav bar above replaces the
    // default sticky-bottom CategoryNav; without this both would render.
    catalog: { mode: 'page', hideNav: true },

    checkout: {
      showPoweredByCoda: true,
      showRating:        true,
      loyalty:           null,
      allowGuest:        true,
      // Inline page-step checkout (Select Recharge → Payment → Zip → Details
      // as stacked cards in the right rail) instead of the overlay sheet.
      // Every other store omits this flag and keeps the CheckoutSheet overlay.
      mode: 'inline',
    },

    signIn: { flow: 'codm' }, // unused while allowGuest + inline checkout cover the whole flow

    // Per the Figma navbar spec (node 2189:2735):
    //  - chromeTone: 'inverse' — icon/text color on the navbar's permanently-
    //    dark chrome (see NavBar.vue's chromeInverse computed for why this
    //    can't just be a token swap on the first light-card store).
    //  - signInStyle: 'filled' — solid primary pill instead of the default
    //    transparent-outline CTA every other store uses.
    //  - signInShowIcon: false — the Figma CTA is text-only, no leading mark.
    //  - localeShowLanguage: false — only the region flag shows; no separate
    //    language-code button next to it.
    navbar: {
      hideSignIn: false,
      chromeTone: 'inverse',
      signInStyle: 'filled',
      signInShowIcon: false,
      localeShowLanguage: false,
    },

    profile: {
      avatarStyle:       'icon',
      playerCard:        'nickname-only',
      showLoyaltyPill:   false,
      showPlayerAccount: false, // Gamer ID entry happens inline in StepGamerId instead
    },

    // Codashop is the first LIGHT theme — payment/social icon polarity flips
    // to dark-on-light. src/shared/pc/dark/ is currently an empty stub (see
    // docs/design-tokens-codashop.md); useStoreAssets() falls back to
    // PC.light via `??` until those marks are added, so this degrades
    // gracefully rather than shipping wrong-polarity logos silently.
    chrome: { iconVariant: 'dark' },

    // Responsive/desktop-first — the Home Blob layout (now the default
    // homepageLayout) is a desktop-oriented aggregator page (asymmetric
    // bento grids, full-bleed rails), and the two-column split
    // (config.page.layout: 'split') only activates at ≥801px anyway, so it's
    // never visible in a framed phone device. Was 'samsung' (mobile-first,
    // matching real Codashop traffic) before the Blob variant existed.
    device: { default: 'none' },

    // Left-rail compact hero card (src/components/CompactHero.vue). Absent
    // for every other store, so CompactHero never renders elsewhere.
    identity: {
      image: identityThumb,
      title: 'Mobile Legends: Bang Bang',
    },

    // Trust bar (src/components/TrustBar.vue), PM-requested — absent for
    // every other store, so TrustBar never renders elsewhere. publisherChips
    // are text-only (no fabricated publisher logos) — pairs cross-fade every
    // --x-motion-trust-rotate-interval.
    trustBar: {
      stats: { gamers: 80, deliveryRate: 99 },
    },

    // Aggregator homepage (App.vue's homeView/showHomeView gate) — Codashop
    // is the only store that ships this. Its mere presence is the capability
    // switch; App.vue never tests theme.value === 'codashop'. `heroAspect`
    // lets the hero StoryCarousel fit the real 730×382 (~1.91:1) banner crop
    // instead of the default 1:1/2.6:1 responsive frame.
    home: {
      heroAspect: '1.91 / 1',
    },
  },

  // ── User-visible copy (read via useStoreStrings) ───────────────────────────
  strings: {
    footer: {
      supportCta:    'Support Portal',
      cookieLabel:   'Cookie Preference',
      cookieCta:     'Manage Your Cookie Preference',
      socialHeading: 'Stay up to date with us',
      disclaimer:    'THE OFFICIAL CODASHOP WEB STORE IS OPERATED BY CODA PAYMENTS. CODA PAYMENTS IS AN AUTHORIZED RESELLER OF DIGITAL CONTENT FOR MOBILE LEGENDS: BANG BANG.',
      legalLinks: [
        { label: 'Terms & Conditions', url: '#' },
        { label: 'Privacy Policy',     url: '#' },
      ],
    },
    currency: {
      name: 'Diamonds',
      abbr: 'CP',
    },
    checkout: {
      actionLabel: 'Buy Now',
    },
    sku: {
      bonusLabel: 'BONUS',
      bestSeller: 'BEST SELLER',
      bestValue:  'POPULAR',
    },
    nav: {
      groups: [],
      items: [
        { label: 'Diamonds',       anchor: 'cat-cp' },
        { label: 'Special Offers', anchor: 'cat-cp' },
        { label: 'Events',         anchor: 'cat-cp' },
        { label: 'Guide',          anchor: null },
      ],
    },
    identity: {
      deliveryLabel: 'Instant Delivery',
    },
    trustBar: {
      partnerTitle:  'Officially partnered with top game publishers',
      partnerSub:    'A licensed top-up partner for the titles you play — your account stays 100% safe.',
      gamersUnit:    'M+',
      gamersLabel:   'gamers trust Codashop',
      gamersSub:     'Players in 60+ countries have topped up with us.',
      deliveryLabel: 'of orders fulfilled in <5 seconds',
      deliveryBadge: 'Delivered or your money back',
      paymentTitle:  'Pay with your local method',
      paymentSub:    '200+ options — e-wallets, cards, bank transfer & more.',
    },
    // Read unconditionally by NavBar/Footer (logo alt text) and SignInLoader
    // even though Codashop's inline checkout bypasses the sign-in flow itself
    // (allowGuest + StepGamerId cover identification) — every store must
    // define this block or those components throw on an undefined read.
    signIn: {
      logoAlt:       'Codashop',
      cta:           'Sign in',
      openingApp:    'Opening Codashop…',
      qrInstruction: 'Scan this QR code with a mobile device logged into your account',
      pagePrompt:    'Sign in to your account to purchase',
    },
    gamerId: {
      heading:       'Enter Gamer ID',
      userIdLabel:   'User ID',
      serverLabel:   'Server',
      helperText:    'To find your User ID, click on your avatar in the top-left corner of the main game screen. Then go to the Basic Info tab. Your User ID is shown below your nickname. Please input the complete User ID here, e.g. 123456789(1234).',
    },
    payment: {
      heading: 'Select Payment',
    },
    zipCode: {
      heading:     'Zip Code',
      inputLabel:  'Zip Code',
    },
    details: {
      heading:      'Enter Details',
      helperText:   'Make sure your email address is correct. We will use it to deliver your voucher code.',
      emailLabel:   'Email Address',
      consentLabel: 'Yes, send me messages with exclusive Codashop news and promotions.',
      submitCta:    'Buy Now',
    },
    account: {
      heading:            'YOUR ACCOUNT',
      playerIdLabel:      'Your User ID',
      instructionsPrefix: 'In the game app go to',
      playerCardLabel:    'Player Profile',
    },
    page: {
      tabs:                  ['Diamonds'],
      promoTitle:            'GET 20% OFF YOUR FIRST PURCHASE',
      promoAction:           'SHOP NOW',
      bestSellerDesc:        'The most popular Diamond top-ups.',
      doubleCurrencyHeading: '2x Diamonds',
      doubleCurrencyDesc:    'Get <strong>100%</strong> Bonus on selected items.',
      newUsersHeading:       'NEW USERS PROMO',
      newUsersDesc:          'Get <strong>20%</strong> off your first purchase. *Promotion valid for selected products only.',
      newUsersSub:           'You may only get 1 item from the items below',
      currencySection:       'Diamonds',
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

    // Aggregator homepage copy (config.home). Both HomeStandard and
    // HomeVisual read the same strings — they differ in presentation/motion,
    // not content (see the plan's Part 1 section table).
    home: {
      hero: [
        { image: heroEafcChamps, heading: 'EA SPORTS FC MOBILE — Champions 2026', body: 'Kick off the new season with bonus FC Points.', ctaLabel: 'Top up now' },
        { image: heroEafcmPromo, heading: 'New Users Promo', body: 'Get bonus value on your first EA SPORTS FC Mobile top-up.', ctaLabel: 'Shop now' },
        { image: heroR6mPromo, heading: 'Rainbow Six Mobile — Silent Descent', body: 'Gear up for the new season with R6 Credits.', ctaLabel: 'Explore deals' },
        { image: heroEafcOct, heading: 'EA SPORTS FC Mobile', body: 'Limited-time bonus FC Points, this month only.', ctaLabel: 'Top up now' },
      ],
      promoTiles: [
        { tag: 'DAILY', heading: 'Daily check-in rewards', sub: 'Earn Codashop Cash every day' },
        { tag: 'EVENT', heading: 'Spin & win vouchers', sub: 'Free spin with every top-up' },
      ],
      trending: {
        heading: 'Trending games',
        sub: 'Topped up most right now',
        tabs: [
          { id: 'all', label: 'All' },
          { id: 'moba', label: 'MOBA' },
          { id: 'battle', label: 'Battle Royale' },
          { id: 'rpg', label: 'RPG / Gacha' },
          { id: 'sandbox', label: 'Sandbox / Sim' },
        ],
      },
      spotlightHeading: 'More from HoYoverse',
      spotlightSub:     'Genshin Impact, Honkai: Star Rail, and more',
      categoriesHeading: 'Shop by category',
      categoriesSub:     'Everything digital, instant',
      pickedHeading:     'Picked for you',
      pickedSub:         'Based on your top-ups',
      trustStats: [
        { value: 1000, suffix: '+', label: 'Games & digital products' },
        { value: 60,   suffix: '+', label: 'Countries served' },
        { value: 4.8,  suffix: '★', label: 'Average store rating' },
        { value: 100,  suffix: 'M+', label: 'Top-ups delivered' },
      ],
      stepsHeading: 'Top up in 3 easy steps',
      stepsSub:     'No account, no waiting',
      steps: [
        { icon: portalEasyFast,  heading: 'Pick your title', body: 'Search or browse and choose your game, app, or gift card.' },
        { icon: portalPayment,   heading: 'Pay your way', body: '200+ local payment methods to choose from.' },
        { icon: portalInstant,   heading: 'Get it instantly', body: 'Credits land in your account in seconds.' },
        { icon: portalSupport,   heading: '24/7 support', body: 'A dedicated team on hand if anything needs a hand.' },
      ],
      reviewsHeading: 'Loved by millions',
      reviewsSub:     'Real Codashop reviews',
      reviews: [
        { quote: "Diamonds hit my account before I even closed the tab. Fastest top-up I've used.", name: 'Arif R.', meta: 'Verified · Mobile Legends' },
        { quote: 'So many payment options — I paid with my e-wallet in two taps. No card needed.', name: 'Mei L.', meta: 'Verified · Genshin Impact' },
        { quote: 'Prices are cheaper than in-app and the bonus events are legit. My go-to now.', name: 'Jomar D.', meta: 'Verified · Free Fire' },
      ],
      paymentsHeading: 'Pay your way, wherever you are',
      paymentsSub:     '200+ local payment methods across 60+ countries',
      faqHeading: 'FAQ',
      faqSub:     'Before you top up',
      faq: [
        { q: 'Do I need an account to top up?', a: 'No. Codashop lets you top up directly with just your player ID — no sign-up required. A free account only adds order history and rewards.' },
        { q: 'How fast is delivery?', a: "Most top-ups are credited instantly. In rare cases it can take a few minutes; you'll get a confirmation the moment it lands." },
        { q: 'What payment methods can I use?', a: 'Over 200 local methods including cards, e-wallets, bank transfer and carrier billing — options adapt to your country.' },
        { q: 'Is it safe to pay on Codashop?', a: 'Yes. All payments are encrypted and processed through secure, licensed partners. Codashop never stores your full card details.' },
      ],
      newsletterHeading: 'Get deals before anyone else',
      newsletterBody:    'Bonus events, price drops and new-title launches — to your inbox.',
      newsletterCta:     'Subscribe',
    },
  },

  // ── Localised copy overrides — none yet; falls through to English. ─────────
  translations: {},

  // ── Imagery (read via useStoreAssets) ───────────────────────────────────────
  assets: {
    brand: {
      wordmark:       codashopLogo,
      logomark:       codashopLogo,
      favicon:        codashopLogomark,
      navSignInIcon:  codashopLogo,
      qrCode:         placeholderSquare,
      qrPlaceholder:  placeholderSquare,
      coda,
      rating,
      cpIcon,
      apIcon:            null,
      loyaltyIcon:       null,
      loyaltyIconColour: null,
    },
    // pc is merged in by useStoreAssets() from the shared PC map (per polarity).
    // No storyHero — the hero carousel is hidden entirely (config.page.hero: false).
    content: {
      bestSellerImage: placeholderSquare,
      skuCodPoint:     cpIcon,
      avatar:          placeholderSquare,
      // TrustBar's publisher-logo rotator — see the import comments above.
      publisherLogos: [
        { src: mobileLegendsLogo, alt: 'Mobile Legends: Bang Bang' },
        { src: pubgMobileLogo,    alt: 'PUBG Mobile' },
        { src: genshinLogo,       alt: 'Genshin Impact' },
        { src: freeFireLogo,      alt: 'Free Fire' },
      ],
    },

    // Aggregator homepage art (config.home) — kept off assets.social/assets.pc
    // on purpose: useStoreAssets() unconditionally overwrites `social` with
    // the shared market-level registry (see that composable's polarity
    // merge), so Codashop's OWN supplied social icons live here instead,
    // under a name nothing else reads or clobbers.
    home: {
      social: {
        facebook:  homeSocialFacebook,
        instagram: homeSocialInstagram,
        tiktok:    homeSocialTiktok,
      },
    },
  },

  // 'page' model — no category catalogue / featured carousel data.
  catalog:  null,
  featured: null,

  // ── Aggregator homepage title catalogue (read via useStoreHome) ────────────
  // Codashop's own SG storefront catalogue — real tile art (img/ref/), not the
  // other prototype whitelabel stores. `cat` powers the trending-titles filter
  // tabs (see strings.home.trending.tabs above); `rating`/`ribbon` are cosmetic
  // merchandising cues, not sourced from a live catalog. Only Mobile Legends
  // has a full product page in this prototype — every card's tap target is the
  // same MLBB page (App.vue's openTitle), standing in for "open this title."
  home: {
    categories: [
      {
        id: 'popular',
        label: 'Direct Top-Up',
        // Ordered so the Home Blob layout's Highlighted Titles "ALL" bento
        // grid (main=titles[0], left col=titles[1], right col=titles[2..3])
        // shows this exact curated set — everything after these first 4 is
        // unordered filler for the other layouts'/filters' longer lists.
        // Tiles here stay the generic square ref art (shared with Standard/
        // Visual/Genres/Picked for you) — the real Highlighted Titles key
        // art (img/content/highlights/) is swapped in ONLY for the Home
        // Blob layout's Highlighted Titles section itself, via the
        // HIGHLIGHT_ART lookup in HomeBlob.vue, not here.
        titles: [
          { name: 'Mobile Legends: Bang Bang', cat: 'moba',    ribbon: 'HOT', tile: tileMlbb },
          { name: 'Free Fire',                 cat: 'battle',  tile: tileFreeFire },
          { name: 'League of Legends',         cat: 'moba',    tile: tileLol },
          { name: 'EA SPORTS FC Mobile',       cat: 'battle',  ribbon: 'HOT', tile: tileEafcm },
          { name: 'Magic Chess: Go Go',        cat: 'moba',    tile: tileMcgg },
          { name: 'Genshin Impact',            cat: 'rpg',     tile: tileGenshin },
          { name: 'Honkai: Star Rail',         cat: 'rpg',     tile: tileHsr },
          { name: 'VALORANT',                  cat: 'battle',  ribbon: 'NEW', tile: tileValorant },
          { name: 'Teamfight Tactics Mobile',  cat: 'rpg',     tile: tileTft },
          { name: 'PUBG Mobile',               cat: 'battle',  ribbon: 'HOT', tile: tilePubgm },
          { name: 'Free Fire MAX',             cat: 'battle',  tile: tileFreeFireMax },
          { name: 'Honor of Kings',            cat: 'moba',    ribbon: 'NEW', tile: tileHonorOfKings },
          { name: 'Love and Deepspace',        cat: 'rpg',     tile: tileLoveDeepspace },
          { name: 'ONE PUNCH MAN: The Strongest', cat: 'battle', tile: tileOpm },
          { name: 'Wild Rift',                 cat: 'moba',    tile: tileWildRift },
          { name: 'Rainbow Six Mobile',        cat: 'battle',  tile: tileRainbowSix },
          { name: 'AFK Journey',               cat: 'rpg',     tile: tileAfkJourney },
          { name: 'Growtopia',                 cat: 'sandbox', tile: tileGrowtopia },
          { name: 'MapleStory M',              cat: 'rpg',     tile: tileMapleStoryM },
          { name: 'Dragon Raja',               cat: 'rpg',     tile: tileDragonRaja },
          { name: 'Dragon Nest M: Classic',    cat: 'rpg',     tile: tileDragonNestM },
          { name: 'Westward Adventure',        cat: 'rpg',     tile: tileWestward },
          { name: 'Be The King: Judge Destiny', cat: 'sandbox', tile: tileBeTheKing },
          { name: 'Revelation',                cat: 'rpg',     tile: tileRevelation },
          { name: 'MU Origin',                 cat: 'rpg',     tile: tileMuOrigin },
          { name: 'Minecraft',                 cat: 'sandbox', tile: tileMinecraft },
        ],
      },
      {
        id: 'social',
        label: 'Entertainment & Social',
        titles: [
          { name: 'ZEPETO',    cat: 'sandbox', tile: tileZepeto },
          { name: 'Chamet',    cat: 'sandbox', tile: tileChamet },
          { name: 'Kumu',      cat: 'sandbox', tile: tileKumu },
          { name: 'Bigo Live', cat: 'sandbox', tile: tileBigoLive },
          { name: 'Yalla Ludo', cat: 'sandbox', tile: tileYallaLudo },
          { name: 'Yalla Live', cat: 'sandbox', tile: tileYallaLive },
          { name: 'HeeSay',    cat: 'sandbox', tile: tileHeeSay },
          { name: 'Tinder',    cat: 'sandbox', tile: tileTinder },
          { name: 'Bilibili',  cat: 'sandbox', tile: tileBilibili },
        ],
      },
      {
        id: 'pc',
        label: 'PC & Console',
        titles: [
          { name: 'Two Point Campus',        cat: 'rpg', tile: tileTwoPointCampus },
          { name: 'Metaphor: ReFantazio',    cat: 'rpg', ribbon: 'NEW', tile: tileMetaphor },
        ],
      },
      {
        id: 'vouchers',
        label: 'Gift Cards & Vouchers',
        titles: [
          { name: 'Steam Wallet Code',       cat: 'battle', tile: tileSteamWallet },
          { name: 'Nintendo eShop Card (US)', cat: 'battle', tile: tileNintendoEshop },
          { name: 'PlayStation Store Gift Cards', cat: 'battle', tile: tilePsnStore },
        ],
      },
    ],
    // "Sellable slot" merchandising panel (PM feedback: highlight one
    // brand/publisher and its titles). `logo` is the umbrella HoYoverse
    // wordmark (img/content/spotlight/HoYoverse.svg) and all 3 `titles` use
    // the real HoYoverse key art dropped into img/content/spotlight/.
    publisherSpotlight: {
      logo: hoyoverseLogo,
      logoAlt: 'HoYoverse',
      titles: [
        { name: 'Genshin Impact',     cat: 'rpg', tile: spotlightGenshin },
        { name: 'Honkai: Star Rail',  cat: 'rpg', tile: spotlightHsr },
        { name: 'Zenless Zone Zero',  cat: 'rpg', tile: spotlightZzz },
      ],
    },

    // Home Blob layout's Highlighted Titles section ONLY — a name-keyed art
    // override (img/content/highlights/), NOT a replacement for the
    // `categories` tiles above (those stay the generic square ref art,
    // shared by Standard/Visual/Genres/Picked for you). Kept as its own
    // lookup rather than editing the shared title objects so this doesn't
    // leak into any other section that happens to also show these 4 games.
    highlightsArt: {
      'Mobile Legends: Bang Bang': highlightMlbb,
      'Free Fire':                 highlightFreeFire,
      'League of Legends':         highlightLol,
      'EA SPORTS FC Mobile':       highlightFcm,
    },
  },

  // Placeholder MLBB Diamond denominations — mirrors the Figma reference's
  // 10-tile "Select Recharge" grid (88 → 58000), each with a bonus sub-line
  // and a struck-through pre-promo price. Shape matches SkuCard's props
  // (amount/baseAmount/bonusAmount as numbers, currentPrice/originalPrice as
  // formatted strings) — see the storeSkus.value?.promo / .cp override in
  // App.vue's promoItems/cpItems computed (same pattern as cpImageRegular).
  // Split into two groups only because App.vue's 'page' model renders them
  // under two existing sections (New Users Promo banner, then a CP list) —
  // the Figma reference shows them as one continuous list under one banner.
  skus: {
    promo: [
      { amount: 88,   baseAmount: 80,   bonusAmount: 8,    bonusType: 'codashop', currentPrice: '$2.00', originalPrice: '$3.00', skuImage: cpIcon },
      { amount: 160,  baseAmount: 80,   bonusAmount: 80,   bonusType: 'codashop', currentPrice: '$2.00', originalPrice: '$3.00', skuImage: cpIcon },
      { amount: 460,  baseAmount: 400,  bonusAmount: 60,   bonusType: 'codashop', currentPrice: '$2.00', originalPrice: '$3.00', skuImage: cpIcon },
      { amount: 960,  baseAmount: 800,  bonusAmount: 160,  bonusType: 'codashop', currentPrice: '$2.00', skuImage: cpIcon },
      { amount: 2600, baseAmount: 2000, bonusAmount: 600,  bonusType: 'codashop', currentPrice: '$2.00', skuImage: cpIcon },
    ],
    cp: [
      { amount: 5400,  baseAmount: 4000,  bonusAmount: 1400,  bonusType: 'cp', currentPrice: '$2.00', originalPrice: '$3.00', skuImage: cpIcon },
      { amount: 11600, baseAmount: 8000,  bonusAmount: 3600,  bonusType: 'cp', currentPrice: '$2.00', tagLabel: 'POPULAR', skuImage: cpIcon },
      { amount: 23200, baseAmount: 16000, bonusAmount: 7200,  bonusType: 'cp', currentPrice: '$2.00', originalPrice: '$3.00', skuImage: cpIcon },
      { amount: 34800, baseAmount: 24000, bonusAmount: 10800, bonusType: 'cp', currentPrice: '$2.00', originalPrice: '$3.00', skuImage: cpIcon },
      { amount: 58000, baseAmount: 40000, bonusAmount: 18000, bonusType: 'cp', currentPrice: '$2.00', skuImage: cpIcon },
    ],
  },
}
