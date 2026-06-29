import {
  clipEvenOdd,
  drawEllipsePath,
  endPath,
  PDFArray,
  PDFDocument,
  PDFFont,
  PDFName,
  PDFPage,
  PDFString,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  type RGB,
} from "pdf-lib"
import { ApplicationFormData, workSectorOptions } from "./application-schema"
import fontkit from "@pdf-lib/fontkit"

function pdfWrapLines(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []

  const splitWord = (word: string): string[] => {
    const chunks: string[] = []
    let rest = word
    while (rest.length > 0) {
      if (font.widthOfTextAtSize(rest, fontSize) <= maxWidth) {
        chunks.push(rest)
        break
      }

      let lo = 1
      let hi = rest.length
      let best = 1
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2)
        const measured = font.widthOfTextAtSize(rest.slice(0, mid), fontSize)
        if (measured <= maxWidth) {
          best = mid
          lo = mid + 1
        } else {
          hi = mid - 1
        }
      }

      chunks.push(rest.slice(0, best))
      rest = rest.slice(best)
    }
    return chunks
  }

  let currentLine = ""

  const flushCurrentLine = () => {
    const trimmed = currentLine.trimEnd()
    if (trimmed !== "") lines.push(trimmed)
    currentLine = ""
  }

  for (const word of words) {
    const fragments =
      font.widthOfTextAtSize(word, fontSize) <= maxWidth
        ? [word]
        : splitWord(word)

    for (const fragment of fragments) {
      const candidate =
        currentLine === "" ? fragment : `${currentLine} ${fragment}`

      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        currentLine = candidate
        continue
      }

      flushCurrentLine()

      if (font.widthOfTextAtSize(fragment, fontSize) <= maxWidth) {
        currentLine = fragment
      } else {
        lines.push(...splitWord(fragment))
        currentLine = ""
      }
    }
  }

  flushCurrentLine()
  return lines
}

const REMOTE_TEMPLATE_URL =
  "https://lazari-ways-bucket.s3.eu-central-1.amazonaws.com/public/Bewerbercheckliste.pdf"
const REMOTE_FONT_URL =
  "https://lazari-ways-bucket.s3.eu-central-1.amazonaws.com/public/ARIAL.TTF"

const remotePdfLayout = {
  valueX: 240,
  fontSize: 11,
  photo: { x: 65, bottomY: 715, maxW: 108, maxH: 132 },
  page1: {
    agencyName: 652,
    nachname: 608.8,
    vorname: 588.5,
    geburtsdatum: 568.3,
    geburtsort: 548,
    geburtsland: 527.8,
    strasse: 507.5,
    plzOrt: 487.3,
    land: 467,
    staatsangehoerigkeit: 446.8,
    semesterferien: 402.8,
    universitaet: 382.5,
    studienfach: 362.3,
    weitereSprachen: 325.2,
    fuehrerschein: 295.7,
    gesundheit: 232,
    allergien: 208.9,
    kleidergroesse: 188.7,
    schuhgroesse: 168.4,
    steuerId: 120.5,
    telefon: 100.2,
    email: 80,
    instagram: 59.7,
    vorherigerAufenthaltOrt: 260,
    vorherigerAufenthaltZeitraum: 400,
  },
  checkboxes: {
    gender: {
      M: { x: 241, y: 630 },
      F: { x: 330, y: 630 },
    },
    germanLevel: {
      A1: { x: 245, y: 343 },
      A2: { x: 300, y: 343 },
      B1: { x: 358, y: 343 },
      B2: { x: 415, y: 343 },
      C1: { x: 475, y: 343 },
    },
    canRideBike: {
      yes: { x: 242, y: 278 },
      no: { x: 297, y: 278 },
    },
    shiftWork: {
      yes: { x: 241, y: 256 },
      no: { x: 297, y: 256 },
    },
    hasBeenInGermanyBefore: {
      yes: { x: 241, y: 150.3 },
      no: { x: 297, y: 150.3 },
    },
    workSector: {
      "Hotel/Gaststätte": { x: 72.5, y: 556 },
      Systemgastronomie: { x: 72.5, y: 533 },
      Landwirtschaft: { x: 72.5, y: 512 },
      "Gebäude-/Industriereinigung": { x: 72.5, y: 490.5 },
      "Industrielle Produktion": { x: 72.5, y: 470 },
    },
  },
  page2: {
    fullName: { x: 195, y: 795.2 },
    notfallKontakt: 656.1,
    notfallTelefon: 635.8,
  },
  signature: {
    page2: { y: 335, ortX: 80, datumX: 180, unterschriftX: 400 },
    page3: { y: 483, ortX: 80, datumX: 180, unterschriftX: 400 },
    page4: { y: 274, ortX: 80, datumX: 180, unterschriftX: 400 },
  },
} as const

