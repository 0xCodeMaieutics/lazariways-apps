import type { Profile, ProfileLanguage } from "@workspace/database/browser"
import type { AdminProfileEditData } from "./profile-schema"
import { workSectorOptions } from "./profile-schema"

function optionalString(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? ""
  return trimmed === "" ? null : trimmed
}

function parseIsoDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) {
    throw new Error(`Invalid date: ${value}`)
  }

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`)
  }

  return date
}

function formatDateForForm(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseWorkSectors(
  sectors: string[]
): AdminProfileEditData["workSector"] {
  const allowed = new Set<string>(workSectorOptions)
  return sectors.filter((sector): sector is (typeof workSectorOptions)[number] =>
    allowed.has(sector)
  )
}

export function profileToPrismaData(data: AdminProfileEditData) {
  return {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    gender: data.gender,
    birthDate: parseIsoDate(data.birthDate),
    email: data.email.trim(),
    phone: optionalString(data.phone),
    isStudent: data.isStudent,
    workSector: data.workSector,
    desiredSalary: data.desiredSalary,
  }
}

export function profileLanguagesToPrismaCreate(
  languages: AdminProfileEditData["languages"]
) {
  return languages.map((entry) => ({
    language: entry.language.trim(),
    level: entry.level,
  }))
}

export function prismaToAdminEditData(
  profile: Profile & { languages: ProfileLanguage[] }
): AdminProfileEditData {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    gender: profile.gender,
    birthDate: formatDateForForm(profile.birthDate),
    email: profile.email,
    phone: profile.phone ?? undefined,
    isStudent: profile.isStudent,
    workSector: parseWorkSectors(profile.workSector),
    desiredSalary: profile.desiredSalary,
    languages:
      profile.languages.length > 0
        ? profile.languages.map((entry) => ({
            language: entry.language,
            level: entry.level,
          }))
        : [{ language: "", level: "A1" }],
  }
}
