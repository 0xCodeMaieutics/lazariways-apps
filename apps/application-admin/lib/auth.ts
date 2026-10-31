import type { AdminSession } from "@workspace/database/browser"
import { findSession } from "@workspace/verification"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ADMIN_SESSION_COOKIE } from "./constants"

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

  if (token === undefined || token.trim() === "") {
    return null
  }

  return findSession({ scope: "ADMIN", token })
}

export async function requireAdminSessionForPage(callbackUrl: string): Promise<AdminSession> {
  const session = await getAdminSession()

  if (session === null) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  return session
}

export async function requireAdminSessionForApi(): Promise<AdminSession | Response> {
  const session = await getAdminSession()

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  return session
}
