<template>
  <div class="page-container">

    <!-- 初始化加载页：用户进入后立即展示，直到 API 响应完成 -->
    <transition name="init-fade">
      <div v-if="initializing" class="init-page">
        <LottiePlayer :animation-data="loadingAnimData" size="160px" />
        <p class="init-title">{{ $t('checkout.initializing') }}</p>
        <p class="init-desc">{{ $t('checkout.initializingDesc') }}</p>
        <p v-if="initError" class="init-error">
          {{ initError }}
          <span class="init-retry" @click="retryInit">{{ $t('common.reload') }}</span>
        </p>
      </div>
    </transition>

    <!-- 收银台主内容区：初始化完成后展示 -->
    <transition name="content-slide">
      <div v-if="!initializing" class="main-content">

        <div v-if="orderNotFound" class="error-page">
          <div class="error-icon-wrap">
            <van-icon name="warning-o" size="40px" color="#DC2626" />
          </div>
          <h3 class="error-title">{{ $t('checkout.orderNotFound') }}</h3>
          <p class="error-msg">{{ $t('checkout.orderNotFoundDesc') }}</p>
        </div>

        <div v-else-if="invalidOrder" class="error-page">
          <div class="error-icon-wrap">
            <van-icon name="warning-o" size="40px" color="#DC2626" />
          </div>
          <h3 class="error-title">{{ $t('checkout.invalidOrder') }}</h3>
          <p class="error-msg">{{ $t('checkout.invalidOrderDesc') }}</p>
        </div>

        <div v-else-if="store.done" class="done-page">
          <div class="done-icon-wrap">
            <van-icon name="checked" size="44px" color="#0E9F6E" />
          </div>
          <h3 class="done-title">{{ $t('checkout.paymentSuccess') }}</h3>
          <p class="done-desc">{{ $t('checkout.paymentSuccessDesc') }}</p>
          <van-button type="primary" round block style="max-width:280px;" @click="handleRedirect">
            {{ $t('checkout.done') }}
          </van-button>
        </div>

        <div v-else-if="store.error && !store.currentStep" class="error-page">
          <div class="error-icon-wrap">
            <van-icon name="warning-o" size="40px" color="#DC2626" />
          </div>
          <p class="error-msg">{{ store.error }}</p>
          <van-button plain round @click="loadSchema">{{ $t('common.reload') }}</van-button>
        </div>

        <template v-else-if="store.currentStep">
          <div class="order-bar" v-if="store.orderInfo.amount">
            <div class="order-label">{{ $t('checkout.paymentAmount') }}</div>
            <div class="order-amount">
              <span class="currency">{{ store.orderInfo.currency || 'USD' }}</span>
              <span class="amount">{{ store.orderInfo.amount }}</span>
            </div>
            <div class="order-meta">
              <span v-if="store.orderInfo.order_no" class="order-no">
                #{{ store.orderInfo.order_no }}
              </span>
              <CountdownTimer
                v-if="store.orderInfo.expire_time"
                :expire-time="store.orderInfo.expire_time"
                class="countdown"
              />
            </div>
          </div>
          <div class="security-badge">
            <van-icon name="shield-o" size="12px" />
            <span>{{ $t('checkout.securePayment') }}</span>
          </div>

          <div class="page-body" :class="{ blurred: showInterceptor }">
            <transition name="slide-up" mode="out-in">
              <DynamicStep
                :key="store.currentStep.step"
                :step="store.currentStep"
                :submitting="store.submitting"
                @submit="handleSubmit"
              />
            </transition>
          </div>

          <transition name="fade">
            <div v-if="store.error" class="inline-error">
              <van-icon name="warning-o" size="16px" />
              <span>{{ store.error }}</span>
            </div>
          </transition>

          <InterceptorDrawer
            v-if="store.currentStep.interceptor && showInterceptor"
            :show="showInterceptor"
            :interceptor="store.currentStep.interceptor"
            :step="store.currentStep.step"
            @confirmed="onInterceptorConfirmed"
          />
        </template>

      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DynamicStep from '@/components/common/DynamicStep.vue'
import CountdownTimer from '@/components/common/CountdownTimer.vue'
import InterceptorDrawer from '@/components/common/InterceptorDrawer.vue'
import LottiePlayer from '@/components/common/LottiePlayer.vue'
import { useCheckoutStore } from '@/stores/checkout'
import { i18n } from '@/i18n'
import { getCheckoutInfo, submitCheckout, setTenantId } from '@/api'
import loadingAnimData from '@/assets/animations/loading.json'

const store = useCheckoutStore()
const route = useRoute()
const { t } = useI18n()

const initializing = ref(true)
const initError = ref('')
const showInterceptor = ref(false)
const orderNotFound = ref(false)
const invalidOrder = ref(false)

let resolvedOrderId = ''

function decodeToken(token: string): { tenantId: string; orderId: string } | null {
  try {
    const decoded = atob(token)
    const atIndex = decoded.indexOf('@')
    if (atIndex <= 0 || atIndex === decoded.length - 1) return null
    return {
      tenantId: decoded.slice(0, atIndex),
      orderId: decoded.slice(atIndex + 1)
    }
  } catch {
    return null
  }
}

onMounted(() => {
  store.reset()
  const token = route.params.orderNo as string | undefined
  if (!token) {
    orderNotFound.value = true
    initializing.value = false
    return
  }
  const parsed = decodeToken(token)
  if (!parsed) {
    invalidOrder.value = true
    initializing.value = false
    return
  }
  setTenantId(parsed.tenantId)
  resolvedOrderId = parsed.orderId
  loadSchema()
})

