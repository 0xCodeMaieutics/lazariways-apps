import { nextCookies } from 'better-auth/next-js'
import { createLearningAppAuth } from '@workspace/learning-app-auth'
import { prisma } from '@workspace/database/client'

export const auth = createLearningAppAuth(prisma, [nextCookies()])
