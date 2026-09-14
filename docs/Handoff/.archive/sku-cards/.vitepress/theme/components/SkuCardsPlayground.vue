<script setup>
/**
 * SkuCardsPlayground — a live gallery of the SKU-card family, styled with the
 * REAL vendored design tokens, keyframes and .fx-* effect classes (the 11-file
 * cascade from handoff.config.mjs). These are faithful demo stubs, not the
 * production .vue files: the cards are composable-bound (useCheckout / useHaptics
 * / store strings / v-ripple), so per the interactive-handoff decision tree they
 * are re-mocked here while every colour, radius, shadow, font, conic border and
 * bloom comes straight from the prototype tokens.
 *
 * Controls: replay the entrance cascade, toggle the selected ring, and damp
 * motion (a demo stand-in for prefers-reduced-motion, which can't be faked from
 * the page — see the README §6 note).
 */
import { ref } from 'vue'

const runId = ref(0)        // bump → remount the gallery → replay sku-enter
const selected = ref(false) // toggles the --selected ring on every card
const damp = ref(false)     // demo stand-in for prefers-reduced-motion

function replay() { runId.value++ }
</script>

<template>
  <TokenSandbox title="Card gallery — live tokens">
    <template #default>
      <div
        :key="runId"
        class="stage"
        :class="{ 'stage--selected': selected, 'stage--damp': damp }"
      >
        <!-- 1 ── SkuCard (currency tile) -->
        <div class="card sku" :style="{ animationDelay: '0ms' }">
          <div class="sku__badge tag">BEST VALUE</div>
          <div class="sku__amount text-style-heading-sku-title">1,200</div>
          <div class="sku__bonus">1,000 + <span class="bonus">200 BONUS</span></div>
          <div class="sku__price" :style="{ animationDelay: '350ms' }">
            <span class="strike">$19.99</span> <span class="pct">-25%</span>
            <div class="price text-style-heading-sku-title">$14.99</div>
          </div>
        </div>

        <!-- 2 ── SkuImageCard (panel variant) -->
        <div class="card simg" :style="{ animationDelay: '90ms' }">
          <div class="simg__panel"><div class="art art--coin" /></div>
          <div class="simg__amount text-style-heading-sku-title">560 CP</div>
          <div class="sub">Best for daily play</div>
          <div class="simg__price" :style="{ animationDelay: '440ms' }">
            <div class="price price--center text-style-heading-sku-title">$5.99</div>
          </div>
        </div>

        <!-- 3 ── GiftSkuCard -->
        <div class="card gift" :style="{ animationDelay: '180ms' }">
          <div class="gift__media"><span class="tag gift__tag">FREE GIFT</span><div class="art art--gift" /></div>
          <div class="gift__title text-style-heading-sku-title">DAILY GIFT</div>
          <div class="sub">Limit: 1</div>
          <div class="gift__cta text-style-heading-sku-title">CLAIM GIFT</div>
          <div class="cd cd--warn">⏱ Ends: 36h 12m</div>
        </div>

        <!-- 4 ── HeroSkuCard (dual-comet border + bloom) -->
        <div class="card hero fx-bloom fx-glow-border--dual" :style="{ animationDelay: '270ms' }">
          <div class="hero__art" />
          <div class="hero__body">
            <div class="hero__text">
              <div class="hero__eyebrow text-style-utility-micro-uppercase">ULTIMATE EDITION</div>
              <div class="hero__title text-style-heading-section">VOIDFARER EDITION</div>
              <div class="chips"><span class="chip">Base Game</span><span class="chip">Season Pass</span></div>
            </div>
            <div class="hero__price">
              <span class="strike">$89.99</span>
              <div class="price text-style-heading-sku-title">$44.50</div>
            </div>
          </div>
        </div>

        <!-- 5 ── BestSellerCard (HDR conic border + bloom) -->
        <div class="card best fx-glow-border--hdr fx-bloom" :style="{ animationDelay: '360ms' }">
          <div class="best__img"><div class="art art--coin art--big" /></div>
          <div class="best__info">
            <div class="best__col">
              <div class="best__amount text-style-heading-section">5,000</div>
              <div class="best__bonus">4,000 + <span class="bonus">1,000 BONUS</span></div>
            </div>
            <div class="best__price">
              <span class="strike">$79.99</span>
              <div class="price text-style-heading-sku-title">$49.99</div>
            </div>
          </div>
        </div>

        <!-- 6 ── BundleSkuCard (banner + breakdown row) -->
        <div class="card bundle" :style="{ animationDelay: '450ms' }">
          <div class="bundle__banner" />
          <div class="bundle__breakdown">
            <div class="bitem"><div class="art art--crate" /></div>
            <div class="bitem"><div class="art art--coin" /></div>
            <div class="bitem"><div class="art art--gift" /></div>
          </div>
          <div class="bundle__info">
            <div class="bundle__title-group">
              <div class="bundle__title text-style-heading-sku-title">STRONGBOX BUNDLE</div>
              <div class="cd cd--err">⏱ Ends: 8h 04m</div>
            </div>
            <div class="bundle__price">
              <span class="strike">$4.99</span>
              <div class="price text-style-heading-sku-title">$0.99</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #controls>
      <button type="button" class="ctl" @click="replay">↻ Replay entrance</button>
      <label class="ctl-check"><input type="checkbox" v-model="selected" /> Selected state</label>
      <label class="ctl-check"><input type="checkbox" v-model="damp" /> Damp motion (≈ reduced-motion)</label>
    </template>

    <template #hint>
      Drag the duration sliders above and hit <strong>Replay entrance</strong> to feel the
      <code>--motion-sys-duration-slow</code> cascade. The conic borders on the Hero / Best-Seller
      cards run on <code>--motion-border-spin</code>; the halo breathes on <code>--motion-sku-bloom</code>.
      Hover and press any card to see the lift / scale tokens. “Damp motion” mimics what
      <code>reduced-motion.css</code> does globally in the real app.
    </template>
  </TokenSandbox>
