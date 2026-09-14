<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Button from './Button.vue'
import ListItem from './ListItem.vue'
import PlayerCard from './PlayerCard.vue'
import { useAuth } from '../composables/useAuth.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useLocale } from '../composables/useLocale.js'
const assets = useStoreAssets()
const config = useStoreConfig()
const strings = useStoreStrings()
// Shared, store-agnostic chrome copy (localised via the language switcher).
const { common } = useLocale()
const router = useRouter()

/**
 * AccountPopover — "YOUR ACCOUNT" popover (Figma 5199:12187), opened by tapping
 * the in-game avatar in the navbar (signed-in state). Anchored 8px below the
 * navbar, right-aligned with the avatar. NO dimming scrim — the page behind
 * stays visible and interactive.
 *
 * Shows the player card (same demo data as PlayerAccount's "found" card) and a
 * SIGN OUT action that runs the existing signOut().
 */
defineProps({
  isMobile: { type: Boolean, default: true },
})

const { accountMenuOpen, closeAccountMenu, signOut, playerName } = useAuth()

// Transaction History is opt-in per store: the link shows only where the store
// provides the copy (codm, fcm) — strings-driven gate, never a theme test.
function goToHistory() {
  router.push('/history')
  closeAccountMenu()
}

const panel = ref(null)

// Dismiss on Escape, on a tap outside the panel, and on scroll (the navbar hides
// on scroll-down, so a fixed-offset popover would otherwise float unanchored).
function onKey(e) {
  if (e.key === 'Escape') closeAccountMenu()
}
function onPointerDown(e) {
  // Skip the navbar avatar button — it toggles the popover itself
  // (@click="toggleAccountMenu()"); if this handler also closed on that same
  // pointerdown, the click that follows would immediately reopen it (toggle
  // sees accountMenuOpen already false and flips it back on).
  if (e.target.closest('[data-account-toggle]')) return
  if (panel.value && !panel.value.contains(e.target)) closeAccountMenu()
}
function onScroll() {
  closeAccountMenu()
}
watch(accountMenuOpen, (open) => {
  if (open) {
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { capture: true, passive: true })
    // Defer the outside-tap listener a tick so the click that opened the popover
    // doesn't immediately close it.
    nextTick(() => document.addEventListener('pointerdown', onPointerDown))
  } else {
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('scroll', onScroll, { capture: true })
    document.removeEventListener('pointerdown', onPointerDown)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('scroll', onScroll, { capture: true })
  document.removeEventListener('pointerdown', onPointerDown)
})
</script>

<template>
  <Transition name="popover">
    <div
      v-if="accountMenuOpen"
      class="account-popover"
      :class="{ 'account-popover--responsive': !isMobile }"
      role="dialog"
      aria-modal="false"
      :aria-label="common.account.popoverTitle"
    >
      <section ref="panel" class="account-popover__panel">
        <!-- Header -->
        <div class="account-popover__header">
          <span class="account-popover__title text-style-heading-card">{{ common.account.popoverTitle }}</span>
          <Button variant="icon" size="medium" icon="close" aria-label="Close" class="account-popover__close" @click="closeAccountMenu()" />
        </div>

        <!-- Player card — variant + avatar + label driven by store config/strings -->
        <PlayerCard
          :name="playerName"
          id-masked="**** 9859"
          :level="80"
          rank="Rookie 1"
          :avatar-src="config.profile.avatarStyle === 'image' ? assets.content.avatar : null"
          :variant="config.profile.playerCard"
          :label="strings.account.playerCardLabel"
          :show-rank="config.profile?.showPlayerRank !== false"
        />

        <!-- Transaction History link — opt-in per store (strings-gated) -->
        <ListItem
          v-if="strings.transactionHistory"
          icon="swap_horiz"
          :icon-size="24"
          label-style="text-style-utility-default-regular"
          class="account-popover__link"
          @click="goToHistory()"
        >{{ strings.transactionHistory.popoverLink }}</ListItem>

        <!-- Action -->
        <div class="account-popover__action">
          <Button
            variant="link"
            :underline="false"
            :haptic="false"
            icon="logout"
            icon-position="trailing"
            label-style="text-style-utility-default-regular"
            class="account-popover__signout"
            @click="signOut()"
          >{{ common.account.signOut }}</Button>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.account-popover {
  position: absolute;
  inset: 0;
  z-index: 5; /* above checkout sheet (4); no scrim so it's non-blocking */
  pointer-events: none; /* page behind stays interactive; panel re-enables below */
}

