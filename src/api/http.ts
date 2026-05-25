import axios from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/schema'

let tenantId = ''
let orderId = ''

export function setTenantId(id: string) {
  tenantId = id
}

export function setOrderId(id: string) {
  orderId = id
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId
    }
    if (orderId) {
      config.headers['X-Order-Id'] = orderId
    }
    return config
  },
  (error) => Promise.reject(error)
)

http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    if (!res.success) {
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return response
  },
  (error) => {
    const msg = error.response?.data?.msg || error.message || '网络错误，请稍后重试'
    return Promise.reject(new Error(msg))
  }
)

export default http
