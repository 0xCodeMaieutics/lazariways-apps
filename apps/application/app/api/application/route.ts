import { env } from '@/env'
import { NextRequest } from 'next/server'
import { uploadFileToStorage } from '@workspace/file-upload/s3-client'
import crypto from 'crypto'
import {
    applicationFormSchema,
    type ApplicationFormData,
} from '@/utils/application-schema'
import { generateBewerberChecklistPdf } from '@/utils/pdf'
import prisma from '@workspace/database/client'

export const POST = async (request: NextRequest) => {
    const formData = await request.formData()
    const input = applicationFormDataFromFormData(formData)
    const parsed = applicationFormSchema.safeParse(input)

    if (!parsed.success) {
        console.error('ZOD_VALIDATION_FAILED', parsed.error)
        return Response.json({ error: 'Bad request' }, { status: 400 })
    }

    let pdfFormData: ApplicationFormData = parsed.data

    if (parsed.data.universityId) {
        const linkedUniversity = await prisma.university.findUnique({
            where: { id: parsed.data.universityId },
            select: { name: true },
        })

        if (!linkedUniversity) {
            return Response.json({ error: 'Bad request' }, { status: 400 })
        }

        pdfFormData = {
            ...parsed.data,
            university: linkedUniversity.name,
        }
    }

    const firstName = sanitizeFilenamePart(parsed.data.firstName)
    const lastName = sanitizeFilenamePart(parsed.data.lastName)

    const base = `${lastName}-${firstName}-${crypto.randomUUID()}`.replace(
        /^-+|-+$/g,
        ''
    )
    const filename = sanitizeFilenamePart(parsed.data.foto.name) || 'foto.jpg'
    const fotoKey = `applications/${base}/foto/${Date.now()}-${filename}`

    try {
        await uploadFileToStorage({
            file: parsed.data.foto,
            bucket: env.S3_BUCKET_NAME,
            fileKey: fotoKey,
        })
    } catch (error) {
        console.error('FOTO_UPLOAD_FAILED', error)
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }

    let pdfBytesResult
    try {
        pdfBytesResult = await generateBewerberChecklistPdf(pdfFormData)
    } catch (error) {
        console.log('GENERATE_APPLICATION_PDF_ERROR', error)
        return Response.json(
            {
                error: 'Internal server error',
            },
            {
                status: 500,
            }
        )
    }

    try {
        await sendPdfToTelegram(
            pdfBytesResult,
            `${firstName} ${lastName}.pdf`,
            `${process.env.NODE_ENV === 'development' ? 'TEST - ' : ''}${parsed.data.firstName} ${parsed.data.lastName}`.trim()
        )
    } catch (error) {
        console.error('TELEGRAM_REQUEST_FAILED', error)
        return Response.json(
            { error: 'Internal server error' },
            { status: 502 }
        )
    }

    try {
        await prisma.application.create({
            data: applicationToPrismaCreateData(parsed.data, fotoKey),
        })
    } catch (error) {
        console.error('APPLICATION_DB_INSERT_FAILED', error)
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }

    return Response.json({ success: true }, { status: 200 })
}

function formString(formData: FormData, key: string): string {
    const v = formData.get(key)
    return typeof v === 'string' ? v : ''
}

function formStringArray(formData: FormData, key: string): string[] {
    return formData
        .getAll(key)
        .filter((v): v is string => typeof v === 'string')
        .map((v) => v.trim())
        .filter((v) => v !== '')
}

function formOptionalBool(
    formData: FormData,
    key: string
): boolean | undefined {
    const v = formData.get(key)
    if (v === null) return undefined
    if (v === 'true') return true
    if (v === 'false') return false
    return undefined
}

function formBoolean(formData: FormData, key: string): boolean {
    return formString(formData, key) === 'true'
}

function sanitizeFilenamePart(value: string): string {
    return value.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 60)
}

async function sendPdfToTelegram(
    pdfBytes: Uint8Array,
    pdfFilename: string,
    caption: string
) {
    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!token?.trim() || !chatId?.trim()) {
        console.warn(
            'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set; skipping Telegram send'
        )
        return
    }

    const body = new FormData()
    body.append('chat_id', chatId)
    const pdfCopy = Uint8Array.from(pdfBytes)
    body.append(
        'document',
        new Blob([pdfCopy], { type: 'application/pdf' }),
        pdfFilename
    )
    body.append('caption', caption)

    const res = await fetch(
        `https://api.telegram.org/bot${token}/sendDocument`,
        {
            method: 'POST',
            body,
        }
    )

    const json = (await res.json()) as { ok?: boolean; description?: string }

    if (!res.ok || !json.ok) {
        console.error('Telegram sendDocument failed:', json)
        throw new Error(json.description ?? 'Telegram API error')
    }
}

function optionalString(value: string | undefined): string | null {
    const trimmed = value?.trim() ?? ''
    return trimmed === '' ? null : trimmed
}