async function loadSchema() {
  initError.value = ''
  store.setError(null)
  try {
    const params = route.query as Record<string, string>
    const res = await getCheckoutInfo(resolvedOrderId, params)
    const data = res.data.data

    if (data.ui_config) {
      store.setUiConfig(data.ui_config)
      i18n.global.locale.value = data.ui_config.language as 'en' | 'ar' | 'hi'
    }

    if (data.order_info) {
      store.setOrderInfo({
        order_no: data.order_info.order_no,
        amount: data.order_info.amount,
        currency: data.order_info.currency,
        expire_time: data.order_info.expire_time
      })
    }

    const firstStep = data.checkout_schema?.[0]
    if (firstStep) {
      store.setStep(firstStep)
      checkInterceptor(firstStep)
    }

    initializing.value = false
  } catch (err: unknown) {
    initError.value = err instanceof Error ? err.message : t('checkout.loadFailed')
  }
}

function retryInit() {
  loadSchema()
}

function checkInterceptor(step: typeof store.currentStep) {
  if (!step?.interceptor) return
  const cached = localStorage.getItem(step.interceptor.cache_key)
  if (!cached) {
    showInterceptor.value = true
  }
}

function onInterceptorConfirmed() {
  showInterceptor.value = false
}

async function handleSubmit(stepData: Record<string, string>) {
  if (!store.currentStep) return
  store.setSubmitting(true)
  store.setError(null)

  const cachedKey = store.currentStep.interceptor?.cache_key
  const payload: Record<string, string> = { ...stepData }
  if (cachedKey) {
    const cachedVal = localStorage.getItem(cachedKey)
    if (cachedVal && !payload[cachedKey]) {
      payload[cachedKey] = cachedVal
    }
  }

  try {
    const res = await submitCheckout({
      action_type: store.currentStep.action_type,
      step: store.currentStep.step,
      step_data: payload
    })
    const result = res.data.data
    if (result.done) {
      store.setDone(result.redirect_url)
    } else if (result.next_step) {
      store.setStep(result.next_step)
      checkInterceptor(result.next_step)
    }
  } catch (err: unknown) {
    store.setError(err instanceof Error ? err.message : t('checkout.submitFailed'))
  } finally {
    store.setSubmitting(false)
  }
}

function handleRedirect() {
  if (store.redirectUrl) {
    window.location.href = store.redirectUrl
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: var(--surface-bg);
  position: relative;
  overflow: hidden;
}

/* ========== 初始化页 ========== */
.init-page {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  background: var(--surface-bg);
  z-index: 10;
}

.init-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--gray-800);
  margin: 4px 0 6px;
  text-align: center;
}

.init-desc {
  font-size: 13px;
  color: var(--gray-400);
  margin: 0;
  text-align: center;
  line-height: 1.5;
}

.init-error {
  margin-top: 20px;
  font-size: 13px;
  color: var(--color-error);
  text-align: center;
  padding: 10px 14px;
  background: #FEF2F2;
  border-radius: var(--radius-md);
}

.init-retry {
  display: block;
  margin-top: 8px;
  color: var(--brand-primary);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

/* 初始化页淡出 */
.init-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.init-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

/* ========== 主内容区 ========== */
.main-content {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--surface-bg);
}

.content-slide-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.content-slide-enter-from {
  opacity: 0;
  transform: translateY(18px);
}

/* ========== 成功页 ========== */
.done-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  gap: 0;
  text-align: center;
  background: var(--surface-bg);
}

.done-icon-wrap {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(14, 159, 110, 0.22);
}

.done-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 10px;
}

.done-desc {
  font-size: 14px;
  color: var(--gray-400);
  margin: 0 0 36px;
  line-height: 1.6;
  max-width: 260px;
}

/* ========== 错误页 ========== */
.error-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  gap: 16px;
  text-align: center;
}

.error-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #FEF2F2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.error-msg {
  font-size: 14px;
  color: var(--gray-600);
  margin: 0;
  line-height: 1.6;
  max-width: 280px;
}

/* ========== 订单栏 ========== */
.order-bar {
  background: linear-gradient(135deg, #1A56DB 0%, #1045B4 60%, #0D3799 100%);
  padding: 24px 24px 28px;
  color: #fff;
  position: relative;
  overflow: hidden;
}

/* 装饰光晕 */
.order-bar::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  pointer-events: none;
}

.order-bar::after {
  content: '';
  position: absolute;
  bottom: -60px;
  left: 30px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  pointer-events: none;
}

.order-label {
  font-size: 12px;
  opacity: 0.65;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.order-amount {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 10px;
}

.currency {
  font-size: 18px;
  font-weight: 500;
  opacity: 0.80;
  align-self: flex-start;
  margin-top: 6px;
}

.amount {
  font-size: 42px;
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1;
}

.order-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.order-no {
  font-size: 12px;
  opacity: 0.55;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.countdown {
  /* countdown 组件自带样式 */
}

/* ========== 安全徽章 ========== */
.security-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 16px;
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-100);
  font-size: 11px;
  color: var(--gray-400);
  letter-spacing: 0.3px;
}

/* ========== 主表单区 ========== */
.page-body {
  flex: 1;
  padding: 24px 20px 0;
  overflow-y: auto;
  transition: filter 0.3s;
}

.page-body.blurred {
  filter: blur(4px);
  pointer-events: none;
  user-select: none;
}

/* ========== 行内错误提示 ========== */
.inline-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  color: var(--color-error);
  font-size: 13px;
  background: #FEF2F2;
  border-top: 1px solid #FECACA;
}

/* ========== 过渡动画 ========== */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
