import prisma from "@workspace/database/client"
import { requireAdminSessionForApi } from "@/lib/auth"
import {
  normalizeUniversityInput,
  optionalUniversityString,
} from "@/lib/normalize-university-input"
import { universityCreateSchema } from "@/lib/university-schema"

export const POST = async (request: Request) => {
  const authResult = await requireAdminSessionForApi()
  if (authResult instanceof Response) {
    return authResult
  }

  const parsed = universityCreateSchema.safeParse(
    normalizeUniversityInput(await request.json())
  )

  if (!parsed.success) {
    console.error("ZOD_VALIDATION_FAILED", parsed.error)
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const data = parsed.data

  try {
    const university = await prisma.university.create({
      data: {
        name: data.name.trim(),
        street: optionalUniversityString(data.street),
        streetNumber: optionalUniversityString(data.streetNumber),
        postalCode: optionalUniversityString(data.postalCode),
        city: optionalUniversityString(data.city),
        country: optionalUniversityString(data.country),
        telephone: optionalUniversityString(data.telephone),
        email: optionalUniversityString(data.email),
        website: optionalUniversityString(data.website),
      },
    })

    return Response.json({ success: true, id: university.id })
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "A university with this name already exists" },
        { status: 409 }
      )
    }

    console.error("UNIVERSITY_DB_CREATE_FAILED", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
