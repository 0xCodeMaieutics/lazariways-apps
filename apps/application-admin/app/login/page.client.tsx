"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

interface LoginFormProps {
  callbackUrl: string
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isSending, startSendTransition] = useTransition()
  const [isVerifying, startVerifyTransition] = useTransition()

  const sendCode = () => {
    startSendTransition(async () => {
      setError(null)
      setInfo(null)

      try {
        const response = await fetch("/api/auth/send-code", { method: "POST" })

        if (response.status === 429) {
          startSendTransition(() => {})
          setError("Please wait 1 minute before requesting another code.")
          return
        }

        if (!response.ok) {
          setError("Could not send code. Please try again.")
          return
        }

        setInfo("Code sent to the Telegram group.")
      } catch {
        setError("Could not send code. Please try again.")
      }
    })
  }

  const verifyCode = () => {
    startVerifyTransition(async () => {
      setError(null)

      try {
        const response = await fetch("/api/auth/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        })

        if (!response.ok) {
          setError("Invalid or expired code.")
          return
        }

        router.push(callbackUrl)
        router.refresh()
      } catch {
        setError("Could not verify code. Please try again.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <Button
        type="button"
        className="w-full"
        onClick={sendCode}
        disabled={isSending}
      >
        {isSending ? "Sending…" : "Send code to Telegram group"}
      </Button>

      <div className="space-y-2">
        <Label htmlFor="code">Verification code</Label>
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="123456"
        />
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={verifyCode}
        disabled={isVerifying || code.trim() === ""}
      >
        {isVerifying ? "Signing in…" : "Sign in"}
      </Button>

      {info !== null ? (
        <p className="text-center text-sm text-green-700">{info}</p>
      ) : null}
      {error !== null ? (
        <p className="text-center text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
