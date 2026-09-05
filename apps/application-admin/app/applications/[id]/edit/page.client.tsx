"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Controller, useForm, useWatch, type Control } from "react-hook-form"
import { useRouter } from "next/navigation"
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useState,
  useTransition,
  type ReactNode,
} from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import {
  adminApplicationEditSchema,
  type AdminApplicationEditData,
  shoeSizeOptions,
  workSectorLabels,
  workSectorOptions,
} from "@workspace/application/schema"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import { SafariInputDate } from "@workspace/ui/components/safari-date-component"
import {
  NativeSelect,
  NativeSelectOption,
} from "@workspace/ui/components/native-select"
import { ApplicationPdfButtons } from "@/components/application-pdf-buttons"
import { CopyApplicationLinkButton } from "@/components/copy-application-link-button"
import { InstagramLink } from "@/components/instagram-link"
import type { UniversityOption } from "./edit-application-content"

const UNIVERSITY_NOT_IN_LIST = "__not_in_list__"

interface ApplicationEditFormProps {
  applicationId: string
  applicationLink: string
  defaultValues: AdminApplicationEditData
  universities: UniversityOption[]
}

function FormSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">{title}</h2>
      <FieldGroup>{children}</FieldGroup>
    </section>
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
            placeholder="Select date"
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

