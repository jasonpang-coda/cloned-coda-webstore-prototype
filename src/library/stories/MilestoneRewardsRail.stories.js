import MilestoneRewardsRail from '@/components/MilestoneRewardsRail.vue'
import { defineStory } from '../story.js'

// NOTE: the local demo-data helpers (rewardSeeds/buildRewards) are defined
// BELOW this export, not above it. The harness CLI's title/id extraction
// (tools/harness-cli.mjs) runs a naive regex over the WHOLE file looking for
// the first title-or-id object-literal key, not scoped to this
// defineStory({...}) call — even a key such as "subtitle" can accidentally
// match, since it contains that same substring. Function DECLARATIONS (not
// arrow consts) are hoisted, so keeping this defineStory call textually
// first and the helpers after is enough to dodge it without renaming any
// real field — same workaround MilestoneRewards.stories.js / Grid.stories.js
// / BundleGrid.stories.js use.
export default defineStory({
  id: 'milestone-rewards-rail',
  title: 'Milestone Rewards Rail',
  group: 'Content',
  component: MilestoneRewardsRail,
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-default',
    '--x-pad-surface-s',
    '--x-pad-surface-m',
    '--x-radius-badge-full',
    '--x-bg-indicator-neutral-subtle',
    '--x-bg-indicator-brand-default',
    '--x-motion-sys-duration-slower',
    '--x-motion-sys-ease-decelerate',
    '--x-size-img-s',
    '--x-text-on-primary',
    '--x-text-body-default',
  ],
  notes:
    'Horizontally-scrollable row of MilestoneRewardCard tiles topped by a single ' +
    'connected step track (dim base + bright fill), used inside MilestoneRewards.vue ' +
    '(never mounted standalone in the app). Track geometry is measured in real DOM ' +
    'via offsetLeft/offsetWidth against each node ref (measureTrack, onMounted + a ' +
    'ResizeObserver + a deep watcher on rewards/currentMp) rather than approximated in ' +
    'CSS — deliberately not getBoundingClientRect(), since the app\'s scaled device ' +
    'frame would return post-scale pixels that disagree with pre-scale scrollLeft. ' +
    'Drag-to-scroll comes from useDragScroll(), the same composable FeaturedCarousel ' +
    'uses. `rewards` must already carry the derived `state` (locked/claimable/claimed) ' +
    '— this component does not derive it itself, it only reads it to decide the fill\'s ' +
    'frontier and each node\'s reached/unreached look.',
  rules: [
    'Needs at least 2 reward entries — measureTrack() bails out (leaves the track at ' +
      'zero size) when fewer than 2 node refs exist.',
    'rewards should be pre-sorted ascending by threshold — the fill position and the ' +
      '"reached" frontier both assume that order.',
    'Each reward needs a stable, unique id — it keys MilestoneRewardCard\'s own claim ' +
      'state via useGiftClaim().',
    'pointsUnit is cosmetic only (the label under each node) — it does not affect the ' +
      'fill/threshold math, which is always raw numbers.',
  ],
  variants: [
    {
      name: 'Early progress',
      props: ({ assets }) => ({
        rewards: buildRewards(assets, 300),
        currentMp: 300,
        pointsUnit: 'AP',
      }),
    },
    {
      name: 'Mixed — claimed, claimable, locked',
      props: ({ assets }) => ({
        rewards: buildRewards(assets, 900),
        currentMp: 900,
        pointsUnit: 'AP',
      }),
    },
    {
      name: 'Final tier reached',
      props: ({ assets }) => ({
        rewards: buildRewards(assets, 7000),
        currentMp: 7000,
        pointsUnit: 'AP',
      }),
    },
  ],
})

// Demo reward rows, already in the derived shape MilestoneRewards.vue hands
// down (id/title/subtitle/image/threshold/state/progress — see
// ../utils/milestoneRewards.js deriveRewardsState).
function rewardSeeds(assets) {
  const art = (n) => assets.content?.cpCoins?.[n] || assets.brand?.logomark
  return [
    { name: 'Boot Camp', amount: 420, threshold: 150, image: art(420) },
    { name: 'Specialist', amount: 960, threshold: 600, image: art(960) },
    { name: 'Veteran', amount: 2600, threshold: 2200, image: art(2600) },
    { name: 'Legend', amount: 5400, threshold: 7000, image: art(5400) },
  ]
}

// currentMp drives both each card's own state prop AND the rail's own
// connected fill bar — mirrors the "frontier" rule in deriveRewardsState so
// the story stays consistent with how MilestoneRewards.vue really derives it.
function buildRewards(assets, currentMp) {
  const seeds = rewardSeeds(assets)
  let frontier = -1
  seeds.forEach((seed, i) => { if (seed.threshold <= currentMp) frontier = i })
  return seeds.map((seed, i) => {
    const reward = {
      id: 'milestone-' + (i + 1),
      amount: seed.amount,
      unit: 'CP',
      image: seed.image,
      threshold: seed.threshold,
      subtitle: seed.amount + ' CP',
      state: i < frontier ? 'claimed' : i === frontier ? 'claimable' : 'locked',
      progress: i > frontier ? currentMp : null,
    }
    reward.title = seed.name
    return reward
  })
}
