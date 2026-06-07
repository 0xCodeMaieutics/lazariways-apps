import { IMPRESSUM } from "../../lib/legal"
import { createPageMetadata } from "../../lib/seo"
import { PageShell } from "../components/page-shell"

export const metadata = createPageMetadata({
  title: "Datenschutz",
  description: "Datenschutzerklärung von personalgeorgien",
  path: "/datenschutz",
})

export default function DatenschutzPage() {
  return (
    <PageShell mainClassName="px-6 py-10 lg:px-16">
      <article className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Datenschutz
        </h1>

        <div className="mt-8 space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              Verantwortlicher
            </h2>
            <p className="mt-2">
              {IMPRESSUM.name}
              <br />
              {IMPRESSUM.street}
              <br />
              {IMPRESSUM.city}
              <br />
              E-Mail:{" "}
              <a
                href={`mailto:${IMPRESSUM.email}`}
                className="text-primary hover:underline"
              >
                {IMPRESSUM.email}
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              Allgemeine Hinweise
            </h2>
            <p className="mt-2">
              Diese Website dient ausschließlich der Information für
              Arbeitgeber. Wir erheben keine personenbezogenen Daten über
              Kontaktformulare oder Newsletter auf dieser Seite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">WhatsApp</h2>
            <p className="mt-2">
              Über die WhatsApp-Schaltflächen gelangen Sie zu WhatsApp bzw. zu
              Diensten der Meta Platforms Ireland Limited. Wenn Sie WhatsApp
              nutzen, werden Daten an Meta übermittelt. Welche Daten dabei
              verarbeitet werden, richtet sich nach Ihrer Nutzung von WhatsApp
              und den Datenschutzbestimmungen von Meta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              Server-Logdateien
            </h2>
            <p className="mt-2">
              Beim Aufruf dieser Website können durch den Hosting-Anbieter
              technisch notwendige Server-Logdateien erstellt werden (z. B.
              IP-Adresse, Zeitpunkt des Aufrufs, Browsertyp). Diese Daten werden
              ausschließlich zur Sicherstellung des Betriebs verarbeitet.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              Cookies und Analyse-Tools
            </h2>
            <p className="mt-2">
              Diese Website verwendet keine Cookies zu Analyse- oder
              Marketingzwecken.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              Ihre Rechte
            </h2>
            <p className="mt-2">
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung,
              Einschränkung der Verarbeitung und Widerspruch gegen die
              Verarbeitung Ihrer personenbezogenen Daten. Wenden Sie sich dazu
              an die oben genannte E-Mail-Adresse.
            </p>
          </section>
        </div>
      </article>
    </PageShell>
  )
}
