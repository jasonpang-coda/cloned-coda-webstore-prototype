<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import Button from '../Button.vue'
import { useBottomFade } from '../../composables/useBottomFade.js'
import { useOrientation } from '../../composables/useOrientation.js'

/**
 * BaseSheet — the one bottom-sheet/modal surface. Owns every piece of chrome
 * that used to be copy-pasted across CheckoutSheet/OrderSummarySheet/
 * ItemSummarySheet/ClaimGiftSheet/SignInSheet/RegionSelectorSheet/
 * LanguageSelectorSheet: the scrim, the frosted L3 panel, the slide-up /
 * responsive-centered-modal `<Transition name="sheet">`, the bottom scroll
 * scrim (useBottomFade), Escape-to-close, and (when there's no scrim)
 * outside-tap-to-close.
 *
 * On top of that shared shell it owns ONE more thing none of the old sheets
 * had: an auto-size engine (`contentKey`). When a consumer swaps its body/
 * footer content while the sheet stays open (e.g. the FCM info step →
 * payment step), bump `contentKey` — the panel measures its old height, lets
 * Vue patch in the new slot content (clipped at the old height, so nothing
 * jumps), then grows or shrinks to the new content's natural height. The
 * resize itself IS the transition — no cross-fade — so it reads as the
 * surface growing to reveal more, or shrinking to close around less, rather
 * than old content dissolving into new. This is what turns "two sheets
 * faking a handoff" into "one surface changing content".
 *
 * Consumers own state (open/contentKey/sizeHint come from their own
 * composables) and content (slots). BaseSheet owns none of it.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: true },
  title: { type: String, default: '' },
  ariaLabel: { type: String, default: undefined },
  ariaModal: { type: Boolean, default: true },
  // No scrim (SignInSheet) — the page behind stays visible + interactive;
  // dismissal falls back to a document-level outside-tap listener.
  scrim: { type: Boolean, default: true },
  // Renders the scrim at opacity 0 with no transition — for a sheet stacked
  // above another sheet whose own scrim already covers the background.
  suppressScrim: { type: Boolean, default: false },
  dismissable: { type: Boolean, default: true },
  showClose: { type: Boolean, default: true },
  // Mobile/framed panel height policy — maps 1:1 to the fixed-percentage
  // rules every sheet hardcoded before this extraction:
  //   tall         height: 85%              (info-style default)
  //   full         height: 95%               (payment/checkout)
  //   compact      height: auto; max-height: 95%  (FCM compact info)
  //   content      max-height: 85%, no fixed height (short lists — language)
  //   content-full max-height: 100%, no fixed height (no-scrim — sign-in)
  sizeHint: { type: String, default: 'tall' },
  // Desktop (≥801px) centered-modal width — most sheets use 420px;
  // RegionSelectorSheet's two-column layout needs 560px.
  maxWidth: { type: Number, default: 420 },
  // Extra modifier classes applied to the outer `.sheet` element — the escape
  // hatch a migrating sheet uses for its own compound selectors
  // (e.g. a future `sheet--handoff-enter`).
  panelClass: { type: [String, Array, Object], default: undefined },
  // Identity of the currently-shown content (e.g. a flow step id). Changing
  // this while `open` stays true triggers the resize + cross-fade engine
  // instead of the slide-up transition.
  contentKey: { type: [String, Number], default: null },
  duration: { type: Object, default: () => ({ enter: 350, leave: 350 }) },
  // Opt-in: go edge-to-edge (no bottom-anchor, no rounded corners) instead of
  // a bottom sheet while the framed device preview is in landscape — e.g. the
  // Payment channel sheet's landscape layout (Figma node 6060:3935). Only
  // takes effect when BOTH this is true AND isMobile (a framed device) AND
  // useOrientation() reports 'landscape' — a desktop/responsive consumer, or
  // one that hasn't opted in, is unaffected.
  landscapeFull: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'before-enter', 'enter', 'after-enter', 'before-leave', 'leave', 'after-leave'])

const panelRef = ref(null)
const bodyRef = ref(null)

const sizeClass = computed(() => `sheet--size-${props.sizeHint}`)

const { orientation } = useOrientation()
const isLandscapeFull = computed(() => props.landscapeFull && props.isMobile && orientation.value === 'landscape')

function close() {
  if (!props.dismissable) return
  emit('close')
}
function onScrimClick() {
  if (!props.scrim) return
  close()
}

// ── Escape (all sheets) + outside-tap (only when there's no scrim to catch
// the click itself — mirrors SignInSheet's prior bespoke listener). ─────────
function onKey(e) {
  if (e.key === 'Escape') close()
}
function onPointerDownOutside(e) {
  if (panelRef.value && !panelRef.value.contains(e.target)) close()
}
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    window.addEventListener('keydown', onKey)
    if (!props.scrim) {
      // Deferred a tick so the click that opened the sheet doesn't immediately close it.
      nextTick(() => document.addEventListener('pointerdown', onPointerDownOutside))
    }
  } else {
    window.removeEventListener('keydown', onKey)
    document.removeEventListener('pointerdown', onPointerDownOutside)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.removeEventListener('pointerdown', onPointerDownOutside)
})

// ── Auto-size + cross-fade engine ────────────────────────────────────────
// Fires only on a genuine step change (contentKey identity), never on a
// deep data change inside the current step's content — otherwise a price
// update mid-step would spuriously animate the panel height.
watch(() => props.contentKey, (val, old) => {
  if (!props.open || old == null || val === old) return
  runContentSwap()
})

function runContentSwap() {
  const panel = panelRef.value
  if (!panel) return

  const first = panel.offsetHeight

  // Pin the panel at its current height, clipped — so Vue's patch (new slot
  // content replacing old) sits there unseen until the height animation
  // below reveals (grow) or closes around (shrink) it. No opacity fade: the
  // resize is the only visual change.
  panel.style.height = `${first}px`
  panel.style.transition = 'none'
  panel.style.overflow = 'hidden'

  nextTick(() => {
    if (!panel.isConnected) return
    panel.style.height = ''
    const last = panel.offsetHeight
    panel.style.height = `${first}px`
    panel.offsetHeight // reflow — establish the 'from' height before animating

    const cs = getComputedStyle(document.documentElement)
    const durSlow = cs.getPropertyValue('--x-motion-sys-duration-slow').trim()
    const easeStd = cs.getPropertyValue('--x-motion-sys-ease-standard').trim()

    panel.style.transition = `height ${durSlow} ${easeStd}`
    panel.style.height = `${last}px`

    function onEnd(e) {
      if (e.target !== panel || e.propertyName !== 'height') return
      cleanup()
    }
    function cleanup() {
      panel.style.height = ''
      panel.style.transition = ''
      panel.style.overflow = ''
      panel.removeEventListener('transitionend', onEnd)
    }
    panel.addEventListener('transitionend', onEnd)
  })
}

// ── Bottom scroll scrim — shown while the body overflows ────────────────
const { canScroll: canScrollBody } = useBottomFade(bodyRef)

defineExpose({ panelEl: panelRef, bodyEl: bodyRef })
</script>

<template>
  <Transition
    name="sheet"
    :duration="duration"
    @before-enter="(el) => emit('before-enter', el)"
    @enter="(el) => emit('enter', el)"
    @after-enter="(el) => emit('after-enter', el)"
    @before-leave="(el) => emit('before-leave', el)"
    @leave="(el) => emit('leave', el)"
    @after-leave="(el) => emit('after-leave', el)"
  >
    <div
      v-if="open"
      class="sheet"
      :class="[sizeClass, panelClass, { 'sheet--responsive': !isMobile, 'sheet--no-scrim': !scrim, 'sheet--landscape-full': isLandscapeFull }]"
      :style="{ '--sheet-max-width': `${maxWidth}px` }"
      role="dialog"
      :aria-modal="ariaModal ? 'true' : 'false'"
      :aria-label="ariaLabel || title"
    >
      <div v-if="scrim" class="sheet__scrim" :class="{ 'sheet__scrim--suppressed': suppressScrim }" @click="onScrimClick()"></div>

      <section ref="panelRef" class="sheet__panel">
        <div class="sheet__header">
          <slot name="header">
            <span class="sheet__title text-style-heading-modal">{{ title }}</span>
            <Button v-if="showClose" variant="icon" size="medium" icon="close" aria-label="Close" class="sheet__close" @click="close()" />
          </slot>
        </div>

        <slot name="pinned" />

        <div class="sheet__body-wrap">
          <div ref="bodyRef" class="sheet__body">
            <slot />
          </div>
          <!-- For decorative overlays pinned to the scroll viewport (e.g. a
               permanent top fade under a pinned search box) — absolutely
               positioned by the consumer, painted below the bottom scroll-fade. -->
          <slot name="body-overlay" />
          <div class="sheet__scroll-fade" :class="{ 'is-visible': canScrollBody }" aria-hidden="true"></div>
        </div>

        <!-- A full-width strip between the scrolling body and the footer
             (e.g. CheckoutSheet's loyalty-earn banner) — sits behind the
             footer, which layers over it (z-index handled by the consumer). -->
        <slot name="pre-footer" />

        <div v-if="$slots.footer" class="sheet__footer">
          <!-- canScrollBody: true while the body has more content below the
               fold — lets a footer link that jumps to something already
               visible in the body (e.g. "View Terms and Conditions" when the
               legal bar already fits on screen) hide itself as redundant. -->
          <slot name="footer" :can-scroll-body="canScrollBody" />
        </div>

        <!-- A decorative layer sized to exactly the panel itself (e.g.
             ClaimGiftSheet's success-confirmation glow) — a child of
             .sheet__panel (which is itself positioned), not a sibling. -->
        <slot name="panel-overlay" />
      </section>

      <!-- A stacked mini-dialog above this sheet's own panel (e.g. a promo
           code T&Cs details modal) — a sibling of .sheet__panel, not nested
           inside it, so it isn't clipped by the panel's overflow:hidden and
           disappears together with the sheet when it closes. -->
      <slot name="overlay" />
    </div>
  </Transition>
</template>

<style scoped>
.sheet {
  position: absolute;
  inset: 0;
  z-index: 4; /* above drawer (1), loader (2), snackbar/Buy Now bar (3) */
}
/* No scrim — page behind stays interactive; only the panel re-enables pointer events. */
.sheet--no-scrim { pointer-events: none; }

