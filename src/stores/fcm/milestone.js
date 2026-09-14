/**
 * FC Mobile — "Milestone Rewards" campaign data (TOTY 26 Loyalty Rewards).
 * Figma: node 2094:251 (overall), 2094:267 (rewards). Progression layout
 * adapted from the PvZ3 step-track reference (woddrskgFphghfZ87d3H9S,
 * node 5131:261276) — a connected node/line track above the reward rail,
 * not a single summary bar.
 *
 * "Loyalty Points" in this campaign IS FCM's existing MP (Match Points)
 * programme — no separate currency. Each tier's `threshold` is an MP amount;
 * the MP icon/label come from the store's existing loyalty assets
 * (assets.brand.loyaltyIcon / loyaltyIconColour), gated the same way as every
 * other loyalty surface (config.checkout.loyalty !== null).
 *
 * This module stays a plain, static data module — no Vue reactivity — per
 * the whitelabel architecture (store modules own colour/copy/assets/config,
 * not runtime flag state). `currentMp` is supplied by the CALLER (from the
 * fcmMilestoneScenario toolbar flag — see MilestoneRewards.vue) and run
 * through the pure `deriveRewardsState`/`deriveProgressionSummary` helpers in
 * ../../utils/milestoneRewards.js (shared across every store's campaign, so
 * MilestoneRewards.vue never has to import one store's module directly), the
 * same way App.vue combines a static config capability with a runtime flag
 * rather than baking the flag into a store module.
 */

import heroImage from './img/content/Milestone Rewards/milestone banner.webp'
import gems1000  from './img/content/Milestone Rewards/1000 Gems.webp'
import gems250   from './img/content/Milestone Rewards/250 Gems.webp'
import gems500   from './img/content/Milestone Rewards/500 Gems.webp'
import gems1500  from './img/content/Milestone Rewards/1500 Gems.webp'
import voucher   from './img/content/Milestone Rewards/Draft Voucher.webp'
import fcPoints300 from './img/content/Milestone Rewards/300 FC Points.webp'
import { formatNumber } from '../../utils/formatNumber.js'

// 10 tournament-tier rewards, in ascending MP order. `amount` is the numeric
// quantity (null for a single named item, e.g. a voucher, with no count);
// `subtitle` below formats it through the shared formatNumber() helper so a
// real reward amount dropped in later (≥1,000) comma-formats automatically.
export const TIERS = [
  { title: 'Qualifier Round 1', amount: 1000, unit: 'Gems',       image: gems1000,     threshold: 30 },
  { title: 'Qualifier Round 2', amount: 250,  unit: 'Gems',       image: gems250,      threshold: 100 },
  { title: 'Group Stage 1',     amount: 500,  unit: 'Gems',       image: gems500,      threshold: 200 },
  { title: 'Group Stage 2',     amount: 1500, unit: 'Gems',       image: gems1500,     threshold: 500 },
  { title: 'Round of 32',       amount: null, unit: 'Draft Voucher', image: voucher,   threshold: 1000 },
  { title: 'Round of 16',       amount: 1500, unit: 'Gems',       image: gems1500,     threshold: 1500 },
  { title: 'Quarterfinalist',   amount: 1500, unit: 'Gems',       image: gems1500,     threshold: 2000 },
  { title: 'Semi-finalist',     amount: null, unit: 'Draft Voucher', image: voucher,   threshold: 2500 },
  { title: 'Finalist',          amount: null, unit: 'Draft Voucher', image: voucher,   threshold: 3500 },
  { title: 'Champion',          amount: 300,  unit: 'FC Points',  image: fcPoints300,  threshold: 5000 },
].map(tier => ({
  ...tier,
  subtitle: tier.amount != null ? `${formatNumber(tier.amount)} ${tier.unit}` : tier.unit,
}))

// Champion (the top tier) is the campaign's headline reward — the hero banner
// showcases its real art/name instead of separate placeholder campaign copy.
const championTier = TIERS[TIERS.length - 1]

export const milestone = {
  header: 'Champions 26 Loyalty Rewards',
  hero: {
    image: heroImage,
    /** The Champion tier's reward SKU art, shown alongside the banner text. */
    badgeImage: championTier.image,
    tagLabel: 'CHAMPION REWARD',
    title: championTier.subtitle,
  },
  description: 'Earn rewards every time you shop! Collect Loyalty Points with each purchase to unlock better rewards as you level up.',
  learnMoreLabel: 'Learn more',
  learnMoreUrl: '#',
  tiers: TIERS,
  pointsUnit: 'MP',
  // Dev-toolbar enum flag that stands in for the signed-in player's real MP
  // balance (see useFeatureFlags.js / MilestoneRewards.vue). Stores with no
  // scenario flag (e.g. COD:M) set `demoPoints` instead of `scenarioFlag`.
  scenarioFlag: 'fcmMilestoneScenario',
}
