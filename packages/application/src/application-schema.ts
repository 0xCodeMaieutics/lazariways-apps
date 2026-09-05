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

export const applicationFormSchema = z.object({
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
                ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type),
            {
                message: 'მხოლოდ PNG და JPEG ფაილებია დაშვებული',
            }
        ),
    universityId: z.string().optional(),
    university: z.string().optional(),
    studySubject: z.string().optional(),
    standardStudyPeriodYears: z
        .number({
            message: 'Invalid number',
        })
        .positive('Enter a positive number')
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
})

export type ApplicationFormData = z.infer<typeof applicationFormSchema>

export const adminApplicationEditSchema = applicationFormSchema
    .omit({
        foto: true,
    })
    .refine(
        (data) => {
            const hasId = hasText(data.universityId)
            const hasName = hasText(data.university)
            return !(hasId && hasName)
        },
        {
            message:
                'Cannot set both a linked university and a custom university name',
            path: ['university'],
        }
    )
    .refine(
        (data) => {
            const from = data.enrolledSince?.trim() ?? ''
            const to = data.expectedStudyEnd?.trim() ?? ''
            if (!from || !to) return true
            return from <= to
        },
        {
            message: 'Expected study end must be on or after enrolled since',
            path: ['expectedStudyEnd'],
        }
    )
    .refine(
        (data) => {
            const from = data.semesterBreakFrom?.trim() ?? ''
            const to = data.semesterBreakTo?.trim() ?? ''
            if (!from || !to) return true
            return from <= to
        },
        {
            message:
                'Semester break end must be on or after semester break start',
            path: ['semesterBreakTo'],
        }
    )

export type AdminApplicationEditData = z.infer<typeof adminApplicationEditSchema>
