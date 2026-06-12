export interface ErrorLog {
  id: string
  message: string
  stack_trace: string
  level: 'error' | 'warning' | 'info' | 'debug'
  environment: string
  url: string
  user_agent: string
  ip_address: string
  metadata: any
  created_at: string
  resolved: number
}

export interface ErrorStats {
  total: number
  unresolved: number
  today: number
  by_level: Array<{ level: string; count: number }>
  recent_errors: ErrorLog[]
}

export interface PaginatedResponse {
  errors: ErrorLog[]
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
}

export interface ErrTraceConfig {
  apiKey?: string
  environment?: string
  release?: string
  tags?: string[]
}