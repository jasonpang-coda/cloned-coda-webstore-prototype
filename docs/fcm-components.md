# FCM Components — FC Mobile Web Store

The components and component behaviours that exist **for the FC Mobile (FCM)
store variant**. Two kinds are covered:

1. **New components** that only render in FCM's page model (or were built for it).
2. **Existing components made FCM-aware** — where a COD:M component grew a
   config-driven branch so it serves both stores from one source.

> **The golden rule.** No component tests `theme.value === 'fcm'`. Every FCM
> branch keys off a store-agnostic capability flag from `useStoreConfig`,
> store copy from `useStoreStrings`, or an asset slot from `useStoreAssets`. Store
> identity lives only in the theme CSS, the asset registry, the config map, and
> the strings/catalog data — never in component logic. See
> [`multi-store-whitelabel.md`](multi-store-whitelabel.md) for the four-layer model
> and [`design-tokens-fcm.md`](design-tokens-fcm.md) for the palette.

---

## 1. What drives FCM divergence

FCM's `useStoreConfig` block (`src/composables/useStoreConfig.js`) is the switchboard.
The flags that gate the components in this doc:

| Flag | FCM value | COD:M value | Drives |
|---|---|---|---|
| `catalog.mode` | `'filter'` | `'page'` | `CategoryCatalog` + `FeaturedCarousel` page model vs COD:M bespoke sections |
| `skuList.layout` | `'wrap'` | `'columns'` | `SkuList` grid arrangement |
| `signIn.flow` | `'ea-redirect'` | `'codm'` | `EaSignInPage` overlay vs in-app loader/QR |
| `checkout.allowGuest` | `false` | `true` | `PageSignInSection` (must sign in) vs `PlayerAccount` guest lookup |
| `checkout.loyalty` | `{ label: 'You will earn' }` | `null` | PurchaseSheet checkout-step loyalty banner |
| `checkout.showPoweredByCoda` | `false` | `true` | Coda branding in checkout footer |
| `checkout.showRating` | `false` | `true` | store-rating badge in checkout footer |
| `profile.avatarStyle` | `'icon'` | `'image'` | generic account icon vs in-game avatar |
| `profile.playerCard` | `'nickname-only'` | `'full'` | `PlayerCard` variant |
| `profile.showLoyaltyPill` | `true` | `false` | MP rewards pill in the navbar |

Asset slots unique to FCM (`useStoreAssets`): `brand.loyaltyIcon` (MP Simple mark),
`brand.mpColourIcon` (MP Colour mark), `brand.navSignInIcon` (= MP Colour for FCM).
Copy lives in `useStoreStrings` (`account.playerCardLabel: 'Player Profile'`,
`signIn.cta: 'Sign In'`, currency `FC Points`, etc.).

---

## 2. New FCM components

### `CategoryCatalog.vue`

Renders the subcategories for the **active FCM category** in `'filter'` page mode.
Driven by the `useStoreCatalog` tree; the card type per subcategory is read from
the data (`cardType` / `cardVariant`) — never from store identity.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `category` | Object | required | A category node from `useStoreCatalog` |
| `baseDelay` | Number | `0` | Section entrance-cascade offset (ms) |

**Behaviour**
- Branches on each subcategory's `cardType`:
  - `'bundle'` → renders a `BundleSkuCard` per item (e.g. Campaign Packs).
  - `'sku'` with a `cardVariant` → renders `SkuImageCard` (variant + staggered delays).
  - otherwise → a **"Coming soon"** stub (reads the subcategory `_title`).
- Renders a `PromoBanner` or a subcategory heading above each group.
- Cross-fades the whole section on category switch — a `key` forces a remount so
  the entrance cascade replays. Card entrance delays stagger per subcategory.
- Tokens: `--motion-duration-base/-exit`, `--motion-ease-decelerate/-accelerate`,
  `--motion-distance-md/-sm`, `--gap-content-default/-loose`, `--pad-surface-l/-xl`,
  `--border-divider`. Grid: 2-up at XS, 4-up at ≥641px (container queries).

### `FeaturedCarousel.vue`

Horizontal, drag-scrollable carousel of featured items (FCM "BEST SELLERS"). Always
visible above the catalogue in filter mode. Auto-measures overflow and shows nav
chevrons only when the list overflows.

| Prop | Type | Default |
|---|---|---|
| `items` | Array | `() => []` |
| `heading` | String | `'BEST SELLERS'` |
| `baseDelay` | Number | `0` |

**Behaviour**
- Renders `BundleSkuCard` children with a staggered `baseDelay + i * 90` ms.
- `useDragScroll()` enables pointer/touch drag-scroll (smooth, respects
  `prefers-reduced-motion`).
