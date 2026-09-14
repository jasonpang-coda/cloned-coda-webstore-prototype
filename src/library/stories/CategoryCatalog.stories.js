import CategoryCatalog from '@/components/CategoryCatalog.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'category-catalog',
  title: 'Category Catalog',
  group: 'Content',
  component: CategoryCatalog,
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-motion-sys-duration-base',
    '--x-motion-sys-ease-decelerate',
    '--x-motion-sys-duration-exit',
    '--x-motion-sys-ease-accelerate',
    '--x-motion-sys-distance-md',
    '--x-pad-surface-l',
    '--x-pad-surface-xl',
    '--x-border-divider',
    '--x-gap-content-loose',
    '--x-text-header-default',
    '--x-gap-content-default',
    '--x-motion-sys-distance-sm',
    '--x-gap-content-narrow',
    '--x-text-body-soft',
  ],
  notes:
    'Renders every subcategory of one active category node from useStoreCatalog ' +
    '(the FCM catalogue tree). Each subcategory\'s `cardType` field — never store ' +
    'identity — picks its card: "hero" for flagship named editions (HeroSkuCard), ' +
    '"bundle" for Campaign-Pack style bundles (BundleSkuCard, or SkuImageCard ' +
    'variant="prod" when the `cardVariant` override is "prod"), "sku" with a ' +
    'cardVariant for image-led panel cards (SkuImageCard), and plain "sku" for a ' +
    '"Coming soon" stub while per-category SkuCard designs are pending. Category ' +
    'switches cross-fade (Transition mode="out-in") and remount the subtree via a ' +
    ':key on category.id, replaying every card\'s staggered entrance.',
  rules: [
    'category is required — a single node shaped { id, label, subcategories: [...] } from useStoreCatalog.',
    'Each subcategory\'s cardType drives which card renders — never branch on store identity.',
    'cardVariant prop (e.g. "prod") overrides every subcategory\'s own cardVariant; leave null to use the catalogue data as-is.',
    'sub.promo (CategoryBanner props) replaces the plain <h2> heading when present.',
  ],
  variants: [
    {
      name: 'Hero subcategory (flagship editions)',
      props: ({ assets, strings }) => ({
        category: {
          id: 'editions',
          label: 'Editions',
          subcategories: [
            {
              id: 'flagship-editions',
              label: 'Flagship Editions',
              cardType: 'hero',
              promo: null,
              items: [
                {
                  eyebrow: 'ULTIMATE EDITION',
                  title: 'Voidfarer Edition',
                  description: 'Every cosmetic from Season 1-4, plus the exclusive Voidfarer weapon skin set.',
                  includes: ['Base Game', 'Season Pass', 'Voidfarer Skin Set'],
                  image: assets.content?.cpSkuBanner || assets.brand?.cpIcon,
                  skuImage: assets.content?.skuCodPoint || assets.brand?.cpIcon,
                  currentPrice: '$44.50',
                  originalPrice: '$89.00',
                  discountPercent: '-50%',
                  loyaltyPoints: 890,
                },
              ],
            },
          ],
        },
      }),
    },
    {
      name: 'Bundle subcategory (Campaign Packs, with promo banner)',
      props: ({ assets, strings }) => ({
        category: {
          id: 'campaign-packs',
          label: 'Campaign Packs',
          subcategories: [
            {
              id: 'campaign-packs',
              label: "The World's Game",
              cardType: 'bundle',
              cardVariant: null,
              promo: {
                title: strings.page?.newUsersHeading || "The World's Game",
                description: 'Rep your nation — unlock exclusive international Player Items before the final whistle.',
                backgroundImage: assets.content?.cpSkuBanner,
                icon: assets.content?.cpCoins?.[58000] || assets.brand?.cpIcon,
              },
              items: [
                {
                  bannerImage: assets.content?.cpSkuBanner || assets.brand?.cpIcon,
                  skuImage: assets.content?.skuCodPoint || assets.brand?.cpIcon,
                  skuOnBanner: true,
                  title: 'Campaign Pack: Brazil',
                  currentPrice: '$9.99',
                  originalPrice: '$14.99',
                  discountPercent: '-33%',
                  loyaltyPoints: 120,
                  items: [
                    { image: assets.brand?.cpIcon, rarity: 'rare', tag: { label: 'BONUS', variant: 'value' }, quantity: 1 },
                  ],
                },
              ],
            },
          ],
        },
      }),
    },
    {
      name: 'SKU subcategory (image-led panel cards)',
      props: ({ assets, strings }) => ({
        category: {
          id: 'fc-points',
          label: 'FC Points',
          subcategories: [
            {
              id: 'fc-points',
              label: strings.page?.currencySection || 'FC Points',
              cardType: 'sku',
              cardVariant: 'panel',
              promo: null,
              skuCardBg: assets.content?.cpSkuBanner,
              items: [
                { amount: 500, currentPrice: '$4.99', skuImage: assets.content?.skuCodPoint || assets.brand?.cpIcon, currencyLabel: strings.currency?.name || 'FC Points' },
                { amount: 1050, baseAmount: 1000, bonusAmount: 50, bonusLabel: strings.sku?.bonusLabel || 'WEB BONUS', currentPrice: '$9.99', skuImage: assets.content?.skuCodPoint || assets.brand?.cpIcon, currencyLabel: strings.currency?.name || 'FC Points' },
              ],
            },
          ],
        },
      }),
    },
    {
      name: 'SKU subcategory (stub — designs pending)',
      props: () => ({
        category: {
          id: 'star-pass',
          label: 'Star Pass',
          subcategories: [
            { id: 'star-pass', label: 'Star Pass', cardType: 'sku', cardVariant: null, promo: null, items: [] },
          ],
        },
      }),
    },
  ],
})
