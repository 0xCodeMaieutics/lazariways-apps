import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { getHTTPStatusCodeFromError } from "@trpc/server/http"
import { after } from "next/server"

import { auth } from "@/lib/auth.server"
import { reportError } from "@/lib/error-report"
import { appRouter } from "@/lib/trpc/router"

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => {
      return {
        auth,
        headers: req.headers,
      }
    },
    onError: ({ error, path, input, type }) => {
      console.error("tRPC Error:", {
        path,
        input,
        error: {
          message: error.message,
          code: error.code,
          cause: error.cause,
        },
      })

      if (getHTTPStatusCodeFromError(error) < 500) return

      after(() =>
        reportError({
          location: `trpc ${type} ${path ?? "<unknown path>"}`,
          message: `${error.code}: ${error.message}`,
          error,
        })
      )
    },
  })

export { handler as GET, handler as POST }
