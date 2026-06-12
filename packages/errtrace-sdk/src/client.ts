import { v4 as uuidv4 } from 'uuid'
import StackTrace from 'stacktrace-js'
import {
  ErrTraceOptions,
  ErrorEvent,
  Breadcrumb,
  User,
  LogLevel,
  CaptureOptions,
  Transport,
  TrackEvent
} from './types'
import { HTTPTransport } from './transports/http'
import { ConsoleTransport } from './transports/console'

export class ErrTrace {
  private options: Required<ErrTraceOptions>
  private breadcrumbs: Breadcrumb[] = []
  private user: User | null = null
  private transport: Transport
  private tags: string[] = []
  private release: string | undefined

  constructor(options: ErrTraceOptions = {}) {
    this.options = {
      dsn: options.dsn || 'http://localhost:3000',
      apiKey: options.apiKey || '',
      environment: options.environment || 'production',
      release: options.release || "",
      tags: options.tags || [],
      enabled: options.enabled !== false,
      maxBreadcrumbs: options.maxBreadcrumbs || 100,
      sampleRate: options.sampleRate || 1.0,
      transport: options.transport || new HTTPTransport(options.dsn || 'http://localhost:3000', options.apiKey),
      beforeSend: options.beforeSend || ((event) => event),
      debug: options.debug || false,
    }

    this.transport = options.transport ||
      (options.dsn
        ? new HTTPTransport(options.dsn, options.apiKey)
        : new ConsoleTransport())

    this.tags = options.tags || []
    this.release = options.release

    if (this.options.enabled) {
      this.setupGlobalHandlers()
    }
  }

  /**
   * Initialize ErrTrace with configuration
   */
  static init(options: ErrTraceOptions = {}): ErrTrace {
    return new ErrTrace(options)
  }

  /**
   * Capture an error
   */
  async captureError(error: Error, options: CaptureOptions = {}): Promise<string | null> {
    if (!this.options.enabled) return null

    // Apply sampling
    if (Math.random() > this.options.sampleRate) return null

    try {
      let stackTrace = error.stack || ''

      // Try to get better stack trace
      try {
        const frames = await StackTrace.fromError(error)
        stackTrace = frames.map(f => f.toString()).join('\n')
      } catch {
        // Use original stack if stacktrace-js fails
      }

      let event: ErrorEvent = {
        id: uuidv4(),
        message: error.message,
        stackTrace,
        level: options.level || 'error',
        environment: this.options.environment,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        metadata: {
          ...options.metadata,
          errorType: error.name,
        },
        timestamp: new Date().toISOString(),
        tags: [...this.tags, ...(options.tags || [])],
        breadcrumbs: [...this.breadcrumbs],
        user: this.user || undefined,
        release: this.release,
      }

      // Apply beforeSend hook
      if (this.options.beforeSend) {
        const modified = this.options.beforeSend(event)
        if (!modified) return null
        event = modified
      }

      const success = await this.transport.send(event)

      if (this.options.debug) {
        console.log(`ErrTrace: Error ${success ? 'sent' : 'failed to send'} - ${event.id}`)
      }

      return success ? event.id : null
    } catch (err) {
      console.error('ErrTrace: Error capturing error:', err)
      return null
    }
  }

  /**
   * Capture a message
   */
  async captureMessage(
    message: string,
    level: LogLevel = 'info',
    options: CaptureOptions = {}
  ): Promise<string | null> {
    const error = new Error(message)
    return this.captureError(error, { ...options, level })
  }

  /**
 * Track a custom event
 */
  async track(name: string, properties: Record<string, any> = {}): Promise<string | null> {
    if (!this.options.enabled) return null;
    if (Math.random() > this.options.sampleRate) return null;

    try {
      const event: TrackEvent = {
        id: uuidv4(),
        name,
        properties,
        timestamp: new Date().toISOString(),
        user: this.user || undefined,
        tags: [...this.tags],
        environment: this.options.environment,
        release: this.release,
      };

      const success = await this.transport.sendEvent(event);
      return success ? event.id : null;
    } catch (err) {
      console.error('ErrTrace: Failed to track event:', err);
      return null;
    }
  }

  /**
 * Track a page view
 */
  async trackPageView(
    path?: string,
    title?: string,
    properties: Record<string, any> = {}
  ): Promise<string | null> {
    const pagePath = path || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const pageTitle = title || (typeof document !== 'undefined' ? document.title : '');
    const referrer = typeof document !== 'undefined' ? document.referrer : undefined;

    return this.track('$pageview', {
      path: pagePath,
      title: pageTitle,
      referrer,
      ...properties,
    });
  }

  /**
   * Set user information
   */
  setUser(user: User | null): void {
    this.user = user
  }

  /**
   * Add a breadcrumb
   */
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: new Date().toISOString(),
    })

    // Keep only the last N breadcrumbs
    if (this.breadcrumbs.length > this.options.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.options.maxBreadcrumbs)
    }
  }

  /**
   * Set tags
   */
  setTags(tags: string[]): void {
    this.tags = tags
  }

  /**
   * Set release version
   */
  setRelease(release: string): void {
    this.release = release
  }

  /**
   * Enable/disable error capturing
   */
  setEnabled(enabled: boolean): void {
    this.options.enabled = enabled
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    if (typeof window === 'undefined') return

    // Global error handler
    const originalOnError = window.onerror
    window.onerror = (message, source, lineno, colno, error) => {
      if (originalOnError) {
        originalOnError(message, source, lineno, colno, error)
      }

      this.captureError(
        error || new Error(message as string),
        {
          metadata: { source, lineno, colno, type: 'global' }
        }
      )
    }

    // Unhandled promise rejection
    const originalOnRejection = window.onunhandledrejection
    window.onunhandledrejection = (event) => {
      if (originalOnRejection) {
        // originalOnRejection(event)
      }

      this.captureError(
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason)),
        { metadata: { type: 'unhandledRejection' } }
      )
    }

    if (this.options.debug) {
      console.log('ErrTrace: Global handlers installed')
    }
  }

  /**
   * Create a wrapper for Express.js error handling
   */
  expressMiddleware() {
    return (err: Error, req: any, res: any, next: any) => {
      this.captureError(err, {
        metadata: {
          method: req.method,
          path: req.path,
          query: req.query,
          headers: req.headers,
        }
      })
      next(err)
    }
  }

  /**
   * Create a wrapper for React error boundaries
   */
  reactErrorHandler(error: Error, errorInfo: any) {
    this.captureError(error, {
      metadata: {
        componentStack: errorInfo?.componentStack,
        type: 'react-error-boundary'
      }
    })
  }
}

// Default export
export default ErrTrace

// Named exports
export { HTTPTransport, ConsoleTransport }