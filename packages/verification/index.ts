import crypto from "node:crypto"

import type { AdminSession, AuthScope } from "@lazariways/database/browser"
import prisma from "@lazariways/database/client"

const VERIFICATION_CODE_EXPIRY_MINUTES = 10
const VERIFICATION_CODE_COOLDOWN_MINUTES = 1

function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString()
}

export async function createAndSendVerificationCode({
  scope,
  chatId,
  token,
}: {
  scope: AuthScope
  chatId: string
  token: string
}): Promise<{ success: true } | { success: false; errorType: "COOLDOWN" }> {
  const cooldownSince = new Date(Date.now() - VERIFICATION_CODE_COOLDOWN_MINUTES * 60 * 1000)

  const recentCode = await prisma.telegramVerification.findFirst({
    where: {
      scope,
      createdAt: { gte: cooldownSince },
    },
    orderBy: { createdAt: "desc" },
  })

  if (recentCode !== null) {
    return { success: false, errorType: "COOLDOWN" }
  }

  const now = new Date()

  await prisma.telegramVerification.updateMany({
    where: {
      scope,
      usedAt: null,
      invalidatedAt: null,
      expiresAt: { gt: now },
    },
    data: { invalidatedAt: now },
  })

  const code = generateVerificationCode()
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000)

  await prisma.telegramVerification.create({
    data: { scope, code, expiresAt },
  })

  const text = `Login code: <code>${code}</code>\n\nExpires in ${VERIFICATION_CODE_EXPIRY_MINUTES} minutes.`

  if (process.env.NODE_ENV === "development") {
    console.log(`\nLogin code: ${code}\n`)
  } else {
    await sendTelegramMessage({ text, chatId, token })
  }

  return { success: true as const }
}

export async function verifyCodeAndCreateSession({ scope, code }: { scope: AuthScope; code: string }) {
  const trimmed = code.trim()
  const now = new Date()

  const verification = await prisma.telegramVerification.findFirst({
    where: {
      scope,
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
      data: { scope, token },
    }),
  ])

  return token
}

export async function findSession({
  scope,
  token,
}: {
  scope: AuthScope
  token: string
}): Promise<AdminSession | null> {
  return prisma.adminSession.findFirst({
    where: { scope, token },
  })
}

async function sendTelegramMessage({ text, chatId, token }: { text: string; token: string; chatId: string }) {
  const body = new URLSearchParams({
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  })

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  const json = (await res.json()) as { ok?: boolean; description?: string }

  if (!res.ok || !json.ok) {
    console.error("Telegram sendMessage failed:", json)
    throw new Error(json.description ?? "Telegram API error")
  }
}
