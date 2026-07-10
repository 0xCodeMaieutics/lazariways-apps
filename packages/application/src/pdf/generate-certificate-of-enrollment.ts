import { PDFDocument, type PDFForm } from "pdf-lib"

const PDF_URL =
  "https://lazari-ways-bucket.s3.eu-central-1.amazonaws.com/public/b-immatrikulation-en_ba036170.pdf"

export type CertificateOfEnrollmentInput = {
  university: {
    name: string
    street?: string
    streetNumber?: string
    postalCode?: string
    city?: string
    telephone?: string
    email?: string
    website?: string
  }
  student: {
    firstName: string
    lastName: string
    birthDate: string
    nationality: string
  }
  courseOfStudy: {
    subject: string
    standardPeriodYears?: number
    enrolledSince?: string
    expectedEnd?: string
  }
  vacationJob: {
    semesterBreakFrom?: string
    semesterBreakTo?: string
    studiesContinueAfterBreak?: boolean
  }
}

const formatCertificateDate = (isoDate: string | undefined) => {
  const trimmed = typeof isoDate === "string" ? isoDate.trim() : ""
  if (trimmed.length === 0) return ""

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (!match) return trimmed

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (Number.isNaN(date.getTime())) return trimmed

  return `${day}.${month}.${year}`
}

const formatStandardPeriodYears = (years: number | undefined) => {
  if (years === undefined || Number.isNaN(years)) return ""

  if (Number.isInteger(years)) {
    return String(years)
  }

  return String(years)
}

const setOptionalTextField = (
  form: PDFForm,
  fieldName: string,
  value: string | undefined
) => {
  const trimmed = typeof value === "string" ? value.trim() : ""
  if (trimmed.length === 0) return

  form.getTextField(fieldName).setText(trimmed)
}

export const generateCertificateOfEnrollmentPdf = async (
  input: CertificateOfEnrollmentInput
) => {
  const pdfTemplateBytes = await fetch(PDF_URL).then((res) => res.arrayBuffer())
  const pdfDoc = await PDFDocument.load(pdfTemplateBytes)
  const form = pdfDoc.getForm()

  const { university, student, courseOfStudy, vacationJob } = input

  setOptionalTextField(form, "txtfDritteName", university.name)
  setOptionalTextField(form, "txtfDritteStr", university.street)
  setOptionalTextField(form, "txtfDritteHausNr", university.streetNumber)
  setOptionalTextField(form, "txtfDrittePlz", university.postalCode)
  setOptionalTextField(form, "txtfDritteOrt", university.city)
  setOptionalTextField(form, "txtfDritteTel", university.telephone)
  setOptionalTextField(form, "txtfDritteEmail", university.email)
  setOptionalTextField(form, "txtfDritteWeb", university.website)

  setOptionalTextField(form, "txtfPersonVorname", student.firstName)
  setOptionalTextField(form, "txtfPersonNachname", student.lastName)
  setOptionalTextField(
    form,
    "datePersonGebDatum",
    formatCertificateDate(student.birthDate)
  )
  setOptionalTextField(form, "txtfPersonNationalitaet", student.nationality)

  setOptionalTextField(form, "txtfStudiumFach", courseOfStudy.subject)
  setOptionalTextField(
    form,
    "txtfStudiumDauer",
    formatStandardPeriodYears(courseOfStudy.standardPeriodYears)
  )
  setOptionalTextField(
    form,
    "dateStudiumSeit",
    formatCertificateDate(courseOfStudy.enrolledSince)
  )
  setOptionalTextField(
    form,
    "dateStudiumEnde",
    formatCertificateDate(courseOfStudy.expectedEnd)
  )

  setOptionalTextField(
    form,
    "dateStudiumFerienVon",
    formatCertificateDate(vacationJob.semesterBreakFrom)
  )
  setOptionalTextField(
    form,
    "dateStudiumFerienBis",
    formatCertificateDate(vacationJob.semesterBreakTo)
  )

  if (vacationJob.studiesContinueAfterBreak !== undefined) {
    form
      .getRadioGroup("rbtnStudiumFortsetzung")
      .select(vacationJob.studiesContinueAfterBreak ? "yes" : "no")
  }

  form.flatten()

  return pdfDoc.save()
}