function parseIsoDate(value: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
    if (!match) {
        throw new Error(`Invalid date: ${value}`)
    }

    const [, year, month, day] = match
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${value}`)
    }

    return date
}

function optionalIsoDate(value: string | undefined): Date | null {
    const trimmed = value?.trim() ?? ''
    return trimmed === '' ? null : parseIsoDate(trimmed)
}

function optionalBool(value: boolean | undefined): boolean | null {
    return value === undefined ? null : value
}

function optionalFloat(value: number | undefined): number | null {
    return value === undefined ? null : value
}

function applicationToPrismaCreateData(
    data: ApplicationFormData,
    fotoS3Key: string
) {
    return {
        fotoS3Key,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        gender: data.gender,
        birthDate: parseIsoDate(data.birthDate),
        birthPlace: data.birthPlace.trim(),
        birthCountry: data.birthCountry.trim(),
        street: data.street.trim(),
        postalCode: data.postalCode.trim(),
        city: data.city.trim(),
        country: data.country.trim(),
        nationality: data.nationality.trim(),
        email: optionalString(data.email),
        phone: optionalString(data.phone),
        instagram: optionalString(data.instagram),
        taxId: optionalString(data.taxId),
        universityId: optionalString(data.universityId),
        university: optionalString(data.university),
        studySubject: optionalString(data.studySubject),
        standardStudyPeriodYears: optionalFloat(data.standardStudyPeriodYears),
        enrolledSince: optionalIsoDate(data.enrolledSince),
        expectedStudyEnd: optionalIsoDate(data.expectedStudyEnd),
        semesterBreakFrom: optionalIsoDate(data.semesterBreakFrom),
        semesterBreakTo: optionalIsoDate(data.semesterBreakTo),
        studiesContinueAfterSemesterBreak: optionalBool(
            data.studiesContinueAfterSemesterBreak
        ),
        germanLevel: data.germanLevel ?? null,
        otherLanguages: optionalString(data.otherLanguages),
        driverLicense: data.driverLicense ?? false,
        canRideBike: data.canRideBike ?? false,
        shiftWork: data.shiftWork ?? false,
        healthRestrictions: optionalString(data.healthRestrictions),
        allergies: optionalString(data.allergies),
        clothingSize: optionalString(data.clothingSize),
        shoeSize: data.shoeSize ?? [],
        hasBeenInGermanyBefore: data.hasBeenInGermanyBefore ?? false,
        previousStayPlace: optionalString(data.previousStayPlace),
        previousStayPeriodFrom: optionalIsoDate(data.previousStayPeriodFrom),
        previousStayPeriodTo: optionalIsoDate(data.previousStayPeriodTo),
        emergencyContactName: data.emergencyContactName.trim(),
        emergencyPhone: data.emergencyPhone.trim(),
        workSector: data.workSector,
    }
}

function formOptionalFloat(
    formData: FormData,
    key: string
): number | undefined {
    const raw = formString(formData, key).trim()
    if (raw === '') return undefined
    const value = Number(raw.replace(',', '.'))
    return Number.isFinite(value) ? value : undefined
}

function applicationFormDataFromFormData(formData: FormData) {
    const emailRaw = formString(formData, 'email')
    const germanLevelRaw = formString(formData, 'germanLevel')
    const universityIdRaw = formString(formData, 'universityId')
    return {
        firstName: formString(formData, 'firstName'),
        lastName: formString(formData, 'lastName'),
        gender: formString(formData, 'gender'),
        birthDate: formString(formData, 'birthDate'),
        birthPlace: formString(formData, 'birthPlace'),
        birthCountry: formString(formData, 'birthCountry'),
        street: formString(formData, 'street'),
        postalCode: formString(formData, 'postalCode'),
        city: formString(formData, 'city'),
        country: formString(formData, 'country'),
        nationality: formString(formData, 'nationality') || 'Georgisch',
        email: emailRaw.trim() === '' ? undefined : emailRaw,
        phone: formString(formData, 'phone'),
        instagram: formString(formData, 'instagram'),
        taxId: formString(formData, 'taxId'),
        foto: formData.get('foto'),
        isStudent: formBoolean(formData, 'isStudent'),
        universityId:
            universityIdRaw.trim() === '' ? undefined : universityIdRaw,
        university: formString(formData, 'university'),
        studySubject: formString(formData, 'studySubject'),
        standardStudyPeriodYears: formOptionalFloat(
            formData,
            'standardStudyPeriodYears'
        ),
        enrolledSince: formString(formData, 'enrolledSince'),
        expectedStudyEnd: formString(formData, 'expectedStudyEnd'),
        semesterBreakFrom: formString(formData, 'semesterBreakFrom'),
        semesterBreakTo: formString(formData, 'semesterBreakTo'),
        studiesContinueAfterSemesterBreak: formOptionalBool(
            formData,
            'studiesContinueAfterSemesterBreak'
        ),
        germanLevel: germanLevelRaw.trim() === '' ? undefined : germanLevelRaw,
        otherLanguages: formString(formData, 'otherLanguages'),
        driverLicense: formOptionalBool(formData, 'driverLicense'),
        canRideBike: formOptionalBool(formData, 'canRideBike'),
        shiftWork: formOptionalBool(formData, 'shiftWork'),
        healthRestrictions: formString(formData, 'healthRestrictions'),
        allergies: formString(formData, 'allergies'),
        clothingSize: formString(formData, 'clothingSize'),
        shoeSize: formStringArray(formData, 'shoeSize'),
        hasBeenInGermanyBefore: formOptionalBool(
            formData,
            'hasBeenInGermanyBefore'
        ),
        previousStayPlace: formString(formData, 'previousStayPlace'),
        previousStayPeriodFrom: formString(formData, 'previousStayPeriodFrom'),
        previousStayPeriodTo: formString(formData, 'previousStayPeriodTo'),
        emergencyContactName: formString(formData, 'emergencyContactName'),
        emergencyPhone: formString(formData, 'emergencyPhone'),
        workSector: formStringArray(formData, 'workSector'),
        acceptPrivacyPolicy: formBoolean(formData, 'acceptPrivacyPolicy'),
    }
}
