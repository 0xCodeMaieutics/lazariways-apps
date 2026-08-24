import { trpcMiddleware as sentry_trpcMiddleware } from '@sentry/nextjs'
export const trpcTracingMiddleware = sentry_trpcMiddleware()