.sheet__scrim {
  position: absolute;
  inset: 0;
  background: var(--x-scrim);
  pointer-events: auto;
}
.sheet__scrim--suppressed {
  opacity: 0;
  transition: none;
}

/* Panel — anchored to the bottom edge, frosted L3 surface. Height itself is
   driven by the size-hint modifier below; everything else is shared. */
.sheet__panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  padding-top: var(--x-pad-surface-l);
  border-top: var(--border-weight-default) solid var(--x-border-sheet);
  border-top-left-radius: var(--x-radius-container-s);
  border-top-right-radius: var(--x-radius-container-s);
  background-image: var(--x-bg-sheet);
  background-color: var(--x-bg-page);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
  box-shadow: var(--x-shadow-sheet);
}

/* ── Size hints — mobile/framed panel height policy ───────────────────────*/
.sheet--size-tall .sheet__panel { height: 85%; }
.sheet--size-full .sheet__panel { height: 95%; }
.sheet--size-compact .sheet__panel { height: auto; max-height: 95%; }
.sheet--size-content .sheet__panel { max-height: 85%; }
.sheet--size-content-full .sheet__panel { max-height: 100%; }

/* Header */
.sheet__header {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding: 0 var(--x-pad-surface-m);
  flex-shrink: 0;
}
.sheet__title {
  flex: 1;
  min-width: 0;
  text-transform: uppercase;
  color: var(--x-text-header-default);
}
.sheet__close {
  flex-shrink: 0;
}

