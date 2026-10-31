import { z } from "zod"

export const universityCreateSchema = z.object({
  name: z.string().trim().min(1, "სახელი სავალდებულოა"),
  street: z.string().optional(),
  streetNumber: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  telephone: z.string().optional(),
  email: z
    .string()
    .refine(
      (val) => val.trim() === "" || z.email().safeParse(val.trim()).success,
      "ელ. ფოსტის ფორმატი არასწორია"
    )
    .optional(),
  website: z
    .string()
    .refine((val) => {
      if (val.trim() === "") {
        return true
      }

      try {
        new URL(val.trim())
        return true
      } catch {
        return false
      }
    }, "ვებსაიტის მისამართი არასწორია (მაგ. https://example.edu)")
    .optional(),
})

export type UniversityCreateData = z.infer<typeof universityCreateSchema>
