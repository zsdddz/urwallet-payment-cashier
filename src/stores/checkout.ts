import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { StepSchema, OptionItem, UiConfig } from '@/types/schema'

export const useCheckoutStore = defineStore('checkout', () => {
  const currentStep = ref<StepSchema | null>(null)
  const stepHistory = ref<StepSchema[]>([])
  const stepData = ref<Record<string, string>>({})
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)
  const done = ref(false)
  const redirectUrl = ref<string | null>(null)

  const dynamicOptions = ref<OptionItem[]>([])
  const dynamicOptionsLoading = ref(false)

  const orderInfo = ref<{
    order_no?: string
    amount?: string
    currency?: string
    expire_time?: number
  }>({})

  const uiConfig = ref<UiConfig>({ language: 'en', direction: 'ltr' })

  function setStep(step: StepSchema) {
    currentStep.value = step
    stepHistory.value.push(step)
    stepData.value = {}
    error.value = null
  }

  function setFieldValue(fieldName: string, value: string) {
    stepData.value[fieldName] = value
  }

  function setError(msg: string | null) {
    error.value = msg
  }

  function setLoading(val: boolean) {
    loading.value = val
  }

  function setSubmitting(val: boolean) {
    submitting.value = val
  }

  function setDone(url?: string) {
    done.value = true
    redirectUrl.value = url || null
  }

  function setDynamicOptions(opts: OptionItem[]) {
    dynamicOptions.value = opts
    dynamicOptionsLoading.value = false
  }

  function setDynamicOptionsLoading(val: boolean) {
    dynamicOptionsLoading.value = val
  }

  function setOrderInfo(info: typeof orderInfo.value) {
    orderInfo.value = info
  }

  function setUiConfig(config: UiConfig) {
    uiConfig.value = config
  }

  function reset() {
    currentStep.value = null
    stepHistory.value = []
    stepData.value = {}
    loading.value = false
    submitting.value = false
    error.value = null
    done.value = false
    redirectUrl.value = null
    dynamicOptions.value = []
    dynamicOptionsLoading.value = false
    orderInfo.value = {}
  }

  return {
    currentStep,
    stepHistory,
    stepData,
    loading,
    submitting,
    error,
    done,
    redirectUrl,
    dynamicOptions,
    dynamicOptionsLoading,
    orderInfo,
    uiConfig,
    setStep,
    setFieldValue,
    setError,
    setLoading,
    setSubmitting,
    setDone,
    setDynamicOptions,
    setDynamicOptionsLoading,
    setOrderInfo,
    setUiConfig,
    reset
  }
})
