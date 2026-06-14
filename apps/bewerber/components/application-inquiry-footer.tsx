"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { ApplicationInquiryDialog } from "@/components/application-inquiry-dialog"

interface ApplicationInquiryFooterProps {
  applicationId: string
}

export function ApplicationInquiryFooter({
  applicationId,
}: ApplicationInquiryFooterProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto w-full max-w-lg px-4 sm:px-6">
          <Button
            type="button"
            className="w-full"
            size="lg"
            onClick={() => setIsDialogOpen(true)}
          >
            Bewerber anfragen
          </Button>
        </div>
      </div>

      <ApplicationInquiryDialog
        applicationId={applicationId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  )
}
