interface ApplicationInquiryDetails {
  companyName: string
  contactPersonName: string
  email: string
  phone: string | null
  message: string | null
}

export function applicationUrl(baseUrl: string, applicationId: string) {
  return `${baseUrl.replace(/\/$/, "")}/${applicationId}`
}

export function formatApplicationInquiryTelegramMessage(params: {
  applicationUrl: string
  applicantFirstName: string
  applicantLastName: string
  inquiry: ApplicationInquiryDetails
}) {
  const phone = params.inquiry.phone ?? "—"
  const message = params.inquiry.message ?? "—"

  return [
    "Neue Bewerberanfrage",
    "",
    `Bewerber: ${params.applicantFirstName} ${params.applicantLastName}`,
    `Bewerbung: ${params.applicationUrl}`,
    "",
    `Firma: ${params.inquiry.companyName}`,
    `Ansprechpartner: ${params.inquiry.contactPersonName}`,
    `E-Mail: ${params.inquiry.email}`,
    `Telefon: ${phone}`,
    `Nachricht: ${message}`,
  ].join("\n")
}

export function formatApplicationInquiryConfirmationEmail(params: {
  applicantFirstName: string
  applicantLastName: string
  inquiry: ApplicationInquiryDetails
}) {
  const lines = [
    "Guten Tag,",
    "",
    `vielen Dank für Ihre Anfrage zu ${params.applicantFirstName} ${params.applicantLastName}.`,
    "Wir haben Ihre Bewerberanfrage erhalten und melden uns, sobald wir die nächsten Schritte einleiten können.",
    "",
    "Ihre Angaben:",
    `Firma: ${params.inquiry.companyName}`,
    `Ansprechpartner: ${params.inquiry.contactPersonName}`,
    `E-Mail: ${params.inquiry.email}`,
  ]

  if (params.inquiry.phone !== null) {
    lines.push(`Telefon: ${params.inquiry.phone}`)
  }

  if (params.inquiry.message !== null) {
    lines.push("", "Nachricht:", params.inquiry.message)
  }

  lines.push("", "Mit freundlichen Grüßen", "Ihr Personal Georgien Team")

  return {
    subject: "Ihre Bewerberanfrage wurde erhalten",
    text: lines.join("\n"),
  }
}
