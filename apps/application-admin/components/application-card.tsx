import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { InstagramLink } from "./instagram-link"

interface ApplicationCardProps {
  id: string
  firstName: string
  lastName: string
  linkedUniversityName: string | null
  fotoUrl: string
  instagram: string | null
}

export function ApplicationCard({
  id,
  firstName,
  lastName,
  linkedUniversityName,
  fotoUrl,
  instagram,
}: ApplicationCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/40">
      <Link
        href={`/applications/${id}/edit`}
        className="flex flex-1 items-center gap-4"
      >
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoUrl}
            alt={`${firstName} ${lastName}`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {firstName} {lastName}
          </p>
          {linkedUniversityName !== null ? (
            <Badge
              variant="secondary"
              className="mt-1 max-w-[200px] min-w-0 justify-start"
              title={linkedUniversityName}
            >
              <span className="min-w-0 truncate">{linkedUniversityName}</span>
            </Badge>
          ) : null}
        </div>
      </Link>
      {instagram !== null && <InstagramLink handle={instagram} />}
    </div>
  )
}
