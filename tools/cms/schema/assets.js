/**
 * Store assets schema — the single source of truth for `store.js`'s `assets`
 * key and the upload slots the CMS dashboard's Assets tab renders.
 *
 * Every slot is `null`-able ("this store doesn't have this asset") except
 * where `required: true` — components guard on absence, so the CMS must never
 * force a placeholder where a store genuinely has none (e.g. qrCode on a
 * guest-only store with no sign-in flow).
 *
 * `kind` tells the CMS what upload widget / aspect-ratio guide to show.
 * Everything here becomes a build-time Vite `import` in the generated
 * store.js — the CMS stores a relative path, never a runtime URL, so bundle
 * fingerprinting and store-locked isolation aren't broken by the generator.
 */

export const ASSETS_SCHEMA = {
  brand: {
    wordmark:          { kind: 'logo-wide', required: true, help: 'Navbar wordmark.' },
    logomark:          { kind: 'logo-square', required: true, help: 'Sign-in icon / favicon fallback.' },
    signinLogomark:    { kind: 'logo-square', help: 'Alternate sign-in-sheet logomark (device-split sign-in flows only).' },
    favicon:           { kind: 'logo-square', help: 'Browser tab icon. Falls back to logomark if absent.' },
    navSignInIcon:     { kind: 'icon', help: 'Icon inside the navbar SIGN IN button.' },
    qrCode:            { kind: 'square-1x1', help: 'QR image for the sign-in loader. null for guest-only / redirect-only sign-in.' },
    qrPlaceholder:     { kind: 'square-1x1', help: 'SVG placeholder shown before a real QR loads.' },
    cpIcon:            { kind: 'icon', required: true, help: 'Primary currency mark.' },
    apIcon:            { kind: 'icon', help: 'Secondary currency mark, if the store has one.' },
    loyaltyIcon:        { kind: 'icon', help: 'Simple/mono loyalty mark (mask/currentColor-friendly). Gate on config.checkout.loyalty, not this asset\'s presence.' },
    loyaltyIconColour:  { kind: 'icon', help: 'Decorative colour loyalty mark. NOTE: named loyaltyIconColour, not "mpColourIcon" — a doc/skill discrepancy this schema settles.' },
    bg:                { kind: 'background', help: 'Full-cover fixed page background. Required when config.background.style === "fixed-image".' },
  },

  content: {
    // Hero — pick ONE branch (asset-driven, not store-driven; App.vue checks
    // for slide*Portrait/slide*Landscape and falls back to storyHero):
    storyHero: { kind: 'wide-hero', help: 'Single static hero — no auto-advance, no per-slide heading/CTA.' },
    // slide<N><Portrait|Landscape>: dynamic keys, not fixed — the multi-slide
    // carousel. Represented here as a pattern, not enumerable fields:
    slidePattern: { kind: 'pattern', pattern: 'slide<Name><Portrait|Landscape>',
      help: 'Any number of named slide pairs (e.g. slideKuiJiPortrait/Landscape) drives the auto-advancing multi-slide carousel instead of a single storyHero.' },

    bestSellerImage: { kind: 'square-1x1', help: 'Best-seller SKU art.' },
    bannerImage:     { kind: 'wide-banner', help: 'Generic 2.6:1 promo/bundle banner — real key varies per store (e.g. bannerMidnightSun).' },
    skuImage:        { kind: 'square-1x1', help: 'Generic SKU tile art — real key varies per store (e.g. skuCrate, skuCodPoint).' },
    cpCoins:         { kind: 'map', shape: '{ [amount: number]: image }', help: 'Per-denomination currency art. Falls back to a single skuCodPoint-style default when a denomination is missing.' },
    giftImage:       { kind: 'square-1x1', help: 'Gift-tile art — real key varies per store (e.g. giftDailyImage, giftEmote, giftGun).' },
    avatar:          { kind: 'square-1x1', required: true, help: 'In-game player avatar (navbar + account popover).' },
    avatarPreviewVideo: { kind: 'video', help: 'Optional bundle item-summary preview video.' },
  },

  fonts: {
    kind: 'font-files',
    help: 'One .woff2 per weight/style, placed in src/stores/<key>/fonts/. Google Fonts faces instead require an index.html <link> edit (see docs/multi-store-whitelabel.md) — self-hosting a .woff2 avoids that shared-file touch.',
  },
}

// Shared / market-level art — NEVER per-store, merged in by useStoreAssets.js
// keyed by config.chrome.iconVariant. A new store never uploads these.
export const SHARED_ASSETS = {
  pc: { path: 'src/shared/pc/{light,dark}/', keys: ['googleApple', 'creditCard', 'paypalVenmo', 'cashApp'],
    note: 'src/shared/pc/dark/ is currently an empty stub — a store selecting chrome.iconVariant:"dark" silently falls back to the light logos. The CMS should warn on this combination.' },
  social: { path: 'src/shared/social/{light,dark}/', keys: ['x', 'facebook', 'instagram', 'youtube', 'tiktok', 'discord'] },
  brand: { path: 'src/shared/brand/', keys: ['coda', 'rating'], note: 'Coda-platform branding for the checkout footer — market-level, ships in every build.' },
  flags: { path: 'src/shared/flags/', note: '200+ country flag SVGs for the locale/language switcher.' },
}
