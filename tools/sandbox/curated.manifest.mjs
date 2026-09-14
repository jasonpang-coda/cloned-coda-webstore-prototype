/**
 * tools/sandbox/curated.manifest.mjs — the PM Ideation Sandbox's curated
 * component subset + boundary rules + token cascade, as one declarative
 * source of truth for export-sandbox.mjs.
 *
 * See /Users/yiwei/.claude/plans/majestic-noodling-teapot.md for the full
 * milestone plan this implements.
 */

// Default store vendored into a bundle when --store isn't passed. Any real
// src/stores/<key>/store.js is a valid --store value — validated at export
// time against the filesystem, not against this list.
export const DEFAULT_STORE = 'codm'

// Curated seed list — presentational primitives + SKU display cards only.
// Paths are relative to src/components/. The exporter walks each seed's full
// import closure (composables/utils/directives it references transitively);
// this list only needs to name the entry points.
export const CURATED_COMPONENTS = [
  // Primitives
  'Grid.vue',
  'Span.vue',
  'Card.vue',
  'Media.vue',
  'Thumbnail.vue',
  'ListItem.vue',
  'LinkRow.vue',
  'MaterialIcon.vue',

  // Controls / atoms
  'Button.vue',
  'ToggleSwitch.vue',
  'InfoTag.vue',
  'SkuTag.vue',
  'StatusTag.vue',
  'AccordionHeader.vue',
  'AccordionPanel.vue',

  // Marketing / hero / banner
  'CompactHero.vue',
  'CategoryBanner.vue',
  'SkuBanner.vue',
  'TrustBar.vue',
  'Footer.vue',
  'FeaturedCarousel.vue',
  'StoryCarousel.vue',
  'BestSellerCard.vue',
  'BestSellerCarousel.vue',

  // home/* sections (presentational)
  'home/HomeFaq.vue',
  'home/HomeNewsletter.vue',
  'home/HomeSteps.vue',
  'home/HomeCategoryCards.vue',
  'home/HomePromoTiles.vue',
  'home/TitleCard.vue',
  'home/FilterTabs.vue',

  // SKU display cards
  'SkuCard.vue',
  'SkuImageCard.vue',
  'SkuList.vue',
  'SkuImageList.vue',
  'HeroSkuCard.vue',
  'GiftSkuCard.vue',
  'BundleSkuCard.vue',
  'ProdHighlightedSkuCard.vue',
  'BundleGrid.vue',
  'BundleItem.vue',
  'BundleBreakdown.vue',
  'GiftGrid.vue',
]

// Boundary rule — the closure walker must never land on one of these when
// resolving an import that lives under src/components/. Checkout/payment
// internals, nav chrome, and overlay sheets are all excluded from the
// ideation sandbox. Hitting one is a hard error (see export-sandbox.mjs's
// assertNotExcluded), not a silent skip — a curated component transitively
// depending on an excluded one is a scoping decision for a human, not
// something the exporter should paper over.
export const EXCLUDED_COMPONENT_DIRS = ['checkout', 'steps', 'base']

export const EXCLUDED_COMPONENT_FILES = [
  'App.vue',
  'NavBar.vue',
  'NavDrawer.vue',
  'CatalogNavStack.vue',
  'CategoryNav.vue',
  'CategoryCatalog.vue',
  'CommandConsole.vue',
  'DeviceFrame.vue',
  'DeviceToolbar.vue',
  'PurchaseSheet.vue',
  'ClaimGiftSheet.vue',
  'TaskGiftSheet.vue',
  'GiftTaskBanner.vue',
  'SignInSheet.vue',
  'SignInLoader.vue',
  'PageSignInSection.vue',
  'EaSignInPage.vue',
  'KonamiSignInPage.vue',
  'RegionSelectorSheet.vue',
  'LanguageSelectorSheet.vue',
  'IosInstallSheet.vue',
  'BuyNowBar.vue',
  'ItemSummaryAccordion.vue',
  'OrderCompletePage.vue',
  'TransactionCard.vue',
  'TransactionHistoryPage.vue',
  'PlayerAccount.vue',
  'PlayerCard.vue',
  'AccountPopover.vue',
]

// Component files/directives that are never `import`ed by name from a curated
// component's source text (they're wired via global `.directive()`
// registration in main.js, so the ordinary closure walk can't discover them)
// but are required for every curated component to render/interact correctly.
// Paths are relative to src/.
export const ALWAYS_VENDOR = [
  'directives/vRipple.js',
  'directives/vHaptic.js',
]

// Token cascade — copied verbatim preserving the `ds/` substructure (so a
// vendored file's own `@/tokens/...` imports keep resolving unchanged), in
// the exact order main.js loads them. The chosen store's theme file
// (ds/themes/<store>.css) is prepended separately by the exporter — it must
// load first (a [data-theme] block loses to a later :root declaration at
// equal specificity — see web-store-tokens §3).
export const TOKEN_FILES = [
  'ds/system.css',
  'ds/semantics.css',
  'ds/space.css',
  'ds/text-styles.css',
  'ds/extensions.css',
  'light.css',
  'materials.css',
  'motion.css',
  'motion-sku.css',
  'motion-trust.css',
  'keyframes.css',
  'effects.css',
  'reduced-motion.css',
]

// Directories copied wholesale (not closure-walked) because they're small,
// self-contained, and referenced by dozens of image/font imports inside a
// store module that aren't worth parsing individually. Preserves the same
// relative nesting as src/ so a wholesale-copied file's own relative imports
// (e.g. store.js's `../../locale/sets.js`) keep resolving unchanged.
export const WHOLESALE_DIRS = ['shared', 'locale']
