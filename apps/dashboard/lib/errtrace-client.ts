import { ErrTraceConfig } from './types'

class ErrTraceClient {
  private apiKey?: string
  private environment: string
  private release?: string
  private tags: string[]
  private endpoint: string

  constructor(config: ErrTraceConfig = {}) {
    this.apiKey = config.apiKey
    this.environment = config.environment || 'production'
    this.release = config.release
    this.tags = config.tags || []
    this.endpoint = process.env.NEXT_PUBLIC_ERRTRACE_ENDPOINT || '/api/errors'
  }

  async captureError(error: Error, metadata?: any) {
    try {
      const payload = {
        message: error.message,
        stack_trace: error.stack || '',
        level: 'error',
        environment: this.environment,
        url: typeof window !== 'undefined' ? window.location.href : '',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        metadata: {
          ...metadata,
          release: this.release,
          tags: this.tags,
          timestamp: new Date().toISOString(),
        }
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-ErrTrace-Key': this.apiKey }),
        },
        body: JSON.stringify(payload)
      })

      return await response.json()
    } catch (err) {
      console.error('ErrTrace: Failed to capture error:', err)
      return null
    }
  }

  async captureMessage(message: string, level: string = 'info', metadata?: any) {
    const error = new Error(message)
    return this.captureError(error, { ...metadata, level })
  }

  setupGlobalHandlers() {
    if (typeof window === 'undefined') return

    // Global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      this.captureError(error || new Error(message as string), {
        source,
        lineno,
        colno
      })
    }

    // Unhandled promise rejection
    window.onunhandledrejection = (event) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        { type: 'unhandledRejection' }
      )
    }
  }
}

// Singleton instance
let errtraceInstance: ErrTraceClient | null = null

export function initErrTrace(config: ErrTraceConfig = {}) {
  errtraceInstance = new ErrTraceClient(config)
  errtraceInstance.setupGlobalHandlers()
  return errtraceInstance
}

export function getErrTrace() {
  if (!errtraceInstance) {
    console.warn('ErrTrace not initialized. Call initErrTrace() first.')
    return new ErrTraceClient()
  }
  return errtraceInstance
}