</template>

<style scoped>
/* The gallery grid — mirrors the real container breakpoints loosely. */
.stage {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  /* establish a containing context so absolutely-positioned art clips cleanly */
}
@media (max-width: 520px) { .stage { grid-template-columns: 1fr; } }

/* ── Shared card skeleton (matches README §2) ──────────────────────────────── */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--gap-content-narrow);
  padding: var(--pad-surface-m) var(--pad-surface-s) var(--pad-surface-l);
  border-radius: var(--radius-container-s);
  background: var(--bg-sku-card-default);
  box-shadow: var(--shadow-card);
  color: var(--text-body-default);
  cursor: pointer;
  overflow: hidden;
  animation-name: sku-enter;
  animation-duration: var(--motion-sys-duration-slow);
  animation-timing-function: var(--motion-sys-ease-decelerate);
  animation-fill-mode: both;
  transition:
    transform var(--motion-sku-hover),
    box-shadow var(--motion-sku-hover);
}
/* gradient ring — the mask-composite idiom */
.card::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: inherit;
  padding: var(--border-weight-default);
  background: var(--border-sku-card-default);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: destination-out;
  pointer-events: none;
  z-index: 4;
  transition: background var(--motion-sku-hover);
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
  transition: transform var(--motion-sku-hover-in), box-shadow var(--motion-sku-hover-in);
}
.card:hover::before { background: var(--border-sku-card-hover); }
.card:active { transform: scale(var(--motion-sku-press-scale)); transition: transform var(--motion-sku-press); }

/* selected ring (toggle) */
.stage--selected .card { background: var(--bg-card-selected); }
.stage--selected .card::before { background: var(--border-sku-card-selected); padding: var(--border-weight-selected); }

/* damp motion → freeze every animation/transition, like reduced-motion.css */
.stage--damp .card,
.stage--damp .card *,
.stage--damp .card::before,
.stage--damp .card::after { animation: none !important; transition: none !important; }

/* Cards span both columns where the real layout is full-width */
.hero, .best, .bundle { grid-column: 1 / -1; }

/* ── Shared bits ───────────────────────────────────────────────────────────── */
.tag {
  align-self: flex-start;
  display: inline-flex;
  padding: var(--pad-surface-xxs);
  border-radius: var(--radius-container-xs);
  background: var(--bg-tag-bonus);
  color: var(--text-tag-bonus);
  font-size: 10px; font-weight: 700; line-height: 1; letter-spacing: 0.04em;
  text-transform: uppercase;
}
.bonus { color: var(--text-bonus-amount); font-weight: 700; }
.sub { color: var(--text-body-default); font-size: 12px; }
.strike { color: var(--text-body-default); text-decoration: line-through; font-size: 12px; }
.pct { color: var(--text-success-default); font-size: 12px; }
.price { color: var(--text-hyperlink-default); text-transform: uppercase; transform-origin: right center; font-size: 18px; }
.price--center { text-align: center; transform-origin: center; }
.cd { font-size: 11px; display: inline-flex; gap: 4px; }
.cd--warn { color: var(--text-warning-default); }
.cd--err { color: var(--text-error-default); }

/* art swatches (CSS gradients in lieu of .webp assets) */
.art { border-radius: var(--radius-container-xs); }
.art--coin { width: 56px; height: 56px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, oklch(0.95 0.18 95), oklch(0.7 0.16 75) 60%, oklch(0.45 0.1 70)); }
.art--big { width: 96px; height: 96px; }
.art--gift { width: 56px; height: 56px;
  background: linear-gradient(135deg, oklch(0.72 0.18 300), oklch(0.5 0.16 290)); }
.art--crate { width: 56px; height: 56px;
  background: linear-gradient(135deg, oklch(0.68 0.14 250), oklch(0.42 0.1 250)); }

