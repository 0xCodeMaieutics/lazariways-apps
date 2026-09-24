import { TRPCError } from '@trpc/server'
import prisma from '@workspace/database/client'

type TransactionClient = Parameters<
    Parameters<typeof prisma.$transaction>[0]
>[0]

function detectTopicUnlockCycle(
    unlockerByTopicId: Map<string, string | null>
) {
    for (const startId of unlockerByTopicId.keys()) {
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
            current = unlockerByTopicId.get(current) ?? null
        }
    }
}

export async function validateAndApplyTopicUnlock(
    tx: TransactionClient,
    {
        topicId,
        isAlwaysUnlocked,
        unlockedByTopicId,
        minimumCompletedExamsToUnlock,
    }: {
        topicId: string
        isAlwaysUnlocked: boolean
        unlockedByTopicId: string | null
        minimumCompletedExamsToUnlock: number | null
    }
) {
    if (isAlwaysUnlocked && unlockedByTopicId !== null) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
                'An always unlocked topic cannot have an unlocker',
        })
    }

    if (unlockedByTopicId === topicId) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'A topic cannot unlock itself',
        })
    }

    const childCount = await tx.topic.count({
        where: { unlockedId: topicId },
    })

    if (childCount > 0 && minimumCompletedExamsToUnlock === null) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
                'A topic that unlocks other topics must have a minimum completed exam count',
        })
    }

    if (unlockedByTopicId !== null) {
        const unlocker = await tx.topic.findUnique({
            where: { id: unlockedByTopicId },
            select: {
                id: true,
                minimumCompletedExamsToUnlock: true,
            },
        })

        if (unlocker === null) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Unlocker topic not found',
            })
        }

        if (unlocker.minimumCompletedExamsToUnlock === null) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message:
                    'The unlocker topic must have a minimum completed exam count',
            })
        }
    }

    const allTopics = await tx.topic.findMany({
        select: { id: true, unlockedId: true },
    })

    const unlockerByTopicId = new Map<string, string | null>(
        allTopics.map((topic) => [topic.id, topic.unlockedId])
    )
    unlockerByTopicId.set(topicId, unlockedByTopicId)

    detectTopicUnlockCycle(unlockerByTopicId)

    await tx.topic.update({
        where: { id: topicId },
        data: {
            isAlwaysUnlocked,
            unlockedId: unlockedByTopicId,
            minimumCompletedExamsToUnlock,
        },
    })
}
