"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import {
  adminApplicationEditSchema,
  type AdminApplicationEditData,
  shoeSizeOptions,
  workSectorLabels,
  workSectorOptions,
} from "@workspace/application/schema"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { NativeSelect, NativeSelectOption } from "@workspace/ui/components/native-select"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { SafariInputDate } from "@workspace/ui/components/safari-date-component"
import { toast } from "@workspace/ui/components/sonner"
import { useRouter } from "next/navigation"
import { startTransition, useState, useTransition, type ReactNode } from "react"
import { Controller, useForm, useWatch, type Control } from "react-hook-form"

import { ApplicationPdfButtons } from "@/components/application-pdf-buttons"
import { CopyApplicationLinkButton } from "@/components/copy-application-link-button"
import { InstagramLink } from "@/components/instagram-link"

import type { UniversityOption } from "./edit-application-content"

const UNIVERSITY_NOT_IN_LIST = "__not_in_list__"

const SAVE_ERROR = "განაცხადის შენახვა ვერ მოხერხდა. სცადეთ ხელახლა."
const DELETE_ERROR = "განაცხადის წაშლა ვერ მოხერხდა. სცადეთ ხელახლა."
const INVALID_FORM_ERROR = "გთხოვთ, შეასწოროთ მონიშნული ველები."

const sections = [
  { id: "personal", title: "პირადი ინფორმაცია" },
  { id: "address", title: "მისამართი" },
  { id: "contact", title: "კონტაქტი და სოციალური ქსელები" },
  { id: "studies", title: "სწავლა" },
  { id: "qualification", title: "კვალიფიკაცია და ჯანმრთელობა" },
  { id: "germany", title: "ყოფნა გერმანიაში" },
  { id: "emergency", title: "საგანგებო საკონტაქტო პირი" },
  { id: "work-sector", title: "სასურველი სამუშაო სფერო" },
  { id: "actions", title: "სხვა მოქმედებები" },
] as const

type SectionId = (typeof sections)[number]["id"]

const sectionTitle = (id: SectionId) => sections.find((section) => section.id === id)?.title ?? ""

interface ApplicationEditFormProps {
  applicationId: string
  applicationLink: string
  defaultValues: AdminApplicationEditData
  universities: UniversityOption[]
}

function FormSection({ id, children }: { id: SectionId; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-16 space-y-4">
      <h2 id={`${id}-heading`} className="text-lg font-semibold">
        {sectionTitle(id)}
      </h2>
      <FieldGroup>{children}</FieldGroup>
    </section>
  )
}

