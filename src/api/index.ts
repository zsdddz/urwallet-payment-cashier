import http from './http'
export { setTenantId } from './http'
import type {
  ApiResponse,
  SchemaResponse,
  StepSchema,
  SubmitPayload,
  UploadResponse
} from '@/types/schema'

export function getCheckoutInfo(orderNo: string, params?: Record<string, string>) {
  return http.get<ApiResponse<SchemaResponse>>(`/order/v1/checkout/${orderNo}`, { params })
}

export function submitCheckout(payload: SubmitPayload) {
  return http.post<ApiResponse<{ next_step?: StepSchema; done?: boolean; redirect_url?: string }>>(
    '/checkout/submit',
    payload
  )
}

export function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return http.post<ApiResponse<UploadResponse>>('/order/v1/checkout/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
