<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import Grid from './Grid.vue'
import Span from './Span.vue'
import MaterialIcon from './MaterialIcon.vue'
import Button from './Button.vue'
import FlagTile from './FlagTile.vue'
import { useAuth } from '../composables/useAuth.js'
import { useLocale } from '../composables/useLocale.js'
import { useTheme } from '../composables/useTheme.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useFeatureFlags } from '../composables/useFeatureFlags.js'
import { formatNumber } from '../utils/formatNumber.js'
const assets = useStoreAssets()
const strings = useStoreStrings()
const config = useStoreConfig()

// Optional icon-only mark for the navbar specifically (assets.brand.navLogomark)
// — for a store whose real navbar chrome is a small brand mark, not the full
// wordmark (Diablo Immortal). Falls back to the wordmark for every other store.
const navLogoSrc = computed(() => assets.value.brand.navLogomark ?? assets.value.brand.wordmark)

// Framed device (scrolls inside .device__screen) vs responsive (scrolls the
// window) — same distinction CategoryNav resolves its scroll container by.
const props = defineProps({
  isMobile: { type: Boolean, default: true },
  /** L1 "intent" tabs — [{ id, label }] (categories optional, FCM only). Store-agnostic
   *  prop; App.vue decides when to pass more than one entry, so this row just renders
   *  whatever it's given. */
  intents: { type: Array, default: () => [] },
  activeIntent: { type: String, default: null },
})

// Burger opens the nav drawer — state is owned by the parent (App.vue).
// 'home' — the wordmark is always a real tap target back to the default page.
// App.vue's goHome() interprets it per store: Codashop returns from a title's
// product page to its aggregator homepage; every other store closes whatever
// full-page view (Order Complete, Transaction History) is currently open.
defineEmits(['menu', 'update:activeIntent', 'home'])

// Auth state — shared singleton (also drives the loader, snackbar, drawer).
// SIGN IN button routes to the store's sign-in flow (sheet for COD:M; EA page for FCM).
const { signedIn, openSignInSheet, startEaSignIn, toggleAccountMenu, loyaltyPoints } = useAuth()

// Region/language switcher (Figma 4036:583) — M+ responsive widths only
// (@container gate below); the drawer footer covers smaller screens.
const { currentMarket, currentMarketName, language, openRegionSelector, openLanguageSelector } = useLocale()

// Feature-flag gate for the region/language switcher (see useFeatureFlags).
const { isEnabled } = useFeatureFlags()

// L1 intent row — shown whenever the parent hands down more than one intent.
// App.vue is the sole authority on when that happens: FCM's multi-level nav
// pilot (config.nav.multiLevel) passes its real intent tree; COD:M's
// lightweight Store/Milestone Rewards tab pilot (config.nav.milestoneFlag)
// passes a two-item stand-in list; every other store passes an empty array.
const showIntentNav = computed(() => props.intents.length > 1)

// Store switch (dev console / DeviceToolbar) reuses this component instance —
// scrollTop of the shared `.device__screen` carries over from whatever store
// was active before, which could leave the bar stuck hidden on the new store
// until the user happens to scroll up. Reset visibility on every switch.
const { theme } = useTheme()

// Chrome-tone override for icon/text sitting directly on the dark navbar bg.
// Every store's --x-text-header-default already resolves light on their (all-
// dark) UI, so this defaults to false everywhere; Codashop is the first
// light-card store, where --x-text-header-default correctly means dark (for
// card headings) but that's wrong for the navbar's own permanently-dark
// chrome — --x-text-header-inverse is what resolves light there instead.
const chromeInverse = computed(() => config.value.navbar?.chromeTone === 'inverse')

function handleSignIn() {
  if (config.value.signIn.flow === 'ea-redirect') {
    startEaSignIn()
  } else {
    openSignInSheet()
  }
}

