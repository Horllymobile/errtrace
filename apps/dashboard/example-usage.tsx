// Initialize ErrTrace in your app
import { initErrTrace } from '@/lib/errtrace-client'

const errtrace = initErrTrace({
  apiKey: 'your-api-key',  // Optional
  environment: process.env.NODE_ENV || 'development',
  release: '1.0.0',
  tags: ['frontend', 'web']
})

// Capture errors manually
try {
  // Your code here
  throw new Error('Something went wrong!')
} catch (error) {
  errtrace.captureError(error, {
    userId: '123',
    action: 'checkout'
  })
}

// Capture custom messages
errtrace.captureMessage('User completed purchase', 'info', {
  orderId: 'ORD-123',
  amount: 99.99
})