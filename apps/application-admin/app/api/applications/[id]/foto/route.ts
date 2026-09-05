import prisma from "@workspace/database/client"
import {
  deleteFileFromStorage,
  getSignedUrlForDownload,
  uploadFileToStorage,
} from "@workspace/file-upload/s3-client"
import { env } from "@/env"
import { requireAdminSessionForApi } from "@/lib/auth"
import {
  isAllowedFotoMimeType,
  replacementFotoS3Key,
} from "@/lib/foto"

const FOTO_SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 10

export const POST = async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const authResult = await requireAdminSessionForApi()
  if (authResult instanceof Response) {
    return authResult
  }

  const { id } = await context.params
  const formData = await request.formData()
  const foto = formData.get("foto")

  if (!(foto instanceof File) || foto.size === 0) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  if (!isAllowedFotoMimeType(foto.type)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const existing = await prisma.application.findUnique({
    where: { id },
    select: { fotoS3Key: true },
  })

  if (existing === null) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const newFotoS3Key = replacementFotoS3Key(existing.fotoS3Key, foto.name)

  try {
    await uploadFileToStorage({
      file: foto,
      bucket: env.S3_BUCKET_NAME,
      fileKey: newFotoS3Key,
    })
  } catch (error) {
    console.error("FOTO_UPLOAD_FAILED", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  try {
    await prisma.application.update({
      where: { id },
      data: { fotoS3Key: newFotoS3Key },
    })
  } catch (error) {
    console.error("APPLICATION_FOTO_DB_UPDATE_FAILED", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  if (newFotoS3Key !== existing.fotoS3Key) {
    try {
      await deleteFileFromStorage({
        bucket: env.S3_BUCKET_NAME,
        fileKey: existing.fotoS3Key,
      })
    } catch (error) {
      console.error("FOTO_DELETE_FAILED", error)
    }
  }

  const fotoUrl = await getSignedUrlForDownload({
    bucket: env.S3_BUCKET_NAME,
    fileKey: newFotoS3Key,
    expiresInSeconds: FOTO_SIGNED_URL_EXPIRES_IN_SECONDS,
  })

  return Response.json({ success: true, fotoUrl })
}
