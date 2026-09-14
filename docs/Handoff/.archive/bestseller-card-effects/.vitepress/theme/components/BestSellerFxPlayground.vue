<script setup>
/**
 * BestSellerFxPlayground — a live, single-card focus demo of BestSellerCard's
 * effects layer, styled with the REAL vendored tokens/keyframes/.fx-* classes
 * (the 11-file cascade from handoff.config.mjs). This is a faithful demo stub,
 * not the production .vue file — BestSellerCard is composable-bound (useCheckout
 * / useHaptics / useStoreConfig / useStoreAssets / useStoreStrings / useLocale),
 * so per the interactive-handoff decision tree it's re-mocked here while every
 * colour, gradient, radius, border-weight, shadow, conic border and bloom comes
 * straight from the prototype tokens.
 *
 * Controls map directly to README §2:
 *  - compact / selected together cover all four §2.1 states (hero-default,
 *    hero-selected, compact-default, compact-selected).
 *  - "Replay entrance" remounts the stage, replaying §2.2's
 *    mount-pending → entering → settled sequence (see the Choreography Timeline
 *    below for a scrubbable view of just that).
 *  - Ring variant demonstrates §2.1.c's worked example: 'hdr' is COD:M's actual
 *    default; 'dual' shows Warhammer 40,000: Rogue Trader's resolved comet
 *    colours (gold + warp-green) — live and real, not illustrative swatches,
 *    but note per the doc: Rogue Trader's own BestSellerCard stays on 'hdr'
 *    today: this toggle previews what enabling `heroRingEffect: 'dual'` on it
 *    would look like, colours pulled straight from its theme file.
 *  - "Damp motion" mimics what reduced-motion.css does globally (§6) — can't be
 *    faked from the OS setting, so this is a demo stand-in, not the real toggle.
 */
import { ref } from 'vue'

const runId = ref(0)          // bump → remount the stage → replay sku-enter
const compact = ref(false)    // hero vs compact/carousel variant
const selected = ref(false)   // hero-selected / compact-selected
const ring = ref('hdr')       // 'hdr' (COD:M default) | 'dual' (Rogue Trader worked example)
const damp = ref(false)       // demo stand-in for prefers-reduced-motion

function replay() { runId.value++ }
</script>

<template>
  <TokenSandbox title="Best Seller Card — effects stage">
    <template #default>
      <div
        :key="runId"
        class="stage"
        :class="{ 'stage--damp': damp }"
      >
        <div
          class="best"
          :class="[
            compact ? 'best--compact' : (ring === 'dual' ? 'fx-glow-border--dual' : 'fx-glow-border--hdr'),
            !compact ? 'fx-bloom' : '',
            selected ? 'best--selected' : '',
            ring === 'dual' && !compact ? 'best--dual' : '',
          ]"
        >
          <div class="best__img">
            <div class="art art--coin" :class="{ 'art--big': !compact }" />
          </div>
          <div class="best__info">
            <div class="best__col">
              <div class="best__amount text-style-heading-sku-title">5,000</div>
              <div class="best__bonus">4,000 + <span class="bonus">1,000 BONUS</span></div>
            </div>
            <div class="best__price">
              <span class="strike">$79.99</span>
              <div class="price text-style-heading-sku-title">$49.99</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #controls>
      <button type="button" class="ctl" @click="replay">↻ Replay entrance</button>
      <label class="ctl-check"><input type="checkbox" v-model="compact" /> Compact (carousel) variant</label>
      <label class="ctl-check"><input type="checkbox" v-model="selected" /> Selected state</label>
      <label class="ctl-check"><input type="checkbox" v-model="damp" /> Damp motion (≈ reduced-motion)</label>
      <label class="ctl-field">
        Ring variant
        <select v-model="ring" :disabled="compact">
          <option value="hdr">hdr — COD:M default</option>
          <option value="dual">dual — Rogue Trader worked example (§2.1.c)</option>
        </select>
      </label>
    </template>

    <template #hint>
      Toggle <strong>Compact</strong> + <strong>Selected</strong> to reach all four §2.1 states.
      With Compact checked, the ring/bloom disappear and the shimmer sweeps the coin art instead —
      and checking Selected on top produces <strong>no ring artifact at all</strong> (§2.1.d's
      <code>compact-selected</code> invariant — the selection rule targets a <code>::before</code>
      that only exists on the hero variant). The <strong>Ring variant</strong> select swaps
      <code>--hdr-glow</code>/<code>--hdr-hot</code> (gold/near-white) for Rogue Trader's resolved
      <code>--fx-border-glow</code>/<code>-hot</code>/<code>-trail-glow</code>/<code>-trail-hot</code>
      (imperial gold + warp-green) — real theme values, not a mock. <strong>Damp motion</strong>
      freezes the ring mid-arc and hides the shimmer off-canvas per §2.1.d's reduced-motion
      asymmetry, rather than stopping both the same way.
    </template>
  </TokenSandbox>