/* Panel — anchored 8px below the navbar bottom, right-aligned with the avatar
   (the avatar sits at the Grid right gutter = --x-pad-surface-m / 12px).
   top = safe area + navbar top pad + 32px avatar + navbar bottom pad + 8px gap. */
.account-popover__panel {
  position: absolute;
  top: calc(
    var(--safe-top, 0px) + var(--x-pad-surface-m) + 32px + var(--x-pad-surface-m) + var(--x-pad-surface-s)
  );
  right: var(--x-pad-surface-m);
  width: 272px;
  max-width: calc(100% - 2 * var(--x-pad-surface-m));
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  pointer-events: auto;
  padding: var(--x-pad-surface-m) var(--x-pad-surface-s) var(--x-pad-surface-l);
  /* L3 container surface — all four borders, fully rounded, frosted backdrop. */
  border: var(--border-weight-default) solid var(--x-border-sheet);
  border-radius: var(--x-radius-container-s);
  background-image: var(--x-bg-sheet);
  background-color: var(--x-bg-page);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
  box-shadow: var(--x-shadow-sheet);
  transform-origin: top right; /* scale-in anchors to the avatar corner */
}

/* Header */
.account-popover__header {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
}
.account-popover__title {
  flex: 1;
  min-width: 0;
  text-transform: uppercase;
  color: var(--x-text-header-default);
}
.account-popover__close {
  flex-shrink: 0;
}

/* Transaction History link — icon + label row (Figma 5695:5013) */
.account-popover__link {
  --li-gap: var(--x-gap-content-narrow);
  --li-padding: var(--x-pad-surface-s) 0;
  --li-color-hover: var(--x-text-hyperlink-hover);
  --li-color-active: var(--x-text-hyperlink-pressed);
}

/* Action — top divider + centered Sign Out link + logout icon */
.account-popover__action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: var(--x-pad-surface-s);
  border-top: var(--border-weight-default) solid var(--x-border-divider);
  width: 100%;
}
.account-popover__signout:hover { filter: brightness(1.1); }

/* ── Open/close motion ──────────────────────────────────────────────────────
   Fade + slight drop-and-settle from the navbar. Decelerate in / accelerate out,
   no spring (utilitarian). Only transform/opacity animate. */
.popover-enter-active { transition: opacity var(--x-motion-modal-enter), transform var(--x-motion-modal-enter); }
.popover-leave-active { transition: opacity var(--x-motion-modal-exit), transform var(--x-motion-modal-exit); }
.popover-enter-active .account-popover__panel { transition: opacity var(--x-motion-modal-enter), transform var(--x-motion-modal-enter); }
.popover-leave-active .account-popover__panel { transition: opacity var(--x-motion-modal-exit), transform var(--x-motion-modal-exit); }
.popover-enter-from .account-popover__panel,
.popover-leave-to .account-popover__panel {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

/* ── Responsive (desktop) ───────────────────────────────────────────────────
   Overlay spans the full scrolling page → pin to the VIEWPORT, offset below the
   device toolbar. Pixel precision is a follow-up (see plan). */
.account-popover--responsive {
  position: fixed;
}
.account-popover--responsive .account-popover__panel {
  top: calc(
    var(--toolbar-h, 0px) + var(--safe-top, 0px) + var(--x-pad-surface-m) + 32px +
      var(--x-pad-surface-m) + var(--x-pad-surface-s)
  );
}
</style>
