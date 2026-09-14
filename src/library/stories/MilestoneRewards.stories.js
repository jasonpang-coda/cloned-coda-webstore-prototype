import MilestoneRewards from '@/components/MilestoneRewards.vue'
import { defineStory } from '../story.js'

// NOTE: the local demo-data helpers (tierSeeds/buildTiers/buildData) are
// defined BELOW this export, not above it. The harness CLI's title/id
// extraction (tools/harness-cli.mjs) runs a naive regex over the WHOLE file
// looking for the first title-or-id object-literal key, not scoped to this
// defineStory({...}) call — even a key such as "subtitle" can accidentally
// match, since it contains that same substring. Local demo objects placed
// above defineStory (BundleGrid / Grid.stories.js hit this too) can trip it.
// Function DECLARATIONS (not arrow consts) are hoisted, so keeping this
// defineStory call textually first and the helpers after is enough to dodge
// it without renaming any real field.
export default defineStory({
  id: 'milestone-rewards',
  title: 'Milestone Rewards',
  group: 'Content',
  component: MilestoneRewards,
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-loose',
    '--x-text-header-default',
    '--x-radius-container-s',
    '--x-gradient-scroll-fade-bottom',
    '--x-gap-content-default',
    '--x-pad-surface-m',
    '--x-size-img-xxl',
    '--x-gap-content-tight',
    '--x-text-body-default',
    '--x-text-hyperlink-default',
    '--x-size-icon-xs',
    '--x-pad-surface-s',
    '--x-radius-control-full',
    '--x-surface-frost',
    '--x-motion-sku-hover',
    '--x-surface-frost-hover',
  ],
  notes:
    'The "Milestone Rewards" tab content — header, hero banner (art bloom-glows via ' +
    'fx-bloom, sized off the hero image itself), campaign description, a text-only ' +
    'progression summary ("Next Level: X/Y"), the MilestoneRewardsRail step-track + ' +
    'reward cards, and a closing "Earn Milestone Points" CTA that emits `go-to-store` ' +
    '(App.vue owns switching the active tab back — this component has no access to ' +
    'that state itself). Reward state (locked/claimable/claimed) is derived from ' +
    '`data.tiers` + the current point balance by ../utils/milestoneRewards.js, the ' +
    'same store-agnostic logic every store campaign shares. In the live app the point ' +
    'balance is either a dev-toolbar scenario flag (FCM) or a fixed `data.demoPoints` ' +
    '(COD:M) — this story always uses `demoPoints` directly so the preview state is ' +
    'deterministic and does not depend on useFeatureFlags() resolving a particular flag.',
  rules: [
    '`data` is required — header, hero.{image,tagLabel,title}, description, tiers, and ' +
      'either scenarioFlag or demoPoints must all be supplied by the caller\'s store module.',
    'tiers must be in ascending threshold order — deriveRewardsState/deriveProgressionSummary ' +
      'assume it (the "frontier" is the last tier whose threshold has been reached).',
    'The loyalty status icon on the progression line only renders when ' +
      'config.checkout.loyalty is non-null — not a prop on this component, so it cannot ' +
      'be toggled from a variant.',
    'hero.badgeImage is optional — omit it to show just the tag/title text with no reward art.',
  ],
  variants: [
    {
      name: 'Early progress (mostly locked)',
      props: ({ assets, strings }) => ({
        data: buildData(assets, strings, 300),
      }),
    },
    {
      name: 'Mid-campaign (reward claimable)',
      props: ({ assets, strings }) => ({
        data: buildData(assets, strings, 900),
      }),
    },
    {
      name: 'Final tier reached',
      props: ({ assets, strings }) => ({
        data: buildData(assets, strings, 7000),
      }),
    },
  ],
})

// Demo loyalty-tier data, shaped like a real store's milestone.js module
// (see src/stores/fcm/milestone.js / src/stores/codm/milestone.js) but kept
// local so the story never imports one store's data file directly — the
// component itself is store-agnostic (data comes in via the `data` prop).
function tierSeeds(assets) {
  const art = (n) => assets.content?.cpCoins?.[n] || assets.brand?.logomark
  return [
    { name: 'Boot Camp', amount: 420, unit: 'CP', image: art(420), threshold: 150 },
    { name: 'Specialist', amount: 960, unit: 'CP', image: art(960), threshold: 600 },
    { name: 'Veteran', amount: 2600, unit: 'CP', image: art(2600), threshold: 2200 },
    { name: 'Legend', amount: 5400, unit: 'CP', image: art(5400), threshold: 7000 },
  ]
}

function buildTiers(assets) {
  return tierSeeds(assets).map((seed) => {
    const tier = {
      amount: seed.amount,
      unit: seed.unit,
      image: seed.image,
      threshold: seed.threshold,
      subtitle: seed.amount + ' ' + seed.unit,
    }
    tier.title = seed.name
    return tier
  })
}

function buildData(assets, strings, currentPoints) {
  const tiers = buildTiers(assets)
  const finale = tiers[tiers.length - 1]
  const hero = { image: assets.content?.bannerMidnightSun || assets.brand?.wordmark, badgeImage: finale.image, tagLabel: 'TOP REWARD' }
  hero.title = finale.subtitle
  return {
    header: strings.nav?.milestoneTabLabel || 'Milestone Rewards',
    hero,
    description: 'Earn rewards every time you shop! Collect Loyalty Points with each purchase to unlock better rewards as you level up.',
    learnMoreLabel: 'Learn more',
    learnMoreUrl: '#',
    tiers,
    pointsUnit: 'AP',
    demoPoints: currentPoints,
  }
}
