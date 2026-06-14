import { z } from "zod"
import {
  adminEditDataToApplicationFormData,
  prismaToAdminEditData,
} from "@workspace/application/prisma"
import {
  generatePersonalGeorgienPdf,
  personalGeorgienProfessionOptions,
} from "@workspace/application/pdf"
import prisma from "@workspace/database/client"
import { requireAdminSessionForApi } from "@/lib/auth"
import { env } from "@/env"
import { downloadFotoAsFile } from "@/lib/foto"

function sanitizeFilenamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 60)
}

const bodySchema = z.object({
  profession: z.enum(
    personalGeorgienProfessionOptions as [
      (typeof personalGeorgienProfessionOptions)[number],
      ...(typeof personalGeorgienProfessionOptions)[number][],
    ]
  ),
})

export const POST = async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const authResult = await requireAdminSessionForApi()
  if (authResult instanceof Response) {
    return authResult
  }

  const { id } = await context.params

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    console.error("ZOD_VALIDATION_FAILED", parsed.error)
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const existing = await prisma.application.findUnique({ where: { id } })
  if (existing === null) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  let fotoFile
  try {
    fotoFile = await downloadFotoAsFile(existing.fotoS3Key)
  } catch (error) {
    console.error("FOTO_DOWNLOAD_FAILED", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  let pdfBytes: Uint8Array
  try {
    pdfBytes = await generatePersonalGeorgienPdf({
      ...adminEditDataToApplicationFormData(
        prismaToAdminEditData(existing),
        fotoFile
      ),
      applicationId: id,
      bewerberAppUrl: env.BEWERBER_APP_URL,
      profession: parsed.data.profession,
    })
  } catch (error) {
    console.error("GENERATE_PERSONAL_GEORGIEN_PDF_ERROR", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  const filename = `${sanitizeFilenamePart(existing.firstName)}-${sanitizeFilenamePart(existing.lastName)}-personalgeorgien.pdf`

  const pdfBody = Uint8Array.from(pdfBytes)

  return new Response(new Blob([pdfBody], { type: "application/pdf" }), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
