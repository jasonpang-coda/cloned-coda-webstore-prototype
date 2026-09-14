/**
 * download-banner — the site-wide "get the app" banner (App.vue's
 * `#download-banner` section): heading/body pair, optional PWA-install CTA
 * row, optional App Store / Google Play badges — all in one bordered box.
 * No standalone component exists; this is an inline App.vue template block
 * plus a second inline block for the badges-above-value-props placement.
 * Render-time-only feature — no choreography, decided once from
 * strings/config/asset inputs, nothing sequences after mount except the two
 * hover treatments.
 *
 * Re-traced 2026-09-12 against current src/ (superseding the retired
 * docs/Handoff/download-banner/README.md, dated 2026-09-07 / v0.103.0).
 * REAL DRIFT FOUND during re-trace, not present in the legacy doc: the
 * section's own v-if gate is now `strings.page.download && !webPushSubscribed`
 * (App.vue ~L2280), not just `strings.page.download` — the whole banner is
 * suppressed once the visitor is subscribed to web push (`useWebPush()`),
 * with no comment explaining the rationale. Added as banner_absent_subscribed
 * below and flagged as an open question rather than inferred.
 *
 * Traced from: src/App.vue:2174-2333 (section + both badge mount points),
 * src/App.vue:122,131 (webPushSubscribed/pwaInstalled sourcing),
 * src/composables/usePwaInstall.js, src/composables/useWebPush.js.
 *
 * Sibling: docs/Handoff/pwa-web-push/spec.md owns the PWA-install CTA's own
 * state machine (install_eligible_*, install_installed) once tapped — this
 * flow's pwa_row_visible/pwa_row_hidden states only cover whether the row
 * APPEARS, never what happens after the tap. Do not re-derive that machine
 * here; see `targets`/notes.rationale below for how the two stay in sync.
 */
import { defineFlow } from '../flow.js'

