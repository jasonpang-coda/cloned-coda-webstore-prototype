/**
 * Generic loyalty-tier derivation for the "Milestone Rewards" page
 * (MilestoneRewards.vue). Store-agnostic — every store's milestone.js module
 * supplies its own `tiers` array (ascending threshold order); this file owns
 * only the pure state-derivation logic, kept out of both the per-store data
 * modules and the shared component so neither has to import the other.
 */

/**
 * deriveRewardsState(tiers, currentPoints) — the "frontier" rule: the last
 * tier whose threshold has been reached is 'claimable' (awaiting claim);
 * every tier before it is already 'claimed'; every tier after it is still
 * 'locked'. Only one tier is ever 'claimable' at a time, matching the card
 * rail's "one reward ready to claim, the rest earned-or-pending" narrative.
 */
export function deriveRewardsState(tiers, currentPoints) {
  let frontier = -1
  for (let i = 0; i < tiers.length; i++) {
    if (tiers[i].threshold <= currentPoints) frontier = i
  }
  return tiers.map((tier, i) => ({
    id: `milestone-${i + 1}`,
    ...tier,
    state: i < frontier ? 'claimed' : i === frontier ? 'claimable' : 'locked',
    progress: i > frontier ? currentPoints : null,
  }))
}

/**
 * deriveProgressionSummary(tiers, currentPoints) — the level label + "Next
 * Level: X/Y" text. `targetIndex` is the first tier not yet claimed: if it's
 * the currently-claimable one, "next" points past it to the tier after; if
 * it's still locked (nothing reached yet), "next" points at its own
 * threshold. Returns `nextThreshold: null` once every tier is claimed (maxed
 * out) — the consumer hides the "Next Level" line in that case.
 */
export function deriveProgressionSummary(tiers, currentPoints) {
  const rewards = deriveRewardsState(tiers, currentPoints)
  const targetIndex = rewards.findIndex(r => r.state !== 'claimed')
  if (targetIndex === -1) {
    return { levelLabel: tiers[tiers.length - 1].title, nextThreshold: null }
  }
  const target = tiers[targetIndex]
  const nextThreshold = rewards[targetIndex].state === 'claimable'
    ? tiers[targetIndex + 1]?.threshold ?? null
    : target.threshold
  return { levelLabel: target.title, nextThreshold }
}
