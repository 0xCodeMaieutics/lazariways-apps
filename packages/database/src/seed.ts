import "dotenv/config"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { uploadFilePathToStorage } from "@workspace/file-upload/s3-client"
import {
  Gender,
  GermanLevel,
  DesiredSalary,
  type Prisma,
} from "../generated/client"
import { prisma } from "./client"

const SEED_FOTO_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "foto.jpeg"
)

const SEED_FOTO_S3_KEY = "applications/seed/foto/foto.jpeg"
const SEED_APPLICATION_COUNT = 100
const SEED_PROFILE_COUNT = 100
const SEED_INQUIRY_COUNT = 25

const DESIRED_SALARIES = [
  DesiredSalary.EURO_10_12,
  DesiredSalary.EURO_12_14,
  DesiredSalary.EURO_15_PLUS,
] as const

function dateOnly(isoDate: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (match === null) {
    throw new Error(`Invalid date: ${isoDate}`)
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  return new Date(year, month - 1, day)
}

function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

function seedApplicationId(index: number): string {
  return `00000000-0000-4000-8000-${(index + 1).toString().padStart(12, "0")}`
}

function seedProfileId(index: number): string {
  return `00000000-0000-4000-9000-${(index + 1).toString().padStart(12, "0")}`
}

function seedInquiryId(index: number): string {
  return `00000000-0000-4000-a000-${(index + 1).toString().padStart(12, "0")}`
}

function seedUniversityId(index: number): string {
  return `00000000-0000-4000-b000-${(index + 1).toString().padStart(12, "0")}`
}

function seedEmail(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
}

type SeedApplicationTemplate = Omit<
  Prisma.ApplicationCreateInput,
  "id" | "fotoS3Key" | "submittedAt"
>
function seedLanguagesFromApplication(template: SeedApplicationTemplate) {
  const languages: { language: string; level: GermanLevel }[] = []

  languages.push({
    language: "German",
    level: template.germanLevel ?? GermanLevel.A1,
  })

  if (
    template.otherLanguages !== undefined &&
    template.otherLanguages !== null
  ) {
    for (const language of template.otherLanguages
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry !== "")) {
      languages.push({ language, level: GermanLevel.A2 })
    }
  }

  return languages
}

