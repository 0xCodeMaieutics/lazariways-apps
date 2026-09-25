'use client'

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc/react'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
    NativeSelect,
    NativeSelectOption,
} from '@workspace/ui/components/native-select'
import { Loader2 } from 'lucide-react'
import { parseHoursMinutesToSeconds } from '@/utils/format-duration'

const TEXTAREA_CLASSNAME =
    'min-h-24 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40'

const passCooldownSchema = z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Use HH:MM format')
    .refine((value) => {
        const minutes = Number(value.split(':')[1])
        return minutes >= 0 && minutes < 60
    }, 'Minutes must be between 00 and 59')

const examSchema = z
    .object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(1, 'Description is required'),
        estimatedTimeInMinutes: z.number().int().min(1).optional(),
        minimumCorrectAnswerCount: z.number().int().min(1),
        minimumPassedCount: z.number().int().min(1),
        passCooldown: passCooldownSchema,
        enabled: z.boolean(),
        isAlwaysUnlocked: z.boolean(),
        unlockedByExamId: z.string(),
    })
    .superRefine((data, ctx) => {
        if (data.isAlwaysUnlocked && data.unlockedByExamId !== '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'An always unlocked exam cannot have an unlocker',
                path: ['unlockedByExamId'],
            })
        }
    })

type ExamFormValues = z.infer<typeof examSchema>

export type UnlockableExamOption = {
    id: string
    title: string
    order: number
    isAlwaysUnlocked: boolean
}

