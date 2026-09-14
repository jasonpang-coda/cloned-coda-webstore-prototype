/**
 * Router for the storefront's page-level views — added so browser back/
 * forward walks between pages instead of doing nothing (no history entries
 * were ever pushed) or leaving the tab.
 *
 * Route components are unused — App.vue keeps its existing v-if/else-if
 * chain (HomeView / storefront / OrderCompletePage / TransactionHistoryPage)
 * and drives it off `route.path` via a watcher, rather than mounting via
 * `<router-view>`. Routes exist purely so vue-router can own real history
 * entries; see App.vue's route↔page-state sync watcher for how the two meet.
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useStoreConfig } from './composables/useStoreConfig.js'
import { useStoreStrings } from './composables/useStoreStrings.js'

const NoRender = { render: () => null }

export const routes = [
  { path: '/', name: 'storefront', component: NoRender },
  // Codashop only (config.home) — the title/product-detail view reached by
  // tapping a title card on the aggregator homepage at '/'.
  { path: '/product', name: 'product', component: NoRender },
  { path: '/order-complete', name: 'order-complete', component: NoRender },
  { path: '/history', name: 'history', component: NoRender },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Capability guard — redirects to '/' when navigating (including browser
// back/forward across a store switch) to a page the CURRENT store doesn't
// support. App.vue's own watch(strings)/watch(config.home) handles the
// reactive case (store changes while already on the page); this guard
// catches the route-change case those can't (see web navigation, not a
// config change).
router.beforeEach((to) => {
  const config = useStoreConfig()
  const strings = useStoreStrings()
  if (to.path === '/order-complete' && !strings.value.page?.orderComplete) return '/'
  if (to.path === '/history' && !strings.value.transactionHistory) return '/'
  if (to.path === '/product' && !config.value.home) return '/'
  return true
})

export default router
