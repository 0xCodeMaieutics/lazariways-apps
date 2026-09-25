import prisma from '@workspace/database/client'

type TransactionClient = Parameters<
    Parameters<typeof prisma.$transaction>[0]
>[0]

export async function backfillUnlockedTopicsForUnlocker(
    tx: TransactionClient,
    unlockerTopicId: string
) {
    const topic = await tx.topic.findUnique({
        where: { id: unlockerTopicId },
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

    const enabledExams = await tx.exam.findMany({
        where: { topicId: unlockerTopicId, enabled: true },
        select: { id: true, minimumPassedCount: true },
    })

    if (enabledExams.length === 0) {
        return
    }

    const aggregations = await tx.userExamAggregation.findMany({
        where: {
            examId: { in: enabledExams.map((exam) => exam.id) },
        },
        select: { userId: true, examId: true, passedCount: true },
    })

    const minimumPassedCountByExamId = new Map(
        enabledExams.map((exam) => [exam.id, exam.minimumPassedCount])
    )
    const completedEnabledExamCountByUserId = new Map<string, number>()

    for (const aggregation of aggregations) {
        const minimumPassedCount = minimumPassedCountByExamId.get(
            aggregation.examId
        )
        if (
            minimumPassedCount !== undefined &&
            aggregation.passedCount >= minimumPassedCount
        ) {
            const previousCount =
                completedEnabledExamCountByUserId.get(aggregation.userId) ?? 0
            completedEnabledExamCountByUserId.set(
                aggregation.userId,
                previousCount + 1
            )
        }
    }

    const qualifyingUserIds: string[] = []
    for (const [userId, completedCount] of completedEnabledExamCountByUserId) {
        if (completedCount >= topic.minimumCompletedExamsToUnlock) {
            qualifyingUserIds.push(userId)
        }
    }

    if (qualifyingUserIds.length === 0) {
        return
    }

    await tx.userUnlockedTopic.createMany({
        data: qualifyingUserIds.flatMap((userId) =>
            topic.unlocksTopics.map((unlockedTopic) => ({
                userId,
                topicId: unlockedTopic.id,
            }))
        ),
        skipDuplicates: true,
    })
}
