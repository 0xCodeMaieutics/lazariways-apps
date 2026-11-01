import { prisma } from "@lazariways/database/client"
import { createLearningAppAuth } from "@lazariways/learning-app-auth"
import { nextCookies } from "better-auth/next-js"

import { sendSetPasswordEmail } from "@/lib/email"

export const auth = createLearningAppAuth(prisma, {
  plugins: [nextCookies()],
  sendResetPassword: async ({ user, token }) => {
    const credentialAccount = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
      select: { id: true },
    })

    await sendSetPasswordEmail({
      kind: credentialAccount ? "reset" : "invite",
      to: user.email,
      name: user.name,
      token,
    })
  },
})
