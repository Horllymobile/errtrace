import { Transport, ErrorEvent, PageView, TrackEvent } from '../types'

export class HTTPTransport implements Transport {
  private endpoint: string
  private apiKey?: string

  constructor(dsn: string, apiKey?: string) {
    this.endpoint = `${dsn}/api/errors`
    this.apiKey = apiKey
  }

  async send(event: ErrorEvent): Promise<boolean> {
    try {
      const body: any = {
        message: event.message,
        stack_trace: event.stackTrace,
        level: event.level,
        environment: event.environment,
        url: event.url,
        user_agent: event.userAgent,
        metadata: event.metadata,
        user_id: event.user?.id || event.user?.email || null,
      };

      if (event.user_identifier) {
        body.user_identifier = event.user_identifier;
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-ErrTrace-Key': this.apiKey }),
        },
        body: JSON.stringify(body),
      });
      return response.ok;
    } catch (error) {
      console.error('ErrTrace: Failed to send error:', error);
      return false;
    }
  }

  async sendEvent(event: TrackEvent): Promise<boolean> {
    try {
      const baseUrl = this.endpoint.replace(/\/api\/errors\/?$/, '');
      const body: any = {
        name: event.name,
        properties: event.properties,
        timestamp: event.timestamp,
        environment: event.environment,
        tags: event.tags,
        user_id: event.user?.id || event.user?.email || null,  // <-- ADD THIS
      };
      if (event.user_identifier) {
        body.user_identifier = event.user_identifier;
      }
      const response = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-ErrTrace-Key': this.apiKey }),
        },
        body: JSON.stringify(body),
      });
      return response.ok;
    } catch (error) {
      console.error('ErrTrace: Failed to send event:', error);
      return false;
    }
  }
}