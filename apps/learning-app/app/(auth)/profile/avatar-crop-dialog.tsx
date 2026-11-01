"use client"

import { Button } from "@lazariways/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@lazariways/ui/components/dialog"
import { ZoomIn, ZoomOut } from "lucide-react"
import { useState } from "react"
import Cropper, { type Area, type Point } from "react-easy-crop"

const OUTPUT_SIZE = 512
const MIN_ZOOM = 1
const MAX_ZOOM = 3

export const AvatarCropDialog = ({
  imageSrc,
  fileName,
  onCancel,
  onCropped,
}: {
  imageSrc: string
  fileName: string
  onCancel: () => void
  onCropped: (file: File) => void
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isCropping, setIsCropping] = useState(false)

  const handleSave = async () => {
    if (croppedAreaPixels === null) return
    setIsCropping(true)
    try {
      onCropped(await cropImage(imageSrc, croppedAreaPixels, fileName))
    } catch (error) {
      console.error("AVATAR_CROP_FAILED", error)
    } finally {
      setIsCropping(false)
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isCropping) onCancel()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ფოტოს მორგება</DialogTitle>
          <DialogDescription>გადაადგილეთ და გაადიდეთ ფოტო სასურველი კადრის ასარჩევად</DialogDescription>
        </DialogHeader>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
          />
        </div>
        <div className="flex items-center gap-3">
          <ZoomOut className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="range"
            aria-label="Zoom"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-primary"
          />
          <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isCropping}>
            გაუქმება
          </Button>
          <Button type="button" onClick={handleSave} disabled={isCropping || croppedAreaPixels === null}>
            {isCropping ? "მუშავდება..." : "შენახვა"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", reject)
    image.src = src
  })

const cropImage = async (imageSrc: string, area: Area, fileName: string) => {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement("canvas")
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  const ctx = canvas.getContext("2d")
  if (ctx === null) throw new Error("No canvas context")

  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

  // Browsers without WebP encoding fall back to PNG, so the File type comes from the blob.
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result === null ? reject(new Error("toBlob failed")) : resolve(result)),
      "image/webp",
      0.9
    )
  })

  const extension = blob.type === "image/webp" ? "webp" : "png"
  const baseName = fileName.replace(/\.[^.]+$/, "")
  return new File([blob], `${baseName}.${extension}`, { type: blob.type })
}
