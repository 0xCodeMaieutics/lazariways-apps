import Link from "next/link"

interface ProfileCardProps {
  id: string
  firstName: string
  lastName: string
  createdAtLabel: string
  fotoUrl: string
}

export function ProfileCard({
  id,
  firstName,
  lastName,
  createdAtLabel,
  fotoUrl,
}: ProfileCardProps) {
  return (
    <Link
      href={`/profiles/${id}/edit`}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/40"
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
        <p className="text-sm text-muted-foreground">{createdAtLabel}</p>
      </div>
    </Link>
  )
}
