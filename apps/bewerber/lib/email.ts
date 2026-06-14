import { Resend } from "resend"
import { env } from "@/env"

const resend = new Resend(env.RESEND_API_KEY)

export async function sendApplicationInquiryConfirmationEmail(params: {
  to: string
  subject: string
  text: string
}) {
  const result = await resend.emails.send({
    from: `Personal Georgien <${env.RESEND_FROM_EMAIL}>`,
    to: params.to,
    subject: params.subject,
    text: params.text,
  })

  if (result.error !== null) {
    console.error("Resend send failed:", result.error)
    throw new Error(result.error.message)
  }
}
