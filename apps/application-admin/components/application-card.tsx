import Link from "next/link"
import type { GermanLevel } from "@workspace/database/browser"
import { Badge } from "@workspace/ui/components/badge"
import { InstagramLink } from "./instagram-link"

interface ApplicationCardProps {
  id: string
  firstName: string
  lastName: string
  linkedUniversityName: string | null
  germanLevel: GermanLevel | null
  fotoUrl: string
  instagram: string | null
}

export function ApplicationCard({
  id,
  firstName,
  lastName,
  linkedUniversityName,
  germanLevel,
  fotoUrl,
  instagram,
}: ApplicationCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/40 md:flex-col md:items-stretch md:gap-3">
      <Link
        href={`/applications/${id}/edit`}
        className="flex flex-1 items-center gap-4 md:flex-col md:items-stretch md:gap-3"
      >
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted md:aspect-[4/3] md:h-auto md:w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoUrl}
            alt={`${firstName} ${lastName}`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="truncate font-medium md:whitespace-normal">
            {firstName} {lastName}
          </p>
          {linkedUniversityName !== null || germanLevel !== null ? (
            <div className="flex flex-wrap gap-1">
              {linkedUniversityName !== null ? (
                <Badge
                  variant="secondary"
                  className="max-w-[200px] min-w-0 justify-start md:max-w-none"
                  title={linkedUniversityName}
                >
                  <span className="min-w-0 truncate md:whitespace-normal">
                    {linkedUniversityName}
                  </span>
                </Badge>
              ) : null}
              {germanLevel !== null ? (
                <Badge variant="secondary">{germanLevel}</Badge>
              ) : null}
            </div>
          ) : null}
        </div>
      </Link>
      {instagram !== null ? (
        <div className="shrink-0 self-center md:self-end">
          <InstagramLink handle={instagram} />
        </div>
      ) : null}
    </div>
  )
}
