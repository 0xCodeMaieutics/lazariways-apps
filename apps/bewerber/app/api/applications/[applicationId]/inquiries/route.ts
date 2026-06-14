import { nanoid } from "nanoid"
import prisma from "@workspace/database/client"
import {
  applicationInquiryFormSchema,
  optionalInquiryField,
} from "@/lib/application-inquiry-schema"
import {
  applicationUrl,
  formatApplicationInquiryConfirmationEmail,
  formatApplicationInquiryTelegramMessage,
} from "@/lib/application-inquiry-notifications"
import { sendApplicationInquiryConfirmationEmail } from "@/lib/email"
import { sendTelegramMessage } from "@/lib/telegram"
import { env } from "@/env"

interface RouteContext {
  params: Promise<{ applicationId: string }>
}

export const POST = async (request: Request, context: RouteContext) => {
  const { applicationId } = await context.params

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 })
  }

  const parsed = applicationInquiryFormSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." },
      { status: 400 }
    )
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true, firstName: true, lastName: true },
  })

  if (application === null) {
    return Response.json({ error: "Bewerbung nicht gefunden." }, { status: 404 })
  }

  const inquiryData = {
    companyName: parsed.data.companyName,
    contactPersonName: parsed.data.contactPersonName,
    email: parsed.data.email,
    phone: optionalInquiryField(parsed.data.phone),
    message: optionalInquiryField(parsed.data.message),
  }

  try {
    await prisma.applicationInquiry.create({
      data: {
        id: nanoid(),
        applicationId: application.id,
        ...inquiryData,
      },
    })
  } catch (error) {
    console.error("APPLICATION_INQUIRY_DB_INSERT_FAILED", error)
    return Response.json(
      { error: "Die Anfrage konnte nicht gesendet werden." },
      { status: 500 }
    )
  }

  const appUrl = applicationUrl(env.BEWERBER_APP_URL, application.id)

  try {
    await sendTelegramMessage(
      formatApplicationInquiryTelegramMessage({
        applicationUrl: appUrl,
        applicantFirstName: application.firstName,
        applicantLastName: application.lastName,
        inquiry: inquiryData,
      })
    )
  } catch (error) {
    console.error("APPLICATION_INQUIRY_TELEGRAM_FAILED", error)
  }

  try {
    const email = formatApplicationInquiryConfirmationEmail({
      applicantFirstName: application.firstName,
      applicantLastName: application.lastName,
      inquiry: inquiryData,
    })

    await sendApplicationInquiryConfirmationEmail({
      to: inquiryData.email,
      subject: email.subject,
      text: email.text,
    })
  } catch (error) {
    console.error("APPLICATION_INQUIRY_EMAIL_FAILED", error)
  }

  return Response.json({ success: true }, { status: 201 })
}
