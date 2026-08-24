import {
    startSpan as sentry_startSpan,
    captureException as sentry_captureException,
    setUser as sentry_setUser,
    setTag as sentry_setTag,
} from '@sentry/nextjs'

export type Span = {
    setAttribute: (key: string, value: any) => void
}

function startSpan<T>(
    options: { name: string; op?: string; attributes?: Record<string, any> },
    fn: (span: Span) => T
): T {
    return sentry_startSpan(options, fn)
}

function captureException(error: Error): void {
    sentry_captureException(error)
}

function telemetryContextSetUser({ id, email }: { id: string; email: string }) {
    sentry_setUser({
        id,
        email,
    })
}

function setTag(key: string, value: string) {
    sentry_setTag(key, value)
}

export const telementry = {
    startSpan,
    captureException,
    telemetryContextSetUser,
    setTag,
}
