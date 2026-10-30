import { prisma } from "@workspace/database/client"
import { createLearningAppAuth } from "@workspace/learning-app-auth"
import { nextCookies } from "better-auth/next-js"

export const auth = createLearningAppAuth(prisma, [nextCookies()])
