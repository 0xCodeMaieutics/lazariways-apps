"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Button } from "@lazariways/ui/components/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@lazariways/ui/components/field"
import { Input } from "@lazariways/ui/components/input"
import { NativeSelect, NativeSelectOption } from "@lazariways/ui/components/native-select"
import { toast } from "@lazariways/ui/components/sonner"
import { ArrowLeft, Copy, Download, Loader2, Share2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useSyncExternalStore } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import {
  GERMAN_LEVELS,
  MAX_EMPLOYMENT_MONTHS,
  MAX_HIGHLIGHT_LENGTH,
  MAX_WAGE_AMOUNT,
  WAGE_PERIODS,
  type GermanLevel,
  type VacancyDetails,
  type WagePeriod,
} from "@/lib/social-posts/vacancy-details"
import type { VacancyTemplate } from "@/lib/social-posts/vacancy-templates"

const PERMANENT = "PERMANENT"
const PREVIEW_DEBOUNCE_MS = 400
const WAGE_AMOUNT_PATTERN = /^\d+([.,]\d{1,2})?$/
const RENDER_ERROR = "სურათის შექმნა ვერ მოხერხდა. სცადეთ თავიდან."
const SECTION_CLASS_NAME = "rounded-xl bg-card p-4 ring-1 ring-foreground/10 md:p-6"

const EMPLOYMENT_MONTH_OPTIONS = Array.from({ length: MAX_EMPLOYMENT_MONTHS }, (_, index) =>
  String(index + 1)
)

const WAGE_PERIOD_LABELS: Record<WagePeriod, string> = {
  HOUR: "საათში",
  MONTH: "თვეში",
}

const GERMAN_LEVEL_LABELS: Record<GermanLevel, string> = {
  NONE: "არ არის საჭირო",
  A1: "A1",
  A2: "A2",
  B1: "B1",
  B2: "B2",
  C1: "C1",
}

const socialPostFormSchema = z.object({
  employmentDuration: z
    .string()
    .refine(
      (value) => value === PERMANENT || EMPLOYMENT_MONTH_OPTIONS.includes(value),
      "აირჩიეთ ხანგრძლივობა"
    ),
  wageAmount: z
    .string()
    .trim()
    .refine((value) => {
      const amount = parseWageAmount(value)
      return WAGE_AMOUNT_PATTERN.test(value) && amount > 0 && amount <= MAX_WAGE_AMOUNT
    }, "შეიყვანეთ თანხა, მაგალითად 14 ან 14,50"),
  wagePeriod: z.enum(WAGE_PERIODS),
  germanLevel: z.enum(GERMAN_LEVELS),
  highlight: z.string().trim().max(MAX_HIGHLIGHT_LENGTH, `მაქსიმუმ ${MAX_HIGHLIGHT_LENGTH} სიმბოლო`),
})

type SocialPostFormValues = z.infer<typeof socialPostFormSchema>

interface RenderedStory {
  query: string
  file: File
  objectUrl: string
}

interface SocialPostEditorProps {
  template: VacancyTemplate
  applicationFormUrl: string
}

