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
    university: z.string().optional(),
    studySubject: z.string().optional(),
    semesterBreakFrom: z.string().optional(),
    semesterBreakTo: z.string().optional(),
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

export type ApplicationFormData = z.infer<typeof applicationFormSchema>
