import TransactionCard from '@/components/TransactionCard.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'transaction-card',
  title: 'Transaction Card',
  group: 'Cards',
  component: TransactionCard,
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-default',
    '--x-pad-surface-m',
    '--x-pad-surface-s',
    '--x-pad-surface-l',
    '--x-border-card-default',
    '--x-radius-container-s',
    '--x-surface-frost',
    '--x-blur-container',
    '--x-motion-sys-duration-base',
    '--x-motion-sys-ease-decelerate',
    '--x-motion-sys-distance-md',
    '--x-text-header-default',
    '--x-gap-content-loose',
    '--x-border-divider',
  ],
  notes:
    'One entry in the Transaction History list (Figma 5694:1389). Purely presentational and not ' +
    'interactive (no hover/press affordance) — `state` (fulfilled | pending | failed) drives the ' +
    'status pill colour and whether the Total Payment row shows an amount or "No charge Made". ' +
    'All copy including row labels is passed in from the page via strings.transactionHistory — ' +
    'the card formats nothing itself; `date` and `total` arrive pre-formatted as display strings.',
  rules: [
    'title, date and labels/statusLabel are required; total may be null (renders the no-charge copy for failed).',
    'state must be one of fulfilled | pending | failed — anything else falls back to the neutral pill.',
    'labels must be the full strings.transactionHistory.row shape (paymentStatus, orderId, transactionId, paymentMethod, totalPayment, noCharge).',
  ],
  variants: [
    {
      name: 'Fulfilled',
      props: ({ strings }) => ({
        state: 'fulfilled',
        title: '88 CP',
        date: 'Jun 26, 2026, 16:32:39',
        orderId: 'CDS2606261632HZ4K',
        transactionId: 'TXN88291047',
        paymentMethod: 'Visa •••• 4242',
        total: '$4.99',
        labels: strings.transactionHistory?.row,
        statusLabel: strings.transactionHistory?.status?.fulfilled || 'Fulfilled',
      }),
    },
    {
      name: 'Pending',
      props: ({ strings }) => ({
        state: 'pending',
        title: '420 CP',
        date: 'Jun 25, 2026, 09:14:02',
        orderId: 'CDS2506250914Q9PL',
        transactionId: 'TXN42093312',
        paymentMethod: 'GrabPay',
        total: '$19.99',
        labels: strings.transactionHistory?.row,
        statusLabel: strings.transactionHistory?.status?.pending || 'In Progress',
      }),
    },
    {
      name: 'Failed (no charge)',
      props: ({ strings }) => ({
        state: 'failed',
        title: '2600 CP',
        date: 'Jun 20, 2026, 21:58:47',
        orderId: 'CDS2006202158X7VB',
        transactionId: 'TXN26007765',
        paymentMethod: 'Mastercard •••• 8891',
        total: null,
        labels: strings.transactionHistory?.row,
        statusLabel: strings.transactionHistory?.status?.failed || 'Failed',
      }),
    },
  ],
})
