<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import MaterialIcon from '../MaterialIcon.vue'

/**
 * HomeReviewStack — the review cards as a rotating 3D depth stack. Visual-
 * layout only; card shape (avatar + stars + quote + name) is adapted from
 * https://codepen.io/pleasedonotdisturb/pen/OJBGoom ("User List Stack") —
 * fanned depth via translateZ/translateY, back cards dimmed + blurred.
 *
 * Interaction: click, or swipe (drag past a threshold — mirrors TrustBar
 * .vue's own onPointerDown/Move/Up percentage-drag pattern, adapted to a
 * discrete "advance one slot" gesture instead of a sliding percentage
 * track), advances which review is in front; it also auto-rotates every
 * 10s, pausing on interaction (same reset-on-interact convention
 * TrustBar's carousel timer already uses). Every card always occupies one
 * of a FIXED set of depth "slots" (0 = front/focused, 1 = mid, 2 = back, …)
 * computed from `(cardIndex - activeIndex) mod length`, and slot 0 never
 * moves — this is what keeps the front card always in view and the
 * section's footprint constant: rotating just reassigns which card sits in
 * which already-existing slot, so nothing about the stack's own size
 * changes, and nothing on the page below it (Payments) ever shifts.
 * Because the slot assignment is a single reactive number per card, the
 * existing CSS transition on transform/opacity/filter animates the
 * reassignment smoothly — the "3D transition" IS just the slot changing.
 *
 * prefers-reduced-motion: no autoplay timer, transitions instant (still
 * click/swipe-able — the content isn't hidden, just the animation is).
 *
 * Height: every card is `position:absolute` PERMANENTLY (no card is ever
 * back in normal flow) — an earlier version made whichever card held slot 0
 * `position:relative` so it could establish the container's height, but
 * toggling `position` on the very card that's mid-transform is not
 * animatable and landed at the same moment the container's own height
 * recalculated, so the "shuffle" had a layout snap baked into it. Instead,
 * card 0's real rendered height is measured ONCE via ResizeObserver (an
 * absolutely-positioned element still has a normal content-driven height —
 * position doesn't affect that, only whether it contributes to a PARENT's
 * auto-sizing) and written to `--stack-height`, which never changes
 * per-rotation. Every card, at every moment, only ever animates
 * transform/opacity/filter — nothing about layout ever moves.
 */
const props = defineProps({
  reviews: { type: Array, default: () => [] }, // [{ quote, name, meta }]
})

const AVATAR_COLORS = ['var(--x-bg-indicator-brand-default)', 'var(--x-bg-indicator-prominent-default)', 'var(--x-bg-indicator-success-default)']
const AUTOPLAY_MS = 10000

const activeIndex = ref(0)
const reduceMotion = ref(false)
const isDragging = ref(false)

const stackRef = ref(null)
const itemRefs = ref([])
let reduceMq = null
let autoplayTimer = null
let ro = null
let dragStartX = 0
let dragPx = 0
let dragPointerId = null

function setItemRef (el, i) {
  if (el) itemRefs.value[i] = el
}

function reserveHeight () {
  const el = itemRefs.value[0]
  if (!el || !stackRef.value) return
  stackRef.value.style.setProperty('--stack-height', `${el.getBoundingClientRect().height}px`)
}

function slotFor (i) {
  const len = props.reviews.length || 1
  return (i - activeIndex.value + len) % len
}

function next () { activeIndex.value = (activeIndex.value + 1) % (props.reviews.length || 1) }
function prev () { activeIndex.value = (activeIndex.value - 1 + (props.reviews.length || 1)) % (props.reviews.length || 1) }

function resetAutoplay () {
  stopAutoplay()
  if (reduceMotion.value || props.reviews.length < 2) return
  autoplayTimer = setInterval(next, AUTOPLAY_MS)
}
function stopAutoplay () {
  if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null }
}

function onPointerDown (e) {
  if (e.button != null && e.button !== 0) return
  isDragging.value = true
  dragStartX = e.clientX
  dragPx = 0
  dragPointerId = e.pointerId
  stackRef.value?.setPointerCapture?.(dragPointerId)
  stopAutoplay()
}
function onPointerMove (e) {
  if (!isDragging.value || e.pointerId !== dragPointerId) return
  dragPx = e.clientX - dragStartX
}
function onPointerUp (e) {
  if (!isDragging.value || e.pointerId !== dragPointerId) return
  isDragging.value = false
  const width = stackRef.value?.clientWidth || 1
  const threshold = width * 0.12
  if (dragPx < -threshold) next()
  else if (dragPx > threshold) prev()
  else next() // a tap (negligible drag) still advances — "click to swap"
  dragPx = 0
  dragPointerId = null
  resetAutoplay()
}

function onMq (e) {
  reduceMotion.value = e.matches
  resetAutoplay()
}

onMounted(() => {
  if (typeof matchMedia !== 'undefined') {
    reduceMq = matchMedia('(prefers-reduced-motion: reduce)')
    reduceMotion.value = reduceMq.matches
    reduceMq.addEventListener?.('change', onMq)
  }
  resetAutoplay()
  nextTick(reserveHeight)
  if (typeof ResizeObserver !== 'undefined' && itemRefs.value[0]) {
    ro = new ResizeObserver(reserveHeight)
    ro.observe(itemRefs.value[0])
  }
})
watch(() => props.reviews, () => nextTick(reserveHeight))
onBeforeUnmount(() => {
  reduceMq?.removeEventListener?.('change', onMq)
  stopAutoplay()
  ro?.disconnect()
})
</script>

