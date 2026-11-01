import { prisma } from "@lazariways/database/client"
import { getSignedUrlForDownload } from "@lazariways/file-upload/s3-client"
import { Button } from "@lazariways/ui/components/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

import { AdminNav } from "@/components/admin-nav"
import { ApplicationCard } from "@/components/application-card"
import { ApplicationFiltersBar } from "@/components/application-filters"
import { RefreshButton } from "@/components/refresh-button"
import { env } from "@/env"
import {
  buildApplicationsHref,
  buildApplicationWhere,
  hasActiveApplicationFilters,
  parseApplicationFilters,
  type ApplicationFilterSearchParams,
} from "@/lib/application-filters"
import { requireAdminSessionForPage } from "@/lib/auth"
import { APPLICATIONS_PER_PAGE } from "@/lib/constants"
import {
  formatSubmittedAtTime,
  getSubmittedAtGroupRange,
  groupBySubmittedAt,
} from "@/lib/format-submitted-at-group"

interface ApplicationsPageProps {
  searchParams: Promise<ApplicationFilterSearchParams & { page?: string }>
}

export default async function ApplicationsPage({ searchParams }: ApplicationsPageProps) {
  const params = await searchParams
  const filters = parseApplicationFilters(params)
  const isFiltered = hasActiveApplicationFilters(filters)
  const where = buildApplicationWhere(filters)

  const page = Math.max(1, Number(params.page ?? "1") || 1)
  const skip = (page - 1) * APPLICATIONS_PER_PAGE

  const [, applications, totalCount, universities] = await Promise.all([
    requireAdminSessionForPage("/applications"),
    prisma.application.findMany({
      where,
      skip,
      take: APPLICATIONS_PER_PAGE,
      orderBy: { submittedAt: "desc" },
      include: { linkedUniversity: true },
    }),
    prisma.application.count({ where }),
    prisma.university.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
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

  // Only the first and last day on a page can continue onto a neighbouring page.
  const edgeGroupKeys = [...new Set([applicationGroups[0]?.key, applicationGroups.at(-1)?.key])].filter(
    (key): key is string => key !== undefined
  )
  const edgeGroupCounts = new Map(
    await Promise.all(
      edgeGroupKeys.map(async (key) => {
        const { start, end } = getSubmittedAtGroupRange(key)
        const count = await prisma.application.count({
          where: { AND: [where, { submittedAt: { gte: start, lt: end } }] },
        })
        return [key, count] as const
      })
    )
  )

  return (
    <>
      <AdminNav />
      <main className="mx-auto w-full max-w-lg px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:max-w-6xl md:px-6 md:pb-6">
        <header className="mb-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl">განაცხადები</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {isFiltered ? `${totalCount} ნაპოვნი` : `სულ ${totalCount} განაცხადი`}
                {isFiltered ? (
                  <>
                    {" · "}
                    <Link href="/applications" className="text-foreground underline underline-offset-4">
                      ფილტრების გასუფთავება
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
            <RefreshButton label="განახლება" />
          </div>
          <ApplicationFiltersBar filters={filters} universities={universities} />
        </header>

        {applicationGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="font-medium">{isFiltered ? "ვერაფერი მოიძებნა" : "განაცხადები ჯერ არ არის"}</p>
            {isFiltered ? (
              <p className="mt-1 text-sm text-muted-foreground">
                სცადეთ სხვა სახელი ან{" "}
                <Link href="/applications" className="text-foreground underline underline-offset-4">
                  გაასუფთავეთ ფილტრები
                </Link>
                .
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {applicationGroups.map((group) => (
              <section key={group.key} aria-labelledby={`day-${group.key}`}>
                <div className="sticky top-14 z-10 -mx-4 flex items-baseline justify-between gap-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur md:-mx-6 md:mb-3 md:px-6">
                  <h2 id={`day-${group.key}`} className="text-sm font-semibold">
                    {group.label}
                  </h2>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {edgeGroupCounts.get(group.key) ?? group.items.length} განაცხადი
                  </span>
                </div>
                <div className="divide-y divide-border md:grid md:grid-cols-3 md:gap-3 md:divide-y-0 lg:grid-cols-4">
                  {group.items.map(({ application, fotoUrl }) => (
                    <ApplicationCard
                      key={application.id}
                      id={application.id}
                      firstName={application.firstName}
                      lastName={application.lastName}
                      linkedUniversityName={application.linkedUniversity?.name ?? null}
                      customUniversityName={application.university?.trim() || null}
                      germanLevel={application.germanLevel}
                      fotoUrl={fotoUrl}
                      instagram={application.instagram}
                      submittedTime={formatSubmittedAtTime(application.submittedAt)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <nav aria-label="გვერდები" className="mt-8 flex items-center justify-between gap-4">
            {currentPage > 1 ? (
              <Button variant="outline" size="lg" asChild>
                <Link href={buildApplicationsHref(filters, currentPage - 1)}>
                  <ChevronLeft />
                  წინა
                </Link>
              </Button>
            ) : (
              <span />
            )}
            <span className="text-sm text-muted-foreground tabular-nums">
              გვერდი {currentPage} / {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Button variant="outline" size="lg" asChild>
                <Link href={buildApplicationsHref(filters, currentPage + 1)}>
                  შემდეგი
                  <ChevronRight />
                </Link>
              </Button>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </main>
    </>
  )
}
