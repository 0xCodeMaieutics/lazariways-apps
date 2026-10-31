import { prismaToAdminEditData } from "@workspace/application/prisma"
import prisma from "@workspace/database/client"
import { getSignedUrlForDownload } from "@workspace/file-upload/s3-client"
import { notFound } from "next/navigation"

import { BackLink } from "@/components/back-link"
import { env } from "@/env"
import { requireAdminSessionForPage } from "@/lib/auth"

import { EditApplicationContent } from "./edit-application-content"

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditApplicationPage({ params }: EditPageProps) {
  const { id } = await params
  const [, application, universities] = await Promise.all([
    requireAdminSessionForPage(`/applications/${id}/edit`),
    prisma.application.findUnique({ where: { id } }),
    prisma.university.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ])

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
        <BackLink href="/applications" label="განაცხადები" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {application.firstName} {application.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">განაცხადის რედაქტირება</p>
        </div>
      </header>

      <EditApplicationContent
        applicationId={id}
        applicationLink={applicationLink}
        defaultValues={defaultValues}
        fotoUrl={fotoUrl}
        applicantName={`${application.firstName} ${application.lastName}`}
        universities={universities}
      />
    </main>
  )
}
