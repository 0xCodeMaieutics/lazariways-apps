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
