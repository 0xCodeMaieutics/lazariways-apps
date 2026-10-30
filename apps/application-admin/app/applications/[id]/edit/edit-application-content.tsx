"use client"

import type { AdminApplicationEditData } from "@workspace/application/schema"
import { Button } from "@workspace/ui/components/button"
import { ImageCropper } from "@workspace/ui/components/image-cropper"
import { Loader2, Pencil } from "lucide-react"
import { useRef, useState, useTransition } from "react"

import { ApplicationEditForm } from "./page.client"

export type UniversityOption = {
  id: string
  name: string
}

interface EditApplicationContentProps {
  applicationId: string
  applicationLink: string
  defaultValues: AdminApplicationEditData
  fotoUrl: string
  applicantName: string
  universities: UniversityOption[]
}

export function EditApplicationContent({
  applicationId,
  applicationLink,
  defaultValues,
  fotoUrl,
  applicantName,
  universities,
}: EditApplicationContentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState(fotoUrl)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cropSource, setCropSource] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, startUpload] = useTransition()

  const resetPicker = () => {
    setSelectedFile(null)
    setCropSource(null)
    if (fileInputRef.current !== null) {
      fileInputRef.current.value = ""
    }
  }

  const uploadCroppedFoto = (cropped: File) => {
    startUpload(async () => {
      setError(null)
      resetPicker()

      const body = new FormData()
      body.append("foto", cropped)

      try {
        const response = await fetch(`/api/applications/${applicationId}/foto`, {
          method: "POST",
          body,
        })

        if (!response.ok) {
          setError("ფოტოს ატვირთვა ვერ მოხერხდა. სცადეთ ხელახლა.")
          return
        }

        const payload: unknown = await response.json()
        if (
          typeof payload !== "object" ||
          payload === null ||
          !("fotoUrl" in payload) ||
          typeof payload.fotoUrl !== "string"
        ) {
          setError("ფოტოს ატვირთვა ვერ მოხერხდა. სცადეთ ხელახლა.")
          return
        }

        setPreviewUrl(payload.fotoUrl)
      } catch {
        setError("ფოტოს ატვირთვა ვერ მოხერხდა. სცადეთ ხელახლა.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="relative mx-auto h-72 w-54">
          <button
            type="button"
            className="group h-full w-full overflow-hidden rounded-lg bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-wait"
            disabled={isUploading}
            aria-label="ფოტოს შეცვლა"
            aria-busy={isUploading}
            onClick={() => {
              fileInputRef.current?.click()
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={applicantName}
              className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
            />
            {isUploading ? (
              <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60">
                <Loader2 className="size-8 animate-spin" aria-hidden />
              </span>
            ) : null}
          </button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="absolute right-2 bottom-2 shadow-md"
            disabled={isUploading}
            tabIndex={-1}
            aria-hidden
            onClick={() => {
              fileInputRef.current?.click()
            }}
          >
            <Pencil />
            შეცვლა
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file === undefined) {
                resetPicker()
                return
              }

              const reader = new FileReader()
              reader.readAsDataURL(file)
              reader.onload = () => {
                setCropSource(reader.result as string)
              }
              reader.onerror = () => {
                setError("ფოტოს წაკითხვა ვერ მოხერხდა. სცადეთ ხელახლა.")
                resetPicker()
              }
              setSelectedFile(file)
              setError(null)
            }}
          />
        </div>
        {error !== null ? <p className="text-sm text-destructive">{error}</p> : null}
        {isUploading ? <p className="text-sm text-muted-foreground">იტვირთება...</p> : null}
      </div>
      {cropSource !== null && selectedFile !== null ? (
        <ImageCropper
          base64Image={cropSource}
          originalFile={selectedFile}
          onDismiss={resetPicker}
          onCropComplete={(cropped) => {
            uploadCroppedFoto(cropped)
          }}
        />
      ) : null}
      <ApplicationEditForm
        applicationId={applicationId}
        applicationLink={applicationLink}
        defaultValues={defaultValues}
        universities={universities}
      />
    </div>
  )
}
