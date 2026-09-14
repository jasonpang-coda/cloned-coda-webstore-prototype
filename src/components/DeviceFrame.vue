<script setup>
import { computed, ref } from 'vue'
import { DEVICES } from '../devices/index.js'
import { useDeviceScale } from '../composables/useDeviceScale.js'
import { useOrientation } from '../composables/useOrientation.js'
import MaterialIcon from './MaterialIcon.vue'

/**
 * DeviceFrame — config-driven device chrome for prototype previews.
 *
 * Adding a new device: edit src/devices/index.js only. This component
 * reads everything (dimensions, buttons, colours) from the registry.
 *
 * Props:
 *   device — key from DEVICES registry, or 'none' for responsive view.
 */
const props = defineProps({
  device: { type: String, default: 'iphone' },
})

const isFramed = computed(() => props.device !== 'none')
const { orientation } = useOrientation()
const isLandscape = computed(() => isFramed.value && orientation.value === 'landscape')

// Landscape swaps screenW/screenH, and the status bar (time/battery/signal)
// hides entirely — a rotated phone doesn't reserve a top safe-area for a
// notch that has physically moved to the side, so safeTop collapses to 0.
const spec = computed(() => {
  const base = DEVICES[props.device] || DEVICES.iphone
  if (!isLandscape.value) return base
  return { ...base, screenW: base.screenH, screenH: base.screenW, safeTop: 0 }
})

// Landscape's much shorter screen (swapped screenH) means the frame's fixed
// corner radius — unchanged from portrait, since it's the same physical
// corner just reoriented — now eats into a much bigger share of the short
// dimension. In portrait that's negligible (radius is a sliver of the tall
// screen); in landscape, flush-edge content visibly clips into the curve
// near all four corners. Rather than computing exact per-corner clearance,
// this just adds breathing room on both sides equal to the screen's own
// corner radius (radius - bezel) — a simple "stop hugging the edge" inset,
// applied to the whole store (scrollable page content AND the sheet/overlay
// layer), landscape only.
const landscapeCornerInset = computed(() => {
  if (!isLandscape.value) return 0
  const s = spec.value
  return s.radius - s.bezel
})

const deviceHeight = () =>
  isFramed.value ? spec.value.screenH + spec.value.bezel * 2 : 0

// Root of the mockup — used to detect focus inside it (see useDeviceScale's
// isTypingInFrame) so an on-screen keyboard doesn't re-scale/shift the frame.
const frameRootRef = ref(null)
const { scale } = useDeviceScale(deviceHeight, () => isFramed.value, frameRootRef)

// ── Frame shell ──────────────────────────────────────────────────────────────
const frameStyle = computed(() => {
  if (!isFramed.value) return {}
  const s = spec.value
  return {
    width:        s.screenW + s.bezel * 2 + 'px',
    height:       s.screenH + s.bezel * 2 + 'px',
    padding:      s.bezel + 'px',
    borderRadius: s.radius + 'px',
    background:   s.frame,
    boxShadow:    s.shadow,
    transform:    `scale(${scale.value})`,
  }
})

// ── Screen viewport ──────────────────────────────────────────────────────────
const screenStyle = computed(() => {
  if (!isFramed.value) return {}
  const s = spec.value
  return {
    width:        s.screenW + 'px',
    height:       s.screenH + 'px',
    // Uniform on all 4 corners, matching the frame's own curve (radius -
    // bezel = "concentric" with the outer rounded rect). A square bottom
    // was tried and reverted — the frame's corner radius (62px) is much
    // bigger than the bezel gap (14px), so a square content corner
    // physically pokes past the frame's own rounded silhouette and paints
    // over its border. Only a matching radius keeps content within it.
    borderRadius: s.radius - s.bezel + 'px',
    paddingLeft:  landscapeCornerInset.value + 'px',
    paddingRight: landscapeCornerInset.value + 'px',
    '--safe-top': s.safeTop + 'px',
  }
})

