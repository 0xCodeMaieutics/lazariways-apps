import { Resend } from "resend"

const apiKey = process.env.RESEND_API_KEY
const from = process.env.RESEND_FROM_EMAIL
const to = process.env.RESEND_TO_EMAIL

if (!apiKey || !from || !to) {
  console.error(
    "Set RESEND_API_KEY, RESEND_FROM_EMAIL, and RESEND_TO_EMAIL in packages/email/.env"
  )
  process.exit(1)
}

const resend = new Resend(apiKey)

const { data, error } = await resend.emails.send({
  from,
  to,
  subject: "Resend test",
  html: "<b>bold text</b>",
  attachments: [],
})

if (error) {
  console.error("Send failed:", error)
  process.exit(1)
}

console.log("Sent:", data?.id)
