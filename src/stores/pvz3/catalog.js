/**
 * Plants vs. Zombies 3: Evolved — SKU catalogue tree + featured items
 *
 * Whitelabel data layer for the 'filter' catalog model (config.catalog.mode
 * === 'filter' in store.js) — mirrors src/stores/fcm/catalog.js. Lives inside
 * the pvz3 store folder (not src/composables/) so a build without pvz3 never
 * bundles these images.
 *
 * PLACEHOLDER — one category/subcategory with a single stub item, using the
 * generic placeholder art from ./img/content/. Fill in the real category
 * tree, SKU art, and prices when content lands (see web-store-whitelabel
 * skill §3 + setup-checklist.md Phases 3-5).
 *
 * Structure:
 *   [ { id, label, subcategories: [ { id, label, cardType, items[] } ] } ]
 *
 * cardType 'bundle' → items shaped for BundleSkuCard (title, subtitle, price, items[])
 * cardType 'hero'   → items shaped for HeroSkuCard (wide flagship SKU)
 */

import placeholderSquare from './img/content/placeholder-square.svg'
import placeholderWide   from './img/content/placeholder-wide.svg'

export const catalog = [
  {
    id: 'top-ups',
    label: 'Gem Top-Ups',
    subcategories: [
      {
        id: 'gems',
        label: 'Gems',
        cardType: 'bundle',
        items: [
          {
            bannerImage:     placeholderWide,
            title:           'PLACEHOLDER — Gem Pack',
            subtitle:        'PLACEHOLDER description — fill in denomination/bonus copy.',
            currentPrice:    '$0.99',
            skuImage:        placeholderSquare,
            items:           [],
          },
        ],
      },
    ],
  },
]

// Standalone best-seller hero (config.catalog.featuredHero) — null until a
// real featured SKU is chosen.
export const featured = null
