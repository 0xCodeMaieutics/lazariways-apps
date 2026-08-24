import { z } from "zod"
import { adminProcedure, router } from "../server"
import { LearningAppTopicType } from "@workspace/database/browser"
import { generateAudio } from "@/lib/narakeet"
import { uploadToStorage } from "@workspace/file-upload/s3-client"
import { env } from "@/env"
import prisma from "@workspace/database/client"

const EXERCISE_TYPES = [
  "CHOOSE_FROM_AUDIO",
  "INPUT_FROM_AUDIO",
  "CHOOSE_FROM_TEXT",
  "INPUT_FROM_TEXT",
  "INPUT_SENTENCE_FROM_TEXT",
  "CHOOSE_MATCHING_PATTERNS",
] as const

const exerciseBaseSchema = z.object({
  examId: z.string().min(1, "Exam is required"),
  type: z.enum(EXERCISE_TYPES),
  prompt: z.string().optional(),
  text: z.string().optional(),
  order: z.number().int().min(0),
  audioUrl: z.string().optional(),
  slowAudioUrl: z.string().optional(),
  options: z.array(z.string()),
  correctOptionIndex: z.array(z.number().int().min(0)),
  allowsMultipleCorrectOptions: z.boolean().optional(),
  correctInputs: z.array(z.string()),
})

const exerciseCreateSchema = exerciseBaseSchema.superRefine((data, ctx) => {
  const needsOptions =
    data.type === "CHOOSE_FROM_AUDIO" ||
    data.type === "CHOOSE_FROM_TEXT" ||
    data.type === "CHOOSE_MATCHING_PATTERNS"
  const needsCorrectInputs =
    data.type === "INPUT_FROM_TEXT" ||
    data.type === "INPUT_FROM_AUDIO" ||
    data.type === "INPUT_SENTENCE_FROM_TEXT"

  if (needsOptions && data.options.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one option is required for this exercise type",
      path: ["options"],
    })
  }
  if (needsOptions && data.correctOptionIndex.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select at least one correct option for this exercise type",
      path: ["correctOptionIndex"],
    })
  }
  if (
    needsCorrectInputs &&
    (data.correctInputs.length === 0 ||
      data.correctInputs.every((s) => !s.trim()))
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one correct input is required for this exercise type",
      path: ["correctInputs"],
    })
  }
})

const examCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  order: z.number().int().min(0),
  estimatedTimeInMinutes: z.number().int().min(1).optional(),
  minimumCorrectAnswerCount: z.number().int().min(1).default(1),
  minimumPassedCount: z.number().int().min(1).default(1),
  waitUntilPassAllowedInSeconds: z.number().int().min(0).default(14400),
  topicId: z.string().min(1, "Topic is required"),
  enable: z.boolean().default(false),
})

const examUpdateSchema = examCreateSchema.partial().extend({
  id: z.string().min(1),
})

const topicCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(LearningAppTopicType),
  order: z.number().int().min(0),
  enabled: z.boolean().default(false),
})

function sanitizeForFilename(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
}

