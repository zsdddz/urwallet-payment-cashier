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

    <div v-if="isLoading" class="loading-state">
      <van-loading type="spinner" size="20px" />
      <span>{{ $t('common.loading') }}</span>
    </div>

    <div v-else-if="options.length === 0" class="empty-state">
      <van-empty :description="$t('common.noOptions')" image-size="60" />
    </div>

    <van-radio-group v-else v-model="localValue" @change="onChange">
      <div
        v-for="opt in options"
        :key="opt.value"
        class="radio-item"
        :class="{ active: localValue === opt.value }"
        @click="selectOption(opt.value)"
      >
        <div class="radio-item-left">
          <img v-if="opt.icon_url" :src="opt.icon_url" class="radio-icon" />
          <span class="radio-label">{{ opt.label }}</span>
        </div>
        <van-radio :name="opt.value" />
      </div>
    </van-radio-group>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
    <p v-if="element.helper_text" class="helper-text">{{ element.helper_text }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ElementSchema, OptionItem } from '@/types/schema'
import { useCheckoutStore } from '@/stores/checkout'

const { t } = useI18n()

const props = defineProps<{
  element: ElementSchema
  modelValue: string
  dynamicOptions?: OptionItem[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const store = useCheckoutStore()
const localValue = ref(props.modelValue || '')
const errorMsg = ref('')
const tooltipVisible = ref(false)

const isLoading = computed(() => props.element.is_dynamic && store.dynamicOptionsLoading)

const options = computed<OptionItem[]>(() => {
  if (props.element.is_dynamic) {
    return props.dynamicOptions || store.dynamicOptions || []
  }
  return props.element.options || []
})

watch(
  () => props.modelValue,
  (val) => {
    localValue.value = val || ''
  }
)

function selectOption(val: string) {
  localValue.value = val
  emit('update:modelValue', val)
  errorMsg.value = ''
}

function onChange(val: string) {
  emit('update:modelValue', val)
  errorMsg.value = ''
}

function validate(): boolean {
  if (props.element.required && !localValue.value) {
    errorMsg.value = t('common.selectRequired', { field: props.element.label })
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
  margin-bottom: 12px;
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
.radio-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #f7f9fa;
  border-radius: 10px;
  margin-bottom: 10px;
  border: 1.5px solid transparent;
  transition: border-color 0.2s, background 0.2s;
}
.radio-item.active {
  background: #f0f6ff;
  border-color: #4a90e2;
}
.radio-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.radio-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: contain;
}
.radio-label {
  font-size: 14px;
  color: #333;
}
.loading-state {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  color: #999;
  font-size: 14px;
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
