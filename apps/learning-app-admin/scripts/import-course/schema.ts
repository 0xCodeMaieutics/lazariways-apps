import { ExerciseType, TopicType } from "@lazariways/database/browser"
import { z } from "zod"

const DEFAULT_MINIMUM_CORRECT_ANSWER_COUNT = 8
const DEFAULT_MINIMUM_PASSED_COUNT = 2
const DEFAULT_WAIT_UNTIL_PASS_ALLOWED_IN_SECONDS = 14_400

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase words joined by hyphens")
const nonEmptyText = z.string().trim().min(1)

const chooseFields = {
  prompt: nonEmptyText,
  options: z.array(nonEmptyText).min(2),
  // The learning app only checks the first correct option.
  correctOptionIndex: z.int().min(0),
}

const inputFields = {
  prompt: nonEmptyText,
  correctInputs: z.array(nonEmptyText).min(1),
}

const MINIMUM_MATCHING_PAIR_COUNT = 2
const MAXIMUM_MATCHING_PAIR_COUNT = 6

const matchingPairsSchema = z
  .array(z.strictObject({ term: nonEmptyText, meaning: nonEmptyText }))
  .min(MINIMUM_MATCHING_PAIR_COUNT)
  .max(MAXIMUM_MATCHING_PAIR_COUNT)
  .refine(
    (pairs) =>
      new Set(pairs.map((pair) => pair.term)).size === pairs.length &&
      new Set(pairs.map((pair) => pair.meaning)).size === pairs.length,
    { message: "Each term and each meaning may appear only once" }
  )

const exerciseSchema = z
  .discriminatedUnion("type", [
    z.strictObject({
      type: z.literal(ExerciseType.CHOOSE_MATCHING_PATTERNS),
      prompt: nonEmptyText,
      matchingPairs: matchingPairsSchema,
    }),
    z.strictObject({ type: z.literal(ExerciseType.CHOOSE_FROM_TEXT), text: nonEmptyText, ...chooseFields }),
    z.strictObject({
      type: z.literal(ExerciseType.CHOOSE_FROM_AUDIO),
      audioText: nonEmptyText,
      ...chooseFields,
    }),
    z.strictObject({ type: z.literal(ExerciseType.INPUT_FROM_TEXT), text: nonEmptyText, ...inputFields }),
    z.strictObject({
      type: z.literal(ExerciseType.INPUT_SENTENCE_FROM_TEXT),
      text: nonEmptyText,
      ...inputFields,
    }),
    z.strictObject({
      type: z.literal(ExerciseType.INPUT_FROM_AUDIO),
      audioText: nonEmptyText,
      ...inputFields,
    }),
  ])
  .refine((exercise) => !("options" in exercise) || exercise.correctOptionIndex < exercise.options.length, {
    message: "correctOptionIndex must point to one of the options",
    path: ["correctOptionIndex"],
  })

export const examFileSchema = z
  .strictObject({
    id,
    level: z.enum(["A1", "A2"]),
    title: nonEmptyText,
    description: nonEmptyText,
    estimatedTimeInMinutes: z.int().positive(),
    minimumCorrectAnswerCount: z.int().positive().default(DEFAULT_MINIMUM_CORRECT_ANSWER_COUNT),
    minimumPassedCount: z.int().positive().default(DEFAULT_MINIMUM_PASSED_COUNT),
    waitUntilPassAllowedInSeconds: z.int().min(0).default(DEFAULT_WAIT_UNTIL_PASS_ALLOWED_IN_SECONDS),
    exercises: z.array(exerciseSchema).min(1),
  })
  .refine((exam) => exam.minimumCorrectAnswerCount <= exam.exercises.length, {
    message: "minimumCorrectAnswerCount cannot exceed the number of exercises",
    path: ["minimumCorrectAnswerCount"],
  })

export const topicFileSchema = z
  .strictObject({
    id,
    name: nonEmptyText,
    type: z.enum(TopicType),
    order: z.int().min(0),
    enabled: z.boolean(),
    isAlwaysUnlocked: z.boolean(),
    unlockedByTopicId: id.nullable(),
    minimumCompletedExamsToUnlock: z.int().positive().nullable(),
  })
  .refine((topic) => !(topic.isAlwaysUnlocked && topic.unlockedByTopicId !== null), {
    message: "An always unlocked topic cannot have an unlocker",
    path: ["unlockedByTopicId"],
  })
  .refine((topic) => topic.unlockedByTopicId !== topic.id, {
    message: "A topic cannot unlock itself",
    path: ["unlockedByTopicId"],
  })

export type ExamFile = z.output<typeof examFileSchema>
export type TopicFile = z.output<typeof topicFileSchema>
export type ExerciseFile = ExamFile["exercises"][number]
