<script setup>
import { ref } from 'vue'
import MaterialIcon from './MaterialIcon.vue'

const isExpanded = ref(false)
</script>

<template>
  <div class="reseller-banner">
    <div class="reseller-banner__bar">
      <span class="reseller-banner__short text-style-utility-label-uppercase">
        THIS WEBSTORE IS OPERATED BY CODA.
      </span>
      <button
        class="reseller-banner__toggle"
        type="button"
        :aria-expanded="isExpanded"
        aria-controls="reseller-banner-long"
        @click="isExpanded = !isExpanded"
      >
        <MaterialIcon
          name="expand_more"
          class="reseller-banner__chevron"
          :class="{ 'is-expanded': isExpanded }"
        />
      </button>
    </div>
    <div
      id="reseller-banner-long"
      class="reseller-banner__long"
      :class="{ 'is-open': isExpanded }"
    >
      <div class="reseller-banner__long-inner">
        <p class="reseller-banner__long-text text-style-utility-label-uppercase">
          CODA IS AN AUTHORIZED RESELLER OF ELECTRONIC ARTS' EA SPORTS FC™ MOBILE CONTENT.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reseller-banner {
  background: var(--x-bg-sheet);
  padding-left: var(--x-pad-surface-m);
  padding-right: var(--x-pad-surface-m);
}

@container (min-width: 1280px) {
  .reseller-banner {
    padding-left: var(--x-pad-surface-l);
    padding-right: var(--x-pad-surface-l);
  }
}

.reseller-banner__bar {
  display: flex;
  align-items: center;
  gap: var(--x-gap-control-s);
  padding-top: var(--x-pad-surface-xs);
  padding-bottom: var(--x-pad-surface-xs);
}

.reseller-banner__short {
  flex: 1;
  color: var(--x-text-body-default);
}

.reseller-banner__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--x-text-body-default);
  flex-shrink: 0;
}

.reseller-banner__chevron {
  transition-property: transform;
  transition-duration: var(--x-motion-sys-duration-exit);
  transition-timing-function: var(--x-motion-sys-ease-standard);
}

.reseller-banner__chevron.is-expanded {
  transform: rotate(180deg);
}

/* Expanded long message — grid-rows 0fr→1fr, the sanctioned accordion
   height transition (same recipe as ItemSummaryAccordion/.osum__detail). */
.reseller-banner__long {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--x-motion-accordion);
}

.reseller-banner__long.is-open {
  grid-template-rows: 1fr;
}

.reseller-banner__long-inner {
  min-height: 0;
  overflow: hidden;
}

.reseller-banner__long-text {
  margin: 0;
  padding-bottom: var(--x-pad-surface-xs);
  color: var(--x-text-body-default);
}

</style>
