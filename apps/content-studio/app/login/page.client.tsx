"use client"

import { Button } from "@lazariways/ui/components/button"
import { Input } from "@lazariways/ui/components/input"
import { Label } from "@lazariways/ui/components/label"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

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
          setError("ახალი კოდის მოთხოვნამდე დაელოდეთ 1 წუთი.")
          return
        }

        if (!response.ok) {
          setError("კოდის გაგზავნა ვერ მოხერხდა. სცადეთ თავიდან.")
          return
        }

        setInfo("კოდი გაიგზავნა Telegram-ის ჯგუფში.")
      } catch {
        setError("კოდის გაგზავნა ვერ მოხერხდა. სცადეთ თავიდან.")
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
          setError("კოდი არასწორია ან ვადაგასულია.")
          return
        }

        router.push(callbackUrl)
        router.refresh()
      } catch {
        setError("კოდის შემოწმება ვერ მოხერხდა. სცადეთ თავიდან.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <Button type="button" className="w-full" onClick={sendCode} disabled={isSending}>
        {isSending ? "იგზავნება…" : "კოდის გაგზავნა Telegram-ის ჯგუფში"}
      </Button>

      <div className="space-y-2">
        <Label htmlFor="code">დამადასტურებელი კოდი</Label>
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
        {isVerifying ? "მიმდინარეობს შესვლა…" : "შესვლა"}
      </Button>

      {info !== null ? <p className="text-center text-sm text-green-700">{info}</p> : null}
      {error !== null ? <p className="text-center text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
