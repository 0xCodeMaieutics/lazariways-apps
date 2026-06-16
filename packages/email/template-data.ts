import { z } from "zod"

export const emailTemplateSchema = z.object({
  id: z.string().min(1),
  companyName: z.string().min(1),
  position: z.string().min(1),
  applicationIds: z.array(z.string().min(1)).min(1),
  attachments: z.array(z.string().min(1)).min(1),
  contactPerson: z.object({
    lastName: z.string().min(1),
    gender: z.enum(["m", "f"]),
  }),
  emailTo: z.email(),
})

export type EmailTemplate = z.infer<typeof emailTemplateSchema>

const emailTemplateData = [
  {
    id: "europapark-buergin",
    companyName: "Europa-Park",
    position: "Servicekraft (m/w/d) Restaurant & Bar",
    applicationIds: ["10ec4faa-ffb7-404f-a33a-300ec79a02a5"],
    attachments: ["Tsira-Gorjomeladze-personalgeorgien.pdf"],
    contactPerson: {
      lastName: "Bürgin",
      gender: "f",
    },
    emailTo: "gio.shara12345@gmail.com",
  },
] as const

export const emailTemplates = z
  .array(emailTemplateSchema)
  .refine(
    (templates) =>
      new Set(templates.map((template) => template.id)).size ===
      templates.length,
    { message: "Email template ids must be unique" }
  )
  .parse(emailTemplateData)

export function getEmailTemplateById(
  templateId: string
): EmailTemplate | undefined {
  return emailTemplates.find((template) => template.id === templateId)
}

function salutation(gender: "m" | "f", lastName: string): string {
  if (gender === "f") {
    return `Sehr geehrte Frau ${lastName}`
  }

  return `Sehr geehrter Herr ${lastName}`
}

export function buildEmailContent(
  template: EmailTemplate,
  applicationId: string
) {
  const { companyName, contactPerson, position } = template

  return {
    title: `Vermittlung eines geeigneten Kandidaten – ${position}`,
    body: `<div style="font-size: 18px;">${salutation(contactPerson.gender, contactPerson.lastName)},<br><br>

wir sind eine Personalvermittlung und möchten Ihnen einen motivierten Kandidaten für die <b>${position}</b> im <b>${companyName}</b> vorstellen.<br><br>

Bei Interesse senden wir gerne die Unterlagen von dem Kandidaten (Sehen Sie dafür den Anhang).<br><br>

Alternativ können Sie sich die Kandidatinnen und Kandidaten auch über unsere Webseite ansehen: <a style="text-decoration: underline;" href="https://bewerber.personalgeorgien.de/${applicationId}">Bewerber/in ansehen</a><br><br>

Wir freuen uns auf Ihre Rückmeldung.<br><br>

Mit freundlichen Grüßen<br><br>

<b>Giorgi Sharashenidze<br>
Personalgeorgien<br>
girogi@personalgeorgien.de<br>
+4917681376567</b><div>`,
  }
}
