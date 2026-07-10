"use client"

import type { AdminApplicationEditData } from "@workspace/application/schema"
import { ApplicationPdfButtons } from "@/components/application-pdf-buttons"
import { ApplicationEditForm } from "./page.client"

export type UniversityOption = {
  id: string
  name: string
}

interface EditApplicationContentProps {
  applicationId: string
  defaultValues: AdminApplicationEditData
  fotoUrl: string
  applicantName: string
  universities: UniversityOption[]
}

export function EditApplicationContent({
  applicationId,
  defaultValues,
  fotoUrl,
  applicantName,
  universities,
}: EditApplicationContentProps) {
  return (
    <div className="space-y-6">
      <ApplicationPdfButtons applicationId={applicationId} />
      <div className="mx-auto h-40 w-32 overflow-hidden rounded-lg bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fotoUrl}
          alt={applicantName}
          className="h-full w-full object-cover"
        />
      </div>
      <ApplicationEditForm
        applicationId={applicationId}
        defaultValues={defaultValues}
        universities={universities}
      />
    </div>
  )
}
