import { z } from "zod"

const importEnvSchema = z.object({
  DATABASE_URL: z.url(),
  NARAKEET_API_KEY: z.string().min(1),
  BUCKET_AUDIOS_PATH: z.string().min(1),
  S3_BUCKET_NAME: z.string().min(1),
  S3_REGION: z.string().min(1),
  S3_ENDPOINT: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
})

export type ImportEnv = z.output<typeof importEnvSchema>

export function readImportEnv(): ImportEnv {
  const result = importEnvSchema.safeParse(process.env)
  if (!result.success) {
    const missingNames = result.error.issues.map((issue) => issue.path.join("."))
    throw new Error(`Missing or invalid environment variables: ${missingNames.join(", ")}`)
  }
  return result.data
}
