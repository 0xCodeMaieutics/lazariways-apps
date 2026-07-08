'use client'

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useEffect, useCallback, useState, useTransition } from 'react'

import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
    RadioGroup,
    RadioGroupItem,
} from '@workspace/ui/components/radio-group'
import { Label } from '@workspace/ui/components/label'

import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import {
    NativeSelect,
    NativeSelectOption,
} from '@workspace/ui/components/native-select'
import { FileUpload } from '@workspace/ui/components/file-upload'
import {
    applicationFormSchema,
    type ApplicationFormData,
    workSectorLabels,
    workSectorOptions,
    shoeSizeOptions,
} from '@/utils/application-schema'
import { ImageCropper } from '@workspace/ui/components/image-cropper'
import { SafariInputDate } from '@workspace/ui/components//safari-date-component'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { XCircle } from 'lucide-react'

const UNIVERSITY_NOT_IN_LIST = '__not_in_list__'

type UniversityOption = {
    id: string
    name: string
}

function containsNonLatinLetters(value: string) {
    for (const char of value) {
        if (/\p{L}/u.test(char) && !/\p{Script=Latin}/u.test(char)) {
            return true
        }
    }
    return false
}

function FormRadioOption({
    id,
    value,
    label,
}: {
    id: string
    value: string
    label: string
}) {
    return (
        <div className="flex items-center gap-2">
            <RadioGroupItem value={value} id={id} />
            <Label htmlFor={id}>{label}</Label>
        </div>
    )
}

function booleanRadioGroupValue(value: boolean | undefined) {
    if (value === true) return 'true'
    if (value === false) return 'false'
    return ''
}

function applicationFormDataToFormData(data: ApplicationFormData): FormData {
    const fd = new FormData()
    for (const key of Object.keys(data) as (keyof ApplicationFormData)[]) {
        const value = data[key]
        if (key === 'foto') {
            if (value instanceof File) {
                fd.set(key, value)
            }
            continue
        }
        if (Array.isArray(value)) {
            if (value.length === 0) {
                fd.set(key, '')
            } else {
                for (const item of value) {
                    fd.append(key, String(item))
                }
            }
            continue
        }
        if (typeof value === 'boolean') {
            fd.set(key, value ? 'true' : 'false')
            continue
        }
        if (value === undefined || value === null) {
            fd.set(key, '')
            continue
        }
        fd.set(key, String(value))
    }
    return fd
}

