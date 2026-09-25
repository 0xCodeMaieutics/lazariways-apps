"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { TopicType } from "@workspace/database/browser"
import { useMutation } from "@tanstack/react-query"
import { useTRPC } from "@/lib/trpc/react"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  NativeSelect,
  NativeSelectOption,
} from "@workspace/ui/components/native-select"
import { Loader2 } from "lucide-react"

const topicSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(TopicType),
    order: z.coerce.number().int().min(0),
    enabled: z.boolean(),
    isAlwaysUnlocked: z.boolean(),
    unlockedByTopicId: z.string(),
    minimumCompletedExamsToUnlock: z.union([
      z.literal(""),
      z.coerce.number().int().min(1),
    ]),
  })
  .superRefine((data, ctx) => {
    if (data.isAlwaysUnlocked && data.unlockedByTopicId !== "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "An always unlocked topic cannot have an unlocker",
        path: ["unlockedByTopicId"],
      })
    }
  })

type TopicFormInput = z.input<typeof topicSchema>
type TopicFormValues = z.output<typeof topicSchema>

const TYPE_OPTIONS = [
  { value: TopicType.STARTER, label: "Starter" },
  { value: TopicType.BAECKEREI, label: "Bäckerei" },
  { value: TopicType.FREIZEIT_PARK, label: "Freizeit Park" },
  { value: TopicType.HOTEL, label: "Hotel" },
  {
    value: TopicType.GARTEN_LANDSCHAFTBAU,
    label: "Garten- und Landschaftsbau",
  },
] as const

export type TopicUnlockOption = { id: string; name: string }

function toPayload(data: TopicFormValues) {
  return {
    name: data.name,
    type: data.type,
    order: data.order,
    enabled: data.enabled,
    isAlwaysUnlocked: data.isAlwaysUnlocked,
    unlockedByTopicId:
      data.isAlwaysUnlocked || data.unlockedByTopicId === ""
        ? null
        : data.unlockedByTopicId,
    minimumCompletedExamsToUnlock:
      data.minimumCompletedExamsToUnlock === ""
        ? null
        : data.minimumCompletedExamsToUnlock,
  }
}

export function TopicForm({
  parentTopics,
  topicId,
  defaultValues,
}: {
  parentTopics: TopicUnlockOption[]
  topicId?: string
  defaultValues?: Partial<TopicFormInput>
}) {
  const router = useRouter()
  const trpc = useTRPC()
  const isEdit = topicId !== undefined

  const form = useForm<TopicFormInput, unknown, TopicFormValues>({
    resolver: standardSchemaResolver(topicSchema),
    defaultValues: {
      name: "",
      type: TopicType.STARTER,
      order: 0,
      enabled: false,
      isAlwaysUnlocked: false,
      unlockedByTopicId: "",
      minimumCompletedExamsToUnlock: "",
      ...defaultValues,
    },
  })

  const createMutation = useMutation(
    trpc.admin.topics.createNewTopic.mutationOptions({
      onSuccess: () => {
        router.push("/topics")
        router.refresh()
      },
    })
  )

  const updateMutation = useMutation(
    trpc.admin.topics.update.mutationOptions({
      onSuccess: () => {
        router.push("/topics")
        router.refresh()
      },
    })
  )

  const { control, register, formState, setValue } = form
  const isAlwaysUnlocked = useWatch({ control, name: "isAlwaysUnlocked" })
  const isPending = createMutation.isPending || updateMutation.isPending
  const error = (
    (isEdit ? updateMutation.error : createMutation.error) as {
      message?: string
    } | null
  )?.message

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit topic" : "Create topic"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((data) => {
            const payload = toPayload(data)
            if (isEdit) {
              updateMutation.mutate({ ...payload, id: topicId })
              return
            }
            createMutation.mutate(payload)
          })}
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
                {...register("name")}
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
                        onChange={(event) => field.onChange(event.target.value)}
                        onBlur={field.onBlur}
                        disabled={isPending}
                        aria-invalid={fieldState.invalid}
                      >
                        {TYPE_OPTIONS.map((opt) => (
                          <NativeSelectOption key={opt.value} value={opt.value}>
                            {opt.label}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                      <FieldError errors={[fieldState.error]} />
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
                  {...register("order")}
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
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                      <Label htmlFor="enabled">Enable topic</Label>
                    </div>
                    <FieldError errors={[fieldState.error]} />
                  </>
                )}
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
                          field.onChange(checked === true)
                          if (checked === true) {
                            setValue("unlockedByTopicId", "")
                          }
                        }}
                        disabled={isPending}
                      />
                      <Label htmlFor="isAlwaysUnlocked">Always unlocked</Label>
                    </div>
                    <FieldError errors={[fieldState.error]} />
                  </>
                )}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="unlockedByTopicId">Unlocked by</FieldLabel>
              <Controller
                name="unlockedByTopicId"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <NativeSelect
                      id="unlockedByTopicId"
                      className="w-full"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                      disabled={isPending || isAlwaysUnlocked}
                      aria-invalid={fieldState.invalid}
                    >
                      <NativeSelectOption value="">None</NativeSelectOption>
                      {parentTopics.map((topic) => (
                        <NativeSelectOption key={topic.id} value={topic.id}>
                          {topic.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <FieldError errors={[fieldState.error]} />
                  </>
                )}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Learners get this topic after they fully pass enough enabled
                exams in the unlocker. Leave empty if it is always unlocked or
                not yet attached.
              </p>
            </Field>
            <Field>
              <FieldLabel htmlFor="minimumCompletedExamsToUnlock">
                Minimum completed exams to unlock others
              </FieldLabel>
              <Input
                id="minimumCompletedExamsToUnlock"
                type="number"
                min={1}
                disabled={isPending}
                {...register("minimumCompletedExamsToUnlock")}
              />
              <FieldError
                errors={[formState.errors.minimumCompletedExamsToUnlock]}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Required if this topic unlocks others. May be higher than the
                current number of enabled exams.
              </p>
            </Field>
          </FieldGroup>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create topic"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/topics")}
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