const SEED_APPLICATION_TEMPLATES = [
  {
    firstName: "Giorgi",
    lastName: "Beridze",
    gender: Gender.M,
    birthDate: dateOnly("1998-04-12"),
    birthPlace: "Tiflis",
    birthCountry: "Georgien",
    street: "Rustaveli Ave. 12",
    postalCode: "0108",
    city: "Tiflis",
    country: "Georgien",
    nationality: "Georgisch",
    email: "giorgi.beridze@example.com",
    phone: "+995 555 123456",
    instagram: "giorgi.beridze",
    taxId: "12345678901",
    germanLevel: GermanLevel.B1,
    otherLanguages: "Englisch, Russisch",
    driverLicense: true,
    canRideBike: true,
    shiftWork: true,
    healthRestrictions: null,
    allergies: null,
    clothingSize: "L",
    shoeSize: ["42", "43"],
    hasBeenInGermanyBefore: false,
    emergencyContactName: "Nino Beridze",
    emergencyPhone: "+995 555 987654",
    workSector: ["Hotel/Gaststätte", "Systemgastronomie"],
  },
  {
    firstName: "Maria",
    lastName: "Kvitashvili",
    gender: Gender.F,
    birthDate: dateOnly("1996-11-03"),
    birthPlace: "Kutaisi",
    birthCountry: "Georgien",
    street: "Tsereteli Str. 45",
    postalCode: "4600",
    city: "Kutaisi",
    country: "Georgien",
    nationality: "Georgisch",
    email: "maria.kvitashvili@example.com",
    phone: "+995 555 234567",
    germanLevel: GermanLevel.A2,
    otherLanguages: "Englisch",
    driverLicense: false,
    canRideBike: true,
    shiftWork: false,
    clothingSize: "M",
    shoeSize: ["38"],
    hasBeenInGermanyBefore: true,
    previousStayPlace: "Berlin",
    previousStayPeriodFrom: dateOnly("2024-06-01"),
    previousStayPeriodTo: dateOnly("2024-08-31"),
    emergencyContactName: "Levan Kvitashvili",
    emergencyPhone: "+995 555 876543",
    workSector: ["Landwirtschaft"],
  },
  {
    firstName: "Nika",
    lastName: "Meladze",
    gender: Gender.M,
    birthDate: dateOnly("1999-07-22"),
    birthPlace: "Batumi",
    birthCountry: "Georgien",
    street: "Gogebashvili Str. 8",
    postalCode: "6000",
    city: "Batumi",
    country: "Georgien",
    nationality: "Georgisch",
    phone: "+995 555 345678",
    germanLevel: GermanLevel.B2,
    driverLicense: true,
    canRideBike: false,
    shiftWork: true,
    clothingSize: "XL",
    shoeSize: ["44"],
    hasBeenInGermanyBefore: false,
    emergencyContactName: "Tamuna Meladze",
    emergencyPhone: "+995 555 765432",
    workSector: ["Gebäude-/Industriereinigung", "Industrielle Produktion"],
  },
  {
    firstName: "Ana",
    lastName: "Loria",
    gender: Gender.F,
    birthDate: dateOnly("1997-02-18"),
    birthPlace: "Tiflis",
    birthCountry: "Georgien",
    street: "Chavchavadze Ave. 33",
    postalCode: "0162",
    city: "Tiflis",
    country: "Georgien",
    nationality: "Georgisch",
    email: "ana.loria@example.com",
    phone: "+995 555 456789",
    instagram: "ana.loria",
    germanLevel: GermanLevel.C1,
    otherLanguages: "Deutsch, Englisch, Russisch",
    driverLicense: true,
    canRideBike: true,
    shiftWork: true,
    clothingSize: "S",
    shoeSize: ["37", "38"],
    hasBeenInGermanyBefore: false,
    emergencyContactName: "Irakli Loria",
    emergencyPhone: "+995 555 654321",
    workSector: ["Hotel/Gaststätte"],
  },
  {
    firstName: "Davit",
    lastName: "Gogoladze",
    gender: Gender.M,
    birthDate: dateOnly("1994-09-30"),
    birthPlace: "Gori",
    birthCountry: "Georgien",
    street: "Stalin Ave. 5",
    postalCode: "1400",
    city: "Gori",
    country: "Georgien",
    nationality: "Georgisch",
    phone: "+995 555 567890",
    taxId: "98765432109",
    germanLevel: GermanLevel.A1,
    driverLicense: false,
    canRideBike: true,
    shiftWork: false,
    healthRestrictions: "Keine schweren körperlichen Einschränkungen",
    clothingSize: "L",
    shoeSize: ["41"],
    hasBeenInGermanyBefore: false,
    emergencyContactName: "Salome Gogoladze",
    emergencyPhone: "+995 555 543210",
    workSector: ["Systemgastronomie", "Industrielle Produktion"],
  },
] satisfies SeedApplicationTemplate[]

