<script setup>
import SurfaceDemo from './SurfaceDemo.vue'

defineProps({
  responsive: { type: Boolean, default: false },
})
</script>

<template>
  <SurfaceDemo preset="sheet" :responsive="responsive" />
</template>