// ── Camera-cutout (notch/punch) helpers ─────────────────────────────────────
// Portrait: centered on the top edge, `topFromBezel` down from it (centering
// comes from the .device__island/.device__punch class's own
// left:50%/translateX(-50%) — these only add `top`). Landscape: the frame
// has rotated 90° CCW (top edge → left edge), so the notch now sits on the
// LEFT edge — same offset value, now measured inward from the left edge,
// vertically centered. The island pill's footprint swaps with it (a
// horizontal capsule becomes a vertical one); the punch-hole is circular so
// only its position changes.
function islandStyle(island, bezel) {
  if (!isLandscape.value) {
    return {
      width:  island.width + 'px',
      height: island.height + 'px',
      top:    bezel + island.topFromBezel + 'px',
    }
  }
  return {
    width:     island.height + 'px',
    height:    island.width + 'px',
    left:      bezel + island.topFromBezel + 'px',
    top:       '50%',
    transform: 'translateY(-50%)',
  }
}
function punchStyle(punch, bezel) {
  if (!isLandscape.value) {
    return {
      width:  punch.size + 'px',
      height: punch.size + 'px',
      top:    bezel + punch.topFromBezel + 'px',
    }
  }
  return {
    width:     punch.size + 'px',
    height:    punch.size + 'px',
    left:      bezel + punch.topFromBezel + 'px',
    top:       '50%',
    transform: 'translateY(-50%)',
  }
}

// ── Side button helpers ───────────────────────────────────────────────────────
// Buttons live in the bezel area to the left/right of the screen.
// `top` in the registry is measured from the TOP of the outer frame (incl. bezel).
// Landscape (90° CCW rotation, matching the notch above): the left edge
// becomes the bottom edge and the right edge becomes the top edge — `top`'s
// distance-from-corner meaning carries over unchanged as a distance from the
// (new) left edge, so no frame-size pivot is needed here.
function btnStyleLeft(btn) {
  if (!isLandscape.value) {
    return {
      top:          btn.top + 'px',
      height:       btn.height + 'px',
      width:        btn.width + 'px',
      left:         '0px',
      borderRadius: btn.radius,
    }
  }
  return {
    left:         btn.top + 'px',
    width:        btn.height + 'px',
    height:       btn.width + 'px',
    bottom:       '0px',
    transform:    'translateY(100%)',
    borderRadius: '0 0 2px 2px',
  }
}
function btnStyleRight(btn) {
  if (!isLandscape.value) {
    return {
      top:          btn.top + 'px',
      height:       btn.height + 'px',
      width:        btn.width + 'px',
      right:        '0px',
      borderRadius: btn.radius,
    }
  }
  return {
    left:         btn.top + 'px',
    width:        btn.height + 'px',
    height:       btn.width + 'px',
    top:          '0px',
    transform:    'translateY(-100%)',
    borderRadius: '2px 2px 0 0',
  }
}
</script>

