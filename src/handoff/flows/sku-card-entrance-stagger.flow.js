/**
 * sku-card-entrance-stagger — the mount/loading cascade shared by every
 * SKU-shaped card (SkuCard, SkuImageCard, BestSellerCard, BundleSkuCard,
 * GiftSkuCard, HeroSkuCard): a section-level base delay (top-to-bottom
 * cascade, hand-tuned literals in App.vue) plus a per-card index stagger
 * (either an `animDelay` prop on SkuCard/SkuImageCard, or folded directly
 * into `baseDelay` by the caller for every other family), summed into one
 * `animation-delay`. Two verified quirks carried forward, NOT to be "fixed":
 * the badge pop always plays at delay 0 regardless of the card's own
 * stagger, and only SkuCard/SkuImageCard get a secondary +350ms price-reveal
 * delay after the card itself has settled.
 *
 * Re-traced 2026-09-12 against current src/ (superseding the retired
 * docs/Handoff/sku-card-entrance-stagger/README.md, which this flow is a
 * lossless migration of, structurally unchanged from prototype v0.49.2):
 * DELAY_STORY..DELAY_CP_IMG constants (App.vue:846-855), SkuCard.vue's
 * cardStyle/priceStyle computeds (~L107-109), the badge's animation-delay-
 * free `.sku-card__badge { animation-name: pop; ... }` rule (~L331-332), and
 * BundleSkuCard's `bundle-enter` keyframe's deliberate transform-omission in
 * `to` (~L438-444) all still match verbatim — zero drift found.
 *
 * Traced from: src/App.vue:846-855 (section delay constants), src/components/
 * SkuCard.vue (~L44,107-109,138-139,331-332), src/components/SkuImageCard.vue,
 * src/components/BundleSkuCard.vue (~L438-444), src/components/GiftSkuCard.vue,
 * src/components/HeroSkuCard.vue, src/components/BestSellerCard.vue,
 * src/components/BestSellerCarousel.vue, src/components/CategoryCatalog.vue,
 * src/tokens/keyframes.css (sku-enter, L38-41).
 *
 * Out of scope: BestSellerCard's perpetual running-border/shimmer/bloom
 * effects (independent loops, unrelated to this mount cascade) and the full
 * per-card content model — both still only live as prose in the archived
 * docs/Handoff/.archive/{bestseller-card-effects,sku-cards}/ sites; neither
 * has a flow yet.
 */
import { defineFlow } from '../flow.js'

