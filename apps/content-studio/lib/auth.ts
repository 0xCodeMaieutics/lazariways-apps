import type { AdminSession } from "@workspace/database/browser"
import { findSession } from "@workspace/verification"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { CONTENT_SESSION_COOKIE } from "./constants"

export async function getContentSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(CONTENT_SESSION_COOKIE)?.value

  if (token === undefined || token.trim() === "") {
    return null
  }

  return findSession({ scope: "CONTENT", token })
}

export async function requireContentSessionForPage(callbackUrl: string): Promise<AdminSession> {
  const session = await getContentSession()

  if (session === null) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  return session
}

export async function requireContentSessionForApi(): Promise<AdminSession | Response> {
  const session = await getContentSession()

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  return session
}
