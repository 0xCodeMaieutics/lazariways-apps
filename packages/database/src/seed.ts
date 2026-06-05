import "dotenv/config"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { uploadFilePathToStorage } from "@workspace/file-upload/s3-client"
import { Gender, GermanLevel, type Prisma } from "../generated/client"
import { prisma } from "./client"

const SEED_FOTO_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "foto.jpeg"
)

const SEED_FOTO_S3_KEY = "applications/seed/foto/foto.jpeg"
const SEED_APPLICATION_COUNT = 100

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

type SeedApplicationTemplate = Omit<
  Prisma.ApplicationCreateInput,
  "id" | "fotoS3Key" | "submittedAt"
>

const SEED_APPLICATION_TEMPLATES: SeedApplicationTemplate[] = [
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
]

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

;(async () => {
  try {
    const bucket = process.env.S3_BUCKET_NAME
    if (bucket === undefined || bucket === "") {
      throw new Error("S3_BUCKET_NAME is required to seed application fotos")
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

    console.log(`Seeded ${SEED_APPLICATIONS.length} applications with fotos.`)
  } catch (error) {
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()
