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
    <van-field
      v-model="localValue"
      type="digit"
      :placeholder="element.placeholder || ''"
      :error-message="errorMsg"
      clearable
      @blur="validate"
      @update:model-value="onInput"
    />
    <p v-if="element.helper_text" class="helper-text">{{ element.helper_text }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ElementSchema } from '@/types/schema'

const { t } = useI18n()

const props = defineProps<{
  element: ElementSchema
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const localValue = ref(props.modelValue || '')
const errorMsg = ref('')
const tooltipVisible = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    localValue.value = val || ''
  }
)

function onInput(val: string) {
  localValue.value = val.replace(/\D/g, '')
  emit('update:modelValue', localValue.value)
  if (errorMsg.value) validate()
}

function validate(): boolean {
  if (props.element.required && !localValue.value.trim()) {
    errorMsg.value = t('common.required', { field: props.element.label })
    return false
  }
  if (props.element.regex && localValue.value) {
    const reg = new RegExp(props.element.regex)
    if (!reg.test(localValue.value)) {
      errorMsg.value = t('common.formatError', { field: props.element.label })
      return false
    }
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
  margin-bottom: 8px;
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
.helper-text {
  margin: 4px 12px 0;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}
</style>
