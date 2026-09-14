<script setup>
import { ref, computed } from 'vue'
import StepCard from './StepCard.vue'
import { useStoreStrings } from '../../composables/useStoreStrings.js'
import { useStoreConfig } from '../../composables/useStoreConfig.js'

/**
 * StepGamerId — "Enter Gamer ID" step (Figma node 2189:2731). User ID +
 * optional Server input with an inline helper line — no lookup/spinner state
 * like PlayerAccount's guest flow, since the inline checkout treats this as
 * plain form input rather than a verified-account gate.
 *
 * config.checkout.gamerId.showServer (default true) hides the Server field
 * for stores with no server selection (e.g. Diablo Immortal — single Player ID).
 */
const strings = useStoreStrings()
const config = useStoreConfig()
const showServer = computed(() => config.value.checkout.gamerId?.showServer !== false)
const userId = ref('')
const server = ref('')
</script>

<template>
  <StepCard :title="strings.gamerId?.heading">
    <div class="gamer-id__row">
      <input
        v-model="userId"
        type="text"
        class="gamer-id__input text-style-utility-label-regular"
        :placeholder="strings.gamerId?.userIdLabel"
      />
      <input
        v-if="showServer"
        v-model="server"
        type="text"
        class="gamer-id__input text-style-utility-label-regular"
        :placeholder="strings.gamerId?.serverLabel"
      />
    </div>
    <p class="gamer-id__helper text-style-utility-label-regular">{{ strings.gamerId?.helperText }}</p>
  </StepCard>
</template>

<style scoped>
.gamer-id__row {
  display: flex;
  gap: var(--x-gap-form-col);
}

.gamer-id__input {
  flex: 1;
  min-width: 0;
  height: var(--x-size-input-m);
  padding: 0 var(--x-pad-surface-s);
  border: var(--border-weight-default) solid var(--x-border-input-default);
  border-radius: var(--x-radius-input-s);
  background: var(--x-bg-input-default);
  color: var(--x-text-body-default);
  display: block;
  transform: none;
  line-height: 1;
  outline: none;
  box-sizing: border-box;
}
.gamer-id__input::placeholder { color: var(--x-text-placeholder); }
.gamer-id__input:focus { border-color: var(--x-border-input-focused); }

.gamer-id__helper {
  margin: 0;
  color: var(--x-text-body-subtle);
}
</style>
