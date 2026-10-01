"use client"

import { useState } from "react"
import {
  personalGeorgienProfessionOptions,
  type PersonalGeorgienProfession,
} from "@workspace/application/pdf"
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
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"

interface GeneratePersonalgeorgienProfileButtonProps {
  applicationId: string
}

function getDownloadFilename(contentDisposition: string | null): string | null {
  if (contentDisposition === null) {
    return null
  }

  const match = /filename="([^"]+)"/.exec(contentDisposition)
  return match?.[1] ?? null
}

export function GeneratePersonalgeorgienProfileButton({
  applicationId,
}: GeneratePersonalgeorgienProfileButtonProps) {
  const [profession, setProfession] = useState<PersonalGeorgienProfession>(
    "Restaurant & Bar Staff"
  )
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false)
  const [experienceDate, setExperienceDate] = useState("")
  const [experienceOngoing, setExperienceOngoing] = useState(true)
  const [activitiesText, setActivitiesText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function generateProfile() {
    setIsGenerating(true)
    setErrorMessage("")

    const activities = activitiesText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    const body: {
      profession: PersonalGeorgienProfession
      experienceDate?: string
      experienceOngoing?: boolean
      activities?: string[]
    } = { profession }

    if (experienceDate !== "") {
      body.experienceDate = experienceDate
      body.experienceOngoing = experienceOngoing
    }

    if (activities.length > 0) {
      body.activities = activities
    }

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/personalgeorgien-pdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      )

      if (!response.ok) {
        setErrorMessage("PDF-ის გენერირება ვერ მოხერხდა. სცადეთ თავიდან.")
        return
      }

      const blob = await response.blob()
      const downloadFilename =
        getDownloadFilename(response.headers.get("Content-Disposition")) ??
        "personalgeorgien.pdf"
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = objectUrl
      anchor.download = downloadFilename
      anchor.click()
      URL.revokeObjectURL(objectUrl)
      setIsOptionsDialogOpen(false)
    } catch {
      setErrorMessage("PDF-ის გენერირება ვერ მოხერხდა. სცადეთ თავიდან.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <select
          value={profession}
          disabled={isGenerating}
          onChange={(event) =>
            setProfession(event.target.value as PersonalGeorgienProfession)
          }
          aria-label="Personalgeorgien profession"
          className={cn(
            "h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-2.5 text-sm transition-colors outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "min-w-20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {personalGeorgienProfessionOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          className="min-w-0 shrink justify-start overflow-hidden"
          disabled={isGenerating}
          onClick={() => setIsOptionsDialogOpen(true)}
        >
          <span className="min-w-0 truncate">
            {isGenerating
              ? "მუშავდება…"
              : "Personalgeorgien პროფილის გენერირება"}
          </span>
        </Button>
      </div>

      <Dialog
        open={isOptionsDialogOpen}
        onOpenChange={(open) => {
          if (isGenerating) return
          setIsOptionsDialogOpen(open)
          if (!open) setErrorMessage("")
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Personalgeorgien პროფილი</DialogTitle>
            <DialogDescription>
              თარიღი და აქტივობები არასავალდებულოა. ცარიელი ველი შემთხვევით
              მნიშვნელობას იყენებს.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="personalgeorgien-experience-date">
                თარიღი
              </FieldLabel>
              <Input
                id="personalgeorgien-experience-date"
                type="month"
                value={experienceDate}
                disabled={isGenerating}
                onChange={(event) => setExperienceDate(event.target.value)}
              />
              <FieldDescription>
                თვე და წელი. შევსებისას ჩაანაცვლებს შემთხვევით თარიღს.
              </FieldDescription>
            </Field>
            <div className="flex items-center gap-2">
              <Checkbox
                id="personalgeorgien-experience-ongoing"
                checked={experienceOngoing}
                disabled={isGenerating || experienceDate === ""}
                onCheckedChange={(value) =>
                  setExperienceOngoing(value === true)
                }
              />
              <Label htmlFor="personalgeorgien-experience-ongoing">
                მიმდინარე (seit)
              </Label>
            </div>
            <Field>
              <FieldLabel htmlFor="personalgeorgien-activities">
                აქტივობები
              </FieldLabel>
              <textarea
                id="personalgeorgien-activities"
                value={activitiesText}
                disabled={isGenerating}
                placeholder="თითო აქტივობა ახალ ხაზზე"
                onChange={(event) => setActivitiesText(event.target.value)}
                className={cn(
                  "min-h-28 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none",
                  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                )}
              />
              <FieldDescription>
                შევსებისას ჩაანაცვლებს შემთხვევით აქტივობებს.
              </FieldDescription>
            </Field>
            {errorMessage !== "" ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : null}
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isGenerating}
              onClick={() => setIsOptionsDialogOpen(false)}
            >
              გაუქმება
            </Button>
            <Button
              type="button"
              disabled={isGenerating}
              onClick={generateProfile}
            >
              {isGenerating ? "მუშავდება…" : "გენერირება"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
