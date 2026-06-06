"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Controller, useForm } from "react-hook-form"
import { useCallback, useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { XCircle } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { FileUpload } from "@workspace/ui/components/file-upload"
import { ImageCropper } from "@workspace/ui/components/image-cropper"
import { SafariInputDate } from "@workspace/ui/components//safari-date-component"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  defaultWorkSectors,
  profileFormSchema,
  workSectorLabels,
  workSectorOptions,
  type ProfileFormData,
} from "@/utils/profile-schema"

function containsNonLatinLetters(value: string) {
  for (const char of value) {
    if (/\p{L}/u.test(char) && !/\p{Script=Latin}/u.test(char)) {
      return true
    }
  }
  return false
}

function profileFormDataToFormData(data: ProfileFormData): FormData {
  const fd = new FormData()
  for (const key of Object.keys(data) as (keyof ProfileFormData)[]) {
    const value = data[key]
    if (key === "foto") {
      if (value instanceof File) {
        fd.set(key, value)
      }
      continue
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        fd.set(key, "")
      } else {
        for (const item of value) {
          fd.append(key, String(item))
        }
      }
      continue
    }
    if (value === undefined || value === null) {
      fd.set(key, "")
      continue
    }
    fd.set(key, String(value))
  }
  return fd
}

export function ProfileForm() {
  const router = useRouter()
  const [isSubmitting, startTransition] = useTransition()
  const [isSubmissionErrorOpen, setIsSubmissionErrorOpen] = useState(false)
  const [base64String, setBase64String] = useState<string | null>(null)

  const form = useForm<ProfileFormData>({
    resolver: standardSchemaResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      birthDate: "",
      email: "",
      phone: "",
      workSector: defaultWorkSectors,
      foto: undefined,
    },
  })

  const scrollToFirstError = useCallback(() => {
    const errors = form.formState.errors
    const firstErrorField = Object.keys(errors)[0]

    if (!firstErrorField) {
      return
    }

    let fieldElement: Element | null = null

    if (firstErrorField === "foto") {
      fieldElement = document.querySelector(`[data-invalid="true"]`)
    } else {
      fieldElement = document.getElementById(firstErrorField)
    }

    fieldElement?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [form.formState.errors])

  useEffect(() => {
    const errors = form.formState.errors
    if (Object.keys(errors).length > 0 && form.formState.isSubmitted) {
      scrollToFirstError()
    }
  }, [form.formState.errors, form.formState.isSubmitted, scrollToFirstError])

  const onValidateRomanCharacters = ({
    fieldName,
    value,
  }: {
    value: string
    fieldName: "firstName" | "lastName"
  }) => {
    if (containsNonLatinLetters(value)) {
      form.setError(fieldName, {
        message: "გთხოვთ, ინგლისური ასოებით შეიყვანეთ",
      })
      return
    }
    if (form.getFieldState(fieldName).invalid) {
      form.clearErrors(fieldName)
    }
  }

  function onInvalid() {
    setTimeout(() => {
      scrollToFirstError()
    }, 100)
  }

  const submitProfile = async (input: ProfileFormData) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "POST",
          body: profileFormDataToFormData(input),
        })
        if (!response.ok) {
          startTransition(() => {
            setIsSubmissionErrorOpen(true)
          })
          return
        }
        router.push("/success")
      } catch {
        startTransition(() => {
          setIsSubmissionErrorOpen(true)
        })
      }
    })
  }

  const isDirty = form.formState.isDirty

  return (
    <>
      <form
        id="profile-form"
        onSubmit={form.handleSubmit((data) => submitProfile(data), onInvalid)}
        noValidate
        className="p-6"
      >
        <div className="space-y-8">
          <div>
            <h1 className="mb-2 text-2xl font-semibold tracking-tight">
              პროფილის შექმნა
            </h1>
            <p className="text-sm text-muted-foreground">
              შეავსეთ თქვენი პროფილი ინგლისური ასოებით.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold">პირადი ინფორმაცია</h2>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Controller
                  name="firstName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="firstName"
                        className="text-sm font-medium"
                      >
                        სახელი *
                      </FieldLabel>
                      <Input
                        {...field}
                        onChange={(v) => {
                          const value = v.target.value
                          field.onChange(value)
                          onValidateRomanCharacters({
                            value,
                            fieldName: "firstName",
                          })
                        }}
                        id="firstName"
                        pattern="[a-zA-Z\s\.\-_]+"
                        aria-invalid={fieldState.invalid}
                        placeholder="თქვენი სახელი მაგ. Ana"
                        className="transition-colors"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="lastName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="lastName"
                        className="text-sm font-medium"
                      >
                        გვარი *
                      </FieldLabel>
                      <Input
                        {...field}
                        id="lastName"
                        aria-invalid={fieldState.invalid}
                        placeholder="თქვენი გვარი მაგ. Malazonia"
                        className="transition-colors"
                        onChange={(v) => {
                          const value = v.target.value
                          field.onChange(value)
                          onValidateRomanCharacters({
                            value,
                            fieldName: "lastName",
                          })
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <Controller
                name="birthDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="birthDate"
                      className="text-sm font-medium"
                    >
                      დაბადების თარიღი *
                    </FieldLabel>
                    <SafariInputDate
                      field={field}
                      id="birthDate"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email" className="text-sm font-medium">
                      ელფოსტა *
                    </FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="მაგ. ana@example.com"
                      className="transition-colors"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="phone" className="text-sm font-medium">
                      ტელეფონი (არასავალდებულო)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="phone"
                      type="tel"
                      aria-invalid={fieldState.invalid}
                      placeholder="მაგ. +995 555 123456"
                      className="transition-colors"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <div className="border-t pt-8">
            <h2 className="mb-4 text-lg font-semibold">სამუშაო სფერო</h2>
            <FieldGroup>
              <Controller
                name="workSector"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>სასურველი სამუშაო სფერო *</FieldLabel>
                    <div className="flex flex-col gap-3">
                      {workSectorOptions.map((option) => {
                        const id = `work-sector-${option.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`
                        const selected = field.value.includes(option)

                        return (
                          <div key={option} className="flex items-center gap-2">
                            <Checkbox
                              id={id}
                              checked={selected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, option])
                                } else {
                                  field.onChange(
                                    field.value.filter(
                                      (value) => value !== option
                                    )
                                  )
                                }
                              }}
                            />
                            <label
                              htmlFor={id}
                              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {workSectorLabels[option]}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <div className="border-t pt-8">
            <h2 className="mb-4 text-lg font-semibold">პროფილის ფოტო</h2>
            <FieldGroup>
              <Controller
                name="foto"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="foto">ფოტოს ატვირთვა *</FieldLabel>
                    <FileUpload
                      id="foto"
                      accept=".png,.jpg,.jpeg"
                      value={field.value}
                      onChange={(files) => {
                        if (files === null) {
                          field.onChange(undefined)
                          setBase64String(null)
                          return
                        }
                        const file = Array.isArray(files) ? files[0] : files

                        const reader = new FileReader()
                        reader.readAsDataURL(file as File)
                        reader.onload = () => {
                          setBase64String(reader.result as string)
                        }
                        field.onChange(file)
                      }}
                      placeholder="აირჩიეთ ფოტო"
                      required
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                    {base64String !== null && field.value instanceof File && (
                      <ImageCropper
                        base64Image={base64String}
                        originalFile={field.value}
                        onDismiss={() => setBase64String(null)}
                        onCropComplete={(cropped) => {
                          form.setValue("foto", cropped, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          })
                          setBase64String(null)
                        }}
                      />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <div className="flex flex-col-reverse gap-4 sm:flex-row">
            <Button type="submit" size="lg" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? "იგზავნება..." : "შექმნა"}
            </Button>
          </div>
        </div>
      </form>

      <Dialog
        open={isSubmissionErrorOpen}
        onOpenChange={setIsSubmissionErrorOpen}
      >
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <XCircle className="size-6 text-destructive" aria-hidden />
              <DialogTitle>შექმნა ვერ მოხერხდა</DialogTitle>
            </div>
            <DialogDescription>
              პროფილის შექმნისას მოხდა შეცდომა. გთხოვთ, დაუკავშირდეთ ანას ან
              ქრისტის.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setIsSubmissionErrorOpen(false)}
            >
              დახურვა
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
