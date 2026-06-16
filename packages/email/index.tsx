import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Resend } from "resend"
import { z } from "zod"
import {
  buildEmailContent,
  emailTemplates,
  getEmailTemplateById,
} from "./template-data.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const sendEmailCliArgsSchema = z.object({
  templateId: z.string().min(1),
  resendFromEmail: z.email(),
  resendCcEmail: z.email().optional(),
})

type SendEmailCliArgs = z.infer<typeof sendEmailCliArgsSchema>

function parseCliArg(args: string[], flag: string): string | undefined {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === undefined) continue

    const prefix = `${flag}=`
    if (arg.startsWith(prefix)) {
      return arg.slice(prefix.length)
    }

    const nextArg = args[index + 1]
    if (arg === flag && nextArg !== undefined) {
      return nextArg
    }
  }

  return undefined
}

function parseCliArgs():
  | { success: true; data: SendEmailCliArgs }
  | { success: false; error: z.ZodError } {
  const args = process.argv.slice(2)

  const result = sendEmailCliArgsSchema.safeParse({
    templateId: parseCliArg(args, "--template-id"),
    resendFromEmail: parseCliArg(args, "--resend-from-email"),
    resendCcEmail: parseCliArg(args, "--resend-cc-email"),
  })

  if (!result.success) {
    return { success: false, error: result.error }
  }

  return { success: true, data: result.data }
}

function printUsage() {
  console.error("Usage: pnpm send -- \\")
  console.error("  --template-id=<id> \\")
  console.error("  --resend-from-email=<email> \\")
  console.error("  [--resend-cc-email=<email>]")
  console.error(
    "Templates:",
    emailTemplates.map((template) => template.id).join(", ")
  )
}

async function main() {
  const parsedCliArgs = parseCliArgs()

  if (!parsedCliArgs.success) {
    printUsage()
    console.error(z.prettifyError(parsedCliArgs.error))
    process.exit(1)
  }

  const { templateId, resendFromEmail, resendCcEmail } = parsedCliArgs.data
  const template = getEmailTemplateById(templateId)

  if (!template) {
    printUsage()
    console.error(`Unknown template: ${templateId}`)
    process.exit(1)
  }

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.error("Set RESEND_API_KEY in packages/email/.env")
    process.exit(1)
  }

  const applicationId = template.applicationIds[0]
  if (applicationId === undefined) {
    console.error(`Template ${templateId} has no application ids`)
    process.exit(1)
  }

  const emailContent = buildEmailContent(template, applicationId)
  const attachments = template.attachments.map((filename) => ({
    filename,
    content: readFileSync(path.join(__dirname, "attachments", filename)),
  }))
  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from: `Personal Georgien <${resendFromEmail}>`,
    to: template.emailTo,
    ...(resendCcEmail !== undefined ? { cc: resendCcEmail } : {}),
    subject: emailContent.title,
    html: emailContent.body,
    attachments,
  })

  if (error) {
    console.error("Send failed:", error)
    process.exit(1)
  }

  console.log(`Sent ${templateId} email to ${template.emailTo}:`, data?.id)
}

main()
