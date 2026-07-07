const OPTIONAL_STRING_FIELDS = [
  "street",
  "streetNumber",
  "postalCode",
  "city",
  "country",
  "telephone",
  "email",
  "website",
] as const

export function normalizeUniversityInput(body: unknown): unknown {
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

export function optionalUniversityString(
  value: string | undefined
): string | null {
  if (value === undefined || value.trim() === "") {
    return null
  }

  return value.trim()
}
