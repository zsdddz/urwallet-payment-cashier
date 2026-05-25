export type UiType =
  | 'TEXT'
  | 'NUMBER'
  | 'PASSWORD'
  | 'RADIO_GROUP'
  | 'QR_IMAGE'
  | 'TEXT_COPY'
  | 'PLATFORM_LOGOS'
  | 'IMAGE_UPLOAD'
  | 'DEEPLINK_GROUP'
  | 'INPUT'

export type NoticeType = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'

export type UiLayout = 'STANDARD_PAGE' | 'BOTTOM_DRAWER'

export type ActionType =
  | 'SUBMIT_PAYER_INFO'
  | 'SUBMIT_UTR'
  | 'SUBMIT_PROOF_IMAGE'
  | 'SUBMIT_HASH'
  | 'ASYNC_SUBMIT_PAYER'

export interface OptionItem {
  label: string
  value: string
  icon_url?: string
}

export interface NoticeSchema {
  type: NoticeType
  content: string
  show_icon?: boolean
}

export interface ElementSchema {
  field_name: string
  label: string
  ui_type: UiType
  placeholder?: string
  helper_text?: string
  tooltip?: string
  required?: boolean
  regex?: string
  is_dynamic?: boolean
  options?: OptionItem[]
  value?: string
  source?: string
}

export interface InterceptorSchema {
  cache_key: string
  title: string
  description?: string
  action_type: ActionType
  elements: ElementSchema[]
}

export interface StepSchema {
  step: number
  action_type: ActionType
  title: string
  description?: string
  notice?: NoticeSchema
  elements: ElementSchema[]
  submit_text?: string
  ui_layout?: UiLayout
  interceptor?: InterceptorSchema
}

export interface UiConfig {
  language: string
  direction: 'ltr' | 'rtl'
}

export interface ApiResponse<T = unknown> {
  code: string
  msg: string
  data: T
  timestamp: number
  traceId: string
  success: boolean
}

export interface SubmitPayload {
  action_type: ActionType
  step: number
  step_data: Record<string, string>
}

export interface UploadResponse {
  url: string
  thUrl: string
}

export interface SchemaResponse {
  orderInfo?: {
    orderId?: string
    orderAmount?: number
    currency?: string
    expireTime?: number
    collectionAccount?: string
  }
  uiConfig: UiConfig
  checkoutSchema: StepSchema[]
}