- A `ResizeObserver` measures container vs scroll width; chevrons hide when there's
  no overflow (`disabled` state: `opacity: 0.3; pointer-events: none`).
- Flex item width: `calc(72% - 3px)` mobile → `calc((100% - 16px) / 3)` at ≥801px.
- Tokens: `--motion-sku-hover`, `--motion-duration-base` (chevron hover/active scale).

### `SkuImageCard.vue`

Image-led SKU card with two layout variants. **Store-agnostic** — the variant is
chosen by the data layer, not the theme. Mirrors `SkuCard`'s motion contract
(entrance cascade, delayed price reveal, hover lift, press scale, ripple, `'select'`
haptic).

| Prop | Type | Default | Notes |
|---|---|---|---|
| `amount` | Number | `null` | e.g. `460` (null for non-numeric) |
| `currentPrice` | String | required | e.g. `"$2.50"` |
| `skuImage` | String | `null` | Square product art |
| `originalPrice` | String | `null` | crossed-out price |
| `discountPercent` | String | `null` | e.g. `"-49%"` |
| `baseAmount` | Number | `null` | pre-bonus amount; renders bonus line |
| `bonusAmount` | Number | `null` | e.g. `60` |
| `bonusLabel` | String | `''` | e.g. `"Bonus"` |
| `loyaltyPoints` | Number | `null` | MP loyalty; renders inline loyalty row |
| `loyaltyIcon` | String | `null` | SVG icon for the inline loyalty row |
| `currencyLabel` | String | `''` | e.g. `"FC Points"` / `"Silver"` |
| `subtitle` | String | `null` | short description under the amount |
| `backgroundImage` | String | `null` | full-bleed background (panel variant) |
| `variant` | String | `'panel'` | `'panel'` \| `'background'` |
| `animDelay` | Number | `0` | per-card stagger (ms) |
| `baseDelay` | Number | `0` | section cascade offset (ms) |

**Behaviour**
- `'panel'` (default): square art frame at top (≤160×160), text below.
- `'background'` (Figma 2563:3197): oversized, bottom-anchored full-bleed art
  cropped by the card edge, dark overlay for legibility.
- Skeleton shimmer while the image decodes (`@load`/`@error` + `.complete` check).
- Selection goes through `useCheckout().openCheckout()`; fires `haptic('select')`
  on a real open. Inline loyalty row renders when `loyaltyPoints !== null`.
- Image masks/overlays: `--mask-sku-card-bg-fade`, `--gradient-sku-image-card-fade`.

### `BundleGrid.vue`

Thin layout wrapper for bundle cards (slot-only, no props). Single column on mobile,
**2-up from the M breakpoint (801px)**, gap `--gap-content-default`. Receives
`BundleSkuCard` children via the default slot.

### `PageSignInSection.vue`

Page-level sign-in prompt / signed-in profile card, shown after the story carousel
for stores that **require authentication** (`checkout.allowGuest === false`). It
replaces COD:M's guest-lookup `PlayerAccount` section.

- **Signed out:** an L1 surface card with `strings.signIn.pagePrompt` + a CTA
  (logomark icon + `strings.signIn.cta`). The CTA routes on `config.signIn.flow`:
  `'ea-redirect'` → `startEaSignIn()` (opens `EaSignInPage`); otherwise
  `openSignInSheet()`.
- **Signed in:** renders `PlayerCard` with the variant from
  `config.profile.playerCard` (`'nickname-only'` for FCM).
- No props — state-driven via `useAuth`, `useStoreConfig`, `useStoreStrings`,
  `useStoreAssets`. Tokens: `--bg-sku-card-default`, `--bg-action-signin` (EA red
  in FCM), `--gap-content-loose`, `--border-soft`.

### `EaSignInPage.vue`

Simulated **EA Account** sign-in overlay — FCM's `'ea-redirect'` flow. Mounted in
the `DeviceFrame` `#overlay` layer alongside `SignInLoader`. No props; driven by
`useAuth` (`eaSignInOpen`, `completeEaSignIn()`, `cancelEaSignIn()`).

- Slides up from the bottom (`--motion-modal-enter` / `--motion-modal-exit`); dark
  navy EA Account styling via local `--ea-*` custom properties.
- Email/password inputs are decorative; a 6-item social-provider grid (4+2) uses
  `--brand-meta/-steam/-xbox/-playstation`.
- **Prototype shortcut:** every interactive element bubbles to the root `@click`,
  so any tap completes sign-in and triggers the success snackbar.

### `PlayerCard.vue`

