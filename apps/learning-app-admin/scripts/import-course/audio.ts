import { createHash } from "node:crypto"

import { hasFileInStorage, uploadToStorage } from "@lazariways/file-upload/s3-client"

import { env } from "@/env"
import { generateAudio } from "@/lib/narakeet"

const VOICE = "monika"

function audioKeyFor(text: string) {
  const hash = createHash("sha256").update(`${VOICE}\n${text}`).digest("hex").slice(0, 32)
  return `${env.BUCKET_AUDIOS_PATH}/course/${hash}.m4a`
}

export async function ensureAudios(texts: string[]): Promise<Map<string, string>> {
  const audioKeyByText = new Map<string, string>()

  for (const text of new Set(texts)) {
    const fileKey = audioKeyFor(text)
    const hasAudio = await hasFileInStorage({ bucket: env.S3_BUCKET_NAME, fileKey })

    if (!hasAudio) {
      console.log(`Generating audio for "${text}"`)
      const audio = await generateAudio(text, VOICE)
      await uploadToStorage({
        file: audio,
        bucket: env.S3_BUCKET_NAME,
        fileKey,
        declaredType: "audio/mp4",
      })
    }

    audioKeyByText.set(text, fileKey)
  }

  return audioKeyByText
}
