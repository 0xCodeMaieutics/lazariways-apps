import { prisma } from "@lazariways/database/client"
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

const setPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be at most 128 characters" }),
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
  setPassword: publicProcedure.input(setPasswordSchema).mutation(async ({ input, ctx }) => {
    const authContext = await auth.$context
    const verification = await authContext.internalAdapter.findVerificationValue(
      `reset-password:${input.token}`
    )

    if (!verification || verification.expiresAt < new Date()) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "INVALID_TOKEN" })
    }

    const user = await prisma.user.findUnique({
      where: { id: verification.value },
      select: { id: true, email: true, disabledAt: true },
    })

    if (!user || user.disabledAt) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "INVALID_TOKEN" })
    }

    const [resetError] = await tryCatchAsync(
      async () =>
        await auth.api.resetPassword({
          body: { token: input.token, newPassword: input.password },
        })
    )

    if (resetError) {
      console.error(resetError)
      throw new TRPCError({ code: "BAD_REQUEST", message: "INVALID_TOKEN", cause: resetError })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    })

    const [signInError] = await tryCatchAsync(
      async () =>
        await auth.api.signInEmail({
          body: { email: user.email, password: input.password },
          headers: ctx.headers,
        })
    )

    if (signInError) {
      console.error(signInError)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to sign in",
        cause: signInError,
      })
    }

    return { success: true }
  }),
})
