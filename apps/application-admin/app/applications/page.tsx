import Link from "next/link"
import prisma from "@workspace/database/client"
import { getSignedUrlForDownload } from "@workspace/file-upload/s3-client"
import { ApplicationCard } from "@/components/application-card"
import { RefreshButton } from "@/components/refresh-button"
import { env } from "@/env"
import { requireAdminSessionForPage } from "@/lib/auth"
import { APPLICATIONS_PER_PAGE } from "@/lib/constants"
import { groupBySubmittedAt } from "@/lib/format-submitted-at-group"
import { Button } from "@workspace/ui/components/button"

interface ApplicationsPageProps {
  searchParams: Promise<{ page?: string }>
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
      include: { linkedUniversity: true },
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

  const applicationGroups = groupBySubmittedAt(
    applicationsWithFotos,
    ({ application }) => application.submittedAt
  )

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <p className="mt-1 text-sm text-muted-foreground">
            სულ {totalCount} · გვერდი {currentPage} / {totalPages}
          </p>
          <RefreshButton label="განახლება" />
        </div>
      </header>

      {applicationGroups.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No applications yet.
        </p>
      ) : (
        <div className="space-y-6">
          {applicationGroups.map((group) => (
            <section key={group.key} className="space-y-3">
              <h2 className="text-sm text-muted-foreground">{group.label}</h2>
              {group.items.map(({ application, fotoUrl }) => (
                <ApplicationCard
                  key={application.id}
                  id={application.id}
                  firstName={application.firstName}
                  lastName={application.lastName}
                  linkedUniversityName={
                    application.linkedUniversity?.name ?? null
                  }
                  fotoUrl={fotoUrl}
                  instagram={application.instagram}
                />
              ))}
            </section>
          ))}
        </div>
      )}

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
