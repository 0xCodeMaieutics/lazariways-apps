import { auth } from '@/lib/auth.server'
import { prisma } from '@workspace/database/client'
import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { ExamResult } from './page.client'

export default async function ExamCompletionPage({
    params,
}: {
    params: Promise<{
        examId: string
        completionId: string
    }>
}) {
    const { examId, completionId } = await params

    const session = await auth.api.getSession({
        headers: await headers(),
    })
    if (session === null) return redirect('/login')

    const completion = await prisma.learningAppUserExam.findUnique({
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
    })

    if (
        !completion ||
        completion.userId !== session.user.id ||
        completion.examId !== examId
    ) {
        notFound()
    }

    const exerciseCount = await prisma.learningAppExercise.count({
        where: { examId },
    })

    const aggregation = await prisma.learningAppUserExamAggregation.findUnique({
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
    })

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
                minimumCorrectAnswerCount:
                    completion.exam.minimumCorrectAnswerCount,
                minimumPassedCount: completion.exam.minimumPassedCount,
                waitUntilPassAllowedInSeconds:
                    completion.exam.waitUntilPassAllowedInSeconds,
                exerciseCount,
            }}
            aggregation={aggregation}
        />
    )
}