/* ── SkuCard ───────────────────────────────────────────────────────────────── */
.sku__amount { color: var(--text-header-default); font-size: 22px; text-transform: uppercase; }
.sku__bonus { font-size: 12px; }
.sku__price { margin-top: auto; padding-top: var(--pad-surface-s); display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
  animation-name: fade-in; animation-duration: var(--motion-sys-duration-slow);
  animation-timing-function: var(--motion-sys-ease-decelerate); animation-fill-mode: both; }

/* ── SkuImageCard ──────────────────────────────────────────────────────────── */
.simg { align-items: center; text-align: center; }
.simg__panel { width: 100%; max-width: 120px; aspect-ratio: 1/1; display: grid; place-items: center;
  border-radius: var(--radius-container-xs); background: oklch(1 0 0 / 0.04); }
.simg__amount { color: var(--text-header-default); font-size: 18px; text-transform: uppercase; }
.simg__price { margin-top: auto; padding-top: var(--pad-surface-s);
  animation-name: fade-in; animation-duration: var(--motion-sys-duration-slow);
  animation-timing-function: var(--motion-sys-ease-decelerate); animation-fill-mode: both; }

/* ── GiftSkuCard ───────────────────────────────────────────────────────────── */
.gift { align-items: center; text-align: center; }
.gift__media { position: relative; display: grid; place-items: center; padding: var(--pad-surface-s) 0; width: 100%; }
.gift__tag { position: absolute; top: 0; left: 0; }
.gift__title { color: var(--text-header-default); font-size: 16px; text-transform: uppercase; }
.gift__cta { color: var(--text-hyperlink-default); margin-top: auto; padding-top: var(--pad-surface-s); }

/* ── HeroSkuCard ───────────────────────────────────────────────────────────── */
.hero { min-height: 150px; padding: 0; justify-content: flex-end; }
.hero__art { position: absolute; inset: 0; z-index: 0; border-radius: inherit;
  background: linear-gradient(120deg, oklch(0.4 0.13 280), oklch(0.2 0.06 270) 70%),
              radial-gradient(circle at 80% 20%, oklch(0.8 0.16 320 / 0.6), transparent 50%); }
.hero__body { position: relative; z-index: 1; display: flex; align-items: flex-end; justify-content: space-between;
  gap: var(--gap-content-default); padding: var(--pad-surface-l) var(--pad-surface-m) var(--pad-surface-m);
  background: linear-gradient(to top, oklch(0.1 0 0 / 0.85), transparent); border-radius: inherit; }
.hero__eyebrow { color: var(--text-hyperlink-default); }
.hero__title { color: var(--text-header-default); text-transform: uppercase; }
.chips { display: flex; gap: 4px; margin-top: 4px; }
.chip { font-size: 9px; padding: 2px 8px; border-radius: var(--radius-badge-full);
  border: 1px solid oklch(1 0 0 / 0.25); color: var(--text-body-default); text-transform: uppercase; }
.hero__price { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }

/* ── BestSellerCard ────────────────────────────────────────────────────────── */
.best { padding: 0; background: var(--gradient-bestseller-hero); border-top: 1px solid var(--border-warm); border-left: 1px solid var(--border-warm); }
.best__img { display: grid; place-items: center; padding: var(--pad-surface-s) 0; }
.best__info { display: flex; align-items: center; justify-content: space-between; gap: var(--gap-content-default);
  padding: var(--pad-surface-s) var(--pad-surface-s) var(--pad-surface-l); background: var(--gradient-bestseller-vignette); }
.best__col { display: flex; flex-direction: column; }
.best__amount { color: var(--text-header-default); text-transform: uppercase; }
.best__bonus { font-size: 12px; }
.best__price { display: flex; flex-direction: column; align-items: flex-end; }

/* ── BundleSkuCard ─────────────────────────────────────────────────────────── */
.bundle { padding: 0; animation-name: bundle-enter; }
.bundle__banner { height: 96px; border-radius: var(--radius-container-xs);
  background: linear-gradient(100deg, oklch(0.45 0.12 30), oklch(0.25 0.08 20)); }
.bundle__breakdown { position: relative; z-index: 1; display: flex; gap: var(--gap-content-narrow);
  padding: 0 var(--pad-surface-s); margin-top: -20px; }
.bitem { position: relative; display: grid; place-items: center; padding: var(--pad-surface-xs);
  border-radius: var(--radius-container-xs); background: var(--rarity-gradient-neutral); }
.bitem::before { content: ''; position: absolute; inset: 0; border-radius: inherit;
  padding: var(--border-weight-default); background: var(--border-sku-card-default);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude; -webkit-mask-composite: destination-out; pointer-events: none; }
.bundle__info { display: flex; align-items: center; gap: var(--gap-content-default);
  padding: var(--pad-surface-m) var(--pad-surface-s) var(--pad-surface-l); }
.bundle__title-group { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.bundle__title { color: var(--text-header-default); text-transform: uppercase; font-size: 15px; }
.bundle__price { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; }

/* control widgets */
.ctl { padding: 6px 14px; border-radius: 6px; border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-1); color: #111; font-weight: 600; font-size: 12px; cursor: pointer; }
.ctl-check { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; }
</style>
