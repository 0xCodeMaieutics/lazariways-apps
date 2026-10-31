import { verifyCodeAndCreateSession } from "@workspace/verification"
import { cookies } from "next/headers"
import { z } from "zod"

import { CONTENT_SESSION_COOKIE, CONTENT_SESSION_MAX_AGE_SECONDS } from "@/lib/constants"

const verifyCodeSchema = z.object({
  code: z.string().min(1),
})

export const POST = async (request: Request) => {
  const body = verifyCodeSchema.safeParse(await request.json())

  if (!body.success) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const token = await verifyCodeAndCreateSession({ scope: "CONTENT", code: body.data.code })

  if (token === null) {
    return Response.json({ error: "Invalid or expired code." }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set(CONTENT_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CONTENT_SESSION_MAX_AGE_SECONDS,
  })

  return Response.json({ success: true })
}
