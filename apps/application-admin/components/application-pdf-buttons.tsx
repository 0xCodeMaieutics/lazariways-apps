"use client"

import { GenerateBewerberChecklistButton } from "@/components/generate-bewerber-checklist-button"
import { GenerateCertificateOfEnrollmentButton } from "@/components/generate-certificate-of-enrollment-button"
import { GeneratePersonalgeorgienProfileButton } from "@/components/generate-personalgeorgien-profile-button"

interface ApplicationPdfButtonsProps {
  applicationId: string
}

export function ApplicationPdfButtons({
  applicationId,
}: ApplicationPdfButtonsProps) {
  return (
    <div className="space-y-2">
      <GenerateBewerberChecklistButton applicationId={applicationId} />
      <GenerateCertificateOfEnrollmentButton applicationId={applicationId} />
      <GeneratePersonalgeorgienProfileButton applicationId={applicationId} />
    </div>
  )
}
