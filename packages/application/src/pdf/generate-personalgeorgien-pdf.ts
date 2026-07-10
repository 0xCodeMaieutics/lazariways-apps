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
import { ApplicationFormData } from "../application-schema"
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

const formatDate = (isoDate: string | undefined) => {
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

const formatGender = (gender: ApplicationFormData["gender"]) =>
  gender === "M" ? "Männlich" : "Weiblich"

const formatBool = (value: boolean | undefined) => {
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
      formatDate(applicationFormData.birthDate),
      applicationFormData.birthPlace,
      applicationFormData.birthCountry,
    ],
    ", "
  )
  const formatValue = (val: string | undefined | null) =>
    val === undefined || val === null ? "-" : val.trim() === "" ? "-" : val

  drawValue(birthInfo, layout.fields.geburtsdatumOrtLand.y)

  drawValue(
    formatGender(applicationFormData.gender),
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
    formatDate(applicationFormData.semesterBreakFrom),
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
    formatBool(applicationFormData.driverLicense),
    layout.fields.fuehrerschein.y
  )

  drawValue(
    formatBool(applicationFormData.shiftWork),
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
