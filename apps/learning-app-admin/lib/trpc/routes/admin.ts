import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { adminProcedure, router } from "../server"
import { TopicType } from "@workspace/database/browser"
import prisma from "@workspace/database/client"
import { syncExamUnlocks } from "@/lib/sync-exam-unlocks"
import { validateAndApplyTopicUnlock } from "@/lib/sync-topic-unlock"
import { backfillUnlockedTopicsForUnlocker } from "@/lib/backfill-unlocked-topics"
import { generateAudio } from "@/lib/narakeet"
import { uploadToStorage } from "@workspace/file-upload/s3-client"
import { env } from "@/env"

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
  enabled: z.boolean().default(false),
  isAlwaysUnlocked: z.boolean().default(false),
  unlockedByExamId: z.string().min(1).nullable(),
})

const examUpdateSchema = examCreateSchema.partial().extend({
  id: z.string().min(1),
})

const topicWriteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(TopicType),
  order: z.number().int().min(0),
  enabled: z.boolean().default(false),
  isAlwaysUnlocked: z.boolean().default(false),
  unlockedByTopicId: z.string().min(1).nullable(),
  minimumCompletedExamsToUnlock: z.number().int().min(1).nullable(),
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

        await prisma.exercise.update({
          where: { id: input.exerciseId },
          data: { audioUrl: key },
        })

        return { audioUrl: key }
      }),
  },
  exams: {
    create: adminProcedure
      .input(examCreateSchema)
      .mutation(async ({ input }) => {
        const { unlockedByExamId, isAlwaysUnlocked, ...examData } = input

        return prisma.$transaction(async (tx) => {
          const exam = await tx.exam.create({
            data: examData,
          })

          await syncExamUnlocks(tx, {
            examId: exam.id,
            topicId: input.topicId,
            isAlwaysUnlocked,
            unlockedByExamId,
          })

          return exam
        })
      }),
    update: adminProcedure
      .input(examUpdateSchema)
      .mutation(async ({ input }) => {
        const { id, unlockedByExamId, topicId, ...data } = input

        const existingExam = await prisma.exam.findUnique({
          where: { id },
          select: {
            topicId: true,
            enabled: true,
          },
        })

        if (!existingExam) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Exam not found",
          })
        }

        const resolvedTopicId = topicId ?? existingExam.topicId

        return prisma.$transaction(async (tx) => {
          const exam = await tx.exam.update({
            where: { id },
            data: {
              ...data,
              ...(topicId !== undefined && { topicId }),
            },
          })

          if (unlockedByExamId !== undefined) {
            await syncExamUnlocks(tx, {
              examId: id,
              topicId: resolvedTopicId,
              isAlwaysUnlocked: exam.isAlwaysUnlocked,
              unlockedByExamId,
            })
          } else if (exam.isAlwaysUnlocked && exam.unlockedId !== null) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "An always unlocked exam cannot have an unlocker",
            })
          }

          const isExamNewlyEnabled =
            data.enabled === true && existingExam.enabled === false
          if (isExamNewlyEnabled) {
            await backfillUnlockedTopicsForUnlocker(tx, resolvedTopicId)
          }

          return exam
        })
      }),
    updateExamEnabled: adminProcedure
      .input(
        z.object({
          id: z.string(),
          enabled: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        const existingExam = await prisma.exam.findUnique({
          where: { id: input.id },
          select: { topicId: true, enabled: true },
        })

        if (!existingExam) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Exam not found",
          })
        }

        return prisma.$transaction(async (tx) => {
          const exam = await tx.exam.update({
            where: { id: input.id },
            data: { enabled: input.enabled },
          })

          const isExamNewlyEnabled =
            input.enabled === true && existingExam.enabled === false
          if (isExamNewlyEnabled) {
            await backfillUnlockedTopicsForUnlocker(tx, existingExam.topicId)
          }

          return exam
        })
      }),
    updateExamAlwaysUnlocked: adminProcedure
      .input(
        z.object({
          id: z.string(),
          isAlwaysUnlocked: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        const existingExam = await prisma.exam.findUnique({
          where: { id: input.id },
          select: { unlockedId: true },
        })

        if (!existingExam) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Exam not found",
          })
        }

        if (input.isAlwaysUnlocked && existingExam.unlockedId !== null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "An always unlocked exam cannot have an unlocker",
          })
        }

        return prisma.exam.update({
          where: { id: input.id },
          data: { isAlwaysUnlocked: input.isAlwaysUnlocked },
        })
      }),
    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) =>
        prisma.exam.delete({
          where: { id: input.id },
        })
      ),
    reorder: adminProcedure
      .input(z.array(z.object({ id: z.string(), order: z.number().int() })))
      .mutation(async ({ input }) => {
        await prisma.$transaction(
          input.map(({ id, order }) =>
            prisma.exam.update({
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
        prisma.exercise.create({
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
        return prisma.exercise.update({
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
        prisma.exercise.delete({
          where: { id: input.id },
        })
      ),
    reorder: adminProcedure
      .input(z.array(z.object({ id: z.string(), order: z.number().int() })))
      .mutation(async ({ input }) => {
        await prisma.$transaction(
          input.map(({ id, order }) =>
            prisma.exercise.update({
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
        prisma.topic.update({
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
            prisma.topic.update({
              where: { id },
              data: { order },
            })
          )
        )
      }),
    createNewTopic: adminProcedure
      .input(topicWriteSchema)
      .mutation(async ({ input }) => {
        const {
          unlockedByTopicId,
          isAlwaysUnlocked,
          minimumCompletedExamsToUnlock,
          ...topicData
        } = input

        return prisma.$transaction(async (tx) => {
          const topic = await tx.topic.create({
            data: topicData,
          })

          await validateAndApplyTopicUnlock(tx, {
            topicId: topic.id,
            isAlwaysUnlocked,
            unlockedByTopicId,
            minimumCompletedExamsToUnlock,
          })

          if (unlockedByTopicId !== null) {
            await backfillUnlockedTopicsForUnlocker(tx, unlockedByTopicId)
          }

          await backfillUnlockedTopicsForUnlocker(tx, topic.id)

          return tx.topic.findUniqueOrThrow({
            where: { id: topic.id },
          })
        })
      }),
    update: adminProcedure
      .input(
        topicWriteSchema.extend({
          id: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const {
          id,
          unlockedByTopicId,
          isAlwaysUnlocked,
          minimumCompletedExamsToUnlock,
          ...topicData
        } = input

        const existing = await prisma.topic.findUnique({
          where: { id },
          select: { id: true },
        })

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Topic not found",
          })
        }

        return prisma.$transaction(async (tx) => {
          await tx.topic.update({
            where: { id },
            data: topicData,
          })

          await validateAndApplyTopicUnlock(tx, {
            topicId: id,
            isAlwaysUnlocked,
            unlockedByTopicId,
            minimumCompletedExamsToUnlock,
          })

          if (unlockedByTopicId !== null) {
            await backfillUnlockedTopicsForUnlocker(tx, unlockedByTopicId)
          }

          await backfillUnlockedTopicsForUnlocker(tx, id)

          return tx.topic.findUniqueOrThrow({ where: { id } })
        })
      }),
  },
})
