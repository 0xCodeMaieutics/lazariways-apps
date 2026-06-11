import Link from "next/link"
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
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-foreground inline-flex shrink-0 transition-colors"
      aria-label={`Open Instagram profile @${username}`}
    >
      <LinkIcon className="size-4" />
    </Link>
  )
}