export function SocialPostEditor({ template, applicationFormUrl }: SocialPostEditorProps) {
  const [story, setStory] = useState<RenderedStory | null>(null)
  const isShareSupported = useSyncExternalStore(
    subscribeToNothing,
    () => typeof navigator.share === "function",
    () => false
  )

  const {
    register,
    reset,
    control,
    getValues,
    formState: { errors },
  } = useForm<SocialPostFormValues>({
    resolver: standardSchemaResolver(socialPostFormSchema),
    defaultValues: toFormValues(template.defaultDetails),
    mode: "onChange",
  })

  const values = useWatch({ control })
  const parsedValues = socialPostFormSchema.safeParse(values)
  const storyQuery = parsedValues.success ? toStoryQuery(template.id, parsedValues.data) : null
  const isPreviewCurrent = storyQuery !== null && story?.query === storyQuery

  useEffect(() => {
    const storedValues = readStoredValues(template.id)

    if (storedValues !== null) {
      reset(storedValues)
    }
  }, [reset, template.id])

  useEffect(() => {
    if (storyQuery === null) {
      return
    }

    const abortController = new AbortController()
    const timeoutId = setTimeout(() => {
      renderStory(storyQuery, template.id, abortController.signal)
        .then((file) => {
          setStory({ query: storyQuery, file, objectUrl: URL.createObjectURL(file) })
          saveStoredValues(template.id, getValues())
        })
        .catch(() => {
          if (!abortController.signal.aborted) {
            toast.error(RENDER_ERROR)
          }
        })
    }, PREVIEW_DEBOUNCE_MS)

    return () => {
      clearTimeout(timeoutId)
      abortController.abort()
    }
  }, [storyQuery, template.id, getValues])

  useEffect(() => {
    if (story === null) {
      return
    }

    return () => URL.revokeObjectURL(story.objectUrl)
  }, [story])

  const shareStory = async () => {
    if (story === null) {
      return
    }

    if (typeof navigator.canShare !== "function" || !navigator.canShare({ files: [story.file] })) {
      downloadStory(story)
      toast.info("გაზიარება ამ ბრაუზერში ვერ მოხერხდა, სურათი ჩამოიტვირთა.")
      return
    }

    try {
      await navigator.share({ files: [story.file] })
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return
      }

      toast.error("გაზიარება ვერ მოხერხდა. სცადეთ ჩამოტვირთვა.")
    }
  }

  const copyApplicationFormUrl = async () => {
    try {
      await navigator.clipboard.writeText(applicationFormUrl)
      toast.success("ბმული დაკოპირდა")
    } catch {
      toast.error("ბმულის დაკოპირება ვერ მოხერხდა")
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 md:py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        შაბლონები
      </Link>
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <span aria-hidden>{template.icon}</span>
        {template.name}
      </h1>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_20rem]">
        <form className={SECTION_CLASS_NAME} noValidate onSubmit={(event) => event.preventDefault()}>
          <FieldGroup>
            <Field data-invalid={errors.employmentDuration !== undefined}>
              <FieldLabel htmlFor="employmentDuration">დასაქმების ხანგრძლივობა</FieldLabel>
              <NativeSelect id="employmentDuration" className="w-full" {...register("employmentDuration")}>
                {EMPLOYMENT_MONTH_OPTIONS.map((months) => (
                  <NativeSelectOption key={months} value={months}>
                    {`${months} თვე`}
                  </NativeSelectOption>
                ))}
                <NativeSelectOption value={PERMANENT}>მუდმივი</NativeSelectOption>
              </NativeSelect>
              {errors.employmentDuration !== undefined ? (
                <FieldError errors={[errors.employmentDuration]} />
              ) : null}
            </Field>

            <div className="grid grid-cols-[minmax(0,1fr)_8rem] gap-4">
              <Field data-invalid={errors.wageAmount !== undefined}>
                <FieldLabel htmlFor="wageAmount">ანაზღაურება (€, ბრუტო)</FieldLabel>
                <Input
                  id="wageAmount"
                  inputMode="decimal"
                  placeholder="14,50"
                  aria-invalid={errors.wageAmount !== undefined}
                  {...register("wageAmount")}
                />
                {errors.wageAmount !== undefined ? <FieldError errors={[errors.wageAmount]} /> : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="wagePeriod">პერიოდი</FieldLabel>
                <NativeSelect id="wagePeriod" className="w-full" {...register("wagePeriod")}>
                  {WAGE_PERIODS.map((period) => (
                    <NativeSelectOption key={period} value={period}>
                      {WAGE_PERIOD_LABELS[period]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="germanLevel">გერმანული ენის დონე</FieldLabel>
              <NativeSelect id="germanLevel" className="w-full" {...register("germanLevel")}>
                {GERMAN_LEVELS.map((level) => (
                  <NativeSelectOption key={level} value={level}>
                    {GERMAN_LEVEL_LABELS[level]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field data-invalid={errors.highlight !== undefined}>
              <FieldLabel htmlFor="highlight">აქცენტი (არასავალდებულო)</FieldLabel>
              <Input
                id="highlight"
                maxLength={MAX_HIGHLIGHT_LENGTH}
                placeholder="🔥 ბოლო ადგილები!"
                aria-invalid={errors.highlight !== undefined}
                {...register("highlight")}
              />
              <FieldDescription>{`${(values.highlight ?? "").length}/${MAX_HIGHLIGHT_LENGTH}`}</FieldDescription>
              {errors.highlight !== undefined ? <FieldError errors={[errors.highlight]} /> : null}
            </Field>
          </FieldGroup>
        </form>

        <section className="flex flex-col gap-4">
          <div className="relative mx-auto aspect-[9/16] w-full max-w-xs overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
            {story !== null ? (
              // eslint-disable-next-line @next/next/no-img-element -- a local blob URL that next/image cannot optimize
              <img
                src={story.objectUrl}
                alt={`${template.name} — სოციალური პოსტი`}
                className="size-full object-cover"
              />
            ) : null}
            {storyQuery === null ? (
              <p className="absolute inset-0 flex items-center justify-center bg-background/70 p-6 text-center text-sm">
                შეასწორეთ ველები გადახედვისთვის
              </p>
            ) : null}
            {storyQuery !== null && !isPreviewCurrent ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                <Loader2 className="size-6 animate-spin" aria-label="იქმნება…" />
              </div>
            ) : null}
          </div>

          <div className="mx-auto flex w-full max-w-xs flex-col gap-2">
            {isShareSupported ? (
              <Button
                type="button"
                size="lg"
                disabled={!isPreviewCurrent}
                onClick={() => {
                  void shareStory()
                }}
              >
                <Share2 aria-hidden />
                გაზიარება
              </Button>
            ) : null}
            <Button
              type="button"
              size="lg"
              variant={isShareSupported ? "outline" : "default"}
              disabled={!isPreviewCurrent}
              onClick={() => {
                if (story !== null) {
                  downloadStory(story)
                }
              }}
            >
              <Download aria-hidden />
              ჩამოტვირთვა
            </Button>
          </div>

          <div className="mx-auto w-full max-w-xs rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">ბმული Instagram-ის სტიკერისთვის</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{applicationFormUrl}</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  void copyApplicationFormUrl()
                }}
              >
                <Copy aria-hidden />
                კოპირება
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function subscribeToNothing() {
  return () => {}
}

function parseWageAmount(value: string): number {
  return Number(value.replace(",", "."))
}

function toFormValues(details: VacancyDetails): SocialPostFormValues {
  return {
    employmentDuration: String(details.employmentDuration),
    wageAmount: String(details.wageAmount).replace(".", ","),
    wagePeriod: details.wagePeriod,
    germanLevel: details.germanLevel,
    highlight: details.highlight,
  }
}

function toStoryQuery(templateId: string, values: SocialPostFormValues): string {
  return new URLSearchParams({
    template: templateId,
    employmentDuration: values.employmentDuration,
    wageAmount: String(parseWageAmount(values.wageAmount.trim())),
    wagePeriod: values.wagePeriod,
    germanLevel: values.germanLevel,
    highlight: values.highlight.trim(),
  }).toString()
}

async function renderStory(query: string, templateId: string, signal: AbortSignal): Promise<File> {
  const response = await fetch(`/api/social-posts/story?${query}`, { signal })

  if (!response.ok) {
    throw new Error(`Story render failed with status ${response.status}`)
  }

  const blob = await response.blob()
  return new File([blob], `${templateId}-story.png`, { type: "image/png" })
}

function downloadStory(story: RenderedStory) {
  const link = document.createElement("a")
  link.href = story.objectUrl
  link.download = story.file.name
  link.click()
}

function storageKey(templateId: string): string {
  return `content-studio:vacancy-details:${templateId}`
}

function readStoredValues(templateId: string): SocialPostFormValues | null {
  try {
    const storedValue = localStorage.getItem(storageKey(templateId))

    if (storedValue === null) {
      return null
    }

    const parsedValues = socialPostFormSchema.safeParse(JSON.parse(storedValue))
    return parsedValues.success ? parsedValues.data : null
  } catch {
    return null
  }
}

function saveStoredValues(templateId: string, values: SocialPostFormValues) {
  try {
    localStorage.setItem(storageKey(templateId), JSON.stringify(values))
  } catch {
    // Private browsing can block storage; the editor still works without remembered values.
  }
}
