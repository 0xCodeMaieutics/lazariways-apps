import { Resend } from "resend"

import { env } from "@/env"

export type SetPasswordEmailKind = "invite" | "reset"

export async function sendSetPasswordEmail(params: {
  kind: SetPasswordEmailKind
  to: string
  name: string
  token: string
}) {
  const url = `${env.LEARNING_APP_URL}/set-password?token=${encodeURIComponent(params.token)}`

  const content =
    params.kind === "invite"
      ? {
          subject: "მოწვევა LazariLingo-ზე — დააყენეთ პაროლი",
          lines: [
            `გამარჯობა, ${params.name}!`,
            "",
            "თქვენ მოგიწვიეს LazariLingo-ზე. პაროლის დასაყენებლად და სწავლის დასაწყებად გადადით ბმულზე:",
            url,
            "",
            "ბმული მოქმედებს 72 საათის განმავლობაში.",
          ],
        }
      : {
          subject: "LazariLingo — პაროლის აღდგენა",
          lines: [
            `გამარჯობა, ${params.name}!`,
            "",
            "ახალი პაროლის დასაყენებლად გადადით ბმულზე:",
            url,
            "",
            "ბმული მოქმედებს 72 საათის განმავლობაში. თუ ეს მოთხოვნა მოულოდნელია, დაუკავშირდით ადმინისტრატორს.",
          ],
        }

  const email = {
    from: `LazariLingo <${env.RESEND_FROM_EMAIL}>`,
    to: params.to,
    subject: content.subject,
    text: content.lines.join("\n"),
  }

  if (process.env.VERCEL_ENV !== "production") {
    console.log("SET_PASSWORD_EMAIL (only sent in production)", email)
    return
  }

  const result = await new Resend(env.RESEND_API_KEY).emails.send(email)

  if (result.error !== null) {
    console.error("Resend send failed:", result.error)
    throw new Error(result.error.message)
  }
}
