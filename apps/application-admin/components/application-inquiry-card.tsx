import Link from "next/link"

interface ApplicationInquiryCardProps {
  id: string
  companyName: string
  fotoUrl: string
  applicantFirstName: string
  applicantLastName: string
}

export function ApplicationInquiryCard({
  id,
  companyName,
  fotoUrl,
  applicantFirstName,
  applicantLastName,
}: ApplicationInquiryCardProps) {
  return (
    <Link
      href={`/application-inquiries/${id}`}
      className="border-border bg-card hover:bg-accent/40 flex items-center gap-4 rounded-xl border p-4 transition-colors"
    >
      <div className="bg-muted h-16 w-16 shrink-0 overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fotoUrl}
          alt={`${applicantFirstName} ${applicantLastName}`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{companyName}</p>
      </div>
    </Link>
  )
}
