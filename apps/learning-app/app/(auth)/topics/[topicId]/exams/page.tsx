import { prisma } from "@lazariways/database/client"
import { notFound, redirect } from "next/navigation"

import { getSession } from "@/lib/auth.server"
import { isExamUnlockedForUser } from "@/lib/exam-access"
import { isTopicUnlockedForUser } from "@/lib/topic-access"

import { Exams } from "./page.client"

export default async function TopicExamsPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params

  const user = await getSession()
  if (user === null) redirect("/login")

  const [topic, userUnlockedTopic, exams] = await Promise.all([
    prisma.topic.findFirst({
      where: {
        id: topicId,
        enabled: true,
      },
      select: {
        id: true,
        type: true,
        name: true,
        isAlwaysUnlocked: true,
      },
    }),
    prisma.userUnlockedTopic.findUnique({
      where: {
        userId_topicId: {
          userId: user.user.id,
          topicId,
        },
      },
      select: { topicId: true },
    }),
    prisma.exam.findMany({
      where: {
        topicId,
        enabled: true,
      },
      include: {
        userExamAggregation: {
          where: {
            userId: user.user.id,
          },
        },
        _count: {
          select: {
            exercises: true,
          },
        },
        userUnlockedExams: {
          where: {
            userId: user.user.id,
          },
          select: {
            examId: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    }),
  ])
  if (topic === null) notFound()

  const isUnlocked = isTopicUnlockedForUser({
    isAlwaysUnlocked: topic.isAlwaysUnlocked,
    topicId: topic.id,
    unlockedTopicIds: new Set(userUnlockedTopic === null ? [] : [userUnlockedTopic.topicId]),
  })

  if (!isUnlocked) redirect("/topics")

  const { id, ...propsTopic } = topic

  const examsWithAccess = exams.map((exam) => {
    const { userUnlockedExams, ...examWithoutUnlockRows } = exam
    return {
      ...examWithoutUnlockRows,
      isUnlocked: isExamUnlockedForUser({
        isAlwaysUnlocked: exam.isAlwaysUnlocked,
        examId: exam.id,
        unlockedExamIds: new Set(userUnlockedExams.map((unlockedExam) => unlockedExam.examId)),
      }),
    }
  })

  return <Exams topic={propsTopic} exams={examsWithAccess} />
}
