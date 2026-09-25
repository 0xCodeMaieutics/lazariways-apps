import prisma from "@workspace/database/client"

type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0]

export async function unlockTopicsAfterExamCompletion(
  tx: TransactionClient,
  {
    userId,
    topicId,
  }: {
    userId: string
    topicId: string
  }
) {
  const topic = await tx.topic.findUnique({
    where: { id: topicId },
    select: {
      minimumCompletedExamsToUnlock: true,
      unlocksTopics: { select: { id: true } },
    },
  })

  if (
    topic === null ||
    topic.minimumCompletedExamsToUnlock === null ||
    topic.unlocksTopics.length === 0
  ) {
    return
  }

  const examsInTopic = await tx.exam.findMany({
    where: { topicId, enabled: true },
    select: {
      minimumPassedCount: true,
      userExamAggregation: {
        where: { userId },
        select: { passedCount: true },
      },
    },
  })

  let completedExamsCount = 0
  for (const exam of examsInTopic) {
    const agg = exam.userExamAggregation[0]
    if (agg !== undefined && agg.passedCount >= exam.minimumPassedCount) {
      completedExamsCount += 1
    }
  }

  if (completedExamsCount >= topic.minimumCompletedExamsToUnlock) {
    await tx.userUnlockedTopic.createMany({
      data: topic.unlocksTopics.map((unlockedTopic) => ({
        userId,
        topicId: unlockedTopic.id,
      })),
      skipDuplicates: true,
    })
  }
}
