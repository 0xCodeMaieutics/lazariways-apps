import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { ApplicationFormData } from "./application-schema.js"
import { generatePersonalGeorgienPdf } from "./pdf.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, "../../..")
const publicAssetsDir = path.join(repoRoot, "apps/application/public")
const applicationSrcFolder = path.join(repoRoot, "packages/application/src")

const testApplicationFormData = {
  firstName: "Giorgi",
  lastName: "Beridze",
  gender: "M",
  birthDate: "1998-04-12",
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
  semesterBreakFrom: "2026-07-01",
  semesterBreakTo: "2026-08-31",
  germanLevel: "B1",
  otherLanguages: "Englisch, Russisch",
  driverLicense: true,
  canRideBike: true,
  shiftWork: true,
  clothingSize: "L",
  shoeSize: ["42", "43"],
  hasBeenInGermanyBefore: false,
  emergencyContactName: "Nino Beridze",
  emergencyPhone: "+995 555 987654",
  workSector: ["Hotel/Gaststätte", "Systemgastronomie"],
} satisfies Omit<ApplicationFormData, "foto">

async function fileFromPath(
  filePath: string,
  fileName: string,
  type: string
): Promise<File> {
  const buffer = await readFile(filePath)
  return new File([buffer], fileName, { type })
}

void (async function () {
  const [foto, croppedFoto] = await Promise.all([
    fileFromPath(
      path.join(publicAssetsDir, "android-chrome-192x192.png"),
      "foto.png",
      "image/png"
    ),
    fileFromPath(
      path.join(applicationSrcFolder, "1780997500017-IMG_2319-cropped.jpg"),
      "foto.jpg",
      "image/jpg"
    ),
  ])

  const pdfBytes = await generatePersonalGeorgienPdf({
    ...testApplicationFormData,
    foto: croppedFoto,
    applicationId: "db932543-4361-401d-bab6-bc9cf7cc6566",
    bewerberAppUrl: "https://bewerber.personalgeorgien.de",
    profession: "Chef",
  })

  const outputPath = path.join(__dirname, "test-application.pdf")
  await writeFile(outputPath, pdfBytes)
  console.log(`Wrote ${outputPath}`)
})()
