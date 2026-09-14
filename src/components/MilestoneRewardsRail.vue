<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import MilestoneRewardCard from './MilestoneRewardCard.vue'
import MaterialIcon from './MaterialIcon.vue'
import { useDragScroll } from '../composables/useDragScroll.js'
import { formatNumber } from '../utils/formatNumber.js'

/**
 * MilestoneRewardsRail — horizontally-scrollable row of milestone reward
 * cards (Figma node 2094:267), topped by a connected step track — one node
 * per reward, joined by a SINGLE continuous fill bar that grows left→right
 * to show real progress toward the next tier (not per-segment bars). Layout
 * adapted from the PvZ3 step-track reference (Figma woddrskgFphghfZ87d3H9S,
 * node 5131:261276): a node row, a threshold label under each node, then
 * the reward card — all in the same scrolling column so the track always
 * stays aligned with its card underneath.
 *
 * The track base + fill are two absolutely-positioned bars sized off the
 * actual node positions (measureTrack, below) rather than approximated in
 * CSS. Geometry is read via `offsetLeft`/`offsetWidth` (layout-space,
 * relative to `.milestone-rail__list` — the nearest positioned ancestor),
 * NOT `getBoundingClientRect()` — this app's device-frame preview is
 * rendered inside a CSS `transform: scale(...)` wrapper, so
 * `getBoundingClientRect()` returns POST-SCALE viewport pixels while
 * `scrollLeft` is always PRE-SCALE layout pixels; mixing the two produced a
 * growing misalignment the further a node sat from the list's start (the
 * bar visibly stopping short of the last tier). `offsetLeft` is immune to
 * both the scale transform and the current scroll position, so it needs no
 * scroll-position correction and stays correct at every zoom/breakpoint.
 *
 * Nodes keep their own opaque background (dim/bright to match reached
 * state) — the round "bead" container is part of what's being asked for
 * here, so the bars run BEHIND each node (z-index 0 vs 1) rather than
 * showing through a transparent one.
 *
 * Drag-to-scroll mirrors FeaturedCarousel.vue (useDragScroll) — copied
 * rather than imported since the item is a track+card column, not a bare
 * BundleSkuCard. No chevron nav (drag/swipe only).
 */
const props = defineProps({
  rewards:   { type: Array,  default: () => [] },
  /** Current player points balance — drives the track's fill position (see measureTrack). */
  currentMp: { type: Number, default: 0 },
  /** Loyalty-points unit label shown under each node (FCM: 'MP', COD:M: 'AP'). */
  pointsUnit: { type: String, default: 'MP' },
  baseDelay: { type: Number, default: 0 },
})

const listRef = ref(null)
const { isDragging } = useDragScroll(listRef)

const nodeEls = []
function setNodeRef(i, el) { nodeEls[i] = el }

// Track geometry in px, relative to .milestone-rail__list's own padding box
// (offsetParent) — base spans node[0].center → node[last].center; fill is
// the same left edge, grown to wherever currentMp has reached along that
// same span. Scroll-position-independent by construction (see header
// comment), so this never needs to be re-measured on scroll.
const track = ref({ left: 0, top: 0, width: 0, fillWidth: 0 })

function measureTrack() {
  if (nodeEls.length < 2 || nodeEls.some(el => !el)) return
  const centers = nodeEls.map(el => el.offsetLeft + el.offsetWidth / 2)
  const top = nodeEls[0].offsetTop + nodeEls[0].offsetHeight / 2

  // Last tier whose threshold has been reached (-1 if none) — the same
  // "frontier" rule milestone.js uses to derive claimable/locked.
  let frontier = -1
  props.rewards.forEach((r, i) => { if (r.state !== 'locked') frontier = i })

  let fillX = centers[0]
  if (frontier === props.rewards.length - 1) {
    fillX = centers[centers.length - 1]
  } else if (frontier >= 0) {
    const a = props.rewards[frontier], b = props.rewards[frontier + 1]
    const span = b.threshold - a.threshold
    const frac = span <= 0 ? 1 : Math.min(1, Math.max(0, (props.currentMp - a.threshold) / span))
    fillX = centers[frontier] + frac * (centers[frontier + 1] - centers[frontier])
  }

  track.value = {
    left: centers[0],
    top,
    width: centers[centers.length - 1] - centers[0],
    fillWidth: Math.max(0, fillX - centers[0]),
  }
}

const trackBaseStyle = computed(() => ({
  left: track.value.left + 'px',
  top: track.value.top + 'px',
  width: track.value.width + 'px',
}))
const trackFillStyle = computed(() => ({
  left: track.value.left + 'px',
  top: track.value.top + 'px',
  width: track.value.fillWidth + 'px',
}))

let ro = null
onMounted(() => {
  nextTick(measureTrack)
  if (typeof ResizeObserver !== 'undefined' && listRef.value) {
    ro = new ResizeObserver(measureTrack)
    ro.observe(listRef.value)
  }
})
onBeforeUnmount(() => { if (ro) ro.disconnect() })
watch(() => [props.rewards, props.currentMp], () => nextTick(measureTrack), { deep: true })
</script>

