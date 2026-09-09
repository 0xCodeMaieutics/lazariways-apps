'use client'

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Controller, useForm } from 'react-hook-form'
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

const examSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    estimatedTimeInMinutes: z.number().int().min(1).optional(),
    minimumCorrectAnswerCount: z.number().int().min(1),
    minimumPassedCount: z.number().int().min(1),
    passCooldown: passCooldownSchema,
    enable: z.boolean(),
    unlocksExamIds: z.array(z.string()),
})

type ExamFormValues = z.infer<typeof examSchema>

export type UnlockableExamOption = { id: string; title: string; order: number }

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
            enable: false,
            unlocksExamIds: [],
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
        const { passCooldown, ...rest } = data
        const payload = {
            ...rest,
            estimatedTimeInMinutes:
                data.estimatedTimeInMinutes && data.estimatedTimeInMinutes > 0
                    ? data.estimatedTimeInMinutes
                    : undefined,
            waitUntilPassAllowedInSeconds:
                parseHoursMinutesToSeconds(passCooldown),
            topicId,
        }
        if (isEdit) {
            updateMutation.mutate({ ...payload, id: examId })
        } else {
            if (lastOrder === undefined) return
            createMutation.mutate({ ...payload, order: lastOrder })
        }
    }

    const { control, register, formState } = form
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
                            <FieldLabel>Unlocks exams</FieldLabel>
                            {selectableUnlockableExams.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    No other enabled exams in this topic yet.
                                </p>
                            ) : (
                                <Controller
                                    name="unlocksExamIds"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <div className="space-y-2">
                                                {selectableUnlockableExams.map(
                                                    (exam) => {
                                                        const checked =
                                                            field.value.includes(
                                                                exam.id
                                                            )
                                                        return (
                                                            <div
                                                                key={exam.id}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <Checkbox
                                                                    id={`unlocks-${exam.id}`}
                                                                    checked={
                                                                        checked
                                                                    }
                                                                    onCheckedChange={(
                                                                        isChecked
                                                                    ) => {
                                                                        if (
                                                                            isChecked
                                                                        ) {
                                                                            field.onChange(
                                                                                [
                                                                                    ...field.value,
                                                                                    exam.id,
                                                                                ]
                                                                            )
                                                                            return
                                                                        }
                                                                        field.onChange(
                                                                            field.value.filter(
                                                                                (
                                                                                    id
                                                                                ) =>
                                                                                    id !==
                                                                                    exam.id
                                                                            )
                                                                        )
                                                                    }}
                                                                    disabled={
                                                                        isPending
                                                                    }
                                                                />
                                                                <Label
                                                                    htmlFor={`unlocks-${exam.id}`}
                                                                >
                                                                    {exam.order +
                                                                        1}
                                                                    .{' '}
                                                                    {exam.title}
                                                                </Label>
                                                            </div>
                                                        )
                                                    }
                                                )}
                                            </div>
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        </>
                                    )}
                                />
                            )}
                            <p className="text-muted-foreground mt-2 text-xs">
                                Learners unlock these exams after fully passing
                                this one.
                            </p>
                        </Field>
                        <Field>
                            <Controller
                                name="enable"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="enable"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isPending}
                                            />
                                            <Label htmlFor="enable">
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
