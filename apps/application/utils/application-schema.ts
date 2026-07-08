import { z } from 'zod'

const germanLevels = z.enum(['A1', 'A2', 'B1', 'B2', 'C1'])

export const workSectorOptions = [
    'Hotel/Gaststätte',
    'Systemgastronomie',
    'Landwirtschaft',
    'Gebäude-/Industriereinigung',
    'Industrielle Produktion',
] as const

export const workSectorLabels: Record<
    (typeof workSectorOptions)[number],
    string
> = {
    'Hotel/Gaststätte': 'სასტუმრო / რესტორანი',
    Systemgastronomie: 'სწრაფი კვების ქსელი',
    Landwirtschaft: 'სოფლის მეურნეობა',
    'Gebäude-/Industriereinigung': 'დასუფთავება (შენობები / ინდუსტრია)',
    'Industrielle Produktion': 'ინდუსტრიული წარმოება',
}

function hasText(value: string | undefined) {
    return (value?.trim() ?? '') !== ''
}

function hasUniversitySelection(data: {
    universityId?: string
    university?: string
}) {
    return hasText(data.universityId) || hasText(data.university)
}

export const shoeSizeOptions = [
    '36',
    '37',
    '38',
    '39',
    '40',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '47',
] as const

export const applicationFormSchema = z
    .object({
        firstName: z.string().min(1, 'სახელი სავალდებულოა'),
        lastName: z.string().min(1, 'გვარი სავალდებულოა'),
        gender: z.enum(['M', 'F'], {
            message: 'სქესი სავალდებულოა',
        }),
        birthDate: z.string().min(1, 'დაბადების თარიღი სავალდებულოა'),
        birthPlace: z.string().min(1, 'დაბადების ადგილი სავალდებულოა'),
        birthCountry: z.string().min(1, 'დაბადების ქვეყანა სავალდებულოა'),
        street: z.string().min(1, 'ქუჩა და სახლის ნომერი სავალდებულოა'),
        postalCode: z.string().min(1, 'საფოსტო ინდექსი სავალდებულოა'),
        city: z.string().min(1, 'ქალაქი სავალდებულოა'),
        country: z.string().min(1, 'ქვეყანა სავალდებულოა'),
        nationality: z.string().min(1, 'მოქალაქეობა სავალდებულოა'),
        email: z
            .string()
            .refine(
                (val) =>
                    val.trim() === '' ||
                    z.email().safeParse(val.trim()).success,
                'არასწორი ელფოსტის ფორმატი'
            )
            .optional(),
        phone: z
            .string()
            .refine(
                (val) =>
                    val.trim() === '' ||
                    /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(
                        val.trim()
                    ),
                'არასწორი ტელეფონის ნომრის ფორმატი'
            )
            .optional(),
        instagram: z
            .string()
            .refine(
                (val) => val.trim() === '' || /^[\w\.]+$/.test(val.trim()),
                'არასწორი Instagram-ის ფორმატი (მხოლოდ მომხმარებლის სახელი @-ის გარეშე)'
            )
            .optional(),
        taxId: z.string().optional(),
        foto: z
            .instanceof(File, {
                message: 'გთხოვთ ატვირთოტ თქვენი ფოტო',
            })
            .refine(
                (file) =>
                    ['image/png', 'image/jpeg', 'image/jpg'].includes(
                        file.type
                    ),
                {
                    message: 'მხოლოდ PNG და JPEG ფაილებია დაშვებული',
                }
            ),
        isStudent: z.boolean({
            message: 'სტუდენტობა სავალდებულოა',
        }),
        universityId: z.string().optional(),
        university: z.string().optional(),
        studySubject: z.string().optional(),
        standardStudyPeriodYears: z
            .number({
                message: 'არასწორი რიცხვი',
            })
            .positive('შეიყვანეთ დადებითი რიცხვი')
            .optional(),
        enrolledSince: z.string().optional(),
        expectedStudyEnd: z.string().optional(),
        semesterBreakFrom: z.string().optional(),
        semesterBreakTo: z.string().optional(),
        studiesContinueAfterSemesterBreak: z.boolean().optional(),
        germanLevel: germanLevels.optional(),
        otherLanguages: z.string().optional(),
        driverLicense: z.boolean().optional(),
        canRideBike: z.boolean().optional(),
        shiftWork: z.boolean().optional(),
        healthRestrictions: z.string().optional(),
        allergies: z.string().optional(),
        clothingSize: z.string().optional(),
        shoeSize: z.array(z.enum(shoeSizeOptions)).optional(),

        hasBeenInGermanyBefore: z.boolean().optional(),
        previousStayPlace: z.string().optional(),
        previousStayPeriodFrom: z.string().optional(),
        previousStayPeriodTo: z.string().optional(),

        emergencyContactName: z
            .string()
            .min(1, 'საგანგებო საკონტაქტო პირი სავალდებულოა'),
        emergencyPhone: z
            .string()
            .min(1, 'საგანგებო ტელეფონის ნომერი სავალდებულოა'),
        workSector: z
            .array(z.enum(workSectorOptions))
            .min(1, 'სასურველი სამუშაო სფერო სავალდებულოა'),
        acceptPrivacyPolicy: z.boolean().refine((value) => value === true, {
            message: 'კონფიდენციალურობის პოლიტიკის დადასტურება სავალდებულოა',
        }),
    })
    .refine(
        (data) => {
            const hasId = hasText(data.universityId)
            const hasName = hasText(data.university)
            return !(hasId && hasName)
        },
        {
            message:
                'უნივერსიტეტის არჩევა და ხელით შეყვანა ერთდროულად არ შეიძლება',
            path: ['university'],
        }
    )
    .refine((data) => !data.isStudent || hasUniversitySelection(data), {
        message: 'უნივერსიტეტი სავალდებულოა',
        path: ['university'],
    })
    .refine(
        (data) => !data.isStudent || hasText(data.studySubject),
        {
            message: 'სასწავლო სპეციალობა სავალდებულოა',
            path: ['studySubject'],
        }
    )
    .refine(
        (data) =>
            !data.isStudent || data.standardStudyPeriodYears !== undefined,
        {
            message: 'რეგულირებული სწავლის პერიოდი სავალდებულოა',
            path: ['standardStudyPeriodYears'],
        }
    )
    .refine(
        (data) => !data.isStudent || hasText(data.enrolledSince),
        {
            message: 'სწავლის დაწყების თარიღი სავალდებულოა',
            path: ['enrolledSince'],
        }
    )
    .refine(
        (data) => !data.isStudent || hasText(data.expectedStudyEnd),
        {
            message: 'სწავლის დასრულების მოსალოდნელი თარიღი სავალდებულოა',
            path: ['expectedStudyEnd'],
        }
    )
    .refine(
        (data) => {
            if (!data.isStudent) return true
            const from = data.enrolledSince?.trim() ?? ''
            const to = data.expectedStudyEnd?.trim() ?? ''
            if (!from || !to) return true
            return from <= to
        },
        {
            message:
                'სწავლის დასრულების თარიღი უნდა იყოს სწავლის დაწყების თარიღის შემდეგ ან ტოლი',
            path: ['expectedStudyEnd'],
        }
    )
    .refine(
        (data) => !data.isStudent || hasText(data.semesterBreakFrom),
        {
            message: 'არდადეგების დასაწყისი სავალდებულოა',
            path: ['semesterBreakFrom'],
        }
    )
    .refine((data) => !data.isStudent || hasText(data.semesterBreakTo), {
        message: 'არდადეგების დასასრული სავალდებულოა',
        path: ['semesterBreakTo'],
    })
    .refine(
        (data) => {
            if (!data.isStudent) return true
            const from = data.semesterBreakFrom?.trim() ?? ''
            const to = data.semesterBreakTo?.trim() ?? ''
            if (!from || !to) return true
            return from <= to
        },
        {
            message:
                'არდადეგების დასაწყისი უნდა იყოს არდადეგების დასასრულზე ადრე ან ტოლი',
            path: ['semesterBreakTo'],
        }
    )
    .refine(
        (data) =>
            !data.isStudent ||
            data.studiesContinueAfterSemesterBreak !== undefined,
        {
            message:
                'სწავლა არდადეგების შემდეგ გაგრძელდება თუ არა — სავალდებულოა',
            path: ['studiesContinueAfterSemesterBreak'],
        }
    )

export type ApplicationFormData = z.infer<typeof applicationFormSchema>