<template>
  <!-- ── No-frame (responsive) ────────────────────────────────────────────── -->
  <div v-if="!isFramed" class="device-stage">
    <div ref="frameRootRef" class="device device--none">
      <div class="device__screen">
        <slot />
      </div>
      <!-- Overlay layer (drawers/modals). Uses `position:absolute` inside a
           `position:relative` wrapper — same mechanism as the framed overlay,
           avoiding the `position:fixed` / ancestor-transform containment bug. -->
      <div class="device__overlay device__overlay--responsive">
        <slot name="overlay" />
      </div>
    </div>
  </div>

  <!-- ── Framed device ────────────────────────────────────────────────────── -->
  <div v-else class="device-stage">
    <div ref="frameRootRef" class="device" :style="frameStyle">

      <!-- Inner highlight ring — thin white rim on the top/left edge for 3-D depth -->
      <div class="device__inner-ring" :style="{ borderRadius: spec.radius + 'px' }"></div>

      <!-- Camera cutout: Dynamic Island (iPhone) or punch-hole (Samsung) -->
      <div
        v-if="spec.hardware.island"
        class="device__island"
        :style="islandStyle(spec.hardware.island, spec.bezel)"
      ></div>
      <div
        v-if="spec.hardware.punch"
        class="device__punch"
        :style="punchStyle(spec.hardware.punch, spec.bezel)"
      ></div>

      <!-- Status bar content (time + signal/wifi/battery) — fills the safeTop
           band above the screen, alongside the camera-cutout hardware above.
           Assumes a dark app background (true for every store but one) since
           this is decorative device chrome, not theme-aware store UI.
           Landscape hides it outright: the notch it anchors to has moved to
           the side edge, so there's no top band left for it to occupy. -->
      <div
        v-if="spec.hardware.island && !isLandscape"
        class="device__statusbar device__statusbar--iphone"
        :style="{
          top:    spec.bezel + 'px',
          left:   spec.bezel + 'px',
          right:  spec.bezel + 'px',
          height: spec.safeTop + 'px',
          borderTopLeftRadius:  (spec.radius - spec.bezel) + 'px',
          borderTopRightRadius: (spec.radius - spec.bezel) + 'px',
        }"
      >
        <span class="device__statusbar-time">9:41</span>
        <div class="device__statusbar-icons">
          <MaterialIcon name="signal_cellular_alt" :size="15" />
          <MaterialIcon name="network_wifi" :size="15" />
          <MaterialIcon name="battery_full" :size="15" />
        </div>
      </div>
      <div
        v-if="spec.hardware.punch && !isLandscape"
        class="device__statusbar device__statusbar--samsung"
        :style="{
          top:    spec.bezel + 'px',
          left:   spec.bezel + 'px',
          right:  spec.bezel + 'px',
          height: spec.safeTop + 'px',
          borderTopLeftRadius:  (spec.radius - spec.bezel) + 'px',
          borderTopRightRadius: (spec.radius - spec.bezel) + 'px',
        }"
      >
        <span class="device__statusbar-time">9:30</span>
        <div class="device__statusbar-icons">
          <MaterialIcon name="network_wifi" :size="14" />
          <MaterialIcon name="signal_cellular_alt" :size="14" />
          <MaterialIcon name="battery_full" :size="14" />
        </div>
      </div>

      <!-- Left-side hardware buttons -->
      <template v-if="spec.hardware.buttonsLeft">
        <div
          v-for="btn in spec.hardware.buttonsLeft"
          :key="'L-' + btn.label"
          class="device__button device__button--left"
          :style="btnStyleLeft(btn)"
        ></div>
      </template>

      <!-- Right-side hardware buttons -->
      <template v-if="spec.hardware.buttonsRight">
        <div
          v-for="btn in spec.hardware.buttonsRight"
          :key="'R-' + btn.label"
          class="device__button device__button--right"
          :style="btnStyleRight(btn)"
        ></div>
      </template>

      <!-- The scrollable screen content area -->
      <div class="device__screen" :style="screenStyle">
        <slot />
      </div>

      <!-- Overlay layer (drawers/modals) — covers the screen box, clipped to its
           rounded corners, and does NOT scroll with content. ALL FOUR corners
           square off in landscape: landscapeCornerInset already pushes this
           box's left/right edges in by exactly the frame's own corner radius
           (bezel + (radius-bezel) = radius from the frame edge), which is
           precisely the point a rounded rect's boundary becomes straight
           again — so a square corner HERE lands exactly on that safe
           boundary instead of overflowing past the frame's curve the way a
           square corner did earlier this session (before that inset existed,
           at plain bezel spacing). Bottom corners needed this first (lets a
           full-bleed child like CategoryNav's bottom bar render genuinely
           square); top corners square off the same way for a full-bleed
           child pinned there instead (BaseSheet's landscape-full Payment
           sheet, header flush at y:0) — nothing currently renders IN that
           top-corner curve outside landscape-full (every other overlay
           consumer's content starts below it), so this is a no-op elsewhere. -->
      <div
        class="device__overlay"
        :style="{
          top: spec.bezel + 'px',
          left: (spec.bezel + landscapeCornerInset) + 'px',
          right: (spec.bezel + landscapeCornerInset) + 'px',
          bottom: spec.bezel + 'px',
          borderRadius: isLandscape ? '0px' : (spec.radius - spec.bezel) + 'px',
          '--safe-top': spec.safeTop + 'px',
        }"
      >
        <slot name="overlay" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-stage {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}

/* ── Frame shell ─────────────────────────────────────────────────────────── */
.device {
  position: relative;
  flex-shrink: 0;
  transform-origin: top center;
  /* Smooths any legitimate rescale (e.g. an actual window resize) into a
     settle rather than an abrupt snap — see useDeviceScale's focus-guard for
     the more common case (on-screen keyboard) this avoids entirely. width/
     height get the slower "large surface move" duration (orientation swaps
     the whole frame footprint) rather than transform's own resize-settle
     duration. */
  transition:
    transform var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard),
    width var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    height var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard);
  /* background, border-radius, box-shadow come from frameStyle (registry) */
}

/* Inner-edge highlight — simulates the machined bevel on real metal frames */
.device__inner-ring {
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  pointer-events: none;
  z-index: 30;
  box-shadow:
    /* bright highlight along the top-left arc */
    inset 0  1px 0   rgba(255, 255, 255, 0.55),
    inset 1px 0  0   rgba(255, 255, 255, 0.25),
    /* dark shadow on the bottom-right arc */
    inset 0 -1px 0   rgba(0, 0, 0, 0.30),
    inset -1px 0 0   rgba(0, 0, 0, 0.18);
}

