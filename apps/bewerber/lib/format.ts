export function hasText(value: string | undefined): boolean {
  return (value?.trim() ?? "").length > 0
}

export function formatGender(gender: "M" | "F"): string {
  return gender === "M" ? "Männlich" : "Weiblich"
}

export function formatBool(value: boolean): string {
  return value ? "Ja" : "Nein"
}

export function formatIsoDate(isoDate: string | undefined): string | null {
  const trimmed = isoDate?.trim() ?? ""
  if (trimmed === "") {
    return null
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (!match) {
    return trimmed
  }

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (Number.isNaN(date.getTime())) {
    return trimmed
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function formatDateRange(
  from: string | undefined,
  to: string | undefined
): string | null {
  const formattedFrom = formatIsoDate(from)
  const formattedTo = formatIsoDate(to)

  if (formattedFrom === null && formattedTo === null) {
    return null
  }

  return `${formattedFrom ?? "—"} – ${formattedTo ?? "—"}`
}
