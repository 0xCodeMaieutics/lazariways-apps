import { z } from "zod"

export const GERMAN_LEVELS = ["NONE", "A1", "A2", "B1", "B2", "C1"] as const
export const WAGE_PERIODS = ["HOUR", "MONTH"] as const
export const MAX_EMPLOYMENT_MONTHS = 24
export const MAX_WAGE_AMOUNT = 10_000
export const MAX_HIGHLIGHT_LENGTH = 40

export const vacancyDetailsSchema = z.object({
  employmentDuration: z.union([
    z.literal("PERMANENT"),
    z.coerce.number().int().min(1).max(MAX_EMPLOYMENT_MONTHS),
  ]),
  wageAmount: z.coerce.number().positive().max(MAX_WAGE_AMOUNT).multipleOf(0.01),
  wagePeriod: z.enum(WAGE_PERIODS),
  germanLevel: z.enum(GERMAN_LEVELS),
  highlight: z.string().trim().max(MAX_HIGHLIGHT_LENGTH).default(""),
})

export type VacancyDetails = z.infer<typeof vacancyDetailsSchema>
export type EmploymentDuration = VacancyDetails["employmentDuration"]
export type WagePeriod = (typeof WAGE_PERIODS)[number]
export type GermanLevel = (typeof GERMAN_LEVELS)[number]
