<template>
  <teleport to="body">
    <transition name="interceptor-fade">
      <div v-if="show" class="interceptor-overlay">
        <div class="interceptor-card">
          <h3 class="interceptor-title">{{ interceptor.title }}</h3>
          <p v-if="interceptor.description" class="interceptor-desc">
            {{ interceptor.description }}
          </p>

          <div class="interceptor-fields">
            <component
              v-for="(el, index) in interceptor.elements"
              :key="`interceptor-${el.field_name}-${index}`"
              :is="componentMap[el.ui_type]"
              :element="el"
              :model-value="formData[el.field_name] || ''"
              :ref="(ins: FieldInstance) => setFieldRef(el.field_name, ins)"
              @update:model-value="(val: string) => { formData[el.field_name] = val }"
            />
          </div>

          <p v-if="error" class="interceptor-error">{{ error }}</p>

          <van-button
            type="primary"
            block
            round
            :loading="submitting"
            :loading-text="$t('common.processing')"
            class="interceptor-btn"
            @click="handleConfirm"
          >
            {{ $t('common.confirm') }}
          </van-button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { Component } from 'vue'
import { submitCheckout } from '@/api'
import TextField from '@/components/dynamic/TextField.vue'
import NumberField from '@/components/dynamic/NumberField.vue'
import PasswordField from '@/components/dynamic/PasswordField.vue'
import type { InterceptorSchema, UiType } from '@/types/schema'

interface FieldInstance {
  validate: () => boolean
}

const props = defineProps<{
  show: boolean
  interceptor: InterceptorSchema
  step: number
}>()

const emit = defineEmits<{
  (e: 'confirmed'): void
}>()

const componentMap: Partial<Record<UiType, Component>> = {
  TEXT: TextField,
  NUMBER: NumberField,
  PASSWORD: PasswordField,
  INPUT: TextField
}

const formData = reactive<Record<string, string>>({})
const fieldRefs = ref<Record<string, FieldInstance>>({})
const submitting = ref(false)
const error = ref('')

function setFieldRef(fieldName: string, instance: FieldInstance | null) {
  if (instance) fieldRefs.value[fieldName] = instance
}

async function handleConfirm() {
  const allValid = props.interceptor.elements.every((el) => {
    const ref = fieldRefs.value[el.field_name]
    return ref ? ref.validate() : true
  })
  if (!allValid) return

  submitting.value = true
  error.value = ''

  try {
    await submitCheckout({
      action_type: props.interceptor.action_type,
      step: props.step,
      step_data: { ...formData }
    })

    const cacheKey = props.interceptor.cache_key
    const firstInputEl = props.interceptor.elements[0]
    const cacheValue = firstInputEl ? (formData[firstInputEl.field_name] || '1') : '1'
    localStorage.setItem(cacheKey, cacheValue)

    emit('confirmed')
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Submission failed'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.interceptor-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.interceptor-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 20px;
  padding: 28px 24px 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.interceptor-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.interceptor-desc {
  font-size: 14px;
  color: #888;
  line-height: 1.6;
  margin: 0 0 20px;
}

.interceptor-fields {
  margin-bottom: 8px;
}

.interceptor-error {
  font-size: 13px;
  color: #f44336;
  margin: 0 0 12px;
  padding: 10px 12px;
  background: #fdecea;
  border-radius: 8px;
}

.interceptor-btn {
  height: 48px;
  font-size: 15px;
  font-weight: 600;
}

.interceptor-fade-enter-active,
.interceptor-fade-leave-active {
  transition: opacity 0.25s ease;
}
.interceptor-fade-enter-from,
.interceptor-fade-leave-to {
  opacity: 0;
}
</style>
