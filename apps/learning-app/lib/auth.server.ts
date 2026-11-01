import { prisma } from "@lazariways/database/client"
import { createLearningAppAuth } from "@lazariways/learning-app-auth"
import { nextCookies } from "better-auth/next-js"

export const auth = createLearningAppAuth(prisma, { plugins: [nextCookies()] })