const formatRemoteDate = (isoDate: string | undefined) => {
  const t = typeof isoDate === "string" ? isoDate.trim() : ""
  if (t.length === 0) return ""

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  if (!match) return t

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (Number.isNaN(date.getTime())) return t

  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

const formatRemoteBool = (v: boolean | undefined) => {
  if (v === undefined) return ""
  return v ? "Ja" : "Nein"
}

const formatSignatureDate = (date: Date = new Date()) =>
  new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)

const formatPersonalGeorgienDate = (isoDate: string | undefined) => {
  const t = typeof isoDate === "string" ? isoDate.trim() : ""
  if (t.length === 0) return "-"

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  if (!match) return t

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (Number.isNaN(date.getTime())) return t

  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

const formatPersonalGeorgienGender = (gender: ApplicationFormData["gender"]) =>
  gender === "M" ? "Männlich" : "Weiblich"

const formatPersonalGeorgienBool = (value: boolean | undefined) => {
  if (value === undefined) return ""
  return value ? "Ja" : "Nein"
}

const calculateAge = (isoDate: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim())
  if (!match) return null

  const [, year, month, day] = match
  const birthDate = new Date(Number(year), Number(month) - 1, Number(day))
  if (Number.isNaN(birthDate.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1
  }

  return age
}

const joinNonEmpty = (parts: string[], separator: string) =>
  parts
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(separator)

const applicationProfileUrl = (bewerberAppUrl: string, applicationId: string) =>
  `${bewerberAppUrl.replace(/\/$/, "")}/${applicationId}`

const addUriLinkAnnotation = (
  page: PDFPage,
  uri: string,
  rect: { x: number; y: number; width: number; height: number }
) => {
  const linkAnnotation = page.doc.context.register(
    page.doc.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [rect.x, rect.y, rect.x + rect.width, rect.y + rect.height],
      Border: [0, 0, 0],
      A: {
        Type: "Action",
        S: "URI",
        URI: PDFString.of(uri),
      },
    })
  )

  const annots = page.node.lookupMaybe(PDFName.of("Annots"), PDFArray)
  if (annots !== undefined) {
    annots.push(linkAnnotation)
    return
  }

  page.node.set(PDFName.of("Annots"), page.doc.context.obj([linkAnnotation]))
}

const drawTextUnderline = (
  page: PDFPage,
  rect: { x: number; y: number; width: number },
  color: RGB,
  thickness = 0.5
) => {
  page.drawLine({
    start: { x: rect.x, y: rect.y },
    end: { x: rect.x + rect.width, y: rect.y },
    thickness,
    color,
  })
}

