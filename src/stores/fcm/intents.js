/**
 * FC Mobile — L1 "intent" stubs for the multi-level navigation pilot
 * (gated by the static config.nav.multiLevel capability — see store.js).
 *
 * The real Store intent reuses the catalogue tree already built in
 * ./catalog.js — it is not duplicated here. Loyalty & Rewards and Events are
 * still pre-launch, so each gets a single stub category with one subcategory
 * that omits `cardType`: CategoryCatalog's existing "coming soon" branch (the
 * final `v-else` in its cardType chain) renders it with zero new markup.
 *
 * Shape matches useStoreCatalog's catalogue tree exactly — an intent's
 * `categories` is interchangeable with the array `catalog.js` exports:
 *   [ { id, label, subcategories: [ { id, label, navLabel, cardType, items } ] } ]
 */

const REWARDS_CATEGORIES = [
  {
    id: 'rewards',
    label: 'Milestone Rewards',
    subcategories: [
      { id: 'rewards-coming-soon', label: 'Milestone Rewards', navLabel: 'Rewards', items: [] },
    ],
  },
]

const EVENTS_CATEGORIES = [
  {
    id: 'events',
    label: 'Events',
    subcategories: [
      { id: 'events-coming-soon', label: 'Events', navLabel: 'Events', items: [] },
    ],
  },
]

/**
 * buildFcmIntents — assembles the L1 intent list for FCM.
 * @param {Array} storeCategories the real category tree from ./catalog.js (buildFcmCatalog())
 */
export function buildFcmIntents(storeCategories) {
  return [
    { id: 'store',   label: 'Store',             categories: storeCategories },
    { id: 'rewards', label: 'Milestone Rewards', categories: REWARDS_CATEGORIES },
    { id: 'events',  label: 'Events',            categories: EVENTS_CATEGORIES },
  ]
}