</template>

<style scoped>
.stage {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

/* ── BestSellerCard skeleton — matches README §4 ────────────────────────────── */
.best {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: var(--radius-container-s);
  border-top: var(--border-weight-default) solid var(--border-warm);
  border-left: var(--border-weight-default) solid var(--border-warm);
  background: var(--gradient-bestseller-hero);
  animation-name: sku-enter;
  animation-duration: var(--motion-sys-duration-slow);
  animation-timing-function: var(--motion-sys-ease-decelerate);
  animation-fill-mode: both;
  overflow: visible; /* no clip — the ::before conic ring must not be cut */
  cursor: pointer;
  transition: transform var(--motion-sku-hover), box-shadow var(--motion-sku-hover);
}
.best:hover { transform: translateY(-2px); box-shadow: var(--shadow-bestseller); }

/* Bloom colour field — mirrors BestSellerCard.vue's own --fx-bloom-image override */
.best {
  --fx-bloom-image: radial-gradient(
    ellipse at 50% 55%,
    var(--hdr-hot) 0%,
    var(--hdr-hot) 22%,
    var(--hdr-glow) 55%,
    transparent 72%
  );
}
.best::after { inset: -10%; filter: blur(44px) brightness(1.1) saturate(1.1); }

/* Rogue Trader worked example — swap the bloom field to the dual-comet colours too,
   so the halo matches the ring when previewing 'dual' (README §2.1.c). */
.best--dual {
  --fx-bloom-image: radial-gradient(
    ellipse at 50% 55%,
    var(--fx-border-trail-hot, var(--hdr-hot)) 0%,
    var(--fx-border-trail-hot, var(--hdr-hot)) 22%,
    var(--fx-border-glow, var(--hdr-glow)) 55%,
    transparent 72%
  );
}

/* Compact (carousel) variant — shimmer instead of ring/bloom */
.best--compact {
  overflow: hidden;
  background: var(--gradient-bestseller-hero-hover);
}
.best--compact .best__img { overflow: hidden; position: relative; }
.best--compact .best__img::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: var(--gradient-bestseller-metallic-shine);
  transform: translateX(-150%) skewX(-20deg);
  pointer-events: none;
  opacity: 0.25;
  animation-name: shimmer-loop;
  animation-duration: 2954ms;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

/* Selected — static ring swap (hero only; compact never generates a ::before here
   because .best--compact never carries a fx-glow-border--* class, matching the
   real "no content on ::before" invariant from README §2.1.d) */
.best--selected { background: var(--bg-card-selected); }
.best--selected.fx-glow-border--hdr::before,
.best--selected.fx-glow-border--dual::before {
  animation: none;
  background: var(--border-sku-card-selected);
  padding: var(--border-weight-selected);
}

.best__img { display: grid; place-items: center; padding: var(--pad-surface-s) 0; position: relative; z-index: 1; }
.best__info {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--gap-content-default);
  padding: var(--pad-surface-s) var(--pad-surface-s) var(--pad-surface-l);
  background: var(--gradient-bestseller-vignette);
  position: relative; z-index: 1;
}
.best__col { display: flex; flex-direction: column; }
.best__amount { color: var(--text-header-default); text-transform: uppercase; }
.best__bonus { font-size: 12px; color: var(--text-body-default); }
.bonus { color: var(--text-bonus-amount); }
.best__price { display: flex; flex-direction: column; align-items: flex-end; }
.strike { color: var(--text-body-default); text-decoration: line-through; font-size: 12px; }
.price { color: var(--text-hyperlink-default); text-transform: uppercase; font-size: 18px; }

.art { border-radius: var(--radius-container-xs); }
.art--coin {
  width: 56px; height: 56px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, oklch(0.95 0.15 95), oklch(0.7 0.15 75) 60%, oklch(0.5 0.1 60));
}
.art--big { width: 96px; height: 96px; }

/* Damp motion — demo stand-in for prefers-reduced-motion (§6/§2.1.d) */
.stage--damp .best,
.stage--damp .best *,
.stage--damp .best::before,
.stage--damp .best::after {
  animation-play-state: paused !important;
  transition: none !important;
}

/* control widgets — match kit convention */
.ctl { padding: 6px 14px; border-radius: 6px; border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-1); color: #111; font-weight: 600; font-size: 12px; cursor: pointer; }
.ctl-check { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; }
.ctl-field { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; }
.ctl-field select {
  padding: 4px 8px; border-radius: 4px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-size: 12px;
}
</style>
