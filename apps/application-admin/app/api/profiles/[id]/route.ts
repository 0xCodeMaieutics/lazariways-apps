import { adminProfileEditSchema } from "@workspace/profile/schema"
import {
  profileLanguagesToPrismaCreate,
  profileToPrismaData,
} from "@workspace/profile/prisma"
import prisma from "@workspace/database/client"
import { requireAdminSessionForApi } from "@/lib/auth"
import { normalizeProfileAdminEditInput } from "@/lib/normalize-profile-edit-input"

export const PUT = async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const authResult = await requireAdminSessionForApi()
  if (authResult instanceof Response) {
    return authResult
  }

  const { id } = await context.params
  const parsed = adminProfileEditSchema.safeParse(
    normalizeProfileAdminEditInput(await request.json())
  )

  if (!parsed.success) {
    console.error("ZOD_VALIDATION_FAILED", parsed.error)
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const existing = await prisma.profile.findUnique({ where: { id } })

  if (existing === null) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id },
        data: profileToPrismaData(parsed.data),
      })
      await tx.profileLanguage.deleteMany({ where: { profileId: id } })
      await tx.profileLanguage.createMany({
        data: profileLanguagesToPrismaCreate(parsed.data.languages).map(
          (entry) => ({
            ...entry,
            profileId: id,
          })
        ),
      })
    })
  } catch (error) {
    console.error("PROFILE_DB_UPDATE_FAILED", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  return Response.json({ success: true })
}