export default defineFlow({
  slug: 'sku-card-entrance-stagger',
  title: 'SKU Card Family — Staggered Entrance (Loading) Animation',
  summary: 'Two-axis mount cascade (section base delay + per-card index stagger) shared by every SKU-shaped card. Pure opacity/transform — no colour or typography axis.',
  stores: ['codm'],

  components: [
    {
      id: 'SkuCard / SkuImageCard',
      source: 'src/components/SkuCard.vue:44,107-109,138-139,331-332; src/components/SkuImageCard.vue:~93-96,232-238,497-501',
      notes: 'The only two families with an `animDelay` prop and a secondary `priceStyle` computed (`baseDelay + animDelay + 350ms`) — the price block fades in on its own clock, 350ms (one full entrance duration) after the card itself settles, so the price never competes visually with the card\'s own rise. Badge pop (`tagLabel || isBestValue`) has NO animation-delay at all — every badge in a staggered grid pops at the same instant, independent of its card\'s stagger position. Verified, not assumed: no static value or `:style` binding sets a delay on `.sku-card__badge` anywhere.',
      tokens: ['--x-motion-sys-duration-slow', '--x-motion-sys-ease-decelerate', '--x-motion-sys-ease-spring'],
    },
    {
      id: 'BundleSkuCard / GiftSkuCard',
      source: 'src/components/BundleSkuCard.vue:~59,219-222,382-388; src/components/GiftSkuCard.vue:~48,158-161,302-305',
      notes: 'No `animDelay` prop — the caller folds the per-card index step directly into `baseDelay` (`DELAY_BUNDLE + i*120`, `DELAY_GIFTS + i*120`). No secondary price-reveal delay — the whole card fades/rises as one animation. `bundle-enter`\'s `to` keyframe deliberately omits `transform` (unlike `sku-enter`\'s `translateY(0)`) — a documented fix so `fill-mode: both` doesn\'t pin a compositor layer that would block a child `backdrop-filter` from sampling the banner image beneath it. Do not "complete" this keyframe to match `sku-enter`.',
      tokens: ['--x-motion-sys-duration-slow', '--x-motion-sys-ease-decelerate'],
    },
    {
      id: 'HeroSkuCard',
      source: 'src/components/HeroSkuCard.vue:~55,143-146',
      notes: 'Uses the shared `sku-enter` keyframe (6px rise) like SkuCard, but — like Bundle/Gift — has no `animDelay` prop and no secondary price-reveal delay. `CategoryCatalog.vue` computes its full stagger (`baseDelay + si*80 + i*120`) and passes it as one `baseDelay`.',
      tokens: ['--x-motion-sys-duration-slow', '--x-motion-sys-ease-decelerate'],
    },
    {
      id: 'BestSellerCard / BestSellerCarousel',
      source: 'src/components/BestSellerCard.vue:~78,295-298; src/components/BestSellerCarousel.vue:~132',
      notes: 'Takes only `baseDelay` (no `animDelay` prop), shared `sku-enter` keyframe. As a single hero instance: one section-level delay (`DELAY_BESTSELLER`). In the carousel: `BestSellerCarousel.vue` mounts multiple instances and pre-sums each one\'s stagger itself (`baseDelay + i*90`) — the SAME 90ms step as SkuCard/SkuImageCard, despite BestSellerCard having no `animDelay` prop of its own to receive it. Perpetual running-border/shimmer/bloom effects on this component are a SEPARATE, independent loop — out of scope for this flow.',
      tokens: ['--x-motion-sys-duration-slow', '--x-motion-sys-ease-decelerate'],
    },
  ],

  states: [
    { id: 'pre_delay', desc: 'Card fully transparent, offset by its family\'s entrance translate (6px for sku-enter, 12px for bundle-enter/gift-enter) — held by animation-fill-mode: both reading the keyframe\'s `from`.', entry: 'Component mounts', exit: 'animation-delay (baseDelay [+ animDelay]) elapses' },
    { id: 'entering', desc: 'Card fades in and rises/settles to its resting position.', entry: 'Delay elapses', exit: '--x-motion-sys-duration-slow (350ms) completes' },
    { id: 'settled', desc: 'Fully opaque, transform at rest; fill-mode: both holds this indefinitely, no cleanup needed.', entry: 'Entrance animation completes', exit: 'Component unmounts, or hosting subtree remounts (category_replay)' },
    { id: 'price_reveal', desc: 'SkuCard/SkuImageCard ONLY — a parallel state of the price block, not the card root. Price fades in (opacity only, no transform) after the card has already settled.', entry: 'baseDelay + animDelay + 350ms elapses', exit: 'fade-in animation completes' },
    { id: 'category_replay', desc: 'HeroSkuCard/BundleSkuCard hosted inside CategoryCatalog only. The entire :key="category.id" subtree unmounts and remounts, so every hosted card\'s animation-delay restarts from baseDelay + si*80 + i*120 and replays from pre_delay.', entry: 'User switches category', exit: 'New category\'s subtree finishes mounting' },
  ],

  transitions: [
    { from: 'pre_delay', to: 'entering', trigger: 'animation-delay elapses (browser-timed, not JS)', motion: ['--x-motion-sys-duration-slow', '--x-motion-sys-ease-decelerate'] },
    { from: 'entering', to: 'settled', trigger: 'animation duration completes' },
    { from: 'settled', to: 'pre_delay', trigger: 'Hosting subtree remounts (category_replay, or any parent re-keying the card) — Vue destroys/recreates the DOM node, resetting all CSS animation state' },
    { from: 'pre_delay', to: 'price_reveal', trigger: 'Same mechanism, offset +350ms later, SkuCard/SkuImageCard only', motion: ['--x-motion-sys-duration-slow', '--x-motion-sys-ease-decelerate'] },
  ],

  choreography: [
    { beat: 'Section constants defined (hardcoded top-to-bottom mount order in App.vue:846-855)', delayMs: 0, duration: '', easing: '', target: 'DELAY_STORY=100 · DELAY_ACCOUNT=180 · DELAY_BESTSELLER=250 · DELAY_BS_CAROUSEL=450 · DELAY_BUNDLE=550 · DELAY_GIFTS=620 · DELAY_PROMO=720 · DELAY_CP=950 · DELAY_CP_IMG_NEW=1050 · DELAY_CP_IMG=1150' },
    { beat: 'Card i\'s entrance plays (opacity 0→1, translateY→0)', delayMs: 0, duration: '--x-motion-sys-duration-slow', easing: '--x-motion-sys-ease-decelerate', target: 'baseDelay + animDelay (relative)' },
    { beat: 'Price block fades in independently (SkuCard/SkuImageCard only)', delayMs: 350, duration: '--x-motion-sys-duration-slow', easing: '--x-motion-sys-ease-decelerate', target: 'baseDelay + animDelay + 350 (relative) — always exactly one entrance-duration after the card\'s own delay' },
    { beat: 'Badge pop plays — NO delay applied, always t=0 regardless of the card\'s own stagger', delayMs: 0, duration: '--x-motion-sys-duration-slow', easing: '--x-motion-sys-ease-spring', target: 'SkuCard / SkuImageCard / GiftSkuCard badge, when tagLabel present' },
  ],

  flowChart: `flowchart TD
    mount["Section mounts"] --> sectionDelay["Section base delay elapses\\n(hand-tuned literal, App.vue:846-855)"]
    sectionDelay --> indexStagger["Per-card index stagger added\\n(animDelay prop, or pre-summed by caller)"]
    indexStagger --> entrance["Card entrance plays: opacity+rise\\n(350ms, decelerate)"]
    entrance --> priceGate{"SkuCard / SkuImageCard?"}
    priceGate -- yes --> priceReveal["+350ms: price block fades in\\n(independent clock)"]
    priceGate -- no --> settled["Card fully settled, no secondary reveal"]
    mount --> badgeGate{"tagLabel present?"}
    badgeGate -- yes --> badgePop["Badge pops at t=0\\n(ignores stagger entirely)"]`,

  stateChart: `stateDiagram-v2
    [*] --> pre_delay
    pre_delay --> entering: animation-delay elapses
    entering --> settled: 350ms completes
    settled --> pre_delay: hosting subtree remounts (category_replay)
    pre_delay --> price_reveal: +350ms (SkuCard/SkuImageCard only)`,

  notes: {
    rationale: 'Migrated from the hand-written docs/Handoff/sku-card-entrance-stagger/ (re-traced 2026-09-12, zero drift found against v0.49.2\'s documented state — see file header). Pure opacity/transform entrance shared by 6 component families with 2 verified, deliberate quirks (badge ignores stagger; only 2 of 6 families get a secondary price-reveal delay) that must be carried forward, not "corrected" during a rebuild.',
    gotchas: [
      'The badge\'s zero-delay pop is verified from source (no animation-delay set anywhere on .sku-card__badge), not an assumption — do not stagger it when rebuilding unless a reviewer confirms it should change (see openQuestions).',
      'Price-reveal offset (+350ms) exists ONLY on SkuCard/SkuImageCard. Do not add it to BundleSkuCard/GiftSkuCard/HeroSkuCard — they fade their price in as part of the single card-level entrance.',
      'bundle-enter\'s `to` keyframe deliberately omits `transform: translateY(0)` — a fix for a backdrop-filter compositing bug where fill-mode:both would otherwise pin a GPU compositor layer that blocks a child element\'s backdrop-filter sampling. Preserve this asymmetry with sku-enter; do not "complete" it.',
      'Two DIFFERENT per-card index stagger steps exist for different families: 90ms (SkuCard/SkuImageCard/BestSellerCard-in-carousel) vs 120ms (Bundle/Gift/Hero within CategoryCatalog) — carry both distinctly, never unify into one constant.',
      'The 10 section-level DELAY_* constants (App.vue:846-855) are hand-tuned literals with no formula or token backing — carry the values, not a derived pattern.',
      'Category switch (CategoryCatalog\'s :key="category.id" remount) replays the FULL cascade from scratch for every hosted card — never resume mid-animation or skip straight to settled.',
      'prefers-reduced-motion is NOT handled anywhere in this feature (no @media override on sku-enter/bundle-enter/gift-enter/fade-in/pop) — a real, verified gap, not an oversight to silently fix.',
    ],
    openQuestions: [
      'Is the badge\'s zero-delay pop (ignoring the card\'s own stagger) intentional, or an oversight where the delay was never wired up? No blocking impact — carry as-is until a reviewer weighs in.',
      'Is the 90ms/120ms split between families\' per-index stagger intentional (different pacing for different content densities), given a --motion-sku-stagger token exists at 50ms and neither family consumes it? No blocking impact — carry both distinct hardcoded values.',
      'Are the ten hand-tuned DELAY_* section constants still accurate to the current section order, or have sections been reordered/added since they were last tuned? Maintainability note, not a spec ambiguity — carry current values.',
    ],
    buildOrder: [
      'Shared entrance mechanism (opacity + rise), parameterized by delay and rise distance — every family shares duration/easing, differs only in rise distance (6px vs 12px) and whether the rest state keeps a transform value.',
      'Two-axis delay composition — section offset (one module, never inline-recomputed) + per-card index step, keeping the 90ms and 120ms steps distinct.',
      'Price-reveal secondary delay, SkuCard/SkuImageCard only — fade the price block in 350ms after the card\'s own delay, never on Bundle/Gift/Hero.',
      'Badge pop with zero delay, independent of the card\'s own stagger position.',
    ],
    prohibitions: [
      'Never stagger the badge pop to match its card\'s own delay.',
      'Never add a secondary price-reveal delay to BundleSkuCard/GiftSkuCard/HeroSkuCard.',
      'Never "complete" bundle-enter\'s to keyframe with a transform value that matches sku-enter\'s.',
      'Never unify the 90ms and 120ms per-card stagger steps into one constant.',
      'Never add a prefers-reduced-motion override that doesn\'t exist in the reference without first flagging it to a reviewer as a deliberate improvement, not a silent fix.',
    ],
  },
})
