import { Transport, ErrorEvent } from '../types'

export class HTTPTransport implements Transport {
  private endpoint: string
  private apiKey?: string

  constructor(dsn: string, apiKey?: string) {
    this.endpoint = `${dsn}/api/errors`
    this.apiKey = apiKey
  }

  async send(event: ErrorEvent): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-ErrTrace-Key': this.apiKey }),
        },
        body: JSON.stringify({
          message: event.message,
          stack_trace: event.stackTrace,
          level: event.level,
          environment: event.environment,
          url: event.url,
          user_agent: event.userAgent,
          metadata: {
            ...event.metadata,
            breadcrumbs: event.breadcrumbs,
            user: event.user,
            tags: event.tags,
            release: event.release,
          }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('ErrTrace: Failed to send error:', error);
      return false;
    }
  }
}