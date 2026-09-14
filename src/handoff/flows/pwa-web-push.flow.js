/**
 * pwa-web-push — PWA install (Android/Chromium native prompt + iOS instruction sheet)
 * and the post-install Web Push opt-in, across their five install surfaces and four
 * general-purpose push surfaces (down from five — the NavBar bell touchpoint was added
 * then fully removed once the other surfaces covered the same ground; see gotchas).
 * A fifth, task-gated push entry point now also exists — TaskGiftSheet's own footer
 * button — but that belongs to a separate reward-gift flow layered on top of this one;
 * it's cross-referenced in the gotchas below, not modelled as a sixth surface here.
 * This is the first flow authored with `targets`/`contract`/`prototypeOnly` (see
 * flow.js) because it's also the first flow whose production counterpart already
 * exists component-for-component: install → components/pwa/InstallPrompt.client.vue,
 * push → components/shared/modals/WebPushConsent.vue, toggle →
 * components/ui/Toggle.vue, in codapayments-codashop-client. This is a "modify
 * existing", not a "build new" handoff.
 *
 * Traced from: src/composables/usePwaInstall.js, src/composables/useWebPush.js,
 * src/components/ToggleSwitch.vue, src/components/IosInstallSheet.vue, src/App.vue,
 * src/components/NavDrawer.vue, src/components/OrderCompletePage.vue,
 * src/components/PlayerAccount.vue, src/composables/useFeatureFlags.js,
 * src/composables/useCloseAllOverlays.js, src/composables/useScrollReset.js. NavBar.vue
 * is deliberately absent from this list now — it was traced, gained a bell touchpoint,
 * then had it fully removed again within the same release (see gotchas).
 */
// STALE (2026-09-11): IosInstallSheet.vue was retired — every install/push
// touchpoint (drawer, download banner, gifts banner, story slide, gift card,
// Order Complete banner, the removed PlayerAccount link) now opens
// TaskGiftSheet.vue, THE merged install/notify sheet, whose `variant`
// ('ios' | 'webview' | 'android' — usePwaInstall.js) branches per-platform
// content instead of a single iOS-only standalone sheet. This file's import
// is patched just enough to keep building; its states/targets/gotchas below
// still describe the old five-surface/IosInstallSheet model and need a full
// re-trace (see web-store-spec-handoff) before it's trustworthy again.
import { defineFlow } from '../flow.js'
import ToggleSwitch from '../../components/ToggleSwitch.vue'
import TaskGiftSheet from '../../components/TaskGiftSheet.vue'

