import { Transport, ErrorEvent, TrackEvent } from '../types';

export class ConsoleTransport implements Transport {
  async send(event: ErrorEvent): Promise<boolean> {
    console.group('🔴 ErrTrace Error Captured');
    console.log('Message:', event.message);
    console.log('Level:', event.level);
    console.log('Environment:', event.environment);
    console.log('Stack:', event.stackTrace);
    console.log('Metadata:', event.metadata);
    console.groupEnd();
    return true;
  }

  // Add this method
  async sendEvent(event: TrackEvent): Promise<boolean> {
    console.group('📊 ErrTrace Event');
    console.log('Name:', event.name);
    console.log('Properties:', event.properties);
    console.log('Environment:', event.environment);
    console.groupEnd();
    return true;
  }
}