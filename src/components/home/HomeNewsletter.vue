<script setup>
import { computed } from 'vue'

defineProps({
  heading: { type: String, default: '' },
  body: { type: String, default: '' },
  cta: { type: String, default: 'Join' },
  /** { facebook, instagram, tiktok } — Codashop's own supplied social marks (img/ref/). */
  socialIcons: { type: Object, default: () => ({}) },
})

const SOCIAL_LABELS = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok' }
</script>

<template>
  <div class="newsletter">
    <h3 class="newsletter__heading text-style-heading-card">{{ heading }}</h3>
    <p class="newsletter__body text-style-paragraph-small">{{ body }}</p>
    <!-- Prototype only — no real submission target; prevented on purpose. -->
    <form class="newsletter__form" @submit.prevent>
      <input class="newsletter__input" type="email" placeholder="Enter your email" aria-label="Email address" />
      <button v-ripple type="submit" class="newsletter__cta text-style-utility-action-bold">{{ cta }}</button>
    </form>
    <div v-if="Object.keys(socialIcons).length" class="newsletter__social">
      <a v-for="(src, key) in socialIcons" :key="key" v-ripple href="#" class="newsletter__social-link" :aria-label="SOCIAL_LABELS[key] ?? key">
        <img :src="src" :alt="SOCIAL_LABELS[key] ?? key" class="newsletter__social-icon" />
      </a>
    </div>
  </div>
</template>

<style scoped>
.newsletter {
  padding: var(--x-pad-surface-xl) var(--x-pad-surface-l);
  border-radius: var(--x-radius-container-s);
  background: var(--x-bg-section-highlighted);
}
.newsletter__heading {
  display: block;
  margin: 0;
  color: var(--x-text-header-default);
}
.newsletter__body {
  display: block;
  margin: 2px 0 var(--x-gap-content-default);
  color: var(--x-text-body-default);
}
.newsletter__form {
  display: flex;
  gap: var(--x-gap-content-default);
}
.newsletter__input {
  flex: 1;
  height: var(--x-size-control-m);
  padding: 0 var(--x-pad-surface-m);
  border-radius: var(--x-radius-control-full);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  background: var(--x-bg-input-default);
  color: var(--x-text-header-default);
  font: inherit;
  transition: border-color var(--x-motion-sku-hover);
}
.newsletter__input::placeholder {
  color: var(--x-text-placeholder);
}
.newsletter__input:focus {
  outline: none;
  border-color: var(--x-border-input-focused);
}
.newsletter__cta {
  flex: 0 0 auto;
  height: var(--x-size-control-m);
  padding: 0 var(--x-pad-surface-l);
  border-radius: var(--x-radius-control-full);
  background: var(--x-bg-action-primary);
  color: var(--x-text-on-primary);
  transition: opacity var(--x-motion-sku-hover), transform var(--x-motion-sku-press);
}
.newsletter__cta:hover {
  opacity: 0.85;
}
.newsletter__cta:active {
  transform: scale(0.96);
}

.newsletter__social {
  display: flex;
  gap: var(--x-gap-content-default);
  margin-top: var(--x-gap-content-loose);
}
.newsletter__social-link {
  width: var(--x-size-control-xs);
  height: var(--x-size-control-xs);
  display: grid;
  place-items: center;
  border-radius: var(--x-radius-control-full);
  background: var(--x-bg-card-default);
  transition: transform var(--x-motion-sku-hover);
}
.newsletter__social-link:hover {
  transform: translateY(-2px);
}
.newsletter__social-link:active {
  transform: scale(0.94);
}
.newsletter__social-icon {
  width: var(--x-size-icon-s);
  height: var(--x-size-icon-s);
  object-fit: contain;
}
</style>
