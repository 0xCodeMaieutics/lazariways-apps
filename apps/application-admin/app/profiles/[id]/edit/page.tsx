import { notFound } from "next/navigation"
import { prismaToAdminEditData } from "@workspace/profile/prisma"
import prisma from "@workspace/database/client"
import { getSignedUrlForDownload } from "@workspace/file-upload/s3-client"
import { BackLink } from "@/components/back-link"
import { requireAdminSessionForPage } from "@/lib/auth"
import { env } from "@/env"
import { ProfileEditForm } from "./page.client"

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProfilePage({ params }: EditPageProps) {
  const { id } = await params
  await requireAdminSessionForPage(`/profiles/${id}/edit`)

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: { languages: { orderBy: { language: "asc" } } },
  })

  if (profile === null) {
    notFound()
  }

  const [defaultValues, fotoUrl] = await Promise.all([
    Promise.resolve(prismaToAdminEditData(profile)),
    getSignedUrlForDownload({
      bucket: env.S3_BUCKET_NAME,
      fileKey: profile.fotoS3Key,
      expiresInSeconds: 60 * 10,
    }),
  ])

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6">
      <header className="mb-6 space-y-4">
        <BackLink href="/profiles" label="Profiles" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">Edit profile</p>
        </div>
        <div className="mx-auto h-40 w-32 overflow-hidden rounded-lg bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoUrl}
            alt={`${profile.firstName} ${profile.lastName}`}
            className="h-full w-full object-cover"
          />
        </div>
      </header>

      <ProfileEditForm profileId={id} defaultValues={defaultValues} />
    </main>
  )
}