Reusable player-identity card (ghost surface, hairline border). Used by
`AccountPopover`, `PlayerAccount` (guest lookup), and `PageSignInSection`.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | String | required | display name |
| `idMasked` | String | `'**** 9859'` | masked account ID |
| `level` | String \| Number | `80` | player level |
| `rank` | String | `'Rookie 1'` | MP rank |
| `avatarSrc` | String | `null` | 48×48 circle (optional) |
| `variant` | String | `'full'` | `'full'` \| `'nickname-only'` |
| `label` | String | `null` | category label (FCM: `"Player Profile"`) |

**Behaviour**
- `'full'` (COD:M): avatar + name + masked-ID row + level/rank row.
- `'nickname-only'` (FCM): optional `label` (soft utility text) above the display
  name; avatar, ID, and stats hidden.
- The avatar only renders when `avatarSrc` is supplied **and** the variant is not
  `'nickname-only'`. Tokens: `--surface-ghost`, `--border-soft`,
  `--radius-container-xs`, `--size-img-l` (48px).

---

## 3. Existing components made FCM-aware

### `App.vue` — catalog `'filter'` vs `'page'` mode

`const isFilter = computed(() => config.value.catalog.mode === 'filter')` is the
top-level switch. In filter mode FCM renders: `CategoryNav` in `'filter'` mode, a
top subcategory nav (FCM-only `v-if`), a standalone Best-Seller hero, the always-on
`FeaturedCarousel`, and the active category's `CategoryCatalog`. COD:M (`'page'`)
keeps its bespoke single-scroll sections (best-seller card + carousel, bundle, new
users, CP). SkuList layout flows from `config.skuList.layout`.

### `SkuList.vue` — layout variants

`layout` prop (`'wrap'` default) passed from `App.vue` as the store's
`config.skuList.layout`: `'wrap'` = flex-wrap 2-up→4-up grid; `'columns'` = 1-col
mobile → 2-col at 801px (COD:M); `'stack'` = single column of horizontal row cards.

### `PurchaseSheet.vue`'s checkout step — loyalty banner *(v0.62.0: moved from `CheckoutSheet.vue`)*

Gated by `config.checkout.loyalty && selectedItem?.loyaltyPoints != null`. Renders
the `"{label} {points}"` strip (`config.checkout.loyalty.label` = "You will earn")
with `assets.brand.loyaltyIcon` (MP Simple). Styled by `--bg-loyalty-banner` /
`--checkout-loyalty-overlap` / `--shadow-checkout-footer` (FCM theme). The footer
overlaps the ribbon by the overlap token (16px) with a tight dark upward cast so it
reads as a floating card; the overlap + shadow overrides **must** live in the
`html[data-theme="fcm"]` block — in the plain `[data-theme]` block they lose to the
later `extensions.css` `:root` literals by source order (web-store-tokens §3).
COD:M's `checkout.loyalty` is `null`, so the banner never renders there. The footer also hides Coda branding and the rating
badge via `showPoweredByCoda` / `showRating`.

### `PurchaseSheet.vue`'s info step (`InfoStepBody`/`InfoStepFooter`) — SKU info step (`config.itemSummary`, v0.59.0; components renamed in v0.62.0 when the standalone `ItemSummarySheet.vue` was folded into `PurchaseSheet`)

COD:M's bundle-breakdown step (opened from a `BundleSkuCard` child-item tap)
gained a config-driven FCM variant instead of a second component — every
opt-in below defaults off, so COD:M's sheet renders exactly as before:

- `config.itemSummary.titleFromItem` — header reads the tapped SKU's own
  title (`selectedBundle.title`) instead of a static `strings.itemSummary.heading`.
- `config.itemSummary.showProduct: false` — drops the banner/account-chip
  product block entirely (FCM's Figma has none; the header already carries
  the SKU name).
