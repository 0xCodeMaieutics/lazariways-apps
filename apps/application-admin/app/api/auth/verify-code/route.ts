import { cookies } from "next/headers"
import { z } from "zod"
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/lib/constants"
import { verifyCodeAndCreateSession } from "@/lib/verification"

const verifyCodeSchema = z.object({
  code: z.string().min(1),
})

export const POST = async (request: Request) => {
  const body = verifyCodeSchema.safeParse(await request.json())

  if (!body.success) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const token = await verifyCodeAndCreateSession(body.data.code)

  if (token === null) {
    return Response.json({ error: "Invalid or expired code." }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  })

  return Response.json({ success: true })
}
