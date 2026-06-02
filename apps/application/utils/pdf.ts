import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib'
import { ApplicationFormData, workSectorOptions } from '@/schema/application'
import fontkit from '@pdf-lib/fontkit'

export const generateApplicationPdf = async (
    applicationFormData: ApplicationFormData & {
        logo: File
    }
) => {
    const pdfDoc = await PDFDocument.create()
    const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

    const colors = {
        accent: rgb(0.85, 0.31, 0.27),
        label: rgb(0.32, 0.34, 0.38),
        body: rgb(0.06, 0.07, 0.09),
        rule: rgb(0, 0, 0),
    }

    const margin = 48
    const labelColumn = 200
    const bodySize = 12
    const lineGap = 3
    const sectionGapBefore = 10

    const sectionTitleSize = 16
    const applicationNameSize = 15

    let page = pdfDoc.addPage()
    let { width, height } = page.getSize()
    let cursorY = height - margin

    const advance = (dy: number) => {
        cursorY -= dy
    }

    const newPage = () => {
        page = pdfDoc.addPage()
        width = page.getSize().width
        height = page.getSize().height
        cursorY = height - margin
    }

    const ensureVerticalSpace = (minHeight: number) => {
        if (cursorY - minHeight < margin) {
            newPage()
        }
    }

    const accentH = 7
    if (accentH > 0) {
        page.drawRectangle({
            x: 0,
            y: height - accentH,
            width,
            height: accentH,
            color: colors.accent,
        })
    }
    cursorY -= accentH + 35

    const photoBytes = new Uint8Array(
        await applicationFormData.foto.arrayBuffer()
    )

    const embeddedPhoto =
        applicationFormData.foto.type === 'image/png'
            ? await pdfDoc.embedPng(photoBytes)
            : await pdfDoc.embedJpg(photoBytes)

    const maxPhotoW = 108
    const maxPhotoH = 132
    const photoScale = Math.min(
        maxPhotoW / embeddedPhoto.width,
        maxPhotoH / embeddedPhoto.height,
        1
    )
    const photoW = embeddedPhoto.width * photoScale
    const photoH = embeddedPhoto.height * photoScale

    const photoBottomY = cursorY - 50
    page.drawImage(embeddedPhoto, {
        x: margin,
        y: photoBottomY,
        width: photoW,
        height: photoH,
    })

    const logoBaseline = cursorY - 20

    const embeddedLogo = await pdfDoc.embedPng(
        new Uint8Array(await applicationFormData.logo.arrayBuffer())
    )

    const logoScale = 0.2
    const logoWidth = embeddedLogo.width * logoScale
    const logoHeight = embeddedLogo.height * logoScale

    page.drawImage(embeddedLogo, {
        x: width - margin - logoWidth,
        y: logoBaseline,
        width: logoWidth,
        height: logoHeight,
    })

    cursorY = Math.min(photoBottomY - 16, logoBaseline - 44)

    page.drawRectangle({
        x: margin,
        y: cursorY,
        width: width - margin * 2,
        height: 0.9,
        color: colors.rule,
    })
    cursorY -= 14

    page.drawText(
        `${applicationFormData.firstName} ${applicationFormData.lastName}`,
        {
            x: margin,
            y: cursorY,
            size: applicationNameSize,
            font: fontBold,
            color: colors.body,
        }
    )

    cursorY -= 26

    const formatOptional = (v: string | undefined) => {
        const t = typeof v === 'string' ? v.trim() : ''
        return t.length > 0 ? t : '—'
    }

    const formatGender = (g: ApplicationFormData['gender']) =>
        g === 'M' ? 'Männlich' : 'Weiblich'

    const formatDate = (isoDate: string | undefined) => {
        const t = typeof isoDate === 'string' ? isoDate.trim() : ''
        if (t.length === 0) return '—'

        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
        if (!match) return t

        const [, year, month, day] = match
        const date = new Date(Number(year), Number(month) - 1, Number(day))
        if (Number.isNaN(date.getTime())) return t

        return new Intl.DateTimeFormat('de-DE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(date)
    }

    const formatBool = (v: boolean | undefined) => {
        if (v === undefined) return '—'
        return v ? 'Ja' : 'Nein'
    }

    type Row = readonly [label: string, value: string]

    const lineHeight = bodySize + lineGap

    const drawKv = (label: string, value: string) => {
        const valueMaxWidth = width - margin * 2 - labelColumn - 8

        const parts = value
            .replace(/\r\n/g, '\n')
            .split('\n')
            .map((p) => p.trimEnd())
            .filter((p) => p.trim().length > 0)

        const wrappedLines = parts.flatMap((p) =>
            pdfWrapLines(p, fontRegular, bodySize, valueMaxWidth)
        )
        const displayLines = wrappedLines.length > 0 ? wrappedLines : ['—']

        ensureVerticalSpace(displayLines.length * lineHeight + bodySize)

        page.drawText(label, {
            x: margin,
            y: cursorY,
            size: bodySize,
            font: fontBold,
            color: colors.label,
        })

        let lineBaseline = cursorY
        for (const lineText of displayLines) {
            page.drawText(lineText, {
                x: margin + labelColumn,
                y: lineBaseline,
                size: bodySize,
                font: fontRegular,
                color: colors.body,
            })
            lineBaseline -= lineHeight
        }

        cursorY = lineBaseline - 8
    }

    const drawSection = (title: string, rows: Row[]) => {
        ensureVerticalSpace(sectionGapBefore + sectionTitleSize + 18)

        advance(sectionGapBefore)

        page.drawText(title, {
            x: margin,
            y: cursorY,
            size: sectionTitleSize,
            font: fontBold,
            color: colors.accent,
        })
        cursorY -= 10

        page.drawRectangle({
            x: margin,
            y: cursorY,
            width: 180,
            height: 1,
            color: colors.accent,
        })
        cursorY -= 20

        for (const [label, value] of rows) {
            drawKv(label, value)
        }
    }

    drawSection('Persönliche Angaben', [
        ['Vorname', formatOptional(applicationFormData.firstName)],
        ['Nachname', formatOptional(applicationFormData.lastName)],
        ['Geschlecht', formatGender(applicationFormData.gender)],
        ['Geburtsdatum', formatDate(applicationFormData.birthDate)],
        ['Geburtsort', formatOptional(applicationFormData.birthPlace)],
        ['Geburtsland', formatOptional(applicationFormData.birthCountry)],
    ])

    drawSection('Adresse', [
        ['Straße', formatOptional(applicationFormData.street)],
        ['Postleitzahl', formatOptional(applicationFormData.postalCode)],
        ['Stadt', formatOptional(applicationFormData.city)],
        ['Land', formatOptional(applicationFormData.country)],
    ])

    drawSection('Kontakt & soziale Medien', [
        ['E-Mail', formatOptional(applicationFormData.email)],
        ['Telefon', formatOptional(applicationFormData.phone)],
        ['Instagram', formatOptional(applicationFormData.instagram)],
        ['Steuer-ID', formatOptional(applicationFormData.taxId)],
    ])

    const formattedSemesterFrom = formatDate(
        applicationFormData.semesterBreakFrom
    )
    const formattedSemesterTo = formatDate(applicationFormData.semesterBreakTo)
    const semesterBreak =
        formattedSemesterFrom === '—' && formattedSemesterTo === '—'
            ? '—'
            : `${formattedSemesterFrom} - ${formattedSemesterTo}`

    drawSection('Studium', [
        ['Universität', formatOptional(applicationFormData.university)],
        ['Studienfach', formatOptional(applicationFormData.studySubject)],
        ['Semesterferien (von - bis)', semesterBreak],
    ])

    drawSection('Fähigkeiten & Eignung', [
        ['Deutschkenntnisse', formatOptional(applicationFormData.germanLevel)],
        [
            'Weitere Sprachen',
            formatOptional(applicationFormData.otherLanguages),
        ],
        ['Führerschein', formatBool(applicationFormData.driverLicense)],
        ['Kann Fahrrad fahren', formatBool(applicationFormData.canRideBike)],
        [
            'Bereitschaft zur Schichtarbeit',
            formatBool(applicationFormData.shiftWork),
        ],
        [
            'Gesundheitliche Einschränkungen',
            formatOptional(applicationFormData.healthRestrictions),
        ],
        ['Allergien', formatOptional(applicationFormData.allergies)],
        ['Kleidergröße', formatOptional(applicationFormData.clothingSize)],
        [
            'Schuhgröße',
            applicationFormData.shoeSize &&
            applicationFormData.shoeSize.length > 0
                ? applicationFormData.shoeSize.join(', ')
                : '—',
        ],
    ])

    const prevPlace = applicationFormData.previousStayPlace?.trim() ?? ''
    const prevFrom = applicationFormData.previousStayPeriodFrom?.trim() ?? ''
    const prevTo = applicationFormData.previousStayPeriodTo?.trim() ?? ''
    const formattedPrevFrom = formatDate(
        applicationFormData.previousStayPeriodFrom
    )
    const formattedPrevTo = formatDate(applicationFormData.previousStayPeriodTo)
    const hasPrevStay = prevPlace !== '' || prevFrom !== '' || prevTo !== ''
    const prevStay = !hasPrevStay
        ? '—'
        : `${prevPlace || '-'} (${formattedPrevFrom} - ${formattedPrevTo})`

    drawSection('Aufenthalt in Deutschland', [
        [
            'Bereits in Deutschland gewesen',
            formatBool(applicationFormData.hasBeenInGermanyBefore),
        ],
        ['Angaben zu früheren Aufenthalten', prevStay],
    ])

    drawSection('Notfallkontakt', [
        ['Name', formatOptional(applicationFormData.emergencyContactName)],
        ['Telefon', formatOptional(applicationFormData.emergencyPhone)],
    ])

    drawSection('Arbeitsbereich', [
        [
            'Branche',
            applicationFormData.workSector.length > 0
                ? applicationFormData.workSector.join(', ')
                : '—',
        ],
    ])

    const confirmation =
        'Hiermit bestätige ich die Richtigkeit und Vollständigkeit meiner Angaben.'
    const signatureHint = 'Ort, Datum, Unterschrift'
    const footerTextMaxWidth = width - margin * 2
    const confirmationLines = pdfWrapLines(
        confirmation,
        fontRegular,
        bodySize,
        footerTextMaxWidth
    )

    ensureVerticalSpace(
        sectionGapBefore +
            confirmationLines.length * lineHeight +
            12 +
            14 +
            lineHeight +
            16
    )

    advance(sectionGapBefore)

    let footerBaseline = cursorY - 40
    for (const lineText of confirmationLines) {
        page.drawText(lineText, {
            x: margin,
            y: footerBaseline,
            size: bodySize,
            font: fontRegular,
            color: colors.body,
        })
        footerBaseline -= lineHeight
    }

    cursorY = footerBaseline - 12

    page.drawRectangle({
        x: margin,
        y: cursorY,
        width: width - margin * 2,
        height: 0.9,
        color: colors.rule,
    })
    cursorY -= 14

    page.drawText(signatureHint, {
        x: margin,
        y: cursorY,
        size: bodySize,
        font: fontRegular,
        color: colors.label,
    })
    cursorY -= lineHeight + 8

    return await pdfDoc.save()
}

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
                const measured = font.widthOfTextAtSize(
                    rest.slice(0, mid),
                    fontSize
                )
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

    let currentLine = ''

    const flushCurrentLine = () => {
        const trimmed = currentLine.trimEnd()
        if (trimmed !== '') lines.push(trimmed)
        currentLine = ''
    }

    for (const word of words) {
        const fragments =
            font.widthOfTextAtSize(word, fontSize) <= maxWidth
                ? [word]
                : splitWord(word)

        for (const fragment of fragments) {
            const candidate =
                currentLine === '' ? fragment : `${currentLine} ${fragment}`

            if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
                currentLine = candidate
                continue
            }

            flushCurrentLine()

            if (font.widthOfTextAtSize(fragment, fontSize) <= maxWidth) {
                currentLine = fragment
            } else {
                lines.push(...splitWord(fragment))
                currentLine = ''
            }
        }
    }

    flushCurrentLine()
    return lines
}

