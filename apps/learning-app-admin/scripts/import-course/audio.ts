import { createHash } from "node:crypto"

import { hasFileInStorage, uploadToStorage } from "@lazariways/file-upload/s3-client"

import { generateAudio } from "@/lib/narakeet"

import type { ImportEnv } from "./env"

const VOICE = "monika"

function audioKeyFor(text: string, audiosPath: string) {
  const hash = createHash("sha256").update(`${VOICE}\n${text}`).digest("hex").slice(0, 32)
  return `${audiosPath}/course/${hash}.m4a`
}

export async function ensureAudios(texts: string[], env: ImportEnv): Promise<Map<string, string>> {
  const audioKeyByText = new Map<string, string>()

  for (const text of new Set(texts)) {
    const fileKey = audioKeyFor(text, env.BUCKET_AUDIOS_PATH)
    const hasAudio = await hasFileInStorage({ bucket: env.S3_BUCKET_NAME, fileKey })

    if (!hasAudio) {
      console.log(`Generating audio for "${text}"`)
      const audio = await generateAudio(text, VOICE, env.NARAKEET_API_KEY)
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
