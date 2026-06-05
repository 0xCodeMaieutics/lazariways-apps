import { createAndSendVerificationCode } from "@/lib/verification"

export const POST = async () => {
  try {
    const result = await createAndSendVerificationCode()

    if (result.error === "cooldown") {
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