export const generateBewerberChecklistPdf = async (
  applicationFormData: ApplicationFormData
) => {
  const [pdfTemplateBytes, arialFontBytes] = await Promise.all([
    fetch(REMOTE_TEMPLATE_URL).then((res) => res.arrayBuffer()),
    fetch(REMOTE_FONT_URL).then((res) => res.arrayBuffer()),
  ])

  const pdfDoc = await PDFDocument.load(pdfTemplateBytes)
  pdfDoc.registerFontkit(fontkit)

  const arialFont = await pdfDoc.embedFont(arialFontBytes)
  const layout = remotePdfLayout
  const textSize = layout.fontSize

  const pages = pdfDoc.getPages()
  const firstPage = pages[0]
  const secondPage = pages[1]
  if (firstPage === undefined || secondPage === undefined) {
    console.error("REMOTE_PDF_PAGE_UNDEFINED")
    throw new Error("REMOTE_PDF_PAGE_UNDEFINED")
  }

  const drawValue = (
    page: PDFPage,
    text: string,
    y: number,
    x: number = layout.valueX
  ) => {
    const trimmed = text.trim()
    page.drawText(trimmed.length === 0 ? "-" : trimmed, {
      x,
      y,
      font: arialFont,
      size: textSize,
    })
  }

  const drawCheck = (page: PDFPage, x: number, y: number) => {
    page.drawText("X", {
      x,
      y: y - 1,
      font: arialFont,
      size: textSize + 1,
    })
  }

  const drawBoolCheckbox = (
    page: PDFPage,
    value: boolean | undefined,
    positions: {
      yes: { x: number; y: number }
      no: { x: number; y: number }
    }
  ) => {
    if (value === undefined) return
    const pos = value ? positions.yes : positions.no
    drawCheck(page, pos.x, pos.y)
  }

  const fullName = `${applicationFormData.lastName}, ${applicationFormData.firstName}`
  const signatureName = `${applicationFormData.firstName} ${applicationFormData.lastName}`
  const drawFullNameHeader = (page: PDFPage) => {
    drawValue(page, fullName, layout.page2.fullName.y, layout.page2.fullName.x)
  }

  const drawSignatureBlock = (
    page: PDFPage,
    positions: (typeof layout.signature)[keyof typeof layout.signature]
  ) => {
    drawValue(page, applicationFormData.city + ",", positions.y, positions.ortX)
    drawValue(page, formatSignatureDate() + ",", positions.y, positions.datumX)
    drawValue(page, signatureName, positions.y, positions.unterschriftX)
  }

  const photoBytes = new Uint8Array(
    await applicationFormData.foto.arrayBuffer()
  )
  const embeddedPhoto =
    applicationFormData.foto.type === "image/png"
      ? await pdfDoc.embedPng(photoBytes)
      : await pdfDoc.embedJpg(photoBytes)

  const photoScale = Math.min(
    layout.photo.maxW / embeddedPhoto.width,
    layout.photo.maxH / embeddedPhoto.height,
    1
  )
  firstPage.drawImage(embeddedPhoto, {
    x: layout.photo.x,
    y: layout.photo.bottomY,
    width: embeddedPhoto.width * photoScale,
    height: embeddedPhoto.height * photoScale,
  })

  const p1 = layout.page1
  drawValue(
    firstPage,
    "Lazari Ways - Tsereteli str.117d, Tiflis, Georgien",
    p1.agencyName
  )
  drawValue(firstPage, applicationFormData.lastName, p1.nachname)
  drawValue(firstPage, applicationFormData.firstName, p1.vorname)

  const genderPos = layout.checkboxes.gender[applicationFormData.gender]
  drawCheck(firstPage, genderPos.x, genderPos.y)

  drawValue(
    firstPage,
    formatRemoteDate(applicationFormData.birthDate),
    p1.geburtsdatum
  )
  drawValue(firstPage, applicationFormData.birthPlace, p1.geburtsort)
  drawValue(firstPage, applicationFormData.birthCountry, p1.geburtsland)
  drawValue(firstPage, applicationFormData.street, p1.strasse)
  drawValue(
    firstPage,
    `${applicationFormData.postalCode} ${applicationFormData.city}`.trim(),
    p1.plzOrt
  )
  drawValue(firstPage, applicationFormData.country, p1.land)
  drawValue(firstPage, applicationFormData.nationality, p1.staatsangehoerigkeit)

  const semesterFrom = formatRemoteDate(applicationFormData.semesterBreakFrom)
  const semesterTo = formatRemoteDate(applicationFormData.semesterBreakTo)
  const semesterBreak =
    semesterFrom === "" && semesterTo === ""
      ? ""
      : semesterFrom === "" || semesterTo === ""
        ? semesterFrom || semesterTo
        : `${semesterFrom} - ${semesterTo}`
  drawValue(firstPage, semesterBreak, p1.semesterferien)
  drawValue(firstPage, applicationFormData.university ?? "", p1.universitaet)
  drawValue(firstPage, applicationFormData.studySubject ?? "", p1.studienfach)

  const germanLevel = applicationFormData.germanLevel
  if (germanLevel !== undefined) {
    const levelPos = layout.checkboxes.germanLevel[germanLevel]
    drawCheck(firstPage, levelPos.x, levelPos.y)
  }

  drawValue(
    firstPage,
    applicationFormData.otherLanguages ?? "",
    p1.weitereSprachen
  )
  drawValue(
    firstPage,
    formatRemoteBool(applicationFormData.driverLicense),
    p1.fuehrerschein
  )
  drawBoolCheckbox(
    firstPage,
    applicationFormData.canRideBike,
    layout.checkboxes.canRideBike
  )
  drawBoolCheckbox(
    firstPage,
    applicationFormData.shiftWork,
    layout.checkboxes.shiftWork
  )
  drawValue(
    firstPage,
    applicationFormData.healthRestrictions ?? "",
    p1.gesundheit
  )
  drawValue(firstPage, applicationFormData.allergies ?? "", p1.allergien)
  drawValue(
    firstPage,
    applicationFormData.clothingSize ?? "",
    p1.kleidergroesse
  )
  drawValue(
    firstPage,
    applicationFormData.shoeSize && applicationFormData.shoeSize.length > 0
      ? applicationFormData.shoeSize.join(", ")
      : "",
    p1.schuhgroesse
  )

  drawBoolCheckbox(
    firstPage,
    applicationFormData.hasBeenInGermanyBefore,
    layout.checkboxes.hasBeenInGermanyBefore
  )

  const prevFrom = formatRemoteDate(applicationFormData.previousStayPeriodFrom)
  const prevTo = formatRemoteDate(applicationFormData.previousStayPeriodTo)
  const prevPeriod =
    prevFrom === "" && prevTo === ""
      ? ""
      : prevFrom === "" || prevTo === ""
        ? prevFrom || prevTo
        : `${prevFrom} - ${prevTo}`
  drawValue(
    firstPage,
    applicationFormData.previousStayPlace ?? "",
    137.3,
    p1.vorherigerAufenthaltOrt
  )
  drawValue(firstPage, prevPeriod, 137.3, p1.vorherigerAufenthaltZeitraum)

  drawValue(firstPage, applicationFormData.taxId ?? "", p1.steuerId)
  drawValue(firstPage, applicationFormData.phone ?? "", p1.telefon)
  drawValue(firstPage, applicationFormData.email ?? "", p1.email)
  drawValue(firstPage, applicationFormData.instagram ?? "", p1.instagram)

  drawValue(
    secondPage,
    applicationFormData.emergencyContactName,
    layout.page2.notfallKontakt
  )
  drawValue(
    secondPage,
    applicationFormData.emergencyPhone,
    layout.page2.notfallTelefon
  )

  for (const sector of workSectorOptions) {
    if (!applicationFormData.workSector.includes(sector)) continue
    const pos = layout.checkboxes.workSector[sector]
    drawCheck(secondPage, pos.x, pos.y)
  }

  const signaturePages = [
    layout.signature.page2,
    layout.signature.page3,
    layout.signature.page4,
  ] as const
  for (const [index, page] of pages.slice(1).entries()) {
    drawFullNameHeader(page)
    const signaturePos = signaturePages[index]
    if (signaturePos !== undefined) {
      drawSignatureBlock(page, signaturePos)
    }
  }

  return pdfDoc.save()
}