function SectionNavigation() {
  return (
    <nav
      aria-label="განაცხადის სექციები"
      className="sticky top-0 z-10 -mx-4 overflow-x-auto border-b bg-background/95 px-4 py-2 backdrop-blur"
    >
      <ul className="flex w-max gap-2">
        {sections.map((section) => (
          <li key={section.id}>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <a href={`#${section.id}`}>{section.title}</a>
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

type DateFieldName =
  | "birthDate"
  | "enrolledSince"
  | "expectedStudyEnd"
  | "semesterBreakFrom"
  | "semesterBreakTo"
  | "previousStayPeriodFrom"
  | "previousStayPeriodTo"

function DateField<TName extends DateFieldName>({
  name,
  label,
  control,
}: {
  name: TName
  label: string
  control: Control<AdminApplicationEditData>
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <SafariInputDate<AdminApplicationEditData, TName>
            field={field}
            id={name}
            aria-invalid={fieldState.invalid}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

function BooleanRadioField({
  name,
  label,
  control,
}: {
  name: keyof AdminApplicationEditData
  label: string
  control: ReturnType<typeof useForm<AdminApplicationEditData>>["control"]
}) {
  return (
    <FieldSet>
      <FieldLegend variant="label">{label}</FieldLegend>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RadioGroup
            value={field.value === true ? "true" : field.value === false ? "false" : ""}
            onValueChange={(value) => field.onChange(value === "true")}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="true" id={`${name}-yes`} />
              <Label htmlFor={`${name}-yes`}>დიახ</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="false" id={`${name}-no`} />
              <Label htmlFor={`${name}-no`}>არა</Label>
            </div>
          </RadioGroup>
        )}
      />
    </FieldSet>
  )
}

export function ApplicationEditForm({
  applicationId,
  applicationLink,
  defaultValues,
  universities,
}: ApplicationEditFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isSaving, startSaveTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showCustomUniversity, setShowCustomUniversity] = useState(
    () => !defaultValues.universityId && (defaultValues.university?.trim() ?? "") !== ""
  )

  const form = useForm<AdminApplicationEditData>({
    resolver: standardSchemaResolver(adminApplicationEditSchema),
    defaultValues,
  })

  const save = (data: AdminApplicationEditData) => {
    startSaveTransition(async () => {
      startTransition(() => {
        setError(null)
      })

      try {
        const response = await fetch(`/api/applications/${applicationId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          startTransition(() => {
            setError(SAVE_ERROR)
          })
          return
        }

        form.reset(data)
        toast.success("ცვლილებები შენახულია")
      } catch {
        startTransition(() => {
          setError(SAVE_ERROR)
        })
      }
    })
  }

  const deleteApplication = () => {
    startDeleteTransition(async () => {
      startTransition(() => {
        setDeleteError(null)
      })

      try {
        const response = await fetch(`/api/applications/${applicationId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          startTransition(() => {
            setDeleteError(DELETE_ERROR)
          })
          return
        }

        startTransition(() => {
          setIsDeleteDialogOpen(false)
        })
        router.push("/applications")
        router.refresh()
      } catch {
        startTransition(() => {
          setDeleteError(DELETE_ERROR)
        })
      }
    })
  }

  const { control, register, formState, setValue } = form
  const instagram = useWatch({ control, name: "instagram" })
  const hasBeenInGermanyBefore = useWatch({
    control,
    name: "hasBeenInGermanyBefore",
  })
  const universityId = useWatch({ control, name: "universityId" })

  const universitySelectValue = showCustomUniversity ? UNIVERSITY_NOT_IN_LIST : (universityId ?? "")

  const onUniversitySelectChange = (value: string) => {
    if (value === UNIVERSITY_NOT_IN_LIST) {
      setShowCustomUniversity(true)
      setValue("universityId", undefined, { shouldDirty: true })
      return
    }

    setShowCustomUniversity(false)

    if (value === "") {
      setValue("universityId", undefined, { shouldDirty: true })
      setValue("university", "", { shouldDirty: true })
      return
    }

    setValue("universityId", value, { shouldDirty: true })
    setValue("university", "", { shouldDirty: true })
  }

  return (
    <form
      className="space-y-8 pb-40"
      onSubmit={form.handleSubmit(save, () => {
        setError(INVALID_FORM_ERROR)
      })}
      noValidate
    >
      <SectionNavigation />

      <FormSection id="personal">
        <Field>
          <FieldLabel htmlFor="firstName">სახელი</FieldLabel>
          <Input id="firstName" {...register("firstName")} />
          <FieldError errors={[formState.errors.firstName]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="lastName">გვარი</FieldLabel>
          <Input id="lastName" {...register("lastName")} />
          <FieldError errors={[formState.errors.lastName]} />
        </Field>
        <FieldSet>
          <FieldLegend variant="label">სქესი</FieldLegend>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="M" id="gender-m" />
                  <Label htmlFor="gender-m">მამრობითი</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="F" id="gender-f" />
                  <Label htmlFor="gender-f">მდედრობითი</Label>
                </div>
              </RadioGroup>
            )}
          />
          <FieldError errors={[formState.errors.gender]} />
        </FieldSet>
        <DateField name="birthDate" label="დაბადების თარიღი" control={control} />
        <Field>
          <FieldLabel htmlFor="birthPlace">დაბადების ადგილი</FieldLabel>
          <Input id="birthPlace" {...register("birthPlace")} />
          <FieldError errors={[formState.errors.birthPlace]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="birthCountry">დაბადების ქვეყანა</FieldLabel>
          <Input id="birthCountry" {...register("birthCountry")} />
          <FieldError errors={[formState.errors.birthCountry]} />
        </Field>
      </FormSection>

      <FormSection id="address">
        <Field>
          <FieldLabel htmlFor="street">ქუჩა, სახლის ნომერი</FieldLabel>
          <Input id="street" {...register("street")} />
          <FieldError errors={[formState.errors.street]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="postalCode">საფოსტო ინდექსი</FieldLabel>
          <Input id="postalCode" inputMode="numeric" {...register("postalCode")} />
          <FieldError errors={[formState.errors.postalCode]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="city">ქალაქი</FieldLabel>
          <Input id="city" {...register("city")} />
          <FieldError errors={[formState.errors.city]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="country">ქვეყანა</FieldLabel>
          <Input id="country" {...register("country")} />
          <FieldError errors={[formState.errors.country]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="nationality">მოქალაქეობა</FieldLabel>
          <Input id="nationality" {...register("nationality")} />
          <FieldError errors={[formState.errors.nationality]} />
        </Field>
      </FormSection>

      <FormSection id="contact">
        <Field>
          <FieldLabel htmlFor="email">საფოსტო ემაილი</FieldLabel>
          <Input id="email" type="email" {...register("email")} />
          <FieldError errors={[formState.errors.email]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="phone">ტელეფონის ნომერი</FieldLabel>
          <Input id="phone" type="tel" {...register("phone")} />
          <FieldError errors={[formState.errors.phone]} />
        </Field>
        <Field>
          <div className="flex items-center gap-2">
            <FieldLabel htmlFor="instagram">Instagram</FieldLabel>
            <InstagramLink handle={instagram} />
          </div>
          <Input id="instagram" {...register("instagram")} />
          <FieldError errors={[formState.errors.instagram]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="taxId">საგადასახადო იდენტიფიკაციის ნომერი</FieldLabel>
          <Input id="taxId" {...register("taxId")} />
          <FieldError errors={[formState.errors.taxId]} />
        </Field>
      </FormSection>

      <FormSection id="studies">
        <Field>
          <FieldLabel htmlFor="linkedUniversity">უნივერსიტეტი</FieldLabel>
          <NativeSelect
            id="linkedUniversity"
            className="w-full"
            value={universitySelectValue}
            onChange={(event) => onUniversitySelectChange(event.target.value)}
            aria-invalid={!!formState.errors.universityId}
          >
            <NativeSelectOption value="">აირჩიეთ უნივერსიტეტი</NativeSelectOption>
            {universities.map((university) => (
              <NativeSelectOption key={university.id} value={university.id}>
                {university.name}
              </NativeSelectOption>
            ))}
            <NativeSelectOption value={UNIVERSITY_NOT_IN_LIST}>
              ჩემი უნივერსიტეტი სიაში არ არის
            </NativeSelectOption>
          </NativeSelect>
          <FieldError errors={[formState.errors.universityId]} />
        </Field>
        {showCustomUniversity ? (
          <Field>
            <FieldLabel htmlFor="university">უნივერსიტეტის სახელი</FieldLabel>
            <Input id="university" {...register("university")} />
            <FieldError errors={[formState.errors.university]} />
          </Field>
        ) : null}
        <Field>
          <FieldLabel htmlFor="studySubject">სასწავლო სპეციალობა</FieldLabel>
          <Input id="studySubject" {...register("studySubject")} />
          <FieldError errors={[formState.errors.studySubject]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="standardStudyPeriodYears">რეგულირებული სწავლის პერიოდი (წლებში)</FieldLabel>
          <Controller
            name="standardStudyPeriodYears"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Input
                  id="standardStudyPeriodYears"
                  type="number"
                  step="0.5"
                  min="0"
                  aria-invalid={fieldState.invalid}
                  placeholder="მაგ. 4"
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const raw = event.target.value
                    if (raw === "") {
                      field.onChange(undefined)
                      return
                    }
                    const parsed = Number(raw.replace(",", "."))
                    field.onChange(Number.isFinite(parsed) ? parsed : undefined)
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
                <FieldError errors={[fieldState.error]} />
              </>
            )}
          />
        </Field>
        <DateField name="enrolledSince" label="სწავლის დაწყების თარიღი" control={control} />
        <DateField name="expectedStudyEnd" label="სწავლის დასრულების მოსალოდნელი თარიღი" control={control} />
        <DateField name="semesterBreakFrom" label="არდადეგების დასაწყისი" control={control} />
        <DateField name="semesterBreakTo" label="არდადეგების დასასრული" control={control} />
        <BooleanRadioField
          name="studiesContinueAfterSemesterBreak"
          label="სწავლა გაგრძელდება არდადეგების შემდეგ?"
          control={control}
        />
      </FormSection>

      <FormSection id="qualification">
        <FieldSet>
          <FieldLegend variant="label">გერმანულის დონე</FieldLegend>
          <Controller
            name="germanLevel"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={(value) => field.onChange(value === "" ? undefined : value)}
                className="flex flex-wrap gap-3"
              >
                {(["A1", "A2", "B1", "B2", "C1"] as const).map((level) => (
                  <div key={level} className="flex items-center gap-2">
                    <RadioGroupItem value={level} id={`german-${level}`} />
                    <Label htmlFor={`german-${level}`}>{level}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        </FieldSet>
        <Field>
          <FieldLabel htmlFor="otherLanguages">სხვა ენების ცოდნა / ენის დონე</FieldLabel>
          <Input id="otherLanguages" {...register("otherLanguages")} />
        </Field>
        <BooleanRadioField name="driverLicense" label="მართვის მოწმობა" control={control} />
        <BooleanRadioField name="canRideBike" label="შეგიძლიათ ველოსიპედის ტარება?" control={control} />
        <BooleanRadioField name="shiftWork" label="მზადყოფნა ცვლებში მუშაობისთვის" control={control} />
        <Field>
          <FieldLabel htmlFor="healthRestrictions">ჯანმრთელობის შეზღუდვები თუ არის</FieldLabel>
          <Input id="healthRestrictions" {...register("healthRestrictions")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="allergies">ალერგიები</FieldLabel>
          <Input id="allergies" {...register("allergies")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="clothingSize">ტანსაცმლის ზომა</FieldLabel>
          <Input id="clothingSize" {...register("clothingSize")} />
        </Field>
        <FieldSet>
          <FieldLegend variant="label">ფეხსაცმლის ზომა</FieldLegend>
          <Controller
            name="shoeSize"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-3">
                {shoeSizeOptions.map((size) => {
                  const checked = field.value?.includes(size) ?? false
                  return (
                    <div key={size} className="flex items-center gap-2">
                      <Checkbox
                        id={`shoe-${size}`}
                        checked={checked}
                        onCheckedChange={(value) => {
                          const current = field.value ?? []
                          if (value === true) {
                            field.onChange([...current, size])
                          } else {
                            field.onChange(current.filter((item) => item !== size))
                          }
                        }}
                      />
                      <Label htmlFor={`shoe-${size}`}>{size}</Label>
                    </div>
                  )
                })}
              </div>
            )}
          />
        </FieldSet>
      </FormSection>

      <FormSection id="germany">
        <BooleanRadioField
          name="hasBeenInGermanyBefore"
          label="ყოფილა თუ არა ადრე გერმანიაში?"
          control={control}
        />
        {hasBeenInGermanyBefore !== false ? (
          <>
            <Field>
              <FieldLabel htmlFor="previousStayPlace">სად</FieldLabel>
              <Input id="previousStayPlace" {...register("previousStayPlace")} />
            </Field>
            <DateField name="previousStayPeriodFrom" label="პერიოდის დასაწყისი" control={control} />
            <DateField name="previousStayPeriodTo" label="პერიოდის დასასრული" control={control} />
          </>
        ) : null}
      </FormSection>

      <FormSection id="emergency">
        <Field>
          <FieldLabel htmlFor="emergencyContactName">საგანგებო საკონტაქტო პირი</FieldLabel>
          <Input id="emergencyContactName" {...register("emergencyContactName")} />
          <FieldError errors={[formState.errors.emergencyContactName]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="emergencyPhone">საგანგებო ტელეფონის ნომერი</FieldLabel>
          <Input id="emergencyPhone" type="tel" {...register("emergencyPhone")} />
          <FieldError errors={[formState.errors.emergencyPhone]} />
        </Field>
      </FormSection>

      <FormSection id="work-sector">
        <FieldSet>
          <FieldLegend variant="label">აირჩიეთ ერთი ან მეტი სფერო</FieldLegend>
          <Controller
            name="workSector"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                {workSectorOptions.map((sector) => {
                  const checked = field.value.includes(sector)
                  return (
                    <div key={sector} className="flex items-center gap-2">
                      <Checkbox
                        id={`sector-${sector}`}
                        checked={checked}
                        onCheckedChange={(value) => {
                          if (value === true) {
                            field.onChange([...field.value, sector])
                          } else {
                            field.onChange(field.value.filter((item) => item !== sector))
                          }
                        }}
                      />
                      <Label htmlFor={`sector-${sector}`}>{workSectorLabels[sector]}</Label>
                    </div>
                  )
                })}
              </div>
            )}
          />
          <FieldError errors={[formState.errors.workSector]} />
        </FieldSet>
      </FormSection>

      <section
        id="actions"
        aria-labelledby="actions-heading"
        className="scroll-mt-16 space-y-4 border-t pt-8"
      >
        <h2 id="actions-heading" className="text-lg font-semibold">
          {sectionTitle("actions")}
        </h2>
        <div className="space-y-2">
          <CopyApplicationLinkButton applicationLink={applicationLink} />
          <ApplicationPdfButtons applicationId={applicationId} />
        </div>
      </section>

      <section
        aria-labelledby="delete-heading"
        className="mt-16 space-y-4 rounded-lg border border-destructive/30 p-4"
      >
        <h2 id="delete-heading" className="text-lg font-semibold">
          განაცხადის წაშლა
        </h2>
        <p className="text-sm text-muted-foreground">
          განაცხადი და მისი ფოტო სამუდამოდ წაიშლება. ამ მოქმედების გაუქმება შეუძლებელია.
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            setDeleteError(null)
            setIsDeleteDialogOpen(true)
          }}
          disabled={isSaving || isDeleting}
        >
          განაცხადის წაშლა
        </Button>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-lg space-y-2">
          {error !== null ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            className="w-full"
            size={"lg"}
            disabled={!formState.isDirty || isSaving || isDeleting}
          >
            {isSaving ? "მუშავდება…" : "დამახსოვრება"}
          </Button>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>წავშალოთ განაცხადი?</AlertDialogTitle>
            <AlertDialogDescription>განაცხადი და შენახული ფოტო სამუდამოდ წაიშლება.</AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError !== null ? (
            <p role="alert" className="text-sm text-destructive">
              {deleteError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isDeleting}>
              გაუქმება
            </AlertDialogCancel>
            <Button type="button" variant="destructive" onClick={deleteApplication} disabled={isDeleting}>
              {isDeleting ? "იშლება…" : "წაშლა"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
