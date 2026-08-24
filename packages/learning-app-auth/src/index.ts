import { betterAuth, type BetterAuthOptions } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

type AuthPlugin = NonNullable<BetterAuthOptions["plugins"]>[number]

export function createLearningAppAuth(
  prisma: Parameters<typeof prismaAdapter>[0],
  plugins: AuthPlugin[] = []
) {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
    },
    advanced: {
      cookiePrefix: "learning-platform",
    },
    user: {
      modelName: "LearningAppUser",
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "USER",
          input: false,
        },
      },
    },
    session: {
      modelName: "LearningAppSession",
    },
    account: {
      modelName: "LearningAppAccount",
    },
    plugins,
  })
}
