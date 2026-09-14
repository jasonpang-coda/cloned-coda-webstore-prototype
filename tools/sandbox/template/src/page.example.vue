<script setup>
/**
 * page.example.vue — a worked starting point composing curated components
 * into a plausible idea page. To try a new idea: add a new src/page.<name>.vue
 * next to this one, then point src/main.js's `import Page from …` at it (or
 * just edit this file in place). See AGENTS.md before you start.
 */
import Grid from '@/components/Grid.vue'
import Span from '@/components/Span.vue'
import CategoryBanner from '@/components/CategoryBanner.vue'
import SkuCard from '@/components/SkuCard.vue'
import Button from '@/components/Button.vue'
</script>

<template>
  <Grid>
    <Span size="content">
      <CategoryBanner
        title="NEW YEAR SALE"
        description="Limited-time bonus CP on every pack — this week only."
      />
    </Span>
  </Grid>

  <Grid>
    <Span size="content" class="idea-page__row">
      <SkuCard
        :amount="460" :base-amount="400" :bonus-amount="60"
        bonus-label="BONUS" current-price="$6.39"
      />
      <SkuCard
        :amount="2000" :base-amount="1780" :bonus-amount="220"
        bonus-label="BONUS" current-price="$24.99" is-best-value
      />
    </Span>
  </Grid>

  <Grid>
    <Span size="content">
      <Button variant="primary" size="large" full-width>Shop Now</Button>
    </Span>
  </Grid>
</template>

<style scoped>
.idea-page__row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--x-gap-content-default);
  padding-bottom: var(--x-pad-surface-l);
}
</style>
