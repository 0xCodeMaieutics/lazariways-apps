import { z } from "zod"
import { router, authedProcedure } from "../server"
import { prisma } from "@workspace/database/client"
import { uploadToStorage } from "@workspace/file-upload/s3-client"
import { env } from "@/env"
import { TRPCError } from "@trpc/server"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]

export const userRouter = router({
  uploadImage: authedProcedure
    .input(
      z.object({
        base64: z.string().min(1),
        contentType: z.string().refine((v) => ALLOWED_MIME_TYPES.includes(v), {
          message: "Unsupported image type",
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.base64, "base64")

      if (buffer.byteLength > MAX_FILE_SIZE) {
        throw new TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message: "Image must be under 5 MB",
        })
      }

      const ext = input.contentType.split("/")[1]
      const key = `learning-app-platform/avatars/${ctx.session.user.id}/${crypto.randomUUID()}.${ext}`

      await uploadToStorage({
        file: buffer,
        bucket: env.S3_BUCKET_NAME,
        fileKey: key,
        declaredType: input.contentType,
      })

      await prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { image: key },
      })

      return { key }
    }),
})