const REMOTE_TEMPLATE_URL =
    'https://lazari-ways-bucket.s3.eu-central-1.amazonaws.com/public/Bewerbercheckliste.pdf'
const REMOTE_FONT_URL =
    'https://lazari-ways-bucket.s3.eu-central-1.amazonaws.com/public/ARIAL.TTF'

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
            'Hotel/Gaststätte': { x: 72.5, y: 556 },
            Systemgastronomie: { x: 72.5, y: 533 },
            Landwirtschaft: { x: 72.5, y: 512 },
            'Gebäude-/Industriereinigung': { x: 72.5, y: 490.5 },
            'Industrielle Produktion': { x: 72.5, y: 470 },
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
    const t = typeof isoDate === 'string' ? isoDate.trim() : ''
    if (t.length === 0) return ''

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
    if (!match) return t

    const [, year, month, day] = match
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    if (Number.isNaN(date.getTime())) return t

    return new Intl.DateTimeFormat('de-DE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date)
}

const formatRemoteBool = (v: boolean | undefined) => {
    if (v === undefined) return ''
    return v ? 'Ja' : 'Nein'
}

const formatSignatureDate = (date: Date = new Date()) =>
    new Intl.DateTimeFormat('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date)

export const generateRemoteApplicationPdf = async (
    applicationFormData: ApplicationFormData
) => {
    const [pdfTemplateBytes, arialFontBytes] = await Promise.all([
        fetch(REMOTE_TEMPLATE_URL).then((res) => res.bytes()),
        fetch(REMOTE_FONT_URL).then((res) => res.bytes()),
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
        console.error('REMOTE_PDF_PAGE_UNDEFINED')
        throw new Error('REMOTE_PDF_PAGE_UNDEFINED')
    }

    const drawValue = (
        page: PDFPage,
        text: string,
        y: number,
        x: number = layout.valueX
    ) => {
        const trimmed = text.trim()
        if (trimmed.length === 0) return
        page.drawText(trimmed, {
            x,
            y,
            font: arialFont,
            size: textSize,
        })
    }

    const drawCheck = (page: PDFPage, x: number, y: number) => {
        page.drawText('X', {
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
        drawValue(
            page,
            fullName,
            layout.page2.fullName.y,
            layout.page2.fullName.x
        )
    }

    const drawSignatureBlock = (
        page: PDFPage,
        positions: (typeof layout.signature)[keyof typeof layout.signature]
    ) => {
        drawValue(
            page,
            applicationFormData.city + ',',
            positions.y,
            positions.ortX
        )
        drawValue(
            page,
            formatSignatureDate() + ',',
            positions.y,
            positions.datumX
        )
        drawValue(page, signatureName, positions.y, positions.unterschriftX)
    }

    const photoBytes = new Uint8Array(
        await applicationFormData.foto.arrayBuffer()
    )
    const embeddedPhoto =
        applicationFormData.foto.type === 'image/png'
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
        'Lazari Ways - Tsereteli str.117d, Tiflis, Georgien',
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
    drawValue(
        firstPage,
        applicationFormData.nationality,
        p1.staatsangehoerigkeit
    )

    const semesterFrom = formatRemoteDate(applicationFormData.semesterBreakFrom)
    const semesterTo = formatRemoteDate(applicationFormData.semesterBreakTo)
    const semesterBreak =
        semesterFrom === '' && semesterTo === ''
            ? ''
            : semesterFrom === '' || semesterTo === ''
              ? semesterFrom || semesterTo
              : `${semesterFrom} - ${semesterTo}`
    drawValue(firstPage, semesterBreak, p1.semesterferien)
    drawValue(firstPage, applicationFormData.university ?? '', p1.universitaet)
    drawValue(firstPage, applicationFormData.studySubject ?? '', p1.studienfach)

    const germanLevel = applicationFormData.germanLevel
    if (germanLevel !== undefined) {
        const levelPos = layout.checkboxes.germanLevel[germanLevel]
        drawCheck(firstPage, levelPos.x, levelPos.y)
    }

    drawValue(
        firstPage,
        applicationFormData.otherLanguages ?? '',
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
        applicationFormData.healthRestrictions ?? '',
        p1.gesundheit
    )
    drawValue(firstPage, applicationFormData.allergies ?? '', p1.allergien)
    drawValue(
        firstPage,
        applicationFormData.clothingSize ?? '',
        p1.kleidergroesse
    )
    drawValue(
        firstPage,
        applicationFormData.shoeSize && applicationFormData.shoeSize.length > 0
            ? applicationFormData.shoeSize.join(', ')
            : '',
        p1.schuhgroesse
    )

    drawBoolCheckbox(
        firstPage,
        applicationFormData.hasBeenInGermanyBefore,
        layout.checkboxes.hasBeenInGermanyBefore
    )

    const prevFrom = formatRemoteDate(
        applicationFormData.previousStayPeriodFrom
    )
    const prevTo = formatRemoteDate(applicationFormData.previousStayPeriodTo)
    const prevPeriod =
        prevFrom === '' && prevTo === ''
            ? ''
            : prevFrom === '' || prevTo === ''
              ? prevFrom || prevTo
              : `${prevFrom} - ${prevTo}`
    drawValue(
        firstPage,
        applicationFormData.previousStayPlace ?? '',
        137.3,
        p1.vorherigerAufenthaltOrt
    )
    drawValue(firstPage, prevPeriod, 137.3, p1.vorherigerAufenthaltZeitraum)

    drawValue(firstPage, applicationFormData.taxId ?? '', p1.steuerId)
    drawValue(firstPage, applicationFormData.phone ?? '', p1.telefon)
    drawValue(firstPage, applicationFormData.email ?? '', p1.email)
    drawValue(firstPage, applicationFormData.instagram ?? '', p1.instagram)

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
