<template>
  <div class="field-wrapper">
    <div class="field-label-row">
      <span class="field-label">
        {{ element.label }}
        <span v-if="element.required" class="required-mark">*</span>
      </span>
      <van-popover
        v-if="element.tooltip"
        v-model:show="tooltipVisible"
        :content="element.tooltip"
        placement="top"
        theme="dark"
      >
        <template #reference>
          <span class="tooltip-icon" @click="tooltipVisible = !tooltipVisible">(?)</span>
        </template>
      </van-popover>
    </div>

    <div
      class="upload-zone"
      :class="{ 'has-image': previewUrl, 'error': !!errorMsg }"
      @click="triggerUpload"
    >
      <template v-if="uploading">
        <van-loading type="spinner" size="28px" color="#4a90e2" />
        <span class="upload-hint">{{ $t('common.uploading') }}</span>
      </template>
      <template v-else-if="previewUrl">
        <img :src="previewUrl" class="preview-img" />
        <div class="replace-mask">
          <van-icon name="photograph" size="20px" />
          <span>{{ $t('common.reload') }}</span>
        </div>
      </template>
      <template v-else>
        <van-icon name="photograph" size="32px" color="#c8c9cc" />
        <span class="upload-hint">{{ element.placeholder || $t('common.imageRequired', { field: element.label }) }}</span>
      </template>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
    <p v-if="element.helper_text" class="helper-text">{{ element.helper_text }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { uploadImage } from '@/api'
import type { ElementSchema } from '@/types/schema'

const { t } = useI18n()

const props = defineProps<{
  element: ElementSchema
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref(props.modelValue || '')
const uploading = ref(false)
const errorMsg = ref('')
const tooltipVisible = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    previewUrl.value = val || ''
  }
)

function triggerUpload() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (file.size > 10 * 1024 * 1024) {
    showToast(t('common.uploadFailed'))
    return
  }

  previewUrl.value = URL.createObjectURL(file)
  uploading.value = true
  errorMsg.value = ''

  try {
    const res = await uploadImage(file)
    const { url, thUrl } = res.data.data
    previewUrl.value = thUrl || url
    emit('update:modelValue', url)
  } catch (err: unknown) {
    previewUrl.value = ''
    errorMsg.value = err instanceof Error ? err.message : t('common.uploadFailed')
  } finally {
    uploading.value = false
    if (input) input.value = ''
  }
}

function validate(): boolean {
  if (props.element.required && !props.modelValue) {
    errorMsg.value = t('common.imageRequired', { field: props.element.label })
    return false
  }
  errorMsg.value = ''
  return true
}

defineExpose({ validate })
</script>

<style scoped>
.field-wrapper {
  margin-bottom: 20px;
}
.field-label-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.required-mark {
  color: #f44336;
  margin-left: 2px;
}
.tooltip-icon {
  margin-left: 6px;
  font-size: 12px;
  color: #999;
  cursor: pointer;
}
.upload-zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 160px;
  border: 2px dashed #dde1e7;
  border-radius: 12px;
  background: #fafafa;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
}
.upload-zone.has-image {
  border-style: solid;
  border-color: #4a90e2;
}
.upload-zone.error {
  border-color: #f44336;
}
.upload-hint {
  font-size: 13px;
  color: #aaa;
  text-align: center;
  padding: 0 16px;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.replace-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #fff;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}
.upload-zone:hover .replace-mask {
  opacity: 1;
}
.error-text {
  margin: 4px 0 0;
  font-size: 12px;
  color: #f44336;
}
.helper-text {
  margin: 4px 0 0;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}
</style>
