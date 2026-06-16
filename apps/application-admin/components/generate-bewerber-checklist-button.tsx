"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

interface GenerateBewerberChecklistButtonProps {
  applicationId: string
}

function getDownloadFilename(contentDisposition: string | null): string | null {
  if (contentDisposition === null) {
    return null
  }

  const match = /filename="([^"]+)"/.exec(contentDisposition)
  return match?.[1] ?? null
}

export function GenerateBewerberChecklistButton({
  applicationId,
}: GenerateBewerberChecklistButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function generateChecklist() {
    setIsGenerating(true)

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/bewerber-checklist-pdf`,
        { method: "POST" }
      )

      if (!response.ok) {
        setErrorMessage(
          "Failed to generate Bewerber Checklist PDF. Please try again."
        )
        setIsErrorDialogOpen(true)
        return
      }

      const blob = await response.blob()
      const downloadFilename =
        getDownloadFilename(response.headers.get("Content-Disposition")) ??
        "bewerber-checklist.pdf"
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = objectUrl
      anchor.download = downloadFilename
      anchor.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      setErrorMessage(
        "Failed to generate Bewerber Checklist PDF. Please try again."
      )
      setIsErrorDialogOpen(true)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isGenerating}
        onClick={generateChecklist}
      >
        {isGenerating
          ? "Generating…"
          : "Generate Bewerber Checklist PDF"}
      </Button>

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
