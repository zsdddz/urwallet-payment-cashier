<template>
  <div :dir="direction" id="app-root">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCheckoutStore } from '@/stores/checkout'

const store = useCheckoutStore()
const direction = computed(() => store.uiConfig.direction || 'ltr')
</script>
