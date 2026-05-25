<template>
  <div ref="container" :style="{ width: size, height: size }" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import lottie from 'lottie-web'
import type { AnimationItem } from 'lottie-web'

const props = withDefaults(
  defineProps<{
    animationData: object
    size?: string
    loop?: boolean
    autoplay?: boolean
  }>(),
  {
    size: '120px',
    loop: true,
    autoplay: true
  }
)

const container = ref<HTMLDivElement | null>(null)
let anim: AnimationItem | null = null

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: props.loop,
    autoplay: props.autoplay,
    animationData: props.animationData
  })
})

onUnmounted(() => {
  anim?.destroy()
})
</script>
