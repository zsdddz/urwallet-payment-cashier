<template>
  <div class="countdown" :class="{ warning: isWarning }">
    <van-icon name="clock-o" size="13px" />
    <span>{{ display }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  expireTime: number
}>()

const remaining = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const isWarning = computed(() => remaining.value > 0 && remaining.value <= 300)

const display = computed(() => {
  if (remaining.value <= 0) return t('checkout.expired')
  const m = Math.floor(remaining.value / 60).toString().padStart(2, '0')
  const s = (remaining.value % 60).toString().padStart(2, '0')
  return t('checkout.remaining', { m, s })
})

function tick() {
  const now = Math.floor(Date.now() / 1000)
  const expSec = Math.floor(props.expireTime / 1000)
  remaining.value = Math.max(0, expSec - now)
  if (remaining.value <= 0 && timer) {
    clearInterval(timer)
  }
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.countdown {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-full);
  padding: 3px 10px 3px 8px;
}

.countdown.warning {
  color: #FDE68A;
  background: rgba(253, 230, 138, 0.18);
  animation: pulse-warning 1.5s ease-in-out infinite;
}

@keyframes pulse-warning {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.65; }
}
</style>
