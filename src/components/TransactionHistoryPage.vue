<script setup>
import { ref, computed } from 'vue'
import Grid from './Grid.vue'
import Span from './Span.vue'
import MaterialIcon from './MaterialIcon.vue'
import FilterDropdown from './FilterDropdown.vue'
import TransactionCard from './TransactionCard.vue'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useStoreTransactions } from '../composables/useStoreTransactions.js'

/**
 * TransactionHistoryPage — full-page Transaction History view (Figma XS7.1.1).
 * A view, not an overlay: rendered in App.vue's default slot in place of the
 * storefront when useTransactionHistory().historyOpen is true; the NavBar stays
 * mounted above it. Reached from the signed-in AccountPopover in every store.
 *
 * Theme-agnostic: copy comes from strings.transactionHistory and the demo data
 * from useStoreTransactions() — both keyed by the active store, no theme branching.
 * The range filter is functional: each demo item carries a `daysAgo` offset, so
 * "Past N days" filters against runtime now (clock-robust).
 */
defineEmits(['back'])

const strings = useStoreStrings()
const transactions = useStoreTransactions()

const t = computed(() => strings.value.transactionHistory)

// Range options for the dropdown — keys are the day windows.
const rangeOptions = computed(() => [
  { key: 7,  label: t.value.ranges.d7 },
  { key: 30, label: t.value.ranges.d30 },
  { key: 90, label: t.value.ranges.d90 },
])
const selectedRange = ref(7) // matches the Figma default ("Past 7 days")

// Format a `daysAgo` offset into the Figma timestamp style, e.g. "Jun 26, 2026, 16:32:39".
const dateFmt = new Intl.DateTimeFormat('en-US', {
  year: 'numeric', month: 'short', day: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
})
const DAY_MS = 86_400_000
function formatDate(daysAgo) {
  return dateFmt.format(new Date(Date.now() - daysAgo * DAY_MS))
}

const visible = computed(() =>
  transactions.value.filter(tx => tx.daysAgo <= selectedRange.value),
)
</script>

<template>
  <section class="txn-page">
    <Grid>
      <Span size="content">
        <div class="txn-page__content">
          <!-- Header -->
          <header class="txn-page__header">
            <button
              v-ripple v-haptic
              type="button"
              class="txn-page__back"
              aria-label="Back"
              @click="$emit('back')"
            >
              <MaterialIcon name="arrow_back" :size="24" />
            </button>
            <h1 class="txn-page__title text-style-heading-page-title">{{ t.title }}</h1>
          </header>

          <!-- Range filter -->
          <FilterDropdown
            v-model="selectedRange"
            :options="rangeOptions"
            :label="t.filterLabel"
          />

          <!-- Transaction list -->
          <div class="txn-page__list">
            <TransactionCard
              v-for="(tx, i) in visible"
              :key="tx.id"
              :state="tx.state"
              :title="tx.title"
              :date="formatDate(tx.daysAgo)"
              :order-id="tx.orderId"
              :transaction-id="tx.transactionId"
              :payment-method="tx.paymentMethod"
              :total="tx.total"
              :labels="t.row"
              :status-label="t.status[tx.state]"
              :anim-delay="i * 80"
            />
            <p v-if="!visible.length" class="txn-page__empty text-style-utility-default-regular">
              {{ t.empty }}
            </p>
          </div>
        </div>
      </Span>
    </Grid>
  </section>
</template>

<style scoped>
.txn-page {
  padding-top: var(--x-pad-surface-l);
  padding-bottom: calc(var(--x-pad-surface-xl) + var(--x-pad-surface-s)); /* 32px clearance */
}
.txn-page__content {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-separation);
}

.txn-page__header {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
}
.txn-page__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--x-size-icon-l);
  height: var(--x-size-icon-l);
  flex-shrink: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--x-text-header-default);
  cursor: pointer;
  transition: color var(--x-motion-hover);
}
.txn-page__back:hover { color: var(--x-text-header-strong); }
.txn-page__title {
  min-width: 0;
  color: var(--x-text-header-default);
}

.txn-page__list {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--x-gap-content-separation);
}

@container (min-width: 641px) {
  .txn-page__list { grid-template-columns: repeat(2, 1fr); }
}

@container (min-width: 801px) {
  .txn-page__list { grid-template-columns: repeat(3, 1fr); }
}
.txn-page__empty {
  color: var(--x-text-body-default);
}
</style>
