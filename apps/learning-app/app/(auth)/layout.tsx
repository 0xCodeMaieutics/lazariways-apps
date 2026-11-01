import { prisma } from "@lazariways/database/client"
import { getSignedUrlForDownload } from "@lazariways/file-upload/s3-client"
import { redirect } from "next/navigation"
import React from "react"

import { Navbar } from "@/components/navbar"
import { env } from "@/env"
import { getSession } from "@/lib/auth.server"
import { cn } from "@/lib/utils"

export default async function AuthLayout({ children }: React.PropsWithChildren) {
  const session = await getSession()

  if (session === null) {
    redirect("/login")
  }

  // Read from the DB: the session cookie cache can hold a stale image after an upload.
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, image: true },
  })

  const profileImageUrl = dbUser?.image
    ? await getSignedUrlForDownload({
        bucket: env.S3_BUCKET_NAME,
        fileKey: dbUser.image,
      })
    : null

  return (
    <>
      <Navbar profileImageUrl={profileImageUrl} profileName={dbUser?.name ?? session.user.name} />
      <main className={cn("mx-auto h-screen w-full pt-14")}>{children}</main>
    </>
  )
}