<template>
  <div
    ref="stackRef"
    class="review-stack"
    :class="{ 'no-motion': reduceMotion, 'is-dragging': isDragging }"
    role="group"
    aria-label="Customer reviews"
    tabindex="0"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @keydown.right="next(); resetAutoplay()"
    @keydown.left="prev(); resetAutoplay()"
  >
    <div
      v-for="(r, i) in reviews"
      :key="r.name"
      :ref="(el) => setItemRef(el, i)"
      class="review-stack__item"
      :style="{ '--slot': slotFor(i) }"
    >
      <div class="review-stack__stars">
        <MaterialIcon v-for="n in 5" :key="n" name="star" :size="14" class="review-stack__star" />
      </div>
      <p class="review-stack__quote text-style-paragraph-regular">"{{ r.quote }}"</p>
      <div class="review-stack__who">
        <span class="review-stack__avatar text-style-utility-action-bold" :style="{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }">
          {{ r.name[0] }}
        </span>
        <div>
          <div class="review-stack__name text-style-utility-action-bold">{{ r.name }}</div>
          <div class="review-stack__meta text-style-utility-micro-regular">{{ r.meta }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-stack {
  position: relative;
  transform-style: preserve-3d;
  perspective: 500px;
  padding: var(--x-pad-surface-xxs);
  height: var(--stack-height, auto);
  cursor: pointer;
  touch-action: pan-y;
}
.review-stack.is-dragging {
  cursor: grabbing;
  user-select: none;
  -webkit-user-select: none;
}

/* Every card is pinned to the same top-left baseline (absolute; top/left/
   right:0, no `bottom`, so its OWN height stays content-driven) and stays
   that way PERMANENTLY — see the script's doc-comment for why nothing ever
   toggles back to normal flow. `.review-stack`'s own height comes from the
   JS-measured `--stack-height` above, not from any card. */
.review-stack__item {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  list-style: none;
  padding: var(--x-pad-surface-l);
  border-radius: var(--x-radius-container-s);
  background: var(--x-home-surface-bg, var(--x-bg-card-default));
  border: var(--border-weight-default) solid var(--x-home-surface-border, transparent);
  box-shadow: var(--x-shadow-card);
  backdrop-filter: var(--x-home-surface-blur, none);
  -webkit-backdrop-filter: var(--x-home-surface-blur, none);
  /* The depth stack, driven entirely by --slot (0 = front/focused, 1 = mid,
     2 = back, …) — rotating the stack just changes which card holds which
     slot number, and since every property here is a function of that one
     custom property, the existing transition animates the whole
     reassignment as one smooth 3D move: the outgoing front card moves DOWN
     (translateY +), shrinks (scale down — the direct "becomes smaller" cue,
     reinforced by translateZ's perspective foreshortening), and recedes
     backward (translateZ −) all at once; the card taking its place moves UP
     and FORWARD by the same deltas in reverse. Slot 0 always resolves to
     the identity transform, opacity 1, blur(0) — untouched, so the front
     card is always sharp, always in place. */
  transform: translateZ(calc(var(--slot) * -50px))
             translateY(calc(var(--slot) * 24px))
             scale(calc(1 - var(--slot) * 0.08));
  opacity: calc(1 - var(--slot) * 0.2);
  filter: blur(calc(var(--slot) * 2px));
  transition: transform var(--x-motion-sys-duration-slower) var(--x-motion-sys-ease-standard),
              opacity var(--x-motion-sys-duration-slower) var(--x-motion-sys-ease-standard),
              filter var(--x-motion-sys-duration-slower) var(--x-motion-sys-ease-standard);
  z-index: calc(10 - var(--slot));
}
.review-stack.is-dragging .review-stack__item {
  transition-duration: 0s; /* follow the pointer without lag while actively dragging */
}

/* Reduced motion: instant slot changes, no autoplay (see script) — content
   and interaction stay available, just without the animated 3D move. */
.review-stack.no-motion .review-stack__item {
  transition: none;
}

.review-stack__stars {
  display: flex;
  gap: 2px;
  margin-bottom: var(--x-gap-content-default);
  color: var(--x-text-warning-default);
}
.review-stack__quote {
  margin: 0 0 var(--x-gap-content-default);
  color: var(--x-home-surface-text-sub, var(--x-text-body-default));
}
.review-stack__who {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
}
.review-stack__avatar {
  flex: 0 0 auto;
  width: var(--x-size-control-s);
  height: var(--x-size-control-s);
  display: grid;
  place-items: center;
  border-radius: var(--x-radius-control-full);
  color: var(--x-text-on-primary);
}
.review-stack__name {
  display: block;
  color: var(--x-home-surface-text, var(--x-text-header-default));
}
.review-stack__meta {
  display: block;
  color: var(--x-home-surface-text-sub, var(--x-text-body-subtle));
}
</style>