export function ExamForm({
    topicId,
    lastOrder,
    examId,
    unlockableExams,
    defaultValues,
}: {
    topicId: string
    lastOrder?: number
    examId?: string
    unlockableExams: UnlockableExamOption[]
    defaultValues?: Partial<ExamFormValues>
}) {
    const router = useRouter()
    const isEdit = !!examId
    const examsUrl = `/topics/${topicId}/exams`
    const trpc = useTRPC()

    const form = useForm<ExamFormValues>({
        resolver: standardSchemaResolver(examSchema),
        defaultValues: {
            title: '',
            description: '',
            estimatedTimeInMinutes: undefined,
            minimumCorrectAnswerCount: 1,
            minimumPassedCount: 1,
            passCooldown: '04:00',
            enabled: false,
            isAlwaysUnlocked: false,
            unlockedByExamId: '',
            ...defaultValues,
        },
    })

    const selectableUnlockableExams = unlockableExams.filter(
        (exam) => exam.id !== examId
    )

    const createMutation = useMutation(
        trpc.admin.exams.create.mutationOptions({
            onSuccess: () => {
                router.push(examsUrl)
                router.refresh()
            },
        })
    )

    const updateMutation = useMutation(
        trpc.admin.exams.update.mutationOptions({
            onSuccess: () => {
                router.push(examsUrl)
                router.refresh()
            },
        })
    )

    const onSubmit = (data: ExamFormValues) => {
        const { passCooldown, unlockedByExamId, ...rest } = data
        const payload = {
            ...rest,
            estimatedTimeInMinutes:
                data.estimatedTimeInMinutes && data.estimatedTimeInMinutes > 0
                    ? data.estimatedTimeInMinutes
                    : undefined,
            waitUntilPassAllowedInSeconds:
                parseHoursMinutesToSeconds(passCooldown),
            unlockedByExamId:
                data.isAlwaysUnlocked || unlockedByExamId === ''
                    ? null
                    : unlockedByExamId,
            topicId,
        }
        if (isEdit) {
            updateMutation.mutate({ ...payload, id: examId })
        } else {
            if (lastOrder === undefined) return
            createMutation.mutate({ ...payload, order: lastOrder })
        }
    }

    const { control, register, formState, setValue } = form
    const isAlwaysUnlocked = useWatch({ control, name: 'isAlwaysUnlocked' })
    const isPending = createMutation.isPending || updateMutation.isPending
    const error =
        (createMutation.error as { message?: string })?.message ||
        (updateMutation.error as { message?: string })?.message

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isEdit ? 'Edit exam' : 'Create exam'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-6"
                >
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="title">Title</FieldLabel>
                            <Input
                                id="title"
                                placeholder="Exam title"
                                disabled={isPending}
                                {...register('title')}
                            />
                            <FieldError errors={[formState.errors.title]} />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="description">
                                Description
                            </FieldLabel>
                            <textarea
                                id="description"
                                rows={4}
                                className={TEXTAREA_CLASSNAME}
                                placeholder="Exam description"
                                disabled={isPending}
                                {...register('description')}
                            />
                            <FieldError
                                errors={[formState.errors.description]}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="estimatedTimeInMinutes">
                                Estimated time (minutes)
                            </FieldLabel>
                            <Controller
                                name="estimatedTimeInMinutes"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input
                                            id="estimatedTimeInMinutes"
                                            type="number"
                                            min={1}
                                            placeholder="Optional"
                                            aria-invalid={fieldState.invalid}
                                            value={field.value ?? ''}
                                            onChange={(event) => {
                                                const raw = event.target.value
                                                if (raw === '') {
                                                    field.onChange(undefined)
                                                    return
                                                }
                                                const parsed = Number(raw)
                                                field.onChange(
                                                    Number.isFinite(parsed)
                                                        ? parsed
                                                        : undefined
                                                )
                                            }}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            ref={field.ref}
                                            disabled={isPending}
                                        />
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    </>
                                )}
                            />
                        </Field>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="minimumCorrectAnswerCount">
                                    Minimum correct answers
                                </FieldLabel>
                                <Controller
                                    name="minimumCorrectAnswerCount"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Input
                                                id="minimumCorrectAnswerCount"
                                                type="number"
                                                min={1}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                value={field.value ?? ''}
                                                onChange={(event) => {
                                                    const raw =
                                                        event.target.value
                                                    if (raw === '') {
                                                        field.onChange(1)
                                                        return
                                                    }
                                                    const parsed = Number(raw)
                                                    field.onChange(
                                                        Number.isFinite(parsed)
                                                            ? parsed
                                                            : 1
                                                    )
                                                }}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                ref={field.ref}
                                                disabled={isPending}
                                            />
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        </>
                                    )}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="minimumPassedCount">
                                    Minimum passed count
                                </FieldLabel>
                                <Controller
                                    name="minimumPassedCount"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Input
                                                id="minimumPassedCount"
                                                type="number"
                                                min={1}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                value={field.value ?? ''}
                                                onChange={(event) => {
                                                    const raw =
                                                        event.target.value
                                                    if (raw === '') {
                                                        field.onChange(1)
                                                        return
                                                    }
                                                    const parsed = Number(raw)
                                                    field.onChange(
                                                        Number.isFinite(parsed)
                                                            ? parsed
                                                            : 1
                                                    )
                                                }}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                ref={field.ref}
                                                disabled={isPending}
                                            />
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        </>
                                    )}
                                />
                            </Field>
                        </div>
                        <Field>
                            <FieldLabel htmlFor="passCooldown">
                                Pass cooldown (HH:MM)
                            </FieldLabel>
                            <Input
                                id="passCooldown"
                                placeholder="04:00"
                                className="tabular-nums"
                                disabled={isPending}
                                {...register('passCooldown')}
                            />
                            <FieldError
                                errors={[formState.errors.passCooldown]}
                            />
                        </Field>
                        <Field>
                            <Controller
                                name="isAlwaysUnlocked"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="isAlwaysUnlocked"
                                                checked={field.value}
                                                onCheckedChange={(checked) => {
                                                    field.onChange(
                                                        checked === true
                                                    )
                                                    if (checked === true) {
                                                        setValue(
                                                            'unlockedByExamId',
                                                            ''
                                                        )
                                                    }
                                                }}
                                                disabled={isPending}
                                            />
                                            <Label htmlFor="isAlwaysUnlocked">
                                                Always unlocked
                                            </Label>
                                        </div>
                                        <p className="text-muted-foreground mt-2 text-xs">
                                            Learners who can open the topic can
                                            take this exam without an Unlocked
                                            exam grant. Cannot have an unlocker.
                                        </p>
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    </>
                                )}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="unlockedByExamId">
                                Unlocked by
                            </FieldLabel>
                            <Controller
                                name="unlockedByExamId"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <NativeSelect
                                            id="unlockedByExamId"
                                            className="w-full"
                                            value={field.value}
                                            onChange={(event) =>
                                                field.onChange(
                                                    event.target.value
                                                )
                                            }
                                            onBlur={field.onBlur}
                                            disabled={
                                                isPending || isAlwaysUnlocked
                                            }
                                            aria-invalid={fieldState.invalid}
                                        >
                                            <NativeSelectOption value="">
                                                None
                                            </NativeSelectOption>
                                            {selectableUnlockableExams.map(
                                                (exam) => (
                                                    <NativeSelectOption
                                                        key={exam.id}
                                                        value={exam.id}
                                                    >
                                                        {exam.order + 1}.{' '}
                                                        {exam.title}
                                                        {exam.isAlwaysUnlocked
                                                            ? ' (always unlocked)'
                                                            : ''}
                                                    </NativeSelectOption>
                                                )
                                            )}
                                        </NativeSelect>
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    </>
                                )}
                            />
                            <p className="text-muted-foreground mt-2 text-xs">
                                Learners unlock this exam after fully passing
                                the selected exam. Leave empty if it is always
                                unlocked or not yet attached.
                            </p>
                        </Field>
                        <Field>
                            <Controller
                                name="enabled"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="enabled"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isPending}
                                            />
                                            <Label htmlFor="enabled">
                                                Enable exam
                                            </Label>
                                        </div>
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    </>
                                )}
                            />
                        </Field>
                    </FieldGroup>
                    {error && (
                        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                            {error}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Saving...
                                </>
                            ) : isEdit ? (
                                'Save changes'
                            ) : (
                                'Create exam'
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(examsUrl)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
