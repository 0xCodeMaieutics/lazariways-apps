import { cookies } from "next/headers"
import prisma from "@workspace/database/client"
import { ADMIN_SESSION_COOKIE } from "./constants"

export async function getAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

  if (token === undefined || token.trim() === "") {
    return null
  }

  return prisma.adminSession.findUnique({
    where: { token },
  })
}

export async function requireAdminSession() {
  const session = await getAdminSession()
  if (session === null) {
    return null
  }
  return session
}
