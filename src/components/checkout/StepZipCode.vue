<script setup>
import { ref } from 'vue'
import StepCard from './StepCard.vue'
import { useStoreStrings } from '../../composables/useStoreStrings.js'

/** StepZipCode — "Zip Code" step (Figma node 2198:5138). Single text input. */
const strings = useStoreStrings()
const zipCode = ref('')
</script>

<template>
  <StepCard :title="strings.zipCode?.heading">
    <input
      v-model="zipCode"
      type="text"
      class="zip-code__input text-style-utility-label-regular"
      :placeholder="strings.zipCode?.inputLabel"
    />
  </StepCard>
</template>

<style scoped>
.zip-code__input {
  width: 100%;
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
.zip-code__input::placeholder { color: var(--x-text-placeholder); }
.zip-code__input:focus { border-color: var(--x-border-input-focused); }
</style>