// Download button — takes over the sign-in slot for a store with no sign-in
// at all (config.navbar.hideSignIn) that also has a download banner section
// (strings.page.download — same "renders purely off content presence"
// precedent as the section itself and the SEO block). Every other store
// keeps its normal sign-in/avatar button, unaffected.
function scrollToDownload() {
  document.getElementById('download-banner')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ── Scroll-aware hide/show ───────────────────────────────────────────────
 * The bar is `position: sticky` (see style below) so it pins to the top once
 * its natural position scrolls past — sticky rather than fixed so it stays
 * in normal flow and needs no page-content offset. It hides via translateY
 * on scroll-down past its own height, and reveals immediately on scroll-up
 * or once back near the top. Scroll container mirrors CategoryNav's split:
 * `.device__screen` when framed, the window when responsive.
 */
const navRef = ref(null)
const hidden = ref(false)
let scrollTarget = null
let lastScrollTop = 0
let ticking = false

function scrollTopOf (target) {
  return target === window ? window.scrollY : target.scrollTop
}

function onScroll () {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    const top = scrollTopOf(scrollTarget)
    const delta = top - lastScrollTop
    const barHeight = navRef.value?.offsetHeight ?? 0
    if (top <= barHeight) {
      hidden.value = false // always visible near the top of the page
    } else if (delta > 4) {
      hidden.value = true // scrolling down
    } else if (delta < -4) {
      hidden.value = false // scrolling up
    }
    lastScrollTop = top
    ticking = false
  })
}

function bindScroll () {
  unbindScroll()
  scrollTarget = props.isMobile ? document.querySelector('.device__screen') : window
  if (!scrollTarget) return
  lastScrollTop = scrollTopOf(scrollTarget)
  scrollTarget.addEventListener('scroll', onScroll, { passive: true })
}
function unbindScroll () {
  scrollTarget?.removeEventListener('scroll', onScroll)
}

onMounted(bindScroll)
onBeforeUnmount(unbindScroll)
// Re-resolve the scroll container when the device frame toggles (framed <-> responsive).
watch(() => props.isMobile, () => { hidden.value = false; bindScroll() })
// See the comment above `theme` — always start visible on the new store.
watch(theme, () => { hidden.value = false; lastScrollTop = scrollTopOf(scrollTarget) })

/* ── --navbar-h / --navbar-h-max ─────────────────────────────────────────────
 * --navbar-h is reported live (mirrors DeviceToolbar's --toolbar-h) so anything
 * that must dock directly beneath the bar — e.g. CategoryNav's `variant="top"`
 * — can offset by it instead of colliding with the sticky bar. This tracks the
 * bar's CURRENTLY VISIBLE height, not its laid-out height: `transform`
 * doesn't change `offsetHeight`, so reporting the raw layout height would
 * reserve dead space at the top whenever the bar is scrolled-hidden (the
 * docked element would sit exactly where the bar *would* be, leaving an
 * empty gap above it since nothing is actually there). Reports 0 while hidden.
 *
 * --navbar-h-max is the raw layout height, hide-state-agnostic — for a
 * DIFFERENT job: reserving `scroll-margin-top` on a jump target. `el.scrollIntoView()`
 * computes its destination ONCE, from geometry at call time — it does not
 * re-run mid-animation. Scrolling UP triggers this bar's own "reveal on
 * scroll-up" rule as soon as the jump starts, so by the time the jump settles
 * the bar can be visible again even though --navbar-h (and therefore the
 * offset baked into the destination) was 0 at the moment the jump began —
 * the bar then overlaps the top of whatever the jump landed on. Reserving
 * against the STABLE max height instead removes that race entirely; the
 * only cost is sometimes reserving a bit more than strictly needed (when the
 * bar does end up hidden), never less.
 */
