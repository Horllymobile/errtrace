import ErrTrace from './client'

/**
 * Next.js integration for ErrTrace
 */

export function withErrTrace(
  handler: any,
  options?: { tags?: string[]; metadata?: Record<string, any> }
) {
  const errtrace = new ErrTrace({
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION,
  });

  return async (req: any, res: any) => {
    try {
      return await handler(req, res);
    } catch (error) {
      await errtrace.captureError(error as Error, {
        metadata: {
          url: req.url,
          method: req.method,
          type: 'nextjs-api',
          ...options?.metadata,
        },
        tags: options?.tags,
      });
      throw error;
    }
  };
}

/**
 * Error boundary component for Next.js App Router
 */
export function getErrorBoundaryProps(errtrace: ErrTrace) {
  return {
    onError: (error: Error, errorInfo: any) => {
      errtrace.captureError(error, {
        metadata: {
          componentStack: errorInfo?.componentStack,
          type: 'nextjs-error-boundary'
        }
      })
    }
  }
}