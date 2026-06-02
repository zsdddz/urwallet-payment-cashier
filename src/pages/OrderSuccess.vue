<template>
  <div class="status-page">
    <div class="status-icon-wrap success">
      <van-icon name="checked" size="44px" color="#0E9F6E" />
    </div>
    <h3 class="status-title">{{ $t('orderStatus.successTitle') }}</h3>
    <p class="status-desc">{{ $t('orderStatus.successDesc') }}</p>
    <div v-if="store.orderInfo.amount" class="order-summary">
      <span class="summary-currency">{{ store.orderInfo.currency || 'USD' }}</span>
      <span class="summary-amount">{{ store.orderInfo.amount }}</span>
    </div>
    <p v-if="store.orderInfo.order_no" class="order-no">#{{ store.orderInfo.order_no }}</p>
  </div>
</template>

<script setup lang="ts">
import { useCheckoutStore } from '@/stores/checkout'

const store = useCheckoutStore()
</script>

<style scoped>
.status-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  gap: 0;
  text-align: center;
  background: var(--surface-bg);
}

.status-icon-wrap {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.status-icon-wrap.success {
  background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
  box-shadow: 0 8px 24px rgba(14, 159, 110, 0.22);
}

.status-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 10px;
}

.status-desc {
  font-size: 14px;
  color: var(--gray-400);
  margin: 0 0 28px;
  line-height: 1.6;
  max-width: 260px;
}

.order-summary {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 8px;
}

.summary-currency {
  font-size: 16px;
  font-weight: 500;
  color: var(--gray-600);
}

.summary-amount {
  font-size: 32px;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -0.5px;
}

.order-no {
  font-size: 12px;
  color: var(--gray-400);
  font-family: 'SF Mono', 'Fira Code', monospace;
  margin: 0;
}
</style>
