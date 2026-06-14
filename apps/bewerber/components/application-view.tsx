import type { ReactNode } from "react"
import type { AdminApplicationEditData } from "@workspace/application/schema"
import { ReadOnlyField } from "@/components/read-only-field"
import {
  formatBool,
  formatDateRange,
  formatGender,
  formatIsoDate,
  hasText,
} from "@/lib/format"
import { instagramProfileUrl } from "@/lib/instagram"

interface ApplicationViewProps {
  data: AdminApplicationEditData
}

interface ViewField {
  label: string
  value: ReactNode
  show: boolean
}

function ViewSection({ title, fields }: { title: string; fields: ViewField[] }) {
  const visibleFields = fields.filter((field) => field.show)

  if (visibleFields.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">{title}</h2>
      <dl className="space-y-4">
        {visibleFields.map((field) => (
          <ReadOnlyField key={field.label} label={field.label}>
            {field.value}
          </ReadOnlyField>
        ))}
      </dl>
    </section>
  )
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="text-primary underline-offset-4 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}

export function ApplicationView({ data }: ApplicationViewProps) {
  const instagramUrl = instagramProfileUrl(data.instagram)
  const semesterBreak = formatDateRange(
    data.semesterBreakFrom,
    data.semesterBreakTo
  )

  return (
    <div className="space-y-8 pb-8">
      <ViewSection
        title="Persönliche Angaben"
        fields={[
          { label: "Vorname", value: data.firstName, show: true },
          { label: "Nachname", value: data.lastName, show: true },
          {
            label: "Geschlecht",
            value: formatGender(data.gender),
            show: true,
          },
          {
            label: "Geburtsdatum",
            value: formatIsoDate(data.birthDate),
            show: true,
          },
          { label: "Geburtsort", value: data.birthPlace, show: true },
          { label: "Geburtsland", value: data.birthCountry, show: true },
        ]}
      />

      <ViewSection
        title="Adresse"
        fields={[
          { label: "Straße", value: data.street, show: true },
          { label: "Postleitzahl", value: data.postalCode, show: true },
          { label: "Stadt", value: data.city, show: true },
          { label: "Land", value: data.country, show: true },
          { label: "Staatsangehörigkeit", value: data.nationality, show: true },
        ]}
      />

      <ViewSection
        title="Kontakt"
        fields={[
          {
            label: "E-Mail",
            value: (
              <a
                href={`mailto:${data.email}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {data.email}
              </a>
            ),
            show: hasText(data.email),
          },
          {
            label: "Telefon",
            value: (
              <a
                href={`tel:${data.phone}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {data.phone}
              </a>
            ),
            show: hasText(data.phone),
          },
          {
            label: "Instagram",
            value:
              instagramUrl !== null ? (
                <ExternalLink href={instagramUrl}>
                  {data.instagram?.trim().replace(/^@/, "")}
                </ExternalLink>
              ) : (
                data.instagram
              ),
            show: hasText(data.instagram),
          },
          {
            label: "Steuer-ID",
            value: data.taxId,
            show: hasText(data.taxId),
          },
        ]}
      />

      <ViewSection
        title="Ausbildung"
        fields={[
          {
            label: "Universität",
            value: data.university,
            show: hasText(data.university),
          },
          {
            label: "Studienfach",
            value: data.studySubject,
            show: hasText(data.studySubject),
          },
          {
            label: "Semesterferien",
            value: semesterBreak,
            show: semesterBreak !== null,
          },
        ]}
      />

      <ViewSection
        title="Fähigkeiten & Gesundheit"
        fields={[
          {
            label: "Deutschkenntnisse",
            value: data.germanLevel,
            show: data.germanLevel !== undefined,
          },
          {
            label: "Weitere Sprachen",
            value: data.otherLanguages,
            show: hasText(data.otherLanguages),
          },
          {
            label: "Führerschein",
            value: formatBool(data.driverLicense ?? false),
            show: true,
          },
          {
            label: "Kann Fahrrad fahren",
            value: formatBool(data.canRideBike ?? false),
            show: true,
          },
          {
            label: "Bereitschaft zur Schichtarbeit",
            value: formatBool(data.shiftWork ?? false),
            show: true,
          },
          {
            label: "Gesundheitliche Einschränkungen",
            value: data.healthRestrictions,
            show: hasText(data.healthRestrictions),
          },
          {
            label: "Allergien",
            value: data.allergies,
            show: hasText(data.allergies),
          },
          {
            label: "Kleidergröße",
            value: data.clothingSize,
            show: hasText(data.clothingSize),
          },
          {
            label: "Schuhgröße",
            value: data.shoeSize?.join(", "),
            show: (data.shoeSize?.length ?? 0) > 0,
          },
        ]}
      />

      <ViewSection
        title="Aufenthalt in Deutschland"
        fields={[
          {
            label: "Bereits in Deutschland gewesen",
            value: formatBool(data.hasBeenInGermanyBefore ?? false),
            show: true,
          },
          {
            label: "Früherer Aufenthaltsort",
            value: data.previousStayPlace,
            show: hasText(data.previousStayPlace),
          },
          {
            label: "Früherer Aufenthalt von",
            value: formatIsoDate(data.previousStayPeriodFrom),
            show: hasText(data.previousStayPeriodFrom),
          },
          {
            label: "Früherer Aufenthalt bis",
            value: formatIsoDate(data.previousStayPeriodTo),
            show: hasText(data.previousStayPeriodTo),
          },
        ]}
      />

      <ViewSection
        title="Notfallkontakt"
        fields={[
          {
            label: "Name",
            value: data.emergencyContactName,
            show: true,
          },
          {
            label: "Telefon",
            value: (
              <a
                href={`tel:${data.emergencyPhone}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {data.emergencyPhone}
              </a>
            ),
            show: true,
          },
        ]}
      />

      <ViewSection
        title="Arbeitsbereich"
        fields={[
          {
            label: "Branchen",
            value: (
              <ul className="flex flex-wrap gap-2">
                {data.workSector.map((sector) => (
                  <li
                    key={sector}
                    className="bg-muted rounded-full px-3 py-1 text-sm"
                  >
                    {sector}
                  </li>
                ))}
              </ul>
            ),
            show: data.workSector.length > 0,
          },
        ]}
      />
    </div>
  )
}
