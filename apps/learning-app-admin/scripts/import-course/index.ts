import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import prisma from "@lazariways/database/client"

import { backfillUnlockedExamsForUnlocker } from "@/lib/backfill-unlocked-exams"
import { backfillUnlockedTopicsForUnlocker } from "@/lib/backfill-unlocked-topics"

import { ensureAudios } from "./audio"
import { readImportEnv } from "./env"
import { readCourse, type CourseTopic } from "./read-course"
import type { ExerciseFile } from "./schema"

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

const COURSE_DIRECTORY = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "course")
const TRANSACTION_TIMEOUT_IN_MS = 120_000

function toExerciseData(exercise: ExerciseFile, order: number, audioKeyByText: Map<string, string>) {
  const audioUrl = "audioText" in exercise ? audioKeyByText.get(exercise.audioText) : undefined
  if ("audioText" in exercise && audioUrl === undefined) {
    throw new Error(`Missing audio for "${exercise.audioText}"`)
  }

  return {
    type: exercise.type,
    prompt: exercise.prompt,
    text: "text" in exercise ? exercise.text : null,
    audioUrl: audioUrl ?? null,
    slowAudioUrl: null,
    options: "options" in exercise ? exercise.options : [],
    correctOptionIndex: "correctOptionIndex" in exercise ? [exercise.correctOptionIndex] : [],
    allowsMultipleCorrectOptions: false,
    correctInputs: "correctInputs" in exercise ? exercise.correctInputs : [],
    order,
    matchingPairs: {
      create:
        "matchingPairs" in exercise
          ? exercise.matchingPairs.map((pair, pairOrder) => ({ ...pair, order: pairOrder }))
          : [],
    },
  }
}

async function importTopics(tx: TransactionClient, courseTopics: CourseTopic[]) {
  for (const { topic } of courseTopics) {
    const data = {
      name: topic.name,
      type: topic.type,
      enabled: topic.enabled,
      order: topic.order,
      isAlwaysUnlocked: topic.isAlwaysUnlocked,
      minimumCompletedExamsToUnlock: topic.minimumCompletedExamsToUnlock,
    }
    await tx.topic.upsert({ where: { id: topic.id }, create: { id: topic.id, ...data }, update: data })
  }

  for (const { topic } of courseTopics) {
    await tx.topic.update({ where: { id: topic.id }, data: { unlockedId: topic.unlockedByTopicId } })
  }
}

async function importExams(
  tx: TransactionClient,
  { topic, exams }: CourseTopic,
  audioKeyByText: Map<string, string>
) {
  for (const [examIndex, exam] of exams.entries()) {
    const unlockedByExamId = exams[examIndex - 1]?.id ?? null
    const data = {
      topicId: topic.id,
      title: exam.title,
      description: exam.description,
      enabled: true,
      order: examIndex,
      isAlwaysUnlocked: unlockedByExamId === null,
      unlockedId: unlockedByExamId,
      estimatedTimeInMinutes: exam.estimatedTimeInMinutes,
      minimumCorrectAnswerCount: exam.minimumCorrectAnswerCount,
      minimumPassedCount: exam.minimumPassedCount,
      waitUntilPassAllowedInSeconds: exam.waitUntilPassAllowedInSeconds,
    }
    await tx.exam.upsert({ where: { id: exam.id }, create: { id: exam.id, ...data }, update: data })

    await tx.exercise.deleteMany({ where: { examId: exam.id } })
    for (const [exerciseIndex, exercise] of exam.exercises.entries()) {
      await tx.exercise.create({
        data: { examId: exam.id, ...toExerciseData(exercise, exerciseIndex, audioKeyByText) },
      })
    }

    if (unlockedByExamId !== null) {
      await backfillUnlockedExamsForUnlocker(tx, unlockedByExamId, [exam.id])
    }
  }

  const removedExams = await tx.exam.updateMany({
    where: { topicId: topic.id, id: { notIn: exams.map((exam) => exam.id) }, enabled: true },
    data: { enabled: false, isAlwaysUnlocked: false },
  })
  if (removedExams.count > 0) {
    console.log(`Disabled ${removedExams.count} exams no longer in topic "${topic.id}"`)
  }
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run")
  const courseTopics = await readCourse(COURSE_DIRECTORY)

  for (const { topic, exams } of courseTopics) {
    const exerciseCount = exams.reduce((count, exam) => count + exam.exercises.length, 0)
    console.log(`${topic.id}: ${exams.length} exams, ${exerciseCount} exercises`)
  }

  if (isDryRun) {
    console.log("Course content is valid. Dry run, nothing imported.")
    return
  }

  const audioTexts = courseTopics.flatMap(({ exams }) =>
    exams.flatMap((exam) =>
      exam.exercises.flatMap((exercise) => ("audioText" in exercise ? [exercise.audioText] : []))
    )
  )
  const audioKeyByText = await ensureAudios(audioTexts, readImportEnv())

  await prisma.$transaction(
    async (tx) => {
      await importTopics(tx, courseTopics)
      for (const courseTopic of courseTopics) {
        await importExams(tx, courseTopic, audioKeyByText)
      }
      for (const { topic } of courseTopics) {
        await backfillUnlockedTopicsForUnlocker(tx, topic.id)
      }
    },
    { timeout: TRANSACTION_TIMEOUT_IN_MS }
  )

  console.log("Course imported.")
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
