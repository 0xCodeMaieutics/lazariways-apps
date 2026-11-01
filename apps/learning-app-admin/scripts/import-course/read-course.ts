import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"

import type { z } from "zod"

import { examFileSchema, topicFileSchema, type ExamFile, type TopicFile } from "./schema"

export interface CourseTopic {
  topic: TopicFile
  exams: ExamFile[]
}

async function readJsonFile<Schema extends z.ZodType>(
  path: string,
  schema: Schema
): Promise<z.output<Schema>> {
  const content = await readFile(path, "utf-8")
  const result = schema.safeParse(JSON.parse(content))
  if (!result.success) {
    throw new Error(`${path} is invalid:\n${JSON.stringify(result.error.issues, null, 2)}`)
  }
  return result.data
}

async function readSortedFileNames(directory: string, extension: string) {
  const entries = await readdir(directory, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => entry.name)
    .sort()
}

async function readCourseTopic(topicDirectory: string): Promise<CourseTopic> {
  const topic = await readJsonFile(join(topicDirectory, "topic.json"), topicFileSchema)
  const examsDirectory = join(topicDirectory, "exams")
  const examFileNames = await readSortedFileNames(examsDirectory, ".json").catch((error: unknown) => {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return []
    }
    throw error
  })

  const exams = await Promise.all(
    examFileNames.map((fileName) => readJsonFile(join(examsDirectory, fileName), examFileSchema))
  )

  const firstA2Index = exams.findIndex((exam) => exam.level === "A2")
  const misplacedA1Exam =
    firstA2Index === -1 ? undefined : exams.slice(firstA2Index).find((exam) => exam.level === "A1")
  if (misplacedA1Exam !== undefined) {
    throw new Error(`Exam "${misplacedA1Exam.id}" is A1 but comes after an A2 exam in topic "${topic.id}"`)
  }

  return { topic, exams }
}

function assertUniqueIds(kind: string, ids: string[]) {
  const seenIds = new Set<string>()
  for (const id of ids) {
    if (seenIds.has(id)) {
      throw new Error(`Duplicate ${kind} id "${id}"`)
    }
    seenIds.add(id)
  }
}

function assertTopicUnlocksAreValid(courseTopics: CourseTopic[]) {
  const topicById = new Map(courseTopics.map(({ topic }) => [topic.id, topic]))

  for (const { topic } of courseTopics) {
    if (topic.unlockedByTopicId === null) continue

    const unlocker = topicById.get(topic.unlockedByTopicId)
    if (unlocker === undefined) {
      throw new Error(`Topic "${topic.id}" is unlocked by unknown topic "${topic.unlockedByTopicId}"`)
    }
    if (unlocker.minimumCompletedExamsToUnlock === null) {
      throw new Error(
        `Topic "${unlocker.id}" unlocks other topics, so it needs minimumCompletedExamsToUnlock`
      )
    }
    if (unlocker.unlockedByTopicId !== null) {
      throw new Error(`Topic "${unlocker.id}" unlocks other topics, so it cannot have an unlocker itself`)
    }
  }
}

export async function readCourse(courseDirectory: string): Promise<CourseTopic[]> {
  const entries = await readdir(courseDirectory, { withFileTypes: true })
  const topicDirectories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(courseDirectory, entry.name))
    .sort()

  const courseTopics = await Promise.all(topicDirectories.map(readCourseTopic))

  assertUniqueIds(
    "topic",
    courseTopics.map(({ topic }) => topic.id)
  )
  assertUniqueIds(
    "exam",
    courseTopics.flatMap(({ exams }) => exams.map((exam) => exam.id))
  )
  assertTopicUnlocksAreValid(courseTopics)

  return courseTopics.sort((first, second) => first.topic.order - second.topic.order)
}
