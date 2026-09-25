import { TRPCError } from '@trpc/server'
import prisma from '@workspace/database/client'
import { backfillUnlockedExamsForUnlocker } from '@/lib/backfill-unlocked-exams'

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
        examId,
        topicId,
        isAlwaysUnlocked,
        unlockedByExamId,
    }: {
        examId: string
        topicId: string
        isAlwaysUnlocked: boolean
        unlockedByExamId: string | null
    }
) {
    if (isAlwaysUnlocked && unlockedByExamId !== null) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'An always unlocked exam cannot have an unlocker',
        })
    }

    if (unlockedByExamId === examId) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'An exam cannot unlock itself',
        })
    }

    if (unlockedByExamId !== null) {
        const unlocker = await tx.exam.findFirst({
            where: { id: unlockedByExamId, topicId, enabled: true },
            select: { id: true },
        })

        if (unlocker === null) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message:
                    'The unlocker must be an enabled exam in this topic',
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
    unlockerByExamId.set(examId, unlockedByExamId)

    detectUnlockCycle(unlockerByExamId)

    await tx.exam.update({
        where: { id: examId },
        data: {
            isAlwaysUnlocked,
            unlockedId: unlockedByExamId,
        },
    })

    if (unlockedByExamId !== null) {
        await backfillUnlockedExamsForUnlocker(tx, unlockedByExamId, [examId])
    }
}
