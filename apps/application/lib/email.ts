import { Resend } from "resend"

import { env } from "@/env"

const ADMIN_EMAILS = ["annamalazonia1@gmail.com", "malazoniakristine@gmail.com"]

export async function sendNewApplicationEmailToAdmins(params: {
  firstName: string
  lastName: string
  email: string
  phone: string | null
}) {
  const applicant = `${params.firstName} ${params.lastName}`.trim()
  const lines = [
    "Lazari Ways-ზე ახალი განაცხადი შემოვიდა.",
    "",
    `სახელი: ${applicant}`,
    `ელ. ფოსტა: ${params.email}`,
    ...(params.phone ? [`ტელეფონი: ${params.phone}`] : []),
  ]

  const email = {
    from: `Lazari Ways <${env.RESEND_FROM_EMAIL}>`,
    to: ADMIN_EMAILS,
    subject: "ახალი განაცხადი Lazari Ways-ზე",
    text: lines.join("\n"),
  }

  if (process.env.NODE_ENV === "development") {
    console.log("ADMIN_NOTIFICATION_EMAIL (not sent in development)", email)
    return
  }

  const result = await new Resend(env.RESEND_API_KEY).emails.send(email)

  if (result.error !== null) {
    console.error("Resend send failed:", result.error)
    throw new Error(result.error.message)
  }
}
