<template>
  <div class="field-wrapper">
    <div class="field-label-row">
      <span class="field-label">{{ element.label }}</span>
    </div>

    <div class="qr-container" @click="previewQr">
      <canvas ref="qrCanvas" class="qr-canvas" />
      <div class="qr-hint">{{ $t('checkout.enlargeHint') }}</div>
    </div>

    <p v-if="element.helper_text" class="helper-text">{{ element.helper_text }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import QRCode from 'qrcode'
import { showImagePreview } from 'vant'
import { useI18n } from 'vue-i18n'
import type { ElementSchema } from '@/types/schema'

const { t } = useI18n()

const props = defineProps<{
  element: ElementSchema
  modelValue: string
}>()

const qrCanvas = ref<HTMLCanvasElement | null>(null)
const qrDataUrl = ref('')

const qrContent = computed(
  () => props.modelValue || props.element.placeholder || props.element.value || ''
)

async function renderQr(value: string) {
  if (!value || !qrCanvas.value) return
  try {
    await QRCode.toCanvas(qrCanvas.value, value, {
      width: 200,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    })
    qrDataUrl.value = qrCanvas.value.toDataURL('image/png')
  } catch {
    // ignore
  }
}

function previewQr() {
  if (qrDataUrl.value) {
    showImagePreview({ images: [qrDataUrl.value], closeable: true })
  }
}

onMounted(() => {
  renderQr(qrContent.value)
})

watch(qrContent, (val) => renderQr(val))

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
.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f7f9fa;
  border-radius: 12px;
  cursor: pointer;
}
.qr-canvas {
  border-radius: 8px;
  display: block;
}
.qr-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #aaa;
}
.helper-text {
  margin: 8px 0 0;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}
</style>
