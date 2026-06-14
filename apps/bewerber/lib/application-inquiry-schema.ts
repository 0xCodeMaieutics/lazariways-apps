import { z } from "zod"

export const applicationInquiryFormSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "Bitte geben Sie den Firmennamen an."),
  contactPersonName: z
    .string()
    .trim()
    .min(1, "Bitte geben Sie den Namen der zuständigen Person an."),
  email: z
    .string()
    .trim()
    .min(1, "Bitte geben Sie eine E-Mail-Adresse an.")
    .email("Bitte geben Sie eine gültige E-Mail-Adresse an."),
  phone: z.string().trim(),
  message: z.string().trim(),
})

export type ApplicationInquiryFormData = z.infer<
  typeof applicationInquiryFormSchema
>

export const emptyApplicationInquiryForm: ApplicationInquiryFormData = {
  companyName: "",
  contactPersonName: "",
  email: "",
  phone: "",
  message: "",
}

export function optionalInquiryField(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}
