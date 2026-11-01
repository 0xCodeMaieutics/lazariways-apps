import { prisma } from "@lazariways/database/client"
import { notFound, redirect } from "next/navigation"

import { getSession } from "@/lib/auth.server"

import { ExamResult } from "./page.client"

export default async function ExamCompletionPage({
  params,
}: {
  params: Promise<{
    examId: string
    completionId: string
  }>
}) {
  const { examId, completionId } = await params

  const session = await getSession()
  if (session === null) return redirect("/login")

  const [completion, exerciseCount, aggregation] = await Promise.all([
    prisma.userExam.findUnique({
      where: { id: completionId },
      include: {
        exam: {
          select: {
            topicId: true,
            minimumCorrectAnswerCount: true,
            minimumPassedCount: true,
            waitUntilPassAllowedInSeconds: true,
          },
        },
      },
    }),
    prisma.exercise.count({
      where: { examId },
    }),
    prisma.userExamAggregation.findUnique({
      where: {
        userId_examId: {
          userId: session.user.id,
          examId,
        },
      },
      select: {
        passedCount: true,
        lastPassedAt: true,
      },
    }),
  ])

  if (!completion || completion.userId !== session.user.id || completion.examId !== examId) {
    notFound()
  }

  if (aggregation === null) {
    notFound()
  }

  return (
    <ExamResult
      completion={{
        correctCount: completion.correctCount,
        hasPassed: completion.hasPassed,
        passCounted: completion.passCounted,
      }}
      exam={{
        topicId: completion.exam.topicId,
        minimumCorrectAnswerCount: completion.exam.minimumCorrectAnswerCount,
        minimumPassedCount: completion.exam.minimumPassedCount,
        waitUntilPassAllowedInSeconds: completion.exam.waitUntilPassAllowedInSeconds,
        exerciseCount,
      }}
      aggregation={aggregation}
    />
  )
}