export default defineFlow({
  slug: 'download-banner',
  title: 'Download Banner — App Store / Google Play / PWA Install',
  summary: 'Site-wide "get the app" banner: heading/body, optional PWA-install CTA row, optional store badges — one bordered box, no standalone component.',
  stores: ['codm'],

  components: [
    {
      id: 'DownloadBanner (inline App.vue block)',
      source: 'src/App.vue:2280-2333',
      notes: 'No standalone .vue component — a real, isolated DownloadBanner component is the right call for a rebuild (this doc\'s prototype-vs-target note), but nothing here requires mirroring the "inline in the page template" structure. Box background is a per-store scrim gradient (derived from --x-bg-page, see notes.gotchas) over an optional background photo, so heading/body/badges stay legible over any art.',
      tokens: [
        '--x-text-header-default', '--x-text-body-default', '--x-text-hyperlink-default', '--x-text-on-primary',
        '--x-bg-action-primary', '--x-border-card-default', '--x-fx-ripple-color-dark',
        '--x-pad-surface-xl', '--x-pad-surface-l', '--x-gap-content-default', '--x-gap-content-tight',
        '--x-gap-content-loose', '--x-gap-content-narrow', '--x-gap-content-separation', '--x-gap-control-m',
        '--x-radius-container-l', '--x-radius-control-full', '--x-size-control-m', '--border-weight-default',
        '--x-download-banner-border', '--x-gradient-download-banner-scrim', '--x-material-metal-gloss-shimmer-core',
        '--x-motion-sku-hover',
      ],
    },
    {
      id: 'Badges (banner-mounted)',
      source: 'src/App.vue:2929-2942 (banner mount point)',
      notes: 'One badges partial, two mount points (here, and the SEO value-prop block below) — same classes, same v-if guard on the labels, never a second implementation. Each badge (App Store / Google Play) independently falls back to a text pill when its asset is absent.',
      tokens: ['--x-text-hyperlink-default', '--x-bg-action-primary', '--x-border-card-default', '--x-fx-ripple-color-dark', '--x-radius-control-full', '--x-size-control-m', '--border-weight-default', '--x-motion-sku-hover'],
    },
    {
      id: 'Badges (SEO-value-prop-mounted)',
      source: 'src/App.vue:2229-2261',
      notes: 'Structurally identical markup to the banner-mounted badges (same classes, same v-if on the labels) — mounted inside the SEO value-prop section instead, gated on config.content.badgesAboveValueProps. This block\'s v-if is nested inside the SEO section\'s own v-if="strings.page.seo" guard — a store enabling badgesAboveValueProps without SEO copy gets no badges anywhere (see notes.gotchas).',
      tokens: ['--x-text-hyperlink-default', '--x-bg-action-primary', '--x-border-card-default', '--x-radius-control-full', '--x-size-control-m'],
    },
    {
      id: 'PWA install CTA row',
      source: 'src/App.vue:2302-2308',
      notes: 'Visibility only — the CTA\'s own click behaviour and install state machine are FULLY OWNED by pwa-web-push.flow.js; this flow never re-derives promptInstall/shouldOfferIos/IosInstallSheet logic. Uses fx-shimmer fx-shimmer--metal-gloss (material-fx skill) with --x-material-metal-gloss-shimmer-core set to --x-bg-action-primary, making it the visually dominant action in the banner — deliberately outranking the plain badge pills below it.',
      tokens: ['--x-text-on-primary', '--x-bg-action-primary', '--x-fx-ripple-color-dark', '--x-gap-content-loose', '--x-gap-content-narrow', '--x-gap-control-m', '--x-radius-control-full', '--x-size-control-m', '--x-motion-sku-hover', '--x-material-metal-gloss-shimmer-core'],
    },
  ],

  states: [
    { id: 'banner_absent', desc: '#download-banner section does not render at all — no DOM, not just hidden.', entry: 'strings.page.download is falsy', exit: 'store adds page.download copy' },
    { id: 'banner_absent_subscribed', desc: 'Section does not render even though strings.page.download IS present. NOT documented in the prior hand-written spec — found during this flow\'s re-trace.', entry: 'webPushSubscribed (useWebPush()) is true', exit: 'user unsubscribes from web push' },
    { id: 'banner_default', desc: 'Box background = --x-gradient-download-banner-scrim over optional background image, no visible border.', entry: 'strings.page.download present, !webPushSubscribed, --x-download-banner-border unset for the theme', exit: 'never (base state, combines with all below)' },
    { id: 'banner_bordered', desc: '1px solid hairline border around the box, colour = theme\'s --x-border-card-default.', entry: 'theme defines --x-download-banner-border (CODM, ZZZ today)', exit: 'theme removes the override' },
    { id: 'bg_image_present', desc: 'Banner background shows the art (cover, centred) under the scrim gradient.', entry: 'storeAssets.content.downloadBannerBg supplies an asset', exit: 'asset removed' },
    { id: 'bg_image_absent', desc: 'Banner shows only the flat scrim gradient, no photo.', entry: 'no downloadBannerBg asset', exit: 'asset added' },
    { id: 'badges_in_banner', desc: 'Badges row renders inside .download-banner__copy, directly under the PWA row / body.', entry: '!config.content?.badgesAboveValueProps AND (appStoreLabel or googlePlayLabel present)', exit: 'flag flips true' },
    { id: 'badges_above_value_props', desc: 'Badges row renders in the SEO value-prop section instead, right after the benefit grid; the banner box itself has NO badges row in this state.', entry: 'config.content?.badgesAboveValueProps true AND (appStoreLabel or googlePlayLabel present)', exit: 'flag flips false' },
    { id: 'badges_absent', desc: 'No badges row renders in EITHER placement — both v-if guards share this same OR condition.', entry: 'neither appStoreLabel nor googlePlayLabel present', exit: 'either label added' },
    { id: 'badge_image', desc: 'Badge renders as an <img> at --x-size-control-m height, width: auto. Per-badge, independent for App Store vs Google Play.', entry: 'storeAssets.content.appStoreBadge / googlePlayBadge supplies an asset', exit: 'asset removed' },
    { id: 'badge_text_pill', desc: 'Badge renders as a bordered pill (<span>) with the label text.', entry: 'corresponding badge asset absent', exit: 'asset added' },
    { id: 'pwa_row_visible', desc: 'PWA install CTA row renders above the badges, inside .download-banner__copy. See pwa-web-push.flow.js for what happens after tap.', entry: 'strings.page.pwaInstall present AND !pwaInstalled', exit: 'pwaInstalled flips true, or the copy is removed' },
    { id: 'pwa_row_hidden', desc: 'Row does not render; badges (if any) sit directly under the body text instead.', entry: 'no pwaInstall copy, or pwaInstalled already true', exit: '—' },
  ],

  transitions: [
    { from: 'badge_image', to: 'badge_image', trigger: 'pointer over, pointer-fine (hover)', motion: ['--x-motion-sku-hover'] },
    { from: 'badge_text_pill', to: 'badge_text_pill', trigger: 'pointer over, pointer-fine (hover)', motion: ['--x-motion-sku-hover'] },
    { from: 'pwa_row_visible', to: 'pwa_row_visible', trigger: 'pointer over, pointer-fine (hover) — filter: brightness(1.05)', motion: ['--x-motion-sku-hover'] },
    { from: 'banner_absent_subscribed', to: 'banner_default', trigger: 'user unsubscribes from web push (webPushSubscribed flips false) — instant re-render, no transition' },
  ],

  choreography: [],

  flowChart: `flowchart TD
    present{"strings.page.download present?"}
    present -- no --> absent["banner_absent — section not rendered"]
    present -- yes --> subGate{"webPushSubscribed?"}
    subGate -- yes --> absentSub["banner_absent_subscribed — section not rendered\\n(undocumented pre-existing gate, found on re-trace)"]
    subGate -- no --> order{"config.content.downloadBannerFirst?"}
    order -- yes --> posBetween["banner rendered BETWEEN value-prop and FAQ (COD:M)"]
    order -- no --> posAfter["banner rendered AFTER value-prop + FAQ (default)"]
    posBetween --> badgePlacement
    posAfter --> badgePlacement
    badgePlacement{"config.content.badgesAboveValueProps?"}
    badgePlacement -- yes --> badgesAbove["badges render in SEO value-prop block"]
    badgePlacement -- no --> badgesIn["badges render inside banner box"]
    badgesAbove --> pwaGate
    badgesIn --> pwaGate
    pwaGate{"pwaInstall copy present AND not installed?"}
    pwaGate -- yes --> pwaRow["PWA install CTA row renders — see pwa-web-push flow"]
    pwaGate -- no --> noPwaRow["no PWA row"]`,

  stateChart: `stateDiagram-v2
    [*] --> banner_absent
    banner_absent --> banner_default: page.download copy added, not web-push subscribed
    banner_absent --> banner_absent_subscribed: page.download present but webPushSubscribed true
    banner_absent_subscribed --> banner_default: user unsubscribes from web push
    banner_default --> banner_bordered: theme sets --x-download-banner-border
    banner_default --> badges_in_banner: badgesAboveValueProps false + label present
    banner_default --> badges_above_value_props: badgesAboveValueProps true + label present
    banner_default --> badges_absent: no badge labels
    badges_in_banner --> badge_image: badge asset present
    badges_in_banner --> badge_text_pill: badge asset absent
    banner_default --> pwa_row_visible: pwaInstall copy present + not installed
    banner_default --> pwa_row_hidden: no pwaInstall copy, or already installed`,

  targets: {},
  contract: [],
  prototypeOnly: [],

  notes: {
    rationale: 'Migrated from the hand-written docs/Handoff/download-banner/ (re-traced 2026-09-12). Pure render-time content/config feature, no choreography. The PWA-install CTA row is a visibility gate only — its own state machine is fully owned by pwa-web-push.flow.js; wire the CTA\'s click behaviour from that flow\'s build order, never re-derive it here.',
    gotchas: [
      'REAL DRIFT vs. the retired hand-written spec: the section\'s own v-if now also gates on !webPushSubscribed (App.vue ~L2280) — a visitor already subscribed to web push never sees this banner at all, even with page.download content present. No source comment explains the rationale; carried forward as banner_absent_subscribed pending a reviewer\'s call (see openQuestions).',
      'The badges row\'s top margin is a DERIVED value: --x-gap-content-separation (16px) minus the parent\'s own flex gap (--x-gap-content-default, 8px already applied) — the combined space above the badges lands at 16px total, not 16px stacked on an existing 8px (24px). Don\'t port either literal without checking what gap it stacks on top of.',
      'badgesAboveValueProps true but strings.page.seo absent: the badges-above block lives inside the SEO section\'s own v-if="strings.page.seo" guard, so a store setting the flag without SEO copy gets no badges anywhere — not in the banner either, since the flag suppressed that placement.',
      '--x-gradient-download-banner-scrim is store-specific by construction (colour-mix derived from that store\'s own --x-bg-page) — map it as "page-background-tinted scrim over the banner art," never as a literal colour to copy per-store.',
      'The PWA CTA is deliberately the visually dominant action (solid shimmer pill) over the plain badge pills below it — preserve that hierarchy: install-CTA first, app-store badges secondary.',
      'No custom :focus-visible treatment exists anywhere in this feature (badges or PWA CTA) — browser default outline applies. A real, verified gap, not an intentional "keep it invisible" choice.',
      'No broken-image fallback exists for appStoreBadge/googlePlayBadge assets (no @error handler) — a broken URL renders a broken-image icon, not the text pill.',
    ],
    openQuestions: [
      'Why does webPushSubscribed suppress the ENTIRE banner (not just the PWA row)? No source comment explains this. Is the assumption "once subscribed to push, the download-banner\'s job is redundant," or is this an unrelated interaction that happens to share a condition? Non-blocking — carry the gate forward as observed until a reviewer confirms the intent.',
      'If badgesAboveValueProps is true but strings.page.seo is absent, badges render nowhere. Acceptable configuration constraint (a store must supply both or neither), or should a rebuild decouple the two? Non-blocking.',
      'No :focus-visible styling exists for badges or the PWA CTA — intentional silence, or a gap to close in a rebuild? Non-blocking.',
    ],
    buildOrder: [
      'Static banner structure & content-gated rendering (banner_absent, banner_absent_subscribed, banner_default, bg_image_present/absent) — render nothing when content is absent OR the visitor is web-push subscribed.',
      'Badge rendering & placement variant (badges_in_banner, badges_above_value_props, badges_absent, badge_image, badge_text_pill) — one badges component, two mount points, per-badge independent fallback.',
      'PWA install CTA row (pwa_row_visible, pwa_row_hidden) — visibility gate only; wire click behaviour and the install state machine entirely from pwa-web-push.flow.js\'s own build order.',
      'Section ordering variant (downloadBannerFirst) — support both mount positions from one config flag, no markup duplication.',
    ],
    prohibitions: [
      'Never copy App.vue wholesale or mirror "inline template block" as the target architecture — build a real, isolated component.',
      'Never re-derive a second PWA-install state machine here — pwa-web-push.flow.js is the sole authority once the CTA is tapped.',
      'Never duplicate the badges markup/logic between the two mount points — one component, two mount points.',
      'Never substitute a visually-similar token for a missing semantic role — add the role.',
    ],
  },
})
