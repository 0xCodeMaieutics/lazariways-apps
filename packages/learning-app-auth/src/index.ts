import { betterAuth, type BetterAuthOptions } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { APIError } from "better-auth/api"

type AuthPlugin = NonNullable<BetterAuthOptions["plugins"]>[number]
type SendResetPassword = NonNullable<NonNullable<BetterAuthOptions["emailAndPassword"]>["sendResetPassword"]>

export const SET_PASSWORD_TOKEN_EXPIRES_IN_SECONDS = 72 * 60 * 60

export function createLearningAppAuth(
  prisma: Parameters<typeof prismaAdapter>[0],
  options: {
    // Must differ per app: cookies ignore the port, so apps sharing a host would overwrite each other's session.
    cookiePrefix: string
    plugins?: AuthPlugin[]
    sendResetPassword?: SendResetPassword
  }
) {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    // Users are only created and given passwords by admins, so these stay callable
    // from server code (auth.api.*) but are not exposed over HTTP.
    disabledPaths: ["/sign-up/email", "/request-password-reset", "/reset-password"],
    emailAndPassword: {
      enabled: true,
      sendResetPassword: options.sendResetPassword,
      resetPasswordTokenExpiresIn: SET_PASSWORD_TOKEN_EXPIRES_IN_SECONDS,
      revokeSessionsOnPasswordReset: true,
    },
    advanced: {
      cookiePrefix: options.cookiePrefix,
    },
    user: {
      modelName: "User",
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "USER",
          input: false,
        },
        disabledAt: {
          type: "date",
          required: false,
          input: false,
        },
      },
    },
    session: {
      modelName: "Session",
    },
    account: {
      modelName: "Account",
    },
    verification: {
      modelName: "Verification",
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session, ctx) => {
            const user = await ctx?.context.adapter.findOne<{ disabledAt: Date | null }>({
              model: "user",
              where: [{ field: "id", value: session.userId }],
            })
            if (user?.disabledAt) {
              throw new APIError("FORBIDDEN", { message: "USER_DISABLED" })
            }
          },
        },
      },
    },
    plugins: options.plugins ?? [],
  })
}