function ScrollNavigationButton() {
  const [isAtTop, setIsAtTop] = useState(true)

  const updateScrollPosition = useEffectEvent(() => {
    setIsAtTop(window.scrollY === 0)
  })

  useEffect(() => {
    window.addEventListener("scroll", updateScrollPosition, { passive: true })
    const frame = requestAnimationFrame(updateScrollPosition)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", updateScrollPosition)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      className="fixed right-4 bottom-28 z-50 rounded-full shadow-md"
      aria-label={isAtTop ? "Scroll to bottom" : "Scroll to top"}
      onClick={isAtTop ? scrollToBottom : scrollToTop}
    >
      {isAtTop ? <ArrowDown /> : <ArrowUp />}
    </Button>
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
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RadioGroup
            value={
              field.value === true
                ? "true"
                : field.value === false
                  ? "false"
                  : ""
            }
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
    </Field>
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
  const [isSaving, startSaveTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showCustomUniversity, setShowCustomUniversity] = useState(
    () =>
      !defaultValues.universityId &&
      (defaultValues.university?.trim() ?? "") !== ""
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
            setError("Could not save application. Please try again.")
          })
          return
        }
      } catch {
        startTransition(() => {
          setError("Could not save application. Please try again.")
        })
      }
    })
  }

  const deleteApplication = () => {
    startDeleteTransition(async () => {
      startTransition(() => {
        setError(null)
      })

      try {
        const response = await fetch(`/api/applications/${applicationId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          startTransition(() => {
            setError("Could not delete application. Please try again.")
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
          setError("Could not delete application. Please try again.")
        })
      }
    })
  }

  const { control, register, formState, setValue } = form
  const instagram = useWatch({ control, name: "instagram" })
  const universityId = useWatch({ control, name: "universityId" })

  const universitySelectValue = showCustomUniversity
    ? UNIVERSITY_NOT_IN_LIST
    : (universityId ?? "")

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
      className="space-y-8 pb-24"
      onSubmit={form.handleSubmit(save)}
      noValidate
    >
      <FormSection title="პირადი ინფორმაცია">
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
        <Field>
          <FieldLabel>სქესი</FieldLabel>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex gap-4"
              >
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
        </Field>
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

      <FormSection title="მისამართი">
        <Field>
          <FieldLabel htmlFor="street">ქუჩა, სახლის ნომერი</FieldLabel>
          <Input id="street" {...register("street")} />
          <FieldError errors={[formState.errors.street]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="postalCode">საფოსტო ინდექსი</FieldLabel>
          <Input id="postalCode" {...register("postalCode")} />
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

      <FormSection title="კონტაქტი და სოციალური ქსელები">
        <Field>
          <FieldLabel htmlFor="email">საფოსტო ემაილი</FieldLabel>
          <Input id="email" type="email" {...register("email")} />
          <FieldError errors={[formState.errors.email]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="phone">ტელეფონის ნომერი</FieldLabel>
          <Input id="phone" {...register("phone")} />
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

      <FormSection title="სწავლა">
        <Field>
          <FieldLabel htmlFor="linkedUniversity">უნივერსიტეტი</FieldLabel>
          <NativeSelect
            id="linkedUniversity"
            className="w-full"
            value={universitySelectValue}
            onChange={(event) => onUniversitySelectChange(event.target.value)}
            aria-invalid={!!formState.errors.universityId}
          >
            <NativeSelectOption value="">
              აირჩიეთ უნივერსიტეტი
            </NativeSelectOption>
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
          <FieldLabel htmlFor="standardStudyPeriodYears">
            რეგულირებული სწავლის პერიოდი (წლებში)
          </FieldLabel>
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
                  placeholder="e.g. 4"
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
        <DateField
          name="enrolledSince"
          label="სწავლის დაწყების თარიღი"
          control={control}
        />
        <DateField
          name="expectedStudyEnd"
          label="სწავლის დასრულების მოსალოდნელი თარიღი"
          control={control}
        />
        <DateField
          name="semesterBreakFrom"
          label="არდადეგების დასაწყისი"
          control={control}
        />
        <DateField
          name="semesterBreakTo"
          label="არდადეგები დასასრული"
          control={control}
        />
        <BooleanRadioField
          name="studiesContinueAfterSemesterBreak"
          label="სწავლა გაგრძელდება არდადეგების შემდეგ?"
          control={control}
        />
      </FormSection>

      <FormSection title="კვალიფიკაცია და ჯანმრთელობა">
        <Field>
          <FieldLabel>გერმანულის დონე</FieldLabel>
          <Controller
            name="germanLevel"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(value === "" ? undefined : value)
                }
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
        </Field>
        <Field>
          <FieldLabel htmlFor="otherLanguages">
            სხვა ენების ცოდნა / ენის დონე
          </FieldLabel>
          <Input id="otherLanguages" {...register("otherLanguages")} />
        </Field>
        <BooleanRadioField
          name="driverLicense"
          label="მართვის მოწმობა"
          control={control}
        />
        <BooleanRadioField
          name="canRideBike"
          label="შეგიძლიათ ველოსიპედის ტარება?"
          control={control}
        />
        <BooleanRadioField
          name="shiftWork"
          label="მზადყოფნა ცვლებში მუშაობისთვის"
          control={control}
        />
        <Field>
          <FieldLabel htmlFor="healthRestrictions">
            ჯანმრთელობის შეზღუდვები თუ არის
          </FieldLabel>
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
        <Field>
          <FieldLabel>ფეხსაცმლის ზომა</FieldLabel>
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
                            field.onChange(
                              current.filter((item) => item !== size)
                            )
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
        </Field>
      </FormSection>

      <FormSection title="ყოფნა გერმანიაში">
        <BooleanRadioField
          name="hasBeenInGermanyBefore"
          label="ყოფნა გერმანიაში"
          control={control}
        />
        <Field>
          <FieldLabel htmlFor="previousStayPlace">თუ კი, სად</FieldLabel>
          <Input id="previousStayPlace" {...register("previousStayPlace")} />
        </Field>
        <DateField
          name="previousStayPeriodFrom"
          label="პერიოდის დასაწყისი"
          control={control}
        />
        <DateField
          name="previousStayPeriodTo"
          label="პერიოდის დასასრული"
          control={control}
        />
      </FormSection>

      <FormSection title="საგანგებო საკონტაქტო პირი">
        <Field>
          <FieldLabel htmlFor="emergencyContactName">
            საგანგებო საკონტაქტო პირი
          </FieldLabel>
          <Input
            id="emergencyContactName"
            {...register("emergencyContactName")}
          />
          <FieldError errors={[formState.errors.emergencyContactName]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="emergencyPhone">საგანგებო ტელეფონის ნომერი</FieldLabel>
          <Input id="emergencyPhone" {...register("emergencyPhone")} />
          <FieldError errors={[formState.errors.emergencyPhone]} />
        </Field>
      </FormSection>

      <FormSection title="სასურველი სამუშაო სფერო">
        <Field>
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
                            field.onChange(
                              field.value.filter((item) => item !== sector)
                            )
                          }
                        }}
                      />
                      <Label htmlFor={`sector-${sector}`}>
                        {workSectorLabels[sector]}
                      </Label>
                    </div>
                  )
                })}
              </div>
            )}
          />
          <FieldError errors={[formState.errors.workSector]} />
        </Field>
      </FormSection>

      <section className="space-y-4 border-t pt-8">
        <h2 className="text-lg font-medium">Other actions</h2>
        <div className="space-y-2">
          <CopyApplicationLinkButton applicationLink={applicationLink} />
          <ApplicationPdfButtons applicationId={applicationId} />
        </div>
      </section>

      <section className="space-y-4 border-t pt-8">
        <h2 className="text-lg font-medium">Delete application</h2>
        <p className="text-sm text-muted-foreground">
          Permanently remove this application and its photo. This cannot be
          undone.
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isSaving || isDeleting}
        >
          Delete application
        </Button>
      </section>

      {error !== null ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background p-4">
        <div className="mx-auto w-full max-w-lg">
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

      <ScrollNavigationButton />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete application?</DialogTitle>
            <DialogDescription>
              This will permanently delete the application and the stored photo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={deleteApplication}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
