"use client"

import { Button } from "@workspace/ui/components/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface CopyApplicationLinkButtonProps {
  applicationLink: string
}

export function CopyApplicationLinkButton({ applicationLink }: CopyApplicationLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(applicationLink)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button type="button" variant="outline" className="w-full" onClick={copyLink}>
      {copied ? (
        <>
          <Check />
          ბმული დაკოპირდა
        </>
      ) : (
        <>
          <Copy />
          განაცხადის ბმულის კოპირება
        </>
      )}
    </Button>
  )
}
