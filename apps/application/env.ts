import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const isDevelopment = process.env.NODE_ENV === "development"

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    S3_REGION: z.string(),
    S3_ENDPOINT: z.url(),
    S3_ACCESS_KEY: z.string(),
    S3_SECRET_KEY: z.string(),
    S3_BUCKET_NAME: z.string(),
    RESEND_API_KEY: isDevelopment ? z.string().optional() : z.string(),
    RESEND_FROM_EMAIL: isDevelopment ? z.email().optional() : z.email(),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    S3_REGION: process.env.S3_REGION,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  },
  emptyStringAsUndefined: true,
  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),
})
