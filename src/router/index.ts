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
