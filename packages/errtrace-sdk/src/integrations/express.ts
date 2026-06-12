import ErrTrace from '../client'
import { Request, Response, NextFunction } from 'express'

/**
 * Express.js middleware for ErrTrace
 */
export function errTraceMiddleware(errtrace: ErrTrace) {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    errtrace.captureError(err, {
      metadata: {
        method: req.method,
        path: req.path,
        query: req.query,
        headers: {
          ...req.headers,
          // Remove sensitive headers
          authorization: undefined,
          cookie: undefined,
        },
        body: req.body,
      }
    })
    next(err)
  }
}