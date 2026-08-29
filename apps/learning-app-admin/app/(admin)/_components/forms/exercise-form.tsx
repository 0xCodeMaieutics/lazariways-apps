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
    FieldDescription,
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
import { Loader2, Volume2 } from 'lucide-react'

const TEXTAREA_CLASSNAME =
    'min-h-24 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40'

const EXERCISE_TYPES = [
    'CHOOSE_FROM_AUDIO',
    'INPUT_FROM_AUDIO',
    'CHOOSE_FROM_TEXT',
    'INPUT_FROM_TEXT',
    'INPUT_SENTENCE_FROM_TEXT',
    'CHOOSE_MATCHING_PATTERNS',
] as const

const exerciseSchema = z
    .object({
        type: z.enum(EXERCISE_TYPES),
        prompt: z.string().optional(),
        text: z.string().optional(),
        order: z.coerce.number().int().min(0),
        audioUrl: z.string().optional(),
        slowAudioUrl: z.string().optional(),
        optionsText: z.string().optional(),
        correctOptionIndexText: z.string().optional(),
        allowsMultipleCorrectOptions: z.boolean().optional(),
        correctInputsText: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        const options = (data.optionsText ?? '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
        const needsOptions =
            data.type === 'CHOOSE_FROM_AUDIO' ||
            data.type === 'CHOOSE_FROM_TEXT' ||
            data.type === 'CHOOSE_MATCHING_PATTERNS'
        const correctIndices = (data.correctOptionIndexText ?? '')
            .split(',')
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !Number.isNaN(n))
        const correctInputs = (data.correctInputsText ?? '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
        const needsCorrectInputs =
            data.type === 'INPUT_FROM_TEXT' ||
            data.type === 'INPUT_FROM_AUDIO' ||
            data.type === 'INPUT_SENTENCE_FROM_TEXT'

        if (needsOptions && options.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'At least one option is required (one per line)',
                path: ['optionsText'],
            })
        }
        if (needsOptions && correctIndices.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    'Enter at least one correct option index (0-based, comma-separated)',
                path: ['correctOptionIndexText'],
            })
        }
        if (
            needsOptions &&
            correctIndices.some((i) => i < 0 || i >= options.length)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Correct option indices must be between 0 and ${options.length - 1}`,
                path: ['correctOptionIndexText'],
            })
        }
        if (needsCorrectInputs && correctInputs.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    'At least one correct input is required (one per line)',
                path: ['correctInputsText'],
            })
        }
    })

type ExerciseFormInput = z.input<typeof exerciseSchema>
export type ExerciseFormValues = z.output<typeof exerciseSchema>

const EXERCISE_TYPE_LABELS: Record<(typeof EXERCISE_TYPES)[number], string> = {
    CHOOSE_FROM_AUDIO: 'Choose from audio',
    INPUT_FROM_AUDIO: 'Input from audio',
    CHOOSE_FROM_TEXT: 'Choose from text',
    INPUT_FROM_TEXT: 'Input from text',
    INPUT_SENTENCE_FROM_TEXT: 'Input sentence from text',
    CHOOSE_MATCHING_PATTERNS: 'Choose matching patterns',
}

export function ExerciseForm({
    programId,
    examId,
    defaultValues,
    exerciseId,
}: {
    programId: string
    examId: string
    defaultValues?: Partial<ExerciseFormValues>
    exerciseId?: string
}) {
    const router = useRouter()
    const isEdit = !!exerciseId
    const backUrl = `/topics/${programId}/exams/${examId}/exercises`
    const trpc = useTRPC()

    const form = useForm<ExerciseFormInput, unknown, ExerciseFormValues>({
        resolver: standardSchemaResolver(exerciseSchema),
        defaultValues: {
            type: 'CHOOSE_FROM_TEXT',
            prompt: '',
            text: '',
            order: 0,
            audioUrl: '',
            slowAudioUrl: '',
            optionsText: '',
            correctOptionIndexText: '',
            allowsMultipleCorrectOptions: false,
            correctInputsText: '',
            ...defaultValues,
        },
    })

    const { control, register, formState, setValue, getValues } = form
    const watchedType = useWatch({ control, name: 'type' })
    const watchedText = useWatch({ control, name: 'text' })

    const needsAudio =
        watchedType === 'CHOOSE_FROM_AUDIO' ||
        watchedType === 'INPUT_FROM_AUDIO'
    const needsOptions =
        watchedType === 'CHOOSE_FROM_AUDIO' ||
        watchedType === 'CHOOSE_FROM_TEXT' ||
        watchedType === 'CHOOSE_MATCHING_PATTERNS'
    const needsCorrectInputs =
        watchedType === 'INPUT_FROM_TEXT' ||
        watchedType === 'INPUT_FROM_AUDIO' ||
        watchedType === 'INPUT_SENTENCE_FROM_TEXT'

    const generateAudioMutation = useMutation(
        trpc.admin.audio.generate.mutationOptions({
            onSuccess: (data) => {
                setValue('audioUrl', data.audioUrl, {
                    shouldDirty: true,
                    shouldValidate: true,
                })
            },
        })
    )

    const handleGenerateAudio = () => {
        const text = getValues('text')
        if (!text?.trim() || !exerciseId) return
        generateAudioMutation.mutate({ text, exerciseId })
    }

    const createMutation = useMutation(
        trpc.admin.exercises.create.mutationOptions({
            onSuccess: (data) => {
                router.push(
                    `/topics/${programId}/exams/${examId}/exercises/${data.id}/edit`
                )
                router.refresh()
            },
        })
    )

    const updateMutation = useMutation(
        trpc.admin.exercises.update.mutationOptions({
            onSuccess: () => {
                router.push(backUrl)
                router.refresh()
            },
        })
    )

    const onSubmit = (data: ExerciseFormValues) => {
        const options = (data.optionsText ?? '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
        const correctOptionIndex = (data.correctOptionIndexText ?? '')
            .split(',')
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !Number.isNaN(n))
        const correctInputs = (data.correctInputsText ?? '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)

        if (isEdit && exerciseId) {
            updateMutation.mutate({
                id: exerciseId,
                examId,
                type: data.type,
                prompt: data.prompt || undefined,
                text: data.text || undefined,
                order: data.order,
                audioUrl: data.audioUrl || undefined,
                slowAudioUrl: data.slowAudioUrl || undefined,
                options,
                correctOptionIndex,
                allowsMultipleCorrectOptions: data.allowsMultipleCorrectOptions,
                correctInputs,
            })
        } else {
            createMutation.mutate({
                examId,
                type: data.type,
                prompt: data.prompt || undefined,
                text: data.text || undefined,
                order: data.order,
                audioUrl: data.audioUrl || undefined,
                slowAudioUrl: data.slowAudioUrl || undefined,
                options,
                correctOptionIndex,
                allowsMultipleCorrectOptions: data.allowsMultipleCorrectOptions,
                correctInputs,
            })
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending
    const error =
        (createMutation.error as { message?: string })?.message ||
        (updateMutation.error as { message?: string })?.message

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>
                    {isEdit ? 'Edit exercise' : 'Create exercise'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-6"
                >
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="type">Type</FieldLabel>
                            <Controller
                                name="type"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <NativeSelect
                                            id="type"
                                            className="w-full"
                                            value={field.value}
                                            onChange={(event) =>
                                                field.onChange(
                                                    event.target.value
                                                )
                                            }
                                            onBlur={field.onBlur}
                                            disabled={isPending}
                                            aria-invalid={fieldState.invalid}
                                        >
                                            {EXERCISE_TYPES.map((type) => (
                                                <NativeSelectOption
                                                    key={type}
                                                    value={type}
                                                >
                                                    {EXERCISE_TYPE_LABELS[type]}
                                                </NativeSelectOption>
                                            ))}
                                        </NativeSelect>
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    </>
                                )}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="prompt">Prompt</FieldLabel>
                            <Input
                                id="prompt"
                                placeholder="e.g. რა გესმის?"
                                disabled={isPending}
                                {...register('prompt')}
                            />
                            <FieldError errors={[formState.errors.prompt]} />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="text">Text</FieldLabel>
                            <Input
                                id="text"
                                placeholder="Word or sentence to display"
                                disabled={isPending}
                                {...register('text')}
                            />
                            <FieldDescription>
                                Used for text-based types (CHOOSE_FROM_TEXT,
                                INPUT_FROM_TEXT, etc.)
                            </FieldDescription>
                            <FieldError errors={[formState.errors.text]} />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="order">Order</FieldLabel>
                            <Input
                                id="order"
                                type="number"
                                min={0}
                                disabled={isPending}
                                {...register('order')}
                            />
                            <FieldError errors={[formState.errors.order]} />
                        </Field>
                        {needsAudio ? (
                            <>
                                <Field>
                                    <FieldLabel htmlFor="audioUrl">
                                        Audio URL
                                    </FieldLabel>
                                    <div className="flex gap-2">
                                        <Input
                                            id="audioUrl"
                                            placeholder="/audio/greetings/hallo.mp3"
                                            disabled={
                                                isPending ||
                                                generateAudioMutation.isPending
                                            }
                                            {...register('audioUrl')}
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            disabled={
                                                isPending ||
                                                generateAudioMutation.isPending ||
                                                !watchedText?.trim() ||
                                                !exerciseId
                                            }
                                            onClick={handleGenerateAudio}
                                        >
                                            {generateAudioMutation.isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Volume2 className="mr-2 size-4" />
                                                    Generate Audio
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    {generateAudioMutation.error ? (
                                        <FieldError>
                                            {
                                                generateAudioMutation.error
                                                    .message
                                            }
                                        </FieldError>
                                    ) : null}
                                    <FieldError
                                        errors={[formState.errors.audioUrl]}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="slowAudioUrl">
                                        Slow audio URL
                                    </FieldLabel>
                                    <Input
                                        id="slowAudioUrl"
                                        placeholder="/audio/greetings/hallo_slow.mp3"
                                        disabled={isPending}
                                        {...register('slowAudioUrl')}
                                    />
                                    <FieldError
                                        errors={[formState.errors.slowAudioUrl]}
                                    />
                                </Field>
                            </>
                        ) : null}
                        {needsOptions ? (
                            <>
                                <Field>
                                    <FieldLabel htmlFor="optionsText">
                                        Options (one per line)
                                    </FieldLabel>
                                    <textarea
                                        id="optionsText"
                                        rows={5}
                                        className={TEXTAREA_CLASSNAME}
                                        placeholder={'Hallo\nDanke\nTschüss'}
                                        disabled={isPending}
                                        {...register('optionsText')}
                                    />
                                    <FieldError
                                        errors={[formState.errors.optionsText]}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="correctOptionIndexText">
                                        Correct option index (0-based,
                                        comma-separated for multiple)
                                    </FieldLabel>
                                    <Input
                                        id="correctOptionIndexText"
                                        placeholder="0"
                                        disabled={isPending}
                                        {...register('correctOptionIndexText')}
                                    />
                                    <FieldError
                                        errors={[
                                            formState.errors
                                                .correctOptionIndexText,
                                        ]}
                                    />
                                </Field>
                                <Field className="rounded-lg border p-4">
                                    <Controller
                                        name="allowsMultipleCorrectOptions"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <>
                                                <div className="flex items-center justify-between gap-4">
                                                    <Label
                                                        htmlFor="allowsMultipleCorrectOptions"
                                                        className="text-base"
                                                    >
                                                        Allow multiple correct
                                                        options
                                                    </Label>
                                                    <Checkbox
                                                        id="allowsMultipleCorrectOptions"
                                                        checked={
                                                            field.value ?? false
                                                        }
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                        disabled={isPending}
                                                    />
                                                </div>
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            </>
                                        )}
                                    />
                                </Field>
                            </>
                        ) : null}
                        {needsCorrectInputs ? (
                            <Field>
                                <FieldLabel htmlFor="correctInputsText">
                                    Correct inputs (one per line)
                                </FieldLabel>
                                <textarea
                                    id="correctInputsText"
                                    rows={4}
                                    className={TEXTAREA_CLASSNAME}
                                    placeholder={'Hallo\nTschüss'}
                                    disabled={isPending}
                                    {...register('correctInputsText')}
                                />
                                <FieldError
                                    errors={[
                                        formState.errors.correctInputsText,
                                    ]}
                                />
                            </Field>
                        ) : null}
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
                                    {isEdit ? 'Saving...' : 'Creating...'}
                                </>
                            ) : isEdit ? (
                                'Save changes'
                            ) : (
                                'Create exercise'
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(backUrl)}
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