export function ApplicationForm({
    universities,
}: {
    universities: UniversityOption[]
}) {
    const router = useRouter()
    const [isSubmitting, startTransition] = useTransition()

    const [isSubmissionErrorOpen, setIsSubmissionErrorOpen] = useState(false)
    const [base64String, setBase64String] = useState<string | null>(null)
    const [showCustomUniversity, setShowCustomUniversity] = useState(false)

    const submitApplication = async (input: ApplicationFormData) => {
        startTransition(async () => {
            try {
                const response = await fetch('/api/application', {
                    method: 'POST',
                    body: applicationFormDataToFormData(input),
                })
                if (!response.ok) {
                    startTransition(() => {
                        setIsSubmissionErrorOpen(true)
                    })
                    return
                }
                router.push('/success')
            } catch (e) {
                startTransition(() => {
                    setIsSubmissionErrorOpen(true)
                })
            }
        })
    }

    const form = useForm<ApplicationFormData>({
        resolver: standardSchemaResolver(applicationFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            gender: 'M',
            birthDate: '',
            birthPlace: '',
            birthCountry: 'Georgien',
            street: '',
            postalCode: '',
            city: '',
            country: 'Georgien',
            nationality: 'Georgisch',
            phone: '',
            instagram: '',
            taxId: '',
            foto: undefined,

            semesterBreakFrom: '',
            semesterBreakTo: '',
            universityId: undefined,
            university: '',
            studySubject: '',
            germanLevel: 'A1',
            otherLanguages: '',

            driverLicense: false,
            canRideBike: false,
            shiftWork: false,

            healthRestrictions: '',
            allergies: '',
            clothingSize: '',
            shoeSize: [],
            hasBeenInGermanyBefore: false,
            previousStayPlace: '',
            previousStayPeriodFrom: '',
            previousStayPeriodTo: '',

            emergencyContactName: '',
            emergencyPhone: '',
            workSector: [],
            acceptPrivacyPolicy: false,
        },
    })

    const handleTestValuesClick = () => {
        if (process.env.NODE_ENV !== 'development') {
            return
        }
        form.setValue('firstName', 'Anna', { shouldDirty: true })
        form.setValue('lastName', 'Schmidt', { shouldDirty: true })
        form.setValue('gender', 'F', { shouldDirty: true })
        form.setValue('birthDate', '1990-05-15', { shouldDirty: true })
        form.setValue('birthPlace', 'München', { shouldDirty: true })
        form.setValue('birthCountry', 'Deutschland', { shouldDirty: true })
        form.setValue('street', 'Musterstraße 45', { shouldDirty: true })
        form.setValue('postalCode', '80331', { shouldDirty: true })
        form.setValue('city', 'München', { shouldDirty: true })
        form.setValue('country', 'Deutschland', { shouldDirty: true })
        form.setValue('phone', '+49 123 456789', { shouldDirty: true })
        form.setValue('email', 'dev@testing.com', { shouldDirty: true })
        form.setValue('instagram', 'username', { shouldDirty: true })
        form.setValue('taxId', '123456789', { shouldDirty: true })

        form.setValue('semesterBreakFrom', '2024-07-01', { shouldDirty: true })
        form.setValue('semesterBreakTo', '2024-09-30', { shouldDirty: true })
        if (universities[0]) {
            form.setValue('universityId', universities[0].id, {
                shouldDirty: true,
            })
            form.setValue('university', '', { shouldDirty: true })
            setShowCustomUniversity(false)
        } else {
            form.setValue('universityId', undefined, { shouldDirty: true })
            form.setValue(
                'university',
                'Ludwig-Maximilians-Universität München',
                { shouldDirty: true }
            )
            setShowCustomUniversity(true)
        }
        form.setValue('studySubject', 'Betriebswirtschaftslehre', {
            shouldDirty: true,
        })
        form.setValue('germanLevel', 'B2', { shouldDirty: true })
        form.setValue('otherLanguages', 'Englisch B2, Französisch A2', {
            shouldDirty: true,
        })
        form.setValue('driverLicense', true, { shouldDirty: true })
        form.setValue('canRideBike', false, { shouldDirty: true })
        form.setValue('shiftWork', false, { shouldDirty: true })
        form.setValue('healthRestrictions', 'whatever', { shouldDirty: true })
        form.setValue('allergies', 'Some allergy', { shouldDirty: true })
        form.setValue('clothingSize', 'M', { shouldDirty: true })
        form.setValue('shoeSize', ['41', '42'], { shouldDirty: true })
        form.setValue('hasBeenInGermanyBefore', true, { shouldDirty: true })
        form.setValue('previousStayPlace', 'Hamburg', { shouldDirty: true })
        form.setValue('previousStayPeriodFrom', '2023-07-01', {
            shouldDirty: true,
        })
        form.setValue('previousStayPeriodTo', '2023-08-01', {
            shouldDirty: true,
        })
        form.setValue('emergencyContactName', 'Maria Schmidt', {
            shouldDirty: true,
        })
        form.setValue('emergencyPhone', '+49 89 98765432', {
            shouldDirty: true,
        })
        form.setValue('workSector', ['Hotel/Gaststätte', 'Systemgastronomie'], {
            shouldDirty: true,
        })
        form.setValue('foto', new File([], 'foto.png', { type: 'image/png' }), {
            shouldDirty: true,
        })
    }

    const scrollToFirstError = useCallback(() => {
        const errors = form.formState.errors
        const firstErrorField = Object.keys(errors)[0]

        if (firstErrorField) {
            let fieldElement: Element | null = null

            const inputFilesName = ['foto', 'passport', 'introductionVideo']

            if (inputFilesName.includes(firstErrorField)) {
                fieldElement = document.querySelector(`[data-invalid="true"]`)

                if (fieldElement) {
                    const allInvalidFields = document.querySelectorAll(
                        `[data-invalid="true"]`
                    )
                    for (const field of allInvalidFields) {
                        const fileInput = field.querySelector(
                            `input[type="file"]#${firstErrorField}`
                        )
                        if (fileInput) {
                            fieldElement = field
                            break
                        }
                    }
                }
            } else {
                fieldElement =
                    document.getElementById(firstErrorField) ||
                    document.querySelector(`[name="${firstErrorField}"]`) ||
                    document.querySelector(`[data-field="${firstErrorField}"]`)
            }

            if (fieldElement) {
                fieldElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest',
                })

                if (inputFilesName.includes(firstErrorField)) {
                    const browseButton = fieldElement!.querySelector(
                        'button[type="button"]'
                    )
                    if (browseButton instanceof HTMLElement) {
                        browseButton.focus()
                    }
                } else {
                    const input = fieldElement!.querySelector(
                        'input, textarea, select'
                    )
                    if (input instanceof HTMLElement) {
                        input.focus()
                    }
                }
            }
        }
    }, [form.formState.errors])

    useEffect(() => {
        const errors = form.formState.errors
        if (Object.keys(errors).length > 0 && form.formState.isSubmitted) {
            scrollToFirstError()
        }
    }, [form.formState.errors, form.formState.isSubmitted, scrollToFirstError])

    function onInvalid() {
        setTimeout(() => {
            scrollToFirstError()
        }, 100)
    }

    const hasBeenInGermanyBefore = useWatch({
        control: form.control,
        name: 'hasBeenInGermanyBefore',
    })

    const isDirty = form.formState.isDirty
    const acceptPrivacyPolicy = useWatch({
        control: form.control,
        name: 'acceptPrivacyPolicy',
    })

    const universityId = useWatch({
        control: form.control,
        name: 'universityId',
    })

    const universitySelectValue = showCustomUniversity
        ? UNIVERSITY_NOT_IN_LIST
        : (universityId ?? '')

    const onUniversitySelectChange = (value: string) => {
        if (value === UNIVERSITY_NOT_IN_LIST) {
            setShowCustomUniversity(true)
            form.setValue('universityId', undefined, { shouldDirty: true })
            return
        }

        setShowCustomUniversity(false)

        if (value === '') {
            form.setValue('universityId', undefined, { shouldDirty: true })
            form.setValue('university', '', { shouldDirty: true })
            return
        }

        form.setValue('universityId', value, { shouldDirty: true })
        form.setValue('university', '', { shouldDirty: true })
    }

    const onValidateRomanCharacters = ({
        fieldName,
        value,
    }: {
        value: string
        fieldName: keyof ApplicationFormData
    }) => {
        if (containsNonLatinLetters(value)) {
            form.setError(fieldName, {
                message: 'გთხოვთ, ინგლისური ასოებით შეიყვანეთ',
            })
            return
        }
        if (form.getFieldState(fieldName).invalid) {
            form.clearErrors(fieldName)
        }
    }

    return (
        <>
            <form
                id="application-form"
                onSubmit={form.handleSubmit(
                    (data) => submitApplication(data),
                    onInvalid
                )}
                noValidate
                className="p-6"
            >
                <div className="space-y-8">
                    <div>
                        <h3
                            className="mb-4 flex items-center gap-2 text-lg font-semibold"
                            role="button"
                            onDoubleClick={handleTestValuesClick}
                            title="ორჯერ დააჭირეთ ტესტური მონაცემების შესავსებად"
                        >
                            პირადი ინფორმაცია
                        </h3>
                        <FieldGroup>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <Controller
                                    name="firstName"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel
                                                htmlFor="firstName"
                                                className="text-sm font-medium"
                                            >
                                                სახელი *
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                onChange={(v) => {
                                                    const value = v.target.value
                                                    field.onChange(
                                                        v.target.value
                                                    )
                                                    onValidateRomanCharacters({
                                                        value,
                                                        fieldName: 'firstName',
                                                    })
                                                }}
                                                id="firstName"
                                                pattern="[a-zA-Z\s\.\-_]+"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="თქვენი სახელი მაგ. Ana"
                                                className="transition-colors"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="lastName"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel
                                                htmlFor="lastName"
                                                className="text-sm font-medium"
                                            >
                                                გვარი *
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="lastName"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="თქვენი გვარი მაგ. Malazonia"
                                                className="transition-colors"
                                                onChange={(v) => {
                                                    const value = v.target.value
                                                    field.onChange(
                                                        v.target.value
                                                    )
                                                    onValidateRomanCharacters({
                                                        value,
                                                        fieldName: 'lastName',
                                                    })
                                                }}
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>

                            <Controller
                                name="gender"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel className="text-sm font-medium">
                                            სქესი *
                                        </FieldLabel>
                                        <RadioGroup
                                            value={field.value ?? ''}
                                            onValueChange={field.onChange}
                                            className="mt-2 flex flex-row gap-6"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            <FormRadioOption
                                                id="gender-male"
                                                value="M"
                                                label="მამრობითი"
                                            />
                                            <FormRadioOption
                                                id="gender-female"
                                                value="F"
                                                label="მდედრობითი"
                                            />
                                        </RadioGroup>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </div>

                    {/* Birth Information */}
                    <FieldGroup>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <Controller
                                name="birthDate"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="birthDate"
                                            className="text-sm font-medium"
                                        >
                                            დაბადების თარიღი *
                                        </FieldLabel>
                                        <SafariInputDate
                                            field={field}
                                            id="birthDate"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="birthPlace"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="birthPlace"
                                            className="text-sm font-medium"
                                        >
                                            დაბადების ადგილი *
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="birthPlace"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="ქალაქი"
                                            className="transition-colors"
                                            onChange={(v) => {
                                                const value = v.target.value
                                                field.onChange(v.target.value)
                                                onValidateRomanCharacters({
                                                    value,
                                                    fieldName: 'birthPlace',
                                                })
                                            }}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="birthCountry"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    const isGeorgien =
                                        field.value === 'Georgien'

                                    return (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel className="text-sm font-medium">
                                                დაბადების ქვეყანა *
                                            </FieldLabel>
                                            <RadioGroup
                                                value={
                                                    isGeorgien
                                                        ? 'Georgien'
                                                        : 'Other'
                                                }
                                                onValueChange={(v) =>
                                                    field.onChange(
                                                        v === 'Georgien'
                                                            ? 'Georgien'
                                                            : ''
                                                    )
                                                }
                                                className="mt-2 flex flex-row gap-6"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <FormRadioOption
                                                    id="birthCountry-georgien"
                                                    value="Georgien"
                                                    label="Georgien"
                                                />
                                                <FormRadioOption
                                                    id="birthCountry-other"
                                                    value="Other"
                                                    label="სხვა"
                                                />
                                            </RadioGroup>
                                            {!isGeorgien && (
                                                <Input
                                                    {...field}
                                                    id="birthCountry"
                                                    aria-invalid={
                                                        fieldState.invalid
                                                    }
                                                    placeholder="მაგ. Armenien"
                                                    className="mt-2 transition-colors"
                                                    onChange={(v) => {
                                                        const value =
                                                            v.target.value
                                                        field.onChange(
                                                            v.target.value
                                                        )
                                                        onValidateRomanCharacters(
                                                            {
                                                                value,
                                                                fieldName:
                                                                    'birthCountry',
                                                            }
                                                        )
                                                    }}
                                                />
                                            )}
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />
                            <Controller
                                name="nationality"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    const isGeorgisch =
                                        field.value === 'Georgisch'

                                    return (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel className="text-sm font-medium">
                                                მოქალაქეობა *
                                            </FieldLabel>
                                            <RadioGroup
                                                value={
                                                    isGeorgisch
                                                        ? 'Georgisch'
                                                        : 'Other'
                                                }
                                                onValueChange={(v) =>
                                                    field.onChange(
                                                        v === 'Georgisch'
                                                            ? 'Georgisch'
                                                            : ''
                                                    )
                                                }
                                                className="mt-2 flex flex-row gap-6"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <FormRadioOption
                                                    id="nationality-georgisch"
                                                    value="Georgisch"
                                                    label="Georgisch"
                                                />
                                                <FormRadioOption
                                                    id="nationality-other"
                                                    value="Other"
                                                    label="სხვა"
                                                />
                                            </RadioGroup>
                                            {!isGeorgisch && (
                                                <Input
                                                    {...field}
                                                    id="nationality"
                                                    aria-invalid={
                                                        fieldState.invalid
                                                    }
                                                    placeholder="მაგ. Armenisch"
                                                    className="mt-2 transition-colors"
                                                    onChange={(v) => {
                                                        const value =
                                                            v.target.value
                                                        field.onChange(
                                                            v.target.value
                                                        )
                                                        onValidateRomanCharacters(
                                                            {
                                                                value,
                                                                fieldName:
                                                                    'nationality',
                                                            }
                                                        )
                                                    }}
                                                />
                                            )}
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />
                        </div>
                    </FieldGroup>

                    {/* Address Information */}
                    <div className="border-t pt-8">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            მისამართი
                        </h3>
                        <FieldGroup>
                            <Controller
                                name="street"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="street"
                                            className="text-sm font-medium"
                                        >
                                            ქუჩა, სახლის ნომერი *
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="street"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="მაგ. Rustavelis gamziri 1"
                                            className="transition-colors"
                                            onChange={(v) => {
                                                const value = v.target.value
                                                field.onChange(v.target.value)
                                                onValidateRomanCharacters({
                                                    value,
                                                    fieldName: 'street',
                                                })
                                            }}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <Controller
                                    name="postalCode"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel
                                                htmlFor="postalCode"
                                                className="text-sm font-medium"
                                            >
                                                საფოსტო ინდექსი *
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="postalCode"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="12345"
                                                className="transition-colors"
                                                onChange={(v) => {
                                                    const value = v.target.value
                                                    field.onChange(
                                                        v.target.value
                                                    )
                                                    onValidateRomanCharacters({
                                                        value,
                                                        fieldName: 'postalCode',
                                                    })
                                                }}
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="city"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel
                                                htmlFor="city"
                                                className="text-sm font-medium"
                                            >
                                                ქალაქი *
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="city"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Tiflis"
                                                className="transition-colors"
                                                onChange={(v) => {
                                                    const value = v.target.value
                                                    field.onChange(
                                                        v.target.value
                                                    )
                                                    onValidateRomanCharacters({
                                                        value,
                                                        fieldName: 'city',
                                                    })
                                                }}
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="country"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel
                                                htmlFor="country"
                                                className="text-sm font-medium"
                                            >
                                                ქვეყანა *
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="country"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                className="transition-colors"
                                                value={'Georgien'}
                                                disabled
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>
                        </FieldGroup>
                    </div>

                    {/* Contact & Social Media Information */}
                    <div className="border-t pt-8">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            კონტაქტი და სოციალური ქსელები
                        </h3>
                        <FieldGroup>
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="phone"
                                            className="text-sm font-medium"
                                        >
                                            საფოსტო ემაილი (არასავალდებულო)
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="email"
                                            type="email"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="საფოსტო ემაილი"
                                            className="transition-colors"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="phone"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="phone"
                                            className="text-sm font-medium"
                                        >
                                            ტელეფონის ნომერი (არასავალდებულო)
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="phone"
                                            type="tel"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="+49 123 456789"
                                            className="transition-colors"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <Controller
                                    name="instagram"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel
                                                htmlFor="instagram"
                                                className="text-sm font-medium"
                                            >
                                                Instagram (არასავალდებულო)
                                            </FieldLabel>
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">
                                                    @
                                                </span>
                                                <Input
                                                    {...field}
                                                    id="instagram"
                                                    aria-invalid={
                                                        fieldState.invalid
                                                    }
                                                    placeholder="მომხმარებლის სახელი"
                                                    className="transition-colors"
                                                    onChange={(v) => {
                                                        const value =
                                                            v.target.value
                                                        field.onChange(
                                                            v.target.value
                                                        )
                                                        onValidateRomanCharacters(
                                                            {
                                                                value,
                                                                fieldName:
                                                                    'instagram',
                                                            }
                                                        )
                                                    }}
                                                />
                                            </div>
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>

                            <Controller
                                name="taxId"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="taxId"
                                            className="text-sm font-medium"
                                        >
                                            საგადასახადო იდენტიფიკაციის ნომერი
                                            (არასავალდებულო)
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="taxId"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="საგადასახადო იდენტიფიკაციის ნომერი"
                                            className="transition-colors"
                                            onChange={(v) => {
                                                const value = v.target.value
                                                field.onChange(v.target.value)
                                                onValidateRomanCharacters({
                                                    value,
                                                    fieldName: 'taxId',
                                                })
                                            }}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </div>

                    <div className="border-t pt-8">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            პროფილის ფოტო
                        </h3>
                        <FieldGroup>
                            <Controller
                                name="foto"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="foto">
                                            ფოტოს ატვირთვა *
                                        </FieldLabel>
                                        <FileUpload
                                            id="foto"
                                            accept=".png,.jpg,.jpeg"
                                            value={field.value}
                                            onChange={(files) => {
                                                if (files === null) {
                                                    field.onChange(undefined)
                                                    setBase64String(null)
                                                    return
                                                }
                                                const file = Array.isArray(
                                                    files
                                                )
                                                    ? files[0]
                                                    : files

                                                const reader = new FileReader()
                                                reader.readAsDataURL(
                                                    file as File
                                                )
                                                reader.onload = () => {
                                                    const base64Encoded =
                                                        reader.result as string
                                                    setBase64String(
                                                        base64Encoded
                                                    )
                                                }

                                                reader.onerror = function (
                                                    error
                                                ) {
                                                    console.log(
                                                        'Error: ',
                                                        error
                                                    )
                                                }
                                                field.onChange(file)
                                            }}
                                            placeholder="აირჩიეთ ფოტო"
                                            required
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                        {base64String !== null &&
                                            field.value instanceof File && (
                                                <ImageCropper
                                                    base64Image={base64String}
                                                    originalFile={field.value}
                                                    onDismiss={() =>
                                                        setBase64String(null)
                                                    }
                                                    onCropComplete={(
                                                        cropped
                                                    ) => {
                                                        form.setValue(
                                                            'foto',
                                                            cropped,
                                                            {
                                                                shouldDirty: true,
                                                                shouldTouch: true,
                                                                shouldValidate: true,
                                                            }
                                                        )
                                                        setBase64String(null)
                                                    }}
                                                />
                                            )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </div>
                    <div>
                        <h2 className="mb-4 text-lg font-semibold">
                            სწავლა და კვალიფიკაცია
                        </h2>
                        <FieldGroup>
                            <Controller
                                name="semesterBreakFrom"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="semesterBreakFrom">
                                            არდადეგების დასაწყისი
                                            (არასავალდებულო)
                                        </FieldLabel>
                                        <SafariInputDate
                                            field={field}
                                            id="semesterBreakFrom"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="semesterBreakTo"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="semesterBreakTo">
                                            არდადეგები დასასრული
                                            (არასავალდებულო)
                                        </FieldLabel>
                                        <SafariInputDate
                                            field={field}
                                            id="semesterBreakTo"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="university">
                                        უნივერსიტეტი (არასავალდებულო)
                                    </FieldLabel>
                                    <NativeSelect
                                        id="university"
                                        className="w-full"
                                        value={universitySelectValue}
                                        onChange={(event) =>
                                            onUniversitySelectChange(
                                                event.target.value
                                            )
                                        }
                                        aria-invalid={
                                            !!form.formState.errors.university
                                        }
                                    >
                                        <NativeSelectOption value="" disabled>
                                            აირჩიეთ უნივერსიტეტი
                                        </NativeSelectOption>
                                        {universities.map((university) => (
                                            <NativeSelectOption
                                                key={university.id}
                                                value={university.id}
                                            >
                                                {university.name}
                                            </NativeSelectOption>
                                        ))}
                                        <NativeSelectOption
                                            value={UNIVERSITY_NOT_IN_LIST}
                                        >
                                            ჩემი უნივერსიტეტი სიაში არ არის
                                        </NativeSelectOption>
                                    </NativeSelect>
                                    {showCustomUniversity && (
                                        <Controller
                                            name="university"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    className="mt-2"
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <Input
                                                        {...field}
                                                        id="university-custom"
                                                        aria-invalid={
                                                            fieldState.invalid
                                                        }
                                                        placeholder="უნივერსიტეტის სახელი"
                                                        onChange={(v) => {
                                                            const value =
                                                                v.target.value
                                                            field.onChange(
                                                                v.target.value
                                                            )
                                                            onValidateRomanCharacters(
                                                                {
                                                                    value,
                                                                    fieldName:
                                                                        'university',
                                                                }
                                                            )
                                                        }}
                                                    />
                                                    {fieldState.invalid && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
                                                        />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                    )}
                                    {!showCustomUniversity &&
                                        form.formState.errors.university && (
                                            <FieldError
                                                errors={[
                                                    form.formState.errors
                                                        .university,
                                                ]}
                                            />
                                        )}
                                </Field>
                                <Controller
                                    name="studySubject"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel htmlFor="studySubject">
                                                სასწავლო სპეციალობა
                                                (არასავალდებულო)
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="studySubject"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="სასწავლო სპეციალობა"
                                                onChange={(v) => {
                                                    const value = v.target.value
                                                    field.onChange(
                                                        v.target.value
                                                    )
                                                    onValidateRomanCharacters({
                                                        value,
                                                        fieldName:
                                                            'studySubject',
                                                    })
                                                }}
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>
                            <Controller
                                name="germanLevel"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>
                                            გერმანულის დონე (არასავალდებულო)
                                        </FieldLabel>
                                        <RadioGroup
                                            value={field.value ?? ''}
                                            onValueChange={field.onChange}
                                            className="flex flex-row flex-wrap gap-4"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            {['A1', 'A2', 'B1', 'B2', 'C1'].map(
                                                (level) => (
                                                    <FormRadioOption
                                                        key={level}
                                                        id={`german-${level}`}
                                                        value={level}
                                                        label={level}
                                                    />
                                                )
                                            )}
                                        </RadioGroup>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="otherLanguages"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="otherLanguages">
                                            სხვა ენების ცოდნა / ენის დონე
                                            (არასავალდებულო)
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="otherLanguages"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="მაგ. Englisch B2, Französisch A1"
                                            onChange={(v) => {
                                                const value = v.target.value
                                                field.onChange(v.target.value)
                                                onValidateRomanCharacters({
                                                    value,
                                                    fieldName: 'otherLanguages',
                                                })
                                            }}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="driverLicense"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>
                                            მართვის მოწმობა (არასავალდებულო)
                                        </FieldLabel>
                                        <RadioGroup
                                            value={booleanRadioGroupValue(
                                                field.value
                                            )}
                                            onValueChange={(v) =>
                                                field.onChange(v === 'true')
                                            }
                                            className="flex flex-row gap-4"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            <FormRadioOption
                                                id="driver-license-yes"
                                                value="true"
                                                label="დიახ"
                                            />
                                            <FormRadioOption
                                                id="driver-license-no"
                                                value="false"
                                                label="არა"
                                            />
                                        </RadioGroup>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="canRideBike"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>
                                            შეგიძლიათ ველოსიპედის ტარება?
                                            (არასავალდებულო)
                                        </FieldLabel>
                                        <RadioGroup
                                            value={booleanRadioGroupValue(
                                                field.value
                                            )}
                                            onValueChange={(v) =>
                                                field.onChange(v === 'true')
                                            }
                                            className="flex flex-row gap-4"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            <FormRadioOption
                                                id="bike-yes"
                                                value="true"
                                                label="დიახ"
                                            />
                                            <FormRadioOption
                                                id="bike-no"
                                                value="false"
                                                label="არა"
                                            />
                                        </RadioGroup>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="shiftWork"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>
                                            მზადყოფნა ცვლებში მუშაობისთვის
                                            (არასავალდებულო)
                                        </FieldLabel>
                                        <RadioGroup
                                            value={booleanRadioGroupValue(
                                                field.value
                                            )}
                                            onValueChange={(v) =>
                                                field.onChange(v === 'true')
                                            }
                                            className="flex flex-row gap-4"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            <FormRadioOption
                                                id="shift-yes"
                                                value="true"
                                                label="დიახ"
                                            />
                                            <FormRadioOption
                                                id="shift-no"
                                                value="false"
                                                label="არა"
                                            />
                                        </RadioGroup>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </div>
                    <div>
                        <h2
                            className="mb-4 text-lg font-semibold"
                            title="ორჯერ დააჭირეთ ტესტური მონაცემების შესავსებად"
                        >
                            ჯანმრთელობა და პირადი მონაცემები
                        </h2>
                        <FieldGroup>
                            <Controller
                                name="healthRestrictions"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="healthRestrictions">
                                            ჯანმრთელობის შეზღუდვები თუ არის
                                            (არასავალდებულო)
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="healthRestrictions"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="მაგ. Rückenschmerzen, Atemwegserkrankungen"
                                            onChange={(v) => {
                                                const value = v.target.value
                                                field.onChange(v.target.value)
                                                onValidateRomanCharacters({
                                                    value,
                                                    fieldName:
                                                        'healthRestrictions',
                                                })
                                            }}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="allergies"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="allergies">
                                            ალერგიები (არასავალდებულო)
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="allergies"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="მაგ. Honig, Planzen, etc."
                                            onChange={(v) => {
                                                const value = v.target.value
                                                field.onChange(v.target.value)
                                                onValidateRomanCharacters({
                                                    value,
                                                    fieldName: 'allergies',
                                                })
                                            }}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Controller
                                    name="clothingSize"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel>
                                                ტანსაცმლის ზომა (არასავალდებულო)
                                            </FieldLabel>
                                            <RadioGroup
                                                value={field.value ?? ''}
                                                onValueChange={field.onChange}
                                                className="flex flex-row flex-wrap gap-4"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                {[
                                                    'XS',
                                                    'S',
                                                    'M',
                                                    'L',
                                                    'XL',
                                                    'XXL',
                                                ].map((size) => (
                                                    <FormRadioOption
                                                        key={size}
                                                        id={`clothingSize-${size}`}
                                                        value={size}
                                                        label={size}
                                                    />
                                                ))}
                                            </RadioGroup>
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="shoeSize"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel>
                                                ფეხსაცმლის ზომა (არასავალდებულო)
                                            </FieldLabel>
                                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                                {shoeSizeOptions.map((size) => {
                                                    const id = `shoeSize-${size}`
                                                    const selected = (
                                                        field.value ?? []
                                                    ).includes(size)

                                                    return (
                                                        <div
                                                            key={size}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Checkbox
                                                                id={id}
                                                                checked={
                                                                    selected
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) => {
                                                                    const current =
                                                                        field.value ??
                                                                        []
                                                                    if (
                                                                        checked
                                                                    ) {
                                                                        field.onChange(
                                                                            [
                                                                                ...current,
                                                                                size,
                                                                            ]
                                                                        )
                                                                    } else {
                                                                        field.onChange(
                                                                            current.filter(
                                                                                (
                                                                                    value
                                                                                ) =>
                                                                                    value !==
                                                                                    size
                                                                            )
                                                                        )
                                                                    }
                                                                }}
                                                            />
                                                            <label
                                                                htmlFor={id}
                                                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                {size}
                                                            </label>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>
                        </FieldGroup>
                    </div>
                    <div>
                        <h2 className="mb-4 text-lg font-semibold">
                            ყოფნა გერმანიაში
                        </h2>
                        <FieldGroup>
                            <Controller
                                name="hasBeenInGermanyBefore"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>
                                            ყოფნა გერმანიაში (არასავალდებულო)
                                        </FieldLabel>
                                        <RadioGroup
                                            value={booleanRadioGroupValue(
                                                field.value
                                            )}
                                            onValueChange={(v) =>
                                                field.onChange(v === 'true')
                                            }
                                            className="flex flex-row gap-4"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            <FormRadioOption
                                                id="germany-stay-yes"
                                                value="true"
                                                label="დიახ"
                                            />
                                            <FormRadioOption
                                                id="germany-stay-no"
                                                value="false"
                                                label="არა"
                                            />
                                        </RadioGroup>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            {hasBeenInGermanyBefore && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <Controller
                                        name="previousStayPlace"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field
                                                data-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <FieldLabel htmlFor="previousStayPlace">
                                                    თუ კი, სად (არასავალდებულო)
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="previousStayPlace"
                                                    aria-invalid={
                                                        fieldState.invalid
                                                    }
                                                    placeholder="ქალაქი/რეგიონი გერმანიაში"
                                                    onChange={(v) => {
                                                        const value =
                                                            v.target.value
                                                        field.onChange(
                                                            v.target.value
                                                        )
                                                        onValidateRomanCharacters(
                                                            {
                                                                value,
                                                                fieldName:
                                                                    'previousStayPlace',
                                                            }
                                                        )
                                                    }}
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError
                                                        errors={[
                                                            fieldState.error,
                                                        ]}
                                                    />
                                                )}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name="previousStayPeriodFrom"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field
                                                data-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <FieldLabel htmlFor="previousStayPeriodFrom">
                                                    პერიოდის დასაწყისი
                                                    (არასავალდებულო)
                                                </FieldLabel>
                                                <SafariInputDate
                                                    field={field}
                                                    id="previousStayPeriodFrom"
                                                    aria-invalid={
                                                        fieldState.invalid
                                                    }
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError
                                                        errors={[
                                                            fieldState.error,
                                                        ]}
                                                    />
                                                )}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name="previousStayPeriodTo"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field
                                                data-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <FieldLabel htmlFor="previousStayPeriodTo">
                                                    პერიოდის დასასრული
                                                    (არასავალდებულო)
                                                </FieldLabel>
                                                <SafariInputDate
                                                    field={field}
                                                    id="previousStayPeriodTo"
                                                    aria-invalid={
                                                        fieldState.invalid
                                                    }
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError
                                                        errors={[
                                                            fieldState.error,
                                                        ]}
                                                    />
                                                )}
                                            </Field>
                                        )}
                                    />
                                </div>
                            )}
                        </FieldGroup>
                    </div>
                    <div>
                        <h2 className="mb-4 text-lg font-semibold">
                            საგანგებო საკონტაქტო პირი
                        </h2>
                        <FieldGroup>
                            <Controller
                                name="emergencyContactName"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="emergencyContactName">
                                            საგანგებო საკონტაქტო პირი *
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="emergencyContactName"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="საკონტაქტო პირის სრული სახელი"
                                            onChange={(v) => {
                                                const value = v.target.value
                                                field.onChange(v.target.value)
                                                onValidateRomanCharacters({
                                                    value,
                                                    fieldName:
                                                        'emergencyContactName',
                                                })
                                            }}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="emergencyPhone"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="emergencyPhone">
                                            საგანგებო ტელეფონის ნომერი *
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="emergencyPhone"
                                            type="tel"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="+49 XXX XXXXXXX"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </div>
                    <div>
                        <FieldGroup>
                            <Controller
                                name="workSector"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>
                                            სასურველი სამუშაო სფერო
                                        </FieldLabel>
                                        <div className="flex flex-col gap-3">
                                            {workSectorOptions.map((option) => {
                                                const id = `work-sector-${option.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`
                                                const selected =
                                                    field.value.includes(option)

                                                return (
                                                    <div
                                                        key={option}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Checkbox
                                                            id={id}
                                                            checked={selected}
                                                            onCheckedChange={(
                                                                checked
                                                            ) => {
                                                                if (checked) {
                                                                    field.onChange(
                                                                        [
                                                                            ...field.value,
                                                                            option,
                                                                        ]
                                                                    )
                                                                } else {
                                                                    field.onChange(
                                                                        field.value.filter(
                                                                            (
                                                                                value
                                                                            ) =>
                                                                                value !==
                                                                                option
                                                                        )
                                                                    )
                                                                }
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor={id}
                                                            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            {
                                                                workSectorLabels[
                                                                    option
                                                                ]
                                                            }
                                                        </label>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </div>
                </div>
                <div className="mt-8 border-t pt-8">
                    <Controller
                        name="acceptPrivacyPolicy"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="acceptPrivacyPolicy"
                                        checked={field.value === true}
                                        onCheckedChange={(checked) => {
                                            field.onChange(checked === true)
                                        }}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <label
                                        htmlFor="acceptPrivacyPolicy"
                                        className="text-muted-foreground text-sm leading-relaxed"
                                    >
                                        ვეთანხმები Lazari Ways-ის{' '}
                                        <Link
                                            href="/privacy-policy"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-foreground hover:text-foreground/80 underline underline-offset-4"
                                        >
                                            კონფიდენციალურობის პოლიტიკას
                                        </Link>
                                        .
                                    </label>
                                </div>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </div>

                <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row">
                    <Button
                        type="submit"
                        size={'lg'}
                        disabled={
                            isSubmitting || !isDirty || !acceptPrivacyPolicy
                        }
                    >
                        {isSubmitting ? 'იგზავნება...' : 'გაგზავნა'}
                    </Button>
                </div>
            </form>

            <Dialog
                open={isSubmissionErrorOpen}
                onOpenChange={setIsSubmissionErrorOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <XCircle
                                className="text-destructive size-6"
                                aria-hidden
                            />
                            <DialogTitle>გაგზავნა ვერ მოხერხდა</DialogTitle>
                        </div>
                        <DialogDescription>
                            განაცხადის გაგზავნისას მოხდა შეცდომა. გთხოვთ,
                            დაუკავშირდეთ ანას ან ქრისტის.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => setIsSubmissionErrorOpen(false)}
                        >
                            დახურვა
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
