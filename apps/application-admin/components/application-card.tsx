import type { GermanLevel } from "@workspace/database/browser"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"

import { instagramProfileUrl } from "@/lib/instagram"

import { InstagramLink } from "./instagram-link"

interface ApplicationCardProps {
  id: string
  firstName: string
  lastName: string
  linkedUniversityName: string | null
  germanLevel: GermanLevel | null
  fotoUrl: string
  instagram: string | null
  submittedTime: string
}

export function ApplicationCard({
  id,
  firstName,
  lastName,
  linkedUniversityName,
  germanLevel,
  fotoUrl,
  instagram,
  submittedTime,
}: ApplicationCardProps) {
  const hasInstagram = instagramProfileUrl(instagram ?? undefined) !== null

  return (
    <div className="relative">
      <Link
        href={`/applications/${id}/edit`}
        className={cn(
          "flex items-center gap-3 rounded-lg py-3 transition-colors outline-none hover:bg-accent/40 focus-visible:ring-3 focus-visible:ring-ring/50 md:h-full md:flex-col md:items-stretch md:gap-3 md:rounded-xl md:border md:border-border md:bg-card md:p-3",
          hasInstagram && "pr-12 md:pr-3"
        )}
      >
        <div className="aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-md bg-muted md:w-full md:rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-sm font-semibold md:text-base">
            {firstName} {lastName}
          </p>
          <p
            className="truncate text-xs text-muted-foreground md:text-sm"
            title={linkedUniversityName ?? undefined}
          >
            {linkedUniversityName ?? "—"}
          </p>
          <div className={cn("mt-1.5 flex items-center gap-2", hasInstagram && "md:pr-10")}>
            {germanLevel !== null ? <Badge variant="secondary">Deutsch {germanLevel}</Badge> : null}
            <span className="text-xs text-muted-foreground tabular-nums">{submittedTime}</span>
          </div>
        </div>
      </Link>
      {hasInstagram ? (
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 md:top-auto md:right-3 md:bottom-3 md:translate-y-0">
          <InstagramLink
            handle={instagram ?? undefined}
            className="before:absolute before:-inset-2 before:content-['']"
          />
        </div>
      ) : null}
    </div>
  )
}
