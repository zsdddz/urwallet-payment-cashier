<template>
  <div class="field-wrapper">
    <div v-if="element.label" class="field-label-row">
      <span class="field-label">{{ element.label }}</span>
    </div>

    <div class="deeplink-list">
      <button
        v-for="opt in element.options || []"
        :key="opt.value"
        class="deeplink-btn"
        :disabled="clickedLinks.has(opt.value)"
        @click="handleDeeplink(opt)"
      >
        <img v-if="opt.icon_url" :src="opt.icon_url" class="app-icon" />
        <span class="btn-label">{{ opt.label }}</span>
        <van-icon name="arrow" size="16px" color="#fff" />
      </button>
    </div>

    <transition name="fade">
      <div v-if="showFallback" class="fallback-section">
        <p class="fallback-title">{{ $t('common.appNotInstalled') }}</p>
        <div class="fallback-actions">
          <van-button size="small" plain @click="showQrFallback = true">
            {{ $t('common.scanToOpen') }}
          </van-button>
          <van-button size="small" plain @click="goToStore">
            {{ $t('common.goToStore') }}
          </van-button>
        </div>
      </div>
    </transition>

    <van-popup v-model:show="showQrFallback" position="bottom" round :style="{ padding: '24px' }">
      <p style="text-align: center; font-size: 15px; font-weight: 600; margin-bottom: 16px">
        {{ $t('common.scanToOpen') }}
      </p>
      <div style="display: flex; justify-content: center">
        <canvas ref="fallbackQrCanvas" />
      </div>
    </van-popup>

    <p v-if="element.helper_text" class="helper-text">{{ element.helper_text }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import QRCode from 'qrcode'
import type { ElementSchema, OptionItem } from '@/types/schema'

const props = defineProps<{
  element: ElementSchema
  modelValue: string
}>()

const clickedLinks = ref<Set<string>>(new Set())
const showFallback = ref(false)
const showQrFallback = ref(false)
const fallbackQrCanvas = ref<HTMLCanvasElement | null>(null)
const currentDeeplinkUrl = ref('')

function handleDeeplink(opt: OptionItem) {
  clickedLinks.value.add(opt.value)
  currentDeeplinkUrl.value = opt.value

  window.location.href = opt.value

  setTimeout(() => {
    showFallback.value = true
  }, 2500)
}

function goToStore() {
  const ua = navigator.userAgent
  if (/android/i.test(ua)) {
    window.open('https://play.google.com/store/apps', '_blank')
  } else {
    window.open('https://apps.apple.com', '_blank')
  }
}

watch(showQrFallback, async (val) => {
  if (val && currentDeeplinkUrl.value) {
    await nextTick()
    if (fallbackQrCanvas.value) {
      await QRCode.toCanvas(fallbackQrCanvas.value, currentDeeplinkUrl.value, {
        width: 200,
        margin: 2
      })
    }
  }
})

function validate(): boolean {
  return true
}

defineExpose({ validate })
</script>

<style scoped>
.field-wrapper {
  margin-bottom: 20px;
}
.field-label-row {
  margin-bottom: 12px;
}
.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.deeplink-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.deeplink-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px 20px;
  background: linear-gradient(135deg, #4a90e2, #357abd);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  transition: opacity 0.2s, transform 0.1s;
}
.deeplink-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}
.deeplink-btn:disabled {
  opacity: 0.6;
  cursor: default;
}
.app-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: contain;
}
.btn-label {
  flex: 1;
  text-align: left;
}
.fallback-section {
  margin-top: 16px;
  padding: 14px 16px;
  background: #fff8e1;
  border-radius: 10px;
  text-align: center;
}
.fallback-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}
.fallback-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.helper-text {
  margin: 8px 0 0;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
