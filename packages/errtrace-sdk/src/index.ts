export { ErrTrace } from './client';
export type { ErrTraceOptions, ErrorEvent, Breadcrumb, User, LogLevel } from './types';
export { HTTPTransport } from './transports/http';
export { ConsoleTransport } from './transports/console';
// Integrations
export { withErrTrace } from './integrations/nextjs';
export { errTraceMiddleware } from './integrations/express';
export { ErrTraceErrorBoundary, useErrTrace } from './integrations/react';
export const VERSION = '1.0.0';