const personalGeorgienPdfLayout = {
  marginX: 40,
  valueX: 250,
  maxValueWidth: 440,
  nameSize: 16,
  fieldSize: 10,
  foto: {
    w: 95,
    h: 95,
    topOffset: 60,
  },
  flag: {
    offsetX: 70,
    w: 24,
    h: 16,
    offsetY: 7,
  },
  fields: {
    name: { x: 40, y: 602.3 },
    geburtsdatumOrtLand: { y: 566.3 },
    geschlecht: { y: 545.3 },
    wohnort: { y: 524.3 },
    einreisen: { y: 503.3 },
    deutschniveau: { y: 482.3 },
    weitereSprachen: { y: 461.3 },
    fuehrerschein: { y: 440.3 },
    schichbereitschaft: { y: 419.3 },
    telefon: { y: 400.3 },
    email: { y: 379.3 },
    instagram: { y: 358.3 },
    profil: { y: 337.3 },
  },
  praktischeErfahrung: {
    startY: 265,
    dateX: 40,
    contentX: 128 + 120,
    bulletTextX: 148 + 120,
    maxContentWidth: 300,
    lineHeight: 13,
    titleLineHeight: 12,
    paragraphGap: 4,
    titleColor: rgb(0.05, 0.27, 0.58),
  },
  profileLinkColor: rgb(0.05, 0.27, 0.58),
} as const

