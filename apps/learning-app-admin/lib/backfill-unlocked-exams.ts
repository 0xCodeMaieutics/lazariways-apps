import prisma from "@workspace/database/client"

type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0]

export async function backfillUnlockedExamsForUnlocker(
  tx: TransactionClient,
  unlockerExamId: string,
  unlockedExamIds: string[]
) {
  const uniqueUnlockedExamIds = [...new Set(unlockedExamIds)]
  if (uniqueUnlockedExamIds.length === 0) {
    return
  }

  const unlocker = await tx.exam.findUnique({
    where: { id: unlockerExamId },
    select: { minimumPassedCount: true },
  })

  if (unlocker === null) {
    return
  }

  const unlockerCompletions = await tx.userExamAggregation.findMany({
    where: {
      examId: unlockerExamId,
      passedCount: { gte: unlocker.minimumPassedCount },
    },
    select: { userId: true },
  })

  const unlockedExams = await tx.exam.findMany({
    where: { id: { in: uniqueUnlockedExamIds } },
    select: { id: true, minimumPassedCount: true },
  })

  const alreadyCompletedUnlockedExams =
    unlockedExams.length === 0
      ? []
      : await tx.userExamAggregation.findMany({
          where: {
            OR: unlockedExams.map((exam) => ({
              examId: exam.id,
              passedCount: { gte: exam.minimumPassedCount },
            })),
          },
          select: { userId: true, examId: true },
        })

  const grants = [
    ...unlockerCompletions.flatMap((aggregation) =>
      uniqueUnlockedExamIds.map((examId) => ({
        userId: aggregation.userId,
        examId,
      }))
    ),
    ...alreadyCompletedUnlockedExams.map((aggregation) => ({
      userId: aggregation.userId,
      examId: aggregation.examId,
    })),
  ]

  if (grants.length === 0) {
    return
  }

  await tx.userUnlockedExam.createMany({
    data: grants,
    skipDuplicates: true,
  })
}
