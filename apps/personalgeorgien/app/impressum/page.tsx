import { IMPRESSUM } from "../../lib/legal"
import { createPageMetadata } from "../../lib/seo"
import { PageShell } from "../components/page-shell"

export const metadata = createPageMetadata({
  title: "Impressum",
  description: "Impressum von personalgeorgien",
  path: "/impressum",
})

export default function ImpressumPage() {
  return (
    <PageShell mainClassName="px-6 py-10 lg:px-16">
      <article className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Impressum
        </h1>

        <section className="mt-8 space-y-6 text-foreground">
          <div>
            <h2 className="text-lg font-semibold">Angaben gemäß § 5 TMG</h2>
            <p className="mt-2 text-muted-foreground">
              {IMPRESSUM.name}
              <br />
              {IMPRESSUM.street}
              <br />
              {IMPRESSUM.city}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Kontakt</h2>
            <p className="mt-2 text-muted-foreground">
              E-Mail:{" "}
              <a
                href={`mailto:${IMPRESSUM.email}`}
                className="text-primary hover:underline"
              >
                {IMPRESSUM.email}
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <p className="mt-2 text-muted-foreground">
              {IMPRESSUM.name}
              <br />
              {IMPRESSUM.street}
              <br />
              {IMPRESSUM.city}
            </p>
          </div>
        </section>
      </article>
    </PageShell>
  )
}
