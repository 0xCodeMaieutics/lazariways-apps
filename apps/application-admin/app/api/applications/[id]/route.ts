import { adminApplicationEditSchema } from "@workspace/application/schema"
import {
  adminEditDataToApplicationFormData,
  applicationToPrismaData,
} from "@workspace/application/prisma"
import { generateRemoteApplicationPdf } from "@workspace/application/pdf"
import prisma from "@workspace/database/client"
import { deleteFileFromStorage } from "@workspace/file-upload/s3-client"
import { requireAdminSessionForApi } from "@/lib/auth"
import { env } from "@/env"
import { downloadFotoAsFile } from "@/lib/foto"
import { normalizeAdminEditInput } from "@/lib/normalize-edit-input"
import { sendPdfToTelegram } from "@/lib/telegram"

function sanitizeFilenamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 60)
}

export const DELETE = async (
  _request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const authResult = await requireAdminSessionForApi()
  if (authResult instanceof Response) {
    return authResult
  }

  const { id } = await context.params
  const existing = await prisma.application.findUnique({ where: { id } })

  if (existing === null) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  try {
    await deleteFileFromStorage({
      bucket: env.S3_BUCKET_NAME,
      fileKey: existing.fotoS3Key,
    })
  } catch (error) {
    console.error("FOTO_DELETE_FAILED", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  try {
    await prisma.application.delete({ where: { id } })
  } catch (error) {
    console.error("APPLICATION_DB_DELETE_FAILED", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  return Response.json({ success: true })
}

export const PUT = async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const authResult = await requireAdminSessionForApi()
  if (authResult instanceof Response) {
    return authResult
  }

  const { id } = await context.params
  const parsed = adminApplicationEditSchema.safeParse(
    normalizeAdminEditInput(await request.json())
  )

  if (!parsed.success) {
    console.error("ZOD_VALIDATION_FAILED", parsed.error)
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const existing = await prisma.application.findUnique({ where: { id } })

  if (existing === null) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  try {
    await prisma.application.update({
      where: { id },
      data: applicationToPrismaData(parsed.data),
    })
  } catch (error) {
    console.error("APPLICATION_DB_UPDATE_FAILED", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  let fotoFile
  try {
    fotoFile = await downloadFotoAsFile(existing.fotoS3Key)
  } catch (error) {
    console.error("FOTO_DOWNLOAD_FAILED", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  let pdfBytes
  try {
    pdfBytes = await generateRemoteApplicationPdf(
      adminEditDataToApplicationFormData(parsed.data, fotoFile)
    )
  } catch (error) {
    console.error("GENERATE_APPLICATION_PDF_ERROR", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  const firstName = sanitizeFilenamePart(parsed.data.firstName)
  const lastName = sanitizeFilenamePart(parsed.data.lastName)

  try {
    await sendPdfToTelegram(
      pdfBytes,
      `${firstName} ${lastName}.pdf`,
      `${process.env.NODE_ENV === "development" ? "TEST - " : ""}${parsed.data.firstName} ${parsed.data.lastName}`.trim()
    )
  } catch (error) {
    console.error("TELEGRAM_REQUEST_FAILED", error)
    return Response.json({ error: "Internal server error" }, { status: 502 })
  }

  return Response.json({ success: true })
}
