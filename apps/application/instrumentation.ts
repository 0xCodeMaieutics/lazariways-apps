import type { Instrumentation } from "next"

import { reportError } from "@/lib/error-report"

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  await reportError({
    location: `${context.routePath} (${context.routerKind}, ${context.routeType})`,
    message: `A visitor requested ${request.method} ${request.path} and the server crashed with an unhandled error, so they saw an error instead of the page/response.`,
    error,
  })
}
