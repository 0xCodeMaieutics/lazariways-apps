"use client"

import { useState } from "react"
import {
  personalGeorgienProfessionOptions,
  type PersonalGeorgienProfession,
} from "@workspace/application/pdf"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
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
  const [profession, setProfession] =
    useState<PersonalGeorgienProfession>("Restaurant & Bar Staff")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function generateProfile() {
    setIsGenerating(true)

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/personalgeorgien-pdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profession }),
        }
      )

      if (!response.ok) {
        setErrorMessage(
          "Failed to generate Personalgeorgien profile PDF. Please try again."
        )
        setIsErrorDialogOpen(true)
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
    } catch {
      setErrorMessage(
        "Failed to generate Personalgeorgien profile PDF. Please try again."
      )
      setIsErrorDialogOpen(true)
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
            "border-input bg-background h-9 min-w-0 flex-1 rounded-lg border px-2.5 text-sm transition-colors outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
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
          className="shrink-0"
          disabled={isGenerating}
          onClick={generateProfile}
        >
          {isGenerating
            ? "მუშავდება…"
            : "Personalgeorgien პროფილის გენერირება"}
        </Button>
      </div>

      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>PDF generation failed</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsErrorDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
