import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'CheckoutEmpty',
    component: () => import('@/pages/Checkout.vue'),
    meta: { title: 'Payment' }
  },
  {
    path: '/:orderNo',
    name: 'Checkout',
    component: () => import('@/pages/Checkout.vue'),
    meta: { title: 'Payment' }
  },
  {
    path: '/:orderNo/success',
    name: 'OrderSuccess',
    component: () => import('@/pages/OrderSuccess.vue'),
    meta: { title: 'Payment Successful' }
  },
  {
    path: '/:orderNo/invalid',
    name: 'OrderInvalid',
    component: () => import('@/pages/OrderInvalid.vue'),
    meta: { title: 'Order Invalid' }
  },
  {
    path: '/:orderNo/timeout',
    name: 'OrderTimeout',
    component: () => import('@/pages/OrderTimeout.vue'),
    meta: { title: 'Order Timed Out' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
})

export default router