export default defineFlow({
  slug: 'pwa-web-push',
  title: 'PWA Install + Web Push',
  summary: 'Install-to-home-screen (Android native prompt / iOS instruction sheet) and the post-install web-push opt-in, across 5 install surfaces and 4 general push surfaces (Gifts banner, story slide, Order Complete bar, nav drawer) — a task-gated 5th entry point (TaskGiftSheet) belongs to a separate reward-gift flow.',

  components: [
    {
      id: 'ToggleSwitch',
      component: ToggleSwitch,
      props: { modelValue: false, ariaLabel: 'Enable web push' },
      source: 'src/components/ToggleSwitch.vue',
      notes: 'Fully controlled switch. Every call site ignores the emitted value and calls toggleWebPush() instead — visual state is driven purely by the shared useWebPush().subscribed ref, not by v-model round-tripping.',
      tokens: [
        '--x-size-control-xs', '--x-pad-surface-xxs', '--x-radius-badge-full',
        '--border-weight-default', '--x-surface-ghost-4', '--x-surface-ghost-2',
        '--x-bg-control-active', '--x-border-control-active', '--x-size-icon-m',
        '--x-bg-action-neutral', '--x-shadow-story-card', '--x-motion-toggle',
        '--x-motion-control-press-scale',
      ],
    },
    {
      id: 'TaskGiftSheet',
      component: TaskGiftSheet,
      props: { isMobile: true },
      source: 'src/components/TaskGiftSheet.vue',
      notes: 'STALE — see the file-level note above. This is now THE merged install/notify sheet: a SKU-reward banner + a `step`/`variant`-driven body (checklist for ios/webview, plain requirement copy for android) + an inline steps detour (media + numbered <ol>), instead of a standalone always-iOS sheet. Registered in useCloseAllOverlays.js — a real overlay, not scaffolding.',
      tokens: [
        '--x-bg-sheet', '--x-text-header-default', '--x-text-hyperlink-default',
        '--x-pad-surface-l', '--x-pad-surface-m', '--x-gap-content-default',
      ],
    },
  ],

  // Every prototype component already has a production counterpart — this is a
  // "modify existing" handoff, which clears codashop-client's "no new .vue without
  // permission" rule (skills/figma-implement-design/SKILL.md) by construction.
  targets: {
    ToggleSwitch: {
      component: 'components/ui/Toggle.vue',
      styles: 'assets/css/sitebuilder/components/ui/Toggle.scss',
    },
    IosInstallSheet: {
      component: 'components/pwa/InstallPrompt.client.vue',
      styles: 'assets/css/sitebuilder/components/pwa/InstallPrompt.scss',
      i18nPrefix: 'pwaInstall',
    },
    // The push surfaces (App.vue's gifts banner + story slide, NavDrawer row,
    // Order Complete bar) have no 1:1 prototype component — they're inline template
    // blocks — but all four map onto ONE existing production surface. Listed under a
    // synthetic id so the exporter's file-map still has a row for "where does push UI
    // go". (NavBar once had a fifth push touchpoint here — a bell icon — added and
    // then fully removed within the same release; see gotchas.)
    WebPushSurfaces: {
      component: 'components/shared/modals/WebPushConsent.vue',
      styles: 'assets/css/sitebuilder/components/shared/modals/WebPushConsent.scss',
      i18nPrefix: 'webPushConsent',
    },
  },

  states: [
    { id: 'install_eligible_chromium', desc: 'beforeinstallprompt captured; CTA triggers the native install prompt.', entry: 'deferredPrompt set (usePwaInstall.js module-scope listener)', exit: 'promptInstall() resolves, or app is installed by another path' },
    { id: 'install_eligible_ios', desc: 'No native prompt exists on iOS; CTA opens IosInstallSheet instead.', entry: 'device is iPhone (or forceIosInstallSheet flag) and not yet standalone', exit: 'sheet closed ("Got it" or scrim/close) or app added to home screen' },
    { id: 'install_no_prompt_available', desc: 'Not iOS, no beforeinstallprompt fired yet (or fired-then-consumed) — CTA is visually identical but promptInstall() silently no-ops. Not modelled as a distinct visual state in the prototype today; the production rebuild MUST distinguish this from install_eligible_chromium via canPrompt, or ship the same dead-button bug (see prototypeOnly note).', entry: 'no deferred prompt captured and device is not iOS', exit: 'a beforeinstallprompt event fires' },
    { id: 'install_installed', desc: 'Every install CTA across all 5 surfaces hides; web-push CTAs become reachable.', entry: 'isStandalone() true OR the dev-only pwaInstalledState flag is "installed"', exit: 'never, within a session (no uninstall detection)' },
    { id: 'push_unsupported', desc: 'Notification API absent from the browser. No push UI should render (contract: isSupported).', entry: '!("Notification" in window)', exit: 'never (not a runtime-changeable condition)' },
    { id: 'push_default', desc: 'Toggle renders off; tapping it will trigger the one-shot permission prompt.', entry: 'Notification.permission === "default" and app installed', exit: 'user taps the toggle' },
    { id: 'push_granted_subscribed', desc: 'Toggle on. NO confirmation snackbar fires (removed on purpose — the browser\'s own permission prompt already told the user something happened; see gotchas) — a glow highlight still plays on the surface that changed, for 1800ms. The Gifts banner\'s toggle disappears entirely once this state is reached (nothing left to invite); the nav-drawer row is the only surface that still shows a toggle here, so the user has somewhere to turn it back off.', entry: 'Notification.requestPermission() resolves "granted" (or the dev-only simulateWebPushGranted flag is "on")', exit: 'permission is revoked externally (see push_permission_revoked_externally) — never revocable from in-app UI beyond the local opt-out (see contract)' },
    { id: 'push_denied', desc: 'No push UI anywhere states why nothing happened — no toggle-disabled styling, no hint text (a blockedHint string existed briefly and was deliberately deleted, not just left unwired; see gotchas). Permission is a terminal browser decision the page cannot re-prompt for.', entry: 'Notification.requestPermission() resolves "denied", or permission was already denied at page load', exit: 'never from in-app; only from the browser\'s own site-settings UI' },
    { id: 'push_permission_revoked_externally', desc: 'User changes the notification permission in the browser\'s own site-settings UI while the tab stays open. The prototype DOES detect this now (see contract\'s permission_changed_externally row) via the Permissions API\'s change event, and flips the in-store `subscribed` flag back off to match — this was an open gap in the previous handoff pass and is now closed.', entry: 'navigator.permissions.query({name:"notifications"}) PermissionStatus fires its onchange event with a non-"granted" value', exit: 'user re-grants via the browser\'s own UI (fires onchange again, but `subscribed` is NOT automatically re-enabled — only ever turned off by this listener, never on)' },
    { id: 'push_just_enabled', desc: 'Transient 1800ms window after subscribing, used to drive the glow-highlight animation on whichever surface the user interacted with.', entry: 'markSubscribed() called', exit: '1800ms timer elapses (JUST_ENABLED_DURATION)' },
  ],

  transitions: [
    { from: 'install_eligible_chromium', to: 'install_installed', trigger: 'promptInstall() → userChoice "accepted", or user installs via the browser\'s own UI', motion: [] },
    { from: 'install_eligible_ios', to: 'install_installed', trigger: 'user completes Share → Add to Home Screen outside the sheet\'s control (the sheet cannot detect this directly; isInstalled is re-evaluated on next isStandalone() check)' },
    { from: 'install_eligible_ios', to: 'install_eligible_ios', trigger: '"Got it" / scrim tap / close button — sheet dismisses, install state unchanged', motion: [] },
    { from: 'push_default', to: 'push_granted_subscribed', trigger: 'toggle tapped, requestPermission() → "granted" (or simulateWebPushGranted flag flipped "on" — no tap needed, previews instantly)', motion: ['--x-motion-toggle'] },
    { from: 'push_default', to: 'push_denied', trigger: 'toggle tapped, requestPermission() → "denied"', motion: [] },
    { from: 'push_granted_subscribed', to: 'push_just_enabled', trigger: 'markSubscribed() (same event as the grant)', motion: [] },
    { from: 'push_just_enabled', to: 'push_granted_subscribed', trigger: '1800ms timer elapses, glow fades out', motion: ['--x-motion-sys-ease-decelerate'] },
    { from: 'push_granted_subscribed', to: 'push_permission_revoked_externally', trigger: 'Permissions API onchange fires with a non-"granted" value while the tab is open', motion: [] },
  ],

  choreography: [
    { beat: 'Toggle flips on, thumb slides', delayMs: 0, duration: '--x-motion-toggle', easing: '--x-motion-sys-ease-decelerate', target: 'ToggleSwitch thumb' },
    { beat: 'Surface glow ramps to peak opacity — NO confirmation snackbar accompanies this (removed on purpose, see gotchas)', delayMs: 0, duration: '--x-motion-sys-duration-slowest', easing: '--x-motion-sys-ease-decelerate', target: 'gifts-banner__webpush-glow / nav-drawer__webpush-glow (2 near-duplicate blocks — was 3 before the Order Complete bar\'s own glow was removed, see gotchas)' },
    { beat: 'Glow fades out, justEnabled clears', delayMs: 1800, duration: '--x-motion-sys-duration-slowest', easing: '--x-motion-sys-ease-decelerate', target: 'same glow element' },
  ],

  flowChart: `flowchart LR
    trigger["Any of 5 install CTAs / 4 push CTAs"] --> installed{"pwaInstalled?"}
    installed -- no --> platform{"iOS?"}
    platform -- yes --> iosSheet["IosInstallSheet opens"]
    platform -- no --> nativePrompt["promptInstall() — native beforeinstallprompt"]
    installed -- yes --> pushGate{"strings.page.webPush present?"}
    pushGate -- yes --> pushToggle["ToggleSwitch tap -> enableWebPush()"]
    pushToggle --> permission{"Notification.requestPermission()"}
    permission -- granted --> subscribed["markSubscribed() -> glow only, no snackbar"]
    permission -- denied --> blocked["permission denied, terminal — no in-app messaging"]`,

  stateChart: `stateDiagram-v2
    [*] --> install_eligible_chromium
    [*] --> install_eligible_ios
    [*] --> install_no_prompt_available
    install_eligible_chromium --> install_installed: native prompt accepted
    install_eligible_ios --> install_installed: iOS Add to Home Screen (out of band)
    install_installed --> push_unsupported: Notification API absent
    install_installed --> push_default: Notification API present, permission default
    push_default --> push_granted_subscribed: requestPermission -> granted
    push_default --> push_denied: requestPermission -> denied
    push_granted_subscribed --> push_just_enabled: markSubscribed
    push_just_enabled --> push_granted_subscribed: 1800ms elapses
    push_granted_subscribed --> push_permission_revoked_externally: Permissions API onchange (out-of-band revoke)`,

  // The integration contract — what the UI needs FROM the platform. Deliberately
  // silent on HOW any of this is implemented (no VAPID key, no subscription endpoint
  // shape prescribed) — that's the production team's call.
  contract: [
    { id: 'permission_granted', trigger: 'Notification.requestPermission() resolves "granted"', outcome: 'Subscribe to push (however the production stack does it), persist the subscription, flip the toggle on, start the 1800ms glow. Do NOT add a confirmation snackbar/toast on top of this — the prototype deliberately removed one it briefly had; the browser\'s own permission-grant UI is treated as sufficient feedback on its own (see gotchas for the reasoning).' },
    { id: 'permission_denied', trigger: 'Notification.requestPermission() resolves "denied"', outcome: 'Toggle must render disabled/inert (--x-opacity per ToggleSwitch\'s existing :disabled styling) for the rest of the session. Never re-prompt from in-app — browsers hard-block a second requestPermission() call once denied. The prototype surfaces NOTHING for this state today (no disabled styling, no hint copy — a hint string existed briefly and was deliberately deleted); production should design this state fresh rather than treat prototype silence as the spec.', isError: true, tokens: [] },
    { id: 'permission_already_denied_on_load', trigger: 'Notification.permission === "denied" at mount', outcome: 'Same as permission_denied — render disabled immediately, no prompt available.', isError: true },
    { id: 'permission_changed_externally', trigger: 'User changes the notification permission in browser site settings while the tab is open', outcome: 'UI must reflect the new state without a reload. **The prototype now does this**: a module-level navigator.permissions.query({name:"notifications"}).onchange listener updates `permission` live and turns `subscribed` back off if the new value isn\'t "granted" — this closes a gap flagged as unimplemented in the previous handoff pass. Carry the same Permissions-API approach to production rather than re-deriving it; it only ever turns subscribed OFF on an external change, never back on (a re-grant still requires the user to interact with the toggle again).' },
    { id: 'subscribe_fails', trigger: 'Permission granted but the actual push-subscription call fails (network, expired VAPID key, browser quota)', outcome: 'Toggle must NOT show as on. Surface a retry path or an error state — undefined in the prototype (localStorage write always "succeeds"); this is a genuine gap the production team decides how to handle.', isError: true },
    { id: 'unsubscribe_requested', trigger: 'User turns the toggle off after having subscribed', outcome: 'Unsubscribe the actual push subscription (PushManager.getSubscription().then(s => s.unsubscribe())) in addition to flipping local state. The prototype\'s disable() only flips a boolean — nothing is actually subscribed, so there is nothing to unsubscribe. Production MUST NOT copy this no-op.', isError: false },
  ],

  prototypeOnly: [
    'simulateWebPushGranted feature flag (useFeatureFlags.js) — an enum (Off/On), not a boolean, specifically so it gets its own Variants-toolbar select the way pwaInstalledState does (a boolean flag only gets a command-palette control). It is now a DIRECT override on the exposed `subscribed` (subscribed = raw-persisted-value OR flag-is-"on"), mirroring pwaInstalledState\'s override of isInstalled exactly — flipping it in the toolbar previews "granted" everywhere instantly, no toggle tap required. It still also short-circuits enable() itself for surfaces that call it directly.',
    'pwaInstalledState feature flag — dev-only override of isInstalled, not a real install signal.',
    'forceIosInstallSheet feature flag and the raw device.value === "iphone" check coupling install-sheet eligibility to the prototype\'s device-frame overlay concept.',
    'useWebPush.js\'s `subscribed` is a localStorage boolean, not a real push subscription — no PushManager.subscribe(), no VAPID key, no subscription endpoint anywhere in the prototype.',
    'allowGiftUnclaim feature flag (boolean, debug-only) — belongs to the reward-gift flow layered on top of this one (TaskGiftSheet/useTaskGiftClaim), not to install/push itself; noted here only because it lives in the same FLAG_DEFS registry.',
    'src/sw.js\'s unbounded network-first cache with a single hardcoded version string ("webstore-shell-v1") and no push/notificationclick handlers.',
  ],

  notes: {
    rationale: 'Both features share one shape (an install-or-subscribe CTA repeated across 5 surfaces, gated by a shared composable singleton) and were built together, so they\'re handed off together. Every component already exists in production — see targets — making this a token/behaviour-reconciliation task, not new-component work.',
    gotchas: [
      'A confirmation snackbar on grant was built, then deliberately removed. It stacked a second "something happened" moment on top of the browser\'s own permission-grant UI — with the toggle animation and the glow already firing, that read as one moving part too many. Don\'t re-add one; `justEnabled` (the transient glow trigger) is treated as sufficient ambient confirmation on its own.',
      'The blocked/denied state shows NOTHING in the prototype — not even a hint. A `blockedHint` string and a snackbar for it existed for one release, then were deliberately deleted (not just left unwired) once the decision was made not to editorialize on top of the browser\'s own denial. Don\'t treat this prototype silence as an intentional production spec for that state either — the contract\'s `permission_denied` row is the actual requirement; the prototype just doesn\'t attempt it visually at all right now.',
      'Two near-identical glow CSS blocks remain (App.vue gifts banner / NavDrawer) — down from three; the Order Complete bar\'s own glow+icon wrapper was removed entirely (see the next gotcha) along with its near-duplicate block. Still worth consolidating into one shared implementation in production rather than porting the remaining duplication.',
      'Push toggles now hide themselves once already subscribed, on every surface EXCEPT the nav drawer. The Gifts-category banner\'s action slot renders nothing at all post-subscription (previously showed the toggle in both states); the Order Complete bar\'s toggle already only existed pre-subscription structurally (its parent step-state leaves "push" the moment subscribed flips true) and lost its icon+glow wrapper in the same pass, down to a bare toggle. The nav drawer is now the ONLY surface a user can find to turn push back off after granting it — this asymmetry (invite-only on 3 surfaces, manage-anywhere on 1) is deliberate, not an oversight; carry it forward rather than "fixing" it into symmetry.',
      'The NavBar bell touchpoint was added, then fully removed, within the same release that produced this handoff revision — grep the prototype\'s current NavBar.vue and you will find no push/install code there at all despite earlier trace notes (and an earlier revision of this very file) referencing it. Don\'t resurrect it from an older spec snapshot.',
      'JUST_ENABLED_DURATION = 1800 is a hand-typed JS constant duplicating --x-motion-sys-duration-slowest\'s resolved value. The prototype has cssTimeToMs() (already imported in NavDrawer.vue) for exactly this and doesn\'t use it here — production should read the token, not retype the number.',
      'promptInstall() silently returns null when there is no deferred prompt (not iOS, beforeinstallprompt never fired) — the CTA renders anyway, making it a dead button. This is the install_no_prompt_available state; production should gate visibility/enablement on canPrompt instead of always showing the CTA.',
      'isStandalone() is a plain function invoked inside a computed with no reactive dependency, and there\'s no appinstalled listener updating isInstalled — a mid-session install doesn\'t flip the UI without an unrelated re-render.',
      'No dismissal, cooldown, or frequency cap on install CTAs — all 5 install surfaces are simultaneously and permanently visible pre-install. Intentional in the prototype (see usePwaInstall.js\'s own doc comment) but very unlikely to be what production wants shipped as-is; flagged as an open question below.',
      'A reward-gift flow (TaskGiftSheet/useTaskGiftClaim, new since the previous handoff pass) now also consumes useWebPush() directly — its own "Turn on notifications" footer button calls enable() the same way every toggle does. That flow gates a claimable reward on completing install + push together and is documented separately; it is NOT part of this handoff\'s scope, but it means useWebPush.js now has a consumer whose UI is a plain button, not a ToggleSwitch — the contract rows above still apply to it unchanged.',
      'The story-carousel\'s pre-install slide (one of the 5 install surfaces) sometimes points at the reward-gift flow above instead of triggering install directly — when the store\'s copy data includes a `giftTask` block (COD:M does), the slide\'s CTA opens TaskGiftSheet instead of calling promptInstall()/opening the iOS sheet. A store with pwaInstall copy but no giftTask block still gets the original direct-install slide unchanged.',
    ],
    openQuestions: [
      'No COD:M or FCM theme preset exists in codapayments-codashop-client\'s presets.scss (only "codashop" + generic named themes). Where should COD:M-specific token VALUES for this feature live given brand CSS is injected at runtime as a remote URL (storeConfig.style), not committed to the repo? Blocking for anyone trying to preview this under the COD:M brand in that codebase.',
      'Who owns the actual push-subscription backend (VAPID key issuance, subscription storage, send pipeline)? Neither repo has this today; the contract section above describes only the UI-facing states.',
      'Is the simultaneous 5-surface always-on install CTA pattern (no dismissal/cooldown) intentional for production, or should it inherit a frequency cap? Not specified anywhere the trace could find.',
      'Should the "invite-only on 3 surfaces, manage-anywhere on 1 (nav drawer)" toggle-visibility asymmetry (see gotchas) carry over to production as-is, or does production want a settings-style surface where push can always be managed regardless of which page the user is on?',
    ],
    buildOrder: [
      'T1 — Wire install eligibility correctly: canPrompt-gated Chromium CTA, iOS sheet, install_no_prompt_available handled as a real distinct state (hide or disable the CTA, don\'t leave it dead).',
      'T2 — Wire the push toggle to the real permission_granted / permission_denied / permission_already_denied_on_load contract rows, including the disabled-on-denied state the prototype is missing. Do NOT add a confirmation snackbar for the granted case (see gotchas) — the prototype tried one and removed it.',
      'T3 — Wire subscribe_fails and unsubscribe_requested against whatever the production push backend turns out to be (see open questions).',
      'T4 — Wire permission_changed_externally via the Permissions API\'s onchange (the prototype already does this — port the same approach rather than re-deriving it; see contract).',
      'T5 — Glow choreography, consolidated into one shared implementation rather than the prototype\'s remaining 2-way copy-paste; decide whether the invite-only/manage-anywhere toggle-visibility split (see gotchas/open questions) carries over.',
    ],
    prohibitions: [
      'Never port the localStorage-boolean `subscribed` as if it were a real subscription — it must be backed by an actual PushManager subscription in production.',
      'Never leave permission_denied visually unhandled the way the prototype currently does (it shows nothing at all, not even the hint it briefly had) — that gap is documented here precisely so it isn\'t silently re-created as "matching the prototype".',
      'Never add a confirmation snackbar/toast for the permission-granted case — one was built and deliberately removed (see gotchas); the browser\'s own permission UI plus the glow highlight is the intended full feedback.',
      'Never add a new semantic token for this feature without design-system sign-off (see docs/Handoff/pwa-web-push/for-codashop-client/tokens.md once generated) — use the listed fallback until then.',
    ],
  },
})
