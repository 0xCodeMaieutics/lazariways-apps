import {
  startSpan as sentry_startSpan,
  captureException as sentry_captureException,
  setUser as sentry_setUser,
  setTag as sentry_setTag,
} from "@sentry/nextjs"

type SentrySpanOptions = Parameters<typeof sentry_startSpan>[0]
type SentrySpan = Parameters<Parameters<typeof sentry_startSpan>[1]>[0]

export type Span = Pick<SentrySpan, "setAttribute">

function startSpan<T>(
  options: Pick<SentrySpanOptions, "name" | "op" | "attributes">,
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
