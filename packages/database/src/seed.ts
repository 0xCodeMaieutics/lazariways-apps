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
    university: "Universität Tiflis",
    studySubject: "Betriebswirtschaft",
    semesterBreakFrom: dateOnly("2026-07-01"),
    semesterBreakTo: dateOnly("2026-08-31"),
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
    university: "Freie Universität Tiflis",
    studySubject: "Germanistik",
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

const SEED_APPLICATIONS: Prisma.ApplicationCreateInput[] = Array.from(
  { length: SEED_APPLICATION_COUNT },
  (_, index) => {
    const template =
      SEED_APPLICATION_TEMPLATES[index % SEED_APPLICATION_TEMPLATES.length]!

    return {
      ...template,
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

    console.log(`Seeded ${SEED_APPLICATIONS.length} applications with fotos.`)
    console.log(`Seeded ${SEED_PROFILES.length} profiles with fotos.`)
  } catch (error) {
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()
