<template>
  <div class="field-wrapper">
    <div class="field-label-row">
      <span class="field-label">{{ element.label }}</span>
    </div>

    <div class="copy-box">
      <span class="copy-value">{{ modelValue || element.value || element.placeholder || '-' }}</span>
      <button class="copy-btn" @click="handleCopy">
        <van-icon name="orders-o" />
        <span>{{ $t('common.copy') }}</span>
      </button>
    </div>

    <p v-if="element.helper_text" class="helper-text">{{ element.helper_text }}</p>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import type { ElementSchema } from '@/types/schema'

const { t } = useI18n()

const props = defineProps<{
  element: ElementSchema
  modelValue: string
}>()

async function handleCopy() {
  const text = props.modelValue || props.element.value || props.element.placeholder || ''
  try {
    await navigator.clipboard.writeText(text)
    showToast({ message: t('common.copied'), position: 'bottom', duration: 1500 })
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    showToast({ message: t('common.copied'), position: 'bottom', duration: 1500 })
  }
}

function validate(): boolean {
  return true
}

defineExpose({ validate })
</script>

<style scoped>
.field-wrapper {
  margin-bottom: 4px;
}

.field-label-row {
  margin-bottom: 8px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-400);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.copy-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--brand-primary-light);
  border: 1.5px solid rgba(26, 86, 219, 0.15);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  gap: 12px;
  transition: border-color 0.2s;
}

.copy-box:hover {
  border-color: rgba(26, 86, 219, 0.30);
}

.copy-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--brand-primary-dark);
  word-break: break-all;
  flex: 1;
  letter-spacing: 0.3px;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--brand-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s, transform 0.1s;
}

.copy-btn:active {
  background: var(--brand-primary-dark);
  transform: scale(0.97);
}

.helper-text {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--gray-400);
  line-height: 1.4;
}
</style>