/* Body wrapper — does NOT scroll; the positioning context the scrim pins to. */
.sheet__body-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Body */
.sheet__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  /* Own containing block (like .device__screen) so comment-mode pins Teleported
     in here can be position:absolute and scroll natively with this box. */
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  padding: var(--x-pad-surface-m) var(--x-pad-surface-m) var(--x-pad-surface-xl);
  scrollbar-width: none;
}
.sheet__body::-webkit-scrollbar { display: none; }

/* Bottom scroll scrim — absolutely pinned to the wrapper's bottom (= scroll
   viewport bottom, above the footer). */
.sheet__scroll-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--x-size-img-xl);
  pointer-events: none;
  background: var(--x-gradient-scroll-fade-bottom);
  opacity: 0;
  transition: opacity var(--x-motion-hover);
}
.sheet__scroll-fade.is-visible { opacity: 1; }

/* Footer */
.sheet__footer {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  flex-shrink: 0;
  padding: var(--x-pad-surface-m) var(--x-pad-surface-m) var(--x-pad-surface-xl);
  border-top: var(--border-weight-default) solid var(--x-border-divider);
  border-top-left-radius: var(--x-radius-container-m);
  border-top-right-radius: var(--x-radius-container-m);
  background-image: var(--x-bg-sheet-footer);
  background-color: var(--x-bg-page);
  box-shadow: var(--x-shadow-checkout-footer);
  position: relative;
  z-index: 1;
  /* Pulls the footer up over a preceding #pre-footer loyalty ribbon (its
     rounded top corners overlap the band) — 0px for every store without one
     (--x-checkout-loyalty-overlap defaults to 0), so this is a no-op elsewhere. */
  margin-top: calc(-1 * var(--x-checkout-loyalty-overlap, 0px));
}

