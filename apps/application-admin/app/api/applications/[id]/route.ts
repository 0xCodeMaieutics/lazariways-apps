import { adminApplicationEditSchema } from "@workspace/application/schema"
import { applicationToPrismaData } from "@workspace/application/prisma"
import prisma from "@workspace/database/client"
import { deleteFileFromStorage } from "@workspace/file-upload/s3-client"
import { requireAdminSessionForApi } from "@/lib/auth"
import { env } from "@/env"
import { normalizeAdminEditInput } from "@/lib/normalize-edit-input"

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

  return Response.json({ success: true })
}
