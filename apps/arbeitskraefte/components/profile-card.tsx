import { Button } from "@workspace/ui/components/button"
import {
  formatAgeLabel,
  formatLanguages,
  formatMaskedName,
} from "@/lib/profile-display"

interface ProfileCardProps {
  firstName: string
  lastName: string
  birthDate: Date
  isStudent: boolean
  workSectors: string[]
  languages: { language: string; level: string }[]
  fotoUrl: string
}

export function ProfileCard({
  firstName,
  lastName,
  birthDate,
  isStudent,
  workSectors,
  languages,
  fotoUrl,
}: ProfileCardProps) {
  const maskedName = formatMaskedName(firstName, lastName)

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fotoUrl}
          alt={maskedName}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-base font-medium">{maskedName}</p>
        <p className="shrink-0 text-sm text-muted-foreground">
          {formatAgeLabel(birthDate)}
        </p>
      </div>

      {isStudent ? (
        <p className="text-sm text-muted-foreground">Im Studium</p>
      ) : null}

      <p className="text-sm">
        <span className="text-muted-foreground">Sprachen: </span>
        {formatLanguages(languages)}
      </p>

      <div className="flex flex-wrap gap-2">
        {workSectors.map((sector) => (
          <span
            key={sector}
            className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground"
          >
            {sector}
          </span>
        ))}
      </div>

      <Button type="button" className="mt-1 h-12 w-full">
        Interessiert ❤️
      </Button>
    </article>
  )
}