let navHeight = 0
let ro = null
function reportNavbarH () {
  document.documentElement.style.setProperty('--navbar-h', (hidden.value ? 0 : navHeight) + 'px')
}
onMounted(() => {
  if (typeof ResizeObserver === 'undefined' || !navRef.value) return
  ro = new ResizeObserver(() => {
    navHeight = navRef.value?.offsetHeight ?? 0
    reportNavbarH()
    document.documentElement.style.setProperty('--navbar-h-max', navHeight + 'px')
  })
  ro.observe(navRef.value)
})
watch(hidden, reportNavbarH)
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <header ref="navRef" class="navbar" :class="{ 'navbar--hidden': hidden, 'navbar--chrome-inverse': chromeInverse, 'navbar--has-intents': showIntentNav }">
    <Grid>
      <Span size="fluid">
        <div class="navbar__row">
          <div class="navbar__left">
            <Button variant="icon" size="medium" icon="menu" aria-label="Open menu" data-poi="hamburger-btn" class="navbar__icon-btn" @click="$emit('menu')" />
            <!-- The wordmark is a real button in every store, returning to the
                 default page (see the `home` emit doc above). -->
            <button
              v-ripple
              v-haptic
              type="button"
              class="navbar__logo-btn"
              aria-label="Go to homepage"
              @click="$emit('home')"
            >
              <img :src="navLogoSrc" :alt="strings.signIn.logoAlt" class="navbar__logo" />
            </button>
            <!-- Optional text appended right after the wordmark (config.navbar.wordmarkSuffix,
                 e.g. "Web Store"). null/absent for every other store, so this never renders elsewhere. -->
            <span v-if="config.navbar?.wordmarkSuffix" class="navbar__logo-suffix text-style-utility-label-uppercase">{{ config.navbar.wordmarkSuffix }}</span>
          </div>

          <div class="navbar__right">
            <!-- Region & language switcher (Figma 4036:583) — flag opens the
                 region selector, the language code opens the language selector.
                 Hidden below M; the drawer footer is the small-screen entry. -->
            <div v-if="isEnabled('localeSwitcher') || config.navbar?.localeSwitcher" class="navbar__locale" role="group" aria-label="Region and language">
              <button
                v-ripple
                v-haptic
                type="button"
                class="navbar__locale-btn"
                data-poi="region-pill"
                :aria-label="`Region: ${currentMarketName}`"
                @click="openRegionSelector()"
              >
                <FlagTile :code="currentMarket.code" :width="24" />
              </button>
              <button
                v-if="config.navbar?.localeShowLanguage !== false"
                v-ripple
                v-haptic
                type="button"
                class="navbar__locale-btn"
                :aria-label="`Language: ${language}`"
                @click="openLanguageSelector()"
              >
                <span class="navbar__locale-lang text-style-utility-action-bold">{{ language.split('-')[0].toUpperCase() }}</span>
              </button>
            </div>

            <!-- Standalone coloured loyalty icon — signed-out, stores with a loyalty
                 programme only. Gate on config.checkout.loyalty (not the asset) so a
                 store that has a loyaltyIconColour asset but no active programme
                 (e.g. COD:M pre-launch) shows nothing. -->
            <img
              v-if="!signedIn && config.checkout.loyalty && assets.brand.loyaltyIconColour"
              :src="assets.brand.loyaltyIconColour"
              alt=""
              aria-hidden="true"
              class="navbar__mp-icon"
            />

            <!-- Loyalty rewards pill — signed-in, stores with the pill enabled
                 (config.profile.showLoyaltyPill). Same config gate as above. -->
            <Transition name="nav-rewards">
              <div
                v-if="signedIn && config.checkout.loyalty && config.profile.showLoyaltyPill && assets.brand.loyaltyIconColour"
                class="navbar__rewards"
                aria-label="Loyalty points balance"
              >
                <img :src="assets.brand.loyaltyIconColour" alt="" aria-hidden="true" class="navbar__rewards-icon" />
                <span class="navbar__rewards-pts text-style-utility-label-bold">
                  {{ formatNumber(loyaltyPoints) }}
                </span>
              </div>
            </Transition>

            <!-- Auth button — sign-in (signed-out) vs account avatar (signed-in) -->
            <!-- config.navbar.hideSignIn suppresses both the sign-in button and account avatar (e.g. eFootball) -->
            <Transition v-if="!config.navbar?.hideSignIn" name="nav-auth" mode="out-in">
              <button
                v-if="!signedIn"
                key="signin"
                v-ripple
                v-haptic
                type="button"
                class="navbar__signin"
                :class="{ 'navbar__signin--filled': config.navbar?.signInStyle === 'filled' }"
                @click="handleSignIn()"
              >
                <img v-if="config.navbar?.signInShowIcon !== false" :src="assets.brand.logomark" alt="" class="navbar__signin-icon" />
                <span
                  class="navbar__signin-label"
                  :class="config.navbar?.signInStyle === 'filled' ? 'text-style-utility-default-bold' : 'text-style-utility-default-regular'"
                >{{ strings.signIn.cta }}</span>
              </button>
              <button v-else key="avatar" v-ripple v-haptic type="button" class="navbar__avatar" data-account-toggle aria-label="Account menu" @click="toggleAccountMenu()">
                <img
                  v-if="config.profile.avatarStyle === 'image'"
                  :src="assets.content.avatar"
                  alt="Account"
                  class="navbar__avatar-img"
                />
                <MaterialIcon
                  v-else
                  name="account_circle"
                  variant="round"
                  :size="30"
                  class="navbar__avatar-icon"
                />
              </button>
            </Transition>

            <!-- Download button — same navbar slot the sign-in button would
                 occupy, for a store with no sign-in but a download banner to
                 send users to instead (see scrollToDownload above). -->
            <button
              v-else-if="strings.page.download"
              v-ripple
              v-haptic
              type="button"
              class="navbar__signin"
              @click="scrollToDownload()"
            >
              <span class="navbar__signin-label text-style-utility-default-regular">{{ strings.page.download.navCta ?? strings.page.download.heading }}</span>
            </button>
          </div>
        </div>

        <!-- L1 intent row — Store / Loyalty & Rewards / Events (FCM multi-level
             nav pilot). Lives inside the header so it inherits the scroll-aware
             hide/show above for free and is counted in --navbar-h automatically —
             no separate sticky surface, no second scroll listener. -->
        <nav v-if="showIntentNav" class="navbar__intents" role="tablist" aria-label="Navigate">
          <button
            v-for="intent in intents"
            :key="intent.id"
            v-ripple
            v-haptic:chip
            type="button"
            role="tab"
            class="navbar__intent"
            :class="{ 'is-active': activeIntent === intent.id }"
            :aria-selected="activeIntent === intent.id"
            :data-poi="intent.id === 'rewards' ? 'milestone-tab' : null"
            @click="$emit('update:activeIntent', intent.id)"
          >
            <span
              class="navbar__intent-label"
              :class="activeIntent === intent.id ? 'text-style-utility-label-bold' : 'text-style-utility-label-regular'"
            >{{ intent.label }}</span>
          </button>
        </nav>
      </Span>
    </Grid>
  </header>
