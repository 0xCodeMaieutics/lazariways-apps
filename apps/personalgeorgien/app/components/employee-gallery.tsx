import Image from "next/image"

import type { EmployeeImage } from "../../lib/employees"

export function EmployeeGallery({ images }: { images: EmployeeImage[] }) {
  if (images.length === 0) {
    return (
      <p className="text-muted-foreground">
        Derzeit sind keine Bilder verfügbar.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
      {images.map((image) => (
        <li
          key={image.src}
          className="overflow-hidden rounded-lg border border-border bg-muted/30"
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={400}
            height={500}
            className="aspect-[4/5] h-auto w-full object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 300px"
          />
        </li>
      ))}
    </ul>
  )
}
