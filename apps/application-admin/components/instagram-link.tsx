import { Link as LinkIcon } from "lucide-react"
import { instagramProfileUrl } from "@/lib/instagram"

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
      className="inline-flex shrink-0 text-muted-foreground transition-colors hover:text-foreground"
      aria-label={`Open Instagram profile @${username}`}
    >
      <LinkIcon className="size-4" />
    </a>
  )
}