</template>

<style scoped>
.navbar {
  /* Sticky (not fixed): stays in the page's normal flow — no content offset
     needed — but pins to the scroll container's top edge once its natural
     position scrolls past. Scroll-aware hide/show (below) then slides it
     away on scroll-down and reveals it on scroll-up. Applies to every store. */
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--x-bg-navbar);
  backdrop-filter: blur(var(--x-blur-container, 8px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 8px));
  /* --x-border-navbar defaults to the same value as --x-border-divider (both
     alias --x-sys-colour-neutral-soft) for every existing store, so this is a
     no-op refactor for them — but it's the token actually meant for this
     rule, and Codashop's theme now overrides it distinctly (see codashop.css). */
  border-bottom: var(--border-weight-default) solid var(--x-border-navbar);
  padding-top: calc(var(--safe-top, 0px) + var(--x-pad-surface-m));
  padding-bottom: var(--x-pad-surface-m);
  transition: transform var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
}
.navbar--hidden {
  transform: translateY(-110%);
}
/* L1 intent row present (FCM multi-level nav pilot) — its own tabs already
   carry bottom padding, so the header's own padding-bottom would just add a
   second gap above whatever docks below (e.g. CatalogNavStack, which docks
   flush at --navbar-h). Zero it here instead of removing it from .navbar
   unconditionally, so every other store's header spacing is untouched.
   Same reasoning for the border — dropped so the header reads as one
   seamless surface with L1 instead of a hard line cutting right below it. */
.navbar--has-intents {
  padding-bottom: 0;
  border-bottom: 0;
}

/* Chrome-tone override (config.navbar.chromeTone === 'inverse', Codashop
   only) — see the chromeInverse computed above for why this can't just be
   a global token swap. */
.navbar--chrome-inverse .navbar__icon-btn,
.navbar--chrome-inverse .navbar__locale-btn,
.navbar--chrome-inverse .navbar__locale-btn:hover {
  color: var(--x-text-header-inverse);
}
/* Home Blob layout only — its own [data-home-layout="blob"] theme scope
   (codashop.css) repoints the shared neutral ramp (--x-ref-neutral /
   --x-palette-neutral-*) onto its own near-black home-blob-neutral ramp, so
   --x-text-header-inverse above resolves to a near-black ink instead of the
   light one Standard/Visual get from the same token — same dark family as
   --x-bg-navbar itself, so the hamburger/locale icons all but disappear.
   Blob's own light neutral step restores contrast; gated so Standard/Visual
   (where the override above already resolves correctly) are untouched. */
