import { generateCertificateOfEnrollmentPdf } from "@workspace/application/pdf"
import prisma from "@workspace/database/client"
import { requireAdminSessionForApi } from "@/lib/auth"

function sanitizeFilenamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 60)
}

function formatIsoDate(date: Date | null | undefined): string | undefined {
  if (date === null || date === undefined) {
    return undefined
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const POST = async (
  _request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const authResult = await requireAdminSessionForApi()
  if (authResult instanceof Response) {
    return authResult
  }

  const { id } = await context.params

  const existing = await prisma.application.findUnique({
    where: { id },
    include: { linkedUniversity: true },
  })
  if (existing === null) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  if (existing.linkedUniversity === null) {
    return Response.json(
      { error: "University needs to be linked" },
      { status: 400 }
    )
  }

  const linkedUniversity = existing.linkedUniversity

  let pdfBytes: Uint8Array
  try {
    pdfBytes = await generateCertificateOfEnrollmentPdf({
      university: {
        name: linkedUniversity.name,
        street: linkedUniversity.street ?? undefined,
        streetNumber: linkedUniversity.streetNumber ?? undefined,
        postalCode: linkedUniversity.postalCode ?? undefined,
        city: linkedUniversity.city ?? undefined,
        telephone: linkedUniversity.telephone ?? undefined,
        email: linkedUniversity.email ?? undefined,
        website: linkedUniversity.website ?? undefined,
      },
      student: {
        firstName: existing.firstName,
        lastName: existing.lastName,
        birthDate: formatIsoDate(existing.birthDate) ?? "",
        nationality: existing.nationality,
      },
      courseOfStudy: {
        subject: existing.studySubject ?? "",
        standardPeriodYears:
          existing.standardStudyPeriodYears ?? undefined,
        enrolledSince: formatIsoDate(existing.enrolledSince),
        expectedEnd: formatIsoDate(existing.expectedStudyEnd),
      },
      vacationJob: {
        semesterBreakFrom: formatIsoDate(existing.semesterBreakFrom),
        semesterBreakTo: formatIsoDate(existing.semesterBreakTo),
        studiesContinueAfterBreak:
          existing.studiesContinueAfterSemesterBreak ?? undefined,
      },
    })
  } catch (error) {
    console.error("GENERATE_CERTIFICATE_OF_ENROLLMENT_PDF_ERROR", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  const filename = `${sanitizeFilenamePart(existing.firstName)}-${sanitizeFilenamePart(existing.lastName)}-certificate-of-enrollment.pdf`

  const pdfBody = Uint8Array.from(pdfBytes)

  return new Response(new Blob([pdfBody], { type: "application/pdf" }), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
