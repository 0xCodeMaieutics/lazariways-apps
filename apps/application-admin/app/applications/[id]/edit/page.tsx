import { notFound } from "next/navigation"
import { prismaToAdminEditData } from "@workspace/application/prisma"
import prisma from "@workspace/database/client"
import { getSignedUrlForDownload } from "@workspace/file-upload/s3-client"
import { BackLink } from "@/components/back-link"
import { CopyApplicationLinkButton } from "@/components/copy-application-link-button"
import { requireAdminSessionForPage } from "@/lib/auth"
import { env } from "@/env"
import { ApplicationEditForm } from "./page.client"

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditApplicationPage({ params }: EditPageProps) {
  const { id } = await params
  await requireAdminSessionForPage(`/applications/${id}/edit`)
  const application = await prisma.application.findUnique({ where: { id } })

  if (application === null) {
    notFound()
  }

  const [defaultValues, fotoUrl] = await Promise.all([
    Promise.resolve(prismaToAdminEditData(application)),
    getSignedUrlForDownload({
      bucket: env.S3_BUCKET_NAME,
      fileKey: application.fotoS3Key,
      expiresInSeconds: 60 * 10,
    }),
  ])

  const applicationLink = `${env.BEWERBER_APP_URL.replace(/\/$/, "")}/${id}`

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6">
      <header className="mb-6 space-y-4">
        <BackLink href="/applications" label="Applications" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {application.firstName} {application.lastName}
          </h1>
          <p className="text-muted-foreground text-sm">Edit application</p>
        </div>
        <CopyApplicationLinkButton applicationLink={applicationLink} />
        <div className="bg-muted mx-auto h-40 w-32 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoUrl}
            alt={`${application.firstName} ${application.lastName}`}
            className="h-full w-full object-cover"
          />
        </div>
      </header>

      <ApplicationEditForm applicationId={id} defaultValues={defaultValues} />
    </main>
  )
}
