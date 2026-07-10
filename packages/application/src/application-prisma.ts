import type { Application } from "@workspace/database/browser"
import type {
    AdminApplicationEditData,
    ApplicationFormData,
} from "./application-schema"
import { shoeSizeOptions, workSectorOptions } from "./application-schema"

function optionalString(value: string | undefined): string | null {
    const trimmed = value?.trim() ?? ""
    return trimmed === "" ? null : trimmed
}

function hasText(value: string | undefined): boolean {
    return (value?.trim() ?? "") !== ""
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
    const trimmed = value?.trim() ?? ""
    return trimmed === "" ? null : parseIsoDate(trimmed)
}

function formatDateForForm(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

function optionalDateForForm(date: Date | null | undefined): string {
    if (date === null || date === undefined) {
        return ""
    }
    return formatDateForForm(date)
}

function parseShoeSizes(
    sizes: string[]
): NonNullable<AdminApplicationEditData["shoeSize"]> {
    const allowed = new Set<string>(shoeSizeOptions)
    return sizes.filter((size): size is (typeof shoeSizeOptions)[number] =>
        allowed.has(size)
    )
}

function parseWorkSectors(
    sectors: string[]
): AdminApplicationEditData["workSector"] {
    const allowed = new Set<string>(workSectorOptions)
    return sectors.filter((sector): sector is (typeof workSectorOptions)[number] =>
        allowed.has(sector)
    )
}

function optionalId(value: string | undefined): string | null {
    const trimmed = value?.trim() ?? ""
    return trimmed === "" ? null : trimmed
}

export function applicationToPrismaData(
    data: AdminApplicationEditData | ApplicationFormData
) {
    return {
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
        universityId:
            "universityId" in data ? optionalId(data.universityId) : null,
        university:
            "universityId" in data && hasText(data.universityId)
                ? null
                : optionalString(data.university),
        studySubject: optionalString(data.studySubject),
        standardStudyPeriodYears:
            "standardStudyPeriodYears" in data
                ? (data.standardStudyPeriodYears ?? null)
                : null,
        enrolledSince:
            "enrolledSince" in data
                ? optionalIsoDate(data.enrolledSince)
                : null,
        expectedStudyEnd:
            "expectedStudyEnd" in data
                ? optionalIsoDate(data.expectedStudyEnd)
                : null,
        semesterBreakFrom: optionalIsoDate(data.semesterBreakFrom),
        semesterBreakTo: optionalIsoDate(data.semesterBreakTo),
        studiesContinueAfterSemesterBreak:
            "studiesContinueAfterSemesterBreak" in data
                ? (data.studiesContinueAfterSemesterBreak ?? null)
                : null,
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

export function prismaToAdminEditData(
    application: Application
): AdminApplicationEditData {
    return {
        firstName: application.firstName,
        lastName: application.lastName,
        gender: application.gender,
        birthDate: formatDateForForm(application.birthDate),
        birthPlace: application.birthPlace,
        birthCountry: application.birthCountry,
        street: application.street,
        postalCode: application.postalCode,
        city: application.city,
        country: application.country,
        nationality: application.nationality,
        email: application.email ?? undefined,
        phone: application.phone ?? undefined,
        instagram: application.instagram ?? undefined,
        taxId: application.taxId ?? undefined,
        universityId: application.universityId ?? undefined,
        university: application.university ?? undefined,
        studySubject: application.studySubject ?? undefined,
        standardStudyPeriodYears:
            application.standardStudyPeriodYears ?? undefined,
        enrolledSince: optionalDateForForm(application.enrolledSince),
        expectedStudyEnd: optionalDateForForm(application.expectedStudyEnd),
        semesterBreakFrom: optionalDateForForm(application.semesterBreakFrom),
        semesterBreakTo: optionalDateForForm(application.semesterBreakTo),
        studiesContinueAfterSemesterBreak:
            application.studiesContinueAfterSemesterBreak ?? undefined,
        germanLevel: application.germanLevel ?? undefined,
        otherLanguages: application.otherLanguages ?? undefined,
        driverLicense: application.driverLicense,
        canRideBike: application.canRideBike,
        shiftWork: application.shiftWork,
        healthRestrictions: application.healthRestrictions ?? undefined,
        allergies: application.allergies ?? undefined,
        clothingSize: application.clothingSize ?? undefined,
        shoeSize: parseShoeSizes(application.shoeSize),
        hasBeenInGermanyBefore: application.hasBeenInGermanyBefore,
        previousStayPlace: application.previousStayPlace ?? undefined,
        previousStayPeriodFrom: optionalDateForForm(
            application.previousStayPeriodFrom
        ),
        previousStayPeriodTo: optionalDateForForm(
            application.previousStayPeriodTo
        ),
        emergencyContactName: application.emergencyContactName,
        emergencyPhone: application.emergencyPhone,
        workSector: parseWorkSectors(application.workSector),
    }
}

export function adminEditDataToApplicationFormData(
    data: AdminApplicationEditData,
    foto: File
): ApplicationFormData {
    return {
        ...data,
        foto,
    }
}