html[data-theme="codashop"][data-home-layout="blob"] .navbar--chrome-inverse .navbar__icon-btn,
html[data-theme="codashop"][data-home-layout="blob"] .navbar--chrome-inverse .navbar__locale-btn,
html[data-theme="codashop"][data-home-layout="blob"] .navbar--chrome-inverse .navbar__locale-btn:hover {
  color: var(--x-palette-home-blob-neutral-0, #fff8fc);
}

.navbar__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--x-gap-content-default);
  width: 100%;
}

.navbar__left {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  min-width: 0;
}

.navbar__logo {
  height: var(--x-size-icon-l);
  width: auto;
  display: block;
  filter: var(--x-shadow-logo);
}

/* The wordmark as a real tap target back to the default page (every store). */
.navbar__logo-btn {
  display: block;
  padding: 0;
  border-radius: var(--x-radius-control-xs);
  transition: opacity var(--x-motion-sku-hover);
}
.navbar__logo-btn:hover,
.navbar__logo-btn:focus-visible {
  opacity: 0.85;
}
.navbar__logo-btn:active {
  opacity: 0.7;
}

/* Optional wordmark suffix (config.navbar.wordmarkSuffix) — a small label
   immediately after the logo, e.g. "Web Store". */
.navbar__logo-suffix {
  color: var(--x-text-header-default);
  white-space: nowrap;
  padding-left: var(--x-pad-surface-xs);
  border-left: var(--border-weight-default) solid var(--x-border-divider);
}

.navbar__right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--x-gap-content-default);
}

/* ── L1 intent row (FCM multi-level nav pilot) ───────────────────────────────
   Sits below .navbar__row, inside the same header — no separate surface, no
   separate sticky/scroll handling. Bottom-edge active indicator (mirrors
   CategoryNav's variant="top" treatment) since this row sits at the BOTTOM
   of a header rather than the top of a docked bar. Tabs share the row's full
   width equally (flex:1 each, centred label) rather than hugging their own
   content — this is the primary intent switcher, so it should read as a
   single full-bleed control, not a cluster of buttons with dead space beside them.

   Genuinely edge-to-edge (not just full-width within its own column): this
   row lives inside <Grid><Span size="fluid">, and Grid always insets its
   content by --x-gap-grid-margin on both sides (see Grid.vue) — the negative
   margin below cancels exactly that, same technique Span's own carousel
   variant uses to bleed past Grid's padding. No vertical padding on the row
   itself — that lives entirely on each tab's own padding (.navbar__intent,
   below), same "padding lives on the tab, not the container" rule as L2/L3. */
.navbar__intents {
  display: flex;
  align-items: center;
  /* NOT `width: 100%` — that fixes the box's width to the Span's own content
     width, over-constraining the box model alongside the negative margins
     below (width + both margins ≠ the containing block's width once neither
     is `auto`). The browser resolves that by silently dropping margin-right
     back to `auto`, so the left edge bled correctly but the right edge
     never did. `auto` (the default — simply omitted) lets the box model
     solve for the width itself, so both negative margins are honoured and
     it's genuinely edge-to-edge on both sides — same technique Span's own
     carousel variant relies on. */
  margin-top: var(--x-pad-surface-s);
  margin-left: calc(-1 * var(--x-gap-grid-margin));
  margin-right: calc(-1 * var(--x-gap-grid-margin));
  /* Separator below the WHOLE L1 row (not the old divider above it, between
     .navbar__row and L1 — moved here per feedback) — a plain structural
     divider, present regardless of selection, unrelated to the per-tab
     active-indicator border below. */
  border-bottom: var(--border-weight-default) solid var(--x-border-divider);
}
.navbar__intent {
  flex: 1 1 0;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--x-pad-surface-s) var(--x-pad-surface-xs) var(--x-pad-surface-m);
  border: 0;
  border-bottom: var(--border-weight-selected) solid transparent;
  position: relative; /* anchors ::after's gradient-stroke sliver (see .is-active below) */
  background: transparent;
  cursor: pointer;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--x-text-body-default);
  transition:
    color var(--x-motion-tab-indicator),
    border-color var(--x-motion-tab-indicator),
    background-color var(--x-motion-sku-hover),
    transform var(--x-motion-btn-activate);
}
/* Hover/press feedback — same "indicator" tint + press-down scale recipe as
   NavDrawer's L1/L2/L3 rows (.nav-drawer__l1 etc.), not a bespoke one.
   Scoped to :not(.is-active) so it doesn't fight the selected tab's own
   distinct colour/background-image above. */
