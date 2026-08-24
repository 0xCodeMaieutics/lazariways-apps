import { env } from '@/env'

const POLL_INTERVAL_MS = 3_000
const MAX_POLL_MS = 30_000

interface TaskResponse {
    taskId: string
    statusUrl: string
}

interface StatusResponse {
    finished: boolean
    succeeded: boolean
    result?: string
    message?: string
}

export async function generateAudio(
    text: string,
    voice: string,
): Promise<Buffer> {
    const res = await fetch(
        `https://api.narakeet.com/text-to-speech/m4a?voice=${encodeURIComponent(voice)}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'x-api-key': env.NARAKEET_API_KEY,
            },
            body: text,
        },
    )

    if (!res.ok) {
        throw new Error(
            `Narakeet API error: ${res.status} ${await res.text()}`,
        )
    }

    const task: TaskResponse = await res.json()

    const start = Date.now()
    while (Date.now() - start < MAX_POLL_MS) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))

        const statusRes = await fetch(task.statusUrl)
        if (!statusRes.ok) {
            throw new Error(
                `Narakeet status poll error: ${statusRes.status}`,
            )
        }

        const status: StatusResponse = await statusRes.json()

        if (!status.finished) continue

        if (!status.succeeded) {
            throw new Error(
                `Narakeet generation failed: ${status.message ?? 'unknown error'}`,
            )
        }

        if (!status.result) {
            throw new Error('Narakeet returned no result URL')
        }

        const audioRes = await fetch(status.result)
        if (!audioRes.ok) {
            throw new Error(
                `Failed to download audio: ${audioRes.status}`,
            )
        }

        return Buffer.from(await audioRes.arrayBuffer())
    }

    throw new Error('Narakeet audio generation timed out')
}
