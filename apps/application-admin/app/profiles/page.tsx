import Link from "next/link"
import prisma from "@workspace/database/client"
import { getSignedUrlForDownload } from "@workspace/file-upload/s3-client"
import { ProfileCard } from "@/components/profile-card"
import { env } from "@/env"
import { requireAdminSessionForPage } from "@/lib/auth"
import { PROFILES_PER_PAGE } from "@/lib/constants"
import { Button } from "@workspace/ui/components/button"

interface ProfilesPageProps {
  searchParams: Promise<{ page?: string }>
}

function formatCreatedAt(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

export default async function ProfilesPage({
  searchParams,
}: ProfilesPageProps) {
  await requireAdminSessionForPage("/profiles")

  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam ?? "1") || 1)
  const skip = (page - 1) * PROFILES_PER_PAGE

  const [profiles, totalCount] = await Promise.all([
    prisma.profile.findMany({
      skip,
      take: PROFILES_PER_PAGE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.profile.count(),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / PROFILES_PER_PAGE))
  const currentPage = Math.min(page, totalPages)

  const profilesWithFotos = await Promise.all(
    profiles.map(async (profile) => ({
      profile,
      fotoUrl: await getSignedUrlForDownload({
        bucket: env.S3_BUCKET_NAME,
        fileKey: profile.fotoS3Key,
        expiresInSeconds: 60 * 10,
      }),
    }))
  )

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Profiles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalCount} total · Page {currentPage} of {totalPages}
        </p>
      </header>

      <div className="space-y-3">
        {profilesWithFotos.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No profiles yet.
          </p>
        ) : (
          profilesWithFotos.map(({ profile, fotoUrl }) => (
            <ProfileCard
              key={profile.id}
              id={profile.id}
              firstName={profile.firstName}
              lastName={profile.lastName}
              createdAtLabel={formatCreatedAt(profile.createdAt)}
              fotoUrl={fotoUrl}
            />
          ))
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-between gap-4">
          {currentPage > 1 ? (
            <Button variant="outline" asChild>
              <Link href={`/profiles?page=${currentPage - 1}`}>Previous</Link>
            </Button>
          ) : (
            <span />
          )}
          {currentPage < totalPages ? (
            <Button variant="outline" asChild>
              <Link href={`/profiles?page=${currentPage + 1}`}>Next</Link>
            </Button>
          ) : (
            <span />
          )}
        </div>
      ) : null}
    </main>
  )
}
