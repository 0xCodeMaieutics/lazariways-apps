export function normalizeProfileAdminEditInput(body: unknown): unknown {
  if (typeof body !== "object" || body === null) {
    return body
  }

  const record = { ...(body as Record<string, unknown>) }

  if (record.phone === "") {
    record.phone = undefined
  }

  return record
}