const SEED_UNIVERSITIES = [
  {
    id: seedUniversityId(0),
    name: "Ivane Javakhishvili Tbilisi State University",
    street: "1 Chavchavadze Avenue",
    streetNumber: "1",
    postalCode: "0179",
    city: "Tbilisi",
    country: "Georgia",
    telephone: "+995 32 299 11 11",
    email: "info@tsu.ge",
    website: "https://www.tsu.ge",
  },
  {
    id: seedUniversityId(1),
    name: "Georgian Technical University",
    street: "77 Kostava Street",
    streetNumber: "77",
    postalCode: "0175",
    city: "Tbilisi",
    country: "Georgia",
    telephone: "+995 32 299 67 67",
    email: "info@gtu.ge",
    website: "https://www.gtu.ge",
  },
  {
    id: seedUniversityId(2),
    name: "Ilia State University",
    street: "3/5 Cholokashvili Avenue",
    streetNumber: "3/5",
    postalCode: "0162",
    city: "Tbilisi",
    country: "Georgia",
    telephone: "+995 32 222 00 00",
    email: "info@iliauni.edu.ge",
    website: "https://iliauni.edu.ge",
  },
  {
    id: seedUniversityId(3),
    name: "Ludwig-Maximilians-Universität München",
    street: "Geschwister-Scholl-Platz",
    streetNumber: "1",
    postalCode: "80539",
    city: "Munich",
    country: "Germany",
    telephone: "+49 89 2180 0",
    email: "info@lmu.de",
    website: "https://www.lmu.de",
  },
] as const

type SeedUniversityAssignment = Pick<
  Prisma.ApplicationUncheckedCreateInput,
  | "university"
  | "universityId"
  | "studySubject"
  | "semesterBreakFrom"
  | "semesterBreakTo"
>

function seedUniversityAssignment(index: number): SeedUniversityAssignment {
  const bucket = index % 10

  if (bucket < 4) {
    const universityIndex = bucket % SEED_UNIVERSITIES.length

    return {
      universityId: seedUniversityId(universityIndex),
      university: null,
      studySubject: bucket % 2 === 0 ? "Betriebswirtschaft" : "Germanistik",
      semesterBreakFrom: dateOnly("2026-07-01"),
      semesterBreakTo: dateOnly("2026-08-31"),
    }
  }

  if (bucket < 6) {
    return {
      universityId: null,
      university: "Batumi Shota Rustaveli State University",
      studySubject: "Informatik",
      semesterBreakFrom: null,
      semesterBreakTo: null,
    }
  }

  return {
    universityId: null,
    university: null,
    studySubject: null,
    semesterBreakFrom: null,
    semesterBreakTo: null,
  }
}

const SEED_APPLICATIONS: Prisma.ApplicationUncheckedCreateInput[] = Array.from(
  { length: SEED_APPLICATION_COUNT },
  (_, index) => {
    const template =
      SEED_APPLICATION_TEMPLATES[index % SEED_APPLICATION_TEMPLATES.length]!

    return {
      ...template,
      ...seedUniversityAssignment(index),
      id: seedApplicationId(index),
      submittedAt: daysAgo((index % 30) + 1),
      fotoS3Key: SEED_FOTO_S3_KEY,
    }
  }
)

type SeedProfile = Omit<
  Prisma.ProfileCreateInput,
  "languages" | "fotoS3Key" | "createdAt"
> & {
  id: string
  createdAt: Date
  fotoS3Key: string
  languageEntries: { language: string; level: GermanLevel }[]
}

type SeedInquiryTemplate = {
  companyName: string
  contactPersonName: string
  email: string
  phone: string | null
  message: string | null
}

const SEED_INQUIRY_TEMPLATES = [
  {
    companyName: "Hotel Bavaria GmbH",
    contactPersonName: "Thomas Müller",
    email: "thomas.mueller@hotel-bavaria.de",
    phone: "+49 89 1234567",
    message:
      "Wir suchen Verstärkung für unsere Sommersaison in der Küche und im Service.",
  },
  {
    companyName: "Frische Feld AG",
    contactPersonName: "Sabine Weber",
    email: "personal@frische-feld.de",
    phone: "+49 30 9876543",
    message: "Interesse an Kandidaten für die Erntezeit ab Juni.",
  },
  {
    companyName: "CleanPro Industriereinigung",
    contactPersonName: "Markus Fischer",
    email: "fischer@cleanpro.de",
    phone: null,
    message: null,
  },
  {
    companyName: "Gasthaus Zur Linde",
    contactPersonName: "Anna Schneider",
    email: "anna.schneider@gasthaus-linde.de",
    phone: "+49 351 445566",
    message: "Kurze Nachfrage zur Verfügbarkeit ab August.",
  },
  {
    companyName: "Nordsee Fischverarbeitung",
    contactPersonName: "Jens Hartmann",
    email: "jens.hartmann@nordsee-fisch.de",
    phone: "+49 471 112233",
    message: null,
  },
  {
    companyName: "Systemgastro Berlin Mitte",
    contactPersonName: "Laura Becker",
    email: "laura.becker@systemgastro.de",
    phone: null,
    message:
      "Wir planen eine neue Filiale und benötigen mehrere Mitarbeitende.",
  },
] satisfies SeedInquiryTemplate[]

