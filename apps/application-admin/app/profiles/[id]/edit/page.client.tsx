"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
} from "react-hook-form"
import { useRouter } from "next/navigation"
import { startTransition, useState, useTransition, type ReactNode } from "react"
import { Plus, Trash2 } from "lucide-react"
import {
  adminProfileEditSchema,
  type AdminProfileEditData,
  desiredSalaryLabels,
  desiredSalaryOptions,
  languageLevelOptions,
  workSectorOptions,
} from "@workspace/profile/schema"
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
import { cn } from "@workspace/ui/lib/utils"
import { InstagramLink } from "@/components/instagram-link"

interface ProfileEditFormProps {
  profileId: string
  defaultValues: AdminProfileEditData
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

function BooleanRadioField({
  name,
  label,
  control,
}: {
  name: "isStudent"
  label: string
  control: Control<AdminProfileEditData>
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
              <Label htmlFor={`${name}-yes`}>Yes</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="false" id={`${name}-no`} />
              <Label htmlFor={`${name}-no`}>No</Label>
            </div>
          </RadioGroup>
        )}
      />
    </Field>
  )
}

export function ProfileEditForm({
  profileId,
  defaultValues,
}: ProfileEditFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSaving, startSaveTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const form = useForm<AdminProfileEditData>({
    resolver: standardSchemaResolver(adminProfileEditSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "languages",
  })

  const save = (data: AdminProfileEditData) => {
    startSaveTransition(async () => {
      setError(null)

      try {
        const response = await fetch(`/api/profiles/${profileId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          setError("Could not save profile. Please try again.")
          return
        }

        router.push("/profiles")
        router.refresh()
      } catch {
        setError("Could not save profile. Please try again.")
      }
    })
  }

  const deleteProfile = () => {
    startDeleteTransition(async () => {
      startTransition(() => {
        setError(null)
      })

      try {
        const response = await fetch(`/api/profiles/${profileId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          startTransition(() => {
            setError("Could not delete profile. Please try again.")
          })
          return
        }

        startTransition(() => {
          setIsDeleteDialogOpen(false)
        })
        router.push("/profiles")
        router.refresh()
      } catch {
        startTransition(() => {
          startTransition(() => {
            setIsDeleteDialogOpen(false)
          })
        })
      }
    })
  }

  const { control, register, formState } = form
  const instagram = useWatch({ control, name: "instagram" })

  return (
    <form
      className="space-y-8 pb-24"
      onSubmit={form.handleSubmit(save)}
      noValidate
    >
      <FormSection title="Personal data">
        <Field>
          <FieldLabel htmlFor="firstName">First name</FieldLabel>
          <Input id="firstName" {...register("firstName")} />
          <FieldError errors={[formState.errors.firstName]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="lastName">Last name</FieldLabel>
          <Input id="lastName" {...register("lastName")} />
          <FieldError errors={[formState.errors.lastName]} />
        </Field>
        <Field>
          <FieldLabel>Gender</FieldLabel>
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
                  <Label htmlFor="gender-m">Male</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="F" id="gender-f" />
                  <Label htmlFor="gender-f">Female</Label>
                </div>
              </RadioGroup>
            )}
          />
          <FieldError errors={[formState.errors.gender]} />
        </Field>
        <Controller
          name="birthDate"
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="birthDate">Birth date</FieldLabel>
              <SafariInputDate<AdminProfileEditData, "birthDate">
                field={field}
                id="birthDate"
                aria-invalid={fieldState.invalid}
                placeholder="Select date"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" {...register("email")} />
          <FieldError errors={[formState.errors.email]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
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
        <BooleanRadioField
          name="isStudent"
          label="Is student"
          control={control}
        />
      </FormSection>

      <FormSection title="Languages">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-[1fr_auto_auto]"
            >
              <Field>
                <FieldLabel htmlFor={`language-${index}`}>Language</FieldLabel>
                <Input
                  id={`language-${index}`}
                  {...register(`languages.${index}.language`)}
                />
                <FieldError
                  errors={[formState.errors.languages?.[index]?.language]}
                />
              </Field>
              <Controller
                name={`languages.${index}.level`}
                control={control}
                render={({ field: levelField, fieldState }) => (
                  <Field className="md:min-w-32">
                    <FieldLabel htmlFor={`level-${index}`}>Level</FieldLabel>
                    <select
                      id={`level-${index}`}
                      value={levelField.value ?? ""}
                      onChange={(event) =>
                        levelField.onChange(event.target.value)
                      }
                      aria-invalid={fieldState.invalid}
                      className={cn(
                        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                      )}
                    >
                      {languageLevelOptions.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                  aria-label="Remove language"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <FieldError errors={[formState.errors.languages?.root]} />
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ language: "", level: "A1" })}
        >
          <Plus className="size-4" />
          Add language
        </Button>
      </FormSection>

      <FormSection title="Work preferences">
        <Field>
          <FieldLabel>Work sector</FieldLabel>
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
                      <Label htmlFor={`sector-${sector}`}>{sector}</Label>
                    </div>
                  )
                })}
              </div>
            )}
          />
          <FieldError errors={[formState.errors.workSector]} />
        </Field>
        <Field>
          <FieldLabel>Desired salary</FieldLabel>
          <Controller
            name="desiredSalary"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="space-y-2"
              >
                {desiredSalaryOptions.map((option) => (
                  <div key={option} className="flex items-center gap-2">
                    <RadioGroupItem value={option} id={`salary-${option}`} />
                    <Label htmlFor={`salary-${option}`}>
                      {desiredSalaryLabels[option]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
          <FieldError errors={[formState.errors.desiredSalary]} />
        </Field>
      </FormSection>

      <section className="space-y-4 border-t pt-8">
        <h2 className="text-lg font-medium">Delete profile</h2>
        <p className="text-sm text-muted-foreground">
          Permanently remove this profile and its photo. This cannot be undone.
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isSaving || isDeleting}
        >
          Delete profile
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
            disabled={!formState.isDirty || isSaving || isDeleting}
          >
            {isSaving ? "Saving…" : "Save & send photo to Telegram"}
          </Button>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete profile?</DialogTitle>
            <DialogDescription>
              This will permanently delete the profile, its languages, and the
              stored photo.
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
              onClick={deleteProfile}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
