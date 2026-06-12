import React from 'react'
import ErrTrace from '../client'

interface ErrorBoundaryProps {
  errtrace: ErrTrace
  fallback?: React.ReactNode
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * React Error Boundary component
 */
export class ErrTraceErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.errtrace.captureError(error, {
      metadata: {
        componentStack: errorInfo.componentStack,
        type: 'react-error-boundary'
      }
    })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Something went wrong.</h1>
    }

    return this.props.children
  }
}

/**
 * React Hook for manual error capturing
 */
export function useErrTrace(errtrace: ErrTrace) {
  return {
    captureError: (error: Error, metadata?: any) => {
      errtrace.captureError(error, { metadata })
    },
    captureMessage: (message: string, level?: any, metadata?: any) => {
      errtrace.captureMessage(message, level, { metadata })
    },
    addBreadcrumb: (message: string, data?: any) => {
      errtrace.addBreadcrumb({ message, data })
    }
  }
}