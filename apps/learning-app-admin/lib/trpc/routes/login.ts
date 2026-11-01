import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { auth } from "@/lib/auth.server"
import { tryCatchAsync } from "@/lib/try-catch"

import { publicProcedure, router } from "../server"

const signInSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional().default(false),
})

export const loginRouter = router({
  signInEmail: publicProcedure.input(signInSchema).mutation(async ({ input, ctx }) => {
    const [error, result] = await tryCatchAsync(
      async () =>
        await auth.api.signInEmail({
          body: {
            email: input.email,
            password: input.password,
            rememberMe: input.rememberMe,
          },
          headers: ctx.headers,
        })
    )

    if (error) {
      console.error(error)
      // Handle better-auth errors
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to sign in",
        cause: error,
      })
    }

    if (result === null) {
      console.error("SIGN_IN_EMAIL_RESULT_NULL")
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to sign in",
      })
    }

    return {
      success: true,
      data: result,
    }
  }),
})
