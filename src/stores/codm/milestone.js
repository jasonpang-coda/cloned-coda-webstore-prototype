/**
 * COD:M — "Armory Point Loyalty Rewards" campaign data. Behind the
 * codmMilestoneRewards dev flag (see useFeatureFlags.js / store.js's
 * config.nav.milestoneFlag) — the whole feature is off by default.
 *
 * "Loyalty Points" in this campaign IS COD:M's existing Armory Point (AP)
 * programme — no separate currency. Each tier's `threshold` is an AP amount;
 * the AP icon/label come from the store's existing loyalty assets
 * (assets.brand.loyaltyIcon / loyaltyIconColour), gated the same way as
 * every other loyalty surface (config.checkout.loyalty !== null).
 *
 * No dedicated per-tier reward art exists yet for COD:M, so every tier's
 * card image below reuses an existing COD:M content asset (CP coins, the
 * crate, gift art) rather than introducing new artwork — same "reuse before
 * inventing" rule as everywhere else in this store module. The hero banner
 * uses dedicated campaign art (milestone-rewards-hero.jpg).
 * `demoPoints` (not a scenario flag) drives the preview state, since this
 * feature has a single on/off dev flag rather than FCM's multi-value
 * scenario preview.
 */

import { formatNumber } from '../../utils/formatNumber.js'
import cpCoin420       from './img/content/CP/420.webp'
import cpCoin460       from './img/content/CP/460.webp'
import cpCoin960       from './img/content/CP/960.webp'
import cpCoin2600      from './img/content/CP/2600.webp'
import cpCoin5400      from './img/content/CP/5400.webp'
import skuCrate        from './img/content/crate.webp'
import giftSecretCache from './img/content/Gifts/Secret_Caches.webp'
import giftEmote       from './img/content/Gifts/Affirmative_Epic_Emote.webp'
import giftGun         from './img/content/Gifts/LAG_53_-_New_Empire.webp'
import skuMidnightSunHero from './img/content/midnight-sun-bundle-hero.webp'
import heroImage          from './img/content/milestone-rewards-hero.jpg'

// 10 tiers, in ascending AP order. `amount` is the numeric quantity (null for
// a single named item, e.g. a crate/gift, with no count); `subtitle` below
// formats it through the shared formatNumber() helper.
export const TIERS = [
  { title: 'Boot Camp',    amount: 420,  unit: 'CP', image: cpCoin420,          threshold: 150 },
  { title: 'Recruit',      amount: null, unit: 'Epic Secret Cache',        image: giftSecretCache,    threshold: 350 },
  { title: 'Specialist',   amount: 960,  unit: 'CP', image: cpCoin960,          threshold: 600 },
  { title: 'Operator',     amount: null, unit: 'Crate',                   image: skuCrate,           threshold: 1000 },
  { title: 'Sharpshooter', amount: null, unit: 'Affirmative Epic Emote',  image: giftEmote,          threshold: 1500 },
  { title: 'Veteran',      amount: 2600, unit: 'CP', image: cpCoin2600,         threshold: 2200 },
  { title: 'Elite',        amount: null, unit: 'LAG 53 - New Empire',     image: giftGun,            threshold: 3000 },
  { title: 'Commander',    amount: 5400, unit: 'CP', image: cpCoin5400,         threshold: 4000 },
  { title: 'Warlord',      amount: null, unit: 'Midnight Sun Bundle',     image: skuMidnightSunHero, threshold: 5200 },
  { title: 'Legend',       amount: 460,  unit: 'CP', image: cpCoin460,          threshold: 7000 },
].map(tier => ({
  ...tier,
  subtitle: tier.amount != null ? `${formatNumber(tier.amount)} ${tier.unit}` : tier.unit,
}))

// Legend (the top tier) is the campaign's headline reward — the hero banner
// showcases its real art/name instead of separate placeholder campaign copy.
const legendTier = TIERS[TIERS.length - 1]

export const milestone = {
  header: 'Armory Point Loyalty Rewards',
  hero: {
    image: heroImage,
    /** The Legend tier's reward art, shown alongside the banner text. */
    badgeImage: legendTier.image,
    tagLabel: 'TOP REWARD',
    title: legendTier.subtitle,
  },
  description: 'Earn rewards every time you shop! Collect Armory Points with each purchase to unlock better rewards as you level up.',
  learnMoreLabel: 'Learn more',
  learnMoreUrl: '#',
  tiers: TIERS,
  pointsUnit: 'AP',
  // Fixed demo balance (no scenario flag) — mid-ladder so the preview shows
  // claimed, claimable, and locked tiers all at once.
  demoPoints: 1200,
}
