<script setup>
import ListItem from './ListItem.vue'
import BaseSheet from './base/BaseSheet.vue'
import { useLocale } from '../composables/useLocale.js'

/**
 * LanguageSelectorSheet — "Select Language" picker (Figma 4016:6248). Flat list
 * of the languages available in the current region (English always first);
 * the active language is tinted + check-marked. BaseSheet chrome — same as
 * RegionSelectorSheet, but the panel hugs its content (`size-hint="content"`,
 * the list is short) instead of a fixed 85%.
 */
defineProps({
  isMobile: { type: Boolean, default: true },
})

const { languageSelectorOpen, closeLanguageSelector, availableLanguages, language, setLanguage, ui } = useLocale()

function pick (code) {
  setLanguage(code)
  closeLanguageSelector()
}
</script>

<template>
  <BaseSheet
    :open="languageSelectorOpen"
    :is-mobile="isMobile"
    :title="ui.selectLanguage"
    size-hint="content"
    :duration="{ enter: 350, leave: 200 }"
    data-component="locale-selector-sheets"
    data-state="open"
    @close="closeLanguageSelector()"
  >
    <ListItem
      v-for="l in availableLanguages"
      :key="l.code"
      :selected="l.code === language"
      :trailing-icon="l.code === language ? 'check_circle' : null"
      class="selector__row"
      dir="auto"
      @click="pick(l.code)"
    >{{ l.endonym }}</ListItem>
  </BaseSheet>
</template>

<style scoped>
.selector__row {
  --li-radius: var(--x-radius-container-s);
  --li-bg-hover: var(--x-bg-indicator-neutral-default);
  --li-color-hover: var(--x-text-body-default);
}
</style>
