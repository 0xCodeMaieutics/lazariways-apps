import { GermanLevel, type Prisma } from "@workspace/database/browser"

export const UNIVERSITY_NOT_IN_LIST = "__not_in_list__"

export interface ApplicationFilters {
  query: string
  germanLevel: GermanLevel | null
  /** A university id, `UNIVERSITY_NOT_IN_LIST`, or `null` for no filter. */
  university: string | null
}

export interface ApplicationFilterSearchParams {
  q?: string
  level?: string
  university?: string
}

export const GERMAN_LEVELS = Object.values(GermanLevel)

function isGermanLevel(value: string): value is GermanLevel {
  return (GERMAN_LEVELS as string[]).includes(value)
}

export function parseApplicationFilters(params: ApplicationFilterSearchParams): ApplicationFilters {
  const level = params.level?.trim() ?? ""
  const university = params.university?.trim() ?? ""

  return {
    query: params.q?.trim() ?? "",
    germanLevel: isGermanLevel(level) ? level : null,
    university: university === "" ? null : university,
  }
}

export function hasActiveApplicationFilters(filters: ApplicationFilters): boolean {
  return filters.query !== "" || filters.germanLevel !== null || filters.university !== null
}

function buildUniversityWhere(university: string): Prisma.ApplicationWhereInput {
  if (university === UNIVERSITY_NOT_IN_LIST) {
    return {
      universityId: null,
      NOT: [{ university: null }, { university: "" }],
    }
  }

  return { universityId: university }
}

export function buildApplicationWhere(filters: ApplicationFilters): Prisma.ApplicationWhereInput {
  const terms = filters.query.split(/\s+/).filter((term) => term !== "")

  return {
    AND: [
      ...terms.map((term) => ({
        OR: [
          { firstName: { contains: term, mode: "insensitive" as const } },
          { lastName: { contains: term, mode: "insensitive" as const } },
          { email: { contains: term, mode: "insensitive" as const } },
          { phone: { contains: term } },
        ],
      })),
      ...(filters.germanLevel !== null ? [{ germanLevel: filters.germanLevel }] : []),
      ...(filters.university !== null ? [buildUniversityWhere(filters.university)] : []),
    ],
  }
}

export function buildApplicationsHref(filters: ApplicationFilters, page = 1): string {
  const params = new URLSearchParams()

  if (filters.query !== "") {
    params.set("q", filters.query)
  }
  if (filters.germanLevel !== null) {
    params.set("level", filters.germanLevel)
  }
  if (filters.university !== null) {
    params.set("university", filters.university)
  }
  if (page > 1) {
    params.set("page", String(page))
  }

  const search = params.toString()
  return search === "" ? "/applications" : `/applications?${search}`
}
