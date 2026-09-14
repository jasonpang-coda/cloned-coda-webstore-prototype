<script setup>
defineProps({
  steps: { type: Array, default: () => [] }, // [{ icon, heading, body }]
})
</script>

<template>
  <div class="home-steps">
    <div v-for="(s, i) in steps" :key="s.heading" class="home-steps__step">
      <span
        v-if="s.icon"
        class="home-steps__icon"
        :style="{ '--home-steps-icon-url': `url(${s.icon})` }"
      ></span>
      <span v-else class="home-steps__num text-style-utility-action-bold">{{ i + 1 }}</span>
      <div class="home-steps__body">
        <p class="home-steps__heading text-style-utility-action-bold">{{ s.heading }}</p>
        <p class="home-steps__desc text-style-paragraph-small">{{ s.body }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-steps {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
}

.home-steps__step {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-m);
  border-radius: var(--x-radius-container-s);
  /* Hue progression across the 1-2-3 sequence — a wash of the step's own ink
     colour layered over the shared card surface, so each card's background
     itself shifts hue (acid-green → coral → indigo) rather than a one-off
     accent shape on top of it. */
  background: var(--x-wash-home-step-1, none), var(--x-home-surface-bg, var(--x-bg-card-default));
  border: var(--border-weight-default) solid var(--x-home-surface-border, transparent);
  box-shadow: var(--x-shadow-card);
  backdrop-filter: var(--x-home-surface-blur, none);
  -webkit-backdrop-filter: var(--x-home-surface-blur, none);
}
.home-steps__step:nth-child(2) {
  background: var(--x-wash-home-step-2, none), var(--x-home-surface-bg, var(--x-bg-card-default));
}
.home-steps__step:nth-child(3) {
  background: var(--x-wash-home-step-3, none), var(--x-home-surface-bg, var(--x-bg-card-default));
}
.home-steps__step:nth-child(2) .home-steps__icon { background-color: var(--x-home-step-ink-2, var(--x-text-hyperlink-default)); }
.home-steps__step:nth-child(3) .home-steps__icon { background-color: var(--x-home-step-ink-3, var(--x-text-hyperlink-default)); }

/* The source PNGs are simple line-art on a transparent background — masked
   with currentColor (the same technique MaterialIcon.vue uses) rather than
   rendered as a plain <img>, so they can be recoloured to the brand accent
   instead of shipping stuck at whatever colour the source art happened to
   be drawn in. */
.home-steps__icon {
  flex: 0 0 auto;
  width: var(--x-size-icon-xl);
  height: var(--x-size-icon-xl);
  background-color: var(--x-text-hyperlink-default);
  mask: var(--home-steps-icon-url) center / contain no-repeat;
  -webkit-mask: var(--home-steps-icon-url) center / contain no-repeat;
}
.home-steps__num {
  flex: 0 0 auto;
  width: var(--x-size-control-m);
  height: var(--x-size-control-m);
  display: grid;
  place-items: center;
  border-radius: var(--x-radius-control-full);
  background: var(--x-bg-indicator-brand-subtle);
  color: var(--x-bg-indicator-brand-default);
}

.home-steps__body { min-width: 0; }
.home-steps__heading {
  display: block;
  margin: 0 0 2px;
  color: var(--x-home-surface-text, var(--x-text-header-default));
}
.home-steps__desc {
  display: block;
  margin: 0;
  color: var(--x-home-surface-text-sub, var(--x-text-body-default));
}
</style>
