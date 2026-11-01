"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Button } from "@lazariways/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@lazariways/ui/components/field"
import { Input } from "@lazariways/ui/components/input"
import { toast } from "@lazariways/ui/components/sonner"
import { CircleAlert, Loader2, Plus } from "lucide-react"
import { startTransition, useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { universityCreateSchema, type UniversityCreateData } from "@/lib/university-schema"

const CREATE_ERROR = "უნივერსიტეტის დამატება ვერ მოხერხდა. სცადეთ ხელახლა."

const SECTION_CLASS_NAME = "rounded-xl bg-card p-4 ring-1 ring-foreground/10 md:p-6"

const defaultValues: UniversityCreateData = {
  name: "",
  street: "",
  streetNumber: "",
  postalCode: "",
  city: "",
  country: "",
  telephone: "",
  email: "",
  website: "",
}

export function UniversityCreateForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, startSubmitTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<UniversityCreateData>({
    resolver: standardSchemaResolver(universityCreateSchema),
    defaultValues,
  })

  const onSubmit = handleSubmit((data) => {
    startSubmitTransition(async () => {
      startTransition(() => {
        setErrorMessage(null)
      })

      try {
        const response = await fetch("/api/universities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (response.status === 409) {
          setError("name", { message: "ამ სახელით უნივერსიტეტი უკვე არსებობს" }, { shouldFocus: true })
          return
        }

        if (!response.ok) {
          startTransition(() => {
            setErrorMessage(CREATE_ERROR)
          })
          return
        }

        reset(defaultValues)
        setFocus("name")
        toast.success("უნივერსიტეტი წარმატებით დაემატა")
      } catch {
        startTransition(() => {
          setErrorMessage(CREATE_ERROR)
        })
      }
    })
  })

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <FieldSet className={SECTION_CLASS_NAME}>
        <FieldLegend>ძირითადი ინფორმაცია</FieldLegend>
        <FieldGroup>
          <Field data-invalid={errors.name !== undefined}>
            <FieldLabel htmlFor="name">
              სახელი
              <span className="text-destructive" aria-hidden>
                *
              </span>
            </FieldLabel>
            <Input
              id="name"
              autoComplete="organization"
              required
              aria-invalid={errors.name !== undefined}
              {...register("name")}
            />
            {errors.name !== undefined ? <FieldError errors={[errors.name]} /> : null}
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet className={SECTION_CLASS_NAME}>
        <FieldLegend>მისამართი</FieldLegend>
        <FieldDescription>ყველა ველი არასავალდებულოა.</FieldDescription>
        <FieldGroup>
          <div className="grid grid-cols-[1fr_7rem] gap-4 md:grid-cols-[1fr_9rem]">
            <Field>
              <FieldLabel htmlFor="street">ქუჩა</FieldLabel>
              <Input id="street" autoComplete="address-line1" {...register("street")} />
            </Field>

            <Field>
              <FieldLabel htmlFor="streetNumber">ნომერი</FieldLabel>
              <Input id="streetNumber" {...register("streetNumber")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[10rem_1fr]">
            <Field>
              <FieldLabel htmlFor="postalCode">საფოსტო ინდექსი</FieldLabel>
              <Input id="postalCode" autoComplete="postal-code" {...register("postalCode")} />
            </Field>

            <Field>
              <FieldLabel htmlFor="city">ქალაქი</FieldLabel>
              <Input id="city" autoComplete="address-level2" {...register("city")} />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="country">ქვეყანა</FieldLabel>
            <Input id="country" autoComplete="country-name" {...register("country")} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet className={SECTION_CLASS_NAME}>
        <FieldLegend>საკონტაქტო ინფორმაცია</FieldLegend>
        <FieldDescription>ყველა ველი არასავალდებულოა.</FieldDescription>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="telephone">ტელეფონი</FieldLabel>
              <Input
                id="telephone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+49 30 123456"
                {...register("telephone")}
              />
            </Field>

            <Field data-invalid={errors.email !== undefined}>
              <FieldLabel htmlFor="email">ელ. ფოსტა</FieldLabel>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="info@example.edu"
                aria-invalid={errors.email !== undefined}
                {...register("email")}
              />
              {errors.email !== undefined ? <FieldError errors={[errors.email]} /> : null}
            </Field>
          </div>

          <Field data-invalid={errors.website !== undefined}>
            <FieldLabel htmlFor="website">ვებსაიტი</FieldLabel>
            <Input
              id="website"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://example.edu"
              aria-invalid={errors.website !== undefined}
              {...register("website")}
            />
            {errors.website !== undefined ? <FieldError errors={[errors.website]} /> : null}
          </Field>
        </FieldGroup>
      </FieldSet>

      {errorMessage !== null ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {errorMessage}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Plus className="size-4" aria-hidden />
          )}
          {isSubmitting ? "ემატება…" : "უნივერსიტეტის დამატება"}
        </Button>
      </div>
    </form>
  )
}
