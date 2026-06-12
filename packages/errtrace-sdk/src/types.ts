export type LogLevel = 'error' | 'warning' | 'info' | 'debug'

export interface ErrTraceOptions {
  /** Your ErrTrace dashboard URL */
  dsn?: string
  /** API key for authentication */
  apiKey?: string
  /** Environment name (production, staging, development) */
  environment?: string
  /** Application version/release */
  release?: string
  /** Tags to attach to all errors */
  tags?: string[]
  /** Enable/disable automatic error capturing */
  enabled?: boolean
  /** Maximum breadcrumbs to keep */
  maxBreadcrumbs?: number
  /** Sampling rate (0-1) */
  sampleRate?: number
  /** Custom transport */
  transport?: Transport
  /** Before send hook */
  beforeSend?: (event: ErrorEvent) => ErrorEvent | null
  /** Debug mode */
  debug?: boolean
}

export interface ErrorEvent {
  id: string
  message: string
  stackTrace: string
  level: LogLevel
  environment: string
  url?: string
  userAgent?: string
  metadata: Record<string, any>
  timestamp: string
  tags: string[]
  breadcrumbs: Breadcrumb[]
  user?: User
  release?: string
}

export interface Breadcrumb {
  message: string
  category?: string
  level?: LogLevel
  timestamp: string
  data?: Record<string, any>
}

export interface User {
  id?: string
  email?: string
  username?: string
  [key: string]: any
}

export interface Transport {
  send(event: ErrorEvent): Promise<boolean>
}

export interface ErrTraceClient {
  captureError(error: Error, options?: CaptureOptions): Promise<string | null>
  captureMessage(message: string, level?: LogLevel, options?: CaptureOptions): Promise<string | null>
  setUser(user: User | null): void
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void
  setTags(tags: string[]): void
  setRelease(release: string): void
}

export interface CaptureOptions {
  level?: LogLevel
  tags?: string[]
  metadata?: Record<string, any>
  user?: User
}