export const adminRouter = router({
  audio: {
    generate: adminProcedure
      .input(
        z.object({
          text: z.string().min(1),
          voice: z.string().default("monika"),
          exerciseId: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const buffer = await generateAudio(input.text, input.voice)
        const key = `${env.BUCKET_AUDIOS_PATH}/${sanitizeForFilename(input.text)}-${Date.now()}.m4a`
        await uploadToStorage({
          file: buffer,
          bucket: env.S3_BUCKET_NAME,
          fileKey: key,
          declaredType: "audio/mp4",
        })

        await prisma.learningAppExercise.update({
          where: { id: input.exerciseId },
          data: { audioUrl: key },
        })

        return { audioUrl: key }
      }),
  },
  exams: {
    create: adminProcedure.input(examCreateSchema).mutation(async ({ input }) =>
      prisma.learningAppExam.create({
        data: {
          title: input.title,
          description: input.description,
          order: input.order,
          estimatedTimeInMinutes: input.estimatedTimeInMinutes,
          minimumCorrectAnswerCount: input.minimumCorrectAnswerCount,
          minimumPassedCount: input.minimumPassedCount,
          waitUntilPassAllowedInSeconds: input.waitUntilPassAllowedInSeconds,
          enable: input.enable,
          topicId: input.topicId,
        },
      })
    ),
    update: adminProcedure
      .input(examUpdateSchema)
      .mutation(async ({ input }) => {
        const { id, ...data } = input
        return prisma.learningAppExam.update({
          where: { id },
          data,
        })
      }),
    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) =>
        prisma.learningAppExam.delete({
          where: { id: input.id },
        })
      ),
    reorder: adminProcedure
      .input(z.array(z.object({ id: z.string(), order: z.number().int() })))
      .mutation(async ({ input }) => {
        await prisma.$transaction(
          input.map(({ id, order }) =>
            prisma.learningAppExam.update({
              where: { id },
              data: { order },
            })
          )
        )
      }),
  },
  exercises: {
    create: adminProcedure
      .input(exerciseCreateSchema)
      .mutation(async ({ input }) =>
        prisma.learningAppExercise.create({
          data: {
            examId: input.examId,
            type: input.type,
            prompt: input.prompt || null,
            text: input.text || null,
            order: input.order,
            audioUrl: input.audioUrl || null,
            slowAudioUrl: input.slowAudioUrl || null,
            options: input.options,
            correctOptionIndex: input.correctOptionIndex,
            allowsMultipleCorrectOptions:
              input.allowsMultipleCorrectOptions ?? false,
            correctInputs: input.correctInputs.filter((s) => s.trim()),
          },
        })
      ),
    update: adminProcedure
      .input(
        exerciseBaseSchema.partial().extend({
          id: z.string().min(1),
          examId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input
        return prisma.learningAppExercise.update({
          where: { id },
          data: {
            ...(data.examId !== undefined && {
              examId: data.examId,
            }),
            ...(data.type !== undefined && { type: data.type }),
            ...(data.prompt !== undefined && {
              prompt: data.prompt,
            }),
            ...(data.text !== undefined && { text: data.text }),
            ...(data.order !== undefined && { order: data.order }),
            ...(data.audioUrl !== undefined && {
              audioUrl: data.audioUrl,
            }),
            ...(data.slowAudioUrl !== undefined && {
              slowAudioUrl: data.slowAudioUrl,
            }),
            ...(data.options !== undefined && {
              options: data.options,
            }),
            ...(data.correctOptionIndex !== undefined && {
              correctOptionIndex: data.correctOptionIndex,
            }),
            ...(data.allowsMultipleCorrectOptions !== undefined && {
              allowsMultipleCorrectOptions: data.allowsMultipleCorrectOptions,
            }),
            ...(data.correctInputs !== undefined && {
              correctInputs: data.correctInputs.filter((s) => s.trim()),
            }),
          },
        })
      }),
    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) =>
        prisma.learningAppExercise.delete({
          where: { id: input.id },
        })
      ),
    reorder: adminProcedure
      .input(z.array(z.object({ id: z.string(), order: z.number().int() })))
      .mutation(async ({ input }) => {
        await prisma.$transaction(
          input.map(({ id, order }) =>
            prisma.learningAppExercise.update({
              where: { id },
              data: { order },
            })
          )
        )
      }),
  },
  topics: {
    updateTopicEnabled: adminProcedure
      .input(
        z.object({
          id: z.string(),
          enabled: z.boolean(),
        })
      )
      .mutation(({ input }) =>
        prisma.learningAppTopic.update({
          where: {
            id: input.id,
          },
          data: {
            enabled: input.enabled,
          },
        })
      ),
    reorder: adminProcedure
      .input(z.array(z.object({ id: z.string(), order: z.number().int() })))
      .mutation(async ({ input }) => {
        await prisma.$transaction(
          input.map(({ id, order }) =>
            prisma.learningAppTopic.update({
              where: { id },
              data: { order },
            })
          )
        )
      }),
    createNewTopic: adminProcedure
      .input(topicCreateSchema)
      .mutation(async ({ input }) =>
        prisma.learningAppTopic.create({
          data: {
            name: input.name,
            type: input.type,
            order: input.order,
            enabled: input.enabled,
          },
        })
      ),
  },
})
