import Link from "next/link"
import prisma from "@workspace/database/client"
import { getSignedUrlForDownload } from "@workspace/file-upload/s3-client"
import { ApplicationCard } from "@/components/application-card"
import { env } from "@/env"
import { requireAdminSessionForPage } from "@/lib/auth"
import { APPLICATIONS_PER_PAGE } from "@/lib/constants"
import { Button } from "@workspace/ui/components/button"

interface ApplicationsPageProps {
  searchParams: Promise<{ page?: string }>
}

function formatSubmittedAt(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  await requireAdminSessionForPage("/applications")

  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam ?? "1") || 1)
  const skip = (page - 1) * APPLICATIONS_PER_PAGE

  const [applications, totalCount] = await Promise.all([
    prisma.application.findMany({
      skip,
      take: APPLICATIONS_PER_PAGE,
      orderBy: { submittedAt: "desc" },
    }),
    prisma.application.count(),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / APPLICATIONS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)

  const applicationsWithFotos = await Promise.all(
    applications.map(async (application) => ({
      application,
      fotoUrl: await getSignedUrlForDownload({
        bucket: env.S3_BUCKET_NAME,
        fileKey: application.fotoS3Key,
        expiresInSeconds: 60 * 10,
      }),
    }))
  )

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalCount} total · Page {currentPage} of {totalPages}
        </p>
      </header>

      <div className="space-y-3">
        {applicationsWithFotos.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No applications yet.
          </p>
        ) : (
          applicationsWithFotos.map(({ application, fotoUrl }) => (
            <ApplicationCard
              key={application.id}
              id={application.id}
              firstName={application.firstName}
              lastName={application.lastName}
              submittedAtLabel={formatSubmittedAt(application.submittedAt)}
              fotoUrl={fotoUrl}
            />
          ))
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-between gap-4">
          {currentPage > 1 ? (
            <Button variant="outline" asChild>
              <Link href={`/applications?page=${currentPage - 1}`}>
                Previous
              </Link>
            </Button>
          ) : (
            <span />
          )}
          {currentPage < totalPages ? (
            <Button variant="outline" asChild>
              <Link href={`/applications?page=${currentPage + 1}`}>Next</Link>
            </Button>
          ) : (
            <span />
          )}
        </div>
      ) : null}
    </main>
  )
}
