import {
  adminEditDataToApplicationFormData,
  prismaToAdminEditData,
} from "@workspace/application/prisma"
import { generateBewerberChecklistPdf } from "@workspace/application/pdf"
import prisma from "@workspace/database/client"
import { requireAdminSessionForApi } from "@/lib/auth"
import { downloadFotoAsFile } from "@/lib/foto"

function sanitizeFilenamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 60)
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

  const existing = await prisma.application.findUnique({ where: { id } })
  if (existing === null) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  let fotoFile
  try {
    fotoFile = await downloadFotoAsFile(existing.fotoS3Key)
  } catch (error) {
    console.error("FOTO_DOWNLOAD_FAILED", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  let pdfBytes: Uint8Array
  try {
    pdfBytes = await generateBewerberChecklistPdf(
      adminEditDataToApplicationFormData(
        prismaToAdminEditData(existing),
        fotoFile
      )
    )
  } catch (error) {
    console.error("GENERATE_BEWERBER_CHECKLIST_PDF_ERROR", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }

  const filename = `${sanitizeFilenamePart(existing.firstName)}-${sanitizeFilenamePart(existing.lastName)}-bewerber-checklist.pdf`

  const pdfBody = Uint8Array.from(pdfBytes)

  return new Response(new Blob([pdfBody], { type: "application/pdf" }), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