/* ── Slide-up motion — layered follow-through: panel settles a beat behind
   the scrim on enter, scrim trails a beat behind the panel on exit (same
   idiom as the sticky footer below). ───────────────────────────────────── */
.sheet-enter-active .sheet__panel {
  transition: transform var(--x-motion-modal-enter);
  transition-delay: var(--x-motion-sys-duration-modal-panel-delay);
}
.sheet-enter-from .sheet__panel { transform: translateY(100%); }
.sheet-enter-to   .sheet__panel { transform: translateY(0); }

.sheet-enter-active .sheet__scrim { transition: opacity var(--x-motion-modal-enter); }
.sheet-enter-from .sheet__scrim { opacity: 0; }
.sheet-enter-to   .sheet__scrim { opacity: 1; }

.sheet-leave-active .sheet__panel { transition: transform var(--x-motion-modal-exit); }
.sheet-leave-from .sheet__panel { transform: translateY(0); }
.sheet-leave-to   .sheet__panel { transform: translateY(100%); }

.sheet-leave-active .sheet__scrim {
  transition: opacity var(--x-motion-modal-exit);
  transition-delay: var(--x-motion-sys-duration-modal-panel-delay);
}
.sheet-leave-from .sheet__scrim { opacity: 1; }
.sheet-leave-to   .sheet__scrim { opacity: 0; }

/* ── Sticky footer — simple 100ms trail. On enter the footer starts 100ms
   after the panel (trails it in); on exit it also lags 100ms behind the
   panel's slide-down. Same slide+fade as the panel, just delayed. */
.sheet-enter-active .sheet__footer {
  transition: transform var(--x-motion-modal-enter), opacity var(--x-motion-modal-enter);
  transition-delay: var(--x-motion-sys-duration-footer-delay);
}
.sheet-leave-active .sheet__footer {
  transition: transform var(--x-motion-modal-exit), opacity var(--x-motion-modal-exit);
  transition-delay: var(--x-motion-sys-duration-footer-delay);
}
.sheet-enter-from .sheet__footer,
.sheet-leave-to   .sheet__footer { transform: translateY(var(--x-motion-sys-distance-lg)); opacity: 0; }
.sheet-enter-to   .sheet__footer,
.sheet-leave-from .sheet__footer { transform: translateY(0); opacity: 1; }

/* ── Handoff enter — escape hatch for cross-mount morphing between TWO
   SEPARATE sheet components (e.g. CheckoutSheet ⇄ ItemSummarySheet, both on
   BaseSheet but each their own instance, coordinated via useSheetTransition).
   The consumer's own before-enter/enter/after-enter (and before-leave/leave)
   hooks — forwarded straight through from BaseSheet's Transition — drive the
   actual height/opacity morph via inline styles on the forwarded `el`; these
   classes only suppress the default slide/scale transform so the JS-driven
   values aren't fought. Scoped here (not in the consumer) because .sheet__panel
   only carries BaseSheet's own scoped-CSS attribute. */
.sheet--handoff-enter.sheet-enter-from .sheet__panel,
.sheet--handoff-to-info.sheet-enter-from .sheet__panel {
  transform: translateY(0);
}
@container (min-width: 801px) {
  .sheet--handoff-enter.sheet--responsive.sheet-enter-from .sheet__panel,
  .sheet--handoff-to-info.sheet--responsive.sheet-enter-from .sheet__panel {
    transform: scale(1);
  }
}

/* ── Responsive (desktop) — centered modal at M+ ───────────────────────────
   Precedence note: this max-height:80vh rule must stay defined AFTER the
   size-hint rules above (source order) so it wins over `.sheet--size-compact`
   /`.sheet--size-full`'s mobile height on desktop — an inline `height` set by
   the content-swap engine is cleared on cleanup for the same reason. */
.sheet--responsive {
  position: fixed;
}

