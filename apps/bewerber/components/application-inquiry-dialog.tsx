"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
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
import {
  applicationInquiryFormSchema,
  emptyApplicationInquiryForm,
  type ApplicationInquiryFormData,
} from "@/lib/application-inquiry-schema"

export function ApplicationInquiryDialog({
  applicationId,
  open,
  onOpenChange,
}: {
  applicationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [form, setForm] = useState<ApplicationInquiryFormData>(
    emptyApplicationInquiryForm
  )
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ApplicationInquiryFormData, string>>
  >({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  function resetDialogState() {
    setForm(emptyApplicationInquiryForm)
    setFieldErrors({})
    setSubmitError(null)
    setIsSubmitting(false)
    setIsSubmitted(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetDialogState()
    }
    onOpenChange(nextOpen)
  }

  function updateField<K extends keyof ApplicationInquiryFormData>(
    key: K,
    value: ApplicationInquiryFormData[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => ({ ...current, [key]: undefined }))
    setSubmitError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = applicationInquiryFormSchema.safeParse(form)
    if (!parsed.success) {
      const nextErrors: Partial<
        Record<keyof ApplicationInquiryFormData, string>
      > = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === "string" && !(field in nextErrors)) {
          nextErrors[field as keyof ApplicationInquiryFormData] = issue.message
        }
      }
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/inquiries`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        }
      )

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        setSubmitError(
          body?.error ??
            "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut."
        )
        return
      }

      setIsSubmitted(true)
    } catch {
      setSubmitError(
        "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bewerberanfrage Formular</DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed">
              Vielen Dank! Wir haben Ihre Anfrage erhalten und melden uns,
              sobald wir die nächsten Schritte einleiten können.
            </p>
            <DialogFooter className="border-0 bg-transparent p-0 sm:justify-start">
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Schließen
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup>
              <Field data-invalid={fieldErrors.companyName ? true : undefined}>
                <FieldLabel htmlFor="companyName">Firmenname</FieldLabel>
                <Input
                  id="companyName"
                  name="companyName"
                  autoComplete="organization"
                  value={form.companyName}
                  onChange={(event) =>
                    updateField("companyName", event.target.value)
                  }
                  aria-invalid={fieldErrors.companyName ? true : undefined}
                  disabled={isSubmitting}
                  required
                />
                {fieldErrors.companyName ? (
                  <FieldError>{fieldErrors.companyName}</FieldError>
                ) : null}
              </Field>

              <Field
                data-invalid={fieldErrors.contactPersonName ? true : undefined}
              >
                <FieldLabel htmlFor="contactPersonName">
                  Name der zuständigen Person für Personal
                </FieldLabel>
                <Input
                  id="contactPersonName"
                  name="contactPersonName"
                  autoComplete="name"
                  value={form.contactPersonName}
                  onChange={(event) =>
                    updateField("contactPersonName", event.target.value)
                  }
                  aria-invalid={
                    fieldErrors.contactPersonName ? true : undefined
                  }
                  disabled={isSubmitting}
                  required
                />
                {fieldErrors.contactPersonName ? (
                  <FieldError>{fieldErrors.contactPersonName}</FieldError>
                ) : null}
              </Field>

              <Field data-invalid={fieldErrors.email ? true : undefined}>
                <FieldLabel htmlFor="email">E-Mail</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  aria-invalid={fieldErrors.email ? true : undefined}
                  disabled={isSubmitting}
                  required
                />
                {fieldErrors.email ? (
                  <FieldError>{fieldErrors.email}</FieldError>
                ) : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">
                  Telefonnummer{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  disabled={isSubmitting}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="message">
                  Nachricht{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FieldLabel>
                <textarea
                  id="message"
                  name="message"
                  className={
                    "min-h-24 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                  }
                  value={form.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  disabled={isSubmitting}
                />
              </Field>
            </FieldGroup>

            {submitError ? <FieldError>{submitError}</FieldError> : null}

            <DialogFooter className="border-0 bg-transparent p-0 sm:justify-start">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Wird gesendet…" : "Senden"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
