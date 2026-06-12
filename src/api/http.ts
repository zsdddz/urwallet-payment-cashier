import axios from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/schema'

let tenantId = ''
let orderId = ''
let countryCode = ''

export function setTenantId(id: string) {
  tenantId = id
}

export function setOrderId(id: string) {
  orderId = id
}

export function setCountryCode(code: string) {
  countryCode = code
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
    if (countryCode) {
      config.headers['X-Country-Code'] = countryCode
    }
    return config
  },
  (error) => Promise.reject(error)
)

export class ApiError extends Error {
  code: string
  constructor(msg: string, code: string) {
    super(msg)
    this.name = 'ApiError'
    this.code = code
  }
}

http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    if (!res.success) {
      return Promise.reject(new ApiError(res.msg || '请求失败', res.code))
    }
    return response
  },
  (error) => {
    const data = error.response?.data
    const msg = data?.msg || error.message || '网络错误，请稍后重试'
    const code = data?.code || ''
    return Promise.reject(new ApiError(msg, code))
  }
)

export default http
