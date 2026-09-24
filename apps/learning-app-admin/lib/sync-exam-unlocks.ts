import { TRPCError } from '@trpc/server'
import prisma from '@workspace/database/client'

type TransactionClient = Parameters<
    Parameters<typeof prisma.$transaction>[0]
>[0]

function detectUnlockCycle(unlockerByExamId: Map<string, string | null>) {
    for (const startId of unlockerByExamId.keys()) {
        const visited = new Set<string>()
        let current: string | null = startId

        while (current !== null) {
            if (visited.has(current)) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message:
                        'This unlock configuration would create a circular chain',
                })
            }
            visited.add(current)
            current = unlockerByExamId.get(current) ?? null
        }
    }
}

export async function syncExamUnlocks(
    tx: TransactionClient,
    {
        sourceExamId,
        topicId,
        unlocksExamIds,
    }: {
        sourceExamId: string
        topicId: string
        unlocksExamIds: string[]
    }
) {
    const uniqueTargetIds = [...new Set(unlocksExamIds)]

    if (uniqueTargetIds.includes(sourceExamId)) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'An exam cannot unlock itself',
        })
    }

    const enabledExamsInTopic = await tx.exam.findMany({
        where: { topicId, enable: true },
        select: { id: true, title: true, unlockedId: true },
    })
    const enabledExamById = new Map(
        enabledExamsInTopic.map((exam) => [exam.id, exam])
    )

    for (const targetId of uniqueTargetIds) {
        const target = enabledExamById.get(targetId)
        if (!target) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'All unlocked exams must be enabled exams in this topic',
            })
        }
        if (
            target.unlockedId !== null &&
            target.unlockedId !== sourceExamId
        ) {
            const existingUnlocker = enabledExamsInTopic.find(
                (exam) => exam.id === target.unlockedId
            )
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `"${target.title}" is already unlocked by "${existingUnlocker?.title ?? 'another exam'}"`,
            })
        }
    }

    const allExamsInTopic = await tx.exam.findMany({
        where: { topicId },
        select: { id: true, unlockedId: true },
    })

    const unlockerByExamId = new Map<string, string | null>(
        allExamsInTopic.map((exam) => [exam.id, exam.unlockedId])
    )

    for (const [examId, unlockerId] of unlockerByExamId) {
        if (unlockerId === sourceExamId && !uniqueTargetIds.includes(examId)) {
            unlockerByExamId.set(examId, null)
        }
    }

    for (const targetId of uniqueTargetIds) {
        unlockerByExamId.set(targetId, sourceExamId)
    }

    detectUnlockCycle(unlockerByExamId)

    await tx.exam.updateMany({
        where: {
            unlockedId: sourceExamId,
            id: { notIn: uniqueTargetIds },
        },
        data: { unlockedId: null },
    })

    if (uniqueTargetIds.length > 0) {
        await tx.exam.updateMany({
            where: { id: { in: uniqueTargetIds } },
            data: { unlockedId: sourceExamId },
        })
    }
}
