<template>
  <div class="bundle-grid">
    <slot />
  </div>
</template>

<style scoped>
/* Single column on mobile/S; 2-up from the M breakpoint (801px container).
   Container query resolves against .device__screen (container-type: inline-size). */
.bundle-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--x-gap-content-default);
}
@container (min-width: 801px) {
  .bundle-grid { grid-template-columns: 1fr 1fr; }
}
</style>
