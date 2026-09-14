import { defineTour } from '@coda/tourguide-kit'
import { useTheme } from '../../composables/useTheme.js'
import { useCheckout } from '../../composables/useCheckout.js'
import { useFeatureFlags } from '../../composables/useFeatureFlags.js'

export default defineTour({
  id: 'milestone-rewards',
  title: 'Milestone Loyalty Rewards Claim',
  category: 'Engagement & Rewards',
  description: 'Walkthrough of loyalty milestone campaigns, tracking progress tiers, and claiming unlockable items.',
  defaultTheme: 'fcm',
  defaultDevice: 'iphone',

  setup: async () => {
    const { setTheme } = useTheme()
    const { closeCheckout } = useCheckout()
    const { setFlag } = useFeatureFlags()
    closeCheckout()
    setTheme('fcm')
    // The demo's default scenario is 0 MP (a fresh player) — no tier is
    // claimable yet, so the final "claim" step would have nothing to click.
    // 750 MP is the dev-toolbar scenario that represents a returning player
    // with an already-claimable tier (see MilestoneRewards.vue).
    setFlag('fcmMilestoneScenario', '750')
    await new Promise(r => setTimeout(r, 200))
  },

  steps: [
    {
      id: 'navigate-milestone-tab',
      title: 'Milestone Rewards Navigation Tab',
      explanation: 'Dedicated campaign navigation intent for seasonal loyalty rewards and tiered unlockables.',
      poiSelector: 'milestone-tab',
      poiPlacement: 'bottom',
      holdMs: 2800,
      action: {
        type: 'click',
        target: 'milestone-tab',
        delayBeforeActionMs: 400,
        delayAfterActionMs: 600,
      },
    },
    {
      id: 'view-milestone-rail',
      title: 'Milestone Progress Tracker',
      explanation: 'Visual track displaying accumulated loyalty points against seasonal unlock threshold milestones.',
      poiSelector: 'milestone-rail',
      poiPlacement: 'top',
      holdMs: 3200,
    },
    {
      id: 'claim-tier-reward',
      title: 'Claim Reward Tier',
      explanation: 'Tapping claim unlocks in-game cosmetic bundles and triggers immediate redemption feedback.',
      poiSelector: 'milestone-claim',
      poiPlacement: 'top',
      holdMs: 2600,
      action: {
        type: 'click',
        target: 'milestone-claim',
        delayBeforeActionMs: 400,
        delayAfterActionMs: 800,
      },
    },
  ],
})
