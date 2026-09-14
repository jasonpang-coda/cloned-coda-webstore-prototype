<script setup>
/**
 * PlayerCard — reusable player-identity card (ghost surface, hairline border).
 * Used wherever a player's account info needs to be displayed:
 *   • AccountPopover (signed-in state) — passes avatarSrc for the 48×48 avatar
 *   • PlayerAccount "found" state (guest lookup) — avatarSrc optional
 *
 * Props mirror the demo data structure; swap for real API data when available.
 */
defineProps({
  /** In-game display name */
  name:      { type: String, required: true },
  /** Masked account ID, shown as "(ID: …)" */
  idMasked:  { type: String, default: '**** 9859' },
  /** Player level */
  level:     { type: [String, Number], default: 80 },
  /** MP rank string */
  rank:      { type: String, default: 'Rookie 1' },
  /** Optional avatar image URL — renders a 48×48 circle when provided */
  avatarSrc: { type: String, default: null },
  /**
   * 'full'          — avatar + name + masked ID + level + rank (COD:M default)
   * 'nickname-only' — label above name; avatar, ID and stats hidden (FCM: EA only
   *                   surfaces the display name in its public-facing profile API)
   */
  variant: { type: String, default: 'full' },
  /**
   * Optional category label shown above the display name in nickname-only mode
   * (e.g. 'Player Profile' for FCM). Hidden when null/empty.
   */
  label: { type: String, default: null },
  /** Whether to show the MP Rank stat — default true; set false to hide it */
  showRank: { type: Boolean, default: true },
})
</script>

<template>
  <div class="player-card" :class="{ 'player-card--nickname-only': variant === 'nickname-only' }">
    <img v-if="avatarSrc && variant !== 'nickname-only'" :src="avatarSrc" alt="" class="player-card__avatar" />
    <div class="player-card__info">

      <!-- nickname-only variant: label (small, soft) + name (heading style) -->
      <template v-if="variant === 'nickname-only'">
        <span v-if="label" class="player-card__label text-style-utility-label-regular">{{ label }}</span>
        <span class="player-card__display-name text-style-heading-page-title">{{ name }}</span>
      </template>

      <!-- full variant: name + masked ID row + level/rank row -->
      <template v-else>
        <div class="player-card__row">
          <span class="player-card__name text-style-utility-label-bold">{{ name }}</span>
          <span class="player-card__id text-style-utility-label-regular">(ID: {{ idMasked }})</span>
        </div>
        <div class="player-card__meta">
          <span class="player-card__stat text-style-utility-micro-regular">Level: <strong>{{ level }}</strong></span>
          <span v-if="showRank" class="player-card__stat text-style-utility-micro-regular">MP Rank: {{ rank }}</span>
        </div>
      </template>

      <!-- Optional trailing link row (e.g. PlayerAccount's PWA install
           hyperlink) — absent for every existing consumer (AccountPopover),
           so this is a no-op change for them. -->
      <slot name="link" />

    </div>
  </div>
</template>

<style scoped>
/* L1 surface + hairline border */
.player-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-s);
  border: var(--border-weight-default) solid var(--x-border-soft);
  border-radius: var(--x-radius-container-xs);
  background: var(--x-bg-sku-card-default);
  width: 100%;
}

/* Avatar — 48×48 circle, only rendered when avatarSrc is supplied */
.player-card__avatar {
  flex-shrink: 0;
  width: var(--x-size-img-l);   /* 48px */
  height: var(--x-size-img-l);
  border-radius: var(--x-radius-badge-full);
  object-fit: cover;
  display: block;
}

/* Info column — name/ID row + level/rank row */
.player-card__info {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  min-width: 0;
}

.player-card__row {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-narrow);
}

.player-card__name {
  color: var(--x-text-header-default);
  white-space: nowrap;
}

.player-card__id {
  color: var(--x-text-body-soft);
  white-space: nowrap;
}

.player-card__meta {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
}

.player-card__stat {
  color: var(--x-text-body-soft);
  white-space: nowrap;
}

/* nickname-only variant — FCM: stacked label + display name */
.player-card--nickname-only .player-card__info {
  gap: var(--x-gap-content-tight);
}

/* "Player Profile" — soft utility label above the name */
.player-card__label {
  color: var(--x-text-body-soft);
  display: block;
  text-align: left;
}

/* Display name — heading scale, condense via .text-style-* class scaleX */
.player-card__display-name {
  color: var(--x-text-header-default);
  display: block;
  transform-origin: left center;
}
</style>
