import { env } from "@/env"
import { createAndSendVerificationCode } from "@workspace/verification"

export const POST = async () => {
  try {
    const result = await createAndSendVerificationCode({
      chatId: env.TELEGRAM_CHAT_ID,
      token: env.TELEGRAM_BOT_TOKEN,
    })

    if (result.success === false) {
      return Response.json(
        { error: "Please wait before requesting another code." },
        { status: 429 }
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("SEND_VERIFICATION_CODE_FAILED", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
