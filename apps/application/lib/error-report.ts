import { env } from "@/env"

const MAX_ERROR_DETAILS_LENGTH = 3000

export type ErrorReport = {
  location: string
  message: string
  error?: unknown
}

export async function reportError({ location, message, error }: ErrorReport) {
  const token = env.TELEGRAM_BOT_TOKEN
  const chatId = env.TELEGRAM_ERROR_CHAT_ID ?? env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set; skipping error report", location)
    return
  }

  const lines = [
    `🚨 <b>${process.env.NODE_ENV === "development" ? "TEST - " : ""}Application server error</b>`,
    "",
    `<b>Location:</b> <code>${escapeHtml(location)}</code>`,
    "",
    `<b>What happened:</b> ${escapeHtml(message)}`,
  ]

  if (error !== undefined) {
    lines.push("", "<b>Error:</b>", `<pre><code>${escapeHtml(truncate(formatError(error)))}</code></pre>`)
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
    })

    const json = (await res.json()) as { ok?: boolean; description?: string }

    if (!res.ok || !json.ok) {
      console.error("ERROR_REPORT_TELEGRAM_FAILED", json)
    }
  } catch (reportFailure) {
    console.error("ERROR_REPORT_TELEGRAM_FAILED", reportFailure)
  }
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    const details = error.stack ?? `${error.name}: ${error.message}`
    return error.cause === undefined ? details : `${details}\n\nCaused by: ${formatError(error.cause)}`
  }

  if (typeof error === "string") return error

  try {
    return JSON.stringify(error, null, 2) ?? String(error)
  } catch {
    return String(error)
  }
}

function truncate(value: string): string {
  return value.length > MAX_ERROR_DETAILS_LENGTH
    ? `${value.slice(0, MAX_ERROR_DETAILS_LENGTH)}\n… (truncated)`
    : value
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