/* No-frame: screen fills window */
.device--none {
  position: relative; /* anchors the --responsive overlay so it covers the content */
  width: 100%;
  background: transparent;
  min-height: 100dvh;
}
.device--none .device__screen {
  width: 100%;
  height: auto;
  min-height: 100dvh;
  border-radius: 0;
  /* Unlike framed mode (a fixed-height screen that truly needs its own
     scrollbar), responsive mode already lets this box grow to fit all
     content (height: auto above) — its own overflow-y: auto never actually
     engages (scrollTop stays 0 forever; the real scrolling happens on the
     window/documentElement instead). But CSS still counts ANY ancestor
     with overflow != visible as the nearest "scroll container" for
     `position: sticky` descendants to compute their stuck offset against —
     so a sticky element in here (e.g. a page-model top category nav) binds
     to this box's own (unbounded, ever-growing) coordinate space instead of
     the real viewport, and silently rides off-screen as the box scrolls
     within the window. Since this box never actually needs to clip/scroll
     in this mode, overriding to `visible` removes it from sticky's lookup
     entirely, letting sticky descendants correctly bind to the window. */
  overflow: visible;
}

/* ── Overlay layer (drawers / modals) ────────────────────────────────────── */
/* Sits over the screen but OUTSIDE the scroll container, so overlays stay put
   while page content scrolls.
   NOTE: deliberately NO `container-type` here — it would establish a containing
   block for `position: fixed` descendants, trapping the desktop sign-in loader /
   checkout modal / snackbar inside the (tall, scaled) device screen instead of
   the viewport. The sibling `.device__overlay--responsive` below DOES set
   `container-type` — see its comment for why that one is safe and this one isn't. */
.device__overlay {
  position: absolute;
  z-index: 40;          /* above NavBar (20); BELOW hardware (45) — a real
                            phone's notch/status bar always sits above app
                            content, sheets included */
  overflow: hidden;     /* clip the drawer/scrim to the rounded screen */
  pointer-events: none; /* children opt back in */
  /* left/right grow in landscape for corner-radius clearance (see
     landscapeCornerInset); border-radius's bottom corners square off at the
     same time (see the template comment above) — both animate together. */
  transition:
    left var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    right var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    border-radius var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard);
}

/* Responsive overlay: position:fixed so the drawer/scrim is bounded to the
   visible viewport, not the full scrollable page height. `top: var(--toolbar-h)`
   starts it just below the sticky DeviceToolbar (measured on mount in App.vue and
   written to :root). No ancestor transform exists in responsive mode, so fixed
   correctly resolves to the viewport (unlike framed mode where scale() traps it).
   overflow:visible so the slide-in panel isn't clipped at the left edge.
   `container-type: inline-size` gives fixed-position overlay children (BaseSheet's
   `.sheet--responsive`, BuyNowBar's `.buynow--responsive`) an `@container` query
   ancestor for their desktop (≥801px) layout, per this repo's container-query-only
   rule. Safe here specifically because this box is itself already viewport-sized
   (fixed, inset 0 below the toolbar) — becoming a containing block for its own
   fixed descendants changes nothing visually. Do NOT copy this to the sibling
   framed `.device__overlay` above: that one is bounded to the (small, scaled)
   device screen, and `.sheet--responsive`/`.buynow--responsive` never render
   inside it (they only appear when device === 'none', i.e. this responsive
   overlay) — adding containment there would trap a fixed sheet inside the frame. */
.device__overlay--responsive {
  position: fixed;
  top: var(--toolbar-h, 0px);
  right: 0;
  bottom: 0;
  left: 0;
  overflow: visible;
  border-radius: 0;
  container-type: inline-size;
}

/* ── Screen viewport ─────────────────────────────────────────────────────── */
.device__screen {
  position: relative;
  /* z-index: 0 keeps screen in device stacking context so camera hardware
     elements (z-index 20) render above it without container-type promotion */
  z-index: 0;
  overflow-y: auto;
  overflow-x: hidden;
  /* Explicit pan-y: tells the browser this container owns vertical gestures.
     Without this, the browser sees a vertical scroll container with touch-action:auto
     and intercepts ambiguous swipes — blocking child elements (e.g. the horizontal
     carousel) from receiving their own touch-action:pan-x gestures. */
  touch-action: pan-y;
  background: var(--x-bg-page, #0c0e16);
  container-type: inline-size;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  /* Orientation swaps width/height (portrait↔landscape) — same "large
     surface move" duration as the outer frame, so the screen box and its
     chrome resize in lockstep instead of one snapping ahead of the other.
     padding-left/right transition the same way — they grow in landscape for
     corner-radius clearance (see landscapeCornerInset). */
  transition:
    width var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    height var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    padding-left var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    padding-right var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard);
}
.device__screen::-webkit-scrollbar { display: none; }

