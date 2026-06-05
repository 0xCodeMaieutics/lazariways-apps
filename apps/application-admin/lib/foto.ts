import { downloadFileFromStorage } from "@workspace/file-upload/s3-client"
import { env } from "@/env"

function fotoFilenameFromKey(fotoS3Key: string): string {
  const segment = fotoS3Key.split("/").pop()
  return segment !== undefined && segment !== "" ? segment : "foto.jpg"
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
