import { notFound, redirect } from "next/navigation"
import { prismaToAdminEditData } from "@workspace/application/prisma"
import prisma from "@workspace/database/client"
import { getSignedUrlForDownload } from "@workspace/file-upload/s3-client"
import { getAdminSession } from "@/lib/auth"
import { env } from "@/env"
import { ApplicationEditForm } from "./page.client"

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditApplicationPage({ params }: EditPageProps) {
  const session = await getAdminSession()
  if (session === null) {
    const { id } = await params
    redirect(`/login?callbackUrl=/applications/${id}/edit`)
  }

  const { id } = await params
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

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6">
      <header className="mb-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {application.firstName} {application.lastName}
          </h1>
          <p className="text-muted-foreground text-sm">Edit application</p>
        </div>
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
