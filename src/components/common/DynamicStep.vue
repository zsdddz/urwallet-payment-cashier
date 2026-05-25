<template>
  <div class="dynamic-step">
    <NoticeBar :notice="step.notice" />

    <div class="step-header">
      <h2 class="step-title">{{ step.title }}</h2>
      <p v-if="step.description" class="step-desc">{{ step.description }}</p>
    </div>

    <div class="elements-container">
      <component
        v-for="(el, index) in step.elements"
        :key="`${el.field_name}-${index}`"
        :is="componentMap[el.ui_type]"
        :element="el"
        :model-value="formData[el.field_name] || ''"
        :ref="(ins: FieldInstance) => setFieldRef(el.field_name, ins)"
        @update:model-value="(val: string) => onFieldUpdate(el.field_name, val)"
      />
    </div>

    <div class="submit-area">
      <van-button
        type="primary"
        block
        round
        :loading="submitting"
        :loading-text="$t('common.processing')"
        class="submit-btn"
        @click="handleSubmit"
      >
        {{ step.submit_text || submitText || $t('checkout.submit') }}
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { Component } from 'vue'
import NoticeBar from './NoticeBar.vue'
import TextField from '@/components/dynamic/TextField.vue'
import NumberField from '@/components/dynamic/NumberField.vue'
import PasswordField from '@/components/dynamic/PasswordField.vue'
import RadioGroupField from '@/components/dynamic/RadioGroupField.vue'
import QrImageField from '@/components/dynamic/QrImageField.vue'
import TextCopyField from '@/components/dynamic/TextCopyField.vue'
import PlatformLogos from '@/components/dynamic/PlatformLogos.vue'
import ImageUpload from '@/components/dynamic/ImageUpload.vue'
import DeeplinkGroup from '@/components/dynamic/DeeplinkGroup.vue'
import type { StepSchema, UiType } from '@/types/schema'

interface FieldInstance {
  validate: () => boolean
}

const props = defineProps<{
  step: StepSchema
  submitting: boolean
  submitText?: string
}>()

const emit = defineEmits<{
  (e: 'submit', stepData: Record<string, string>): void
}>()

const componentMap: Record<UiType, Component> = {
  TEXT: TextField,
  NUMBER: NumberField,
  PASSWORD: PasswordField,
  RADIO_GROUP: RadioGroupField,
  QR_IMAGE: QrImageField,
  TEXT_COPY: TextCopyField,
  PLATFORM_LOGOS: PlatformLogos,
  IMAGE_UPLOAD: ImageUpload,
  DEEPLINK_GROUP: DeeplinkGroup,
  INPUT: TextField
}

const formData = reactive<Record<string, string>>({})
const fieldRefs = ref<Record<string, FieldInstance>>({})

watch(
  () => props.step,
  (newStep) => {
    Object.keys(formData).forEach((k) => delete formData[k])
    fieldRefs.value = {}
    newStep.elements.forEach((el) => {
      if (el.value) formData[el.field_name] = el.value
    })
  },
  { immediate: true }
)

function setFieldRef(fieldName: string, instance: FieldInstance | null) {
  if (instance) {
    fieldRefs.value[fieldName] = instance
  }
}

function onFieldUpdate(fieldName: string, val: string) {
  formData[fieldName] = val
}

function handleSubmit() {
  const inputTypes: UiType[] = ['TEXT', 'NUMBER', 'PASSWORD', 'RADIO_GROUP', 'IMAGE_UPLOAD', 'INPUT']
  const inputFields = props.step.elements.filter((el) => inputTypes.includes(el.ui_type))

  let allValid = true
  for (const el of inputFields) {
    const ref = fieldRefs.value[el.field_name]
    if (ref && !ref.validate()) {
      allValid = false
    }
  }

  if (!allValid) return

  emit('submit', { ...formData })
}
</script>

<style scoped>
.dynamic-step {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 0 0 32px;
}

.step-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--gray-100);
}

.step-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.3;
  margin: 0 0 6px;
}

.step-desc {
  font-size: 13px;
  color: var(--gray-400);
  line-height: 1.6;
  margin: 0;
}

.elements-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.submit-area {
  margin-top: 28px;
  padding: 0 0 env(safe-area-inset-bottom, 0);
}

.submit-btn {
  height: 54px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: var(--radius-full) !important;
}
</style>
