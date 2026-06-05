const OPTIONAL_STRING_FIELDS = [
  "email",
  "phone",
  "instagram",
  "taxId",
  "university",
  "studySubject",
  "semesterBreakFrom",
  "semesterBreakTo",
  "germanLevel",
  "otherLanguages",
  "healthRestrictions",
  "allergies",
  "clothingSize",
  "previousStayPlace",
  "previousStayPeriodFrom",
  "previousStayPeriodTo",
] as const

export function normalizeAdminEditInput(body: unknown): unknown {
  if (typeof body !== "object" || body === null) {
    return body
  }

  const record = { ...(body as Record<string, unknown>) }

  for (const key of OPTIONAL_STRING_FIELDS) {
    if (record[key] === "") {
      record[key] = undefined
    }
  }

  return record
}
