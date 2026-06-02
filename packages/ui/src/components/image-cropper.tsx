'use client'

import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'

export type ImageCropperProps = {
    base64Image: string
    originalFile: File
    onCropComplete: (croppedFile: File) => void
    onDismiss?: () => void
}

export function ImageCropper({
    base64Image,
    originalFile,
    onCropComplete,
    onDismiss,
}: ImageCropperProps) {
    const [open, setOpen] = useState(true)
    const viewportRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)

    const [offsetY, setOffsetY] = useState(0)
    const [isCropping, setIsCropping] = useState(false)
    const dragRef = useRef<{ startY: number; startOffset: number } | null>(null)

    const handleOpenChange = useCallback(
        (next: boolean) => {
            setOpen(next)
            if (!next) onDismiss?.()
        },
        [onDismiss]
    )

    const clampOffset = useCallback((next: number) => {
        const viewport = viewportRef.current
        const img = imgRef.current
        if (!viewport || !img) return next
        const vpH = viewport.clientHeight
        const imgH = img.offsetHeight
        const minY = Math.min(0, vpH - imgH)
        const maxY = 0
        return Math.max(minY, Math.min(maxY, next))
    }, [])

    useLayoutEffect(() => {
        const img = imgRef.current
        const viewport = viewportRef.current
        if (!img || !viewport) return

        const sync = () => {
            const vpH = viewport.clientHeight
            const imgH = img.offsetHeight
            const minY = Math.min(0, vpH - imgH)
            setOffsetY(minY / 2)
        }

        if (img.complete && img.naturalWidth > 0) {
            sync()
            return
        }

        img.addEventListener('load', sync, { once: true })
        return () => img.removeEventListener('load', sync)
    }, [base64Image])

    const onPointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.currentTarget.setPointerCapture(e.pointerId)
            dragRef.current = {
                startY: e.clientY,
                startOffset: offsetY,
            }
        },
        [offsetY]
    )

    const onPointerMove = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (!dragRef.current) return
            const dy = e.clientY - dragRef.current.startY
            const next = dragRef.current.startOffset + dy
            setOffsetY(clampOffset(next))
        },
        [clampOffset]
    )

    const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (dragRef.current) {
            try {
                e.currentTarget.releasePointerCapture(e.pointerId)
            } catch {
                /* ignore */
            }
            dragRef.current = null
        }
    }, [])

    useEffect(() => {
        const onWinPointerUp = () => {
            dragRef.current = null
        }
        window.addEventListener('pointerup', onWinPointerUp)
        window.addEventListener('pointercancel', onWinPointerUp)
        return () => {
            window.removeEventListener('pointerup', onWinPointerUp)
            window.removeEventListener('pointercancel', onWinPointerUp)
        }
    }, [])

    const handleCrop = useCallback(async () => {
        const viewport = viewportRef.current
        const img = imgRef.current
        if (!viewport || !img || isCropping) return
        setIsCropping(true)
        try {
            const mime = mimeFromDataUrl(base64Image, originalFile.type)
            const fileName = croppedFileName(originalFile.name, mime)
            const croppedFile = await cropViewportToSquareFile(
                img,
                viewport,
                mime,
                fileName
            )

            onCropComplete(croppedFile.croppedFile)
            setOpen(false)
        } catch (err) {
            console.error('IMAGE_CROP_FAILED', err)
        } finally {
            setIsCropping(false)
        }
    }, [
        base64Image,
        isCropping,
        onCropComplete,
        originalFile.name,
        originalFile.type,
    ])

    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>ფოტოს მორგება</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <p className="text-muted-foreground text-sm">
                        გადაიტანეთ ფოტო ზემოთ ან ქვემოთ — კადრი კვადრატულია
                    </p>
                    <div
                        ref={viewportRef}
                        role="presentation"
                        className="border-primary/60 bg-muted relative mx-auto aspect-square w-full max-w-[min(85vw,280px)] touch-none overflow-hidden rounded-xl border-2 border-dashed select-none"
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            ref={imgRef}
                            src={base64Image}
                            alt=""
                            draggable={false}
                            className="pointer-events-none block h-auto w-full max-w-none"
                            style={{
                                transform: `translateY(${offsetY}px)`,
                                willChange: 'transform',
                            }}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isCropping}
                    >
                        გაუქმება
                    </Button>
                    <Button
                        type="button"
                        onClick={handleCrop}
                        disabled={isCropping}
                    >
                        {isCropping ? 'მუშავდება...' : 'ამოჭრა და შენახვა'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function mimeFromDataUrl(dataUrl: string, fallback: string): string {
    const urlRegex = /^data:(image\/[a-zA-Z0-9.+-]+);/i.exec(dataUrl)
    const mimeType = urlRegex?.[1] // e.g. image/png
    if (mimeType !== undefined) {
        if (mimeType === 'image/jpg') return 'image/jpeg'
        return mimeType
    }
    if (fallback.startsWith('image/')) return fallback
    return 'image/jpeg'
}

function croppedFileName(originalName: string, mime: string): string {
    const ext =
        mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'
    const dot = originalName.lastIndexOf('.')
    const base = dot > 0 ? originalName.slice(0, dot) : originalName
    return `${base}-cropped.${ext}`
}

function cropViewportToSquareFile(
    img: HTMLImageElement,
    viewportEl: HTMLElement,
    mime: string,
    fileName: string
) {
    const viewportBoundary = viewportEl.getBoundingClientRect()
    const imageBoundary = img.getBoundingClientRect()
    const ix1 = Math.max(viewportBoundary.left, imageBoundary.left)
    const iy1 = Math.max(viewportBoundary.top, imageBoundary.top)
    const ix2 = Math.min(viewportBoundary.right, imageBoundary.right)
    const iy2 = Math.min(viewportBoundary.bottom, imageBoundary.bottom)
    const iw = ix2 - ix1
    const ih = iy2 - iy1

    if (iw <= 0 || ih <= 0) {
        return Promise.reject(new Error('No visible image in viewport'))
    }

    const imgNaturalWidth = img.naturalWidth
    const imgNaturalHeight = img.naturalHeight
    if (imgNaturalWidth <= 0 || imgNaturalHeight <= 0) {
        return Promise.reject(new Error('Image not decoded'))
    }

    const sx =
        ((ix1 - imageBoundary.left) / imageBoundary.width) * imgNaturalWidth
    const sy =
        ((iy1 - imageBoundary.top) / imageBoundary.height) * imgNaturalHeight
    const sw = (iw / imageBoundary.width) * imgNaturalWidth
    const sh = (ih / imageBoundary.height) * imgNaturalHeight

    const W = Math.round(viewportBoundary.width)
    const dpr = Math.min(
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
        2
    )
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(W * dpr)
    const ctx = canvas.getContext('2d')
    if (!ctx) return Promise.reject(new Error('No canvas context'))

    ctx.scale(dpr, dpr)
    ctx.fillStyle = '#f4f4f5'
    ctx.fillRect(0, 0, W, W)

    const ar = sw / sh
    let dw: number
    let dh: number
    if (ar >= 1) {
        dw = W
        dh = W / ar
    } else {
        dh = W
        dw = W * ar
    }
    ctx.drawImage(img, sx, sy, sw, sh, (W - dw) / 2, (W - dh) / 2, dw, dh)

    const quality = mime === 'image/jpeg' ? 1 : 1

    return new Promise<{
        croppedFile: File
        croppedFileObjectUrl: string
    }>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('toBlob failed'))
                    return
                }
                const objectUrl = URL.createObjectURL(blob)
                resolve({
                    croppedFile: new File([blob], fileName, {
                        type: mime,
                        lastModified: Date.now(),
                    }),
                    croppedFileObjectUrl: objectUrl,
                })
            },
            mime,
            quality
        )
    })
}
