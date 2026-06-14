import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prismaToAdminEditData } from "@workspace/application/prisma"
import prisma from "@workspace/database/client"
import { getSignedUrlForDownload } from "@workspace/file-upload/s3-client"
import { ApplicationView } from "@/components/application-view"
import { ApplicationInquiryFooter } from "@/components/application-inquiry-footer"
import { env } from "@/env"

const FOTO_URL_EXPIRES_IN_SECONDS = 60 * 60

interface ApplicationPageProps {
  params: Promise<{ applicationId: string }>
}

export async function generateMetadata({
  params,
}: ApplicationPageProps): Promise<Metadata> {
  const { applicationId } = await params
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { firstName: true, lastName: true },
  })

  if (application === null) {
    return { title: "Bewerbung nicht gefunden" }
  }

  return {
    title: `${application.firstName} ${application.lastName} · Bewerbung`,
  }
}

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const { applicationId } = await params
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  })

  if (application === null) {
    notFound()
  }

  const [data, fotoUrl] = await Promise.all([
    Promise.resolve(prismaToAdminEditData(application)),
    getSignedUrlForDownload({
      bucket: env.S3_BUCKET_NAME,
      fileKey: application.fotoS3Key,
      expiresInSeconds: FOTO_URL_EXPIRES_IN_SECONDS,
    }),
  ])

  return (
    <>
      <main className="mx-auto min-h-dvh w-full max-w-lg px-4 py-6 pb-28 sm:px-6">
        <header className="mb-8 space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {application.firstName} {application.lastName}
            </h1>
            <p className="text-muted-foreground text-sm">Bewerbung ansehen</p>
          </div>
          <div className="bg-muted mx-auto aspect-[3/4] w-full max-w-[12rem] overflow-hidden rounded-xl sm:max-w-[14rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoUrl}
              alt={`${application.firstName} ${application.lastName}`}
              className="h-full w-full object-cover"
            />
          </div>
        </header>

        <ApplicationView data={data} />
      </main>

      <ApplicationInquiryFooter applicationId={applicationId} />
    </>
  )
}
