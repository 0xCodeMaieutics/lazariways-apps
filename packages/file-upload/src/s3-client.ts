import * as crypto from "node:crypto"
import { createReadStream } from "node:fs"
import { performance } from "node:perf_hooks"
import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import z from "zod"

export const getS3Client = () => {
  const parsed = z
    .object({
      S3_REGION: z.string().min(1),
      S3_ENDPOINT: z.string().min(1),
      S3_ACCESS_KEY: z.string().min(1),
      S3_SECRET_KEY: z.string().min(1),
    })
    .safeParse({
      S3_REGION: process.env.S3_REGION,
      S3_ENDPOINT: process.env.S3_ENDPOINT,
      S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
      S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    })

  if (!parsed.success) {
    throw new Error(
      `S3 Client configuration error: ${JSON.stringify(parsed.error.flatten())}`
    )
  }

  return new S3Client({
    region: parsed.data.S3_REGION,
    endpoint:
      process.env.NODE_ENV === "development"
        ? parsed.data.S3_ENDPOINT
        : "https://s3.eu-central-1.amazonaws.com",
    credentials: {
      accessKeyId: parsed.data.S3_ACCESS_KEY,
      secretAccessKey: parsed.data.S3_SECRET_KEY,
    },
    forcePathStyle: process.env.NODE_ENV === "development",
  })
}

export async function uploadFileToStorage({
  file,
  bucket,
  fileKey,
  lockUntil = null,
}: {
  file: File
  bucket: string
  fileKey: string
  lockUntil?: Date | null
}) {
  const fileBuffer = Buffer.from(await file.arrayBuffer())
  return await uploadToStorage({
    file: fileBuffer,
    bucket,
    fileKey,
    lockUntil,
    declaredType: file.type,
    filename: file.name,
  })
}

function resolveUploadContentType({
  declaredType,
  filename,
  fileKey,
}: {
  declaredType?: string | null
  filename?: string
  fileKey: string
}): string {
  const resolvedFilename = filename ?? fileKey.split("/").pop() ?? fileKey

  return (
    resolveImageMimeType(declaredType, resolvedFilename) ??
    "application/octet-stream"
  )
}

export async function uploadToStorage({
  file,
  bucket,
  fileKey,
  lockUntil = null,
  declaredType,
  filename,
}: {
  file: Uint8Array
  bucket: string
  fileKey: string
  lockUntil?: Date | null
  declaredType?: string | null
  filename?: string
}) {
  const startChecksumTime = performance.now()
  const sha1Checksum = calculateSha1Checksum(file)
  const endChecksumTime = performance.now()
  console.log(
    `Calculating SHA1 checksum took ${(endChecksumTime - startChecksumTime).toFixed(3)} ms`,
    { Bucket: bucket, Key: fileKey }
  )

  const uploadStartTime = performance.now()

  const resolvedContentType = resolveUploadContentType({
    declaredType,
    filename,
    fileKey,
  })

  const upload = new Upload({
    client: getS3Client(),
    params: {
      Bucket: bucket,
      Key: fileKey,
      Body: file,
      ContentType: resolvedContentType,
      ChecksumAlgorithm: "SHA1",
      ChecksumSHA1: sha1Checksum,
      ...(lockUntil === null
        ? {}
        : {
            ObjectLockMode: "COMPLIANCE",
            ObjectLockRetainUntilDate: lockUntil,
          }),
    },
  })
  await upload.done()
  const uploadEndTime = performance.now()
  console.log(
    `File upload took ${(uploadEndTime - uploadStartTime).toFixed(3)} ms`,
    {
      Bucket: bucket,
      Key: fileKey,
      ChecksumSHA1: sha1Checksum,
    }
  )
  return { uploadCompletedAt: new Date() }
}

