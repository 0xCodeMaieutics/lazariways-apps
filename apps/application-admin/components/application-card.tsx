import Link from "next/link"
import { InstagramLink } from "./instagram-link"

interface ApplicationCardProps {
  id: string
  firstName: string
  lastName: string
  submittedAtLabel: string
  fotoUrl: string
  instagram: string | null
}

export function ApplicationCard({
  id,
  firstName,
  lastName,
  submittedAtLabel,
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
          <p className="text-sm text-muted-foreground">{submittedAtLabel}</p>
        </div>
      </Link>
      {instagram !== null && <InstagramLink handle={instagram} />}
    </div>
  )
}
