import { prisma } from "@lazariways/database/client"
import { createLearningAppAuth } from "@lazariways/learning-app-auth"
import { nextCookies } from "better-auth/next-js"
import { headers } from "next/headers"
import { cache } from "react"

export const auth = createLearningAppAuth(prisma, {
  cookiePrefix: "lazarilingo-app",
  plugins: [nextCookies()],
  sessionCookieCacheMaxAgeInSeconds: 5 * 60,
})

export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }))
