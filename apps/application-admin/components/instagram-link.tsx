import { instagramProfileUrl } from "@/lib/instagram"
import Image from "next/image"

interface InstagramLinkProps {
  handle: string | undefined
}

export function InstagramLink({ handle }: InstagramLinkProps) {
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
      className="relative inline-flex size-5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
      aria-label={`Open Instagram profile @${username}`}
    >
      <Image src="/instagram.svg" alt="Instagram link" fill aria-hidden />
    </a>
  )
}
