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

interface GenerateCertificateOfEnrollmentButtonProps {
  applicationId: string
}

function getDownloadFilename(contentDisposition: string | null): string | null {
  if (contentDisposition === null) {
    return null
  }

  const match = /filename="([^"]+)"/.exec(contentDisposition)
  return match?.[1] ?? null
}

export function GenerateCertificateOfEnrollmentButton({
  applicationId,
}: GenerateCertificateOfEnrollmentButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function generateCertificate() {
    setIsGenerating(true)

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/certificate-of-enrollment-pdf`,
        { method: "POST" }
      )

      if (!response.ok) {
        let message =
          "Failed to generate Certificate of Enrolment PDF. Please try again."

        try {
          const body: unknown = await response.json()
          if (
            typeof body === "object" &&
            body !== null &&
            "error" in body &&
            typeof body.error === "string"
          ) {
            message = body.error
          }
        } catch {
          // keep default message
        }

        setErrorMessage(message)
        setIsErrorDialogOpen(true)
        return
      }

      const blob = await response.blob()
      const downloadFilename =
        getDownloadFilename(response.headers.get("Content-Disposition")) ??
        "certificate-of-enrollment.pdf"
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = objectUrl
      anchor.download = downloadFilename
      anchor.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      setErrorMessage(
        "Failed to generate Certificate of Enrolment PDF. Please try again."
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
        onClick={generateCertificate}
      >
        {isGenerating ? "მუშავდება" : "იმატრიკულაციის გენერირება"}
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