const MANROPE_REGULAR_FONT =
  "https://lazari-ways-bucket.s3.eu-central-1.amazonaws.com/public/Manrope-Regular.ttf"

const PDF_TEMPLATE_URL =
  "https://lazari-ways-bucket.s3.eu-central-1.amazonaws.com/public/personalgeorgien-tempate.pdf"

const GEORGIAN_FLAG_IMAGE_URL =
  "https://lazari-ways-bucket.s3.eu-central-1.amazonaws.com/public/georgian-flag.png"

const professionRandom = {
  "Restaurant & Bar Staff": {
    title: "Im bereich Restaurant",
    randomActivities: [
      "Betreuung und Bedienung von Gästen im Restaurantbereich",
      "Aufnahme von Bestellungen und Weitergabe an Küche und Bar",
      "Sicherstellung eines freundlichen und professionellen Kundenservices",
      "Vorbereitung und Reinigung der Tische gemäß Hygienestandards",
      "Unterstützung bei der Organisation von Veranstaltungen und Reservierungen",
      "Kassieren und Abrechnen von Gästen am Tresen",
      "Auffüllen von Getränken und Vorbereitung des Buffets",
    ],
  },
  Chef: {
    title: "Im bereich Küche",
    randomActivities: [
      "Zubereitung und Anrichten von Speisen nach Rezeptvorgaben",
      "Einhaltung von Hygiene- und Sicherheitsstandards in der Küche",
      "Vorbereitung von Zutaten und Unterstützung bei der Menüplanung",
      "Koordination mit dem Servicepersonal bei Bestellungen",
      "Reinigung und Pflege der Küchengeräte und Arbeitsflächen",
      "Lagerung und Kontrolle von Lebensmitteln nach HACCP-Richtlinien",
      "Mitverantwortung für die Qualität und Frische der Speisen",
    ],
  },
  "Holiday Job": {
    title: "Ferienjob im Gastronomiebereich",
    randomActivities: [
      "Unterstützung im Service und an der Theke während der Ferienzeit",
      "Aushilfe bei der Vorbereitung von Speisen und Getränken",
      "Mithilfe bei der Reinigung und Vorbereitung des Gastraums",
      "Freundliche Betreuung von Gästen in einem dynamischen Umfeld",
      "Einarbeitung in Abläufe und Teamarbeit im Restaurantbetrieb",
      "Flexibler Einsatz in verschiedenen Bereichen nach Bedarf",
    ],
  },
  Reinigungskraft: {
    title: "Im Bereich Reinigung",
    randomActivities: [
      "Staubsaugen, Wischen und Polieren von Böden",
      "Reinigung und Desinfektion von Sanitäranlagen",
      "Entleerung und fachgerechte Entsorgung von Abfällen",
      "Reinigung von Fenstern, Glasflächen und Spiegeln",
      "Auffüllen von Hygiene- und Verbrauchsmaterialien (Seife, Papierhandtücher etc.)",
      "Pflege und Reinigung von Möbeln und Einrichtungsgegenständen",
      "Bedienung und Wartung von Reinigungsgeräten",
      "Anwendung verschiedener Reinigungs- und Desinfektionsmittel gemäß Vorschriften",
      "Einhaltung von Hygiene-, Sicherheits- und Qualitätsstandards",
    ],
  },
} as const

