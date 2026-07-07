import { z } from "zod"

export const universityCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  street: z.string().optional(),
  streetNumber: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  telephone: z.string().optional(),
  email: z
    .string()
    .refine(
      (val) =>
        val.trim() === "" || z.email().safeParse(val.trim()).success,
      "Invalid email format"
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
    }, "Invalid website URL")
    .optional(),
})

export type UniversityCreateData = z.infer<typeof universityCreateSchema>
