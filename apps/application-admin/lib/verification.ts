import crypto from "node:crypto"
import prisma from "@workspace/database/client"
import {
  VERIFICATION_CODE_COOLDOWN_MINUTES,
  VERIFICATION_CODE_EXPIRY_MINUTES,
} from "./constants"
import { sendTelegramMessage } from "./telegram"

function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString()
}

export async function createAndSendVerificationCode() {
  const cooldownSince = new Date(
    Date.now() - VERIFICATION_CODE_COOLDOWN_MINUTES * 60 * 1000
  )

  const recentCode = await prisma.telegramVerification.findFirst({
    where: {
      createdAt: { gte: cooldownSince },
    },
    orderBy: { createdAt: "desc" },
  })

  if (recentCode !== null) {
    return { error: "cooldown" as const }
  }

  const now = new Date()

  await prisma.telegramVerification.updateMany({
    where: {
      usedAt: null,
      invalidatedAt: null,
      expiresAt: { gt: now },
    },
    data: { invalidatedAt: now },
  })

  const code = generateVerificationCode()
  const expiresAt = new Date(
    Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000
  )

  await prisma.telegramVerification.create({
    data: { code, expiresAt },
  })

  await sendTelegramMessage(
    `Admin login code: ${code}\n\nExpires in ${VERIFICATION_CODE_EXPIRY_MINUTES} minutes.`
  )

  return { success: true as const }
}

export async function verifyCodeAndCreateSession(code: string) {
  const trimmed = code.trim()
  const now = new Date()

  const verification = await prisma.telegramVerification.findFirst({
    where: {
      code: trimmed,
      usedAt: null,
      invalidatedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  })

  if (verification === null) {
    return null
  }

  const token = crypto.randomBytes(32).toString("hex")

  await prisma.$transaction([
    prisma.telegramVerification.update({
      where: { id: verification.id },
      data: { usedAt: now },
    }),
    prisma.adminSession.create({
      data: { token },
    }),
  ])

  return token
}