/* ── Camera hardware ─────────────────────────────────────────────────────── */
/* top/left/right/bottom/width/height/transform transition together at the
   same "large surface move" pace as the frame/screen resize above, so the
   notch and buttons visibly travel to their new edge rather than jumping
   there the instant the frame finishes resizing. */
.device__island {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: #000;
  border-radius: var(--x-radius-badge-full);
  z-index: 45; /* above .device__overlay (40) — hardware always tops app content */
  pointer-events: none;
  /* Subtle inner shadow for depth */
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.8);
  transition:
    top var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    left var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    width var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    height var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    transform var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard);
}

.device__punch {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: #000;
  border-radius: var(--x-radius-circle);
  z-index: 45; /* above .device__overlay (40) — hardware always tops app content */
  pointer-events: none;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.10),
    0 0 0 2px rgba(0, 0, 0, 0.6),
    inset 0 1px 2px rgba(0, 0, 0, 0.9);
  transition:
    top var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    left var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    transform var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard);
}

/* ── Status bar content (time + signal/wifi/battery) ─────────────────────── */
.device__statusbar {
  position: absolute;
  /* Below the camera-cutout hardware (45) so its own semi-transparent tint +
     backdrop-blur doesn't paint over — and blur out — the notch/punch-hole,
     which renders earlier in the DOM but ties at the same z-index. Still
     above .device__overlay (40). */
  z-index: 44;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
  color: #fff;
  overflow: hidden; /* clips the blur/tint to the screen's own rounded top corners */
}
.device__statusbar-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* iOS — SF-Pro-ish stack, centred vertically in the 62px safe-top band.
   Blur: real iOS status bars sit on a UIBlurEffect "material" (a much
   heavier native effect than a CSS blur() can reproduce at this size); web
   PWA/mockup implementations commonly approximate it at 8-10px, paired with
   a translucent tint underneath since blur alone barely reads at this
   height — 10px + a dark tint is the closest practical match. */
.device__statusbar--iphone {
  padding: 0 22px;
  font-family: -apple-system, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  background-color: rgba(0, 0, 0, 0.18);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
.device__statusbar--iphone .device__statusbar-time {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

/* Android — Roboto-ish stack, bottom-aligned within the 40px safe-top band
   (matches the Material status bar's own flex-end layout). Android's own
   Material 3 edge-to-edge guidance actually favours a gradient SCRIM over
   the status bar rather than a blur (see developer.android.com's
   "system bar protection" docs) — a lighter blur + a slightly stronger tint
   than iOS approximates that flatter, less "frosted glass" look. */
.device__statusbar--samsung {
  align-items: flex-end;
  padding: 0 18px 6px;
  font-family: Roboto, 'Segoe UI', sans-serif;
  background-color: rgba(0, 0, 0, 0.22);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}
.device__statusbar--samsung .device__statusbar-time {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.14px;
}
.device__statusbar--samsung .device__statusbar-icons {
  gap: 5px;
}

/* ── Side hardware buttons ───────────────────────────────────────────────── */
.device__button {
  position: absolute;
  /* Titanium/metal button colour — slightly recessed from frame surface */
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.20) 0%,
    rgba(0, 0, 0, 0.08) 50%,
    rgba(255, 255, 255, 0.12) 100%
  );
  box-shadow:
    /* recess shadow on the leading edge */
    inset  1px 0   2px rgba(0, 0, 0, 0.35),
    /* highlight on the trailing edge */
    inset -1px 0   1px rgba(255, 255, 255, 0.25),
    /* outer drop shadow to separate from frame */
    0 1px 3px rgba(0, 0, 0, 0.4);
  z-index: 25;
  pointer-events: none;
  transition:
    top var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    left var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    bottom var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    width var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    height var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard),
    transform var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-standard);
}

/* Left buttons sit flush against the left edge of the frame */
.device__button--left {
  transform: translateX(-100%);
}

/* Right buttons sit flush against the right edge */
.device__button--right {
  transform: translateX(100%);
}
</style>
