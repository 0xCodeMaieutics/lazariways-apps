import { env } from "@/env"

export async function sendTelegramMessage(text: string) {
  const body = new URLSearchParams({
    chat_id: env.TELEGRAM_CHAT_ID,
    text,
  })

  const res = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  )

  const json = (await res.json()) as { ok?: boolean; description?: string }

  if (!res.ok || !json.ok) {
    console.error("Telegram sendMessage failed:", json)
    throw new Error(json.description ?? "Telegram API error")
  }
}

export async function sendPhotoToTelegram(
  file: File,
  filename: string,
  caption: string
) {
  const body = new FormData()
  body.append("chat_id", env.TELEGRAM_CHAT_ID)
  body.append("photo", file, filename)
  body.append("caption", caption)

  const res = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendPhoto`,
    {
      method: "POST",
      body,
    }
  )

  const json = (await res.json()) as { ok?: boolean; description?: string }

  if (!res.ok || !json.ok) {
    console.error("Telegram sendPhoto failed:", json)
    throw new Error(json.description ?? "Telegram API error")
  }
}

export async function sendPdfToTelegram(
  pdfBytes: Uint8Array,
  pdfFilename: string,
  caption: string
) {
  const body = new FormData()
  body.append("chat_id", env.TELEGRAM_CHAT_ID)
  const pdfCopy = Uint8Array.from(pdfBytes)
  body.append(
    "document",
    new Blob([pdfCopy], { type: "application/pdf" }),
    pdfFilename
  )
  body.append("caption", caption)

  const res = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendDocument`,
    {
      method: "POST",
      body,
    }
  )

  const json = (await res.json()) as { ok?: boolean; description?: string }

  if (!res.ok || !json.ok) {
    console.error("Telegram sendDocument failed:", json)
    throw new Error(json.description ?? "Telegram API error")
  }
}
