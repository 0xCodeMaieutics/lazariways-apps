import { downloadFileFromStorage } from "@workspace/file-upload/s3-client"
import { env } from "@/env"

export const ALLOWED_FOTO_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
] as const

function fotoFilenameFromKey(fotoS3Key: string): string {
  const segment = fotoS3Key.split("/").pop()
  return segment !== undefined && segment !== "" ? segment : "foto.jpg"
}

function sanitizeFilenamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 60)
}

export function isAllowedFotoMimeType(mimeType: string): boolean {
  return (ALLOWED_FOTO_MIME_TYPES as readonly string[]).includes(mimeType)
}

export function replacementFotoS3Key(
  currentFotoS3Key: string,
  originalFilename: string
): string {
  const lastSlash = currentFotoS3Key.lastIndexOf("/")
  const folder =
    lastSlash === -1 ? "applications" : currentFotoS3Key.slice(0, lastSlash)
  const filename = sanitizeFilenamePart(originalFilename) || "foto.jpg"
  return `${folder}/${Date.now()}-${filename}`
}

export async function downloadFotoAsFile(fotoS3Key: string): Promise<File> {
  const downloaded = await downloadFileFromStorage({
    bucket: env.S3_BUCKET_NAME,
    fileKey: fotoS3Key,
  })
  const buffer = await downloaded.getBuffer()
  const contentType = downloaded.contentType ?? "image/jpeg"
  const filename = fotoFilenameFromKey(fotoS3Key)

  return new File([buffer], filename, { type: contentType })
}
