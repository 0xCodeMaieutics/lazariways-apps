import { auth } from "@/lib/auth.server"
import { isExamUnlockedForUser } from "@/lib/exam-access"
import { isTopicUnlockedForUser } from "@/lib/topic-access"
import { prisma } from "@workspace/database/client"
import { notFound, redirect } from "next/navigation"
import { Exams } from "./page.client"
import { headers } from "next/headers"

export default async function TopicExamsPage({
  params,
}: {
  params: Promise<{ topicId: string }>
}) {
  const { topicId } = await params

  const user = await auth.api.getSession({
    headers: await headers(),
  })
  if (user === null) redirect("/login")

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.user.id,
    },
  })
  if (dbUser === null) redirect("/login")

  const topic = await prisma.topic.findFirst({
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
  })
  if (topic === null) notFound()

  const userUnlockedTopic = await prisma.userUnlockedTopic.findUnique({
    where: {
      userId_topicId: {
        userId: user.user.id,
        topicId: topic.id,
      },
    },
    select: { topicId: true },
  })

  const isUnlocked = isTopicUnlockedForUser({
    isAlwaysUnlocked: topic.isAlwaysUnlocked,
    topicId: topic.id,
    unlockedTopicIds: new Set(
      userUnlockedTopic === null ? [] : [userUnlockedTopic.topicId]
    ),
  })

  if (!isUnlocked) redirect("/topics")

  const exams = await prisma.exam.findMany({
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
          userId: dbUser.id,
        },
        select: {
          examId: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  })
  const { id, ...propsTopic } = topic

  const examsWithAccess = exams.map((exam) => {
    const { userUnlockedExams, ...examWithoutUnlockRows } = exam
    return {
      ...examWithoutUnlockRows,
      isUnlocked: isExamUnlockedForUser({
        isAlwaysUnlocked: exam.isAlwaysUnlocked,
        examId: exam.id,
        unlockedExamIds: new Set(
          userUnlockedExams.map((unlockedExam) => unlockedExam.examId)
        ),
      }),
    }
  })

  return <Exams topic={propsTopic} exams={examsWithAccess} />
}
