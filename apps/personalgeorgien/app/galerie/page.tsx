import { getEmployeeImages } from "../../lib/employees"
import { createPageMetadata } from "../../lib/seo"
import { GALLERY } from "../../lib/site"
import { EmployeeGallery } from "../components/employee-gallery"
import { PageShell } from "../components/page-shell"

export const metadata = createPageMetadata({
  title: GALLERY.title,
  description: GALLERY.description,
  path: "/galerie",
})

export default function GaleriePage() {
  const images = getEmployeeImages()

  return (
    <PageShell mainClassName="px-6 py-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {GALLERY.title}
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          {GALLERY.description}
        </p>
        <div className="mt-10">
          <EmployeeGallery images={images} />
        </div>
      </div>
    </PageShell>
  )
}