- `config.itemSummary.footer: 'buyNow'` — swaps the footer for the same
  price/CTA/rewards content as `BuyNowBar` (`.isum__buynow-*` classes,
  content copied from `BuyNowBar.vue`) — **minus** the terms link, dropped in
  v0.60.6 (`BuyNowBar`'s own terms link is unaffected). BUY NOW calls `openCheckout()` +
  `openPaymentSheet()` (advances `PurchaseSheet` into its payment step, not
  the checkout step — see `usePurchaseFlow`'s `usesPaymentView`); SIGN IN
  redirects to EA when `config.signIn.flow === 'ea-redirect'` — and, since
  v0.59.1, also registers the selection into `useCheckout` first and sets
  `pendingBuyNowSignIn` (see `useCheckout.js`'s `watch(signedIn, ...)`), so
  completing sign-in jumps straight into the payment step instead of
  reopening the info step. `BuyNowBar.onSignIn()` sets the same flag for its
  own SIGN IN button.
- `config.itemSummary.compactAccordion` — `ItemSummaryAccordion` rows drop
  the rarity-tinted thumb (text + chevron only).
- `.sheet--compact .sheet__body { padding-top: var(--pad-surface-l) }` — a
  looser header→body gap than the default sheet's implicit `--pad-surface-m`,
  since the compact variant has no product block directly under the header.

**Trigger — the `(i)` icon, not a card tap.** A new outline-style `(i)`
`MaterialIcon` (`outlined/info`) is appended to a SKU/bundle card's title in
hyperlink colour (`SkuImageCard.vue`'s `prod` + default templates,
`BundleSkuCard.vue`), gated on a new `infoItems` prop — `null` omits the icon
entirely. Tapping a card itself is unchanged (docks `BuyNowBar` as before);
the icon calls `event.stopPropagation()` then `openItemSummary(...)`.

**Eligibility is data-driven, in `catalog.js`.** Every catalogue item builds
an `infoItems` array (`{ image, name, quantity, description }` rows, shaped
for `ItemSummaryAccordion`) *except* the whole Top Ups category (FC Points,
2x FC Points, Silver) — those get `infoItems: null`. Campaign Packs map their
real contents (player item + draft vouchers); standalone SKUs (Daily
Boosters, Daily FP Deals, Star Pass, Special Offers) get a single summary row
built from the SKU's own art + name. The six Daily FP Deals stems (named
`"<amount> FC Bundle"` on the card/header) get an `INFO_ITEM_CURRENCY_OVERRIDES`
swap so their accordion row reads `"<amount> FC Points"` — what's actually
granted — without touching the deal's own displayed name anywhere else.

**Buy Now handoff (v0.62.0 — automatic, no bespoke protocol).** Tapping BUY NOW
no longer hands off between two mounted sheet components at all — the info
step and the payment step are both just steps inside the same persistent
`PurchaseSheet`/`BaseSheet` instance, so `BaseSheet`'s `contentKey` resize +
cross-fade engine handles the grow/cross-fade automatically whenever
`usePurchaseFlow`'s `currentStep` changes. The old `useSheetTransition`
singleton (`handoffHeight`/`isHandoffExit`) and its `panelRef` +
`onSheetBeforeEnter`/`onSheetEnter`/`onSheetAfterEnter` hooks are deleted —
see `docs/component-breakdown.md`'s `PurchaseSheet.vue` / `BaseSheet.vue`
entries.

### `NavBar.vue` — MP icon, rewards pill, sign-in routing

- **Signed out:** standalone MP icon when `!signedIn && assets.brand.mpColourIcon`.
- **Signed in:** MP rewards pill when `signedIn && config.profile.showLoyaltyPill &&
  assets.brand.mpColourIcon` — shows `loyaltyPoints.toLocaleString()`.
- The SIGN IN button routes on `config.signIn.flow === 'ea-redirect'` →
  `startEaSignIn()`; otherwise `openSignInSheet()`. The button icon is
  `assets.brand.navSignInIcon` (MP Colour for FCM).

### `AccountPopover.vue` — config-driven PlayerCard

Renders `PlayerCard` with `:variant="config.profile.playerCard"`,
`:avatar-src="config.profile.avatarStyle === 'image' ? assets.content.avatar : null"`,
and `:label="strings.account.playerCardLabel"`. For FCM this resolves to the
`'nickname-only'` variant, no avatar, and the "Player Profile" label.

### `PlayerAccount.vue` — guest lookup (COD:M only)

The Player-ID guest-lookup section. Shown only when `checkout.allowGuest === true`
(COD:M). FCM sets it `false`, so the section is hidden and `PageSignInSection`
stands in its place.

---

## 4. The FCM catalogue data layer (`useStoreCatalog.js`)

FCM's filter page model is fed by `useStoreCatalog`, the data sibling of the
config/strings/assets layers. It returns a category tree for `'filter'`-mode stores
(`null` for `'page'`-mode COD:M):

```
[ { id, label, subcategories: [ { id, label, cardType, cardVariant, items[] } ] } ]
```

- `cardType: 'bundle'` → items shaped for `BundleSkuCard`; `'sku'` → `SkuImageCard`
  (when a `cardVariant` is present) or a "Coming soon" stub.
- SKU/banner/asset images resolve at build time via `import.meta.glob` over
  `src/stores/fcm/img/content/**` — no manual per-image imports.
- Prices and loyalty values are placeholders; swap the helper functions for real
  data without touching any component.

---

## 5. Multi-level nav pilot (`fcmNavModel`, v0.50.0)

FCM only pilots a second navigation model — L1 intent (Store / Loyalty & Rewards
/ Events) → L2 categories → L3 subcategories — behind a runtime feature flag,
`useFeatureFlags` `FLAG_DEFS['fcmNavModel']` (`'dropdown' | 'flat' |
'flat-bottom-s'`), scoped to FCM via `config.nav.multiLevel`
(`src/stores/fcm/store.js`) so no other store's nav can be affected even if
the shared flag value were somehow non-`'off'`. Toggle it from the dev
toolbar's store-scoped select or the `/` command palette.

Two presentations have been removed from the selectable option list — the
underlying implementations are left in place, just unreachable via the
toolbar/console, in case either is revisited:
- `'off'` (the legacy bottom-categories + top-subcategories nav) — hidden so
  testers can't accidentally switch back to it mid-test-round.
  `App.vue`'s `isMultiLevel`/`navModel` computeds still check `!== 'off'`.
- `'stacked'` (L1 + separate, always-visible L2 AND L3 bars — three
  navigation layers on screen at once) — removed after a round of internal
  testing called it out as the weak variant.
  `CatalogNavStack.vue`'s `presentation="stacked"` branch is untouched.

`'dropdown'`, `'flat'`, and the newer `'flat-bottom-s'` remain for further
testing; the flag now defaults to `'dropdown'`.

`'flat-bottom-s'` is `'flat'`'s tab list (every subcategory flattened, no L2)
with a RESPONSIVE dock instead of a fixed one: on S screens and smaller
(≤800px — the same S/M boundary used throughout the prototype, e.g.
`CategoryCatalog.vue`'s own `@container (min-width: 801px)` divider rule) it
docks to the BOTTOM of the screen via a plain stock `CategoryNav`
`variant="bottom"` (identical to the legacy bottom nav) mounted in `App.vue`'s
DeviceFrame `#overlay` slot; on M/L it falls back to exactly `'flat'`'s
top-docked row inside `CatalogNavStack`. The bottom bar can't live nested
inside `CatalogNavStack` itself — that component is mounted in NORMAL
document flow, i.e. inside `.device__screen`'s own SCROLLING content, where
`position: absolute/fixed; bottom: 0` resolves against the full scroll
height, not the visible viewport; `.device__overlay` (the `#overlay` slot)
is deliberately OUTSIDE that scroll container for exactly this reason — the
legacy bottom nav has always lived there, never inline.

The S/M switch itself is JS-measured (`App.vue`'s `isFlatBottomSmall`, a
`ResizeObserver` on `.device__screen`, rebuilt on every device-frame change),
NOT a CSS `@container` query on the bottom bar — `.device__overlay` is a
SIBLING of `.device__screen`, not a descendant, so it has no `@container`
containment context to resolve against (and deliberately isn't given its own
`container-type`, either — DeviceFrame.vue's own comment explains that would
break `position: fixed` containment for the sign-in loader / checkout modal /
snackbar that also live in that slot). `CatalogNavStack`'s own top row, by
contrast, IS correctly hidden by a plain `@container (max-width: 800px)` rule
(`.nav-stack--hide-s`) — it's mounted inline inside `.device__screen`'s
scrolling content, so it has the right containment context.
`--nav-stack-bottom-h` (live-measured, mirroring `--nav-stack-h`) reserves
matching space below the last section — 0 automatically on M/L, since the bar
it measures doesn't mount there at all.

- **`useStoreIntents()`** (`src/composables/useStoreCatalog.js`) — returns FCM's
  `intents` tree (`src/stores/fcm/intents.js` builds the Loyalty/Events stub
  categories around the real `catalog` tree; `null` for every other store).
- **`NavBar.vue`'s L1 row** — a second in-header tab row (Store/Loyalty/Events),
  full-bleed, centred-tab, no underline; inherits NavBar's existing scroll
  hide/show for free and is counted in `--navbar-h` automatically.
- **`CatalogNavStack.vue`** (new) — the L2/L3 surface. Mounts in normal document
  flow right after the Best Sellers section (deliberately not part of this
  nav) and docks via `position: sticky` — visible inline until scrolled past,
  then sticks below NavBar's L1 row, undocking again when scrolled back above
  it. Presentations: `'stacked'` (L2 + L3 rows, unreachable via the flag —
  see above), `'dropdown'` (one breadcrumb-triggered grouped select), `'flat'`
  and `'flat-bottom-s'` (one row, every subcategory flattened, no L2 — the
  latter hides this row entirely on S screens, see above). All categories/subcategories render on the page at once
  (no filtering) — L2/L3 taps `scrollIntoView`; an internal scroll-spy drives
  the highlight/breadcrumb the other direction. Mounted Store-only
  (`isStoreIntentActive`, `App.vue`) — Loyalty & Rewards and Events are each a
  single stub category with a single "coming soon" subcategory, so there's
  nothing real for an L2/L3 nav to switch between; showing one dead tab was
  worse than no nav. Applies to all three presentations, since they share
  this one mount point.
- **`CategoryNav.vue`'s `variant="row"` + `level="l2"|"l3"`** — a third variant
  alongside the pre-existing `'bottom'`/`'top'`, used only by `CatalogNavStack`:
  a static in-flow tab strip with no own surface/background/animation, so two
  can stack inside the wrapper's single frosted container.
- **`NavDrawer.vue`** — when given `intents`, renders L1 as expandable groups
  (children = that intent's categories) with a further L3 tier per category
  (subcategories), gated the same way `CatalogNavStack`'s own L3 row is (hidden
  for a category with only one, e.g. gifts/best-sellers).
- **`--gradient-nav-selected` → `--bg-nav-selected`** — the L1/L2/L3 selected-
  tab background token (`src/tokens/ds/semantics.css` default `transparent`,
  FCM override in `themes/fcm.css`). Landed first as a bespoke gradient, later
  replaced with `--bg-indicator-neutral-subtle` — see `themes/fcm.css`'s own
  comment for the history.
- **Real device status bars** (`DeviceFrame.vue`, store-agnostic — every store
  benefits) — iOS/Android time + signal/wifi/battery content now fills the
  `safeTop` band that was previously just reserved empty space. This is why
  `CatalogNavStack` and the legacy `.cat-nav--top` bar dock at
  `max(var(--navbar-h), var(--safe-top))`, not `--navbar-h` alone: NavBar's
  hidden state reports `--navbar-h: 0`, and the status bar never hides.

## 6. Production SKU card design pilot (`fcmSkuCardModel`)

FCM's SKU cards in this prototype are new, unreleased designs. A second
runtime flag, `fcmSkuCardModel` (`'new' | 'prod'`), swaps them for the cards
actually live in production today — scoped to FCM via `config.sku.
prodCardDesigns` (`src/stores/fcm/store.js`), the exact same two-gate pattern
as `fcmNavModel`. Resting state only; prod's selected-state design is
specced (see the FE handoff plan) but not built.

The isolated FCM build (`build:fcm`/`dev:fcm`, `__STORE_LOCKED__`) ships
production designs only and has no toggle at all — `fcmSkuCardModel` is
marked `hideWhenLocked` (see `useFeatureFlags.js`) so its dev-toolbar/console
control disappears, and `App.vue`'s `skuCardModel` short-circuits to `'prod'`
without reading the flag. The multi-store prototype build keeps the toggle
for comparing new vs. prod designs.

Prod has exactly two SKU templates:

- **Regular SKU** → `SkuImageCard.vue`'s new **`variant="prod"`** — a third
  layout alongside the existing `'panel'`/`'background'`, chosen via a new
  `cardVariant` override prop on `CategoryCatalog.vue` (`null` by default,
  leaves the catalogue data's own per-subcategory `cardVariant` untouched;
  `'prod'` forces every subcategory to it regardless). Square corners
  (`border-radius: 0`), an *outside* 1px hairline (`outline`, not the other
  variants' gradient mask-border), info block ABOVE the art (opposite order
  from `'panel'`), a dark reward strip, then a champagne-gold price bar. Also
  used for TWG/Campaign Packs (`CategoryCatalog.vue`'s `cardType === 'bundle'`
  branch) and Gifts (`App.vue`, both the multi-level and legacy-filter
  branches) in place of `BundleSkuCard` — prod has no separate bundle
  template. A new `title` prop takes precedence over amount+currencyLabel so
  bundle/gift items (which have a real product name, not a bare amount) can
  render through this same variant. Gifts' "CLAIM" CTA needs no special-casing:
  `currentPrice` is already the literal string `'Claim'` in the catalogue data,
  uppercased by the card's own CSS. Card background is the shared raster image
  `--bg-image-sku-card-prod` (`src/stores/fcm/img/content/SKU Banners/Prod SKU
  Card BG.webp`), not per-SKU art. Deliberately omits two Figma elements with
  no backing prop on this card (an inline "info" glyph beside the title, a
  "Purchase Limit" line).
- **Highlighted SKU** → new **`ProdHighlightedSkuCard.vue`**, mounted at
  `App.vue`'s `BestSellerCard` slot via a plain `v-if="isProdCards"` /
  `v-else`. It replaces `BestSellerCard` only at that one hardcoded-data hero
  mount — it never touches `CategoryCatalog`'s `cardType`/`cardVariant` path,
  same as `BestSellerCard` itself. Structurally a **landscape** two-column
  card (text + gold CTA pill left, product art right, a "RECOMMENDED" tag
  overhanging the top-left corner) — not a restyle of `BestSellerCard`'s
  stacked layout, hence a separate component. No ring/bloom effect. Background
  is `--bg-image-sku-card-prod-highlighted` (`Prod Highlighted SKU BG.webp`).
  The tag's click/ripple handling lives on a dedicated `.prod-highlighted-
  sku__surface` layer BEHIND the tag/content (not on the card root) — `v-ripple`
  forces `overflow: hidden` on whatever element it's bound to (to contain the
  ripple wave), which would otherwise clip the tag's intentional overhang.
  The prod flag also hides the separate "Best sellers" recommendations
  carousel (`FeaturedCarousel`) entirely — prod merchandises only the single
  highlighted hero, no second carousel.

New tokens (all inert `none`/`transparent` by default in `semantics.css`;
real values only in `themes/fcm.css`, following the exact convention
`--bg-nav-selected` established): `--bg-image-sku-card-prod` (regular card's
own background image), `--border-sku-card-prod`, `--gradient-sku-card-prod-price`,
`--bg-sku-card-prod-reward`, `--border-sku-card-prod-highlighted`,
`--bg-image-sku-card-prod-highlighted` (highlighted card's own background
image), `--gradient-sku-card-prod-gold` (+ `-angle`, since the CTA and the
"RECOMMENDED" tag share the same four colour stops at two different angles),
`--text-sku-tag-popular`, `--bg-loyalty-badge-prod`. Plus one store-agnostic
addition in `extensions.css`: `--text-shadow-sku-card-prod`, the legibility
shadow `ProdHighlightedSkuCard`'s text needs sitting directly over art.

Prod's price uses Cruyff Sans "Expanded Heavy" (900) — a family/weight this
repo doesn't ship (only Regular/Medium/Bold). Approximated with Bold + a
touch of letter-spacing; swap for the real face if it's ever supplied.

## 7. L3 nav prominence, dropdown-trigger states, and a compact mobile toolbar

Internal-testing feedback follow-ups on the `fcmNavModel` pilot (section 5):

- **Bigger L3 tabs** — `CategoryNav.vue`'s `level` class now applies
  regardless of `variant` (previously `variant="row"` only), so `level="l3"`
  also tags the `flat-bottom-s` bottom-docked bar. A new `.cat-nav--l3` rule
  (not `--row`-scoped, so it covers both the top-docked row and the
  bottom-docked bar) bumps min-width to `--size-control-xxl` (72px, one step
  past L2's 64px) and label font-size to `--sys-size-body-main`. Along the
  way, fixed a real dead-token bug: `--size-control-xl` was referenced by the
  original L2/L3 min-width rule but never aliased in `space.css`, silently
  falling back to `auto` since it was written — now aliased, plus the new
  `--size-control-xxl` one step up.
- **Resting→selected transition** — the gradient fill moved from a direct
  `.is-active` background-image (not reliably transitionable across
  browsers) to an always-present `::before` layer with an opacity fade. The
  accent-stroke `::after` now always renders (collapsed at rest) and grows
  via `transform: scaleX()` from a `--tab-grow-origin` custom property set on
  whichever tab is currently active, driven by a small local scroll-direction
  detector in `CategoryNav.vue` (mirroring `NavBar.vue`'s private scroll-delta
  pattern — no reusable one existed). Scrolling down grows the new tab's
  stroke from the left; scrolling up, from the right. The bottom-docked bar
  gets the same stroke on its top edge (mirroring the existing top/bottom
  edge-flip convention), with its own plain border-top re-sourced through
  `--border-nav-selected` so the two don't visually double up.
- **Dropdown popover (`'dropdown'` presentation)** — the visible parent-
  category label above each group of subcategories was removed (read as
  clutter); `group.label` still reaches assistive tech via the group
  `<div>`'s own `aria-label`, just no longer rendered as text — a divider is
  the only remaining separation between groups. The trigger button
  (`FilterDropdown.vue`) gained hover/keyboard-focus/pressed states — hover
  and focus-visible both apply `--surface-frost-hover` (the same wash the
  panel's own option rows already use, per explicit instruction to reuse the
  hover treatment rather than a separate focus-ring), and active adds a
  subtle press-scale via a new generic `--motion-control-press-scale` token
  (`motion.css`) — the only prior precedent, `--motion-sku-press-scale`, is
  scoped to SKU cards by name.
- **Compact mobile `DeviceToolbar`** — on a real touch device
  (`useDeviceDetect`'s `isMobile`, distinct from the toolbar's own
  iPhone/Android/Responsive device-**frame** picker), the library/inspector/
  screenshot icon segment is hidden entirely, and the remaining segments
  (store select + every enum feature-flag select, including `fcmNavModel`)
  become a single horizontally-scrollable row (`.toolbar__body-inner--compact`)
  instead of wrapping into several stacked rows of native selects — one swipe
  + one tap to change variant, not a scroll through a wall of controls.
  Desktop's layout is unchanged.

**Last updated:** August 2026 · v0.62.0 — `CheckoutSheet.vue`, `ItemSummarySheet.vue`, `OrderSummarySheet.vue` and `useSheetTransition.js` are deleted; every store's purchase flow (including FCM's Buy Now pilot) now lives on one persistent `PurchaseSheet` + `BaseSheet` surface (info step / payment step / checkout step, swapped via `BaseSheet`'s resize + cross-fade engine, content resolved through a new `src/content/sheetContent.js` descriptor layer). The v0.61.1 Promo Code/T&C polish fixes below are carried over verbatim into `PaymentStepBody.vue`, the new home of that content. See `docs/component-breakdown.md`'s `BaseSheet.vue`/`PurchaseSheet.vue`/`usePurchaseFlow.js`/`sheetContent.js` entries for the full architecture. This file's section headers below are updated to match; historical entries in the changelog still refer to the old component names as they were at the time.

*Previously:* August 2026 · v0.61.1 — Promo Code / T&C polish: fixed the details modal's CLOSE button (needed `pointer-events: auto` — it's outside `.sheet__panel`'s own opt-in from the ancestor overlay's `pointer-events: none`) and its exit transition (needed an explicit `:duration`, since Vue's CSS auto-detection doesn't look at descendant elements); left-aligned the modal header; centered the `PromoCode` header row as a compact group; tightened the T&C bar's spacing so it reads as part of the payment list instead of covered by the footer's shadow; hyperlink-styled "User Agreement"/"Terms & Conditions"/"Privacy Notice" in the body copy.

*Previously:* August 2026 · v0.61.0 — `OrderSummarySheet` (the FCM Buy Now pilot's payment step) gained a Promo Code section: new `PromoCode.vue` component below the renamed "Total Payment" row, prototype demo code `SAVE10` for a 10% discount, and a "Tap to see terms and conditions" success state opening a small centered details modal.

*Previously:* August 2026 · v0.60.8 — FCM's bundle info-sheet rows (`bundleInfoItems()` in `src/stores/fcm/catalog.js` — the TWG Pack's player-item + draft-voucher breakdown, shown via `ItemSummaryAccordion` in the `(i)`-icon info sheet) are now expandable: each row's `description` is set to its own name as a placeholder, since `ItemSummaryAccordion` only renders a chevron/expand affordance when `media || description` is truthy. Previously these rows had neither field and rendered as disabled, non-expanding headers.

*Previously:* August 2026 · v0.60.7 — `CheckoutSheet` and `OrderSummarySheet` (the FCM Buy Now pilot's payment step) gained a static Terms & Conditions legal bar below the payment-channel list (`common.checkout.termsHeading`/`termsBody`, `.text-style-utility-default-bold` heading over `.text-style-utility-micro-regular` body) plus a "View Terms and Conditions" link 16px below the CTA that scrolls to it. Both sheets' sticky footer now enters/exits as its own layer (settles a beat behind the panel on open, detaches ahead of it on close — see `docs/motion-tokens.md`). `BuyNowBar`'s own terms link was removed (redundant with the new legal bar).

*Previously:* August 2026 · v0.60.6 — removed the "View Buy Now Terms & Conditions" link from `ItemSummarySheet`'s FCM `footer: 'buyNow'` variant (§ 3) and its now-dead `.isum__buynow-terms` CSS rule; that footer is now just the price/CTA row + rewards line. `BuyNowBar`'s own terms link is unaffected.

*Previously:* August 2026 · v0.59.1 — Buy Now sign-in now auto-advances: completing sign-in from either `BuyNowBar` or the `ItemSummarySheet` info-sheet footer (§ 3) jumps straight into `OrderSummarySheet` via a new `pendingBuyNowSignIn` flag on `useCheckout`, instead of leaving the user on the bar or reopening the info sheet. Also: the compact info sheet's `max-height` cap raised to 95% on S and smaller screens.

*Previously:* August 2026 · v0.59.0 — SKU info bottom sheet: `ItemSummarySheet` gained a `config.itemSummary` FCM variant (see § 3), triggered by a new `(i)` icon on SKU/bundle card titles instead of a card tap, with a data-driven `infoItems` eligibility field in `catalog.js` (everything except Top Ups) and a seamless height-morph handoff into `OrderSummarySheet` on Buy Now.

*Previously:* August 2026 · v0.54.0  
See also: [`design-tokens-fcm.md`](design-tokens-fcm.md) ·
[`multi-store-whitelabel.md`](multi-store-whitelabel.md) ·
[`component-breakdown.md`](component-breakdown.md)