export async function uploadFilePathToStorage({
  filePath,
  bucket,
  fileKey,
  lockUntil = null,
  ACL = "public-read",
}: {
  filePath: string
  bucket: string
  fileKey: string
  lockUntil?: Date | null
  ACL?: "private" | "public-read" | "public-read-write"
}) {
  const startChecksumTime = performance.now()
  const sha1Checksum = await sha1ChecksumForFile(filePath)
  const endChecksumTime = performance.now()
  console.debug(
    `Calculating SHA1 checksum took ${(endChecksumTime - startChecksumTime).toFixed(3)} ms`,
    { Bucket: bucket, Key: fileKey }
  )

  const fileStream = createReadStream(filePath)
  const streamErrorPromise = new Promise<never>((_, reject) => {
    fileStream.on("error", reject)
  })

  const uploadStartTime = performance.now()
  const upload = new Upload({
    client: getS3Client(),
    params: {
      Bucket: bucket,
      Key: fileKey,
      Body: fileStream,
      ACL,
      ChecksumAlgorithm: "SHA1",
      ChecksumSHA1: sha1Checksum,
      ...(lockUntil === null
        ? {}
        : {
            ObjectLockMode: "COMPLIANCE",
            ObjectLockRetainUntilDate: lockUntil,
          }),
    },
  })

  await Promise.race([upload.done(), streamErrorPromise])

  const uploadEndTime = performance.now()
  console.debug(
    `File upload took ${(uploadEndTime - uploadStartTime).toFixed(3)} ms`,
    {
      Bucket: bucket,
      Key: fileKey,
      ChecksumSHA1: sha1Checksum,
    }
  )
  return { uploadCompletedAt: new Date() }
}

function sha1ChecksumForFile(path: string) {
  return new Promise<string>((resolve, reject) => {
    const stream = createReadStream(path)
    const hash = crypto.createHash("sha1")
    stream.on("error", reject)
    stream.on("data", (chunk) => hash.update(chunk))
    stream.on("end", () => resolve(hash.digest("base64")))
  })
}

function calculateSha1Checksum(data: Uint8Array) {
  const hash = crypto.createHash("sha1")
  hash.update(Buffer.from(data))
  return hash.digest("base64")
}

export async function deleteFileFromStorage({
  bucket,
  fileKey,
}: {
  bucket: string
  fileKey: string
}) {
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    })
  )
}

export async function downloadFileFromStorage({
  bucket,
  fileKey,
}: {
  bucket: string
  fileKey: string
}) {
  const downloadStartTime = performance.now()

  const response = await getS3Client().send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    })
  )

  const downloadEndTime = performance.now()
  console.debug(
    `File download took ${(downloadEndTime - downloadStartTime).toFixed(3)} ms`,
    {
      Bucket: bucket,
      Key: fileKey,
    }
  )

  return {
    body: response.Body,
    async getBuffer() {
      if (response.Body === undefined) {
        throw new Error("File body is empty")
      }
      return Buffer.from(await response.Body.transformToByteArray())
    },
    contentType: response.ContentType,
    contentLength: response.ContentLength,
    metadata: response.Metadata,
    eTag: response.ETag,
    lastModified: response.LastModified,
  }
}

export async function getSignedUrlForDownload({
  bucket,
  fileKey,
  expiresInSeconds = 60 * 10,
}: {
  bucket: string
  fileKey: string
  expiresInSeconds?: number
}) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: fileKey,
  })
  return await getSignedUrl(getS3Client(), command, {
    expiresIn: expiresInSeconds,
  })
}

export async function putObjects({
  keys,
  bodies,
  bucketName,
  contentTypes = [],
}: {
  keys: string[]
  bodies: (Buffer | Uint8Array | Blob | string)[]
  contentTypes: string[]
  bucketName: string
}) {
  if (keys.length !== bodies.length) {
    throw new Error("Keys and bodies must have the same length")
  }
  if (contentTypes.length > 0 && contentTypes.length !== keys.length) {
    throw new Error(
      "ContentTypes must be empty or have the same length as keys"
    )
  }

  await Promise.all(
    keys.map((k, i) =>
      new Upload({
        client: getS3Client(),
        params: {
          Bucket: bucketName,
          Key: k,
          Body: bodies[i],
          ContentType: contentTypes[i] || "application/octet-stream",
        },
      }).done()
    )
  )
}

export type DetectedImageFormat = "png" | "jpeg"

export type ResolvedImageMimeType = "image/png" | "image/jpeg"

function normalizeImageMimeType(
  mimeType: string
): ResolvedImageMimeType | null {
  const normalized = mimeType.trim().toLowerCase()
  if (normalized === "image/png") return "image/png"
  if (normalized === "image/jpeg" || normalized === "image/jpg") {
    return "image/jpeg"
  }
  return null
}

function imageMimeTypeFromFilename(
  filename: string
): ResolvedImageMimeType | null {
  const ext = filename.split(".").pop()?.toLowerCase()
  if (ext === "png") return "image/png"
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg"
  return null
}

export function resolveImageMimeType(
  declaredType?: string | null,
  filename?: string
): ResolvedImageMimeType | null {
  if (declaredType !== undefined && declaredType !== null) {
    const fromDeclared = normalizeImageMimeType(declaredType)
    if (fromDeclared !== null) return fromDeclared
  }

  if (filename !== undefined) {
    return imageMimeTypeFromFilename(filename)
  }

  return null
}
