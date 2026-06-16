import Link from "next/link"
import prisma from "@workspace/database/client"
import { getSignedUrlForDownload } from "@workspace/file-upload/s3-client"
import { ApplicationInquiryCard } from "@/components/application-inquiry-card"
import { env } from "@/env"
import { requireAdminSessionForPage } from "@/lib/auth"
import { APPLICATION_INQUIRIES_PER_PAGE } from "@/lib/constants"
import { Button } from "@workspace/ui/components/button"

interface ApplicationInquiriesPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function ApplicationInquiriesPage({
  searchParams,
}: ApplicationInquiriesPageProps) {
  await requireAdminSessionForPage("/application-inquiries")

  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam ?? "1") || 1)
  const skip = (page - 1) * APPLICATION_INQUIRIES_PER_PAGE

  const [inquiries, totalCount] = await Promise.all([
    prisma.applicationInquiry.findMany({
      skip,
      take: APPLICATION_INQUIRIES_PER_PAGE,
      orderBy: { submittedAt: "desc" },
      include: {
        application: {
          select: {
            firstName: true,
            lastName: true,
            fotoS3Key: true,
          },
        },
      },
    }),
    prisma.applicationInquiry.count(),
  ])

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / APPLICATION_INQUIRIES_PER_PAGE)
  )
  const currentPage = Math.min(page, totalPages)

  const inquiriesWithFotos = await Promise.all(
    inquiries.map(async (inquiry) => ({
      inquiry,
      fotoUrl: await getSignedUrlForDownload({
        bucket: env.S3_BUCKET_NAME,
        fileKey: inquiry.application.fotoS3Key,
        expiresInSeconds: 60 * 10,
      }),
    }))
  )

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Application Inquiries
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalCount} total · Page {currentPage} of {totalPages}
        </p>
      </header>

      <div className="space-y-3">
        {inquiriesWithFotos.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No application inquiries yet.
          </p>
        ) : (
          inquiriesWithFotos.map(({ inquiry, fotoUrl }) => (
            <ApplicationInquiryCard
              key={inquiry.id}
              id={inquiry.id}
              companyName={inquiry.companyName}
              fotoUrl={fotoUrl}
              applicantFirstName={inquiry.application.firstName}
              applicantLastName={inquiry.application.lastName}
            />
          ))
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-between gap-4">
          {currentPage > 1 ? (
            <Button variant="outline" asChild>
              <Link href={`/application-inquiries?page=${currentPage - 1}`}>
                Previous
              </Link>
            </Button>
          ) : (
            <span />
          )}
          {currentPage < totalPages ? (
            <Button variant="outline" asChild>
              <Link href={`/application-inquiries?page=${currentPage + 1}`}>
                Next
              </Link>
            </Button>
          ) : (
            <span />
          )}
        </div>
      ) : null}
    </main>
  )
}
