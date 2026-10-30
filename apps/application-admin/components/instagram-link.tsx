import { cn } from "@workspace/ui/lib/utils"
import Image from "next/image"

import { instagramProfileUrl } from "@/lib/instagram"

interface InstagramLinkProps {
  handle: string | undefined
  className?: string
}

export function InstagramLink({ handle, className }: InstagramLinkProps) {
  const url = instagramProfileUrl(handle)

  if (url === null) {
    return null
  }

  const username = handle?.trim().replace(/^@/, "") ?? ""

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "relative inline-flex size-5 shrink-0 text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
      aria-label={`Open Instagram profile @${username}`}
    >
      <Image src="/instagram.svg" alt="Instagram link" fill aria-hidden />
    </a>
  )
}
