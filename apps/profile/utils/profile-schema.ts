import { z } from "zod"

export const workSectorOptions = [
  "Hotel/Gaststätte",
  "Systemgastronomie",
  "Landwirtschaft",
  "Gebäude-/Industriereinigung",
  "Industrielle Produktion",
] as const

export const workSectorLabels: Record<
  (typeof workSectorOptions)[number],
  string
> = {
  "Hotel/Gaststätte": "სასტუმრო / რესტორანი",
  Systemgastronomie: "სწრაფი კვების ქსელი",
  Landwirtschaft: "სოფლის მეურნეობა",
  "Gebäude-/Industriereinigung": "დასუფთავება (შენობები / ინდუსტრია)",
  "Industrielle Produktion": "ინდუსტრიული წარმოება",
}

export const defaultWorkSectors = [...workSectorOptions]

export const desiredSalaryOptions = [
  "EURO_10_12",
  "EURO_12_14",
  "EURO_15_PLUS",
] as const

export const desiredSalaryLabels: Record<
  (typeof desiredSalaryOptions)[number],
  string
> = {
  EURO_10_12: "10-12 euro",
  EURO_12_14: "12-14 euro",
  EURO_15_PLUS: "15+ euro",
}

export const languageLevelOptions = ["A1", "A2", "B1", "B2", "C1"] as const

const profileLanguageSchema = z.object({
  language: z.string().min(1, "ენა სავალდებულოა"),
  level: z.enum(languageLevelOptions, {
    message: "დონე სავალდებულოა",
  }),
})

export const defaultProfileLanguages = [
  { language: "", level: "A1" },
] satisfies z.infer<typeof profileLanguageSchema>[]

export const profileFormSchema = z.object({
  firstName: z.string().min(1, "სახელი სავალდებულოა"),
  lastName: z.string().min(1, "გვარი სავალდებულოა"),
  birthDate: z.string().min(1, "დაბადების თარიღი სავალდებულოა"),
  email: z.email("ელფოსტა სავალდებულოა"),
  phone: z
    .string()
    .refine(
      (val) =>
        val.trim() === "" ||
        /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(
          val.trim()
        ),
      "არასწორი ტელეფონის ნომრის ფორმატი"
    )
    .optional(),
  foto: z
    .instanceof(File, {
      message: "გთხოვთ ატვირთოტ თქვენი ფოტო",
    })
    .refine(
      (file) => ["image/png", "image/jpeg", "image/jpg"].includes(file.type),
      {
        message: "მხოლოდ PNG და JPEG ფაილებია დაშვებული",
      }
    ),
  workSector: z
    .array(z.enum(workSectorOptions))
    .min(1, "სასურველი სამუშაო სფერო სავალდებულოა"),
  desiredSalary: z.enum(desiredSalaryOptions, {
    message: "სასურველი ანაზღაურება სავალდებულოა",
  }),
  languages: z
    .array(profileLanguageSchema)
    .min(1, "მინიმუმ ერთი ენა სავალდებულოა"),
})

export type ProfileFormData = z.infer<typeof profileFormSchema>
