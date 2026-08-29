import { tryCatchAsync } from '@/lib/try-catch'
import { authedProcedure, router } from '../server'
import prisma from '@workspace/database/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const examRouter = router({
    getExam: authedProcedure
        .input(z.object({ examId: z.string().min(1) }))
        .query(async ({ input }) => {
            const [error, exam] = await tryCatchAsync(() =>
                prisma.learningAppExam.findUnique({
                    where: { id: input.examId },
                })
            )

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch exam',
                    cause: error,
                })
            }

            if (!exam) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Exam not found',
                })
            }

            return exam
        }),
    getExamCompletion: authedProcedure
        .input(z.object({ examId: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
            const [error, result] = await tryCatchAsync(() =>
                prisma.learningAppUserExamAggregation.findUnique({
                    where: {
                        userId_examId: {
                            userId: ctx.session.user.id,
                            examId: input.examId,
                        },
                    },
                    include: {
                        exam: {
                            select: {
                                minimumPassedCount: true,
                                minimumCorrectAnswerCount: true,
                            },
                        },
                    },
                })
            )

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch exam completion',
                    cause: error,
                })
            }

            if (!result) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Exam completion record not found',
                })
            }

            return result
        }),

    completeExam: authedProcedure
        .input(
            z.object({
                examId: z.string().min(1),
                correctCount: z.number().int().min(0),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const exam = await prisma.learningAppExam.findUnique({
                where: { id: input.examId },
                select: {
                    minimumCorrectAnswerCount: true,
                    minimumPassedCount: true,
                    waitUntilPassAllowedInSeconds: true,
                    unlocksExams: { select: { id: true } },
                    unlockedId: true,
                    id: true,
                },
            })
            if (!exam) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Exam not found',
                })
            }

            const hasPassed =
                input.correctCount >= exam.minimumCorrectAnswerCount

            const existing = await prisma.learningAppUserExamAggregation.findUnique({
                where: {
                    userId_examId: {
                        userId: ctx.session.user.id,
                        examId: input.examId,
                    },
                },
                select: { lastPassedAt: true },
            })

            const now = new Date()
            const lastPassedAt = existing?.lastPassedAt ?? null
            const waitElapsed =
                lastPassedAt === null ||
                now.getTime() - lastPassedAt.getTime() >=
                    exam.waitUntilPassAllowedInSeconds * 1000
            const passCounted = hasPassed && waitElapsed

            const [error, result] = await tryCatchAsync(() =>
                prisma.$transaction(async (tx) => {
                    const completion = await tx.learningAppUserExam.create({
                        data: {
                            userId: ctx.session.user.id,
                            examId: input.examId,
                            correctCount: input.correctCount,
                            hasPassed,
                            passCounted,
                        },
                    })

                    const aggregation = await tx.learningAppUserExamAggregation.upsert({
                        where: {
                            userId_examId: {
                                userId: ctx.session.user.id,
                                examId: input.examId,
                            },
                        },
                        create: {
                            userId: ctx.session.user.id,
                            examId: input.examId,
                            attemptedCount: 1,
                            passedCount: passCounted ? 1 : 0,
                            failedCount: passCounted ? 0 : 1,
                            ...(passCounted && { lastPassedAt: now }),
                        },
                        update: {
                            attemptedCount: { increment: 1 },
                            passedCount: { increment: passCounted ? 1 : 0 },
                            failedCount: { increment: passCounted ? 0 : 1 },
                            ...(passCounted && { lastPassedAt: now }),
                        },
                    })

                    if (
                        passCounted &&
                        aggregation.passedCount >= exam.minimumPassedCount &&
                        exam.unlocksExams.length > 0
                    ) {
                        await tx.learningAppUserUnlockedExam.createMany({
                            data: exam.unlocksExams.map((e) => ({
                                userId: ctx.session.user.id,
                                examId: e.id,
                            })),
                            skipDuplicates: true,
                        })
                    }

                    return { completionId: completion.id }
                })
            )

            if (error) {
                console.error(error)
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Internal server error',
                    cause: error,
                })
            }

            if (result === null)
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Internal server error',
                    cause: error,
                })

            return result
        }),
})