<template>
  <div class="milestone-rail" data-poi="milestone-rail">
    <div ref="listRef" class="milestone-rail__list" :class="{ 'is-dragging': isDragging }">
      <div class="milestone-rail__track-base" aria-hidden="true" :style="trackBaseStyle" />
      <div class="milestone-rail__track-fill" aria-hidden="true" :style="trackFillStyle" />

      <div v-for="(reward, i) in rewards" :key="reward.id" class="milestone-rail__item">
        <!-- Node sits centred over the card below it (justify-content:center
             in a full-item-width row). Sits above the track bars (z-index 1
             vs 0) with its OWN opaque background — the bars run behind it,
             connecting node to node, rather than showing through it. -->
        <div class="milestone-rail__track">
          <span :ref="el => setNodeRef(i, el)" class="milestone-rail__node" :class="{ 'is-reached': reward.state === 'claimable' || reward.state === 'claimed' }">
            <MaterialIcon v-if="reward.state === 'claimable' || reward.state === 'claimed'" name="check" variant="round" :size="16" />
            <span v-else class="milestone-rail__node-number text-style-utility-micro-regular">{{ i + 1 }}</span>
          </span>
        </div>
        <p class="milestone-rail__node-label text-style-utility-micro-regular">{{ formatNumber(reward.threshold) }} {{ pointsUnit }}</p>
        <MilestoneRewardCard
          v-bind="reward"
          :is-final-tier="i === rewards.length - 1"
          :base-delay="baseDelay + i * 90"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.milestone-rail {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  width: 100%;
}

.milestone-rail__list {
  position: relative;
  display: flex;
  gap: var(--x-gap-content-default);
  overflow-x: auto;
  overflow-y: hidden;
  cursor: grab;
  padding-block: var(--x-pad-surface-s);
  padding-inline: var(--x-pad-surface-m);
  scroll-padding-inline: var(--x-pad-surface-m);
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}
.milestone-rail__list::-webkit-scrollbar { display: none; }
.milestone-rail__list.is-dragging {
  cursor: grabbing;
  user-select: none;
  -webkit-user-select: none;
}
@container (min-width: 801px) {
  .milestone-rail__list { padding-inline: 0; }
}

/* NOT position:relative — z-index still applies (it's a flex item of
   .milestone-rail__list), and staying position:static keeps
   .milestone-rail__list the nearest positioned ancestor for the node
   elements inside, which is what measureTrack's offsetLeft/offsetTop math
   depends on. */
.milestone-rail__item {
  z-index: 1;
  /* Wider than FeaturedCarousel's 38%/62.5% peek ratios — this card's
     title+divider+subtitle+96px art+CTA stack needs more breathing room
     than a bundle-price card at the same width. */
  flex: 0 0 calc(58% - 6px);
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
}
@container (min-width: 801px) {
  .milestone-rail__item {
    flex: 0 0 calc((100% - 16px) / 3);
    min-width: 220px;
  }
}

/* Single continuous track — two bars, sized off the actual node centres
   (see measureTrack): a dim base spanning node 1→last, and a bright fill
   growing left→right on top of it. z-index 0, below the items (z-index 1)
   so the bars run BEHIND each node's own opaque circle, connecting them
   like beads on a string, rather than stopping at each node's edge. Colour
   comes from the semantic indicator token family (--x-bg-indicator-*),
   never the plain divider/border tokens. */
.milestone-rail__track-base,
.milestone-rail__track-fill {
  position: absolute;
  z-index: 0;
  height: 8px;
  border-radius: var(--x-radius-badge-full);
  transform: translateY(-50%);
  pointer-events: none;
}
.milestone-rail__track-base {
  background: var(--x-bg-indicator-neutral-subtle);
}
.milestone-rail__track-fill {
  background: var(--x-bg-indicator-brand-default);
  /* --duration-slower (500ms), not the usual -slow (350ms): the fill can
     travel the entire rail's width in one move (a scenario jump can cross
     several tiers at once), so it's scaled up like a large/complex surface
     move rather than a small on-screen nudge — calmer, per the motion-design
     skill's "duration should track how heavy the moving element is" rule.
     ease-decelerate stays correct: the fill is arriving/settling at its new
     value, the same as any entering element. */
  transition: width var(--x-motion-sys-duration-slower) var(--x-motion-sys-ease-decelerate);
}

.milestone-rail__track {
  display: flex;
  justify-content: center;
  align-items: center;
  height: var(--x-size-img-s);
}
.milestone-rail__node {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--x-size-img-s);
  height: var(--x-size-img-s);
  border-radius: var(--x-radius-badge-full);
  background: var(--x-bg-indicator-neutral-subtle);
  color: var(--x-text-on-primary);
  /* Matches .milestone-rail__track-fill's duration so a node flipping
     reached settles in step with the bar reaching it, not ahead of it. */
  transition: background var(--x-motion-sys-duration-slower) var(--x-motion-sys-ease-decelerate);
}
.milestone-rail__node.is-reached {
  background: var(--x-bg-indicator-brand-default);
}
/* The checkmark (reached) inherits --x-text-on-primary from the node above
   for contrast against its bright fill; the tier number (not reached)
   needs its own colour since it sits on the dim fill instead. */
.milestone-rail__node-number {
  color: var(--x-text-body-default);
  transform-origin: center center;
}
.milestone-rail__node-label {
  margin: 0;
  display: block;
  text-align: center;
  color: var(--x-text-body-default);
  transform-origin: center center;
}
</style>