.navbar__intent:not(.is-active):hover {
  color: var(--x-text-header-strong);
  background-color: var(--x-bg-indicator-neutral-subtle);
}
.navbar__intent:not(.is-active):active {
  color: var(--x-text-hyperlink-default);
  background-color: var(--x-bg-indicator-neutral-default);
}
.navbar__intent:active {
  transform: scale(0.97);
}
/* Edge-to-edge — the outermost edge of the first/last tab's label sits flush
   with the row's true left/right edge; inter-tab padding elsewhere is
   untouched. Equal-width division (flex: 1 1 0 above) is unaffected. */
.navbar__intent:first-child {
  padding-left: 0;
}
.navbar__intent:last-child {
  padding-right: 0;
}
.navbar__intent.is-active {
  /* --x-text-nav-selected defaults to --x-text-hyperlink-default (byte-for-byte
     unchanged for every store) — FCM overrides it to --x-text-body-default
     since the hyperlink accent reads poorly on its solid success-green
     --x-bg-nav-selected fill (see semantics.css / fcm.css for both tokens). */
  color: var(--x-text-nav-selected);
  /* --x-border-nav-selected defaults to --x-text-hyperlink-default (a plain solid
     underline, byte-for-byte unchanged for every store). FCM instead sets
     this to `transparent` and paints the real underline via the ::after
     gradient-stroke sliver below, since a gradient can't be expressed as a
     CSS border-color. */
  border-bottom-color: var(--x-border-nav-selected);
  /* `none` everywhere except FCM's override (see semantics.css / fcm.css) —
     inert for every other store, so only the container background changes.
     background-image (not background-color) since FCM's value is a gradient. */
  background-image: var(--x-bg-nav-selected);
}
/* Gradient-stroke underline (FCM only — --x-gradient-nav-selected-stroke
   defaults to `none`, so this pseudo-element is invisible everywhere else).
   A literal gradient border-color isn't expressible in CSS, so this renders
   as a positioned gradient-filled sliver sitting inside the tab's own bottom
   edge (not extending the box like a real border would) — --border-weight-
   nav-selected-stroke defaults to --border-weight-selected (2px, matching the
   solid border's own thickness) but FCM overrides it to 4px, its Figma spec's
   stroke thickness. */
.navbar__intent.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--border-weight-nav-selected-stroke, var(--border-weight-selected));
  background: var(--x-gradient-nav-selected-stroke, none);
}
.navbar__intent-label {
  overflow: hidden;
  text-overflow: ellipsis;
  transform-origin: center center;
}

/* ── Region & language switcher — M+ only (Figma 4036:583) ─────────────────
   Flag + language code with a trailing divider rule separating it from the
   rest of the right cluster. Container query resolves against .device__screen
   (container-type: inline-size): framed devices stay narrow, so this only
   appears in wide responsive mode — the drawer footer covers the rest. */
.navbar__locale {
  display: none;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding-right: var(--x-pad-surface-l);
  border-right: var(--border-weight-default) solid var(--x-border-divider);
}
@container (min-width: 801px) {
  .navbar__locale { display: flex; }
}
.navbar__locale-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* Padding grows the hit/hover area beyond the flag/text; matching negative
     margin cancels it out so the row's footprint is unchanged at rest. */
  padding: var(--x-pad-surface-xs);
  margin: calc(-1 * var(--x-pad-surface-xs));
  border: 0;
  border-radius: var(--x-radius-container-xs);
  background: transparent;
  color: var(--x-text-header-default);
  cursor: pointer;
  transition: color var(--x-motion-sku-hover),
              background-color var(--x-motion-sku-hover),
              transform var(--x-motion-btn-activate);
}
.navbar__locale-btn:hover {
  color: var(--x-text-header-strong);
  background-color: var(--x-surface-ghost-2);
}
.navbar__locale-btn:active {
  background-color: var(--x-surface-ghost-3);
  transform: scale(0.97);
}
.navbar__locale-lang {
  transform-origin: center center;
  white-space: nowrap;
}

/* Standalone MP icon — FCM signed-out state, left of the sign-in button */
.navbar__mp-icon {
  width: var(--x-size-icon-l);
  height: var(--x-size-icon-l);
  object-fit: contain;
  display: block;
  flex-shrink: 0;
}

