import { z } from "zod"

export const genderOptions = ["M", "F"] as const

export const workSectorOptions = [
  "Hotel/Gaststätte",
  "Systemgastronomie",
  "Landwirtschaft",
  "Gebäude-/Industriereinigung",
  "Industrielle Produktion",
] as const

export const desiredSalaryOptions = [
  "EURO_10_12",
  "EURO_12_14",
  "EURO_15_PLUS",
] as const

export const desiredSalaryLabels: Record<
  (typeof desiredSalaryOptions)[number],
  string
> = {
  EURO_10_12: "10–12 €",
  EURO_12_14: "12–14 €",
  EURO_15_PLUS: "15+ €",
}

export const languageLevelOptions = ["A1", "A2", "B1", "B2", "C1"] as const

const profileLanguageSchema = z.object({
  language: z.string().min(1, "Language is required"),
  level: z.enum(languageLevelOptions, {
    message: "Level is required",
  }),
})

export const adminProfileEditSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(genderOptions, {
    message: "Gender is required",
  }),
  birthDate: z.string().min(1, "Birth date is required"),
  email: z.email("Email is required"),
  phone: z
    .string()
    .refine(
      (val) =>
        val.trim() === "" ||
        /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(
          val.trim()
        ),
      "Invalid phone number format"
    )
    .optional(),
  isStudent: z.boolean({
    message: "Student status is required",
  }),
  workSector: z
    .array(z.enum(workSectorOptions))
    .min(1, "At least one work sector is required"),
  desiredSalary: z.enum(desiredSalaryOptions, {
    message: "Desired salary is required",
  }),
  languages: z
    .array(profileLanguageSchema)
    .min(1, "At least one language is required"),
})

export type AdminProfileEditData = z.infer<typeof adminProfileEditSchema>