export type PersonalGeorgienProfession = keyof typeof professionRandom

export const personalGeorgienProfessionOptions = Object.keys(
  professionRandom
) as PersonalGeorgienProfession[]

const createSeededRandom = (seed: string) => {
  let state = 0
  for (const char of seed) {
    state = (state * 31 + char.charCodeAt(0)) >>> 0
  }

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

const pickRandomSubset = <T>(
  items: readonly T[],
  count: number,
  random: () => number
): T[] => {
  const pool = [...items]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const current = pool[i]
    const swap = pool[j]
    if (current === undefined || swap === undefined) continue
    pool[i] = swap
    pool[j] = current
  }

  return pool.slice(0, Math.min(count, pool.length))
}

const generateExperiencePeriod = (
  birthDate: string,
  applicationId: string
): { from: Date; ongoing: boolean } => {
  const random = createSeededRandom(`${applicationId}-period`)
  const birthMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate.trim())
  const birthYear = birthMatch ? Number(birthMatch[1]) : 2000
  const minStartYear = birthYear + 16
  const maxStartYear = new Date().getFullYear() - 1
  const yearRange = Math.max(1, maxStartYear - minStartYear + 1)
  const startYear = minStartYear + Math.floor(random() * yearRange)
  const startMonth = 1 + Math.floor(random() * 12)

  return {
    from: new Date(startYear, startMonth - 1, 1),
    ongoing: random() > 0.25,
  }
}

const formatExperiencePeriod = (from: Date, ongoing: boolean) => {
  const monthYear = `${String(from.getMonth() + 1).padStart(2, "0")}/${from.getFullYear()}`
  return ongoing ? `seit ${monthYear}` : monthYear
}