/* MP rewards pill — FCM signed-in state, left of the account avatar */
.navbar__rewards {
  display: inline-flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-xs) var(--x-pad-surface-xxs) var(--x-pad-surface-xxs);
  border: var(--border-weight-default) solid var(--x-border-soft);
  border-radius: var(--x-radius-badge-full);
  background-image: var(--x-bg-sku-card-default);
  box-shadow: var(--x-shadow-rewards-pill);
}
.navbar__rewards-icon {
  width: var(--x-size-icon-m);
  height: var(--x-size-icon-m);
  object-fit: contain;
  display: block;
  flex-shrink: 0;
}
.navbar__rewards-pts {
  color: var(--x-text-hyperlink-default);
  white-space: nowrap;
}

.navbar__signin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-narrow);
  height: var(--x-size-control-s);
  padding: 0 var(--x-pad-surface-m);
  border: var(--border-weight-selected) solid var(--x-border-signin-btn);
  border-radius: var(--x-radius-control-full);
  background: transparent;
  color: var(--x-text-header-default);
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--x-motion-sku-hover),
              border-color var(--x-motion-sku-hover),
              opacity var(--x-motion-btn-activate),
              transform var(--x-motion-btn-activate);
}
.navbar__signin:hover {
  background: var(--x-surface-ghost-3);
}

/* Filled variant (config.navbar.signInStyle === 'filled', Codashop only) —
   the Figma reference's Sign In CTA is a solid primary pill, not the
   default transparent-outline treatment every other store uses. */
.navbar__signin--filled {
  border: none;
  background: var(--x-bg-action-primary);
  color: var(--x-text-on-primary);
  text-transform: none;
}
.navbar__signin--filled:hover {
  background: var(--x-bg-action-primary-hover);
}
.navbar__signin--filled .navbar__signin-label {
  /* Wins over the generic `.navbar__signin span { color: ... }` rule below
     by specificity (two classes vs one class + element) — that rule only
     ever set font-weight before, so the generic span rule's color was the
     only one actually applied. Bold weight comes from the
     .text-style-utility-default-bold class bound in the template, not a
     raw font-weight here. */
  color: var(--x-text-on-primary);
}
.navbar__signin:disabled {
  opacity: 0.4;
  transform: scale(0.97);
  pointer-events: none;
  cursor: not-allowed;
}
/* Condense the label text (not the button/icon) to match the rest of the UI.
   text-style-utility-default-regular on the span handles family/size/weight/tracking/scaleX. */
.navbar__signin span {
  transform-origin: center center;
  color: var(--x-text-on-action-tertiary);
}
.navbar__signin-icon {
  width: var(--x-size-icon-m);
  height: var(--x-size-icon-m);
  object-fit: contain;
  display: block;
}

/* Avatar = the player's in-game avatar image OR a generic account icon */
.navbar__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--x-size-control-s);
  height: var(--x-size-control-s);
  padding: 0;
  border: 0;
  border-radius: var(--x-radius-badge-full);
  background: transparent;
  cursor: pointer;
  transition: filter var(--x-motion-sku-hover);
}
.navbar__avatar:hover {
  filter: brightness(1.1);
}
.navbar__avatar-img {
  width: 30px;
  height: 30px;
  border-radius: var(--x-radius-badge-full);
  object-fit: cover;
  display: block;
}
.navbar__avatar-icon {
  color: var(--x-text-header-default);
  display: block;
}

/* ── Auth swap transition ─────────────────────────────────────────────────────
   Anchored right. Exit accelerates away; entrance decelerates with a spring
   pop — a small reward for signing in. Color/content also change so motion
   is never the only signal. Reduced-motion handled globally. */
.nav-auth-leave-active {
  transition: opacity var(--x-motion-sys-duration-exit) var(--x-motion-sys-ease-accelerate),
              transform var(--x-motion-sys-duration-exit) var(--x-motion-sys-ease-accelerate);
}
.nav-auth-enter-active {
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate),
              transform var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-spring);
}
.nav-auth-enter-from,
.nav-auth-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

/* Rewards pill — fades + scales in alongside the avatar on sign-in */
.nav-rewards-enter-active {
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate),
              transform var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-spring);
}
.nav-rewards-leave-active {
  transition: opacity var(--x-motion-sys-duration-exit) var(--x-motion-sys-ease-accelerate),
              transform var(--x-motion-sys-duration-exit) var(--x-motion-sys-ease-accelerate);
}
.nav-rewards-enter-from,
.nav-rewards-leave-to {
  opacity: 0;
  transform: scale(0.75);
}
</style>
