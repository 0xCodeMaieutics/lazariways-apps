import { readFileSync } from "fs"

import { keyBuilders } from "@lazariways/file-upload/key-builder.ts"
import { getSignedUrlForDownload, uploadToStorage } from "@lazariways/file-upload/s3-client.ts"
import { generateRandomString } from "@lazariways/shared/lib/random.ts"
import z from "zod"

void (async function main() {
  const s3BucketNameResult = z.string().min(1).safeParse(process.env.S3_BUCKET_NAME)
  if (!s3BucketNameResult.success) {
    console.error("S3_BUCKET_ENV_LOAD_FAILED")
    return
  }

  const photoData = readFileSync("./scripts/photo.png")

  const employeeId = generateRandomString(32)
  const fileKey = keyBuilders.employees.photo.buildKey({
    employeeId,
    filename: "photo.png",
    now: Date.now(),
  })
  console.log({ fileKey })

  try {
    await uploadToStorage({
      file: photoData,
      bucket: s3BucketNameResult.data,
      fileKey: fileKey,
    })
  } catch (error) {
    console.error(error)
    return {
      isSuccess: false,
      errorCode: "PHOTO_UPLOAD_FAILED",
      errorMessage: "Failed to upload photo",
    }
  }

  try {
    const signedUrl = await getSignedUrlForDownload({
      bucket: s3BucketNameResult.data,
      fileKey,
      expiresInSeconds: 3600,
    })
    console.log({
      signedUrl,
    })
  } catch {
    console.log("URL_GENERATION_FAILED")
  }
})()
