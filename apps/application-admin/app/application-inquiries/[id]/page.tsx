import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "@workspace/database/client"
import { getSignedUrlForDownload } from "@workspace/file-upload/s3-client"
import { BackLink } from "@/components/back-link"
import { env } from "@/env"
import { requireAdminSessionForPage } from "@/lib/auth"
import { Button } from "@workspace/ui/components/button"

interface ApplicationInquiryDetailPageProps {
  params: Promise<{ id: string }>
}

function formatSubmittedAt(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function DetailField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-sm">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export default async function ApplicationInquiryDetailPage({
  params,
}: ApplicationInquiryDetailPageProps) {
  const { id } = await params
  await requireAdminSessionForPage(`/application-inquiries/${id}`)

  const inquiry = await prisma.applicationInquiry.findUnique({
    where: { id },
    include: {
      application: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fotoS3Key: true,
        },
      },
    },
  })

  if (inquiry === null) {
    notFound()
  }

  const fotoUrl = await getSignedUrlForDownload({
    bucket: env.S3_BUCKET_NAME,
    fileKey: inquiry.application.fotoS3Key,
    expiresInSeconds: 60 * 10,
  })

  const { application } = inquiry

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6">
      <header className="mb-6 space-y-4">
        <BackLink
          href="/application-inquiries"
          label="Application Inquiries"
        />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {inquiry.companyName}
          </h1>
          <p className="text-muted-foreground text-sm">Application inquiry</p>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="font-medium">Inquiry</h2>
        <div className="border-border space-y-4 rounded-xl border p-4">
          <DetailField label="Submitted">
            {formatSubmittedAt(inquiry.submittedAt)}
          </DetailField>
          <DetailField label="Company">{inquiry.companyName}</DetailField>
          <DetailField label="Contact person">
            {inquiry.contactPersonName}
          </DetailField>
          <DetailField label="Email">
            <a
              href={`mailto:${inquiry.email}`}
              className="text-primary hover:underline"
            >
              {inquiry.email}
            </a>
          </DetailField>
          <DetailField label="Phone">
            {inquiry.phone !== null ? (
              <a
                href={`tel:${inquiry.phone}`}
                className="text-primary hover:underline"
              >
                {inquiry.phone}
              </a>
            ) : (
              <span className="text-muted-foreground">Not provided</span>
            )}
          </DetailField>
          <DetailField label="Message">
            {inquiry.message !== null ? (
              <p className="whitespace-pre-wrap">{inquiry.message}</p>
            ) : (
              <span className="text-muted-foreground">Not provided</span>
            )}
          </DetailField>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="font-medium">Applicant</h2>
        <div className="border-border space-y-4 rounded-xl border p-4">
          <div className="bg-muted mx-auto h-40 w-32 overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoUrl}
              alt={`${application.firstName} ${application.lastName}`}
              className="h-full w-full object-cover"
            />
          </div>
          <DetailField label="Name">
            {application.firstName} {application.lastName}
          </DetailField>
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/applications/${application.id}/edit`}>
              View application
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
