import { env } from "@/env"

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
