"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  universityCreateSchema,
  type UniversityCreateData,
} from "@/lib/university-schema"

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, startSubmitTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UniversityCreateData>({
    resolver: standardSchemaResolver(universityCreateSchema),
    defaultValues,
  })

  const onSubmit = handleSubmit((data) => {
    startSubmitTransition(async () => {
      startSubmitTransition(() => {
        setSuccessMessage(null)
        setErrorMessage(null)
      })

      try {
        const response = await fetch("/api/universities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (response.status === 409) {
          startSubmitTransition(() => {
            setErrorMessage("A university with this name already exists.")
          })

          return
        }

        if (!response.ok) {
          startSubmitTransition(() => {
            setErrorMessage("Could not create university. Please try again.")
          })
          return
        }

        reset(defaultValues)
        startSubmitTransition(() => {
          setSuccessMessage("University created successfully.")
        })
      } catch {
        startSubmitTransition(() => {
          setErrorMessage("Could not create university. Please try again.")
        })
      }
    })
  })

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            {...register("name")}
            aria-invalid={errors.name !== undefined}
          />
          {errors.name !== undefined ? (
            <FieldError errors={[errors.name]} />
          ) : null}
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="street">Street</FieldLabel>
            <Input id="street" {...register("street")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="streetNumber">Street number</FieldLabel>
            <Input id="streetNumber" {...register("streetNumber")} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="postalCode">Postal code</FieldLabel>
            <Input id="postalCode" {...register("postalCode")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input id="city" {...register("city")} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="country">Country</FieldLabel>
          <Input id="country" {...register("country")} />
        </Field>

        <Field>
          <FieldLabel htmlFor="telephone">Telephone</FieldLabel>
          <Input id="telephone" {...register("telephone")} />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            {...register("email")}
            aria-invalid={errors.email !== undefined}
          />
          {errors.email !== undefined ? (
            <FieldError errors={[errors.email]} />
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="website">Website</FieldLabel>
          <Input
            id="website"
            type="url"
            placeholder="https://example.edu"
            {...register("website")}
            aria-invalid={errors.website !== undefined}
          />
          {errors.website !== undefined ? (
            <FieldError errors={[errors.website]} />
          ) : null}
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create university"}
      </Button>

      {successMessage !== null ? (
        <p className="text-center text-sm text-green-700">{successMessage}</p>
      ) : null}
      {errorMessage !== null ? (
        <p className="text-center text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </form>
  )
}