@container (min-width: 801px) {
  .sheet--responsive {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--x-pad-surface-xl);
  }
  .sheet--responsive .sheet__panel {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    width: 100%;
    max-width: var(--sheet-max-width, 420px);
    max-height: 80vh;
    height: auto;
    border: var(--border-weight-default) solid var(--x-border-sheet);
    border-radius: var(--x-radius-container-s);
  }
  .sheet--responsive.sheet-enter-active .sheet__panel,
  .sheet--responsive.sheet-leave-active .sheet__panel {
    transition: transform var(--x-motion-modal-enter), opacity var(--x-motion-modal-enter);
  }
  .sheet--responsive.sheet-enter-from .sheet__panel,
  .sheet--responsive.sheet-leave-to .sheet__panel {
    transform: scale(0.96);
    opacity: 0;
  }
  .sheet--responsive.sheet-enter-to .sheet__panel,
  .sheet--responsive.sheet-leave-from .sheet__panel {
    transform: scale(1);
    opacity: 1;
  }
}

/* ── Landscape full-screen (framed mobile only) ────────────────────────────
   Payment/Checkout sheet in landscape goes edge-to-edge instead of a bottom
   sheet (Figma node 6060:3935): header spans the top, body + footer sit side
   by side as two columns filling the rest of the screen. Declared after the
   size-hint + responsive rules above so it wins on shared properties
   (height, position) at equal selector specificity via source order. */
.sheet--landscape-full .sheet__panel {
  inset: 0;
  height: 100%;
  width: 100%;
  padding: var(--x-pad-surface-m);
  gap: var(--x-pad-surface-m);
  border-top: 0;
  border-radius: 0;
  display: grid;
  /* Figma node 6060:3945's Body — PC list (5) : summary (3) — not an even split. */
  grid-template-columns: 5fr 3fr;
  grid-template-rows: auto 1fr;
  /* This is a full page, not a floating glass panel — flat --x-bg-page, no
     --x-bg-sheet (L2) gradient fill or blur. The two grid cells below carry
     their own L1 container surface instead (Figma node 6060:3945's Body). */
  background-image: none;
  background-color: var(--x-bg-page);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
.sheet--landscape-full .sheet__header {
  grid-column: 1 / -1;
  /* Horizontal/top padding — no override, uses the same header chrome every
     other sheet gets (base `.sheet__header` rule). An earlier `padding: 0`
     override here (reasoning it redundant with the panel's own edge inset)
     put the close button right at this box's own edge, where it went
     missing at some scales/viewports instead of just looking tighter.
     Bottom padding IS added here — the base rule has none (a bottom sheet's
     body/footer chrome below already provides separation there), but this
     header sits directly above the grid row with nothing else between. */
  padding-bottom: var(--x-pad-surface-s);
}
/* Both grid cells are their own L1 container (Figma node 6060:3945's Body:
   the PC list and the summary each sit in a filled box on the flat page
   background above) — same fill tier as a SKU card (--x-bg-sku-card-default),
   not the L2 sheet fill the base rules give every other sheet's body/footer.
   Figma gives this OUTER box a fill only, no stroke — unlike the PC Card
   tiles inside it (CheckoutStepBody's own .sheet__pc-card), which DO carry
   an L1 border; don't add one here to match. */
.sheet--landscape-full .sheet__body-wrap,
.sheet--landscape-full .sheet__footer {
  border-radius: var(--x-radius-container-s);
  background-image: var(--x-bg-sku-card-default);
  overflow: hidden;
}
.sheet--landscape-full .sheet__body-wrap {
  grid-column: 1;
  grid-row: 2;
  min-height: 0;
}
/* The padded, scrollable box (Figma's 12px/8px) is this wrapper's child
   .sheet__body, not the wrapper itself — .sheet__body-wrap only exists to
   host the scroll-fade overlay alongside it (see BaseSheet's template) and
   carries no padding of its own in any mode. */
.sheet--landscape-full .sheet__body {
  padding: var(--x-pad-surface-m) var(--x-pad-surface-s);
  gap: var(--x-gap-content-default);
}
/* Right column — no longer a bottom-pinned bar, so the shared .sheet__footer
   chrome (top border/shadow/rounded-corner separation from the body above)
   is replaced entirely by the shared L1 container rule above; this just
   clears the leftover bottom-bar box model and applies the same Figma
   12px/8px padding as the left column's .sheet__body. */
.sheet--landscape-full .sheet__footer {
  grid-column: 2;
  grid-row: 2;
  margin-top: 0;
  padding: var(--x-pad-surface-m) var(--x-pad-surface-s);
  border-top: 0;
  box-shadow: none;
  justify-content: flex-start;
}
</style>