export const generatePersonalGeorgienPdf = async (
  applicationFormData: ApplicationFormData & {
    applicationId: string
    bewerberAppUrl: string
    profession: PersonalGeorgienProfession
  }
) => {
  const [pdfBytes, fontBytes, flagBytes] = await Promise.all([
    fetch(PDF_TEMPLATE_URL).then((res) => res.arrayBuffer()),
    fetch(MANROPE_REGULAR_FONT).then((res) => res.arrayBuffer()),
    fetch(GEORGIAN_FLAG_IMAGE_URL).then((res) => res.arrayBuffer()),
  ])
  const pdfDoc = await PDFDocument.load(pdfBytes)
  pdfDoc.registerFontkit(fontkit)

  const font = await pdfDoc.embedFont(fontBytes)

  const layout = personalGeorgienPdfLayout

  const pages = pdfDoc.getPages()
  const firstPage = pages[0]

  if (firstPage === undefined) {
    console.error("PERSONAL_GEORGIEN_PDF_PAGE_UNDEFINED")
    throw new Error("PERSONAL_GEORGIEN_PDF_PAGE_UNDEFINED")
  }

  const { height } = firstPage.getSize()

  const drawValue = (
    text: string,
    y: number,
    options?: {
      x?: number
      size?: number
      maxWidth?: number
      linkUrl?: string
      color?: RGB
      underline?: boolean
    }
  ) => {
    const trimmed = text.trim()
    if (trimmed.length === 0) return

    const x = options?.x ?? layout.valueX
    const size = options?.size ?? layout.fieldSize
    const maxWidth = options?.maxWidth ?? layout.maxValueWidth
    const lines = pdfWrapLines(trimmed, font, size, maxWidth)
    const underline = options?.underline ?? options?.linkUrl !== undefined

    let baseline = y
    for (const line of lines) {
      firstPage.drawText(line, {
        x,
        y: baseline,
        size,
        font,
        color: options?.color,
      })

      const lineWidth = font.widthOfTextAtSize(line, size)

      if (options?.linkUrl !== undefined) {
        addUriLinkAnnotation(firstPage, options.linkUrl, {
          x,
          y: baseline - 2,
          width: lineWidth,
          height: size + 2,
        })
      }

      if (underline) {
        drawTextUnderline(
          firstPage,
          {
            x,
            y: baseline - 1.5,
            width: lineWidth,
          },
          options?.color ?? rgb(0, 0, 0)
        )
      }

      baseline -= size + 2
    }
  }

  const photoBytes = new Uint8Array(
    await applicationFormData.foto.arrayBuffer()
  )

  const embeddedPhoto =
    applicationFormData.foto.type === "image/png"
      ? await pdfDoc.embedPng(photoBytes)
      : await pdfDoc.embedJpg(photoBytes)

  const embeddedFlag = await pdfDoc.embedPng(flagBytes)

  const marginX = layout.marginX
  const photoX = marginX + 2
  const photoY = height - layout.foto.h - layout.foto.topOffset
  const photoSize = layout.foto.w
  const photoCenterX = photoX + photoSize / 2
  const photoCenterY = photoY + photoSize / 2
  const photoRadius = photoSize / 2

  const coverScale = Math.max(
    photoSize / embeddedPhoto.width,
    photoSize / embeddedPhoto.height
  )
  const drawPhotoWidth = embeddedPhoto.width * coverScale
  const drawPhotoHeight = embeddedPhoto.height * coverScale
  const drawPhotoX = photoX + (photoSize - drawPhotoWidth) / 2
  const drawPhotoY = photoY + (photoSize - drawPhotoHeight) / 2

  firstPage.pushOperators(
    pushGraphicsState(),
    ...drawEllipsePath({
      x: photoCenterX,
      y: photoCenterY,
      xScale: photoRadius,
      yScale: photoRadius,
    }),
    clipEvenOdd(),
    endPath()
  )
  firstPage.drawImage(embeddedPhoto, {
    x: drawPhotoX,
    y: drawPhotoY,
    width: drawPhotoWidth,
    height: drawPhotoHeight,
  })
  firstPage.pushOperators(popGraphicsState())

  firstPage.drawImage(embeddedFlag, {
    x: marginX + layout.flag.offsetX,
    y: drawPhotoY + layout.flag.offsetY,
    width: layout.flag.w,
    height: layout.flag.h,
  })

  const age = calculateAge(applicationFormData.birthDate)
  const ageSuffix = age === null ? "" : ` - ${age} J.`
  firstPage.drawText(
    `${applicationFormData.firstName} ${applicationFormData.lastName}${ageSuffix}`,
    {
      x: layout.fields.name.x,
      y: layout.fields.name.y,
      size: layout.nameSize,
      font,
    }
  )

  const birthInfo = joinNonEmpty(
    [
      formatPersonalGeorgienDate(applicationFormData.birthDate),
      applicationFormData.birthPlace,
      applicationFormData.birthCountry,
    ],
    ", "
  )
  const formatValue = (val: string | undefined | null) =>
    val === undefined || val === null ? "-" : val.trim() === "" ? "-" : val

  drawValue(birthInfo, layout.fields.geburtsdatumOrtLand.y)

  drawValue(
    formatPersonalGeorgienGender(applicationFormData.gender),
    layout.fields.geschlecht.y
  )

  const address = joinNonEmpty(
    [
      applicationFormData.street,
      joinNonEmpty(
        [applicationFormData.postalCode, applicationFormData.city],
        " "
      ),
      applicationFormData.country,
    ],
    ", "
  )
  drawValue(address, layout.fields.wohnort.y)

  drawValue(
    formatPersonalGeorgienDate(applicationFormData.semesterBreakFrom),
    layout.fields.einreisen.y
  )

  drawValue(
    formatValue(applicationFormData.germanLevel),
    layout.fields.deutschniveau.y
  )

  drawValue(
    formatValue(applicationFormData.otherLanguages),
    layout.fields.weitereSprachen.y
  )

  drawValue(
    formatPersonalGeorgienBool(applicationFormData.driverLicense),
    layout.fields.fuehrerschein.y
  )

  drawValue(
    formatPersonalGeorgienBool(applicationFormData.shiftWork),
    layout.fields.schichbereitschaft.y
  )

  drawValue(formatValue(applicationFormData.phone), layout.fields.telefon.y)
  drawValue(formatValue(applicationFormData.email), layout.fields.email.y)

  const instagram = formatValue(applicationFormData.instagram)
  drawValue(
    instagram.length > 0 && !instagram.startsWith("@") && instagram !== "-"
      ? `@${instagram}`
      : instagram,
    layout.fields.instagram.y
  )

  const profileUrl = applicationProfileUrl(
    applicationFormData.bewerberAppUrl,
    applicationFormData.applicationId
  )

  drawValue("🔗 Zum Kandidaten", layout.fields.profil.y, {
    linkUrl: profileUrl,
    color: layout.profileLinkColor,
  })

  const professionData = professionRandom[applicationFormData.profession]
  const experienceRandom = createSeededRandom(
    `${applicationFormData.applicationId}-${applicationFormData.profession}`
  )
  const activityCount = 3 + Math.floor(experienceRandom() * 3)
  const activities = pickRandomSubset(
    professionData.randomActivities,
    activityCount,
    experienceRandom
  )
  const { from, ongoing } = generateExperiencePeriod(
    applicationFormData.birthDate,
    applicationFormData.applicationId
  )
  const experienceLocation = joinNonEmpty(
    [applicationFormData.city, applicationFormData.country],
    ", "
  )
  const pe = layout.praktischeErfahrung
  let experienceY = pe.startY

  firstPage.drawText(formatExperiencePeriod(from, ongoing), {
    x: pe.dateX,
    y: experienceY,
    size: layout.fieldSize,
    font,
  })
  firstPage.drawText(professionData.title, {
    x: pe.contentX,
    y: experienceY,
    size: layout.fieldSize,
    font,
    color: pe.titleColor,
  })

  experienceY -= pe.titleLineHeight
  firstPage.drawText(experienceLocation, {
    x: pe.contentX,
    y: experienceY,
    size: layout.fieldSize,
    font,
  })

  experienceY -= pe.titleLineHeight + pe.paragraphGap

  const bulletTextMaxWidth = pe.maxContentWidth - (pe.bulletTextX - pe.contentX)
  for (const activity of activities) {
    firstPage.drawText("•", {
      x: pe.contentX,
      y: experienceY,
      size: layout.fieldSize,
      font,
    })

    const activityLines = pdfWrapLines(
      activity,
      font,
      layout.fieldSize,
      bulletTextMaxWidth
    )
    for (const [lineIndex, line] of activityLines.entries()) {
      if (lineIndex > 0) {
        experienceY -= pe.lineHeight
      }

      firstPage.drawText(line, {
        x: pe.bulletTextX,
        y: experienceY,
        size: layout.fieldSize,
        font,
      })
    }

    experienceY -= pe.lineHeight
  }

  return pdfDoc.save()
}
