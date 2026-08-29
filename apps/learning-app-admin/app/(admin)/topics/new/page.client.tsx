'use client'

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { TopicType } from '@workspace/database/browser'
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

const topicSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(TopicType),
    order: z.coerce.number().int().min(0),
    enabled: z.boolean().default(false),
})

type TopicFormInput = z.input<typeof topicSchema>
type TopicFormValues = z.output<typeof topicSchema>

const TYPE_OPTIONS = [
    { value: TopicType.STARTER, label: 'Starter' },
    { value: TopicType.BAECKEREI, label: 'Bäckerei' },
    { value: TopicType.FREIZEIT_PARK, label: 'Freizeit Park' },
] as const

export function CreateTopicForm({
    defaultValues,
}: {
    defaultValues?: Partial<TopicFormValues>
}) {
    const router = useRouter()
    const trpc = useTRPC()

    const form = useForm<TopicFormInput, unknown, TopicFormValues>({
        resolver: standardSchemaResolver(topicSchema),
        defaultValues: {
            name: '',
            type: TopicType.STARTER,
            order: 0,
            enabled: false,
            ...defaultValues,
        },
    })

    const createMutation = useMutation(
        trpc.admin.topics.createNewTopic.mutationOptions({
        onSuccess: () => {
            router.push('/topics')
        },
    }))

    const { control, register, formState } = form
    const isPending = createMutation.isPending
    const error = (createMutation.error as { message?: string })?.message

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Create topic</CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={form.handleSubmit((data) =>
                        createMutation.mutate(data)
                    )}
                    noValidate
                    className="space-y-6"
                >
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">Name</FieldLabel>
                            <Input
                                id="name"
                                placeholder="Topic name"
                                disabled={isPending}
                                {...register('name')}
                            />
                            <FieldError errors={[formState.errors.name]} />
                        </Field>
                        <div className="grid gap-6 sm:grid-cols-2">
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
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                {TYPE_OPTIONS.map((opt) => (
                                                    <NativeSelectOption
                                                        key={opt.value}
                                                        value={opt.value}
                                                    >
                                                        {opt.label}
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
                        </div>
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
                                                onCheckedChange={
                                                    field.onChange
                                                }
                                                disabled={isPending}
                                            />
                                            <Label htmlFor="enabled">
                                                Enable topic
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
                        <p className="text-destructive text-sm">{error}</p>
                    )}
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Creating…
                                </>
                            ) : (
                                'Create topic'
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
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
