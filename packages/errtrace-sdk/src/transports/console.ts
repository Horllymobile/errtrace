import { Transport, ErrorEvent } from '../types'

export class ConsoleTransport implements Transport {
  async send(event: ErrorEvent): Promise<boolean> {
    console.group('🔴 ErrTrace Error Captured')
    console.log('Message:', event.message)
    console.log('Level:', event.level)
    console.log('Environment:', event.environment)
    console.log('Stack:', event.stackTrace)
    console.log('Metadata:', event.metadata)
    console.groupEnd()
    return true
  }
}