type SeedInquiry = SeedInquiryTemplate & {
  id: string
  submittedAt: Date
  applicationId: string
}

const SEED_INQUIRIES: SeedInquiry[] = Array.from(
  { length: SEED_INQUIRY_COUNT },
  (_, index) => {
    const template =
      SEED_INQUIRY_TEMPLATES[index % SEED_INQUIRY_TEMPLATES.length]!

    return {
      ...template,
      id: seedInquiryId(index),
      submittedAt: daysAgo((index % 14) + 1),
      applicationId: seedApplicationId(index % SEED_APPLICATION_COUNT),
    }
  }
)

const SEED_PROFILES: SeedProfile[] = Array.from(
  { length: SEED_PROFILE_COUNT },
  (_, index) => {
    const template =
      SEED_APPLICATION_TEMPLATES[index % SEED_APPLICATION_TEMPLATES.length]!

    return {
      id: seedProfileId(index),
      createdAt: daysAgo((index % 30) + 1),
      fotoS3Key: SEED_FOTO_S3_KEY,
      firstName: template.firstName,
      lastName: template.lastName,
      gender: template.gender,
      birthDate: template.birthDate,
      email: template.email ?? seedEmail(template.firstName, template.lastName),
      phone: template.phone ?? null,
      isStudent: index % 2 === 0,
      workSector: template.workSector,
      desiredSalary:
        DESIRED_SALARIES[index % DESIRED_SALARIES.length] ??
        DesiredSalary.EURO_10_12,
      languageEntries: seedLanguagesFromApplication(template),
    }
  }
)

;(async () => {
  try {
    const bucket = process.env.S3_BUCKET_NAME
    if (bucket === undefined || bucket === "") {
      throw new Error("S3_BUCKET_NAME is required to seed fotos")
    }

    await uploadFilePathToStorage({
      filePath: SEED_FOTO_PATH,
      bucket,
      fileKey: SEED_FOTO_S3_KEY,
    })

    for (const university of SEED_UNIVERSITIES) {
      const { id, ...data } = university
      await prisma.university.upsert({
        where: { id },
        update: data,
        create: university,
      })
    }

    for (const application of SEED_APPLICATIONS) {
      const { id, ...data } = application
      await prisma.application.upsert({
        where: { id },
        update: data,
        create: application,
      })
    }

    for (const profile of SEED_PROFILES) {
      const { id, languageEntries, ...data } = profile
      await prisma.profile.upsert({
        where: { id },
        create: {
          id,
          ...data,
          languages: { create: languageEntries },
        },
        update: {
          ...data,
          languages: {
            deleteMany: {},
            create: languageEntries,
          },
        },
      })
    }

    for (const inquiry of SEED_INQUIRIES) {
      const { id, applicationId, ...data } = inquiry
      await prisma.applicationInquiry.upsert({
        where: { id },
        create: {
          id,
          applicationId,
          ...data,
        },
        update: {
          applicationId,
          ...data,
        },
      })
    }

    console.log(`Seeded ${SEED_UNIVERSITIES.length} universities.`)
    console.log(`Seeded ${SEED_APPLICATIONS.length} applications with fotos.`)
    console.log(`Seeded ${SEED_PROFILES.length} profiles with fotos.`)
    console.log(`Seeded ${SEED_INQUIRIES.length} application inquiries.`)
  } catch (error) {
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()
