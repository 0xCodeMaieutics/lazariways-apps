import { z } from "zod"

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
})

export type ProfileFormData = z.infer<typeof profileFormSchema>
